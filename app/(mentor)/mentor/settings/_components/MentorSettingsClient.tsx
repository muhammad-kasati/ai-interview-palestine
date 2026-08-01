'use client';

import { useState } from 'react';
import { BellRing, Eye, Loader2, Save, Settings2, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

type SettingsData = {
  booking_notifications: boolean;
  session_reminders: boolean;
  email_notifications: boolean;
  profile_visible: boolean;
  session_buffer_minutes: number;
};

const defaults: SettingsData = {
  booking_notifications: true,
  session_reminders: true,
  email_notifications: true,
  profile_visible: true,
  session_buffer_minutes: 15,
};

export default function MentorSettingsClient({ userId, initialSettings }: { userId: string; initialSettings: Partial<SettingsData> | null }) {
  const [settings, setSettings] = useState<SettingsData>({ ...defaults, ...initialSettings });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof Pick<SettingsData, 'booking_notifications' | 'session_reminders' | 'email_notifications' | 'profile_visible'>) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));

  async function save() {
    setSaving(true);
    const { error } = await createClient().from('mentor_settings').upsert({ profile_id: userId, ...settings, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success('Settings saved.');
  }

  const controls = [
    { key: 'booking_notifications' as const, label: 'Booking requests', description: 'Receive an in-app alert when a candidate requests a session.' },
    { key: 'session_reminders' as const, label: 'Session reminders', description: 'Receive reminders before confirmed mentor sessions.' },
    { key: 'email_notifications' as const, label: 'Email updates', description: 'Receive important booking changes in your inbox.' },
    { key: 'profile_visible' as const, label: 'Public mentor profile', description: 'Let candidates discover your verified mentor profile.' },
  ];

  return <div className="max-w-4xl mx-auto space-y-7">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><div className="badge-purple mb-3"><Settings2 className="w-3 h-3" /> Workspace preferences</div><h1 className="text-3xl font-black text-white">Mentor settings</h1><p className="mt-1">Control notifications, profile visibility, and session preparation time.</p></div>
      <button onClick={save} disabled={saving} className="btn-neon-green self-start sm:self-auto">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? 'Saving…' : 'Save settings'}</button>
    </header>

    <section className="card rounded-2xl p-6"><div className="flex gap-3 mb-5"><BellRing className="w-5 h-5 text-neon-cyan mt-0.5" /><div><h2 className="font-bold text-white">Notifications</h2><p className="text-xs mt-1">Choose the updates that help you keep sessions on track.</p></div></div><div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>{controls.slice(0, 3).map((control) => <ToggleRow key={control.key} {...control} enabled={settings[control.key]} onClick={() => toggle(control.key)} />)}</div></section>

    <section className="grid md:grid-cols-2 gap-5"><div className="card rounded-2xl p-6"><div className="flex gap-3"><Eye className="w-5 h-5 text-neon-green mt-0.5" /><div className="flex-1"><h2 className="font-bold text-white">Profile visibility</h2><p className="text-xs mt-1">Keep your listing available to candidates.</p><ToggleRow {...controls[3]} enabled={settings.profile_visible} onClick={() => toggle('profile_visible')} /></div></div></div><div className="card rounded-2xl p-6"><div className="flex gap-3"><Timer className="w-5 h-5 text-neon-purple mt-0.5" /><div className="flex-1"><h2 className="font-bold text-white">Session buffer</h2><p className="text-xs mt-1">Time blocked after each booked session.</p><select value={settings.session_buffer_minutes} onChange={(event) => setSettings((current) => ({ ...current, session_buffer_minutes: Number(event.target.value) }))} className="input-dark mt-4"><option value={0}>No buffer</option><option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>60 minutes</option></select></div></div></div></section>
  </div>;
}

function ToggleRow({ label, description, enabled, onClick }: { label: string; description: string; enabled: boolean; onClick: () => void }) {
  return <div className="py-4 flex items-center gap-4"><div className="flex-1"><p className="font-semibold text-sm text-white">{label}</p><p className="text-xs mt-1">{description}</p></div><button type="button" onClick={onClick} role="switch" aria-checked={enabled} className="w-11 h-6 rounded-full p-0.5 transition-colors" style={{ background: enabled ? 'var(--neon-green)' : 'rgba(255,255,255,.14)' }}><span className="block w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }} /></button></div>;
}
