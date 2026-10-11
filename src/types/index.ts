export type Role = 'student' | 'teacher' | 'admin';

export type CategorySlug = 'coding' | 'aptitude' | 'communication' | 'domain_knowledge';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  weight: number; // e.g. 30 for 30%
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  description: string;
  defaultQuestionsCount: number;
  durationMinutes: number;
}

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPrivate?: boolean;
}

export interface Question {
  id: string;
  code: string; // e.g., 'APT01', 'COD01', 'COM01', 'DOM01'
  category: CategorySlug;
  type: 'multiple_choice' | 'coding' | 'open_ended';
  title: string;
  prompt: string;
  options?: QuestionOption[];
  correctOption?: string; // Private answer key
  explanation?: string;
  publicSampleInput?: string;
  publicSampleOutput?: string;
  constraints?: string[];
  points: number;
  starterCode?: Record<string, string>; // { python: '...', ts: '...', java: '...', cpp: '...' }
  testCases?: TestCase[];
}

export interface StudentResponse {
  questionId: string;
  selectedOption?: string;
  answerText?: string;
  submittedCode?: string;
  language?: string;
  isCorrect?: boolean;
  earnedMarks?: number;
  savedAt: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  studentName: string;
  category: CategorySlug;
  title: string;
  selectedQuestionIds: string[];
  responses: Record<string, StudentResponse>;
  status: 'in_progress' | 'submitted' | 'needs_review' | 'evaluated' | 'reassessment_eligible';
  startedAt: string;
  submittedAt?: string;
  deadlineAt: string;
  scoreOutOf5?: number;
  earnedMarks?: number;
  maxMarks?: number;
  feedback?: string;
  rubricScores?: Record<string, number>;
  timeUsedSeconds?: number;
  plagiarismScore?: string;
}

export interface DimensionalScores {
  coding: number;
  aptitude: number;
  communication: number;
  domain_knowledge: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  studentId?: string;
  department?: string;
  institution?: string;
  course?: string;
  academicYear?: string;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  course: string;
  academicYear: string;
  avatarInitials: string;
  scores: DimensionalScores;
  overallScore: number;
  accreditationTier: string;
  cohortRank: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorRole: string;
  operation: string;
  targetSubject: string;
  ipHash: string;
  status: 'SUCCESS' | 'VERIFIED' | 'COMMITTED' | 'FLAGGED';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  icon: string;
  color: string;
  read: boolean;
  actionUrl?: string;
}
