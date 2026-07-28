'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, Loader2, Zap, User, Briefcase } from 'lucide-react';

type Role = 'candidate' | 'mentor';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<Role>('candidate');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,255,102,0.15)', border: '1px solid rgba(0,255,102,0.3)' }}>
            <Zap className="w-8 h-8 text-neon-green" style={{ color: 'var(--neon-green)' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            We sent a verification link to <strong className="text-white">{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="btn-ghost mt-6 inline-flex">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,229,255,0.06) 0%, transparent 60%), var(--bg-base)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF66, #00E5FF)', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">InterviewAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Start preparing for your dream tech job</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>I am joining as a</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'candidate' as Role, label: 'Candidate', desc: 'Preparing for tech interviews', Icon: User },
                { value: 'mentor' as Role, label: 'Mentor', desc: 'Coaching Palestinian engineers', Icon: Briefcase },
              ].map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="p-3.5 rounded-xl text-left transition-all flex items-start gap-3"
                  style={{
                    background: role === value ? 'rgba(0,255,102,0.08)' : 'rgba(255,255,255,0.03)',
                    border: role === value ? '1.5px solid #00FF66' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: role === value ? '0 0 15px rgba(0,255,102,0.15)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div className="p-2 rounded-lg shrink-0 mt-0.5" style={{ background: role === value ? 'rgba(0,255,102,0.15)' : 'rgba(255,255,255,0.05)' }}>
                    <Icon className="w-4 h-4" style={{ color: role === value ? 'var(--neon-green)' : 'var(--text-muted)' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-white leading-tight">{label}</div>
                    <div className="text-xs mt-1 leading-normal" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            type="button"
            id="btn-google-signup"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-6 transition-all font-medium text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input id="signup-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmad Al-Khalil" required className="input-dark" />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input-dark" />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input id="signup-password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="input-dark pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3.5 text-xs leading-relaxed" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                {error.includes('fetch') ? (
                  <>
                    <strong>خطأ في الاتصال بـ Supabase (Failed to fetch):</strong><br />
                    يرجى تحديث مفاتيح Supabase الحقيقية في ملف <code>.env.local</code> لأن المفاتيح الحالية لا تزال تحتوي على الروابط الافتراضية.
                  </>
                ) : (
                  error
                )}
              </div>
            )}

            <button id="btn-signup-submit" type="submit" disabled={loading} className="btn-neon-green w-full justify-center mt-2" style={{ opacity: loading ? 0.7 : 1, padding: '0.875rem' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : `Create ${role === 'mentor' ? 'Mentor' : ''} Account`}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--neon-green)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
