import React from 'react';
import { useAssessment } from '../context/AssessmentContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { setRole, setIsIdeModalOpen, setIsQuestionBankOpen, logout, isAuthenticated } = useAssessment();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'assessments', label: 'Assessments', icon: 'assignment', badge: '2 Live' },
    { id: 'submissions', label: 'Submissions', icon: 'fact_check' },
    { id: 'analytics', label: 'Analytics & Rubrics', icon: 'analytics' },
    { id: 'roster', label: 'Class Roster', icon: 'group' },
    { id: 'login', label: 'Auth & Login Portal', icon: 'account_circle' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between p-4 border-r border-[#c7c4d8] bg-[#f2f3ff] transition-all hidden md:flex">
      <div className="space-y-4">
        {/* Institution Header */}
        <div className="flex items-center gap-2.5 px-1 pb-3 border-b border-[#c7c4d8]">
          <div className="w-10 h-10 rounded-xl bg-[#3525cd] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-xl">psychology</span>
          </div>
          <div>
            <div className="text-sm font-bold text-[#131b2e]">Logic Legends</div>
            <div className="text-[11px] text-[#464555]">TRI2663 Evaluation Portal</div>
          </div>
        </div>

        {/* Side Navigation Tab Links */}
        <nav aria-label="Sidebar Primary Navigation" className="space-y-1">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (item.id === 'submissions') setRole('teacher');
                  if (item.id === 'analytics') setRole('admin');
                }}
                className={`w-full text-left rounded-lg px-3.5 py-2.5 font-semibold text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'text-[#464555] hover:bg-[#eaedff] hover:text-[#131b2e]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#d8e2ff] text-[#001a42]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Question Bank Explorer Button */}
        <div>
          <button
            onClick={() => setIsQuestionBankOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-[#3525cd] font-semibold text-xs hover:bg-[#e2e7ff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">library_books</span>
            <span>48 Seeded Questions</span>
          </button>
        </div>

        {/* CTA Action inside Sidebar */}
        <div className="pt-1">
          <button
            onClick={() => setIsIdeModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#4f46e5] text-white font-semibold text-sm hover:bg-[#3525cd] transition-colors shadow-sm cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-lg">terminal</span>
            <span>Sandbox IDE</span>
          </button>
        </div>
      </div>

      {/* Footer Tab Links from JSON / HTML Spec */}
      <div className="pt-4 border-t border-[#c7c4d8] space-y-1">
        <button
          onClick={() => setIsIdeModalOpen(true)}
          className="w-full text-left text-[#464555] rounded-lg px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">terminal</span>
          <span>Terminal</span>
          <span className="ml-auto text-[10px] text-emerald-600 font-mono font-bold">Judge0: 200 OK</span>
        </button>

        <button
          onClick={() => {
            setRole('admin');
            setCurrentTab('dashboard');
          }}
          className="w-full text-left text-[#464555] rounded-lg px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#eaedff] hover:text-[#131b2e] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">code</span>
          <span>System Logs</span>
        </button>

        <div className="mt-2 p-2.5 rounded-lg bg-white border border-[#c7c4d8] text-[11px] text-[#464555]">
          <div className="flex items-center justify-between font-semibold text-[#131b2e] mb-1">
            <span>Server Health</span>
            <span className="text-emerald-700 font-bold">99.98%</span>
          </div>
          <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
          </div>
        </div>

        {/* Auth Quick Action */}
        <div className="pt-1">
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="w-full py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="w-full py-1.5 px-2 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
