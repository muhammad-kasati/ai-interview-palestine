'use client';

import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, LayoutDashboard, PanelLeft } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/interview/new':      'New Interview',
  '/mentors':            'Find a Mentor',
  '/profile':            'Profile',
  '/subscription':       'Subscription',
  '/referrals':          'Refer Friends',
  '/help':               'Help & Support',
  '/interviews':         'Recent Interviews',
  '/analytics':          'Interview Analytics',
  '/mentor/dashboard':   'Mentor Dashboard',
  '/mentor/sessions':    'Sessions',
  '/mentor/availability':'Availability',
  '/mentor/profile':     'Profile & Rates',
  '/admin/dashboard':    'Admin Panel',
};

export default function Topbar() {
  const pathname = usePathname();

  // Build breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean);
  const routeBreadcrumbs = segments.map((seg, i) => ({
    label: PAGE_TITLES['/' + segments.slice(0, i + 1).join('/')]
      ?? seg.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));
  const breadcrumbs = pathname === '/dashboard'
    ? routeBreadcrumbs
    : [{ label: 'Dashboard', href: '/dashboard' }, ...routeBreadcrumbs];
  const toggleSidebar = () => window.dispatchEvent(new Event('toggle-sidebar'));

  return (
    <header className="topbar">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        <button onClick={toggleSidebar} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }} title="Toggle sidebar"><PanelLeft className="w-3.5 h-3.5" /></button>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {i === 0 && <LayoutDashboard className="w-3.5 h-3.5" />}
            <span
              className={i === breadcrumbs.length - 1 ? 'font-semibold' : ''}
              style={{ color: i === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)'; }}
        >
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
