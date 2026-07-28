import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, Star, Briefcase, MapPin, Search, Filter, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browse Mentors',
  description: 'Book a 1-on-1 mock interview with senior Palestinian tech engineers',
};

const SPECIALIZATION_COLORS: Record<string, string> = {
  React:      'rgba(0,229,255,0.12)',
  'Node.js':  'rgba(0,255,102,0.12)',
  Python:     'rgba(124,58,237,0.12)',
  TypeScript: 'rgba(0,102,255,0.12)',
  Go:         'rgba(0,229,255,0.12)',
  DevOps:     'rgba(251,191,36,0.12)',
  AWS:        'rgba(251,191,36,0.12)',
  Docker:     'rgba(0,229,255,0.12)',
  Default:    'rgba(255,255,255,0.06)',
};

export default async function MentorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: mentors } = await supabase
    .from('mentors')
    .select(`
      id, verified, hourly_rate_usd, specializations, years_experience,
      company, rating, sessions_completed,
      profiles(full_name, avatar_url, bio, title)
    `)
    .eq('verified', true)
    .order('rating', { ascending: false });

  const displayMentors = (mentors && mentors.length > 0) ? mentors : MOCK_MENTORS;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <div className="badge-purple mb-3 inline-flex">
          <Users className="w-3 h-3" />
          1-on-1 Mentorship
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Browse Mentors</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Book a real mock interview with verified senior engineers from Palestinian tech companies
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            id="mentor-search"
            type="text"
            placeholder="Search by name, skill, or company…"
            className="input-dark pl-10"
          />
        </div>
        <button id="btn-filter-mentors" className="btn-ghost flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Mentor Grid */}
      {displayMentors.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-lg font-semibold text-white mb-2">No mentors yet</p>
          <p style={{ color: 'var(--text-secondary)' }}>Mentors are being verified and will appear here soon.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayMentors.map((mentor: any) => {
            const profile = mentor.profiles ?? mentor;
            const rating  = mentor.rating ?? 5.0;
            const sessions = mentor.sessions_completed ?? 0;
            const rate    = mentor.hourly_rate_usd ?? 35;

            return (
              <div key={mentor.id} className="card card-hover rounded-2xl p-6 flex flex-col">
                {/* Avatar & Name */}
                <div className="flex items-start gap-4 mb-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,229,255,0.3))' }}>
                      {(profile.full_name ?? 'M').charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{profile.full_name ?? 'Anonymous Mentor'}</h3>
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{profile.title ?? 'Senior Engineer'}</p>
                    {mentor.company && (
                      <div className="flex items-center gap-1 mt-1">
                        <Briefcase className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{mentor.company}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-4 py-3 rounded-xl px-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
                      <span className="text-sm font-bold text-white">{rating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Rating</div>
                  </div>
                  <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{sessions}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Sessions</div>
                  </div>
                  <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="text-center">
                    <div className="text-sm font-bold" style={{ color: '#A78BFA' }}>${rate}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>/ session</div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {profile.bio}
                  </p>
                )}

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                  {(mentor.specializations ?? []).slice(0, 5).map((s: string) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{
                        background: SPECIALIZATION_COLORS[s] ?? SPECIALIZATION_COLORS.Default,
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={`/mentors/${mentor.id}`}
                  id={`btn-book-mentor-${mentor.id}`}
                  className="btn-ghost w-full justify-center text-sm"
                  style={{ border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}
                >
                  View Profile & Book
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Mock data for demo when no real mentors exist ─────────────────────────────
const MOCK_MENTORS = [
  {
    id: 'mock-1',
    verified: true,
    hourly_rate_usd: 35,
    specializations: ['React', 'TypeScript', 'Next.js', 'Node.js'],
    years_experience: 7,
    company: 'Exalt Technologies',
    rating: 4.9,
    sessions_completed: 48,
    profiles: {
      full_name: 'Ahmad Al-Khalil',
      avatar_url: null,
      bio: 'Senior Full-Stack Engineer at Exalt with 7 years building enterprise SaaS products. Passionate about helping junior devs in Palestine land their first job.',
      title: 'Senior Full-Stack Engineer',
    },
  },
  {
    id: 'mock-2',
    verified: true,
    hourly_rate_usd: 40,
    specializations: ['Python', 'Django', 'AWS', 'Docker', 'PostgreSQL'],
    years_experience: 9,
    company: 'Asal Technologies',
    rating: 5.0,
    sessions_completed: 63,
    profiles: {
      full_name: 'Lina Barakat',
      avatar_url: null,
      bio: 'Backend architect specializing in cloud-native systems. I focus on system design and scalability — the skills Palestinian engineers need most for remote roles.',
      title: 'Backend Architect',
    },
  },
  {
    id: 'mock-3',
    verified: true,
    hourly_rate_usd: 30,
    specializations: ['React Native', 'Flutter', 'iOS', 'Android'],
    years_experience: 5,
    company: 'PalTech',
    rating: 4.8,
    sessions_completed: 31,
    profiles: {
      full_name: 'Yousef Mansour',
      avatar_url: null,
      bio: 'Mobile dev lead with experience shipping apps used by hundreds of thousands of users. I help you crack mobile interview questions and build a strong portfolio.',
      title: 'Mobile Lead Engineer',
    },
  },
  {
    id: 'mock-4',
    verified: true,
    hourly_rate_usd: 45,
    specializations: ['DevOps', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    years_experience: 10,
    company: 'Bisan Systems',
    rating: 4.9,
    sessions_completed: 55,
    profiles: {
      full_name: 'Sara Nasser',
      avatar_url: null,
      bio: 'DevOps engineer with a decade of infrastructure experience. I specialize in interview coaching for SRE and cloud roles at international companies.',
      title: 'Senior DevOps Engineer',
    },
  },
  {
    id: 'mock-5',
    verified: true,
    hourly_rate_usd: 50,
    specializations: ['System Design', 'Go', 'gRPC', 'Distributed Systems'],
    years_experience: 12,
    company: 'Remote — Google',
    rating: 5.0,
    sessions_completed: 72,
    profiles: {
      full_name: 'Khaled Odeh',
      avatar_url: null,
      bio: 'Palestinian engineer at Google. I conduct system design deep-dives and help candidates prepare for FAANG-level interviews. Limited spots available.',
      title: 'Staff Software Engineer',
    },
  },
  {
    id: 'mock-6',
    verified: true,
    hourly_rate_usd: 32,
    specializations: ['Vue.js', 'React', 'TypeScript', 'CSS', 'Figma'],
    years_experience: 6,
    company: 'Jawwal',
    rating: 4.7,
    sessions_completed: 29,
    profiles: {
      full_name: 'Nour Haddad',
      avatar_url: null,
      bio: 'Frontend engineer passionate about UI/UX and accessibility. I help candidates build beautiful portfolios and ace frontend coding challenges.',
      title: 'Senior Frontend Engineer',
    },
  },
];
