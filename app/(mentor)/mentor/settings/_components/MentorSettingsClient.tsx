'use client';

import { useState } from 'react';
import { BellRing, Eye, Loader2, Save, Settings2, Timer, CheckCircle, ShieldCheck } from 'lucide-react';
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

export default function MentorSettingsClient({
  userId,
  initialSettings,
}: {
  userId: string;
  initialSettings: Partial<SettingsData> | null;
}) {
  const [settings, setSettings] = useState<SettingsData>({
    ...defaults,
    ...initialSettings,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (
    key: keyof Pick<
      SettingsData,
      | 'booking_notifications'
      | 'session_reminders'
      | 'email_notifications'
      | 'profile_visible'
    >
  ) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('mentor_settings').upsert({
        profile_id: userId,
        booking_notifications: settings.booking_notifications,
        session_reminders: settings.session_reminders,
        email_notifications: settings.email_notifications,
        profile_visible: settings.profile_visible,
        session_buffer_minutes: settings.session_buffer_minutes,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Workspace settings updated successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const controls = [
    {
      key: 'booking_notifications' as const,
      label: 'Booking requests',
      description: 'Receive an in-app alert when a candidate requests a session.',
    },
    {
      key: 'session_reminders' as const,
      label: 'Session reminders',
      description: 'Receive reminders 1 hour before and at the start of mentor sessions.',
    },
    {
      key: 'email_notifications' as const,
      label: 'Email updates',
      description: 'Receive important booking updates and meeting details in your inbox.',
    },
    {
      key: 'profile_visible' as const,
      label: 'Public mentor profile',
      description: 'Make your mentor profile visible to candidates looking for coaching.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-fade-up">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="badge-purple mb-3 inline-flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-neon-purple" /> Workspace preferences
          </div>
          <h1 className="text-3xl font-black text-white">Mentor Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Control notifications, profile visibility, and session buffer preparation time.
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn-neon-green self-start sm:self-auto text-xs py-2.5 px-5 flex items-center gap-2 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </header>

      {/* Notifications Card */}
      <section className="card rounded-2xl p-6 border border-white/10">
        <div className="flex gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Notifications & Alerts</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Choose the updates that keep your mentorship sessions running smoothly.
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.08]">
          {controls.slice(0, 3).map((control) => (
            <ToggleRow
              key={control.key}
              label={control.label}
              description={control.description}
              enabled={settings[control.key]}
              onClick={() => toggle(control.key)}
            />
          ))}
        </div>
      </section>

      {/* Profile Visibility & Buffer Time */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="card rounded-2xl p-6 border border-white/10">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-base">Profile Visibility</h2>
              <p className="text-xs text-text-secondary mt-0.5 mb-4">
                Keep your listing available to candidates across Palestine and remotely.
              </p>
              <ToggleRow
                label={controls[3].label}
                description={controls[3].description}
                enabled={settings.profile_visible}
                onClick={() => toggle('profile_visible')}
              />
            </div>
          </div>
        </div>

        <div className="card rounded-2xl p-6 border border-white/10">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-base">Session Buffer Time</h2>
              <p className="text-xs text-text-secondary mt-0.5 mb-4">
                Automatic break time blocked after each completed booking.
              </p>
              <select
                value={settings.session_buffer_minutes}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    session_buffer_minutes: Number(event.target.value),
                  }))
                }
                className="input-dark w-full text-xs py-2.5 px-3 rounded-xl border border-white/10 bg-black/40 text-white focus:border-neon-purple"
              >
                <option value={0}>No buffer (Back-to-back)</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Recommended)</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onClick,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="py-4 flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="font-semibold text-sm text-white">{label}</p>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClick}
        role="switch"
        aria-checked={enabled}
        className="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0"
        style={{
          background: enabled ? 'var(--neon-green)' : 'rgba(255,255,255,0.14)',
        }}
      >
        <span
          className="block w-5 h-5 rounded-full bg-white transition-transform shadow-md"
          style={{
            transform: enabled ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}
