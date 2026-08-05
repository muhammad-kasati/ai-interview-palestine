'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock3, Video, FileText, CheckCircle2, Star, X, AlertCircle } from 'lucide-react';

type Session = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  session_link: string | null;
  room_code?: string | null;
  candidate_notes: string | null;
  mentor_feedback: string | null;
  mentor_score: number | null;
  mentors: {
    hourly_rate_usd: number;
    profiles: { full_name: string; avatar_url: string | null; title: string }[];
  }[];
};

export default function SessionsClient({ sessions }: { sessions: Session[] }) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-neon-green" /> My Mentor Sessions
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            Track booking confirmations, join active video interview rooms, and review mentor feedback reports.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const mentorProfile = session.mentors?.[0]?.profiles?.[0];
          const isConfirmed = session.status === 'confirmed';
          const roomUrl = `/room/${session.id}`;

          const startDate = new Date(session.start_at);
          const endDate = new Date(session.end_at);
          const now = new Date();
          const isExpired = now > endDate;
          const isLiveNow = isConfirmed && now >= startDate && !isExpired;

          return (
            <article
              key={session.id}
              className={`card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-white/20 ${
                isLiveNow ? 'border-neon-green/40 bg-neon-green/[0.03]' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-lg"
                  style={{
                    background: isLiveNow ? 'rgba(0,255,102,0.15)' : 'rgba(124,92,252,0.14)',
                    color: isLiveNow ? 'var(--neon-green)' : 'var(--neon-purple)',
                  }}
                >
                  <Video className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-white text-base">
                      {mentorProfile?.full_name ?? 'Mentor Session'}
                    </h2>
                    <span className="text-xs text-text-muted">
                      ({mentorProfile?.title ?? 'Interview Coach'})
                    </span>

                    {isLiveNow && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 animate-pulse">
                        LIVE NOW
                      </span>
                    )}

                    {isConfirmed && isExpired && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-text-muted border border-white/10">
                        SESSION TIME EXPIRED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neon-green" />
                      {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-neon-cyan" />
                      {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs mt-2 text-text-muted">
                    {session.status === 'pending'
                      ? 'Your booking request is awaiting mentor confirmation.'
                      : isConfirmed && !isExpired
                      ? 'Session confirmed! Your live interview room is open for your scheduled time.'
                      : isConfirmed && isExpired
                      ? 'Scheduled session time has ended. Entry to live room is closed.'
                      : session.status === 'completed'
                      ? 'Session completed. Mentor evaluation and feedback recorded.'
                      : `Status: ${session.status}`}
                  </p>
                </div>
              </div>

              {/* Status Badge & Room Access Actions */}
              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <span className={`badge-purple capitalize text-xs px-3 py-1 ${
                  session.status === 'confirmed' ? 'bg-neon-green/15 text-neon-green border-neon-green/30' : ''
                }`}>
                  {session.status}
                </span>

                {/* Only allow joining meeting room if confirmed AND session time HAS NOT EXPIRED */}
                {isConfirmed && !isExpired && (
                  <Link
                    href={roomUrl}
                    className="btn-neon-green text-xs py-2 px-4 flex items-center gap-2 shadow-lg"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Interview Room</span>
                  </Link>
                )}

                {/* View Notes Modal Button for Completed or Session View */}
                {(session.status === 'completed' || session.mentor_feedback || isExpired) && (
                  <button
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    className="btn-ghost text-xs py-2 px-4 flex items-center gap-2 border-white/10 text-neon-cyan hover:bg-neon-cyan/10 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Session &amp; Notes</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {sessions.length === 0 && (
          <div className="card p-12 text-center rounded-2xl">
            <Calendar className="w-10 h-10 mx-auto text-neon-cyan mb-3" />
            <p className="font-bold text-white text-lg">No mentor sessions yet</p>
            <p className="text-sm mt-1 text-text-secondary">
              Book a session with an expert software engineer or mentor from the Mentors page.
            </p>
            <Link href="/mentors" className="btn-neon-green text-xs py-2 px-4 inline-flex items-center gap-2 mt-4">
              Find a Mentor
            </Link>
          </div>
        )}
      </div>

      {/* ── Modal: View Session Feedback & Notes ───────────────────────── */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="card rounded-2xl p-6 max-w-xl w-full space-y-5 border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">Session Feedback &amp; Evaluation</h2>
                  <p className="text-xs text-text-secondary">
                    Mentor: <span className="font-bold text-white">{selectedSession.mentors?.[0]?.profiles?.[0]?.full_name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score & Badge */}
            {selectedSession.mentor_score !== null && selectedSession.mentor_score !== undefined && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-white">Overall Performance Score</span>
                </div>
                <span className="text-xl font-black font-mono text-neon-green">
                  {selectedSession.mentor_score} / 100
                </span>
              </div>
            )}

            {/* Detailed Feedback Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Mentor Feedback &amp; Recommendations
              </label>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-sm text-text-primary leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedSession.mentor_feedback ? (
                  selectedSession.mentor_feedback
                ) : (
                  <span className="text-text-muted italic flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    No feedback comments submitted by mentor yet.
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Notes if any */}
            {selectedSession.candidate_notes && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Your Preparation Notes
                </label>
                <p className="text-xs text-text-secondary bg-white/[0.02] p-3 rounded-lg border border-white/[0.05]">
                  {selectedSession.candidate_notes}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="btn-ghost text-xs px-5 py-2"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
