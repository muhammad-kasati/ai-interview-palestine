'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import SetupWizard from '../../dashboard/_components/SetupWizard';

interface InterviewConfig { jobRole: string; experienceLevel: string; techStack: string[]; mode: string; targetMarket: string; resumeUrl?: string; }

export default function NewInterviewClient({ currentTier }: { currentTier: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  async function startInterview(config: InterviewConfig) {
    setCreating(true);
    try {
      const response = await fetch('/api/interview/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      const data = await response.json();
      if (data.interviewId) router.push(`/interview/${data.interviewId}`);
    } finally { setCreating(false); }
  }
  return <div className="max-w-5xl mx-auto space-y-7 animate-fade-up">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="badge-green mb-3"><Sparkles className="w-3 h-3" /> AI practice session</div><h1 className="text-3xl font-black text-white">New Interview</h1><p className="mt-1">Tailor a realistic mock interview to the role you want next.</p></div><button onClick={() => router.push('/dashboard')} className="btn-ghost self-start"><ArrowLeft className="w-4 h-4" /> Back to dashboard</button></div>
    {creating && <div className="card p-3 flex items-center gap-2 text-sm" style={{ color: 'var(--neon-green)' }}><Loader2 className="w-4 h-4 animate-spin" /> Creating your session…</div>}
    <SetupWizard onStart={startInterview as never} currentTier={currentTier} />
  </div>;
}
