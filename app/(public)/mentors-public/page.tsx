import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, Clock, CheckCircle, ArrowRight, Users, MapPin, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mentors — InterviewAI Palestine',
  description: 'Book a 1-on-1 coaching session with verified senior Palestinian engineers from top tech companies.',
};

const mentors = [
  {
    name: 'Ahmad Khalil',
    role: 'Senior Full-Stack Engineer',
    company: 'Exalt Technologies',
    city: 'Ramallah',
    rating: 4.9,
    sessions: 128,
    rate: 35,
    avatar: 'AK',
    color: '#A78BFA',
    specialties: ['React', 'Node.js', 'AWS', 'TypeScript'],
    bio: 'Senior engineer with 8+ years building enterprise platforms. Former tech lead at Exalt, now coaching candidates targeting FAANG and local market.',
    available: true,
    badge: 'Top Rated',
  },
  {
    name: 'Sara Mansour',
    role: 'Lead Backend Developer',
    company: 'Asal Technologies',
    city: 'Ramallah',
    rating: 4.8,
    sessions: 94,
    rate: 30,
    avatar: 'SM',
    color: 'var(--neon-green)',
    specialties: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    bio: 'Backend specialist focused on distributed systems and cloud architecture. Helping mid-level devs break into senior roles.',
    available: true,
    badge: 'Best Value',
  },
  {
    name: 'Omar Nasser',
    role: 'DevOps & Cloud Architect',
    company: 'Jawwal',
    city: 'Gaza',
    rating: 5.0,
    sessions: 67,
    rate: 40,
    avatar: 'ON',
    color: 'var(--neon-cyan)',
    specialties: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    bio: '10+ years in infrastructure and cloud. Specialized in helping DevOps candidates ace technical system rounds and architecture discussions.',
    available: false,
    badge: 'Expert',
  },
  {
    name: 'Lina Barakat',
    role: 'Mobile Developer',
    company: 'PalTech',
    city: 'Gaza',
    rating: 4.7,
    sessions: 112,
    rate: 28,
    avatar: 'LB',
    color: '#FB923C',
    specialties: ['React Native', 'Flutter', 'Firebase', 'Swift'],
    bio: 'Mobile-first engineer with apps published on App Store and Play Store. Expert in React Native architecture and performance optimization.',
    available: true,
    badge: 'Mobile Expert',
  },
  {
    name: 'Kareem Abu Ali',
    role: 'Data Engineer',
    company: 'SKY Information Systems',
    city: 'Ramallah',
    rating: 4.6,
    sessions: 43,
    rate: 35,
    avatar: 'KA',
    color: '#FBBF24',
    specialties: ['Python', 'Spark', 'Airflow', 'BigQuery'],
    bio: 'Data engineering specialist with experience building real-time pipelines. Helping candidates crack data engineering roles at top tech firms.',
    available: true,
    badge: 'Data Specialist',
  },
  {
    name: 'Yasmine Haddad',
    role: 'Frontend Lead',
    company: 'Makeen',
    city: 'Ramallah',
    rating: 4.9,
    sessions: 86,
    rate: 32,
    avatar: 'YH',
    color: 'var(--neon-green)',
    specialties: ['React', 'Next.js', 'TypeScript', 'Design Systems'],
    bio: 'Frontend lead with deep expertise in accessibility and performance. Known for turning junior developers into confident senior candidates.',
    available: true,
    badge: 'Frontend Expert',
  },
];

const stats = [
  { value: '50+', label: 'Verified Mentors' },
  { value: '1,200+', label: 'Sessions Completed' },
  { value: '4.8', label: 'Average Rating' },
  { value: '92%', label: 'Success Rate' },
];

export default function MentorsPublicPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.4) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="container-page relative text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="badge-purple">
              <Users className="w-3 h-3" />
              Human Coaching Network
            </span>
          </div>

          <h1 className="font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', maxWidth: '800px', margin: '0 auto 1.25rem' }}>
            Learn from <span className="shimmer-text">Palestinian Engineers</span>
          </h1>

          <p className="max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)' }}>
            Book a 1-on-1 coaching session with verified senior engineers from top Palestinian tech companies.
            Get personalized feedback, real industry insights, and targeted interview prep.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-black mb-1" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', color: '#A78BFA', textShadow: '0 0 20px rgba(124,58,237,0.4)' }}>{value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          <Link href="/signup" className="btn-neon-green" style={{ padding: '0.9rem 2.25rem', fontSize: '1.1rem' }}>
            Book Your First Session <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How mentoring works */}
      <section className="section">
        <div className="container-page">
          <div className="text-center mb-10">
            <span className="badge-cyan mb-4 inline-flex">How It Works</span>
            <h2 className="font-bold text-white" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)' }}>Your coaching journey</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Choose a Mentor', desc: 'Browse profiles, specialties, and rates. Filter by tech stack or role.', icon: Users },
              { step: '02', title: 'Book a Session', desc: 'Pick a time that works for you from the mentor\'s availability calendar.', icon: Clock },
              { step: '03', title: 'Join Google Meet', desc: 'A private Google Meet link is sent 1 hour before your session starts.', icon: Zap },
              { step: '04', title: 'Get Feedback', desc: 'Receive a written session report with strengths, gaps, and action plan.', icon: CheckCircle },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Icon className="w-6 h-6" style={{ color: '#A78BFA' }} />
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: '#A78BFA', letterSpacing: '0.1em' }}>STEP {step}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor cards */}
      <section className="section">
        <div className="container-page">
          <div className="mb-8">
            <h2 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Available Mentors</h2>
            <p style={{ color: 'var(--text-secondary)' }}>All mentors are vetted senior engineers with real industry experience</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map(({ name, role, company, city, rating, sessions, rate, avatar, color, specialties, bio, available, badge }) => (
              <div key={name} className="card rounded-2xl p-6 flex flex-col" style={{ border: `1px solid ${available ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0" style={{ background: `${color}22`, color }}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white">{name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{badge}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{role}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{company} · {city}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{bio}</p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {specialties.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>{s}</span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-5 text-sm flex-wrap">
                  <span className="flex items-center gap-1" style={{ color: '#FBBF24' }}>
                    <Star className="w-3.5 h-3.5 fill-current" /> {rating}
                  </span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3.5 h-3.5" /> {sessions} sessions
                  </span>
                  <span className="font-bold" style={{ color }}>
                    ${rate}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>/session</span>
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  {available ? (
                    <Link href="/signup" className="btn-ghost w-full justify-center">
                      Book Session <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="w-full text-center py-2.5 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      Currently Unavailable
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(0,229,255,0.06) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px]" style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <h2 className="font-black text-white mb-4 relative" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>Ready for your coaching session?</h2>
            <p className="relative mb-8" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem' }}>
              Create a free account and book your first session today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <Link href="/signup" className="btn-neon-green" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/companies" className="btn-ghost" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
                Browse Companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2025 InterviewAI Palestine. Built for the Palestinian tech community. 🇵🇸</p>
      </div>
    </div>
  );
}
