'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic, MicOff, Video, Square, Clock, ChevronRight,
  ChevronLeft, Send, CheckCircle, Loader2, Code2, Brain
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import TavusVideoAvatar from './TavusVideoAvatar';

// Monaco Editor loaded client-side only (heavy bundle)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  order_index: number;
}

interface Evaluation {
  overall_score?: number;
  technical_score?: number;
  communication_score?: number;
  problem_solving_score?: number;
  strengths?: string[];
  improvements?: string[];
  gemini_report?: string;
}

interface InterviewData {
  id: string;
  mode: 'free' | 'audio' | 'video' | 'human';
  status: string;
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
}

interface InterviewRoomProps {
  interview: InterviewData;
  questions: Question[];
  evaluation: Evaluation | null;
  candidateName: string;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'var(--neon-green)',
  medium: '#FBBF24',
  hard:   '#EF4444',
};

const CATEGORY_COLOR: Record<string, string> = {
  technical:     'var(--neon-cyan)',
  behavioral:    '#A78BFA',
  system_design: '#FBBF24',
  coding:        'var(--neon-green)',
  situational:   '#FB923C',
};

export default function InterviewRoom({ interview, questions, evaluation: initialEvaluation, candidateName }: InterviewRoomProps) {
  const router = useRouter();
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState<Record<number, string>>({});
  const [code, setCode]           = useState('// Write your solution here\n');
  const [elapsed, setElapsed]     = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(initialEvaluation);
  const [textAnswer, setTextAnswer] = useState('');
  const [showCode, setShowCode]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCompleted = interview.status === 'completed' || evaluation !== null;

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isCompleted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const saveAnswer = useCallback(() => {
    if (textAnswer.trim()) {
      setAnswers((prev) => ({ ...prev, [currentQ]: textAnswer }));
    }
  }, [currentQ, textAnswer]);

  function nextQuestion() {
    saveAnswer();
    setTextAnswer(answers[currentQ + 1] ?? '');
    setCurrentQ((q) => Math.min(q + 1, questions.length - 1));
  }

  function prevQuestion() {
    saveAnswer();
    setTextAnswer(answers[currentQ - 1] ?? '');
    setCurrentQ((q) => Math.max(q - 1, 0));
  }

  async function handleSubmit() {
    saveAnswer();
    setSubmitting(true);

    const allAnswers = questions.map((q, i) => ({
      question: q.question,
      answer: answers[i] ?? '',
    }));

    const codeAnswer = code.trim() !== '// Write your solution here\n' ? `\n\nCode submission:\n\`\`\`\n${code}\n\`\`\`` : '';
    const transcript = allAnswers
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}${codeAnswer}`)
      .join('\n\n');

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId: interview.id, transcript, answers: allAnswers }),
      });
      const data = await res.json();
      setEvaluation({
        overall_score:         data.overallScore,
        technical_score:       data.technicalScore,
        communication_score:   data.communicationScore,
        problem_solving_score: data.problemSolvingScore,
        strengths:             data.strengths,
        improvements:          data.improvements,
        gemini_report:         data.report,
      });
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  // ── Evaluation / Results view ──────────────────────────────────────────────
  if (evaluation) {
    const score = evaluation.overall_score ?? 0;
    const scoreColor = score >= 70 ? 'var(--neon-green)' : score >= 50 ? '#FBBF24' : '#EF4444';

    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-fade-up">
        <div className="text-center card rounded-2xl p-10" style={{ border: '1px solid rgba(0,255,102,0.2)' }}>
          <CheckCircle className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--neon-green)' }} />
          <h1 className="text-3xl font-black text-white mb-2">Interview Complete!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's your Gemini AI evaluation</p>
          <div className="mt-6">
            <div className="text-7xl font-black" style={{ color: scoreColor, textShadow: `0 0 30px ${scoreColor}55` }}>
              {score.toFixed(0)}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Overall Score / 100</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="card rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Technical',       score: evaluation.technical_score ?? 0,       color: 'var(--neon-cyan)' },
              { label: 'Communication',   score: evaluation.communication_score ?? 0,   color: '#A78BFA' },
              { label: 'Problem Solving', score: evaluation.problem_solving_score ?? 0, color: '#FBBF24' },
            ].map(({ label, score: s, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="font-bold" style={{ color }}>{s.toFixed(0)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${s}%`, background: color, boxShadow: `0 0 8px ${color}66` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold mb-3" style={{ color: 'var(--neon-green)' }}>✓ Strengths</h3>
            <ul className="space-y-2">
              {evaluation.strengths?.map((s) => (
                <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--neon-green)' }} />{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold mb-3" style={{ color: '#FBBF24' }}>↑ Areas to Improve</h3>
            <ul className="space-y-2">
              {evaluation.improvements?.map((s) => (
                <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#FBBF24' }} />{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Report */}
        {evaluation.gemini_report && (
          <div className="card rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Detailed Report</h3>
            <div className="prose prose-invert text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {evaluation.gemini_report}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => router.push('/dashboard')} className="btn-neon-green flex-1 justify-center">
            Back to Dashboard
          </button>
          <button onClick={() => router.push('/mentors')} className="btn-ghost flex-1 justify-center">
            Book a Mentor
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];

  // ── Live Interview Room ────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="badge-green">
            <span className="pulse-dot" />
            {interview.mode === 'free' ? 'Text AI' : interview.mode === 'audio' ? 'Audio AI' : interview.mode === 'video' ? 'Video AI' : 'Human'}
          </div>
          <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
            {interview.jobRole.replace('_', ' ')} · {interview.experienceLevel}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Clock className="w-4 h-4" style={{ color: elapsed > 2700 ? '#EF4444' : 'var(--neon-green)' }} />
          <span className="font-mono font-bold text-sm" style={{ color: elapsed > 2700 ? '#EF4444' : 'var(--text-primary)' }}>
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

        {/* LEFT: AI Interviewer Panel */}
        <div className="card rounded-2xl p-5 flex flex-col min-h-0" style={{ border: '1px solid rgba(0,255,102,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">AI Interviewer</span>
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors lg:hidden"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <Code2 className="w-3.5 h-3.5" />
              {showCode ? 'Hide Code' : 'Code Editor'}
            </button>
          </div>

          {/* AI Mode View */}
          <div className="flex-1 flex flex-col min-h-0">
            {interview.mode === 'video' ? (
              <TavusVideoAvatar
                interviewId={interview.id}
                jobRole={interview.jobRole}
                experienceLevel={interview.experienceLevel}
                techStack={interview.techStack}
                candidateName={candidateName}
              />
            ) : interview.mode === 'audio' ? (
              <AudioVisualizer interviewId={interview.id} />
            ) : (
              /* Free text mode — show question prominently */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Brain className="w-12 h-12 mb-4" style={{ color: 'var(--neon-green)' }} />
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--neon-green)' }}>
                  Question {currentQ + 1} of {questions.length}
                </p>
                {question && (
                  <p className="text-xl font-semibold text-white leading-relaxed">
                    {question.question}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Question Card (audio/video modes) */}
          {interview.mode !== 'free' && question && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,255,102,0.04)', border: '1px solid rgba(0,255,102,0.12)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold" style={{ color: CATEGORY_COLOR[question.category] ?? 'var(--text-muted)' }}>
                  {question.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${DIFFICULTY_COLOR[question.difficulty] ?? '#888'}22`, color: DIFFICULTY_COLOR[question.difficulty] ?? '#888' }}>
                  {question.difficulty}
                </span>
              </div>
              <p className="text-sm font-medium text-white">{question.question}</p>
            </div>
          )}
        </div>

        {/* RIGHT: Code Editor / Answer Panel */}
        <div className={`card rounded-2xl flex flex-col min-h-0 ${showCode ? 'flex' : 'hidden lg:flex'}`} style={{ border: '1px solid rgba(0,229,255,0.1)' }}>
          <div className="flex items-center justify-between p-4 pb-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
              <span className="text-sm font-semibold text-white">Code Editor</span>
            </div>
            {/* Question Nav */}
            <div className="flex items-center gap-2">
              <button onClick={prevQuestion} disabled={currentQ === 0} className="p-1.5 rounded-lg transition-colors" style={{ color: currentQ === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: currentQ === 0 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentQ + 1}/{questions.length}</span>
              <button onClick={nextQuestion} disabled={currentQ === questions.length - 1} className="p-1.5 rounded-lg transition-colors" style={{ color: currentQ === questions.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: currentQ === questions.length - 1 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0 p-3">
            <MonacoEditor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 8, bottom: 8 },
                lineNumbersMinChars: 3,
              }}
            />
          </div>

          {/* Text Answer Area */}
          <div className="p-3 pt-0">
            {question && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                  Your answer to: {question.question.slice(0, 60)}…
                </div>
                <textarea
                  id="text-answer"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here, or use the code editor above…"
                  rows={4}
                  className="w-full p-3 text-sm resize-none outline-none"
                  style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => { saveAnswer(); setCurrentQ(i); setTextAnswer(answers[i] ?? ''); }}
              className="w-7 h-7 rounded-full text-xs font-bold transition-all"
              style={{
                background: i === currentQ ? 'var(--neon-green)' : answers[i] ? 'rgba(0,255,102,0.2)' : 'rgba(255,255,255,0.07)',
                color: i === currentQ ? '#050608' : answers[i] ? 'var(--neon-green)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          id="btn-submit-interview"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-neon-green"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? 'Evaluating…' : 'Submit & Get Report'}
        </button>
      </div>
    </div>
  );
}
