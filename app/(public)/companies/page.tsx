import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin, ArrowRight, Users, Code2, ChevronRight, Briefcase, Globe, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Palestinian Tech Companies — InterviewAI Palestine',
  description: 'Practice for specific Palestinian tech companies. Get company-tailored interview questions by position for Exalt, Asal, Bisan, PalTech, and more.',
};

const companies = [
  {
    id: 'exalt',
    name: 'Exalt Technologies',
    nameAr: 'إكسالت تكنولوجيز',
    city: 'Ramallah',
    size: 'Large',
    employees: '300+',
    website: 'https://exalt.net',
    specialty: 'Enterprise Software',
    color: 'var(--neon-cyan)',
    colorBg: 'rgba(0,229,255,0.08)',
    colorBorder: 'rgba(0,229,255,0.2)',
    specializations: ['React', 'Node.js', 'Java', 'AWS', 'DevOps'],
    positions: ['Frontend Developer', 'Backend Developer', 'Full-Stack', 'DevOps Engineer'],
    description: 'Leading software outsourcing company in Palestine, working with Fortune 500 clients globally. Known for rigorous technical interviews focused on system design and performance.',
    questionCount: 48,
  },
  {
    id: 'asal',
    name: 'Asal Technologies',
    nameAr: 'أصال تكنولوجيز',
    city: 'Ramallah',
    size: 'Large',
    employees: '250+',
    website: 'https://asaltech.com',
    specialty: 'Digital Solutions',
    color: 'var(--neon-green)',
    colorBg: 'rgba(0,255,102,0.07)',
    colorBorder: 'rgba(0,255,102,0.2)',
    specializations: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
    positions: ['Python Developer', 'React Developer', 'Data Engineer', 'Cloud Engineer'],
    description: 'Top Palestinian software house specializing in enterprise solutions and digital transformation. Focus on agile teams, clean code, and modern microservices architecture.',
    questionCount: 42,
  },
  {
    id: 'bisan',
    name: 'Bisan Systems',
    nameAr: 'بيسان سيستمز',
    city: 'Ramallah',
    size: 'Medium',
    employees: '100+',
    website: 'https://bisangroup.com',
    specialty: 'ERP & HR Software',
    color: '#FBBF24',
    colorBg: 'rgba(251,191,36,0.07)',
    colorBorder: 'rgba(251,191,36,0.2)',
    specializations: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    positions: ['Java Developer', 'Backend Engineer', 'Database Administrator'],
    description: 'Enterprise ERP and HR software provider across the Arab world. Interviews test deep Java knowledge, database design, and object-oriented principles.',
    questionCount: 35,
  },
  {
    id: 'paltech',
    name: 'PalTech',
    nameAr: 'بال تك',
    city: 'Gaza',
    size: 'Medium',
    employees: '80+',
    website: 'https://paltech.ps',
    specialty: 'Mobile Apps',
    color: '#FB923C',
    colorBg: 'rgba(251,146,60,0.07)',
    colorBorder: 'rgba(251,146,60,0.2)',
    specializations: ['React Native', 'Flutter', 'Firebase', 'Node.js'],
    positions: ['Mobile Developer', 'React Native Dev', 'Flutter Developer', 'Full-Stack'],
    description: 'Mobile-first tech company focusing on apps for the Palestinian and MENA market. Strong focus on UI/UX, performance, and cross-platform expertise.',
    questionCount: 30,
  },
  {
    id: 'jawwal',
    name: 'Jawwal',
    nameAr: 'جوال',
    city: 'Gaza',
    size: 'Large',
    employees: '500+',
    website: 'https://jawwal.ps',
    specialty: 'Telecommunications',
    color: '#A78BFA',
    colorBg: 'rgba(124,58,237,0.07)',
    colorBorder: 'rgba(124,58,237,0.2)',
    specializations: ['Java', 'Oracle', 'Linux', 'AWS', 'Networking'],
    positions: ['Backend Engineer', 'DevOps Engineer', 'Systems Administrator', 'Cloud Architect'],
    description: "Largest Palestinian telecommunications operator. Interviews cover distributed systems, networking concepts, and large-scale infrastructure management.",
    questionCount: 36,
  },
  {
    id: 'makeen',
    name: 'Makeen',
    nameAr: 'مكين',
    city: 'Ramallah',
    size: 'Medium',
    employees: '60+',
    website: 'https://makeen.io',
    specialty: 'Innovation & NGOs',
    color: 'var(--neon-cyan)',
    colorBg: 'rgba(0,229,255,0.06)',
    colorBorder: 'rgba(0,229,255,0.15)',
    specializations: ['React', 'TypeScript', 'Python', 'PostgreSQL'],
    positions: ['Frontend Developer', 'Backend Developer', 'Full-Stack Engineer'],
    description: 'Digital innovation company building solutions for NGOs and government institutions. Collaborative culture with emphasis on impact-driven development.',
    questionCount: 28,
  },
  {
    id: 'techpal',
    name: 'TechPal',
    nameAr: 'تك بال',
    city: 'Nablus',
    size: 'Small',
    employees: '30+',
    website: 'https://techpal.ps',
    specialty: 'Web & Mobile',
    color: 'var(--neon-green)',
    colorBg: 'rgba(0,255,102,0.06)',
    colorBorder: 'rgba(0,255,102,0.15)',
    specializations: ['Vue.js', 'Laravel', 'MySQL', 'DevOps'],
    positions: ['Frontend Developer', 'Laravel Developer', 'Full-Stack'],
    description: 'Agile startup delivering web and mobile applications for regional clients. Great place for junior developers who want to grow fast in a startup environment.',
    questionCount: 22,
  },
  {
    id: 'sky',
    name: 'SKY Information Systems',
    nameAr: 'سكاي',
    city: 'Ramallah',
    size: 'Medium',
    employees: '90+',
    website: 'https://skyinfo.ps',
    specialty: 'AI & Data Science',
    color: '#FBBF24',
    colorBg: 'rgba(251,191,36,0.06)',
    colorBorder: 'rgba(251,191,36,0.15)',
    specializations: ['Python', 'Machine Learning', 'Data Science', 'AWS'],
    positions: ['Data Scientist', 'ML Engineer', 'Data Engineer', 'Python Developer'],
    description: 'Data analytics and AI consulting firm serving the public sector and NGOs. Strong ML engineering culture with emphasis on reproducible research and MLOps.',
    questionCount: 32,
  },
];

const cityColors: Record<string, string> = {
  'Ramallah': 'var(--neon-green)',
  'Gaza': 'var(--neon-cyan)',
  'Nablus': '#A78BFA',
};

export default function CompaniesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.35) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="container-page relative text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="badge-cyan">
              🇵🇸 Palestinian Tech Ecosystem
            </span>
          </div>

          <h1 className="font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', maxWidth: '800px', margin: '0 auto 1.25rem' }}>
            Practice for <span className="shimmer-text">Real Companies</span>
          </h1>

          <p className="max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-secondary)' }}>
            Company-specific interview questions tailored to each firm&apos;s tech stack, culture, and hiring process.
            Know exactly what to expect before you walk in.
          </p>

          {/* City filters visual */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {Object.entries(cityColors).map(([city, color]) => (
              <div key={city} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{city}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 mb-10">
            {[
              { value: '8+', label: 'Top Companies' },
              { value: '270+', label: 'Interview Questions' },
              { value: '15+', label: 'Positions Covered' },
              { value: '3', label: 'Cities' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-black mb-1" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2rem)', color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0,229,255,0.4)' }}>{value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies grid */}
      <section className="section">
        <div className="container-page">
          <div className="mb-8">
            <h2 className="font-bold text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>All Companies</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Choose a company to start practicing company-specific interview questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {companies.map(({ id, name, nameAr, city, size, employees, specialty, color, colorBg, colorBorder, specializations, positions, description, questionCount }) => (
              <div key={id} className="card rounded-2xl p-6 flex flex-col" style={{ background: colorBg, border: `1px solid ${colorBorder}` }}>
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Building2 className="w-6 h-6" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-white">{name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{nameAr}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full shrink-0" style={{ background: `${color}15`, color }}>{specialty}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <MapPin className="w-3 h-3" /> {city}
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Users className="w-3 h-3" /> {employees} employees · {size}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{description}</p>

                {/* Tech Stack */}
                <div className="mb-4">
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>TECH STACK</div>
                  <div className="flex flex-wrap gap-1.5">
                    {specializations.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Positions */}
                <div className="mb-5">
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>OPEN POSITIONS TO PRACTICE</div>
                  <div className="flex flex-wrap gap-1.5">
                    {positions.map((p) => (
                      <span key={p} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}10`, color }}>
                        <Briefcase className="w-2.5 h-2.5" />{p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Code2 className="w-3.5 h-3.5" /> {questionCount} interview questions
                  </div>
                  <Link href={`/signup?company=${id}`} className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5">
                    Practice Now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon banner */}
      <section className="section">
        <div className="container-page">
          <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06) 0%, rgba(0,255,102,0.04) 100%)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
                <Globe className="w-7 h-7" style={{ color: 'var(--neon-cyan)' }} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-white text-lg mb-1">More companies coming soon</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We&apos;re continuously adding company-specific question banks. Know a Palestinian tech company we should include? Let us know.
                </p>
              </div>
              <Link href="/signup" className="btn-cyan shrink-0">
                <Zap className="w-4 h-4" /> Get Notified
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="rounded-3xl p-10 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.06) 0%, rgba(0,229,255,0.06) 100%)', border: '1px solid rgba(0,255,102,0.15)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px]" style={{ background: 'radial-gradient(ellipse, rgba(0,255,102,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            <h2 className="font-black text-white mb-4 relative" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
              Start practicing for your dream company
            </h2>
            <p className="relative mb-8" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem' }}>
              Create a free account and access company-specific interview questions today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <Link href="/signup" className="btn-neon-green" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/mentors-public" className="btn-ghost" style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem' }}>
                Browse Mentors
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
