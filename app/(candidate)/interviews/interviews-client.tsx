'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Clock3, Filter, Plus, RefreshCw, Search, Trophy } from 'lucide-react';

type Interview = { id: string; job_role: string; experience_level: string; mode: string; status: string; duration_seconds: number | null; created_at: string; interview_evaluations?: { overall_score?: number | null }[] };
type Stat = { label: string; value: string | number; sub: string; Icon: React.ElementType };

export default function InterviewsClient({ interviews }: { interviews: Interview[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const shown = useMemo(() => interviews.filter((item) => (filter === 'all' || item.status === filter) && item.job_role.toLowerCase().includes(query.toLowerCase())), [interviews, query, filter]);
  const completed = interviews.filter((item) => item.status === 'completed');
  const scores = completed.map((item) => item.interview_evaluations?.[0]?.overall_score).filter((score): score is number => typeof score === 'number');
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const stats: Stat[] = [
    { label: 'Total', value: interviews.length, Icon: BarChart3, sub: 'All interviews' },
    { label: 'Completed', value: completed.length, Icon: Trophy, sub: 'Successfully finished' },
    { label: 'Avg score', value: `${average}%`, Icon: Trophy, sub: 'Performance average' },
    { label: 'Practice time', value: `${Math.round(interviews.reduce((sum, item) => sum + (item.duration_seconds ?? 0), 0) / 60)}m`, Icon: Clock3, sub: 'Time invested' },
  ];
  return <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
    <div className="flex flex-col sm:flex-row justify-between gap-4"><div><h1 className="text-3xl font-black text-white">Recent Interviews</h1><p className="mt-1">Review your past interview sessions and track your progress.</p></div><div className="flex gap-2"><button onClick={() => window.location.reload()} className="btn-ghost"><RefreshCw className="w-4 h-4" /> Refresh</button><Link href="/interview/new" className="btn-neon-green"><Plus className="w-4 h-4" /> New interview</Link></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map(({ label, value, Icon, sub }) => <div key={label} className="stat-card"><Icon className="w-4 h-4 text-neon-cyan mb-3" /><p className="text-xs">{label}</p><p className="text-2xl font-bold text-white mt-1">{value}</p><p className="text-[10px] mt-1">{sub}</p></div>)}</div>
    <div className="card p-4 flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} /><input className="input-dark pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by role…" /></div><div className="flex gap-2">{[['all', 'All'], ['completed', 'Completed'], ['active', 'In progress']].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className="btn-ghost text-xs px-3" style={{ color: filter === value ? 'var(--neon-green)' : undefined }}><Filter className="w-3 h-3" />{label}</button>)}</div></div>
    <div className="space-y-3">{shown.map((item) => <Link href={`/interview/${item.id}`} key={item.id} className="card card-hover p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: 'rgba(0,194,255,.12)', color: 'var(--neon-cyan)' }}>{item.job_role.slice(0, 2).toUpperCase()}</div><div><h2 className="font-bold text-white capitalize">{item.job_role.replace('_', ' ')} practice</h2><p className="text-xs capitalize">{item.experience_level} · {item.mode} · {new Date(item.created_at).toLocaleDateString()}</p></div></div><span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: item.status === 'completed' ? 'rgba(0,217,126,.12)' : 'rgba(0,194,255,.12)', color: item.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)' }}>{item.status}</span></Link>)}{shown.length === 0 && <div className="card p-12 text-center"><p className="text-white font-semibold">No interviews found</p><p className="text-sm mt-1">Start a new session to see it here.</p></div>}</div>
  </div>;
}
