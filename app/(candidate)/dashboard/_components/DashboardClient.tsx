'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SetupWizard from './SetupWizard';
import { Clock, CheckCircle, XCircle, Loader2, TrendingUp, Zap } from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  completed: { label: 'Completed', color: 'var(--neon-green)', Icon: CheckCircle },
  active:    { label: 'Active',    color: 'var(--neon-cyan)',  Icon: Loader2 },
  cancelled: { label: 'Cancelled', color: '#EF4444',           Icon: XCircle },
  pending:   { label: 'Pending',   color: 'var(--text-muted)', Icon: Clock },
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{greeting},</p>
          <h1 className="text-3xl font-black text-white">
            {userName.split(' ')[0]} 👋
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Ready to practice? Set up your interview session below.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Current Plan</div>
          <div className={`${currentTier === 'premium' ? 'badge-cyan' : currentTier === 'standard' ? 'badge-green' : currentTier === 'human' ? 'badge-purple' : 'badge-green'} text-sm`}>
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      {recentInterviews.length > 0 && (
        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
            Recent Interviews
          </h2>
          <div className="space-y-3">
            {recentInterviews.map((iv) => {
              const score = iv.interview_evaluations?.[0]?.overall_score;
              const sc = STATUS_CONFIG[iv.status] ?? STATUS_CONFIG.pending;
              const { Icon, label, color } = sc;
              return (
                <div
                  key={iv.id}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => router.push(`/interview/${iv.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <div>
                      <div className="text-sm font-medium text-white capitalize">
                        {iv.job_role.replace('_', ' ')} · {iv.experience_level}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {MODE_LABELS[iv.mode]} · {new Date(iv.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {score !== undefined && score !== null ? (
                      <div className="text-lg font-bold" style={{ color: score >= 70 ? 'var(--neon-green)' : score >= 50 ? '#FBBF24' : '#EF4444' }}>
                        {score.toFixed(0)}
                        <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>/100</span>
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color }}>{label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Setup Wizard */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" style={{ color: 'var(--neon-green)' }} />
          New Interview Session
        </h2>
        <SetupWizard onStart={handleStartInterview as any} />
      </div>
    </div>
  );
}
