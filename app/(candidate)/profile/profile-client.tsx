'use client';

import { useMemo, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, CheckCircle2, GitBranch, Link2, Loader2, Mail, Pencil, Save, Sparkles, UserRound, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type Form = {
  full_name: string;
  title: string;
  company: string;
  bio: string;
  linkedin_url: string;
  github_url: string;
  avatar_url: string;
};

const Github = GitBranch;
const Linkedin = Link2;

function Field({
  label,
  value,
  placeholder,
  onChange,
  Icon,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  Icon?: React.ElementType;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold flex items-center gap-1.5 text-text-secondary">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <input
        className="input-dark mt-1.5"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export default function ProfileClient({
  profile,
  userId,
  email,
}: {
  profile: Partial<Form> | null;
  userId: string;
  email: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState<Form>({
    full_name: profile?.full_name ?? '',
    title: profile?.title ?? '',
    company: profile?.company ?? '',
    bio: profile?.bio ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
    github_url: profile?.github_url ?? '',
    avatar_url: profile?.avatar_url ?? '',
  });

  const update = (key: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const completion = useMemo(
    () =>
      Math.round(
        (Object.values(form).filter(Boolean).length / Object.values(form).length) * 100
      ),
    [form]
  );

  async function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Convert to Data URL / Base64 for instant persistent display
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        update('avatar_url', base64Url);

        const supabase = createClient();
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64Url, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;
        toast.success('Profile picture updated!');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      toast.error('Failed to update avatar');
      setUploadingAvatar(false);
    }
  }

  async function save() {
    setSaving(true);
    const { error } = await createClient()
      .from('profiles')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', userId);
    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Your profile is updated successfully!');
    }
  }

  const initials = (form.full_name || email || 'U')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="badge-cyan mb-3 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Professional profile
          </div>
          <h1 className="text-3xl font-black text-white">Profile Settings</h1>
          <p className="mt-1 text-text-secondary text-sm">
            A complete profile helps mentors tailor every mock interview to your target roles.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-neon-green self-start sm:self-auto flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Left Profile Card */}
        <aside className="card rounded-2xl overflow-hidden h-fit border border-white/10">
          <div
            className="h-20"
            style={{
              background:
                'linear-gradient(120deg, rgba(0,217,126,.35), rgba(0,194,255,.25))',
            }}
          />
          <div className="px-6 pb-6 -mt-10">
            {/* Avatar Upload Frame */}
            <div className="relative group w-20 h-20">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt={form.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-black shadow-lg"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-black border-4 border-black"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--neon-green)',
                    boxShadow: '0 0 0 1px rgba(0,217,126,.35)',
                  }}
                >
                  {initials}
                </div>
              )}

              {/* Upload Trigger Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-neon-green/40"
                title="Upload Profile Picture"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neon-green" />
                ) : (
                  <Camera className="w-5 h-5 text-neon-green" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-neon-cyan hover:underline mt-2 flex items-center gap-1 cursor-pointer"
            >
              <ImageIcon className="w-3 h-3" /> Upload Photo
            </button>

            <h2 className="font-bold text-white text-lg mt-3">
              {form.full_name || 'Your name'}
            </h2>
            <p className="text-sm mt-0.5 text-text-secondary">{form.title || 'Interview candidate'}</p>

            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs">
                <span>Profile completion</span>
                <span className="font-bold text-neon-green">{completion}%</span>
              </div>
              <div
                className="h-2 rounded-full mt-2 overflow-hidden"
                style={{ background: 'rgba(255,255,255,.07)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${completion}%`,
                    background:
                      'linear-gradient(90deg,var(--neon-green),var(--neon-cyan))',
                  }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs text-text-secondary">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span className="truncate">{email}</span>
              </p>
              {form.company && (
                <p className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                  <span>{form.company}</span>
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Form Fields */}
        <div className="space-y-5">
          <section className="card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-5">
              <UserRound className="w-5 h-5 text-neon-green" />
              <div>
                <h2 className="font-bold text-white text-base">Identity &amp; Career</h2>
                <p className="text-xs text-text-secondary">
                  The basic details mentors see prior to your session.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Full name"
                value={form.full_name}
                onChange={(value) => update('full_name', value)}
                placeholder="Your full name"
                Icon={UserRound}
              />
              <Field
                label="Job title"
                value={form.title}
                onChange={(value) => update('title', value)}
                placeholder="e.g. Frontend Developer"
                Icon={Briefcase}
              />
              <Field
                label="Company"
                value={form.company}
                onChange={(value) => update('company', value)}
                placeholder="Company or freelance"
                Icon={Briefcase}
              />
              <label className="block">
                <span className="text-xs font-semibold text-text-secondary">
                  Account email
                </span>
                <div className="input-dark mt-1.5 flex items-center gap-2 opacity-70">
                  <Mail className="w-4 h-4 text-neon-cyan" />
                  {email}
                </div>
              </label>
            </div>
          </section>

          <section className="card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Pencil className="w-5 h-5 text-neon-cyan" />
              <h2 className="font-bold text-white text-base">About Your Goals &amp; Target Roles</h2>
            </div>
            <textarea
              rows={5}
              className="input-dark resize-none"
              value={form.bio}
              onChange={(event) => update('bio', event.target.value)}
              placeholder="Share your background, target companies, and key focus areas for mock interviews…"
            />
            <p className="text-xs mt-2 text-text-muted">
              Mentors review this before your 1-on-1 interview session.
            </p>
          </section>

          <section className="card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-neon-purple" />
              <h2 className="font-bold text-white text-base">Professional Links</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="LinkedIn URL"
                value={form.linkedin_url}
                onChange={(value) => update('linkedin_url', value)}
                placeholder="https://linkedin.com/in/…"
                Icon={Linkedin}
              />
              <Field
                label="GitHub URL"
                value={form.github_url}
                onChange={(value) => update('github_url', value)}
                placeholder="https://github.com/…"
                Icon={Github}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
