'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Calendar, Clock, CheckCircle, XCircle, Video, Edit3,
  Search, Filter, DollarSign, Star, Loader2, Save, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MentorSessionsClientProps {
  mentorId: string;
  hourlyRate: number;
  initialBookings: any[];
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending Review', bg: 'rgba(251,191,36,0.12)', text: '#FBBF24' },
  confirmed: { label: 'Confirmed',     bg: 'rgba(0,255,102,0.12)',  text: 'var(--neon-green)' },
  completed: { label: 'Completed',     bg: 'rgba(124,58,237,0.12)', text: '#A78BFA' },
  cancelled: { label: 'Cancelled',     bg: 'rgba(239,68,68,0.12)',  text: '#EF4444' },
};

export default function MentorSessionsClient({
  mentorId,
  hourlyRate,
  initialBookings,
}: MentorSessionsClientProps) {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Feedback Modal state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackScore, setFeedbackScore] = useState(80);
  const [sessionLink, setSessionLink] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const candidateName = b.profiles?.full_name?.toLowerCase() ?? '';
    const candidateEmail = b.profiles?.email?.toLowerCase() ?? '';
    const matchesSearch = candidateName.includes(searchQuery.toLowerCase()) || candidateEmail.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const earningFor = (booking: any) => {
    const hours = Math.max((new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / 3_600_000, 0);
    return Number(booking.mentor_earning_usd ?? Number(booking.mentor_rate_usd ?? hourlyRate) * hours);
  };
  const totalEarnings = bookings
    .filter((booking) => booking.status === 'completed')
    .reduce((total, booking) => total + earningFor(booking), 0);

  async function handleConfirm(bookingId: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
      );
      toast.success('Session confirmed!');
    } catch (err: any) {
      toast.error('Failed to confirm session');
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      toast.success('Session cancelled');
    } catch (err: any) {
      toast.error('Failed to cancel session');
    }
  }

  function openFeedbackModal(booking: any) {
    setSelectedBooking(booking);
    setFeedbackText(booking.mentor_feedback ?? '');
    setFeedbackScore(booking.mentor_score ?? 80);
    setSessionLink(booking.session_link ?? '');
  }

  async function handleSaveFeedback() {
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          mentor_feedback: feedbackText,
          mentor_score: feedbackScore,
          session_link: sessionLink,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? {
                ...b,
                mentor_feedback: feedbackText,
                mentor_score: feedbackScore,
                session_link: sessionLink,
                status: 'completed',
              }
            : b
        )
      );

      toast.success('Session feedback and rating saved!');
      setSelectedBooking(null);
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      toast.error(err.message || 'Failed to save feedback');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-7 h-7 text-neon-green" />
            <h1 className="text-3xl font-black text-white">Session History & Feedback</h1>
          </div>
          <p className="text-text-secondary text-sm">
            Review candidate bookings, conduct interview sessions, and submit performance evaluations.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card rounded-2xl p-5">
          <div className="text-xs text-text-muted mb-1 font-semibold">Total Sessions</div>
          <div className="text-2xl font-black text-white">{bookings.length}</div>
        </div>
        <div className="card rounded-2xl p-5">
          <div className="text-xs text-text-muted mb-1 font-semibold">Completed</div>
          <div className="text-2xl font-black text-neon-green">{completedCount}</div>
        </div>
        <div className="card rounded-2xl p-5">
          <div className="text-xs text-text-muted mb-1 font-semibold">Pending</div>
          <div className="text-2xl font-black text-yellow-400">
            {bookings.filter((b) => b.status === 'pending').length}
          </div>
        </div>
        <div className="card rounded-2xl p-5">
          <div className="text-xs text-text-muted mb-1 font-semibold font-mono">Estimated Earnings</div>
          <div className="text-2xl font-black text-purple-400">${totalEarnings.toFixed(2)}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 card rounded-2xl p-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name..."
            className="input-dark pl-9 text-sm py-2"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterStatus === statusKey
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'bg-white/5 text-text-secondary border border-transparent hover:bg-white/10'
              }`}
            >
              {statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="card rounded-2xl p-12 text-center">
            <Calendar className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="font-bold text-white mb-1">No sessions match your filter</p>
            <p className="text-xs text-text-secondary">Try adjusting the search query or status filter.</p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const badge = STATUS_BADGE[b.status] ?? STATUS_BADGE.pending;
            const candidate = b.profiles;
            const startDate = new Date(b.start_at);

            return (
              <div key={b.id} className="card rounded-2xl p-6 transition-all hover:border-white/15 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center font-bold text-neon-cyan text-lg">
                      {(candidate?.full_name ?? 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{candidate?.full_name ?? 'Candidate'}</h3>
                      <p className="text-xs text-text-muted">{candidate?.email}</p>
                    </div>
                  </div>

                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-text-secondary bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neon-green" />
                    <span>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neon-cyan" />
                    <span>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Session value</span>
                  <span className="font-mono font-semibold text-neon-green">${earningFor(b).toFixed(2)}</span>
                </div>

                {b.candidate_notes && (
                  <div className="text-xs text-text-secondary italic bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="font-semibold text-white not-italic block mb-1">Candidate Notes:</span>
                    "{b.candidate_notes}"
                  </div>
                )}

                {/* Feedback Report if completed */}
                {b.status === 'completed' && (
                  <div className="bg-neon-purple/10 border border-neon-purple/20 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-300">Candidate Rating</span>
                      <span className="font-mono font-bold text-neon-green text-sm">{b.mentor_score}/100</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{b.mentor_feedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(b.id)}
                        className="btn-neon-green text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm Session
                      </button>
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="btn-ghost text-xs py-1.5 px-3 text-red-400 border-red-500/20 hover:bg-red-500/10 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => openFeedbackModal(b)}
                        className="btn-cyan text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Complete & Submit Feedback
                      </button>
                      {b.session_link && (
                        <a
                          href={b.session_link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5 text-neon-green" /> Join Meeting <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </>
                  )}

                  {b.status === 'completed' && (
                    <button
                      onClick={() => openFeedbackModal(b)}
                      className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-neon-cyan" /> Edit Feedback
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Feedback Submission */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card rounded-2xl p-6 max-w-lg w-full space-y-4 border border-white/15">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-neon-green" />
                Session Feedback & Rating
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-secondary">
              Candidate: <span className="font-bold text-white">{selectedBooking.profiles?.full_name}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Meeting Room / Video Link
              </label>
              <input
                type="url"
                value={sessionLink}
                onChange={(e) => setSessionLink(e.target.value)}
                placeholder="e.g. https://meet.google.com/abc-defg-hij"
                className="input-dark text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-text-secondary">Candidate Overall Score</label>
                <span className="font-bold text-neon-green font-mono text-sm">{feedbackScore}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={feedbackScore}
                onChange={(e) => setFeedbackScore(Number(e.target.value))}
                className="w-full accent-neon-green cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Detailed Feedback & Recommendations
              </label>
              <textarea
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Provide constructive feedback on technical skills, problem solving, communication, and key areas for improvement..."
                className="input-dark text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="btn-ghost text-xs px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFeedback}
                disabled={saving}
                className="btn-neon-green text-xs px-4 flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
