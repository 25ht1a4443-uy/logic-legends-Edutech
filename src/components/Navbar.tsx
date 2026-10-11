import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    notifications,
    markAllNotificationsRead,
    submissions,
    currentUser,
    logout,
    switchAccount,
  } = useAssessment();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="w-full h-16 px-4 md:px-6 flex items-center justify-between border-b border-[#c7c4d8] bg-white sticky top-0 z-40 shadow-xs transition-colors duration-150">
      {/* Brand Anchor & Institutional Emblem */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#4f46e5] text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-xl">terminal</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#3525cd] tracking-tight">Logic Legends</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e2dfff] text-[#0f0069] uppercase tracking-wider">
                TRI2663
              </span>
            </div>
            <p className="text-[11px] text-[#464555] flex items-center gap-1">
              <span>Problem Statement #05</span>
              <span className="w-1 h-1 rounded-full bg-[#c7c4d8]"></span>
              <span className="text-[#0058be] font-medium">EduTech Enterprise</span>
            </p>
          </div>
        </div>

        {/* Institutional Divider */}
        <div className="hidden xl:block h-6 w-px bg-[#c7c4d8] mx-2"></div>

        {/* Real-time Security Sandbox Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f3ff] border border-[#c7c4d8] text-[11px] text-[#464555]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[#131b2e]">Isolated Sandbox:</span>
          <span>Judge0 Online</span>
          <span className="text-[#777587]">•</span>
          <span className="text-emerald-700 font-semibold">SSL Verified</span>
        </div>

        {/* Supabase Connection Pill Trigger */}
        <button
          onClick={() => {
            const ev = new CustomEvent('open-supabase-modal');
            window.dispatchEvent(ev);
          }}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eaedff] border border-[#c7c4d8] text-[11px] text-[#3525cd] hover:bg-[#e2e7ff] transition-colors cursor-pointer"
          title="Supabase Database Connection Status"
        >
          <span className="material-symbols-outlined text-sm text-emerald-700">database</span>
          <span className="font-semibold">Supabase Connected</span>
        </button>
      </div>

      {/* Role Switcher Tabs */}
      <nav aria-label="Role View Navigation" className="flex items-center space-x-2 md:space-x-6">
        <button
          onClick={() => setRole('student')}
          className={`pb-1 flex items-center gap-1.5 transition-colors duration-150 text-sm md:text-base font-semibold cursor-pointer ${
            role === 'student'
              ? 'border-b-2 border-[#3525cd] text-[#3525cd]'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
          <span>Student</span>
        </button>

        <button
          onClick={() => setRole('teacher')}
          className={`pb-1 flex items-center gap-1.5 transition-colors duration-150 text-sm md:text-base font-semibold cursor-pointer ${
            role === 'teacher'
              ? 'border-b-2 border-[#3525cd] text-[#3525cd]'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
          <span className="hidden sm:inline">Teacher/Evaluator</span>
          <span className="sm:hidden">Teacher</span>
        </button>

        <button
          onClick={() => setRole('admin')}
          className={`pb-1 flex items-center gap-1.5 transition-colors duration-150 text-sm md:text-base font-semibold cursor-pointer ${
            role === 'admin'
              ? 'border-b-2 border-[#3525cd] text-[#3525cd]'
              : 'text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          <span className="hidden sm:inline">Administrator</span>
          <span className="sm:hidden">Admin</span>
        </button>
      </nav>

      {/* Trailing Actions & User Cluster */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Evaluation Queue / Action CTA */}
        <button
          onClick={() => setRole('teacher')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-[#131b2e] text-xs font-semibold hover:bg-[#e2e7ff] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">checklist</span>
          <span>Evaluation Queue</span>
          <span className="w-4 h-4 rounded-full bg-[#3525cd] text-white text-[10px] flex items-center justify-center font-bold">
            {submissions.length}
          </span>
        </button>

        {/* Notifications Bell with Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-[#464555] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#c7c4d8] shadow-xl z-50 p-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#c7c4d8] px-1">
                <span className="text-sm font-bold text-[#131b2e]">Notifications</span>
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="text-[11px] text-[#3525cd] font-semibold cursor-pointer hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-1.5 mt-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                      notif.read ? 'bg-white border-[#e2e7ff]' : 'bg-[#f2f3ff] border-[#c7c4d8]'
                    } hover:bg-[#eaedff]`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`material-symbols-outlined text-sm mt-0.5 ${notif.color}`}>
                        {notif.icon}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-[#131b2e]">{notif.title}</p>
                        <p className="text-[11px] text-[#464555]">{notif.description}</p>
                        <span className="text-[10px] text-[#777587]">{notif.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Profile Pill & Account Session Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 pl-2 border-l border-[#c7c4d8] text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Account Profile & Session Details"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#e2dfff]">
                {role === 'student' ? 'KJ' : role === 'teacher' ? 'VS' : 'RR'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#131b2e] leading-tight">
                {currentUser?.name || (role === 'student' ? 'K Jeevanakala' : role === 'teacher' ? 'Prof. V. Sharma' : 'Dr. R. Raman')}
              </p>
              <p className="text-[11px] text-[#464555] flex items-center gap-1 font-mono">
                <span className="text-[#0058be]">
                  {currentUser?.studentId || (role === 'student' ? 'LL-2024-8842' : role === 'teacher' ? 'FAC-CS-104' : 'SYS-ADMIN-01')}
                </span>
                <span>• CS&E</span>
              </p>
            </div>
            <span className="material-symbols-outlined text-sm text-[#777587]">
              {isProfileMenuOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#c7c4d8] shadow-xl z-50 p-3 space-y-2.5">
              <div className="pb-2 border-b border-[#c7c4d8]">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#e2dfff] text-[#0f0069]">
                  {role.toUpperCase()} SESSION ACTIVE
                </span>
                <p className="text-sm font-bold text-[#131b2e] mt-1">{currentUser?.name}</p>
                <p className="text-[11px] text-[#464555] font-mono">{currentUser?.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#777587] block mb-1">
                  Switch Active Portal:
                </span>
                <button
                  onClick={() => {
                    switchAccount('student');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    role === 'student' ? 'bg-[#eaedff] text-[#3525cd] font-bold' : 'hover:bg-[#f2f3ff] text-[#131b2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">school</span>
                  <span>Student Portal (K Jeevanakala)</span>
                </button>
                <button
                  onClick={() => {
                    switchAccount('teacher');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    role === 'teacher' ? 'bg-[#eaedff] text-[#3525cd] font-bold' : 'hover:bg-[#f2f3ff] text-[#131b2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">assignment_ind</span>
                  <span>Evaluator (Prof. V. Sharma)</span>
                </button>
                <button
                  onClick={() => {
                    switchAccount('admin');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                    role === 'admin' ? 'bg-[#eaedff] text-[#3525cd] font-bold' : 'hover:bg-[#f2f3ff] text-[#131b2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  <span>Administrator (Dr. R. Raman)</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#c7c4d8]">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Sign Out of Platform</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
