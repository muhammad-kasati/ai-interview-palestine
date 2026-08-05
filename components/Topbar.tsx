'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronRight, LayoutDashboard, PanelLeft, Settings, Calendar,
  DollarSign, User, Shield, Video, Users, CreditCard, HelpCircle, Clock, Sparkles
} from 'lucide-react';
import NotificationBell from './NotificationBell';

interface Breadcrumb {
  label: string;
  href: string;
  Icon?: React.ElementType;
}

export default function Topbar() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbs = (): Breadcrumb[] => {
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

    if (pathname.startsWith('/admin')) {
      return [{ label: 'Admin Panel', href: '/admin/dashboard', Icon: Shield }];
    }

    if (pathname.startsWith('/room/')) {
      return [
        { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
        { label: 'Live Interview Room', href: pathname, Icon: Video },
      ];
    }

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
    <header className="topbar px-4 sm:px-6 py-2.5 bg-black/50 border-b border-white/[0.08] flex items-center justify-between backdrop-blur-xl sticky top-0 z-30 transition-all">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-xs">
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-text-secondary hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm"
          title="Toggle sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.07] shadow-inner">
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

      {/* Right: Live Time Badge & Notification Bell */}
      <div className="flex items-center gap-3">
        {currentTime && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/[0.03] border border-white/[0.08] text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-neon-cyan" />
            <span>{currentTime}</span>
          </div>
        )}

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <NotificationBell />
      </div>
    </header>
  );
}

