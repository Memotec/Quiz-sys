/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Question } from '../types';
import { 
  ChevronLeft, ChevronRight, AlertTriangle, CheckSquare, 
  HelpCircle, User as UserIcon, Clock, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExamScreenProps {
  user: User;
  questions: Question[];
  answers: Record<number, number>;
  currentIndex: number;
  secondsLeft: number;
  autoAdvanceSetting: boolean;
  onSelectOption: (idx: number, optionIdx: number) => void;
  onNavigate: (idx: number) => void;
  onConfirmSubmit: () => void;
  onTickTimer: () => void;
}

export default function ExamScreen({
  user,
  questions,
  answers,
  currentIndex,
  secondsLeft,
  autoAdvanceSetting,
  onSelectOption,
  onNavigate,
  onConfirmSubmit,
  onTickTimer
}: ExamScreenProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(autoAdvanceSetting);

  // Active timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      onTickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Formatting seconds into MM:SS
  const formatTime = (secs: number) => {
    if (secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const selectedOption = answers[currentIndex];

  const handleOptionClick = (optIdx: number) => {
    onSelectOption(currentIndex, optIdx);

    // Auto-advance logic
    if (autoAdvance) {
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          onNavigate(currentIndex + 1);
        }
      }, 300); // 300ms delay to feel reactive yet show selected color highlight
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const isTimeCritical = secondsLeft < 60;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* HEADER SECTION (height ~ 80px / 20rem in model) */}
      <header className="h-20 shrink-0 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between">
        
        {/* Timer countdown and User details */}
        <div className="flex items-center gap-4">
          <div 
            id="exam-timer" 
            className={`text-2xl font-mono font-black px-4 py-1.5 rounded-xl border transition-all duration-350 duration-200 shadow-inner flex items-center gap-2 ${
              isTimeCritical 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-450 animate-pulse' 
                : 'bg-sky-500/10 border-sky-500/20 text-sky-450'
            }`}
          >
            <Clock className={`w-5 h-5 ${isTimeCritical ? 'text-rose-450' : 'text-sky-400'}`} />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          <div className="hidden md:block h-8 w-[1px] bg-slate-800"></div>

          <div className="hidden md:flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
              <UserIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xs">
              <p className="text-slate-500 uppercase font-black text-[9px] tracking-wider">Thí sinh</p>
              <p id="user-display" className="font-bold text-slate-300">{user.u}</p>
            </div>
          </div>
        </div>

        {/* Center label indicator */}
        <div className="text-center flex-1 mx-4 hidden md:block">
          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest bg-sky-500/5 px-3 py-1.5 rounded-full border border-sky-500/10">
            HÃY TẬP TRUNG LÀM BÀI THI
          </span>
        </div>

        {/* Action button submit */}
        <div>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-red-650 hover:bg-red-550 active:scale-95 text-slate-100 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-950/20 cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500"
          >
            NỘP BÀI
          </button>
        </div>
      </header>

      {/* TIẾN ĐỘ LÀM BÀI (PROGRESS BAR) */}
      <div className="w-full h-1.5 bg-slate-900 shrink-0 relative flex items-center">
        <motion.div 
          className="h-full bg-gradient-to-r from-sky-500 via-sky-400 to-teal-450 relative"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-teal-300 blur-[2px] opacity-80"></div>
        </motion.div>
        
        {/* Floating progress detail badge */}
        <div className="absolute right-6 top-3 text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 z-10 select-none bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 shadow-md">
          <span className="uppercase tracking-wider text-[8.5px] text-slate-500 font-bold">Tiến độ:</span>
          <span className="text-sky-400 font-black">{answeredCount}/{totalQuestions} câu</span>
          <span className="text-teal-400">({completionPercentage}%)</span>
        </div>
      </div>

      {/* CORE LAYOUT BODY SECTION (fixed height calc, no scroll) */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col lg:flex-row gap-6 bg-slate-950/40">
        
        {/* Left main: Question & Options panel (takes flex-3 or 75% width) */}
        <div className="flex-1 lg:flex-[3] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 overflow-hidden shadow-2xl">
          
          {/* Top question line */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-850">
            <span id="q-topic" className="text-[10px] font-black px-3 py-1 bg-slate-800 text-slate-400 rounded-lg border border-slate-700 uppercase tracking-wider">
              Chủ đề: {currentQuestion?.t || 'Mặc định'}
            </span>
            <span id="q-number" className="text-sky-400 font-black tracking-wider uppercase text-xs">
              Mã Câu hỏi: {String(currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
            </span>
          </div>

          {/* Question Text & Code Snippet if applicable (Scroll within boundaries only) */}
          <div className="question-area flex-1 pr-1 overflow-y-auto mb-6 scrollbar-thin">
            <h3 id="q-text" className="text-lg md:text-xl font-bold text-slate-100 leading-relaxed mb-6 whitespace-pre-line">
              {currentQuestion?.q}
            </h3>

            {currentQuestion?.c && (
              <div className="mb-6 p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs text-cyan-450/90 overflow-x-auto flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase font-bold mb-1 select-none">Cấu hình mẫu / Môi trường CLI</span>
                <code>$ {currentQuestion.c}</code>
              </div>
            )}

            {/* Options list rendered with requested specifications */}
            <div id="options-grid" className="grid grid-cols-1 gap-3.5 mt-2">
              {currentQuestion?.o.map((optionText, optIdx) => {
                const label = String.fromCharCode(65 + optIdx); // A, B, C, D
                const isSelected = selectedOption === optIdx;
                return (
                  <div 
                    key={optIdx}
                    id={`option-${optIdx}`}
                    onClick={() => handleOptionClick(optIdx)}
                    className={`option-card p-4 md:p-5 rounded-xl flex items-center gap-4 transition-all select-none border-2 duration-150 cursor-pointer ${
                      isSelected 
                        ? 'border-sky-500 bg-sky-500/10 text-sky-200' 
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center font-bold text-sm ${
                      isSelected 
                        ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-inner' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      {label}
                    </div>
                    <div className="text-left font-medium text-sm md:text-base pr-2">{optionText}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer of card: Navigation Buttons & Quick settings */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-850 shrink-0">
            
            {/* Slide auto-next toggle inside the exam */}
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setAutoAdvance(!autoAdvance)}>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tự động chuyển câu:</span>
              <button className="text-sky-400 shrink-0 focus:outline-none">
                {autoAdvance ? (
                  <ToggleRight className="w-8 h-8 text-sky-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>

            {/* Prioritize simple, humble navigation */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs uppercase bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-750"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <button 
                onClick={handleNext}
                disabled={currentIndex === totalQuestions - 1}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-xs uppercase bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-750"
              >
                <span>Kế Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right sidebar: Questions map & dashboard (takes flex-1 or 25% width) */}
        <div className="flex-1 lg:flex-col bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col justify-between overflow-hidden shadow-2xl min-h-[140px] lg:min-h-auto size-full">
          
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850 shrink-0">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>MỤC LỤC BÀI THI</span>
              </h4>
            </div>

            {/* Question map buttons (Scroll container) */}
            <div id="exam-nav" className="nav-grid flex-1 overflow-y-auto pr-1 mb-4 scrollbar-thin">
              {questions.map((_, i) => {
                const isCurrent = i === currentIndex;
                const isAnswered = answers[i] !== undefined;
                
                let itemClass = "border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-850";
                if (isCurrent) {
                  itemClass = "border-sky-500 bg-sky-500 text-slate-950 font-black";
                } else if (isAnswered) {
                  itemClass = "bg-slate-800 border-slate-700 text-slate-350 font-bold";
                }

                return (
                  <div
                    key={i}
                    id={`nav-${i}`}
                    onClick={() => onNavigate(i)}
                    className={`nav-item aspect-square font-mono text-sm transition-all duration-150 rounded-xl flex items-center justify-center cursor-pointer border-2 ${itemClass}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines map color keys status block */}
          <div className="pt-4 border-t border-slate-850 shrink-0 text-[10px] text-slate-500 space-y-2 uppercase font-bold tracking-wider">
            <p className="text-slate-400 text-[9px] mb-2 font-black">Nhãn trạng thái:</p>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-sky-500 rounded-md"></div> 
              <span className="text-slate-300">Đang chọn câu hỏi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-slate-800 rounded-md border border-slate-700"></div> 
              <span className="text-slate-400">Đã lưu phương án</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-transparent rounded-md border-2 border-slate-800"></div> 
              <span className="text-slate-500">Chưa làm câu hỏi</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 text-[11px] font-medium tracking-normal text-slate-400 leading-normal mt-3">
              <p className="font-bold text-slate-300 mb-1">Thống kê:</p>
              <p>Đã trả lời: <b className="text-sky-400">{answeredCount}/{totalQuestions}</b></p>
              <p>Còn trống: <b className="text-rose-450">{unansweredCount}</b> câu</p>
            </div>
          </div>

        </div>

      </main>

      {/* CONFIRMATION SUBMIT DIALOGUE OPTION (IN-SCREEN MODAL) */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-150 mb-2">XÁC NHẬN NỘP BÀI THI</h3>
              
              {unansweredCount > 0 ? (
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-xs text-amber-500 leading-relaxed text-left mb-6 space-y-1">
                  <p className="font-bold text-amber-400">CHÚ Ý QUAN TRỌNG:</p>
                  <p>Bạn còn <span className="font-mono font-black text-rose-400 underline text-sm">{unansweredCount}</span> câu chưa làm trong tổng số {totalQuestions} câu.</p>
                  <p>Sau khi kết thúc nộp bài thi, hệ thống sẽ tự động khóa và chấm điểm ngay lập tức. Bạn không thể quay trở lại sửa đổi lựa chọn.</p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Bạn đã hoàn thành toàn bộ <span className="text-sky-400 font-bold">{totalQuestions}/{totalQuestions}</span> câu hỏi thi trắc nghiệm! Hãy nộp bài để xem điểm số chi tiết.
                </p>
              )}

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition border border-slate-750"
                >
                  Tiếp tục làm
                </button>
                <button 
                  onClick={() => {
                    setShowSubmitModal(false);
                    onConfirmSubmit();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-slate-100 py-3 rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition shadow-lg shadow-red-950/20 bg-gradient-to-r from-red-650 to-rose-650"
                >
                  Xác nhận Nộp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
