'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, BarChart3, Video, CheckCircle, XCircle, Clock,
  Shield, AlertTriangle, Activity, Loader2, Eye
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalInterviews: number;
  pendingMentors: number;
  activeSessions: number;
}

interface AdminDashboardClientProps {
  stats: Stats;
  pendingMentors: any[];
  recentInterviews: any[];
  allUsers: any[];
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  candidate: { label: 'Candidate', cls: 'badge-green' },
  mentor:    { label: 'Mentor',    cls: 'badge-cyan'  },
  admin:     { label: 'Admin',     cls: 'badge-purple' },
};

const MODE_LABEL: Record<string, string> = {
  free: 'Text AI', audio: 'Audio AI', video: 'Video AI', human: 'Human',
};

const STATUS_COLOR: Record<string, string> = {
  active:    'var(--neon-green)',
  completed: 'var(--text-muted)',
  pending:   '#FBBF24',
  cancelled: '#EF4444',
};

export default function AdminDashboardClient({
  stats,
  pendingMentors,
  recentInterviews,
  allUsers,
}: AdminDashboardClientProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab]   = useState<'overview' | 'mentors' | 'interviews' | 'users'>('overview');
  const [approving, setApproving]   = useState<string | null>(null);

  async function approveMentor(mentorId: string) {
    setApproving(mentorId);
    await supabase.from('mentors').update({ verified: true }).eq('id', mentorId);
    setApproving(null);
  }

  async function rejectMentor(mentorId: string) {
    setApproving(mentorId + '-reject');
    await supabase.from('mentors').delete().eq('id', mentorId);
    setApproving(null);
  }

  const tabs = [
    { id: 'overview',   label: 'Overview',   Icon: BarChart3 },
    { id: 'mentors',    label: `Mentors (${stats.pendingMentors} pending)`, Icon: Users },
    { id: 'interviews', label: 'Interviews',  Icon: Video },
    { id: 'users',      label: 'Users',       Icon: Shield },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <div className="badge-purple mb-3 inline-flex">
          <Shield className="w-3 h-3" />
          Admin Dashboard
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Platform Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor usage, verify mentors, and manage user access</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',       value: stats.totalUsers,      color: 'var(--neon-green)', Icon: Users,     bg: 'rgba(0,255,102,0.08)'  },
          { label: 'Total Interviews',  value: stats.totalInterviews, color: 'var(--neon-cyan)',  Icon: Video,     bg: 'rgba(0,229,255,0.08)'  },
          { label: 'Pending Mentors',   value: stats.pendingMentors,  color: '#FBBF24',           Icon: AlertTriangle, bg: 'rgba(251,191,36,0.08)' },
          { label: 'Active Sessions',   value: stats.activeSessions,  color: '#A78BFA',           Icon: Activity,  bg: 'rgba(124,58,237,0.08)' },
        ].map(({ label, value, color, Icon, bg }) => (
          <div key={label} className="card rounded-2xl p-5" style={{ background: bg, border: `1px solid ${color}22` }}>
            <Icon className="w-5 h-5 mb-3" style={{ color }} />
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === id ? 'rgba(124,58,237,0.2)' : 'transparent',
              color:      activeTab === id ? '#A78BFA' : 'var(--text-muted)',
              border:     activeTab === id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              cursor: 'pointer',
              flex: '1 1 auto',
              justifyContent: 'center',
            }}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Quick Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Candidates',  value: allUsers.filter((u: any) => u.role === 'candidate').length },
                { label: 'Mentors',     value: allUsers.filter((u: any) => u.role === 'mentor').length },
                { label: 'Admins',      value: allUsers.filter((u: any) => u.role === 'admin').length },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Interview Modes Used</h2>
            <div className="space-y-3">
              {['free', 'audio', 'video', 'human'].map((mode) => {
                const count = recentInterviews.filter((i: any) => i.mode === mode).length;
                return (
                  <div key={mode} className="flex items-center gap-3">
                    <span className="text-sm w-24" style={{ color: 'var(--text-secondary)' }}>{MODE_LABEL[mode]}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: recentInterviews.length > 0 ? `${(count / recentInterviews.length) * 100}%` : '0%', background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan))' }} />
                    </div>
                    <span className="text-sm w-6 text-right font-bold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Mentors Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          {pendingMentors.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--neon-green)' }} />
              <p className="font-semibold text-white mb-1">All caught up!</p>
              <p style={{ color: 'var(--text-secondary)' }}>No mentor applications pending review.</p>
            </div>
          ) : (
            pendingMentors.map((mentor: any) => {
              const profile = mentor.profiles;
              const isProcessing = approving?.startsWith(mentor.id);
              return (
                <div key={mentor.id} className="card rounded-2xl p-6" style={{ border: '1px solid rgba(251,191,36,0.15)' }}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(124,58,237,0.15)' }}>
                        {(profile?.full_name ?? 'M').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{profile?.full_name ?? 'Unknown'}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{profile?.title} · {mentor.company}</p>
                      </div>
                    </div>
                    <span className="badge-purple text-xs">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  </div>

                  {profile?.bio && (
                    <p className="text-sm mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {mentor.years_experience ?? '?'} yrs exp
                    </div>
                    <div className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      ${mentor.hourly_rate_usd}/session
                    </div>
                    {(mentor.specializations ?? []).slice(0, 4).map((s: string) => (
                      <span key={s} className="badge-cyan text-xs">{s}</span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      id={`btn-approve-${mentor.id}`}
                      onClick={() => approveMentor(mentor.id)}
                      disabled={!!isProcessing}
                      className="btn-neon-green text-sm"
                      style={{ padding: '0.5rem 1.25rem', opacity: isProcessing ? 0.6 : 1 }}
                    >
                      {approving === mentor.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      id={`btn-reject-${mentor.id}`}
                      onClick={() => rejectMentor(mentor.id)}
                      disabled={!!isProcessing}
                      className="btn-ghost text-sm"
                      style={{ padding: '0.5rem 1.25rem', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)', opacity: isProcessing ? 0.6 : 1 }}
                    >
                      {approving === mentor.id + '-reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Interviews Tab ────────────────────────────────────────────────── */}
      {activeTab === 'interviews' && (
        <div className="card rounded-2xl overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white">Recent Interviews</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {recentInterviews.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No interviews yet</div>
            ) : (
              recentInterviews.map((iv: any) => (
                <div key={iv.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(0,255,102,0.1)', color: 'var(--neon-green)' }}>
                      {(iv.profiles?.full_name ?? 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{iv.profiles?.full_name ?? 'Anonymous'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {iv.job_role?.replace('_', ' ')} · {iv.experience_level} · {MODE_LABEL[iv.mode]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold capitalize" style={{ color: STATUS_COLOR[iv.status] ?? 'var(--text-muted)' }}>
                      {iv.status}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(iv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="card rounded-2xl overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white">All Users ({allUsers.length} shown)</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {allUsers.map((u: any) => {
              const rb = ROLE_BADGE[u.role] ?? ROLE_BADGE.candidate;
              return (
                <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {(u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.full_name ?? u.email}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`${rb.cls} text-xs`}>{rb.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
