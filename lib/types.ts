// ─── Shared TypeScript types across the platform ──────────────────────────────

export type UserRole = 'candidate' | 'mentor' | 'admin';
export type InterviewMode = 'free' | 'audio' | 'video' | 'human';
export type InterviewStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type ExperienceLevel = 'junior' | 'mid' | 'senior';
export type JobRole =
  | 'fullstack'
  | 'backend'
  | 'frontend'
  | 'mobile'
  | 'devops'
  | 'system_design'
  | 'data_engineer'
  | 'ml_engineer';
export type TargetMarket = 'local_palestine' | 'global_remote';
export type SubscriptionTier = 'free' | 'standard' | 'premium' | 'human';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company: string | null;
  title: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  candidate_id: string;
  mode: InterviewMode;
  status: InterviewStatus;
  job_role: JobRole;
  experience_level: ExperienceLevel;
  target_market: TargetMarket;
  tech_stack: string[];
  resume_url: string | null;
  extracted_skills: string[] | null;
  vapi_call_id: string | null;
  tavus_conversation_id: string | null;
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question: string;
  category: string;
  difficulty: string;
  order_index: number;
  created_at: string;
}

export interface InterviewEvaluation {
  id: string;
  interview_id: string;
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  gemini_report: string | null;
  transcript: string | null;
  created_at: string;
}

export interface Mentor {
  id: string;
  profile_id: string;
  verified: boolean;
  hourly_rate_usd: number;
  specializations: string[];
  years_experience: number | null;
  company: string | null;
  rating: number | null;
  sessions_completed: number | null;
  created_at: string;
  profiles?: Profile;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

export interface Booking {
  id: string;
  candidate_id: string;
  mentor_id: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  session_link: string | null;
  candidate_notes: string | null;
  mentor_feedback: string | null;
  mentor_score: number | null;
  mentor_rate_usd?: number | null;
  mentor_earning_usd?: number | null;
  stripe_payment_id: string | null;
  created_at: string;
  updated_at: string;
  mentors?: Mentor & { profiles: Profile };
  profiles?: Profile;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Tier access control ──────────────────────────────────────────────────────

export const TIER_ALLOWS_MODE: Record<SubscriptionTier, InterviewMode[]> = {
  free:     ['free'],
  standard: ['free', 'audio'],
  premium:  ['free', 'audio', 'video'],
  human:    ['free', 'audio', 'video', 'human'],
};

export const JOB_ROLE_LABELS: Record<JobRole, string> = {
  fullstack:    'Full-Stack',
  backend:      'Backend',
  frontend:     'Frontend',
  mobile:       'Mobile Dev',
  devops:       'DevOps / SRE',
  system_design:'System Design',
  data_engineer:'Data Engineer',
  ml_engineer:  'ML Engineer',
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
