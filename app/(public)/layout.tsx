import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Simple nav */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(5,6,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container-page flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF66, #00E5FF)', boxShadow: '0 0 16px rgba(0,255,102,0.35)' }}>
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white text-lg">InterviewAI</span>
            <span className="badge-green hidden sm:inline-flex">Palestine</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>Home</Link>
            <Link href="/mentors-public" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>Mentors</Link>
            <Link href="/companies" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>Companies</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Sign In</Link>
            <Link href="/signup" className="btn-neon-green" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Get Started</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
