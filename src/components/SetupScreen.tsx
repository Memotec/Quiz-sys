/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, ExamConfig } from '../types';
import { 
  Award, BookOpen, Clock, Zap, ArrowRight, ShieldAlert, CheckCircle2, LogOut, CheckSquare
} from 'lucide-react';
import { motion } from 'motion/react';

interface SetupScreenProps {
  user: User;
  config: ExamConfig;
  libraryCount: number;
  onStartExam: (autoAdvance: boolean) => void;
  onLogout: () => void;
}

export default function SetupScreen({ user, config, libraryCount, onStartExam, onLogout }: SetupScreenProps) {
  const [autoAdvance, setAutoAdvance] = useState(true);

  const canStart = libraryCount >= config.qty;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Visual background gradient circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        id="setup-screen"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-xl w-full p-8 md:p-10 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative z-10"
      >
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-450 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Sẵn Sàng Làm Bài</span>
        </div>

        <h1 id="welcome-user" className="text-3xl font-black text-slate-100 mb-2 tracking-tight">
          XIN CHÀO, <span className="text-sky-400 font-black">{user.u.toUpperCase()}!</span>
        </h1>
        <p id="exam-summary" className="text-slate-400 mb-8 italic text-sm">
          Bài kiểm tra trắc nghiệm nội bộ được đồng bộ hóa và lưu trạng thái tự động.
        </p>

        {/* Configurations Parameters */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 hover:border-slate-800 transition">
            <BookOpen className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <p className="text-slate-500 text-[10.5px] uppercase font-bold tracking-wider">Tổng số câu hỏi</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{config.qty}</p>
          </div>
          
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 hover:border-slate-800 transition">
            <Clock className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <p className="text-slate-500 text-[10.5px] uppercase font-bold tracking-wider">Thời gian làm bài</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{config.time} <span className="text-sm font-bold text-slate-400">phút</span></p>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 mb-8 text-left space-y-3.5">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TÙY CHỌN TIỆN ÍCH</p>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="pr-2">
              <p className="text-xs font-bold text-slate-200 group-hover:text-sky-400 duration-150">Tự động chuyển câu hỏi</p>
              <p className="text-[10px] text-slate-500">Chuyển sang câu hỏi tiếp theo ngay sau khi bạn chọn một đáp án (tiết kiệm thời gian nhấp chuột).</p>
            </div>
            <input 
              type="checkbox" 
              checked={autoAdvance} 
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 shrink-0 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-350 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-sky-450 peer-checked:bg-sky-600"></div>
          </label>
        </div>

        {/* Warning card structure */}
        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-left text-xs text-amber-500/90 space-y-2 mb-8">
          <p className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-500">
            <ShieldAlert className="w-4 h-4" />
            <span>Nội Quy Cuộc Thi:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] pl-1 opacity-80 leading-relaxed">
            <li>Tuyệt đối không chuyển đổi Tabs hoặc tải lại trang web trong thời gian thi.</li>
            <li>Hệ thống lưu trữ từng phương án ngay lập tức khi bạn bấm chọn.</li>
            <li>Bài thi sẽ tự động nộp khi hết thời gian đếm ngược.</li>
          </ul>
        </div>

        {/* Action controls */}
        {!canStart ? (
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl border border-rose-500/20 text-xs text-center mb-6">
            Thư viện hiện tại ({libraryCount} câu) không đủ số lượng câu hỏi cấu hình ({config.qty} câu). Vui lòng thông báo cho quản trị viên nạp thêm câu hỏi!
          </div>
        ) : (
          <button 
            onClick={() => onStartExam(autoAdvance)}
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-slate-950 py-4 px-6 rounded-2xl font-bold text-base hover:shadow-lg hover:shadow-sky-500/10 focus:outline-none transition transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-950/40"
          >
            <span>BẮT ĐẦU LÀM BÀI</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        <button 
          onClick={onLogout} 
          className="mt-6 text-slate-500 hover:text-rose-400 text-xs font-semibold uppercase tracking-wider duration-150 flex items-center gap-1.5 mx-auto hover:underline"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Thoát tài khoản</span>
        </button>

      </motion.div>
    </div>
  );
}
