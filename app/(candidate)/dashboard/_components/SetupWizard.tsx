'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud, Loader2, Mic, Video, Users, Brain,
  Code2, ChevronRight, FileText, Star, Zap, Globe
} from 'lucide-react';

type JobRole = 'fullstack' | 'backend' | 'frontend' | 'mobile' | 'devops' | 'system_design' | 'data_engineer' | 'ml_engineer';
type ExperienceLevel = 'junior' | 'mid' | 'senior';
type InterviewMode = 'free' | 'audio' | 'video' | 'human';
type TargetMarket = 'local_palestine' | 'global_remote';

const JOB_ROLES: { value: JobRole; label: string; icon: string }[] = [
  { value: 'fullstack',    label: 'Full-Stack',      icon: '⚡' },
  { value: 'backend',     label: 'Backend',         icon: '🔧' },
  { value: 'frontend',    label: 'Frontend',        icon: '🎨' },
  { value: 'mobile',      label: 'Mobile Dev',      icon: '📱' },
  { value: 'devops',      label: 'DevOps / SRE',    icon: '☁️' },
  { value: 'system_design', label: 'System Design', icon: '🏗️' },
  { value: 'data_engineer', label: 'Data Engineer', icon: '📊' },
  { value: 'ml_engineer', label: 'ML Engineer',     icon: '🤖' },
];

const TECH_TAGS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GraphQL',
  'React Native', 'Flutter', 'Spring Boot', 'Django', 'FastAPI', 'Linux', 'Git',
];

const MODES: { value: InterviewMode; label: string; desc: string; badge: string; badgeClass: string; Icon: React.ElementType; color: string; tier: string }[] = [
  { value: 'free',   label: 'Text AI',      desc: 'Chat-based Q&A',       badge: 'Free',     badgeClass: 'badge-green',  Icon: Brain, color: 'var(--neon-green)', tier: 'free' },
  { value: 'audio',  label: 'Audio AI',     desc: 'Voice via Vapi.ai',    badge: 'Standard', badgeClass: 'badge-green',  Icon: Mic,   color: 'var(--neon-green)', tier: 'standard' },
  { value: 'video',  label: 'Video Avatar', desc: 'Face-to-face Tavus',   badge: 'Premium',  badgeClass: 'badge-cyan',   Icon: Video, color: 'var(--neon-cyan)',  tier: 'premium' },
  { value: 'human',  label: 'Human Mentor', desc: '1-on-1 real session',  badge: 'Human',    badgeClass: 'badge-purple', Icon: Users, color: '#A78BFA',           tier: 'human' },
];

interface SetupWizardProps {
  onStart: (config: InterviewConfig) => void;
}

interface InterviewConfig {
  jobRole: JobRole;
  experienceLevel: ExperienceLevel;
  techStack: string[];
  mode: InterviewMode;
  targetMarket: TargetMarket;
  resumeUrl?: string;
}

export default function SetupWizard({ onStart }: SetupWizardProps) {
  const [jobRole, setJobRole]             = useState<JobRole>('fullstack');
  const [expLevel, setExpLevel]           = useState<ExperienceLevel>('junior');
  const [techStack, setTechStack]         = useState<string[]>([]);
  const [mode, setMode]                   = useState<InterviewMode>('free');
  const [targetMarket, setTargetMarket]   = useState<TargetMarket>('local_palestine');
  const [resumeFile, setResumeFile]       = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [parsing, setParsing]             = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [starting, setStarting]           = useState(false);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setResumeFile(file);
    setParsing(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.skills) {
        setExtractedSkills(data.skills);
        setTechStack(data.skills.slice(0, 6));
      }
    } catch {
      // Silently fail — user can select manually
    } finally {
      setParsing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  function toggleTag(tag: string) {
    setTechStack((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleStart() {
    setStarting(true);
    onStart({ jobRole, experienceLevel: expLevel, techStack, mode, targetMarket });
  }

  return (
    <div className="space-y-8">

      {/* ── Resume Upload ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: 'var(--neon-green)' }} />
          Resume Upload
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>(optional — Gemini will parse it)</span>
        </h2>

        <div
          {...getRootProps()}
          className="mt-4 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: isDragActive ? 'rgba(0,255,102,0.5)' : 'rgba(255,255,255,0.1)',
            background:  isDragActive ? 'rgba(0,255,102,0.04)' : 'transparent',
          }}
        >
          <input {...getInputProps()} id="resume-upload" />
          {parsing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--neon-green)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gemini is parsing your resume…</p>
            </div>
          ) : resumeFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8" style={{ color: 'var(--neon-green)' }} />
              <p className="text-sm font-medium text-white">{resumeFile.name}</p>
              {extractedSkills.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--neon-green)' }}>
                  ✓ Extracted {extractedSkills.length} skills
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <UploadCloud className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Drag & drop your PDF resume, or <span style={{ color: 'var(--neon-green)' }}>click to browse</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF only · Max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Job Role ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
          Job Role
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {JOB_ROLES.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setJobRole(value)}
              id={`role-${value}`}
              className="p-3 rounded-xl text-sm font-medium text-left transition-all"
              style={{
                background: jobRole === value ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: jobRole === value ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                color: jobRole === value ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <span className="text-base mb-1 block">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Experience Level ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" style={{ color: 'var(--neon-green)' }} />
          Experience Level
        </h2>
        <div className="flex gap-3">
          {(['junior', 'mid', 'senior'] as ExperienceLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setExpLevel(lvl)}
              id={`level-${lvl}`}
              className="flex-1 py-3 px-5 rounded-xl font-medium text-sm capitalize transition-all"
              style={{
                background: expLevel === lvl ? 'rgba(0,255,102,0.12)' : 'rgba(255,255,255,0.03)',
                border: expLevel === lvl ? '1px solid rgba(0,255,102,0.4)' : '1px solid rgba(255,255,255,0.07)',
                color: expLevel === lvl ? 'var(--neon-green)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {lvl === 'mid' ? 'Mid-Level' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: 'var(--neon-green)' }} />
          Tech Stack
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {techStack.length > 0 ? `${techStack.length} selected` : 'Select your technologies'}
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              id={`tag-${tag.toLowerCase().replace('.', '-')}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: techStack.includes(tag) ? 'rgba(0,255,102,0.12)' : 'rgba(255,255,255,0.04)',
                border: techStack.includes(tag) ? '1px solid rgba(0,255,102,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: techStack.includes(tag) ? 'var(--neon-green)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Target Market ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
          Target Market
        </h2>
        <div className="flex gap-3">
          {([
            { value: 'local_palestine', label: '🇵🇸 Palestinian Local',    desc: 'Gaza, WB, local tech companies' },
            { value: 'global_remote',  label: '🌐 Global Remote',          desc: 'International & remote roles' },
          ] as { value: TargetMarket; label: string; desc: string }[]).map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setTargetMarket(value)}
              id={`market-${value}`}
              className="flex-1 p-4 rounded-xl text-left transition-all"
              style={{
                background: targetMarket === value ? 'rgba(0,229,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: targetMarket === value ? '1px solid rgba(0,229,255,0.35)' : '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
              }}
            >
              <div className="font-semibold text-sm text-white mb-1">{label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Interview Mode ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5" style={{ color: 'var(--neon-green)' }} />
          Interview Mode
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MODES.map(({ value, label, desc, badge, badgeClass, Icon, color }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              id={`mode-${value}`}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: mode === value ? `${color}14` : 'rgba(255,255,255,0.03)',
                border: mode === value ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
              }}
            >
              <Icon className="w-6 h-6 mb-3" style={{ color: mode === value ? color : 'var(--text-muted)' }} />
              <div className={`${badgeClass} text-xs mb-2`}>{badge}</div>
              <div className="font-semibold text-sm text-white">{label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Start Button ── */}
      <button
        id="btn-start-interview"
        onClick={handleStart}
        disabled={starting || techStack.length === 0}
        className="btn-neon-green w-full justify-center text-lg"
        style={{ padding: '1rem', opacity: (starting || techStack.length === 0) ? 0.6 : 1 }}
      >
        {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
        {starting ? 'Creating session…' : 'Start Interview Session'}
      </button>
      {techStack.length === 0 && (
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)', marginTop: '-1rem' }}>
          Please select at least one technology
        </p>
      )}
    </div>
  );
}
