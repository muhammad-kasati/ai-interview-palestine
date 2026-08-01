'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, DollarSign, Briefcase, Award, Save, Plus, X, Loader2, Globe, Link2, GitBranch, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface MentorProfileSettingsClientProps {
  profile: any;
  mentor: any;
  userId: string;
}

const COMMON_SPECIALIZATIONS = [
  'Full-Stack', 'Backend', 'Frontend', 'System Design', 'Algorithms & Data Structures',
  'DevOps & Cloud', 'Mobile Development', 'ML & AI Engineering', 'Database Optimization',
  'Code Review', 'Behavioral Interviews'
];

export default function MentorProfileSettingsClient({
  profile,
  mentor,
  userId,
}: MentorProfileSettingsClientProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [title, setTitle] = useState(profile?.title ?? '');
  const [company, setCompany] = useState(profile?.company ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url ?? '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url ?? '');

  const [hourlyRate, setHourlyRate] = useState<number>(mentor?.hourly_rate_usd ?? 35);
  const [yearsExp, setYearsExp] = useState<number>(mentor?.years_experience ?? 5);
  const [specializations, setSpecializations] = useState<string[]>(mentor?.specializations ?? []);
  const [customTag, setCustomTag] = useState('');

  function handleAddTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations((prev) => [...prev, trimmed]);
    }
    setCustomTag('');
  }

  function handleRemoveTag(tag: string) {
    setSpecializations((prev) => prev.filter((t) => t !== tag));
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be 5 MB or less.'); return; }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/mentor/avatar', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Image upload failed.');
      setAvatarUrl(result.url);
      toast.success('Photo uploaded. Save your profile to publish it.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      // 1. Update Profiles table
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl || null,
          title,
          company,
          bio,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileErr) throw profileErr;

      // 2. Update Mentors table
      const { error: mentorErr } = await supabase
        .from('mentors')
        .update({
          hourly_rate_usd: hourlyRate,
          years_experience: yearsExp,
          specializations,
        })
        .eq('id', mentor.id);

      if (mentorErr) throw mentorErr;

      toast.success('Mentor profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating mentor profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-7 h-7 text-neon-cyan" />
            <h1 className="text-3xl font-black text-white">Mentor Profile & Rate</h1>
          </div>
          <p className="text-text-secondary text-sm">
            Customize your public mentor profile, session rates, and areas of technical expertise.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-neon-green flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Profile info */}
        <div className="md:col-span-2 space-y-6">
          <div className="card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="Mentor profile" className="w-20 h-20 rounded-2xl object-cover border" style={{ borderColor: 'rgba(0,217,126,.35)' }} /> : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: 'linear-gradient(135deg, rgba(124,92,252,.35), rgba(0,194,255,.28))' }}>{(fullName || 'M').charAt(0).toUpperCase()}</div>}
              {uploadingAvatar && <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/60"><Loader2 className="w-5 h-5 animate-spin text-neon-green" /></div>}
            </div>
            <div className="flex-1"><h2 className="font-bold text-white">Profile photo</h2><p className="text-xs mt-1">A clear photo helps candidates recognize and trust your mentor profile.</p><input ref={fileInputRef} onChange={handleAvatarChange} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" /><button type="button" disabled={uploadingAvatar} onClick={() => fileInputRef.current?.click()} className="btn-ghost text-xs mt-4"><Camera className="w-3.5 h-3.5 text-neon-cyan" />{uploadingAvatar ? 'Uploading…' : 'Upload photo'}</button></div>
          </div>
          <div className="card rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-neon-green" />
              Professional Background
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ahmad Al-Sayed"
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Current Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechCorp / Freelance"
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Years of Experience</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={yearsExp}
                  onChange={(e) => setYearsExp(Number(e.target.value))}
                  className="input-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Biography / About Me</label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your technical background, interview experience, and how you help candidates pass software engineering interviews..."
                className="input-dark resize-none"
              />
            </div>
          </div>

          {/* Specializations Card */}
          <div className="card rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-neon-cyan" />
              Specializations & Skills
            </h2>

            <div className="flex flex-wrap gap-2 mb-3">
              {specializations.map((spec) => (
                <span
                  key={spec}
                  className="badge-cyan text-xs py-1 px-3 flex items-center gap-1.5"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(spec)}
                    className="hover:text-red-400 cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(customTag);
                  }
                }}
                placeholder="Add skill (e.g. System Design)..."
                className="input-dark flex-1"
              />
              <button
                type="button"
                onClick={() => handleAddTag(customTag)}
                className="btn-cyan text-sm px-4"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="pt-2">
              <p className="text-xs text-text-muted mb-2">Popular choices:</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SPECIALIZATIONS.map((common) => (
                  <button
                    key={common}
                    type="button"
                    onClick={() => handleAddTag(common)}
                    disabled={specializations.includes(common)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      specializations.includes(common)
                        ? 'opacity-40 bg-white/5 text-text-muted border border-transparent'
                        : 'bg-white/5 text-text-secondary hover:bg-neon-cyan/10 hover:text-neon-cyan border border-white/10'
                    }`}
                  >
                    + {common}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Social Links */}
        <div className="space-y-6">
          <div className="card rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-green" />
              Session Rate ($USD)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Hourly Rate (USD)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-text-muted font-bold">$</span>
                <input
                  type="number"
                  min={10}
                  max={500}
                  step={5}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="input-dark pl-8 font-mono text-lg font-bold"
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                This rate will be displayed to candidates for 1-hour 1-on-1 sessions.
              </p>
            </div>
          </div>

          <div className="card rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-neon-cyan" />
              Social Profiles
            </h2>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-neon-cyan" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="input-dark text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-text-primary" /> GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="input-dark text-sm"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
