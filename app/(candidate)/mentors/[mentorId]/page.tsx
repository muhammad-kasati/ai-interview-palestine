import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MentorProfileClient from './_components/MentorProfileClient';

type Props = { params: Promise<{ mentorId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mentorId } = await params;
  const supabase = await createClient();
  const { data: mentor } = await supabase
    .from('mentors')
    .select('profiles(full_name, title)')
    .eq('id', mentorId)
    .single();
  const profile = (mentor?.profiles as any);
  return {
    title: profile?.full_name ? `${profile.full_name} — Mentor Profile` : 'Mentor Profile',
    description: `Book a 1-on-1 mock interview session with ${profile?.full_name ?? 'this mentor'}.`,
  };
}

export default async function MentorProfilePage({ params }: Props) {
  const { mentorId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Handle mock IDs for demo
  const isMock = mentorId.startsWith('mock-');

  let mentor: any = null;

  if (!isMock) {
    const { data } = await supabase
      .from('mentors')
      .select(`
        id, verified, hourly_rate_usd, specializations, years_experience,
        company, rating, sessions_completed,
        profiles(id, full_name, avatar_url, bio, title, linkedin_url, github_url)
      `)
      .eq('id', mentorId)
      .eq('verified', true)
      .single();

    if (!data) notFound();
    mentor = data;
  } else {
    // Use mock data for demo
    mentor = MOCK_MENTOR_DETAIL[mentorId] ?? null;
    if (!mentor) notFound();
  }

  // Get mentor's availability
  const availability = !isMock
    ? (await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_active', true)
        .order('day_of_week')
      ).data ?? []
    : MOCK_AVAILABILITY;

  // Fetch candidate subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return (
    <MentorProfileClient
      mentor={mentor}
      availability={availability}
      candidateId={user.id}
      candidateTier={subscription?.tier ?? 'free'}
    />
  );
}

// ── Mock detail data ──────────────────────────────────────────────────────────
const MOCK_MENTOR_DETAIL: Record<string, any> = {
  'mock-1': {
    id: 'mock-1', verified: true, hourly_rate_usd: 35,
    specializations: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL'],
    years_experience: 7, company: 'Exalt Technologies', rating: 4.9, sessions_completed: 48,
    profiles: { id: 'p1', full_name: 'Ahmad Al-Khalil', avatar_url: null, title: 'Senior Full-Stack Engineer',
      bio: 'Senior Full-Stack Engineer at Exalt Technologies with 7 years building enterprise SaaS products. I specialize in React/Node.js architecture and have helped 48+ Palestinian engineers land their first jobs at local and remote companies. I focus on real-world interview scenarios that Palestinian companies actually use.',
      linkedin_url: null, github_url: null },
  },
  'mock-2': {
    id: 'mock-2', verified: true, hourly_rate_usd: 40,
    specializations: ['Python', 'Django', 'AWS', 'Docker', 'PostgreSQL', 'System Design'],
    years_experience: 9, company: 'Asal Technologies', rating: 5.0, sessions_completed: 63,
    profiles: { id: 'p2', full_name: 'Lina Barakat', avatar_url: null, title: 'Backend Architect',
      bio: 'Backend architect at Asal Technologies specializing in cloud-native systems and distributed architectures. With 9 years of experience, I focus on system design and scalability — the most in-demand skills for senior remote roles. My candidates consistently receive offers from European and North American companies.',
      linkedin_url: null, github_url: null },
  },
  'mock-3': {
    id: 'mock-3', verified: true, hourly_rate_usd: 30,
    specializations: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
    years_experience: 5, company: 'PalTech', rating: 4.8, sessions_completed: 31,
    profiles: { id: 'p3', full_name: 'Yousef Mansour', avatar_url: null, title: 'Mobile Lead Engineer',
      bio: 'Mobile development lead at PalTech with experience shipping apps used by hundreds of thousands of users across the MENA region. I help candidates build strong mobile portfolios and crack the most common React Native and Flutter interview questions.',
      linkedin_url: null, github_url: null },
  },
  'mock-4': {
    id: 'mock-4', verified: true, hourly_rate_usd: 45,
    specializations: ['DevOps', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    years_experience: 10, company: 'Bisan Systems', rating: 4.9, sessions_completed: 55,
    profiles: { id: 'p4', full_name: 'Sara Nasser', avatar_url: null, title: 'Senior DevOps Engineer',
      bio: 'DevOps engineer with a decade of infrastructure experience across Bisan Systems and international consulting projects. I specialize in interview coaching for SRE, cloud, and DevOps roles at international tech companies. My sessions cover Kubernetes, AWS architecture, and infrastructure-as-code.',
      linkedin_url: null, github_url: null },
  },
  'mock-5': {
    id: 'mock-5', verified: true, hourly_rate_usd: 50,
    specializations: ['System Design', 'Go', 'gRPC', 'Distributed Systems', 'Algorithms'],
    years_experience: 12, company: 'Remote — Google', rating: 5.0, sessions_completed: 72,
    profiles: { id: 'p5', full_name: 'Khaled Odeh', avatar_url: null, title: 'Staff Software Engineer',
      bio: 'Palestinian Staff Engineer at Google. I conduct intensive system design deep-dives and algorithm sessions, helping candidates prepare for FAANG-level interviews. I have limited availability — book early. My sessions are high-intensity and results-driven.',
      linkedin_url: null, github_url: null },
  },
  'mock-6': {
    id: 'mock-6', verified: true, hourly_rate_usd: 32,
    specializations: ['Vue.js', 'React', 'TypeScript', 'CSS', 'Figma', 'Accessibility'],
    years_experience: 6, company: 'Jawwal', rating: 4.7, sessions_completed: 29,
    profiles: { id: 'p6', full_name: 'Nour Haddad', avatar_url: null, title: 'Senior Frontend Engineer',
      bio: 'Frontend engineer at Jawwal passionate about UI/UX and web accessibility. I help candidates build beautiful portfolios and ace frontend coding challenges. My sessions cover React patterns, CSS architecture, performance optimization, and the frontend interview questions that Palestinian and remote companies love asking.',
      linkedin_url: null, github_url: null },
  },
};

const MOCK_AVAILABILITY = [
  { id: 'a1', mentor_id: 'mock-1', day_of_week: 1, start_time: '09:00', end_time: '17:00', timezone: 'Asia/Jerusalem', is_active: true },
  { id: 'a2', mentor_id: 'mock-1', day_of_week: 3, start_time: '09:00', end_time: '17:00', timezone: 'Asia/Jerusalem', is_active: true },
  { id: 'a3', mentor_id: 'mock-1', day_of_week: 5, start_time: '10:00', end_time: '14:00', timezone: 'Asia/Jerusalem', is_active: true },
];
