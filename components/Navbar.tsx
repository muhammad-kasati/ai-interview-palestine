'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Zap, LayoutDashboard, Video, Users, LogOut,
  Menu, X, ChevronDown, Shield, Star, Clock, User, Calendar
} from 'lucide-react';

interface NavbarProps {
  userRole?: 'candidate' | 'mentor' | 'admin';
  userName?: string;
  avatarUrl?: string | null;
}

export default function Navbar({ userRole = 'candidate', userName, avatarUrl }: NavbarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const candidateLinks = [
    { href: '/dashboard',          label: 'Dashboard',   Icon: LayoutDashboard },
    { href: '/interview/new',      label: 'Interview',   Icon: Video },
    { href: '/mentors',            label: 'Mentors',     Icon: Users },
  ];
  const mentorLinks = [
    { href: '/mentor/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
    { href: '/mentor/sessions',    label: 'Sessions',    Icon: Calendar },
    { href: '/mentor/availability',label: 'Availability', Icon: Clock },
    { href: '/mentor/profile',     label: 'Profile',      Icon: User },
  ];
  const adminLinks = [
    { href: '/admin/dashboard',    label: 'Admin',      Icon: Shield },
  ];

  const links =
    userRole === 'admin'  ? adminLinks  :
    userRole === 'mentor' ? mentorLinks :
    candidateLinks;

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const badgeLabel =
    userRole === 'admin'  ? 'Admin'  :
    userRole === 'mentor' ? 'Mentor' : null;

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'rgba(5,6,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container-page flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF66, #00E5FF)', boxShadow: '0 0 16px rgba(0,255,102,0.35)' }}>
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white text-lg">InterviewAI</span>
          <span className="badge-green hidden sm:inline-flex">Palestine</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color:      active ? 'var(--neon-green)' : 'var(--text-secondary)',
                  background: active ? 'rgba(0,255,102,0.08)' : 'transparent',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* User Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00FF66, #00E5FF)', color: '#050608' }}>
                {initials}
              </div>
            )}
            <span className="text-sm font-medium text-white">{userName ?? 'User'}</span>
            {badgeLabel && <span className="badge-cyan text-xs">{badgeLabel}</span>}
            <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors text-left"
                style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,6,8,0.95)' }}>
          <div className="container-page py-4 space-y-1">
            {links.map(({ href, label, Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left mt-2" style={{ color: '#FCA5A5', cursor: 'pointer' }}>
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
