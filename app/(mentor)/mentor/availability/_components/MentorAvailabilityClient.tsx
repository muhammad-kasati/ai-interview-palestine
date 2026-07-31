'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock, Save, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DAY_NAMES, MentorAvailability } from '@/lib/types';
import toast from 'react-hot-toast';

interface MentorAvailabilityClientProps {
  mentorId: string;
  initialAvailability: MentorAvailability[];
}

export default function MentorAvailabilityClient({
  mentorId,
  initialAvailability,
}: MentorAvailabilityClientProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState(
    initialAvailability[0]?.timezone ?? 'Asia/Gaza'
  );

  // Initialize state for each day (0 = Sun, ..., 6 = Sat)
  const [schedule, setSchedule] = useState<{
    [dayIndex: number]: {
      id?: string;
      isActive: boolean;
      startTime: string;
      endTime: string;
    };
  }>(() => {
    const map: Record<number, { id?: string; isActive: boolean; startTime: string; endTime: string }> = {};
    DAY_NAMES.forEach((_, idx) => {
      const existing = initialAvailability.find((a) => a.day_of_week === idx);
      map[idx] = {
        id: existing?.id,
        isActive: existing ? existing.is_active : false,
        startTime: existing?.start_time ?? '09:00',
        endTime: existing?.end_time ?? '17:00',
      };
    });
    return map;
  });

  const timeOptions = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const hStr = hour.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    return `${hStr}:${mStr}`;
  });

  function handleToggleDay(dayIndex: number) {
    setSchedule((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        isActive: !prev[dayIndex].isActive,
      },
    }));
  }

  function handleTimeChange(dayIndex: number, field: 'startTime' | 'endTime', value: string) {
    setSchedule((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value,
      },
    }));
  }

  async function handleSaveSchedule() {
    const invalidDay = DAY_NAMES.find((_, dayIndex) => {
      const slot = schedule[dayIndex];
      return slot.isActive && slot.startTime >= slot.endTime;
    });
    if (invalidDay) {
      toast.error(`${invalidDay}: end time must be later than start time.`);
      return;
    }

    setSaving(true);
    try {
      // Upsert rows into mentor_availability table
      const upsertData = DAY_NAMES.map((_, dayIndex) => {
        const slot = schedule[dayIndex];
        return {
          ...(slot.id ? { id: slot.id } : {}),
          mentor_id: mentorId,
          day_of_week: dayIndex,
          start_time: slot.startTime,
          end_time: slot.endTime,
          timezone,
          is_active: slot.isActive,
        };
      });

      const { error } = await supabase
        .from('mentor_availability')
        .upsert(upsertData, { onConflict: 'mentor_id,day_of_week' });

      if (error) throw error;
      toast.success('Availability schedule saved successfully!');
    } catch (err: any) {
      console.error('Error saving availability:', err);
      toast.error(err.message || 'Failed to save availability schedule');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-7 h-7 text-neon-green" />
            <h1 className="text-3xl font-black text-white">Availability Settings</h1>
          </div>
          <p className="text-text-secondary text-sm">
            Set your weekly recurring hours so candidates can book 1-on-1 mock interview sessions.
          </p>
        </div>

        <button
          onClick={handleSaveSchedule}
          disabled={saving}
          className="btn-neon-green flex items-center justify-center gap-2 self-start md:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving Changes...' : 'Save Schedule'}
        </button>
      </div>

      {/* Timezone Selector Card */}
      <div className="card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white mb-1">Select Your Primary Time Zone</h3>
          <p className="text-xs text-text-muted">Bookings will adjust automatically to candidates' local times.</p>
        </div>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="input-dark w-full sm:w-64"
        >
          <option value="Asia/Gaza">Asia/Gaza (GMT+2 / GMT+3)</option>
          <option value="Asia/Jerusalem">Asia/Jerusalem (GMT+2 / GMT+3)</option>
          <option value="UTC">UTC (Coordinated Universal Time)</option>
          <option value="Europe/London">Europe/London (GMT+0 / GMT+1)</option>

          <option value="America/New_York">America/New_York (EST / EDT)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
        </select>
      </div>

      {/* Days Schedule Card */}
      <div className="card rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <span>Weekly Days & Working Hours</span>
        </h2>

        {DAY_NAMES.map((dayName, idx) => {
          const slot = schedule[idx];
          return (
            <div
              key={dayName}
              className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                slot.isActive
                  ? 'bg-bg-surface border border-neon-green/20'
                  : 'bg-white/[0.02] border border-white/[0.05] opacity-75'
              }`}
            >
              {/* Day toggle button & name */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleDay(idx)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    slot.isActive
                      ? 'bg-neon-green text-black font-bold'
                      : 'bg-white/10 text-transparent border border-white/20'
                  }`}
                >
                  ✓
                </button>
                <div>
                  <span className="font-bold text-white text-base">{dayName}</span>
                  <span className="text-xs ml-2 text-text-muted">
                    {slot.isActive ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Time Pickers */}
              {slot.isActive ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">From</span>
                    <select
                      value={slot.startTime}
                      onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                      className="input-dark text-sm py-1.5 px-3 w-28"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-text-muted">-</span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">To</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                      className="input-dark text-sm py-1.5 px-3 w-28"
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-sm italic text-text-muted">Not taking bookings on {dayName}s</span>
              )}
            </div>
          );
        })}

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="btn-neon-green flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </div>
    </div>
  );
}
