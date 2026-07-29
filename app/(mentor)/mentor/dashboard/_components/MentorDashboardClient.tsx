'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Calendar, Clock, DollarSign, Star, Users, CheckCircle,
  Edit3, Save, Plus, Trash2, AlertCircle, Loader2, User
} from 'lucide-react';
import { DAY_NAMES } from '@/lib/types';

interface MentorDashboardClientProps {
  profile: any;
  mentor: any;
  bookings: any[];
  availability: any[];
  totalEarnings: number;
  completedSessions: number;
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: '#FBBF24' },
  confirmed: { label: 'Confirmed', color: 'var(--neon-green)' },
  completed: { label: 'Done',      color: 'var(--text-muted)' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
};

export default function MentorDashboardClient({
  profile,
  mentor,
  bookings,
  availability,
  totalEarnings,
  completedSessions,
}: MentorDashboardClientProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'availability' | 'feedback'>('overview');
  const [feedbackModal, setFeedbackModal] = useState<string | null>(null);
  const [feedbackText, setFeedbackText]   = useState('');
  const [feedbackScore, setFeedbackScore] = useState(75);
  const [saving, setSaving]               = useState(false);

  const notVerified = mentor && !mentor.verified;

  async function submitFeedback(bookingId: string) {
    setSaving(true);
    await supabase
      .from('bookings')
      .update({ mentor_feedback: feedbackText, mentor_score: feedbackScore, status: 'completed' })
      .eq('id', bookingId);
    setSaving(false);
    setFeedbackModal(null);
    setFeedbackText('');
  }

  async function confirmBooking(bookingId: string) {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
  }

  const tabs = [
    { id: 'overview',     label: 'Overview',     Icon: Star },
    { id: 'bookings',     label: 'Bookings',      Icon: Calendar },
    { id: 'availability', label: 'Availability',  Icon: Clock },
    { id: 'feedback',     label: 'Submit Feedback', Icon: Edit3 },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,229,255,0.3))' }}>
            {(profile?.full_name ?? 'M').charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile?.full_name ?? 'Mentor'}</h1>
              {mentor?.verified ? (
                <span className="badge-green text-xs">✓ Verified</span>
              ) : (
                <span className="badge-purple text-xs">Pending Review</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{profile?.title ?? 'Mentor'} · {profile?.company ?? ''}</p>
          </div>
        </div>

        <Link
          href="/mentor/profile"
          className="btn-ghost text-xs py-2 px-4 inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <User className="w-3.5 h-3.5 text-neon-cyan" /> Edit Profile & Rates
        </Link>
      </div>

      {/* Not yet verified notice */}
      {notVerified && (
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#FBBF24' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#FBBF24' }}>Your mentor profile is under review</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>An admin will verify your profile soon. You'll receive access to bookings once approved.</p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Rating',            value: `${(mentor?.rating ?? 0).toFixed(1)}★`, color: '#FBBF24', Icon: Star },
          { label: 'Sessions Done',     value: completedSessions,                       color: 'var(--neon-green)', Icon: CheckCircle },
          { label: 'Total Earnings',    value: `$${totalEarnings}`,                     color: '#A78BFA',           Icon: DollarSign },
          { label: 'Upcoming',          value: bookings.filter((b: any) => b.status !== 'cancelled').length, color: 'var(--neon-cyan)', Icon: Calendar },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="card rounded-2xl p-5">
            <Icon className="w-5 h-5 mb-3" style={{ color }} />
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-1 justify-center transition-all"
            style={{
              background: activeTab === id ? 'rgba(124,58,237,0.2)' : 'transparent',
              color:      activeTab === id ? '#A78BFA' : 'var(--text-muted)',
              border:     activeTab === id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview Tab ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Your Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {(mentor?.specializations ?? []).map((s: string) => (
                <span key={s} className="badge-cyan text-xs">{s}</span>
              ))}
              {(!mentor?.specializations || mentor.specializations.length === 0) && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No specializations set yet. Update your profile.</p>
              )}
            </div>
          </div>

          <div className="card rounded-2xl p-6">
            <h2 className="font-bold text-white mb-2">Session Rate</h2>
            <div className="text-3xl font-black" style={{ color: '#A78BFA' }}>
              ${mentor?.hourly_rate_usd ?? 35}
              <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>per session</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bookings Tab ────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="card rounded-2xl p-12 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold text-white mb-1">No upcoming bookings</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Candidates will be able to book sessions once your profile is verified.
              </p>
            </div>
          ) : (
            bookings.map((booking: any) => {
              const sc = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
              const candidateProfile = booking.profiles;
              return (
                <div key={booking.id} className="card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(0,229,255,0.12)' }}>
                        {(candidateProfile?.full_name ?? 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{candidateProfile?.full_name ?? 'Candidate'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{candidateProfile?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ color: sc.color, background: `${sc.color}18` }}>
                      {sc.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {booking.candidate_notes && (
                    <p className="mt-3 text-sm p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{booking.candidate_notes}"
                    </p>
                  )}

                  <div className="flex gap-3 mt-4">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => confirmBooking(booking.id)}
                        id={`btn-confirm-${booking.id}`}
                        className="btn-neon-green text-sm"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => { setFeedbackModal(booking.id); setActiveTab('feedback'); }}
                        id={`btn-feedback-${booking.id}`}
                        className="btn-ghost text-sm"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        <Edit3 className="w-4 h-4" />
                        Submit Feedback
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Availability Tab ─────────────────────────────────────────────── */}
      {activeTab === 'availability' && (
        <div className="card rounded-2xl p-6">
          <h2 className="font-bold text-white mb-6">Weekly Availability</h2>
          <div className="space-y-3">
            {DAY_NAMES.map((day, idx) => {
              const slot = availability.find((a: any) => a.day_of_week === idx);
              return (
                <div key={day} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="w-10 text-sm font-semibold" style={{ color: slot ? 'var(--neon-green)' : 'var(--text-muted)' }}>{day}</span>
                  {slot ? (
                    <>
                      <span className="text-sm text-white">{slot.start_time} – {slot.end_time}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({slot.timezone})</span>
                      <CheckCircle className="w-4 h-4 ml-auto" style={{ color: 'var(--neon-green)' }} />
                    </>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Not available</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-text-muted">
              Configure your exact time slots and timezone.
            </p>
            <Link
              href="/mentor/availability"
              className="btn-neon-green text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Edit Availability Schedule
            </Link>
          </div>
        </div>
      )}

      {/* ── Feedback Tab ────────────────────────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="card rounded-2xl p-6">
          <h2 className="font-bold text-white mb-2">Submit Session Feedback</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            After completing a session, submit your written feedback and score for the candidate.
          </p>

          {bookings.filter((b: any) => b.status === 'confirmed').length === 0 ? (
            <div className="text-center py-8">
              <Edit3 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No confirmed sessions awaiting feedback.</p>
            </div>
          ) : (
            bookings.filter((b: any) => b.status === 'confirmed').map((booking: any) => (
              <div key={booking.id} className="mb-6 p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-semibold text-white mb-1">{booking.profiles?.full_name ?? 'Candidate'}</p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Session: {new Date(booking.start_at).toLocaleDateString()}
                </p>

                {/* Score Slider */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Overall Score: <span className="text-white font-bold">{feedbackScore}/100</span>
                  </label>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={feedbackScore}
                    onChange={(e) => setFeedbackScore(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: 'var(--neon-green)' }}
                  />
                </div>

                {/* Feedback Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Written Feedback
                  </label>
                  <textarea
                    id="feedback-text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide detailed feedback on technical skills, communication, problem-solving approach, and recommendations…"
                    rows={6}
                    className="input-dark resize-none"
                  />
                </div>

                <button
                  id={`btn-submit-feedback-${booking.id}`}
                  onClick={() => submitFeedback(booking.id)}
                  disabled={saving || !feedbackText.trim()}
                  className="btn-neon-green"
                  style={{ opacity: (saving || !feedbackText.trim()) ? 0.6 : 1 }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Submit Feedback'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
