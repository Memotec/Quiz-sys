/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Question } from '../types';
import { 
  Trophy, Award, Clock, ArrowLeft, Check, X, 
  BookOpen, Terminal, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResultScreenProps {
  user: User;
  questions: Question[];
  answers: Record<number, number>;
  totalSecondsTaken: number;
  onRestart: () => void;
}

export default function ResultScreen({
  user,
  questions,
  answers,
  totalSecondsTaken,
  onRestart
}: ResultScreenProps) {
  
  let correctCount = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.a) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Format seconds taken to timer display MM:SS
  const formatSeconds = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Dynamic feedback messages based on criteria
  const getFeedbackMessage = (pct: number) => {
    if (pct === 100) return { title: "XUẤT SẮC - ĐIỂM TUYỆT ĐỐI!", desc: "Bạn đã trả lời đúng tất cả các câu hỏi một cách xuất sắc nhất!", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" };
    if (pct >= 80) return { title: "RẤT TỐT - ĐẠT YÊU CẦU CAO!", desc: "Khả năng chuyên môn và nền tảng kiến thức của bạn cực kỳ vững vàng.", color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" };
    if (pct >= 50) return { title: "ĐẠT - HOÀN THÀNH BÀI THI", desc: "Bạn đáp ứng các tiêu chuẩn cơ bản cho bài thi này. Hãy tiếp tục ôn luyện!", color: "text-sky-400", bg: "bg-sky-500/5", border: "border-sky-500/20" };
    return { title: "CẦN ÔN TẬP THÊM KIẾN THỨC", desc: "Hãy tập trung đọc kỹ phần giải thích chi tiết phía dưới để bù đắp các phần hổng.", color: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/20" };
  };

  const feedback = getFeedbackMessage(percentage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 md:p-6 pb-24 overflow-y-auto scrollbar-thin font-sans">
      <div className="max-w-4xl w-full space-y-8 mt-4">
        
        {/* Banner main evaluation result */}
        <motion.div 
          id="result-screen"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden"
        >
          {/* Decorative effect */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-rose-500"></div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-450 mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-2 tracking-tight">KẾT QUẢ BÀI THI</h1>
          <p className="text-slate-500 uppercase tracking-widest text-[11px] font-black">{user.u.toUpperCase()} • ĐÃ HOÀN THÀNH</p>

          {/* Core Analytics Cards Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 my-8">
            <div className="bg-slate-950/80 p-4 md:p-6 rounded-2xl border border-slate-850 hover:border-slate-800 transition">
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1.5">Số Câu Đúng</p>
              <p id="res-correct" className="text-xl md:text-4xl font-extrabold text-emerald-400">
                {correctCount} <span className="text-xs md:text-sm text-slate-500 font-medium">/ {totalQuestions}</span>
              </p>
            </div>
            
            <div className="bg-slate-950/80 p-4 md:p-6 rounded-2xl border border-slate-850 hover:border-slate-800 transition">
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1.5">Tỷ Lệ Đạt</p>
              <p id="res-percent" className="text-xl md:text-4xl font-extrabold text-sky-400">
                {percentage}%
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 md:p-6 rounded-2xl border border-slate-850 hover:border-slate-800 transition">
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1.5">Thời Gian Làm</p>
              <p id="res-time" className="text-xl md:text-4xl font-extrabold text-amber-400 font-mono">
                {formatSeconds(totalSecondsTaken)}
              </p>
            </div>
          </div>

          {/* Feedback assessment banner */}
          <div className={`p-5 rounded-2xl border text-left flex gap-4 items-start mb-8 ${feedback.bg} ${feedback.border}`}>
            <Award className={`w-6 h-6 shrink-0 ${feedback.color}`} />
            <div>
              <p className={`font-black text-xs md:text-sm uppercase tracking-wide ${feedback.color}`}>{feedback.title}</p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{feedback.desc}</p>
            </div>
          </div>

          <button 
            onClick={onRestart}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-slate-950 px-10 py-4 rounded-xl font-black transition-all shadow-lg shadow-sky-950/30 cursor-pointer text-sm uppercase bg-gradient-to-r from-sky-500 to-sky-600"
          >
            <RefreshCw className="w-4 h-4" />
            <span>VỀ TRAN-G CHỦ</span>
          </button>
        </motion.div>

        {/* Question Review Section title */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold text-base text-slate-200 uppercase tracking-wide">CHI TIẾT LỜI GIẢI TỪNG CÂU</h2>
        </div>

        {/* Review list boxes */}
        <div id="review-list" className="space-y-4">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const isCorrect = userAns === q.a;
            const alphabet = ['A', 'B', 'C', 'D'];

            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 transition-all relative ${
                  isCorrect 
                    ? 'border-l-8 border-l-emerald-500 shadow-emerald-950/5' 
                    : 'border-l-8 border-l-rose-500 shadow-rose-950/5'
                }`}
              >
                {/* Question index tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-3 py-1 bg-slate-950 text-slate-400 border border-slate-850 rounded-lg uppercase tracking-wide font-black">
                    CÂU {String(i + 1).padStart(2, '0')} • {q.t}
                  </span>

                  {isCorrect ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
                      <Check className="w-3.5 h-3.5" />
                      <span>Chính xác</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/15">
                      <X className="w-3.5 h-3.5" />
                      <span>Chưa đúng</span>
                    </span>
                  )}
                </div>

                <p className="font-bold text-base md:text-lg mb-4 text-slate-100 leading-relaxed whitespace-pre-line">
                  {q.q}
                </p>

                {/* Candidate Selection options feedback container */}
                <div className="space-y-2 text-xs md:text-sm">
                  
                  {/* Option chosen display */}
                  <div className={`p-3 md:p-4 rounded-xl border flex items-center justify-between ${
                    isCorrect 
                      ? 'bg-emerald-500/5 text-slate-200 border-emerald-500/10' 
                      : userAns !== undefined 
                        ? 'bg-rose-500/5 text-slate-200 border-rose-500/10' 
                        : 'bg-slate-950 text-slate-400 border-slate-850'
                  }`}>
                    <div>
                      <span className="text-slate-500 font-semibold mr-1">Bạn đã chọn: </span>
                      {userAns !== undefined ? (
                        <span className={`font-bold ${isCorrect ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}`}>
                          {alphabet[userAns]}. {q.o[userAns]}
                        </span>
                      ) : (
                        <span className="text-rose-400/80 font-black italic">Bỏ trống không trả lời</span>
                      )}
                    </div>
                  </div>

                  {/* Correct option display (only if incorrect or blank) */}
                  {!isCorrect && (
                    <div className="p-3 md:p-4 bg-emerald-500/5 text-emerald-400 rounded-xl border border-emerald-500/10 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 font-semibold mr-1">Đáp án đúng là: </span>
                        <b className="font-bold text-emerald-400">{alphabet[q.a]}. {q.o[q.a]}</b>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom system cli command display */}
                {q.c && (
                  <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-2 text-[11px] font-mono text-cyan-450/90 overflow-x-auto">
                    <Terminal className="w-4 h-4 shrink-0 text-cyan-450" />
                    <span className="font-bold text-slate-500 select-none">Command:</span>
                    <code>{q.c}</code>
                  </div>
                )}

                {/* Detailed description explain text */}
                {q.e && (
                  <div className="mt-4 p-4 bg-slate-950/60 rounded-xl text-xs text-slate-400 leading-relaxed border border-slate-850 italic">
                    <span className="font-bold text-slate-300 not-italic block mb-1 uppercase tracking-wider text-[10px]">Hướng dẫn giải thích:</span>
                    {q.e}
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
