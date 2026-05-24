/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { User, Question, ExamConfig, ExamResult } from './types';
import { DEFAULT_USERS, DEFAULT_QUESTIONS, DEFAULT_CONFIG } from './data';
import LoginScreen from './components/LoginScreen';
import AdminScreen from './components/AdminScreen';
import SetupScreen from './components/SetupScreen';
import ExamScreen from './components/ExamScreen';
import ResultScreen from './components/ResultScreen';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function App() {
  // --- Persistent databases (Synced with Firestore) ---
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [library, setLibrary] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [config, setConfig] = useState<ExamConfig>(DEFAULT_CONFIG);
  const [results, setResults] = useState<ExamResult[]>([]);

  // --- Active Test State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [autoAdvanceSetting, setAutoAdvanceSetting] = useState<boolean>(true);
  const [totalSecondsTaken, setTotalSecondsTaken] = useState<number>(0);

  // --- Screens Routing State ---
  const [screen, setScreen] = useState<'login' | 'admin' | 'setup' | 'exam' | 'result'>('login');

  // --- Real-time Firestore synchronisation ---
  useEffect(() => {
    // 2. Subscribe and sync users database
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as User);
      });
      if (list.length === 0) {
        // Bootstrap Default accounts if the DB is blank
        DEFAULT_USERS.forEach((u) => {
          setDoc(doc(db, 'users', u.u), u).catch(err => console.error(err));
        });
        setUsers(DEFAULT_USERS);
      } else {
        // Merge to guarantee default users are always login-ready locally
        const merged = [...list];
        DEFAULT_USERS.forEach((defU) => {
          if (!merged.some(u => u.u.toLowerCase() === defU.u.toLowerCase())) {
            merged.push(defU);
          }
        });
        setUsers(merged);
      }
    }, (err) => {
      console.error("Firestore synchronisation for users errored:", err);
      setUsers(DEFAULT_USERS);
    });

    // 3. Subscribe and sync Exam Config
    const unsubscribeConfig = onSnapshot(doc(db, 'configs', 'active'), (d) => {
      if (d.exists()) {
        setConfig(d.data() as ExamConfig);
      } else {
        // Bootstrap Default configs
        setDoc(doc(db, 'configs', 'active'), DEFAULT_CONFIG).catch(err => console.error(err));
        setConfig(DEFAULT_CONFIG);
      }
    }, (err) => {
      console.error("Firestore synchronisation for config errored:", err);
      setConfig(DEFAULT_CONFIG);
    });

    // 4. Subscribe and sync questions database
    const unsubscribeLibrary = onSnapshot(collection(db, 'questions'), (snapshot) => {
      const list: Question[] = [];
      snapshot.forEach((docRef) => {
        list.push(docRef.data() as Question);
      });
      // Sort to conserve the correct layout ordering
      list.sort((a, b) => {
        const idxA = (a as any).idx !== undefined ? (a as any).idx : 0;
        const idxB = (b as any).idx !== undefined ? (b as any).idx : 0;
        return idxA - idxB;
      });

      if (list.length === 0) {
        // Bootstrap pre-defined templates
        DEFAULT_QUESTIONS.forEach((q, i) => {
          setDoc(doc(db, 'questions', `q_${i}`), { ...q, idx: i }).catch(err => console.error(err));
        });
        setLibrary(DEFAULT_QUESTIONS);
      } else {
        // Merge with defaults to guarantee we have stable data inside
        const merged = [...list];
        if (merged.length === 0) {
          setLibrary(DEFAULT_QUESTIONS);
        } else {
          setLibrary(merged);
        }
      }
    }, (err) => {
      console.error("Firestore library synchronization failed:", err);
      setLibrary(DEFAULT_QUESTIONS);
    });

    // 5. Subscribe results database tracking
    const unsubscribeResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const list: ExamResult[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ExamResult);
      });
      // Sort by newest submissions first
      list.sort((a, b) => {
        const tA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const tB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return tB - tA;
      });
      setResults(list);
    }, (err) => {
      console.error("Firestore assessment results sync failed:", err);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeConfig();
      unsubscribeLibrary();
      unsubscribeResults();
    };
  }, []);

  // --- Session recovery state mechanism ---
  useEffect(() => {
    const activeSessionStr = localStorage.getItem('exam_active_session');
    if (activeSessionStr) {
      try {
        const session = JSON.parse(activeSessionStr);
        if (session && session.user && session.questions && session.questions.length > 0) {
          setCurrentUser(session.user);
          setTestQuestions(session.questions);
          setTestAnswers(session.answers || {});
          setCurrentIndex(session.idx || 0);
          setSecondsLeft(session.secondsLeft || 0);
          setAutoAdvanceSetting(session.autoAdvance !== undefined ? session.autoAdvance : true);
          setTotalSecondsTaken(session.totalSecondsTaken || 0);
          setScreen('exam');
        }
      } catch (err) {
        console.error('Lỗi hồi phục phiên thi:', err);
        localStorage.removeItem('exam_active_session');
      }
    }
  }, []);

  // Sync active exam states to localStorage for crash resilience
  useEffect(() => {
    if (screen === 'exam' && currentUser) {
      const sessionObj = {
        user: currentUser,
        questions: testQuestions,
        answers: testAnswers,
        idx: currentIndex,
        secondsLeft,
        autoAdvance: autoAdvanceSetting,
        totalSecondsTaken
      };
      localStorage.setItem('exam_active_session', JSON.stringify(sessionObj));
    }
  }, [screen, currentUser, testQuestions, testAnswers, currentIndex, secondsLeft, autoAdvanceSetting, totalSecondsTaken]);

  // --- Actions & Methods handlers ---

  // Handle successful login and dynamically register user active UID
  const handleLoginSuccess = async (matchedUser: User) => {
    setCurrentUser(matchedUser);
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', matchedUser.u);
        await setDoc(userRef, {
          u: matchedUser.u,
          p: matchedUser.p,
          role: matchedUser.role,
          uid: auth.currentUser.uid
        }, { merge: true });
        console.log("Registered account session credentials in Firestore database:", matchedUser.u);
      } catch (err) {
        console.error("Error setting session UID:", err);
      }
    }
    if (matchedUser.role === 'admin') {
      setScreen('admin');
    } else {
      setScreen('setup');
    }
  };

  // Reset entire state completely online on the cloud
  const handleResetSystem = async () => {
    if (!confirm('Bạn có chắc chắn muốn RESET toàn bộ cơ sở dữ liệu và kết quả thi trực tuyến về trạng thái mặc định không?')) return;
    try {
      localStorage.clear();
      
      // Clean trial scores
      const resWipes = results.map(r => deleteDoc(doc(db, 'results', r.id || '')));
      await Promise.all(resWipes);

      // Reset configurations
      await setDoc(doc(db, 'configs', 'active'), DEFAULT_CONFIG);

      // Wipe library pool
      const libWipes = library.map((_, i) => deleteDoc(doc(db, 'questions', `q_${i}`)));
      await Promise.all(libWipes);

      // Clean candidates
      const userWipes = users.map(u => deleteDoc(doc(db, 'users', u.u)));
      await Promise.all(userWipes);

      setCurrentUser(null);
      setTestQuestions([]);
      setTestAnswers({});
      setCurrentIndex(0);
      setSecondsLeft(0);
      setScreen('login');
      alert('Hệ thống cơ sở dữ liệu và thống kê online đã được khôi phục về mặc định!');
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // User management triggers (Admin)
  const handleAddUser = async (u: string, p: string) => {
    try {
      await setDoc(doc(db, 'users', u), { u, p, role: 'user' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${u}`);
    }
  };

  const handleDeleteUser = async (usernameToDelete: string) => {
    if (usernameToDelete === 'admin') return;
    try {
      await deleteDoc(doc(db, 'users', usernameToDelete));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${usernameToDelete}`);
    }
  };

  // Exam configs save (Admin)
  const handleSaveConfig = async (newCfg: ExamConfig) => {
    try {
      await setDoc(doc(db, 'configs', 'active'), newCfg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'configs/active');
    }
  };

  // Library import / clear actions (Admin)
  const handleImportLibrary = async (newQuestions: Question[]) => {
    try {
      // Clean up previous list
      const deletionPromises = library.map((_, i) => deleteDoc(doc(db, 'questions', `q_${i}`)));
      await Promise.all(deletionPromises);
      
      // Batch write new entries
      const uploadPromises = newQuestions.map((q, i) => {
        return setDoc(doc(db, 'questions', `q_${i}`), {
          t: q.t,
          q: q.q,
          o: q.o,
          a: q.a,
          e: q.e || "",
          c: q.c || "",
          idx: i
        });
      });
      await Promise.all(uploadPromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'questions');
    }
  };

  const handleClearLibrary = async () => {
    try {
      const deletionPromises = library.map((_, i) => deleteDoc(doc(db, 'questions', `q_${i}`)));
      await Promise.all(deletionPromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'questions');
    }
  };

  const handleDeleteQuestion = async (questionIdx: number) => {
    try {
      await deleteDoc(doc(db, 'questions', `q_${questionIdx}`));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `questions/q_${questionIdx}`);
    }
  };

  // Student starting the exam
  const handleStartExam = (autoAdvanceChoice: boolean) => {
    if (library.length < config.qty) {
      alert('Kho câu hỏi hiện tại ít hơn số lượng câu cấu hình thi. Không thể khởi tạo bài thi!');
      return;
    }

    // Randomize selection of questions based on library
    const randomized = [...library]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.qty);

    setTestQuestions(randomized);
    setTestAnswers({});
    setCurrentIndex(0);
    setSecondsLeft(config.time * 60);
    setAutoAdvanceSetting(autoAdvanceChoice);
    setTotalSecondsTaken(0);
    setScreen('exam');
  };

  // Timer Tick implementation
  const handleTickTimer = () => {
    setSecondsLeft(prev => {
      setTotalSecondsTaken(t => t + 1);

      if (prev <= 1) {
        handleSubmitExam(true);
        return 0;
      }
      return prev - 1;
    });
  };

  // Student selects an option
  const handleSelectOption = (questionIndex: number, optionIdx: number) => {
    setTestAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIdx
    }));
  };

  // Submitting test & showing results
  const handleSubmitExam = async (isAutoTriggered = false) => {
    if (isAutoTriggered) {
      alert('Thời gian thi đã kết thúc! Hệ thống tự động thu bài của bạn.');
    }

    // Evaluation count
    let correctCount = 0;
    testQuestions.forEach((q, i) => {
      if (testAnswers[i] === q.a) {
        correctCount++;
      }
    });

    const totalQuestions = testQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    if (currentUser) {
      try {
        const resultId = `${currentUser.u}_${Date.now()}`;
        await setDoc(doc(db, 'results', resultId), {
          user: currentUser.u,
          score: percentage,
          correctCount: correctCount,
          totalQuestions: totalQuestions,
          secondsTaken: totalSecondsTaken,
          createdAt: serverTimestamp(),
          answers: testAnswers
        });
        console.log("Exam score recorded to database:", percentage);
      } catch (err) {
        console.error("Error saving exam results:", err);
      }
    }

    // Remove session backup
    localStorage.removeItem('exam_active_session');
    setScreen('result');
  };

  // Return back to setup for another test
  const handleRestart = () => {
    setScreen('setup');
    setTestQuestions([]);
    setTestAnswers({});
    setCurrentIndex(0);
    setSecondsLeft(0);
    setTotalSecondsTaken(0);
  };

  // Logs out of account
  const handleLogout = () => {
    localStorage.removeItem('exam_active_session');
    setCurrentUser(null);
    setScreen('login');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-sky-500/35 selection:text-white">
      {screen === 'login' && (
        <LoginScreen 
          users={users} 
          onLoginSuccess={handleLoginSuccess} 
          onResetSystem={handleResetSystem} 
        />
      )}

      {screen === 'admin' && (
        <AdminScreen 
          users={users}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          config={config}
          onSaveConfig={handleSaveConfig}
          library={library}
          onImportLibrary={handleImportLibrary}
          onClearLibrary={handleClearLibrary}
          onDeleteQuestion={handleDeleteQuestion}
          onLogout={handleLogout}
          results={results}
        />
      )}

      {screen === 'setup' && currentUser && (
        <SetupScreen 
          user={currentUser}
          config={config}
          libraryCount={library.length}
          onStartExam={handleStartExam}
          onLogout={handleLogout}
        />
      )}

      {screen === 'exam' && currentUser && (
        <ExamScreen 
          user={currentUser}
          questions={testQuestions}
          answers={testAnswers}
          currentIndex={currentIndex}
          secondsLeft={secondsLeft}
          autoAdvanceSetting={autoAdvanceSetting}
          onSelectOption={handleSelectOption}
          onNavigate={setCurrentIndex}
          onConfirmSubmit={() => handleSubmitExam(false)}
          onTickTimer={handleTickTimer}
        />
      )}

      {screen === 'result' && currentUser && (
        <ResultScreen 
          user={currentUser}
          questions={testQuestions}
          answers={testAnswers}
          totalSecondsTaken={totalSecondsTaken}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
