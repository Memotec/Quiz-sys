/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, Key, UserCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onResetSystem: () => void;
}

export default function LoginScreen({ users, onLoginSuccess, onResetSystem }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uTrim = username.trim();
    const pTrim = password.trim();

    if (!uTrim || !pTrim) {
      setErrorMessage('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    const matchedUser = users.find(x => x.u.toLowerCase() === uTrim.toLowerCase() && x.p === pTrim);
    if (!matchedUser) {
      setErrorMessage('Sai tên đăng nhập hoặc mật khẩu! Vui lòng thử lại.');
      return;
    }

    setErrorMessage('');
    onLoginSuccess(matchedUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 py-8">
      <motion.div 
        id="login-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-teal-500 rounded-full blur-sm"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4 shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-sky-400 tracking-tight uppercase">Hệ thống Thi cử</h1>
          <p className="text-slate-400 text-sm mt-1.5 uppercase tracking-wider font-semibold text-[11px]">Exam Mode Optimized Interface</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">Tên đăng nhập</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <UserCheck className="w-5 h-5" />
              </span>
              <input
                id="u-login"
                type="text"
                placeholder="Ví dụ: user, thi_sinh_1, admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-slate-200 pl-11 pr-4 py-3.5 rounded-xl transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Key className="w-5 h-5" />
              </span>
              <input
                id="p-login"
                type="password"
                placeholder="Nhập mật khẩu tài khoản"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-slate-200 pl-11 pr-4 py-3.5 rounded-xl transition-all font-medium text-sm"
              />
            </div>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 text-rose-400 text-xs font-medium p-3 rounded-lg bg-rose-500/5 border border-rose-500/10"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 active:scale-[0.98] py-4 rounded-xl font-bold text-slate-950 transition-all shadow-lg hover:shadow-sky-500/10 cursor-pointer text-sm tracking-wide uppercase bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500"
          >
            ĐĂNG NHẬP HỆ THỐNG
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center flex flex-col items-center justify-center gap-2">
          <p className="text-slate-500 text-[11px] font-medium">Tài khoản mẫu: <span className="text-sky-500/80 font-mono">admin/admin</span> hoặc <span className="text-sky-500/80 font-mono">user/user</span></p>
          <button
            onClick={() => {
              if (confirm("Xác nhận đưa tất cả cấu hình, danh sách thí sinh và thư viện câu hỏi về trạng thái mặc định ban đầu?")) {
                onResetSystem();
              }
            }}
            className="text-[10px] text-slate-600 uppercase tracking-widest hover:text-red-400 duration-200 cursor-pointer pt-2"
          >
            Reset hệ thống
          </button>
        </div>
      </motion.div>
    </div>
  );
}
