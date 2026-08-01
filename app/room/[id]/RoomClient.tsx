'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video, Code2, FileText, ArrowLeft, Clock, Calendar, CheckCircle2,
  ExternalLink, Copy, Check, Users, Shield, Sparkles, MessageSquare,
  Edit3, Save, Star, Loader2, Maximize2, RefreshCw
} from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import toast from 'react-hot-toast';

interface RoomClientProps {
  booking: any;
  candidateProfile: any;
  currentUserRole: 'candidate' | 'mentor';
  userId: string;
}

export default function RoomClient({
  booking,
  candidateProfile,
  currentUserRole,
  userId,
}: RoomClientProps) {
  const router = useRouter();
  const mentor = booking.mentors;
  const mentorProfile = mentor?.profiles;

  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Notes & evaluation state
  const [candidateNotes, setCandidateNotes] = useState(booking.candidate_notes || '');
  const [mentorFeedback, setMentorFeedback] = useState(booking.mentor_feedback || '');
  const [mentorScore, setMentorScore] = useState(booking.mentor_score || 85);
  const [saving, setSaving] = useState(false);

  // Time calculations & live countdown
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isLive, setIsLive] = useState(false);

  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
  const roomName = `ai-interview-palestine-${booking.room_code || booking.id.slice(0, 8)}`;
  
  // Check if session link is custom Google Meet or external URL
  const isCustomExternalLink = booking.session_link && (
    booking.session_link.includes('meet.google.com') ||
    booking.session_link.includes('zoom.us') ||
    booking.session_link.includes('teams.microsoft.com')
  );

  const embedVideoUrl = isCustomExternalLink
    ? booking.session_link
    : `https://${jitsiDomain}/${roomName}#config.prejoinPageEnabled=false`;

  useEffect(() => {
    function updateTimer() {
      const start = new Date(booking.start_at).getTime();
      const end = new Date(booking.end_at).getTime();
      const now = new Date().getTime();

      if (now >= start && now <= end) {
        setIsLive(true);
        const minsLeft = Math.floor((end - now) / 60000);
        setTimeRemaining(`Live session (${minsLeft} mins left)`);
      } else if (now < start) {
        setIsLive(false);
        const minsToStart = Math.floor((start - now) / 60000);
        if (minsToStart > 60) {
          const hours = Math.floor(minsToStart / 60);
          setTimeRemaining(`Starts in ${hours}h ${minsToStart % 60}m`);
        } else {
          setTimeRemaining(`Starts in ${minsToStart} minutes`);
        }
      } else {
        setIsLive(false);
        setTimeRemaining('Session ended');
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 10000);
    return () => clearInterval(interval);
  }, [booking]);

  const handleCopyLink = () => {
    const fullRoomUrl = window.location.href;
    navigator.clipboard.writeText(fullRoomUrl);
    setCopiedLink(true);
    toast.success('Interview room link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveCodeSnapshot = async (code: string) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}/room`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeSnapshot: code }),
      });
      if (!res.ok) throw new Error('Failed to save code');
      toast.success('Code snapshot saved!');
    } catch (err: any) {
      toast.error('Could not save code snapshot');
    }
  };

  const handleSaveNotesOrEvaluation = async () => {
    setSaving(true);
    try {
      const payload: any = {};
      if (currentUserRole === 'candidate') {
        payload.candidateNotes = candidateNotes;
      } else {
        payload.mentorFeedback = mentorFeedback;
        payload.mentorScore = mentorScore;
      }

      const res = await fetch(`/api/bookings/${booking.id}/room`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save feedback');
      toast.success('Session notes updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving notes');
    } finally {
      setSaving(false);
    }
  };

  const backLink = currentUserRole === 'mentor' ? '/mentor/sessions' : '/sessions';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-black/80 border-b border-white/10 flex items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href={backLink}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Sessions"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Session Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">
                Interview Session with {currentUserRole === 'candidate' ? (mentorProfile?.full_name || 'Mentor') : (candidateProfile?.full_name || 'Candidate')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isLive ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-white/10 text-text-secondary'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-neon-green animate-ping' : 'bg-text-muted'}`} />
                {isLive ? 'LIVE' : 'UPCOMING'}
              </span>
            </div>

            <div className="text-xs text-text-muted flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2">
          {/* Toggle Code Editor */}
          <button
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showCodeEditor
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-lg'
                : 'bg-white/5 text-text-secondary hover:text-white border border-white/10 hover:bg-white/10'
            }`}
          >
            <Code2 className="w-4 h-4 text-neon-green" />
            <span className="hidden sm:inline">Code Editor</span>
          </button>

          {/* Toggle Notes Panel */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showNotes
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30 shadow-lg'
                : 'bg-white/5 text-text-secondary hover:text-white border border-white/10 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-neon-purple" />
            <span className="hidden sm:inline">{currentUserRole === 'mentor' ? 'Evaluation & Score' : 'My Notes'}</span>
          </button>

          {/* Copy Room Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-white border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy Room Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Main Stage: Video Meeting Call */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          {/* External Meeting Link Notice if Google Meet */}
          {isCustomExternalLink && (
            <div className="card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-neon-cyan/20 bg-neon-cyan/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-neon-cyan" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Google Meet Session Link Ready</h4>
                  <p className="text-xs text-text-secondary">
                    Your mentor set up a direct Google Meet conference link for this interview.
                  </p>
                </div>
              </div>
              <a
                href={booking.session_link}
                target="_blank"
                rel="noreferrer"
                className="btn-neon-green text-xs py-2 px-4 flex items-center gap-2 shrink-0"
              >
                Launch Google Meet <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Video Iframe Container */}
          <div className="flex-1 min-h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-black relative flex flex-col shadow-2xl">
            {!isCustomExternalLink ? (
              <iframe
                src={embedVideoUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write"
                className="w-full h-full min-h-[480px] border-0"
                title="Live Interview Video Room"
              />
            ) : (
              <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center p-8 text-center bg-gray-950 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">Google Meet Session Active</h3>
                <p className="text-sm text-text-secondary max-w-md">
                  Click the button below to join the Google Meet video conference in a new window, while keeping this code editor and notes screen open here!
                </p>
                <a
                  href={booking.session_link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon-green text-sm py-3 px-6 flex items-center gap-2 shadow-xl"
                >
                  <Video className="w-5 h-5" /> Join Google Meet Call <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Embedded Code Editor View (when toggled inside main stage on small screens) */}
          {showCodeEditor && (
            <div className="mt-4 animate-fade-up">
              <CodeEditor
                initialCode={booking.code_snapshot || undefined}
                onSaveSnapshot={handleSaveCodeSnapshot}
                height="450px"
              />
            </div>
          )}
        </div>

        {/* Right Side Drawer / Notes Panel */}
        {showNotes && (
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-gray-900/90 p-5 flex flex-col space-y-5 backdrop-blur-lg animate-fade-in overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-neon-purple" />
                {currentUserRole === 'mentor' ? 'Candidate Evaluation' : 'Candidate Personal Notes'}
              </h3>
              <button
                onClick={() => setShowNotes(false)}
                className="text-text-muted hover:text-white text-xs"
              >
                Close ✕
              </button>
            </div>

            {/* Candidate Info Card */}
            <div className="card p-3 rounded-xl flex items-center gap-3 bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center font-bold text-neon-purple">
                {(candidateProfile?.full_name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">{candidateProfile?.full_name || 'Candidate'}</p>
                <p className="text-text-muted">{candidateProfile?.email}</p>
              </div>
            </div>

            {/* Mentor Info Card */}
            <div className="card p-3 rounded-xl flex items-center gap-3 bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center font-bold text-neon-green">
                {(mentorProfile?.full_name || 'M').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">{mentorProfile?.full_name || 'Mentor'}</p>
                <p className="text-text-muted">{mentorProfile?.title || 'Interview Coach'}</p>
              </div>
            </div>

            {/* Role-based Notes Form */}
            {currentUserRole === 'mentor' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text-secondary">Overall Candidate Score</label>
                    <span className="font-mono font-bold text-neon-green text-sm">{mentorScore}/100</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={mentorScore}
                    onChange={(e) => setMentorScore(Number(e.target.value))}
                    className="w-full accent-neon-green cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Detailed Performance Feedback & Guidance
                  </label>
                  <textarea
                    rows={8}
                    value={mentorFeedback}
                    onChange={(e) => setMentorFeedback(e.target.value)}
                    placeholder="Write detailed recommendations on candidate's technical skills, communication, system design, and coding performance..."
                    className="input-dark text-xs resize-none w-full p-3 rounded-xl"
                  />
                </div>

                <button
                  onClick={handleSaveNotesOrEvaluation}
                  disabled={saving}
                  className="btn-neon-green w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Evaluation Report'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    My Interview Preparation Notes
                  </label>
                  <textarea
                    rows={8}
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    placeholder="Write down questions, key topics to discuss, or code ideas during your mentor session..."
                    className="input-dark text-xs resize-none w-full p-3 rounded-xl"
                  />
                </div>

                <button
                  onClick={handleSaveNotesOrEvaluation}
                  disabled={saving}
                  className="btn-neon-purple w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>

                {/* Show Mentor Feedback if available */}
                {booking.mentor_feedback && (
                  <div className="bg-neon-purple/10 border border-neon-purple/20 p-4 rounded-xl space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-300">Mentor Evaluation Received</span>
                      <span className="font-mono font-bold text-neon-green">{booking.mentor_score}/100</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{booking.mentor_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
