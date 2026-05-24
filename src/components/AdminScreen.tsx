/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useRef } from 'react';
import { User, Question, ExamConfig, ExamResult } from '../types';
import { 
  Users, Trash2, UploadCloud, Settings, Trophy, Award, Clock,
  Database, FileSpreadsheet, LogOut, Search, Sliders, Play, Plus, BookOpen, BarChart2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';

interface AdminScreenProps {
  users: User[];
  onAddUser: (u: string, p: string) => void;
  onDeleteUser: (u: string) => void;
  config: ExamConfig;
  onSaveConfig: (cfg: ExamConfig) => void;
  library: Question[];
  onImportLibrary: (questions: Question[]) => void;
  onClearLibrary: () => void;
  onDeleteQuestion: (idx: number) => void;
  onLogout: () => void;
  results?: ExamResult[];
}

export default function AdminScreen({
  users,
  onAddUser,
  onDeleteUser,
  config,
  onSaveConfig,
  library,
  onImportLibrary,
  onClearLibrary,
  onDeleteQuestion,
  onLogout,
  results = []
}: AdminScreenProps) {
  // Navigation tab switcher state
  const [activeTab, setActiveTab] = useState<'database' | 'results'>('database');

  // Add user state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userError, setUserError] = useState('');

  // Config state
  const [cfgQty, setCfgQty] = useState(config.qty);
  const [cfgTime, setCfgTime] = useState(config.time);

  // Search question state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTopic, setSearchTopic] = useState('ALL');

  // Search results state
  const [searchResultQuery, setSearchResultQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // User addition logic
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = newUsername.trim();
    const p = newPassword.trim();

    if (!u || !p) {
      setUserError('Vui lòng điền đủ Tên và Mật khẩu.');
      return;
    }

    if (users.some(user => user.u.toLowerCase() === u.toLowerCase())) {
      setUserError('Tên thí sinh đã tồn tại!');
      return;
    }

    onAddUser(u, p);
    setNewUsername('');
    setNewPassword('');
    setUserError('');
  };

  // Saved configs
  const handleSaveConfigs = () => {
    if (cfgQty <= 0 || cfgTime <= 0) {
      alert('Số câu hỏi và thời gian thi phải lớn hơn 0!');
      return;
    }
    onSaveConfig({
      qty: Number(cfgQty),
      time: Number(cfgTime)
    });
    alert('Đã lưu cấu hình bài thi thành công!');
  };

  // Excel parsing
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
          alert('File Excel không có dữ liệu ở Sheet đầu tiên!');
          return;
        }

        const parsedQuestions: Question[] = rows.map((r, i) => {
          const t = r.Topic || r.topic || r.Chủ_đề || r.chủ_đề || r.TopicName || "Chung";
          const q = r.Question || r.question || r.Câu_hỏi || r.câu_hỏi || `Câu hỏi dòng ${i + 2}`;

          // Options logic
          const optA = r.OptA !== undefined ? String(r.OptA) : r.A !== undefined ? String(r.A) : r['Option A'] !== undefined ? String(r['Option A']) : '';
          const optB = r.OptB !== undefined ? String(r.OptB) : r.B !== undefined ? String(r.B) : r['Option B'] !== undefined ? String(r['Option B']) : '';
          const optC = r.OptC !== undefined ? String(r.OptC) : r.C !== undefined ? String(r.C) : r['Option C'] !== undefined ? String(r['Option C']) : '';
          const optD = r.OptD !== undefined ? String(r.OptD) : r.D !== undefined ? String(r.D) : r['Option D'] !== undefined ? String(r['Option D']) : '';

          const o = [optA, optB, optC, optD].map(x => x.trim()).filter(x => x !== '');
          while (o.length < 4) {
            o.push(`Lựa chọn mặc định ${String.fromCharCode(65 + o.length)}`);
          }

          // Answer map robust
          let ansVal = r.Answer !== undefined ? r.Answer : r.answer !== undefined ? r.answer : r.Đáp_án !== undefined ? r.Đáp_án : 0;
          let a = 0;
          if (typeof ansVal === 'string') {
            const cleanStr = ansVal.trim().toUpperCase();
            if (cleanStr === 'A' || cleanStr === '0') a = 0;
            else if (cleanStr === 'B' || cleanStr === '1') a = 1;
            else if (cleanStr === 'C' || cleanStr === '2') a = 2;
            else if (cleanStr === 'D' || cleanStr === '3') a = 3;
            else {
              const parsedInt = parseInt(cleanStr);
              if (!isNaN(parsedInt) && parsedInt >= 0 && parsedInt <= 3) {
                a = parsedInt;
              } else {
                a = 0;
              }
            }
          } else if (typeof ansVal === 'number') {
            if (ansVal >= 0 && ansVal <= 3) {
              a = ansVal;
            } else if (ansVal >= 1 && ansVal <= 4) {
              a = ansVal - 1; // map human 1-4 to 0-3
            } else {
              a = 0;
            }
          }

          const eStr = r.Explain || r.explain || r.Explanation || r.Giải_thích || r.giải_thích || '';
          const cStr = r.CLI || r.cli || r.Lệnh || r.lệnh || '';

          return { t, q, o, a, e: eStr, c: cStr };
        });

        onImportLibrary(parsedQuestions);
        alert(`Đã nạp thành công ${parsedQuestions.length} câu hỏi mới vào thư viện!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        alert('Có lỗi xảy ra khi đọc file Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Generate and download template excel
  const downloadTemplate = () => {
    const templateData = [
      {
        Topic: "Mạng Máy Tính",
        Question: "Giao thức nào cung cấp kết nối tin cậy và kiểm soát lưu lượng?",
        OptA: "TCP",
        OptB: "UDP",
        OptC: "ICMP",
        OptD: "DNS",
        Answer: 0,
        Explain: "TCP là giao thức hướng kết nối chất lượng cao ở tầng Transport.",
        CLI: "ping google.com"
      },
      {
        Topic: "Hệ Điều Hành",
        Question: "Lệnh nào hiển thị các thư mục và file ẩn trong Linux?",
        OptA: "ls",
        OptB: "ls -a",
        OptC: "pwd",
        OptD: "cd",
        Answer: 1,
        Explain: "Tham số -a hiển thị tất cả tệp bao gồm tệp ẩn bắt đầu bằng dấu chấm.",
        CLI: "ls -la"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QuestionsTemplate");
    XLSX.writeFile(wb, "mau_de_thi_trac_nghiem.xlsx");
  };

  // Extract unique topics for search filter
  const uniqueTopics = ['ALL', ...Array.from(new Set(library.map(q => q.t)))];

  // Filtered library questions
  const filteredQuestions = library.filter(q => {
    const matchesTopic = searchTopic === 'ALL' || q.t === searchTopic;
    const matchesSearch = q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (q.t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (q.e && q.e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  // Calculate stats for completed trials log
  const filteredResults = results.filter(r => 
    r.user.toLowerCase().includes(searchResultQuery.toLowerCase())
  );

  const totalCompleted = results.length;
  const highestScore = totalCompleted > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const averageScore = totalCompleted > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / totalCompleted) : 0;
  const passRate = totalCompleted > 0 ? Math.round((results.filter(r => r.score >= 50).length / totalCompleted) * 100) : 0;

  // Format Date times
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return '---';
    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN');
  };

  const formatSeconds = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">Hệ Thống Quản Trị Viên</h1>
            <p className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">Tùy chỉnh & Đánh giá nội bộ</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 font-medium px-4 py-2 rounded-xl text-sm hover:bg-slate-700 hover:text-rose-450 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </header>

      {/* Synchronisation Tab Selector */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition ${
            activeTab === 'database' 
              ? 'bg-sky-500/15 text-sky-450 border-sky-500/25 shadow-sm shadow-sky-950/20' 
              : 'text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-250'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Cơ sở dữ liệu & Cấu hình</span>
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition ${
            activeTab === 'results' 
              ? 'bg-sky-500/15 text-sky-450 border-sky-500/25 shadow-sm shadow-sky-950/20' 
              : 'text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-250'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Bảng điểm & Thống kê thi</span>
        </button>
      </div>

      {/* Main Panel contents wrapper */}
      {activeTab === 'database' ? (
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left Column: Manage users & config (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* User management card */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-lg">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/60">
                <h2 className="font-bold text-sm text-sky-450 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>QUẢN LÝ THÍ SINH</span>
                </h2>
                <span id="user-total" className="text-xs bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full font-bold border border-sky-500/10">
                  {users.length} tài khoản
                </span>
              </div>

              {/* Form to add user */}
              <form onSubmit={handleAddUserSubmit} className="space-y-3 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-850">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Thêm tài khoản mới</p>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    id="new-u"
                    placeholder="Username" 
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setUserError('');
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg outline-none text-slate-100 placeholder-slate-500 focus:border-sky-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    id="new-p"
                    placeholder="Mật khẩu" 
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setUserError('');
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg outline-none text-slate-100 placeholder-slate-500 focus:border-sky-500 transition-colors"
                  />
                </div>

                {userError && (
                  <p className="text-rose-400 text-[11px] font-medium px-1">{userError}</p>
                )}

                <button 
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-500 text-slate-950 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thí sinh</span>
                </button>
              </form>

              {/* List users scrollable */}
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                {users.map((user) => (
                  <div 
                    key={user.u}
                    className="flex justify-between items-center bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-900/60 transition"
                  >
                    <div>
                      <p className="font-bold text-xs text-sky-405">{user.u}</p>
                      <p className="text-[10.5px] text-slate-500 font-mono font-bold mt-0.5">Mật khẩu: {user.p}</p>
                    </div>
                    {user.role === 'admin' ? (
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold tracking-tight">
                        Admin
                      </span>
                    ) : (
                      <button 
                        onClick={() => onDeleteUser(user.u)}
                        title="Xóa tài khoản này"
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Exam Quiz configuration card */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-lg">
              <h2 className="font-bold text-sm text-sky-450 uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/60">
                <Settings className="w-4 h-4" />
                <span>CẤU HÌNH ĐỀ THI</span>
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">Số câu hỏi thi</label>
                    <input 
                      type="number" 
                      id="cfg-qty"
                      min="1"
                      max={library.length || 100}
                      value={cfgQty}
                      onChange={(e) => setCfgQty(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 outline-none p-2.5 rounded-xl text-slate-100 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Tối đa trong kho: {library.length} câu</span>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">Thời gian (Phút)</label>
                    <input 
                      type="number" 
                      id="cfg-time"
                      min="1"
                      value={cfgTime}
                      onChange={(e) => setCfgTime(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 outline-none p-2.5 rounded-xl text-slate-100 font-bold"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveConfigs}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-slate-950 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
                >
                  LƯU CÀI ĐẶT BÀI THI
                </button>
              </div>
            </section>

          </div>

          {/* Right Column: Library upload & questions table (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* File Upload zone */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <h2 className="font-bold text-sm text-sky-405 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>NẠP KHO ĐỀ THI (.XLSX)</span>
                </h2>
                <button 
                  onClick={downloadTemplate}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-bold border border-sky-400/20 px-2.5 py-1 rounded bg-sky-500/5 hover:bg-sky-500/10 duration-200 flex items-center gap-1 uppercase"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Tải Excel Mẫu</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Drag/drop block input */}
                <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-700/60 text-center relative focus-within:border-sky-500 duration-200 hover:bg-slate-900/40">
                  <input 
                    type="file" 
                    id="excel-input" 
                    accept=".xlsx" 
                    ref={fileInputRef}
                    onChange={handleExcelImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <div className="pointer-events-none">
                    <UploadCloud className="w-8 h-8 mx-auto text-sky-500/60 mb-2" />
                    <p className="text-sm font-bold text-slate-300">Nhấp chọn file đề thi Excel</p>
                    <p className="text-slate-500 text-[11px] mt-1">Định dạng hỗ trợ: .xlsx</p>
                  </div>
                </div>

                {/* Excel instruction card */}
                <div className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <p className="font-bold text-sky-400/90 uppercase text-[10px] tracking-wider mb-1.5">Hướng dẫn cột trong Excel:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><b className="text-slate-200">Topic</b>: Chủ đề câu hỏi</li>
                    <li><b className="text-slate-200">Question</b>: Nội dung câu hỏi</li>
                    <li><b className="text-slate-200">OptA, OptB, OptC, OptD</b>: Các đáp án</li>
                    <li><b className="text-slate-200">Answer</b>: Phương án đúng (<code className="bg-slate-900 px-1 border border-slate-800 text-sky-400">0</code> = A, <code className="bg-slate-900 px-1 border border-slate-800 text-sky-400">1</code> = B...)</li>
                    <li><b className="text-slate-200">Explain</b>: Giải thích chi tiết sau thi</li>
                    <li><b className="text-slate-200">CLI</b>: Dòng lệnh ví dụ mẫu (nếu có)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Library explorer card */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col min-h-[300px] overflow-hidden shadow-lg">
              
              {/* Library status bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm text-slate-200">DANH SÁCH KHO CÂU HỎI</h3>
                  <span id="lib-count" className="text-xs font-mono font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/15">
                    {library.length} câu
                  </span>
                </div>

                {library.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm("Xác nhận xóa hoàn toàn kho câu hỏi hiện tại? Bạn có thể nạp lại file excel khác bất kỳ lúc nào.")) {
                        onClearLibrary();
                      }
                    }}
                    className="text-[10px] text-rose-450 font-bold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 px-2 py-1 rounded transition ml-auto cursor-pointer"
                  >
                    XÓA TẤT CẢ KHO
                  </button>
                )}
              </div>

              {/* Quick Filter toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm theo chủ đề, câu hỏi, giải thích..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 text-xs border border-slate-800 focus:border-sky-500 outline-none pl-9 pr-4 py-2.5 rounded-xl text-slate-200 placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 min-w-[150px]">
                  <span className="text-[10px] text-slate-500 uppercase font-black">Chủ đề:</span>
                  <select
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    className="bg-transparent text-xs text-sky-450 outline-none font-bold w-full cursor-pointer"
                  >
                    {uniqueTopics.map(t => (
                      <option key={t} value={t} className="bg-slate-900 text-slate-350">
                        {t === 'ALL' ? 'Tất cả' : t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Questions explorer container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[380px] scrollbar-thin">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                    <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">Không tìm thấy câu hỏi phù hợp</p>
                    <p className="text-slate-600 text-[11px] mt-1">Hãy nạp file Excel hoặc thay đổi bộ lọc tìm kiếm</p>
                  </div>
                ) : (
                  filteredQuestions.map((q, filteredIdx) => {
                    const originalIdx = library.findIndex(item => item === q);
                    const labels = ['A', 'B', 'C', 'D'];
                    return (
                      <div 
                        key={originalIdx !== -1 ? originalIdx : filteredIdx}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800 duration-200 relative group flex gap-3"
                      >
                        <div className="shrink-0 flex flex-col items-center">
                          <span className="w-8 h-8 bg-slate-900 text-slate-400 rounded-full border border-slate-800 flex items-center justify-center font-bold text-xs">
                            {originalIdx !== -1 ? originalIdx + 1 : filteredIdx + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-md font-bold uppercase tracking-wide border border-sky-500/10">
                              {q.t}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 leading-relaxed mb-3">{q.q}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mb-3">
                            {q.o.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`p-2 rounded-lg border flex items-center gap-1.5 ${oIdx === q.a ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/15 font-semibold' : 'bg-slate-900 text-slate-400 border-slate-850'}`}
                              >
                                <span className="font-bold opacity-60">{labels[oIdx]}.</span>
                                <span className="truncate">{opt}</span>
                              </div>
                            ))}
                          </div>

                          {q.e && (
                            <p className="text-[10px] text-slate-500 leading-snug bg-slate-900/40 p-2 rounded border border-slate-900 italic">
                              <b>Giải thích:</b> {q.e}
                            </p>
                          )}
                          {q.c && (
                            <div className="mt-1 flex items-center gap-1 p-2 bg-slate-900/60 rounded border border-slate-900 font-mono text-[10px] text-teal-400/90">
                              <b>Command:</b> <span>{q.c}</span>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 self-start md:opacity-0 md:group-hover:opacity-100 duration-200">
                          <button 
                            onClick={() => {
                              if (confirm(`Xác nhận xóa câu hỏi này khỏi danh sách?`)) {
                                onDeleteQuestion(originalIdx !== -1 ? originalIdx : filteredIdx);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-450 p-2 rounded-lg hover:bg-rose-500/5 transition duration-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </section>

          </div>
          
        </main>
      ) : (
        /* Results assessment tab content */
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden">
          
          {/* Statistics Dashboard Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/15 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[10.5px] font-bold uppercase tracking-wide">Số lượt thi nộp</p>
                <p className="text-2xl font-extrabold text-slate-100 mt-1">{totalCompleted}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[10.5px] font-bold uppercase tracking-wide">Điểm trung bình</p>
                <p className="text-2xl font-extrabold text-emerald-450 mt-1">{averageScore} <span className="text-xs text-slate-500 font-bold">/ 100</span></p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/15 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[10.5px] font-bold uppercase tracking-wide">Tỷ số thi đỗ (≥50đ)</p>
                <p className="text-2xl font-extrabold text-purple-400 mt-1">{passRate}%</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/15 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[10.5px] font-bold uppercase tracking-wide">Kỷ lục điểm số</p>
                <p className="text-2xl font-extrabold text-amber-405 mt-1">{highestScore} <span className="text-xs text-slate-500 font-bold">đạt</span></p>
              </div>
            </div>
          </div>

          {/* Grid logs Table layout */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col overflow-hidden min-h-[350px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-405" />
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">DANH SÁCH BẢNG ĐIỂM HOÀN THÀNH</h3>
                <span className="text-xs font-mono font-black text-sky-450 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/10">
                  {filteredResults.length} lượt lưu
                </span>
              </div>

              {/* Filtering results */}
              <div className="relative min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Lọc điểm theo Tên..."
                  value={searchResultQuery}
                  onChange={(e) => setSearchResultQuery(e.target.value)}
                  className="bg-slate-950 text-xs border border-slate-800 focus:border-sky-500 outline-none pl-8 pr-3 py-1.5 rounded-xl text-slate-200 w-full"
                />
              </div>
            </div>

            {/* Assessment Records scroll bar container */}
            <div className="flex-1 overflow-auto rounded-xl border border-slate-850 bg-slate-950 scrollbar-thin">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <Sliders className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">Chưa có kết quả thi nào được ghi dâng</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Kết quả thi của học sinh trên đám mây sẽ hiển thị tại đây theo thời gian thực</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 text-slate-450 font-black tracking-wider uppercase text-[10px] border-b border-slate-850 select-none">
                      <th className="p-4">Tên Thí Sinh</th>
                      <th className="p-4 text-center">Điểm Đánh Giá</th>
                      <th className="p-4 text-center">Tỷ số câu Đúng</th>
                      <th className="p-4 text-center">Thời gian làm</th>
                      <th className="p-4 text-right">Ngày Giờ làm bài</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {filteredResults.map((res) => {
                      const isPast = res.score >= 50;
                      return (
                        <tr key={res.id} className="hover:bg-slate-900/20 duration-150">
                          <td className="p-4 font-black text-sky-400 capitalize">{res.user}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-black border uppercase ${
                              res.score >= 80 
                                ? 'bg-amber-500/5 text-amber-400 border-amber-500/15' 
                                : isPast 
                                  ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/15' 
                                  : 'bg-rose-500/5 text-rose-400 border-rose-500/15'
                            }`}>
                              {res.score} Điểm
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-300">
                            {res.correctCount} / {res.totalQuestions} câu
                          </td>
                          <td className="p-4 text-center font-mono font-extrabold text-slate-400">
                            {formatSeconds(res.secondsTaken)}
                          </td>
                          <td className="p-4 text-right text-slate-500 font-bold tracking-wide">
                            {formatDateTime(res.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
