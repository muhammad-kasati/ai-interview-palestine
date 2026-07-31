'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star, Briefcase, Calendar, Clock, ArrowLeft,
  ExternalLink, CheckCircle, Loader2, ChevronRight,
  Users, Shield
} from 'lucide-react';
import { DAY_NAMES } from '@/lib/types';

interface MentorProfileClientProps {
  mentor: any;
  availability: any[];
  candidateId: string;
  candidateTier: string;
}

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

export default function MentorProfileClient({
  mentor,
  availability,
  candidateId,
  candidateTier,
}: MentorProfileClientProps) {
  const router = useRouter();
  const profile = mentor.profiles;

  const [selectedDay, setSelectedDay]   = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes]               = useState('');
  const [booking, setBooking]           = useState(false);
  const [booked, setBooked]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const availableDays = availability.map((a: any) => a.day_of_week);

  // Get available time slots for selected day
  const daySlot = availability.find((a: any) => a.day_of_week === selectedDay);

  function getTimeOptions(): string[] {
    if (!daySlot) return [];
    const start = parseInt(daySlot.start_time.split(':')[0], 10);
    const end   = parseInt(daySlot.end_time.split(':')[0], 10);
    return TIME_SLOTS.filter((t) => {
      const h = parseInt(t.split(':')[0], 10);
      return h >= start && h < end;
    });
  }

  async function handleBook() {
    if (!selectedDay || !selectedTime) return;
    setBooking(true);
    setError(null);

    const isMock = mentor.id.startsWith('mock-');

    if (isMock) {
      // Simulate booking for demo
      await new Promise((r) => setTimeout(r, 1200));
      window.dispatchEvent(new CustomEvent('app-notification', { detail: { title: 'Booking requested', body: `Your session with ${profile?.full_name ?? 'your mentor'} is awaiting confirmation.`, type: 'booking' } }));
      setBooked(true);
      setBooking(false);
      return;
    }

    // Build datetime strings
    const today = new Date();
    const dayOffset = (selectedDay - today.getDay() + 7) % 7 || 7; // next occurrence
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() + dayOffset);
    const [h, m] = selectedTime.split(':').map(Number);
    sessionDate.setHours(h, m, 0, 0);
    const endDate = new Date(sessionDate);
    endDate.setHours(h + 1, m, 0, 0);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          startAt:  sessionDate.toISOString(),
          endAt:    endDate.toISOString(),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Booking failed. Please try again.');
        setBooking(false);
        return;
      }

      window.dispatchEvent(new CustomEvent('app-notification', { detail: { title: 'Booking requested', body: `Your session with ${profile?.full_name ?? 'your mentor'} is awaiting confirmation.`, type: 'booking' } }));
      setBooked(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  // ── Success State ─────────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-fade-up" style={{ background: 'rgba(0,255,102,0.12)', border: '1px solid rgba(0,255,102,0.3)' }}>
          <CheckCircle className="w-10 h-10" style={{ color: 'var(--neon-green)' }} />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Session Booked! 🎉</h1>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
          Your session with <strong className="text-white">{profile?.full_name}</strong> has been requested.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {DAY_FULL[selectedDay!]} at {selectedTime} · You'll receive a confirmation once the mentor approves.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push('/dashboard')} className="btn-neon-green">
            Back to Dashboard
          </button>
          <button onClick={() => router.push('/mentors')} className="btn-ghost">
            Browse More Mentors
          </button>
        </div>
      </div>
    );
  }

  const timeOptions = getTimeOptions();
  const mentorCredits = candidateTier === 'human' ? 3 : candidateTier === 'premium' || candidateTier === 'standard' ? 1 : 0;
  const canBook = mentorCredits > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Back */}
      <Link href="/mentors" className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" />
        Back to Mentors
      </Link>

      {/* Profile Hero */}
      <div className="card rounded-2xl p-8" style={{ border: '1px solid rgba(124,58,237,0.15)', background: 'rgba(124,58,237,0.03)' }}>
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Avatar */}
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,229,255,0.3))' }}>
              {(profile?.full_name ?? 'M').charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-black text-white">{profile?.full_name}</h1>
              <span className="badge-green text-xs">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="font-medium mb-1" style={{ color: 'var(--neon-cyan)' }}>{profile?.title}</p>

            {mentor.company && (
              <div className="flex items-center gap-1.5 mb-4">
                <Briefcase className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{mentor.company}</span>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4" style={{ color: '#FBBF24' }} />
                <span className="font-bold text-white">{(mentor.rating ?? 5).toFixed(1)}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />
                <span className="font-bold text-white">{mentor.sessions_completed ?? 0}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" style={{ color: '#A78BFA' }} />
                <span className="font-bold text-white">{mentor.years_experience ?? '?'} yrs</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>experience</span>
              </div>
              <div>
                <span className="font-black text-xl" style={{ color: '#A78BFA' }}>${mentor.hourly_rate_usd}</span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/ session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <p className="mt-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            {profile.bio}
          </p>
        )}

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mt-5">
          {(mentor.specializations ?? []).map((s: string) => (
            <span key={s} className="badge-cyan text-xs">{s}</span>
          ))}
        </div>
      </div>

      {/* Booking Section */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Availability */}
        <div className="card rounded-2xl p-6">
          <h2 className="font-bold text-white mb-1 flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: '#A78BFA' }} />
            Availability
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Timezone: {availability[0]?.timezone ?? 'Asia/Jerusalem'}
          </p>

          {availability.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This mentor hasn't set their availability yet. Check back soon.
            </p>
          ) : (
            <div className="space-y-2">
              {DAY_NAMES.map((day, idx) => {
                const slot = availability.find((a: any) => a.day_of_week === idx);
                const isAvailable = !!slot;
                const isSelected  = selectedDay === idx;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (!isAvailable) return;
                      setSelectedDay(isSelected ? null : idx);
                      setSelectedTime(null);
                    }}
                    disabled={!isAvailable}
                    id={`day-${day.toLowerCase()}`}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all text-left"
                    style={{
                      background: isSelected
                        ? 'rgba(124,58,237,0.15)'
                        : isAvailable
                        ? 'rgba(255,255,255,0.03)'
                        : 'transparent',
                      border: isSelected
                        ? '1px solid rgba(124,58,237,0.4)'
                        : isAvailable
                        ? '1px solid rgba(255,255,255,0.06)'
                        : '1px solid transparent',
                      opacity: isAvailable ? 1 : 0.4,
                      cursor: isAvailable ? 'pointer' : 'default',
                    }}
                  >
                    <span className="font-medium" style={{ color: isSelected ? '#A78BFA' : isAvailable ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {DAY_FULL[idx]}
                    </span>
                    {slot && (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {slot.start_time} – {slot.end_time}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Time & Booking */}
        <div className="space-y-5">

          {/* Time Picker */}
          {selectedDay !== null && timeOptions.length > 0 && (
            <div className="card rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
                Select Time — {DAY_FULL[selectedDay]}
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time === selectedTime ? null : time)}
                    id={`time-${time.replace(':', '-')}`}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: selectedTime === time ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.04)',
                      border: selectedTime === time ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                      color: selectedTime === time ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Book */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-white">Book Session</h2><span className="badge-purple">{mentorCredits} credit{mentorCredits === 1 ? '' : 's'} available</span></div>

            {/* Tier gate */}
            {!canBook ? (
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#FBBF24' }}>Human Tier Required</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Your current plan has no human-coach credits. Standard and Premium include 1 session credit; Human includes 3. You can also purchase a single interview credit.
                </p>
                <Link href="/subscription" className="btn-neon-green text-sm" style={{ padding: '0.5rem 1rem' }}>
                  Get a session credit
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {selectedDay !== null && selectedTime && (
                  <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(0,255,102,0.06)', border: '1px solid rgba(0,255,102,0.2)' }}>
                    <p className="text-sm font-semibold text-white">
                      {DAY_FULL[selectedDay]} · {selectedTime} – {(parseInt(selectedTime) + 1).toString().padStart(2, '0')}:00
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--neon-green)' }}>1-hour session · ${mentor.hourly_rate_usd}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="booking-notes" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Notes for the mentor <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                  </label>
                  <textarea
                    id="booking-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What do you want to focus on? E.g., system design, React hooks, job interview simulation for a specific company…"
                    rows={4}
                    className="input-dark resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                    {error}
                  </div>
                )}

                <button
                  id="btn-confirm-booking"
                  onClick={handleBook}
                  disabled={!selectedDay || !selectedTime || booking}
                  className="btn-neon-green w-full justify-center"
                  style={{ padding: '0.875rem', opacity: (!selectedDay || !selectedTime || booking) ? 0.5 : 1 }}
                >
                  {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {booking ? 'Booking…' : !selectedDay ? 'Select a Day First' : !selectedTime ? 'Select a Time' : 'Confirm Booking'}
                </button>

                {!selectedDay && (
                  <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    ← Choose a day from the calendar to see available times
                  </p>
                )}
              </>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-col gap-2">
            {[
              { Icon: Shield,       text: 'Verified Palestinian tech professional' },
              { Icon: CheckCircle,  text: '100% satisfaction or your money back' },
              { Icon: Clock,        text: '60-minute focused mock interview session' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--neon-green)' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
