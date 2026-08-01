'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight, LayoutDashboard, PanelLeft, Settings, Calendar,
  DollarSign, User, Shield, Video, Users, CreditCard, HelpCircle
} from 'lucide-react';
import NotificationBell from './NotificationBell';

interface Breadcrumb {
  label: string;
  href: string;
  Icon?: React.ElementType;
}

export default function Topbar() {
  const pathname = usePathname();

  const getBreadcrumbs = (): Breadcrumb[] => {
    // Mentor Routes
    if (pathname.startsWith('/mentor')) {
      if (pathname === '/mentor/dashboard') {
        return [{ label: 'Mentor Dashboard', href: '/mentor/dashboard', Icon: LayoutDashboard }];
      }
      const mentorSubPages: Record<string, { label: string; Icon: React.ElementType }> = {
        '/mentor/sessions':     { label: 'Sessions', Icon: Calendar },
        '/mentor/availability': { label: 'Availability', Icon: Calendar },
        '/mentor/earnings':     { label: 'Earnings & Financials', Icon: DollarSign },
        '/mentor/profile':      { label: 'Profile & Rates', Icon: User },
        '/mentor/settings':     { label: 'Mentor Settings', Icon: Settings },
      };

      const current = mentorSubPages[pathname];
      return [
        { label: 'Mentor Workspace', href: '/mentor/dashboard', Icon: LayoutDashboard },
        { label: current?.label ?? 'Settings', href: pathname, Icon: current?.Icon ?? Settings },
      ];
    }

    // Admin Routes
    if (pathname.startsWith('/admin')) {
      return [{ label: 'Admin Panel', href: '/admin/dashboard', Icon: Shield }];
    }

    // Room Route
    if (pathname.startsWith('/room/')) {
      return [
        { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
        { label: 'Live Interview Room', href: pathname, Icon: Video },
      ];
    }

    // Candidate Routes
    const candidateSubPages: Record<string, { label: string; Icon: React.ElementType }> = {
      '/dashboard':     { label: 'Dashboard', Icon: LayoutDashboard },
      '/interview/new': { label: 'New AI Interview', Icon: Video },
      '/interviews':    { label: 'Recent Interviews', Icon: Video },
      '/analytics':     { label: 'Interview Analytics', Icon: LayoutDashboard },
      '/mentors':       { label: 'Find a Mentor', Icon: Users },
      '/sessions':      { label: 'My Mentor Sessions', Icon: Calendar },
      '/profile':        { label: 'Profile', Icon: User },
      '/subscription':   { label: 'Subscription', Icon: CreditCard },
      '/referrals':      { label: 'Refer Friends', Icon: Users },
      '/settings':       { label: 'Settings', Icon: Settings },
      '/help':           { label: 'Help & Support', Icon: HelpCircle },
    };

    if (pathname === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard }];
    }

    const current = candidateSubPages[pathname];
    return [
      { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
      { label: current?.label ?? 'Page', href: pathname, Icon: current?.Icon ?? LayoutDashboard },
    ];
  };

  const breadcrumbs = getBreadcrumbs();
  const toggleSidebar = () => window.dispatchEvent(new Event('toggle-sidebar'));

  return (
    <header className="topbar px-4 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Toggle sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.08]">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const Icon = crumb.Icon;

            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />}

                {isLast ? (
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {Icon && <Icon className="w-3.5 h-3.5 text-neon-green" />}
                    <span>{crumb.label}</span>
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-text-secondary hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-neon-cyan" />}
                    <span>{crumb.label}</span>
                  </Link>
                )}
              </span>
            );
          })}
        </div>
      </nav>

      {/* Notifications Right Bar */}
      <div className="flex items-center gap-3">
        <NotificationBell />
      </div>
    </header>
  );
}
