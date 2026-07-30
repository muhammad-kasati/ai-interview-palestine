'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import SetupWizard from './SetupWizard';
import {
  Clock, CheckCircle, XCircle, Loader2, TrendingUp,
  Zap, Video, Users, ArrowRight, BarChart2, Target,
  Calendar, Star, RefreshCw
} from 'lucide-react';

interface Interview {
  id: string;
  mode: string;
  status: string;
  job_role: string;
  experience_level: string;
  created_at: string;
  interview_evaluations?: { overall_score?: number }[];
}

interface DashboardClientProps {
  userName: string;
  recentInterviews: Interview[];
  currentTier: string;
}

const MODE_LABELS: Record<string, string> = {
  free: 'Text AI', audio: 'Audio AI', video: 'Video Avatar', human: 'Human Mentor',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  completed: { label: 'Completed', color: '#00D97E', bg: 'rgba(0,217,126,0.1)',  Icon: CheckCircle },
  active:    { label: 'Active',    color: '#00C2FF', bg: 'rgba(0,194,255,0.1)',  Icon: Loader2 },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', Icon: XCircle },
  pending:   { label: 'Pending',   color: '#8896A8', bg: 'rgba(136,150,168,0.1)', Icon: Clock },
};

interface InterviewConfig {
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  mode: string;
  targetMarket: string;
  resumeUrl?: string;
}

export default function DashboardClient({ userName, recentInterviews, currentTier }: DashboardClientProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  async function handleStartInterview(config: InterviewConfig) {
    setCreating(true);
    try {
      const res = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      }
    } catch {
      setCreating(false);
    }
  }

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good morning' :
    greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  const completedCount = recentInterviews.filter(i => i.status === 'completed').length;
  const avgScore = recentInterviews
    .map(i => i.interview_evaluations?.[0]?.overall_score)
    .filter((s): s is number => typeof s === 'number')
    .reduce((acc, s, _, arr) => acc + s / arr.length, 0);

  const quickActions = [
    {
      label: 'Start Interview',
      description: 'AI-powered mock session',
      Icon: Video,
      color: 'var(--neon-green)',
      bg: 'rgba(0,217,126,0.08)',
      border: 'rgba(0,217,126,0.15)',
      onClick: () => setShowWizard(true),
    },
    {
      label: 'Find a Mentor',
      description: 'Book 1-on-1 review',
      Icon: Users,
      color: 'var(--neon-cyan)',
      bg: 'rgba(0,194,255,0.08)',
      border: 'rgba(0,194,255,0.15)',
      onClick: () => router.push('/mentors'),
    },
    {
      label: 'View Analytics',
      description: 'Track performance',
      Icon: BarChart2,
      color: 'var(--neon-purple)',
      bg: 'rgba(124,92,252,0.08)',
      border: 'rgba(124,92,252,0.15)',
      onClick: () => router.push('/dashboard'),
    },
  ];

  if (showWizard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">New Interview Session</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Configure your AI mock interview
            </p>
          </div>
          <button
            onClick={() => setShowWizard(false)}
            className="btn-ghost text-xs"
          >
            ← Back to Dashboard
          </button>
        </div>
        <SetupWizard onStart={handleStartInterview as any} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
            {greeting} 👋
          </p>
          <h1 className="text-2xl font-bold text-white">
            {userName.split(' ')[0]}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Track your progress and keep practicing.
          </p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="btn-ghost text-xs h-8 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div id="analytics" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Sessions',
            value: recentInterviews.length,
            sub: 'All-time practice sessions',
            Icon: Target,
            color: 'var(--neon-cyan)',
          },
          {
            label: 'Completed',
            value: completedCount,
            sub: 'Successfully finished',
            Icon: CheckCircle,
            color: 'var(--neon-green)',
          },
          {
            label: 'Avg Score',
            value: avgScore > 0 ? `${avgScore.toFixed(0)}` : '—',
            sub: 'Performance average',
            Icon: BarChart2,
            color: 'var(--neon-purple)',
          },
          {
            label: 'Practice Time',
            value: `${completedCount * 45}m`,
            sub: 'Total time invested',
            Icon: Clock,
            color: 'var(--neon-amber)',
          },
        ].map(({ label, value, sub, Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4" style={{ color: 'var(--neon-green)' }} />
            Quick Access
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map(({ label, description, Icon, color, bg, border, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-all cursor-pointer group"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '22' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Recent Interviews + Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Interviews */}
        <div id="recent-interviews" className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
              Recent Interviews
            </h2>
            <button
              onClick={() => setShowWizard(true)}
              className="btn-neon-green text-xs py-1.5 px-3"
            >
              <Zap className="w-3 h-3" /> New Session
            </button>
          </div>

          {recentInterviews.length === 0 ? (
            <div className="text-center py-10">
              <Video className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium text-white mb-1">No sessions yet</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Start your first AI mock interview to track progress
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="btn-neon-green text-xs mt-4"
              >
                Start First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentInterviews.map((iv) => {
                const score = iv.interview_evaluations?.[0]?.overall_score;
                const sc = STATUS_CONFIG[iv.status] ?? STATUS_CONFIG.pending;
                const { Icon, color, bg } = sc;
                return (
                  <div
                    key={iv.id}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onClick={() => router.push(`/interview/${iv.id}`)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white capitalize truncate">
                          {iv.job_role.replace(/_/g, ' ')} · {iv.experience_level}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {MODE_LABELS[iv.mode]} · {new Date(iv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {score !== undefined && score !== null ? (
                        <span
                          className="text-sm font-bold font-mono"
                          style={{ color: score >= 70 ? 'var(--neon-green)' : score >= 50 ? 'var(--neon-amber)' : '#EF4444' }}
                        >
                          {score.toFixed(0)}
                          <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>/100</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
                          {sc.label}
                        </span>
                      )}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscription & Usage */}
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Subscription & Usage</h2>
            <span className={`${currentTier === 'free' ? 'badge-green' : currentTier === 'premium' ? 'badge-cyan' : currentTier === 'human' ? 'badge-purple' : 'badge-green'}`}>
              {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            </span>
          </div>

          {currentTier === 'free' && (
            <Link
              href="/subscription"
              className="block w-full p-3 rounded-xl text-center transition-all"
              style={{ background: 'rgba(0,217,126,0.06)', border: '1px solid rgba(0,217,126,0.15)' }}
            >
              <div className="text-xs font-bold" style={{ color: 'var(--neon-green)' }}>Upgrade to Pro</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Unlock audio, video & human sessions</div>
            </Link>
          )}

          <div className="space-y-3">
            {[
              { label: 'Interviews',   used: completedCount, limit: 2, color: 'var(--neon-green)' },
              { label: 'Mentors',      used: 0,              limit: 1, color: 'var(--neon-cyan)' },
              { label: 'Video Sessions',used: 0,             limit: 0, color: 'var(--neon-purple)' },
            ].map(({ label, used, limit, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="text-xs font-mono font-semibold text-white">
                    {used} / {limit === 0 ? '∞' : limit}
                  </span>
                </div>
                {limit > 0 && (
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min((used / limit) * 100, 100)}%`, background: color }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              href="/mentors"
              className="flex items-center justify-between text-xs font-medium p-2.5 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
            >
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3" style={{ color: 'var(--neon-amber)' }} />
                Book a Mentor Session
              </span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/interview/new"
              className="flex items-center justify-between text-xs font-medium p-2.5 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" style={{ color: 'var(--neon-cyan)' }} />
                Schedule Practice Session
              </span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
