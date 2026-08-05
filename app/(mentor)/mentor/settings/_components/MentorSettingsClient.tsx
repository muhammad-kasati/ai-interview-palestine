'use client';

import { useState } from 'react';
import { BellRing, Eye, Loader2, Save, Settings2, Timer, CheckCircle, ShieldCheck, Bell, Mail, Clock, Globe } from 'lucide-react';
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
            Control notifications, profile visibility, and session preparation time.
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn-neon-green self-start sm:self-auto text-xs py-2.5 px-5 flex items-center gap-2 shadow-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </header>

      {/* ── Notifications & Alerts ─────────────────────────── */}
      <section className="card rounded-2xl overflow-hidden border border-white/10">
        {/* Section header */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shrink-0">
            <BellRing className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Notifications &amp; Alerts</h2>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Choose which updates keep your sessions running smoothly.
            </p>
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <SettingRow
            Icon={Bell}
            iconBg="bg-neon-cyan/10"
            iconColor="text-neon-cyan"
            label="Booking requests"
            description="Receive an in-app alert when a candidate requests a session."
            enabled={settings.booking_notifications}
            onClick={() => toggle('booking_notifications')}
          />
          <SettingRow
            Icon={Clock}
            iconBg="bg-neon-amber/10"
            iconColor="text-neon-amber"
            label="Session reminders"
            description="Receive reminders 1 hour before and at the start of each session."
            enabled={settings.session_reminders}
            onClick={() => toggle('session_reminders')}
          />
          <SettingRow
            Icon={Mail}
            iconBg="bg-neon-blue/10"
            iconColor="text-neon-blue"
            label="Email updates"
            description="Receive booking updates and meeting details directly to your inbox."
            enabled={settings.email_notifications}
            onClick={() => toggle('email_notifications')}
          />
        </div>
      </section>

      {/* ── Profile Visibility + Buffer Time ──────────────── */}
      <section className="card rounded-2xl overflow-hidden border border-white/10">
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green shrink-0">
            <Globe className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Visibility &amp; Session Buffer</h2>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Control your public listing and automatic break time after sessions.
            </p>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <SettingRow
            Icon={Eye}
            iconBg="bg-neon-green/10"
            iconColor="text-neon-green"
            label="Public mentor profile"
            description="Make your mentor profile visible to candidates searching for coaching."
            enabled={settings.profile_visible}
            onClick={() => toggle('profile_visible')}
          />
          {/* Buffer Time selector row */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shrink-0">
                <Timer className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Session buffer time</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Automatic break blocked after each completed booking.
                </p>
              </div>
            </div>
            <select
              value={settings.session_buffer_minutes}
              onChange={(e) =>
                setSettings((c) => ({ ...c, session_buffer_minutes: Number(e.target.value) }))
              }
              className="input-dark text-xs py-2 px-3 rounded-xl border border-white/10 bg-black/40 text-white focus:border-neon-purple shrink-0 min-w-[160px]"
            >
              <option value={0}>No buffer (Back-to-back)</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes (Recommended)</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Save reminder banner ───────────────────────────── */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(0,217,126,0.06)', border: '1px solid rgba(0,217,126,0.15)' }}>
        <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />
        <span className="text-text-secondary">
          Changes are applied immediately in-app once you click <span className="font-semibold text-white">Save Settings</span>.
        </span>
      </div>
    </div>
  );
}

function SettingRow({
  Icon,
  iconBg,
  iconColor,
  label,
  description,
  enabled,
  onClick,
}: {
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold text-sm text-white">{label}</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed max-w-md">{description}</p>
        </div>
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

