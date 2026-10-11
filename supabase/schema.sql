-- =========================================================================
-- LOGIC LEGENDS (TRI2663) — SUPABASE POSTGRESQL SCHEMA WITH RLS
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  institution TEXT DEFAULT 'National Institute of Engineering',
  department TEXT DEFAULT 'Computer Science & Engineering',
  course TEXT DEFAULT 'B.Tech CS&E',
  academic_year TEXT DEFAULT 'Year 3',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSESSMENT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.assessment_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug IN ('coding', 'aptitude', 'communication', 'domain_knowledge')),
  name TEXT NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight >= 0 AND weight <= 100),
  default_question_count INTEGER DEFAULT 12,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONS TABLE (Public Safe View)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.assessment_categories(id) ON DELETE CASCADE,
  question_code TEXT UNIQUE NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'coding', 'open_ended')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB, -- [{id: 'A', text: '...'}, ...]
  difficulty TEXT DEFAULT 'medium',
  points NUMERIC DEFAULT 1,
  public_sample_input TEXT,
  public_sample_output TEXT,
  constraints TEXT[],
  starter_code JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRIVATE ANSWER KEYS TABLE (Restricted Server-Only Access)
CREATE TABLE IF NOT EXISTS public.assessment_answer_keys_private (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
  correct_option_id TEXT,
  explanation TEXT,
  private_test_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASSESSMENT ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.assessment_categories(id) ON DELETE CASCADE,
  selected_question_ids UUID[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'needs_review', 'evaluated', 'reassessment_eligible', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  score_out_of_5 NUMERIC(4, 2),
  earned_marks NUMERIC(5, 2),
  max_score NUMERIC(5, 2),
  feedback TEXT,
  grading_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ASSESSMENT RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  selected_option_id TEXT,
  submitted_code TEXT,
  language TEXT,
  earned_marks NUMERIC(4, 2) DEFAULT 0,
  is_correct BOOLEAN,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

-- 7. COMMUNICATION EVALUATIONS (Rubrics)
CREATE TABLE IF NOT EXISTS public.communication_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.profiles(id),
  clarity_score NUMERIC(2, 1) CHECK (clarity_score BETWEEN 0 AND 5),
  structure_score NUMERIC(2, 1) CHECK (structure_score BETWEEN 0 AND 5),
  relevance_score NUMERIC(2, 1) CHECK (relevance_score BETWEEN 0 AND 5),
  evidence_score NUMERIC(2, 1) CHECK (evidence_score BETWEEN 0 AND 5),
  professionalism_score NUMERIC(2, 1) CHECK (professionalism_score BETWEEN 0 AND 5),
  overall_score NUMERIC(3, 2),
  feedback TEXT,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  ip_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'general',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answer_keys_private ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Categories: Public read
CREATE POLICY "Public read categories" ON public.assessment_categories
  FOR SELECT USING (true);

-- Questions: Authenticated read
CREATE POLICY "Authenticated read questions" ON public.questions
  FOR SELECT TO authenticated USING (is_active = true);

-- Private Answer Keys: Server / Service-role only (No client access)
CREATE POLICY "No direct client access to answer keys" ON public.assessment_answer_keys_private
  FOR ALL TO authenticated USING (false);

-- Profiles: Users can read own profile; Admins and Teachers can read student profiles
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'admin'));

-- Attempts: Students can read and create own attempts
CREATE POLICY "Students manage own attempts" ON public.assessment_attempts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'admin'));

-- Responses: Students can insert/update own responses for active attempts
CREATE POLICY "Students insert/update own responses" ON public.assessment_responses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Audit logs: Read by admins only
CREATE POLICY "Admins read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Notifications: Users read own notifications
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
