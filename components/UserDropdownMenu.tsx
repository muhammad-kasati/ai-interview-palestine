'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles, User, Settings, CreditCard, Sun, Moon, Laptop,
  LogOut, ArrowUpRight, Check
} from 'lucide-react';

interface UserDropdownMenuProps {
  user: {
    email?: string | null;
  };
  profile: {
    full_name?: string | null;
    avatar_url?: string | null;
    role?: string | null;
  } | null;
  subscriptionTier?: string;
  dashboardUrl?: string;
}

export default function UserDropdownMenu({
  user,
  profile,
  subscriptionTier = 'Free',
  dashboardUrl = '/dashboard',
}: UserDropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('dark');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  const fullName = profile?.full_name || 'User';
  const email = user.email || '';
  const avatarUrl = profile?.avatar_url;
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const tierFormatted = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Top Header Trigger: Dashboard Pill + User Avatar */}
      <div className="flex items-center gap-2.5">
        <Link
          href={dashboardUrl}
          className="btn-cyan font-bold text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
          style={{ boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}
        >
          Dashboard <ArrowUpRight className="w-4 h-4" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-neon-cyan/70 flex items-center justify-center bg-purple-950 font-bold text-white text-xs shrink-0 transition-transform hover:scale-105 cursor-pointer focus:outline-none"
          title="Account Menu"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-neon-cyan">{initials}</span>
          )}
        </button>
      </div>

      {/* Popover Dropdown Card matching requested screenshot */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-80 rounded-3xl shadow-2xl z-50 animate-fade-in overflow-hidden border"
          style={{
            background: 'linear-gradient(180deg, #F5EFE6 0%, #EFE8DC 100%)',
            borderColor: 'rgba(0,0,0,0.08)',
            color: '#1F2937',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top User Details Banner Card */}
          <div className="p-4 m-3.5 rounded-2xl" style={{ background: '#EAE2D5', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-black/10 bg-gray-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-cyan-900 text-white">
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm truncate">{fullName}</h4>
                <p className="text-xs text-gray-600 truncate mt-0.5">{email}</p>
                <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-gray-700">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{tierFormatted} Plan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 pb-3 space-y-1 text-sm font-medium">
            {/* Upgrade to Pro */}
            <Link
              href="/subscription"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-black/5 text-gray-900"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-800" style={{ background: 'rgba(0,0,0,0.04)' }}>
                <Sparkles className="w-4.5 h-4.5 text-gray-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm leading-tight text-gray-900">Upgrade to Pro</div>
                <div className="text-xs text-gray-500 font-normal mt-0.5">Unlimited for $20/mo</div>
              </div>
            </Link>

            <div className="h-px bg-gray-300/50 my-1 mx-2" />

            {/* Profile */}
            <Link
              href={profile?.role === 'mentor' ? '/mentor/profile' : '/profile'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5 text-gray-800"
            >
              <User className="w-4 h-4 text-gray-700" />
              <span>Profile</span>
            </Link>

            {/* Settings */}
            <Link
              href={profile?.role === 'mentor' ? '/mentor/settings' : '/settings'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5 text-gray-800"
            >
              <Settings className="w-4 h-4 text-gray-700" />
              <span>Settings</span>
            </Link>

            {/* Subscription */}
            <Link
              href="/subscription"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors hover:bg-black/5 text-gray-800"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <span>Subscription</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-200 text-gray-700">
                {tierFormatted}
              </span>
            </Link>

            <div className="h-px bg-gray-300/50 my-1 mx-2" />

            {/* Theme Selector Row */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-semibold text-gray-700">Theme</span>
              <div className="flex items-center gap-1 p-1 rounded-full bg-gray-200/80 border border-gray-300">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow text-amber-600' : 'text-gray-600'}`}
                  title="Light"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-white shadow text-purple-700' : 'text-gray-600'}`}
                  title="Dark"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
                  title="System"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-300/50 my-1 mx-2" />

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-red-50 text-red-600 font-semibold cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
