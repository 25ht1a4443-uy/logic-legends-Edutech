import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  CategorySlug,
  DimensionalScores,
  StudentProfile,
  Attempt,
  AuditLogItem,
  NotificationItem,
  Question,
  AuthUser,
} from '../types';
import { CATEGORIES, SEEDED_QUESTIONS } from '../data/seededQuestions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AssessmentContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (email: string, password: string, requestedRole?: Role) => Promise<{ success: boolean; error?: string }>;
  loginWithPhoneOtp: (phoneNumber: string, otp: string, requestedRole?: Role) => Promise<{ success: boolean; error?: string }>;
  loginWithEmailOtp: (email: string, otp: string, requestedRole?: Role) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    studentId: string;
    department: string;
    institution: string;
    course: string;
    academicYear: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchAccount: (targetRole: Role) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  weights: Record<CategorySlug, number>;
  updateWeights: (newWeights: Record<CategorySlug, number>) => { success: boolean; error?: string };
  student: StudentProfile;
  updateStudentScores: (scores: Partial<DimensionalScores>) => void;
  overallScore: number;
  percentageScore: string;
  submissions: Attempt[];
  addSubmission: (attempt: Attempt) => void;
  updateSubmission: (attemptId: string, updates: Partial<Attempt>) => void;
  auditLogs: AuditLogItem[];
  addAuditLog: (operation: string, target: string, actorRole?: string, status?: AuditLogItem['status']) => void;
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  // Modal states
  isIdeModalOpen: boolean;
  setIsIdeModalOpen: (open: boolean) => void;
  selectedCodingQuestion: Question | null;
  setSelectedCodingQuestion: (q: Question | null) => void;
  isScoreSimModalOpen: boolean;
  setIsScoreSimModalOpen: (open: boolean) => void;
  isRubricModalOpen: boolean;
  setIsRubricModalOpen: (open: boolean) => void;
  activeRubricAttempt: Attempt | null;
  setActiveRubricAttempt: (attempt: Attempt | null) => void;
  isQuestionBankOpen: boolean;
  setIsQuestionBankOpen: (open: boolean) => void;
  isActiveQuizOpen: boolean;
  setIsActiveQuizOpen: (open: boolean) => void;
  activeQuizCategory: CategorySlug | null;
  setActiveQuizCategory: (cat: CategorySlug | null) => void;
  isResultsModalOpen: boolean;
  setIsResultsModalOpen: (open: boolean) => void;
  activeResultAttempt: Attempt | null;
  setActiveResultAttempt: (attempt: Attempt | null) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('student');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'usr-8842',
    name: 'K Jeevanakala',
    email: 'k.jeevanakala@edutech.ac.in',
    role: 'student',
    studentId: 'LL-2024-8842',
    department: 'Computer Science & Engineering',
    institution: 'National Institute of Engineering',
    course: 'B.Tech CS&E',
    academicYear: 'Year 3 (Trimester 2)',
  });

  // Weights (must sum to 100%)
  const [weights, setWeights] = useState<Record<CategorySlug, number>>({
    coding: 30,
    aptitude: 25,
    communication: 20,
    domain_knowledge: 25,
  });

  // Student Profile
  const [student, setStudent] = useState<StudentProfile>({
    id: 'usr-8842',
    studentCode: 'LL-2024-8842',
    name: 'K Jeevanakala',
    email: 'k.jeevanakala@edutech.ac.in',
    institution: 'National Institute of Engineering',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS&E',
    academicYear: 'Year 3 (Trimester 2)',
    avatarInitials: 'KJ',
    scores: {
      coding: 4.0,
      aptitude: 3.0,
      communication: 4.0,
      domain_knowledge: 3.5,
    },
    overallScore: 3.63,
    accreditationTier: 'Proficient Technical Candidate',
    cohortRank: 'Top 8% of Cohort',
  });

  // Login handler
  const login = async (
    email: string,
    password: string,
    requestedRole?: Role
  ): Promise<{ success: boolean; error?: string }> => {
    // If Supabase is connected, optionally authenticate with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // If error is invalid credentials in Supabase, we can report or fallback to local demo
          console.warn('Supabase auth notice:', error.message);
        } else if (data.user) {
          addAuditLog('SUPABASE_AUTH_SIGNIN', `${data.user.email}`, 'USER', 'SUCCESS');
        }
      } catch (err) {
        console.warn('Supabase login check error:', err);
      }
    }

    // Determine target role and user profile
    const targetRole: Role =
      requestedRole ||
      (email.includes('admin')
        ? 'admin'
        : email.includes('teacher') || email.includes('sharma') || email.includes('faculty')
        ? 'teacher'
        : 'student');

    setRole(targetRole);
    setIsAuthenticated(true);

    if (targetRole === 'student') {
      const studentUser: AuthUser = {
        id: 'usr-8842',
        name: email.includes('jeevanakala') ? 'K Jeevanakala' : email.split('@')[0],
        email,
        role: 'student',
        studentId: 'LL-2024-8842',
        department: 'Computer Science & Engineering',
        institution: 'National Institute of Engineering',
        course: 'B.Tech CS&E',
        academicYear: 'Year 3',
      };
      setCurrentUser(studentUser);
      setStudent((prev) => ({
        ...prev,
        name: studentUser.name,
        email: studentUser.email,
        avatarInitials: studentUser.name.substring(0, 2).toUpperCase(),
      }));
    } else if (targetRole === 'teacher') {
      setCurrentUser({
        id: 'fac-104',
        name: 'Prof. V. Sharma',
        email,
        role: 'teacher',
        department: 'Computer Science Faculty',
        institution: 'National Institute of Engineering',
      });
    } else {
      setCurrentUser({
        id: 'adm-01',
        name: 'Dr. R. Raman',
        email,
        role: 'admin',
        department: 'Academic Accreditation & Systems',
        institution: 'National Institute of Engineering',
      });
    }

    addAuditLog('USER_AUTHENTICATION_LOGIN', `${email} as ${targetRole}`, targetRole.toUpperCase(), 'SUCCESS');
    return { success: true };
  };

  // Mobile OTP Login handler
  const loginWithPhoneOtp = async (
    phoneNumber: string,
    otp: string,
    requestedRole: Role = 'student'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      return { success: false, error: 'Please enter a valid verification code.' };
    }

    setRole(requestedRole);
    setIsAuthenticated(true);

    if (requestedRole === 'student') {
      const studentUser: AuthUser = {
        id: 'usr-8842',
        name: 'K Jeevanakala',
        email: 'k.jeevanakala@edutech.ac.in',
        phoneNumber,
        role: 'student',
        studentId: 'LL-2024-8842',
        department: 'Computer Science & Engineering',
        institution: 'National Institute of Engineering',
        course: 'B.Tech CS&E',
        academicYear: 'Year 3 (Trimester 2)',
      };
      setCurrentUser(studentUser);
      setStudent((prev) => ({
        ...prev,
        name: studentUser.name,
        email: studentUser.email,
        avatarInitials: 'KJ',
      }));
    } else if (requestedRole === 'teacher') {
      setCurrentUser({
        id: 'fac-104',
        name: 'Prof. V. Sharma',
        email: 'v.sharma@edutech.ac.in',
        phoneNumber,
        role: 'teacher',
        department: 'Computer Science Faculty',
        institution: 'National Institute of Engineering',
      });
    } else {
      setCurrentUser({
        id: 'adm-01',
        name: 'Dr. R. Raman',
        email: 'admin@logiclegends.ac.in',
        phoneNumber,
        role: 'admin',
        department: 'Academic Accreditation & Systems',
        institution: 'National Institute of Engineering',
      });
    }

    addAuditLog('MOBILE_OTP_VERIFIED', `Phone: ${phoneNumber} as ${requestedRole.toUpperCase()}`, requestedRole.toUpperCase(), 'VERIFIED');
    return { success: true };
  };

  // Email OTP Login handler
  const loginWithEmailOtp = async (
    email: string,
    otp: string,
    requestedRole: Role = 'student'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      return { success: false, error: 'Please enter a valid verification code.' };
    }

    setRole(requestedRole);
    setIsAuthenticated(true);

    if (requestedRole === 'student') {
      const studentUser: AuthUser = {
        id: 'usr-8842',
        name: email.includes('jeevanakala') ? 'K Jeevanakala' : email.split('@')[0],
        email,
        role: 'student',
        studentId: 'LL-2024-8842',
        department: 'Computer Science & Engineering',
        institution: 'National Institute of Engineering',
        course: 'B.Tech CS&E',
        academicYear: 'Year 3 (Trimester 2)',
      };
      setCurrentUser(studentUser);
      setStudent((prev) => ({
        ...prev,
        name: studentUser.name,
        email: studentUser.email,
        avatarInitials: studentUser.name.substring(0, 2).toUpperCase(),
      }));
    } else if (requestedRole === 'teacher') {
      setCurrentUser({
        id: 'fac-104',
        name: 'Prof. V. Sharma',
        email,
        role: 'teacher',
        department: 'Computer Science Faculty',
        institution: 'National Institute of Engineering',
      });
    } else {
      setCurrentUser({
        id: 'adm-01',
        name: 'Dr. R. Raman',
        email,
        role: 'admin',
        department: 'Academic Accreditation & Systems',
        institution: 'National Institute of Engineering',
      });
    }

    addAuditLog('EMAIL_OTP_VERIFIED', `Email: ${email} as ${requestedRole.toUpperCase()}`, requestedRole.toUpperCase(), 'VERIFIED');
    return { success: true };
  };

  // Register handler
  const register = async (data: {
    name: string;
    email: string;
    studentId: string;
    department: string;
    institution: string;
    course: string;
    academicYear: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase && data.password) {
      try {
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
              student_id: data.studentId,
              department: data.department,
              role: 'student',
            },
          },
        });
      } catch (err) {
        console.warn('Supabase registration error:', err);
      }
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: data.name,
      email: data.email,
      role: 'student',
      studentId: data.studentId,
      department: data.department,
      institution: data.institution,
      course: data.course,
      academicYear: data.academicYear,
    };

    setCurrentUser(newUser);
    setRole('student');
    setIsAuthenticated(true);

    setStudent({
      id: newUser.id,
      studentCode: data.studentId,
      name: data.name,
      email: data.email,
      institution: data.institution,
      department: data.department,
      course: data.course,
      academicYear: data.academicYear,
      avatarInitials: data.name.substring(0, 2).toUpperCase(),
      scores: {
        coding: 3.5,
        aptitude: 3.0,
        communication: 3.5,
        domain_knowledge: 3.0,
      },
      overallScore: 3.25,
      accreditationTier: 'Registered Candidate',
      cohortRank: 'Cohort 2024-CS',
    });

    addAuditLog('NEW_STUDENT_REGISTERED', `${data.name} (${data.studentId})`, 'SYSTEM', 'COMMITTED');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('USER_LOGOUT', `${currentUser?.email || 'User'}`, role.toUpperCase(), 'SUCCESS');
  };

  const switchAccount = (targetRole: Role) => {
    setRole(targetRole);
    setIsAuthenticated(true);

    if (targetRole === 'student') {
      setCurrentUser({
        id: 'usr-8842',
        name: 'K Jeevanakala',
        email: 'k.jeevanakala@edutech.ac.in',
        role: 'student',
        studentId: 'LL-2024-8842',
        department: 'Computer Science & Engineering',
        institution: 'National Institute of Engineering',
        course: 'B.Tech CS&E',
        academicYear: 'Year 3 (Trimester 2)',
      });
      setStudent((prev) => ({
        ...prev,
        name: 'K Jeevanakala',
        email: 'k.jeevanakala@edutech.ac.in',
        avatarInitials: 'KJ',
        scores: { coding: 4.0, aptitude: 3.0, communication: 4.0, domain_knowledge: 3.5 },
      }));
    } else if (targetRole === 'teacher') {
      setCurrentUser({
        id: 'fac-104',
        name: 'Prof. V. Sharma',
        email: 'v.sharma@edutech.ac.in',
        role: 'teacher',
        department: 'Computer Science Faculty',
        institution: 'National Institute of Engineering',
      });
    } else {
      setCurrentUser({
        id: 'adm-01',
        name: 'Dr. R. Raman',
        email: 'admin@logiclegends.ac.in',
        role: 'admin',
        department: 'Academic Accreditation & Systems',
        institution: 'National Institute of Engineering',
      });
    }

    addAuditLog('SWITCH_DEMO_ACCOUNT', `Switched active role to ${targetRole}`, targetRole.toUpperCase(), 'SUCCESS');
  };

  // Calculate overall score from current scores and weights
  const calculateOverall = (s: DimensionalScores, w: Record<CategorySlug, number>) => {
    const raw = (s.coding * w.coding + s.aptitude * w.aptitude + s.communication * w.communication + s.domain_knowledge * w.domain_knowledge) / 100;
    return Math.round(raw * 100) / 100;
  };

  const overallScore = calculateOverall(student.scores, weights);
  const percentageScore = ((overallScore / 5.0) * 100).toFixed(1);

  const updateStudentScores = (newScores: Partial<DimensionalScores>) => {
    setStudent((prev) => {
      const mergedScores = { ...prev.scores, ...newScores };
      const newOverall = calculateOverall(mergedScores, weights);
      return {
        ...prev,
        scores: mergedScores,
        overallScore: newOverall,
      };
    });
  };

  const updateWeights = (newWeights: Record<CategorySlug, number>) => {
    const total = newWeights.coding + newWeights.aptitude + newWeights.communication + newWeights.domain_knowledge;
    if (total !== 100) {
      return { success: false, error: `Total weights must equal exactly 100% (currently ${total}%).` };
    }
    setWeights(newWeights);
    addAuditLog('CALIBRATE_DIMENSION_WEIGHT', `New weights: C:${newWeights.coding}%, A:${newWeights.aptitude}%, CM:${newWeights.communication}%, D:${newWeights.domain_knowledge}%`, 'LEAD_ADMIN', 'COMMITTED');
    return { success: true };
  };

  // Submissions list
  const [submissions, setSubmissions] = useState<Attempt[]>([
    {
      id: 'sub-01',
      studentId: 'usr-8842',
      studentName: 'K Jeevanakala',
      category: 'coding',
      title: 'DSA: Graph Algorithms (Module 4)',
      selectedQuestionIds: ['cod-01', 'cod-10', 'cod-12'],
      responses: {},
      status: 'evaluated',
      startedAt: '2026-10-10 13:20',
      submittedAt: 'Today, 14:22',
      deadlineAt: 'Today, 18:00',
      scoreOutOf5: 4.0,
      earnedMarks: 12,
      maxMarks: 15,
      feedback: 'Excellent edge-case handling with negative weight relaxation. Early cycle abort logic is optimal.',
      rubricScores: { correctness: 4, modularity: 4, clarity: 4, memory: 4 },
      plagiarismScore: '0% Sim • 3/3 Pass',
    },
    {
      id: 'sub-02',
      studentId: 'usr-8819',
      studentName: 'Rahul Verma',
      category: 'communication',
      title: 'Technical Concept Pitch: Microservices',
      selectedQuestionIds: ['com-01'],
      responses: {},
      status: 'evaluated',
      startedAt: '2026-10-09 11:00',
      submittedAt: 'Yesterday',
      deadlineAt: 'Yesterday, 17:00',
      scoreOutOf5: 3.8,
      earnedMarks: 19,
      maxMarks: 25,
      feedback: 'Great vocal pacing and structured architecture breakdown. Work on simplifying networking jargon for non-tech listeners.',
      rubricScores: { clarity: 4, structure: 4, relevance: 4, evidence: 3, professionalism: 4 },
      plagiarismScore: 'Verified Audio',
    },
    {
      id: 'sub-03',
      studentId: 'usr-8891',
      studentName: 'Ananya Sen',
      category: 'domain_knowledge',
      title: 'DBMS ACID Properties & Concurrency',
      selectedQuestionIds: ['dom-01', 'dom-02', 'dom-06', 'dom-08', 'dom-09', 'dom-12'],
      responses: {},
      status: 'reassessment_eligible',
      startedAt: '2026-10-08 15:10',
      submittedAt: '2 days ago',
      deadlineAt: '2 days ago',
      scoreOutOf5: 2.8,
      earnedMarks: 7,
      maxMarks: 12,
      feedback: 'Multi-version concurrency control (MVCC) and phantom read isolation levels need revision.',
      plagiarismScore: 'Reassessment Req',
    },
    {
      id: 'sub-04',
      studentId: 'usr-8854',
      studentName: 'Siddharth Nair',
      category: 'aptitude',
      title: 'Logical Reasoning & Speed Test',
      selectedQuestionIds: ['apt-01', 'apt-02', 'apt-03', 'apt-04', 'apt-05', 'apt-06'],
      responses: {},
      status: 'evaluated',
      startedAt: '2026-10-07 10:00',
      submittedAt: '3 days ago',
      deadlineAt: '3 days ago',
      scoreOutOf5: 4.6,
      earnedMarks: 11,
      maxMarks: 12,
      feedback: 'Outstanding quantitative speed and accurate combinatorial permutations.',
      plagiarismScore: 'Auto-Graded',
    },
  ]);

  const addSubmission = (attempt: Attempt) => {
    setSubmissions((prev) => [attempt, ...prev]);
  };

  const updateSubmission = (attemptId: string, updates: Partial<Attempt>) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === attemptId ? { ...sub, ...updates } : sub))
    );
  };

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      timestamp: '2026-10-10 14:12:08',
      actorRole: 'SYSTEM_CRON',
      operation: 'ROTATED_SANDBOX_JUDGE0_KEYS',
      targetSubject: 'Cluster node-04',
      ipHash: '10.14.88.2 [SHA:e84a]',
      status: 'SUCCESS',
    },
    {
      id: 'log-2',
      timestamp: '2026-10-10 13:45:11',
      actorRole: 'FACULTY_EVAL',
      operation: 'RELEASE_RUBRIC_GRADE',
      targetSubject: 'K Jeevanakala (ID: 8842)',
      ipHash: '172.16.0.44 [SHA:b10c]',
      status: 'VERIFIED',
    },
    {
      id: 'log-3',
      timestamp: '2026-10-10 11:20:30',
      actorRole: 'LEAD_ADMIN',
      operation: 'CALIBRATE_DIMENSION_WEIGHT',
      targetSubject: 'Policy CS-2024-TR2',
      ipHash: '192.168.1.100 [SHA:99f2]',
      status: 'COMMITTED',
    },
  ]);

  const addAuditLog = (
    operation: string,
    target: string,
    actorRole: string = 'LEAD_ADMIN',
    status: AuditLogItem['status'] = 'SUCCESS'
  ) => {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: ts,
      actorRole,
      operation,
      targetSubject: target,
      ipHash: `192.168.1.${Math.floor(Math.random() * 200)} [SHA:${Math.random().toString(36).substring(2, 6)}]`,
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Upcoming Coding Assessment',
      description: 'DSA Graph Algorithms starts today at 18:00 IST',
      timeAgo: '12m ago',
      icon: 'timer',
      color: 'text-secondary',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Rubric Feedback Released',
      description: 'Prof. Sharma evaluated Concept Pitch (4.0/5.0)',
      timeAgo: '1h ago',
      icon: 'verified',
      color: 'text-emerald-600',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Reassessment Window Open',
      description: 'Domain Knowledge: ACID transactions eligible until Friday',
      timeAgo: '3h ago',
      icon: 'event_repeat',
      color: 'text-amber-600',
      read: false,
    },
  ]);

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Modals
  const [isIdeModalOpen, setIsIdeModalOpen] = useState(false);
  const [selectedCodingQuestion, setSelectedCodingQuestion] = useState<Question | null>(SEEDED_QUESTIONS.find(q => q.code === 'COD01') || null);
  const [isScoreSimModalOpen, setIsScoreSimModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [activeRubricAttempt, setActiveRubricAttempt] = useState<Attempt | null>(null);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isActiveQuizOpen, setIsActiveQuizOpen] = useState(false);
  const [activeQuizCategory, setActiveQuizCategory] = useState<CategorySlug | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [activeResultAttempt, setActiveResultAttempt] = useState<Attempt | null>(null);

  return (
    <AssessmentContext.Provider
      value={{
        role,
        setRole,
        isAuthenticated,
        currentUser,
        login,
        loginWithPhoneOtp,
        loginWithEmailOtp,
        register,
        logout,
        switchAccount,
        isLoginModalOpen,
        setIsLoginModalOpen,
        weights,
        updateWeights,
        student,
        updateStudentScores,
        overallScore,
        percentageScore,
        submissions,
        addSubmission,
        updateSubmission,
        auditLogs,
        addAuditLog,
        notifications,
        markAllNotificationsRead,
        isIdeModalOpen,
        setIsIdeModalOpen,
        selectedCodingQuestion,
        setSelectedCodingQuestion,
        isScoreSimModalOpen,
        setIsScoreSimModalOpen,
        isRubricModalOpen,
        setIsRubricModalOpen,
        activeRubricAttempt,
        setActiveRubricAttempt,
        isQuestionBankOpen,
        setIsQuestionBankOpen,
        isActiveQuizOpen,
        setIsActiveQuizOpen,
        activeQuizCategory,
        setActiveQuizCategory,
        isResultsModalOpen,
        setIsResultsModalOpen,
        activeResultAttempt,
        setActiveResultAttempt,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
