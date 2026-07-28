'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, MicOff, PhoneOff, Loader2, Volume2 } from 'lucide-react';

interface AudioVisualizerProps {
  interviewId: string;
}

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

export default function AudioVisualizer({ interviewId }: AudioVisualizerProps) {
  const vapiRef             = useRef<InstanceType<typeof Vapi> | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [muted, setMuted]   = useState(false);
  const [volumes, setVolumes] = useState<number[]>(Array(20).fill(0.15));
  const animFrameRef        = useRef<number | null>(null);
  const analyserRef         = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  async function startCall() {
    setStatus('connecting');

    // Fetch Vapi token from server
    const tokenRes = await fetch('/api/vapi/token', { method: 'POST' });
    const { token } = await tokenRes.json();

    const vapi = new Vapi(token);
    vapiRef.current = vapi;

    vapi.on('call-start', () => setStatus('active'));
    vapi.on('call-end',   () => { setStatus('ended'); setVolumes(Array(20).fill(0.15)); });
    vapi.on('error',      () => setStatus('error'));

    vapi.on('volume-level', (level: number) => {
      setVolumes((prev) => {
        const next = [...prev.slice(1), Math.min(level * 2, 1)];
        return next;
      });
    });

    try {
      await vapi.start({
        transcriber: { provider: 'deepgram', model: 'nova-2', language: 'en-US' },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional technical interviewer conducting a mock interview. 
Interview ID: ${interviewId}. 
Be conversational, ask one question at a time, and provide brief encouraging feedback.
Keep responses concise (2-3 sentences max per turn).`,
            },
          ],
        },
        voice: { provider: 'openai', voiceId: 'alloy' },
      });
    } catch {
      setStatus('error');
    }
  }

  function stopCall() {
    vapiRef.current?.stop();
    setStatus('ended');
  }

  function toggleMute() {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!muted);
      setMuted(!muted);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">

      {/* Waveform */}
      <div className="flex items-center gap-1 h-20">
        {volumes.map((vol, i) => (
          <div
            key={i}
            className="w-2 rounded-full transition-all"
            style={{
              height: `${Math.max(8, vol * 72)}px`,
              background: status === 'active'
                ? `linear-gradient(180deg, var(--neon-green), var(--neon-cyan))`
                : 'rgba(255,255,255,0.12)',
              boxShadow: status === 'active' && vol > 0.3
                ? '0 0 8px rgba(0,255,102,0.5)'
                : 'none',
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Status */}
      <div className="text-center">
        {status === 'idle' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Click Start to begin the voice interview</p>
        )}
        {status === 'connecting' && (
          <div className="flex items-center gap-2" style={{ color: 'var(--neon-green)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">Connecting to AI interviewer…</p>
          </div>
        )}
        {status === 'active' && (
          <div className="flex items-center gap-2">
            <span className="pulse-dot" />
            <p className="text-sm font-medium" style={{ color: 'var(--neon-green)' }}>Live · AI Interviewer is listening</p>
          </div>
        )}
        {status === 'ended' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Session ended. Submit your answers above.</p>
        )}
        {status === 'error' && (
          <p className="text-sm" style={{ color: '#EF4444' }}>Connection error. Check your API key and try again.</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === 'idle' || status === 'error' ? (
          <button
            id="btn-start-audio"
            onClick={startCall}
            className="btn-neon-green"
          >
            <Mic className="w-4 h-4" />
            Start Voice Interview
          </button>
        ) : status === 'connecting' ? (
          <button disabled className="btn-ghost opacity-50">
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting…
          </button>
        ) : status === 'active' ? (
          <>
            <button
              id="btn-toggle-mute"
              onClick={toggleMute}
              className="p-3 rounded-xl transition-all"
              style={{ background: muted ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer' }}
            >
              {muted ? <MicOff className="w-5 h-5" style={{ color: '#EF4444' }} /> : <Mic className="w-5 h-5" style={{ color: 'var(--neon-green)' }} />}
            </button>
            <button
              id="btn-end-audio"
              onClick={stopCall}
              className="p-3 rounded-xl transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
            >
              <PhoneOff className="w-5 h-5" style={{ color: '#EF4444' }} />
            </button>
          </>
        ) : null}
      </div>

      {/* Tip */}
      {status === 'idle' && (
        <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)', color: 'var(--neon-cyan)' }}>
          <Volume2 className="w-3.5 h-3.5" />
          Make sure your microphone is enabled
        </div>
      )}
    </div>
  );
}
