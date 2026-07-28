import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MentorDashboardClient from './_components/MentorDashboardClient';

export const metadata: Metadata = {
  title: 'Mentor Dashboard',
  description: 'Manage your mentoring sessions, availability, and earnings',
};

export default async function MentorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role, bio, title, company')
    .eq('id', user.id)
    .single();

  // Get mentor record
  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, verified, hourly_rate_usd, specializations, years_experience, rating, sessions_completed')
    .eq('profile_id', user.id)
    .single();

  // Get upcoming bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, start_at, end_at, status, candidate_notes,
      profiles(full_name, avatar_url, email)
    `)
    .eq('mentor_id', mentor?.id ?? '')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(10);

  // Get availability
  const { data: availability } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentor?.id ?? '')
    .eq('is_active', true)
    .order('day_of_week', { ascending: true });

  // Past sessions count & earnings
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('id, mentor_score')
    .eq('mentor_id', mentor?.id ?? '')
    .eq('status', 'completed');

  const totalEarnings =
    ((completedBookings?.length ?? 0) * (mentor?.hourly_rate_usd ?? 0));

  return (
    <MentorDashboardClient
      profile={{ ...profile, id: user.id }}
      mentor={mentor}
      bookings={bookings ?? []}
      availability={availability ?? []}
      totalEarnings={totalEarnings}
      completedSessions={completedBookings?.length ?? 0}
    />
  );
}
