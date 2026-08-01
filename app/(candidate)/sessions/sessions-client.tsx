'use client';

import Link from 'next/link';
import { Calendar, Clock3, ExternalLink, Video, CheckCircle, FileText, Code2, Sparkles } from 'lucide-react';

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
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-neon-green" /> My Mentor Sessions
          </h1>
          <p className="mt-1 text-text-secondary text-sm">
            Track booking confirmations, join your live video interview room, and review mentor feedback.
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
          const isLiveNow = isConfirmed && now >= startDate && now <= endDate;

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
                      : session.status === 'confirmed'
                      ? 'Session confirmed! Your live interview room with integrated code editor is ready.'
                      : session.status === 'completed'
                      ? 'Session completed. Evaluation and rating recorded.'
                      : `Status: ${session.status}`}
                  </p>
                </div>
              </div>

              {/* Status Badge & Room Access Button */}
              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <span className={`badge-purple capitalize text-xs px-3 py-1 ${
                  session.status === 'confirmed' ? 'bg-neon-green/15 text-neon-green border-neon-green/30' : ''
                }`}>
                  {session.status}
                </span>

                {isConfirmed && (
                  <Link
                    href={roomUrl}
                    className="btn-neon-green text-xs py-2 px-4 flex items-center gap-2 shadow-lg"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Interview Room</span>
                  </Link>
                )}

                {session.status === 'completed' && (
                  <Link
                    href={roomUrl}
                    className="btn-ghost text-xs py-2 px-4 flex items-center gap-2 border-white/10 text-neon-cyan"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Session & Notes</span>
                  </Link>
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
    </div>
  );
}
