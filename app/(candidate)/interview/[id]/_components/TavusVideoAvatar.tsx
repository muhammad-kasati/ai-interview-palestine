'use client';

import { useEffect, useState } from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';

interface TavusVideoAvatarProps {
  interviewId: string;
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  candidateName: string;
}

type SessionStatus = 'idle' | 'loading' | 'active' | 'error';

export default function TavusVideoAvatar({
  interviewId,
  jobRole,
  experienceLevel,
  techStack,
  candidateName,
}: TavusVideoAvatarProps) {
  const [status, setStatus]           = useState<SessionStatus>('idle');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);

  async function startSession() {
    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tavus/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId, jobRole, experienceLevel, techStack, candidateName }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? 'Failed to start video session');
        setStatus('error');
        return;
      }

      setConversationUrl(data.conversationUrl);
      setStatus('active');
    } catch {
      setErrorMsg('Network error — please check your connection');
      setStatus('error');
    }
  }

  if (status === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center animate-float" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,102,255,0.15))', border: '2px solid rgba(0,229,255,0.3)', boxShadow: 'var(--glow-cyan)' }}>
          <Video className="w-10 h-10" style={{ color: 'var(--neon-cyan)' }} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">Face-to-Face AI Interview</h3>
          <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            An AI video avatar powered by Tavus CVI will conduct your interview in real-time
          </p>
        </div>
        <button
          id="btn-start-video"
          onClick={startSession}
          className="btn-cyan"
        >
          <Video className="w-4 h-4" />
          Start Video Interview
        </button>
        <div className="badge-cyan text-xs">Powered by Tavus CVI</div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--neon-cyan)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Initializing your AI video interviewer…</p>
        <div className="badge-cyan">This may take a few seconds</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10" style={{ color: '#EF4444' }} />
        <p className="text-sm text-center" style={{ color: '#FCA5A5' }}>{errorMsg}</p>
        <button onClick={startSession} className="btn-ghost">Try Again</button>
      </div>
    );
  }

  if (status === 'active' && conversationUrl) {
    return (
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden min-h-0" style={{ border: '1px solid rgba(0,229,255,0.2)' }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(0,229,255,0.05)', borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
          <span className="pulse-dot" style={{ background: 'var(--neon-cyan)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--neon-cyan)' }}>Live · Tavus AI Interviewer</span>
        </div>
        <iframe
          src={conversationUrl}
          allow="camera; microphone; fullscreen"
          className="flex-1 w-full"
          style={{ border: 'none', minHeight: '300px' }}
          title="Tavus AI Video Interviewer"
        />
      </div>
    );
  }

  return null;
}
