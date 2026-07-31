'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Zap, LayoutDashboard, Video, Users, LogOut,
  User, CreditCard, HelpCircle, ChevronRight, Settings, Moon, Sun,
  Shield, Calendar, Clock, Star, Menu, X, Gift, DollarSign
} from 'lucide-react';

interface SidebarProps {
  userRole: 'candidate' | 'mentor' | 'admin';
  userName: string;
  userEmail?: string;
  avatarUrl?: string | null;
  currentTier?: string;
}

interface NavigationLink {
  href: string;
  label: string;
  Icon: React.ElementType;
  children?: { href: string; label: string }[];
}

interface NavigationSection { label: string; links: NavigationLink[]; }

const candidateSections: NavigationSection[] = [
  {
    label: 'Core',
    links: [
      { href: '/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
      {
        href: '/interview/new', label: 'AI Interview', Icon: Video,
        children: [
          { href: '/interview/new', label: 'Start Interview' },
          { href: '/interviews', label: 'Recent Interviews' },
          { href: '/analytics', label: 'Interview Analytics' },
        ],
      },
      { href: '/mentors',       label: 'Mentors',        Icon: Users },
      { href: '/sessions',      label: 'My Mentor Sessions', Icon: Calendar },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/profile',       label: 'Profile',        Icon: User },
      { href: '/subscription',  label: 'Subscription',   Icon: CreditCard },
      { href: '/referrals',     label: 'Refer Friends',  Icon: Gift },
      { href: '/settings',      label: 'Settings',       Icon: Settings },
    ],
  },
  {
    label: 'Support',
    links: [
      { href: '/help',          label: 'Help & Support',  Icon: HelpCircle },
    ],
  },
];

const mentorSections: NavigationSection[] = [
  {
    label: 'Core',
    links: [
      { href: '/mentor/dashboard',    label: 'Dashboard',     Icon: LayoutDashboard },
      { href: '/mentor/sessions',     label: 'Sessions',      Icon: Calendar },
      { href: '/mentor/availability', label: 'Availability',  Icon: Clock },
      { href: '/mentor/earnings',     label: 'Earnings',      Icon: DollarSign },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/mentor/profile',      label: 'Profile & Rates', Icon: Star },
    ],
  },
  {
    label: 'Support',
    links: [
      { href: '/help',                label: 'Help & Support',  Icon: HelpCircle },
    ],
  },
];

const adminSections: NavigationSection[] = [
  {
    label: 'Admin',
    links: [
      { href: '/admin/dashboard',  label: 'Admin Dashboard', Icon: Shield },
    ],
  },
];

export default function Sidebar({ userRole, userName, userEmail, avatarUrl, currentTier }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [aiInterviewOpen, setAiInterviewOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const toggleSidebar = () => setCollapsed((value) => !value);
    window.addEventListener('toggle-sidebar', toggleSidebar);
    return () => window.removeEventListener('toggle-sidebar', toggleSidebar);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const sections =
    userRole === 'admin'  ? adminSections  :
    userRole === 'mentor' ? mentorSections :
    candidateSections;

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const tierLabel = currentTier
    ? currentTier.charAt(0).toUpperCase() + currentTier.slice(1)
    : null;

  const renderSidebarContent = (compact = false) => (
    <>
      {/* Logo */}
      <div className={`h-14 flex items-center gap-2.5 px-4 border-b ${compact ? 'justify-center' : ''}`} style={{ borderColor: 'var(--sidebar-border)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))', boxShadow: 'var(--glow-green)' }}
        >
          <Zap className="w-4 h-4 text-black" />
        </div>
        {!compact && <div className="min-w-0">
          <div className="font-bold text-white text-sm leading-tight truncate">InterviewAI</div>
          <div className="text-[10px] font-medium" style={{ color: 'var(--neon-green)' }}>Palestine</div>
        </div>}
      </div>

      {/* Tier Badge (candidates only) */}
      {userRole === 'candidate' && tierLabel && !compact && (
        <div className="mx-3 mt-3 mb-1 p-2.5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(0,217,126,0.06)', border: '1px solid rgba(0,217,126,0.12)' }}>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Plan</div>
            <div className="text-sm font-bold" style={{ color: 'var(--neon-green)' }}>{tierLabel}</div>
          </div>
          {currentTier === 'free' && (
            <Link href="/subscription" className="text-[10px] font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(0,217,126,0.15)', color: 'var(--neon-green)' }}>
              Upgrade
            </Link>
          )}
        </div>
      )}

      {/* Nav Sections */}
      <div className="sidebar-content flex-1">
        {sections.map((section) => (
          <div key={section.label}>
            {!compact && <div className="sidebar-section-label">{section.label}</div>}
            {section.links.map(({ href, label, Icon, children }) => {
              const isActive = pathname === href || (href !== '/dashboard' && href !== '/mentor/dashboard' && pathname.startsWith(href));
              return <div key={href} className="relative">
                <Link href={href} title={compact ? label : undefined} onClick={() => setMobileOpen(false)} className={`sidebar-link ${isActive ? 'active' : ''} ${compact ? 'justify-center px-2' : ''}`}>
                  <Icon className="sidebar-icon" />
                  {!compact && <><span className="flex-1">{label}</span>{!children && isActive && <ChevronRight className="w-3 h-3 opacity-50" />}</>}
                </Link>
                {children && !compact && <button type="button" onClick={() => setAiInterviewOpen((open) => !open)} className="absolute right-3 top-1.5 w-6 h-6 flex items-center justify-center rounded cursor-pointer" title={aiInterviewOpen ? 'Collapse AI Interview menu' : 'Expand AI Interview menu'} style={{ color: 'var(--text-muted)' }}><ChevronRight className={`w-3 h-3 transition-transform ${aiInterviewOpen ? 'rotate-90' : ''}`} /></button>}
                {children && aiInterviewOpen && !compact && <div className="ml-7 mb-1 border-l" style={{ borderColor: 'var(--border-medium)' }}>
                  {children.map((child) => <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block py-1.5 pl-3 text-[11px] transition-colors" style={{ color: pathname === child.href ? 'var(--neon-green)' : 'var(--text-secondary)' }}>{child.label}</Link>)}
                </div>}
              </div>;
            })}
          </div>
        ))}
      </div>

      {/* User Footer */}
      {!compact && <div className="relative border-t p-3" style={{ borderColor: 'var(--sidebar-border)' }}>
        {accountOpen && <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 card rounded-2xl p-2 z-20" style={{ boxShadow: '0 18px 40px rgba(0,0,0,.42)' }}>
          <div className="p-3 rounded-xl mb-2" style={{ background: 'rgba(0,217,126,.07)' }}><p className="text-sm font-bold text-white truncate">{userName}</p><p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>{userEmail}</p><p className="text-[11px] mt-1" style={{ color: 'var(--neon-green)' }}>{tierLabel} Plan</p></div>
          {userRole === 'mentor' ? <>
            <Link href="/mentor/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold" style={{ color: 'var(--neon-green)' }}><Star className="w-4 h-4" /> Profile & Rates</Link>
            <Link href="/mentor/earnings" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}><DollarSign className="w-4 h-4" /> Earnings</Link>
            <Link href="/mentor/availability" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}><Clock className="w-4 h-4" /> Availability</Link>
          </> : <>
            <Link href="/subscription" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold" style={{ color: 'var(--neon-green)' }}><Zap className="w-4 h-4" /> Upgrade to Pro</Link>
            <Link href="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}><User className="w-4 h-4" /> Profile</Link>
            <Link href="/subscription" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}><CreditCard className="w-4 h-4" /> Subscription</Link>
            <Link href="/settings" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}><Settings className="w-4 h-4" /> Settings</Link>
          </>}
          <div className="flex items-center justify-between mx-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Theme</span><span className="flex gap-1"><Sun className="w-3.5 h-3.5 text-neon-green" /><Moon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></span></div>
        </div>}
        <div role="button" tabIndex={0} onClick={() => setAccountOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setAccountOpen((open) => !open); }} className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))', color: '#050A08' }}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{userName}</div>
            {userEmail && <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{userEmail}</div>}
          </div>
          <button
            onClick={(event) => { event.stopPropagation(); handleLogout(); }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Sign out"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`sidebar hidden md:flex flex-col ${collapsed ? 'collapsed' : ''}`}>
        {renderSidebarContent(collapsed)}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col" style={{ width: 'var(--sidebar-width)', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', zIndex: 51 }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
}
