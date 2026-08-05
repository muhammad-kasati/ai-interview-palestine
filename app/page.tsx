import Link from 'next/link';
import type { Metadata } from 'next';
import { Zap, Mic, Video, Users, Star, ArrowRight, CheckCircle, Code2, Brain, Globe, Shield, Building2, MapPin, ChevronRight, Award, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'InterviewAI Palestine — AI Mock Interview Platform',
  description: 'Ace your next tech interview with AI-powered mock sessions and real 1-on-1 coaching from senior Palestinian engineers.',
};

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'var(--text-secondary)',
    borderColor: 'rgba(255,255,255,0.08)',
    badgeClass: 'badge-green',
    badge: 'Start Here',
    Icon: Brain,
    iconColor: 'var(--text-secondary)',
    features: ['Text-based AI Q&A', '5 sessions/month', 'Basic feedback report', 'Community access'],
    cta: 'Start Free',
    ctaClass: 'btn-ghost',
    href: '/signup',
  },
  {
    name: 'Standard',
    price: '$19',
    period: 'per month',
    color: 'var(--neon-green)',
    borderColor: 'rgba(0,255,102,0.25)',
    badgeClass: 'badge-green',
    badge: 'Most Popular',
    Icon: Mic,
    iconColor: 'var(--neon-green)',
    features: ['Real-time Audio AI (Vapi)', 'Unlimited sessions', 'Detailed evaluation scores', 'Resume parsing by Gemini', 'Role-specific questions'],
    cta: 'Go Standard',
    ctaClass: 'btn-neon-green',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$49',
    period: 'per month',
    color: 'var(--neon-cyan)',
    borderColor: 'rgba(0,229,255,0.25)',
    badgeClass: 'badge-cyan',
    badge: 'Best Quality',
    Icon: Video,
    iconColor: 'var(--neon-cyan)',
    features: ['Face-to-Face Video Avatar (Tavus)', 'Live code editor panel', 'All Standard features', 'Priority feedback (24h)', 'System Design mock'],
    cta: 'Go Premium',
    ctaClass: 'btn-cyan',
    href: '/signup',
  },
  {
    name: 'Human',
    price: '$35',
    period: 'per session',
    color: '#A78BFA',
    borderColor: 'rgba(124,58,237,0.25)',
    badgeClass: 'badge-purple',
    badge: '1-on-1 Coaching',
    Icon: Users,
    iconColor: '#A78BFA',
    features: ['Senior Palestinian engineers', 'Verified tech company mentors', 'Flexible scheduling', 'Written session report', 'Career path guidance'],
    cta: 'Book a Mentor',
    ctaClass: 'btn-ghost',
    href: '/signup',
  },
];

const steps = [
  { step: '01', title: 'Upload your Resume', desc: 'Gemini AI parses your CV and extracts your tech skills, experience, and background automatically.', Icon: Brain },
  { step: '02', title: 'Customize your Session', desc: 'Pick your job role, experience level, target market, and choose your preferred interview format.', Icon: Code2 },
  { step: '03', title: 'Practice & Get Feedback', desc: 'Complete a real-time AI interview or book a 1-on-1 session with a Palestinian senior engineer.', Icon: Star },
];

const features = [
  { Icon: Brain,  title: 'Gemini-Powered Questions',      desc: 'Tailored technical questions based on your resume, role, and seniority level.' },
  { Icon: Mic,    title: 'Real-Time Voice Interviews',    desc: 'Ultra-low-latency audio AI via Vapi.ai — just talk like a real interview.' },
  { Icon: Video,  title: 'Face-to-Face Video Avatar',     desc: 'Lifelike AI interviewer via Tavus CVI for the most realistic prep experience.' },
  { Icon: Users,  title: 'Human Mentor Network',          desc: 'Verified engineers from Gaza, Ramallah, Nablus, and top remote Palestinian teams.' },
  { Icon: Globe,  title: 'Palestine Market Focus',        desc: 'Questions and context tailored for local tech companies and global remote roles.' },
  { Icon: Shield, title: 'Detailed Evaluation Reports',  desc: 'Score breakdown across technical, communication, and problem-solving dimensions.' },
];

const companies = [
  { name: 'Exalt Technologies', city: 'Ramallah', specialty: 'Enterprise Software' },
  { name: 'Asal Technologies', city: 'Ramallah', specialty: 'Digital Solutions' },
  { name: 'Bisan Systems', city: 'Ramallah', specialty: 'ERP & HR Software' },
  { name: 'PalTech', city: 'Gaza', specialty: 'Mobile Apps' },
  { name: 'Jawwal', city: 'Gaza', specialty: 'Telecommunications' },
  { name: 'Makeen', city: 'Ramallah', specialty: 'Innovation & NGOs' },
  { name: 'TechPal', city: 'Nablus', specialty: 'Web & Mobile' },
  { name: 'SKY Information', city: 'Ramallah', specialty: 'AI & Data' },
];

const mentors = [
  { name: 'Ahmad Khalil', role: 'Senior Full-Stack Engineer', company: 'Exalt Technologies', rating: 4.9, sessions: 128, specialties: ['React', 'Node.js', 'AWS'], avatar: 'AK' },
  { name: 'Sara Mansour', role: 'Lead Backend Developer', company: 'Asal Technologies', rating: 4.8, sessions: 94, specialties: ['Python', 'Django', 'PostgreSQL'], avatar: 'SM' },
  { name: 'Omar Nasser', role: 'DevOps & Cloud Architect', company: 'Jawwal', rating: 5.0, sessions: 67, specialties: ['Docker', 'Kubernetes', 'AWS'], avatar: 'ON' },
  { name: 'Lina Barakat', role: 'Mobile Developer', company: 'PalTech', rating: 4.7, sessions: 112, specialties: ['React Native', 'Flutter', 'Firebase'], avatar: 'LB' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(5,6,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container-page flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF66, #00E5FF)', boxShadow: '0 0 16px rgba(0,255,102,0.35)' }}>
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white text-lg">InterviewAI</span>
            <span className="badge-green hidden sm:inline-flex">Palestine</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#how-it-works" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>How it works</a>
            <a href="#pricing" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Pricing</a>
            <Link href="/mentors-public" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Mentors</Link>
            <Link href="/companies" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Companies</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Sign In</Link>
            <Link href="/signup" className="btn-neon-green" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        {/* Background glows */}
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20" style={{ background: 'radial-gradient(ellipse, rgba(0,255,102,0.3) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.4) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div className="container-page relative">
          {/* Top badge */}
          <div className="flex justify-center mb-8">
            <span className="badge-green">
              <span className="pulse-dot" />
              AI-Powered · Live Now
            </span>
          </div>

          <h1 className="text-center font-black leading-[1.06] tracking-tight mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', maxWidth: '900px', margin: '0 auto 1.5rem' }}>
            Ace Every Tech Interview{' '}
            <span className="shimmer-text">in Palestine</span>
          </h1>

          <p className="text-center max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.375rem)', color: 'var(--text-secondary)' }}>
            Practice with a real-time AI interviewer powered by Gemini, Vapi &amp; Tavus.
            Then book a 1-on-1 session with a senior engineer from a local Palestinian tech company.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup" className="btn-neon-green" style={{ padding: '0.9rem 2.25rem', fontSize: '1.125rem' }}>
              Start Practicing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#pricing" className="btn-ghost" style={{ padding: '0.9rem 2.25rem', fontSize: '1.125rem' }}>
              See Pricing
            </Link>
          </div>

          {/* ── Hero: Side-by-side images ── */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
            {/* Left — Robot Interviewer */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-30" style={{ background: 'radial-gradient(circle at center, var(--neon-green) 0%, var(--neon-cyan) 50%, transparent 75%)', filter: 'blur(50px)' }} />
              <div className="relative rounded-3xl overflow-hidden p-2" style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.3), rgba(0,229,255,0.3), rgba(124,58,237,0.3))', boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }}>
                <img
                  src="/robot_interviewer.png"
                  alt="AI Robot Interviewer"
                  className="w-full h-auto rounded-2xl object-cover animate-float"
                  style={{ maxHeight: '380px', objectPosition: 'center' }}
                />
                <div className="absolute bottom-6 left-6 right-6 glass p-3 rounded-xl flex items-center justify-between text-left border" style={{ borderColor: 'rgba(0,255,102,0.3)' }}>
                  <div className="flex items-center gap-3">
                    <span className="pulse-dot" />
                    <div>
                      <div className="text-sm font-bold text-white">AI Robot Interviewer</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Technical, Behavioral &amp; System Design</div>
                    </div>
                  </div>
                  <span className="badge-green text-xs">Live Engine</span>
                </div>
              </div>
            </div>

            {/* Right — AI Feedback Card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-25" style={{ background: 'radial-gradient(circle at center, var(--neon-cyan) 0%, #A78BFA 50%, transparent 75%)', filter: 'blur(50px)' }} />
              <div className="relative rounded-3xl overflow-hidden p-2" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.25), rgba(124,58,237,0.25), rgba(0,255,102,0.15))', boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }}>
                <img
                  src="/ai_feedback_card.png"
                  alt="AI Interview Feedback Card"
                  className="w-full h-auto rounded-2xl object-cover"
                  style={{ maxHeight: '380px', objectFit: 'cover', objectPosition: 'top' }}
                />
                <div className="absolute bottom-6 left-6 right-6 glass p-3 rounded-xl flex items-center justify-between text-left border" style={{ borderColor: 'rgba(0,229,255,0.3)' }}>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
                    <div>
                      <div className="text-sm font-bold text-white">AI Feedback Report</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Scores, strengths &amp; improvement areas</div>
                    </div>
                  </div>
                  <span className="badge-cyan text-xs">Instant</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {[
              { value: '500+', label: 'Engineers Prepared' },
              { value: '50+',  label: 'Verified Mentors' },
              { value: '4.9',  label: 'Average Rating' },
              { value: '3',    label: 'AI Modes' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-black mb-1" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--neon-green)', textShadow: '0 0 20px rgba(0,255,102,0.4)' }}>{value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interview Modes Preview ────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-cyan mb-4 inline-flex">Interview Modes</span>
            <h2 className="font-bold text-white mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Choose your practice format</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)' }}>From text chat to face-to-face video — we have an interview mode for every budget</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { Icon: Brain,  title: 'Text AI',       desc: 'Chat-based Q&A with Gemini', badge: 'Free', badgeClass: 'badge-green',  glow: 'rgba(0,255,102,0.08)',  border: 'rgba(0,255,102,0.15)',  iconColor: 'var(--neon-green)', href: '/signup' },
              { Icon: Mic,    title: 'Audio AI',      desc: 'Real-time voice with Vapi',  badge: 'Standard', badgeClass: 'badge-green', glow: 'rgba(0,255,102,0.06)', border: 'rgba(0,255,102,0.12)', iconColor: 'var(--neon-green)', href: '/signup' },
              { Icon: Video,  title: 'Video Avatar',  desc: 'Face-to-face with Tavus',    badge: 'Premium', badgeClass: 'badge-cyan',  glow: 'rgba(0,229,255,0.08)',  border: 'rgba(0,229,255,0.15)',  iconColor: 'var(--neon-cyan)', href: '/signup' },
              { Icon: Users,  title: 'Human Coach',   desc: '1-on-1 with a real engineer',badge: 'Human', badgeClass: 'badge-purple',  glow: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)', iconColor: '#A78BFA', href: '/mentors-public' },
            ].map(({ Icon, title, desc, badge, badgeClass, glow, border, iconColor, href }) => (
              <Link key={title} href={href} className="card card-hover rounded-2xl p-6 block transition-transform hover:-translate-y-1" style={{ background: glow, border: `1px solid ${border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${glow.replace('0.08', '0.15')}` }}>
                  <Icon className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <div className={`${badgeClass} mb-3 text-xs`}>{badge}</div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                <div className="flex items-center gap-1 mt-4 text-xs" style={{ color: iconColor }}>
                  <span>Get started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section id="features" className="section">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-green mb-4 inline-flex">Platform Features</span>
            <h2 className="font-bold text-white mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Everything you need to land the job</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="card card-hover rounded-2xl p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(0,255,102,0.1)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--neon-green)' }} />
                </div>
                <h3 className="font-semibold text-white mb-2" style={{ fontSize: '1rem' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="section">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-cyan mb-4 inline-flex">Simple Process</span>
            <h2 className="font-bold text-white mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Get interview-ready in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc, Icon }, i) => (
              <div key={step} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px" style={{ background: 'linear-gradient(90deg, rgba(0,255,102,0.3), transparent)' }} />
                )}
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.2)' }}>
                  <Icon className="w-7 h-7" style={{ color: 'var(--neon-green)' }} />
                </div>
                <div className="text-xs font-bold mb-3" style={{ color: 'var(--neon-green)', letterSpacing: '0.1em' }}>STEP {step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mentors Showcase ───────────────────────────────────────────────── */}
      <section id="mentors" className="section">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="badge-purple mb-4 inline-flex">Human Coaches</span>
              <h2 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Meet our Palestinian mentors</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>Senior engineers ready to coach you for your next opportunity</p>
            </div>
            <Link href="/mentors-public" className="btn-ghost shrink-0">
              View all mentors <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mentors.map(({ name, role, company, rating, sessions, specialties, avatar }) => (
              <div key={name} className="card card-hover rounded-2xl p-6 flex flex-col" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 font-black text-lg" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,229,255,0.3))', color: 'white' }}>
                  {avatar}
                </div>
                <h3 className="font-bold text-white">{name}</h3>
                <p className="text-xs mt-0.5 mb-1" style={{ color: 'var(--text-secondary)' }}>{role}</p>
                <p className="text-xs mb-3" style={{ color: '#A78BFA' }}>{company}</p>
                <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ color: '#FBBF24' }} /> {rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sessions} sessions
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                  {specialties.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA' }}>{s}</span>
                  ))}
                </div>
                <Link href="/signup" className="btn-ghost text-xs py-2 w-full justify-center">
                  Book Session
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Palestinian Companies ──────────────────────────────────────────── */}
      <section id="companies" className="section">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="badge-cyan mb-4 inline-flex">🇵🇸 Palestine Companies</span>
              <h2 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Practice for top Palestinian companies</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>Company-specific interview questions tailored to each firm&apos;s tech stack and culture</p>
            </div>
            <Link href="/companies" className="btn-ghost shrink-0">
              View all companies <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map(({ name, city, specialty }) => (
              <Link key={name} href="/companies" className="card card-hover rounded-2xl p-5 block group" style={{ border: '1px solid rgba(0,229,255,0.1)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,229,255,0.1)' }}>
                  <Building2 className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{name}</h3>
                <div className="flex items-center gap-1 mb-2" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{city}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--neon-cyan)' }}>{specialty}</span>
                <div className="flex items-center gap-1 mt-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--neon-cyan)' }}>
                  <span>Practice now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="section">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-green mb-4 inline-flex">Transparent Pricing</span>
            <h2 className="font-bold text-white mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>Choose your tier</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)' }}>Start free, upgrade when you&apos;re ready</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map(({ name, price, period, color, borderColor, badge, badgeClass, Icon, iconColor, features: tierFeatures, cta, ctaClass, href, highlighted }) => (
              <div
                key={name}
                className="card rounded-2xl p-6 flex flex-col"
                style={{
                  border: `1px solid ${borderColor}`,
                  background: highlighted ? 'rgba(0,255,102,0.04)' : 'var(--bg-card)',
                  boxShadow: highlighted ? '0 0 40px rgba(0,255,102,0.08)' : 'none',
                  position: 'relative',
                }}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-green text-xs">★ Most Popular</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${borderColor.replace('0.25', '0.12')}` }}>
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                  </div>
                  <div>
                    <div className="font-bold text-white">{name}</div>
                    <div className={`${badgeClass} text-xs`}>{badge}</div>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="font-black" style={{ fontSize: '2.25rem', color }}>{price}</span>
                  <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/ {period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {tierFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`${ctaClass} w-full justify-center text-center`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <div className="rounded-3xl p-12 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.06) 0%, rgba(0,229,255,0.06) 100%)', border: '1px solid rgba(0,255,102,0.15)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]" style={{ background: 'radial-gradient(ellipse, rgba(0,255,102,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <h2 className="font-black text-white mb-4 relative" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>Ready to land your dream job?</h2>
            <p className="relative mb-8" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Join 500+ Palestinian engineers who are interview-ready and confident.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <Link href="/signup" className="btn-neon-green" style={{ padding: '0.9rem 2.5rem', fontSize: '1.125rem' }}>
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/mentors-public" className="btn-ghost" style={{ padding: '0.9rem 2.5rem', fontSize: '1.125rem' }}>
                Browse Mentors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 0' }}>
        <div className="container-page">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF66, #00E5FF)' }}>
                  <Zap className="w-3.5 h-3.5 text-black" />
                </div>
                <span className="font-bold text-white text-sm">InterviewAI Palestine</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>AI-powered interview prep platform for Palestinian tech talent.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'How it works'].map((item) => (
                  <li key={item}><a href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-xs hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Community</h4>
              <ul className="space-y-2">
                {[{ label: 'Mentors', href: '/mentors-public' }, { label: 'Companies', href: '/companies' }, { label: 'Sign Up', href: '/signup' }].map((item) => (
                  <li key={item.label}><Link href={item.href} className="text-xs hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>{item.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © 2025 InterviewAI Palestine. Built for the Palestinian tech community. 🇵🇸
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Gemini · Vapi · Tavus</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
