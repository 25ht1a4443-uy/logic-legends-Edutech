import React, { useState } from 'react';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EmbeddedIDEModal } from './components/EmbeddedIDEModal';
import { ScoreSimulatorModal } from './components/ScoreSimulatorModal';
import { RubricModal } from './components/RubricModal';
import { ActiveAssessmentModal } from './components/ActiveAssessmentModal';
import { ResultsReviewModal } from './components/ResultsReviewModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';
import { LoginDashboard } from './components/LoginDashboard';

const MainLayout: React.FC = () => {
  const { role, isAuthenticated } = useAssessment();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  React.useEffect(() => {
    const handleOpen = () => setIsSupabaseModalOpen(true);
    window.addEventListener('open-supabase-modal', handleOpen);
    return () => window.removeEventListener('open-supabase-modal', handleOpen);
  }, []);

  // When not authenticated, start the app with app logo and login page with OTP verification
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen flex flex-col overflow-y-auto bg-[#faf8ff] text-[#131b2e]">
        <LoginDashboard onLoginSuccess={() => setCurrentTab('dashboard')} />
        <SupabaseStatusModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#faf8ff] text-[#131b2e]">
      {/* Top Global App Bar */}
      <Navbar />

      {/* Main Workspace with Persistent Left Sidebar & Active View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Side Navigation */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[#faf8ff]">
          {currentTab === 'login' ? (
            <LoginDashboard onLoginSuccess={() => setCurrentTab('dashboard')} />
          ) : (
            <>
              {role === 'student' && <StudentDashboard />}
              {role === 'teacher' && <TeacherDashboard />}
              {role === 'admin' && <AdminDashboard />}
            </>
          )}
        </main>
      </div>

      {/* Modals & Interactive Split Screen Runners */}
      <EmbeddedIDEModal />
      <ScoreSimulatorModal />
      <RubricModal />
      <ActiveAssessmentModal />
      <ResultsReviewModal />
      <QuestionBankModal />
      <SupabaseStatusModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AssessmentProvider>
      <MainLayout />
    </AssessmentProvider>
  );
}
