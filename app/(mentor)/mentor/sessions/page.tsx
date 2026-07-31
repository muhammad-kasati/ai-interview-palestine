import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MentorSessionsClient from './_components/MentorSessionsClient';

export const metadata: Metadata = {
  title: 'Mentor Sessions & History',
  description: 'Manage candidate interview bookings, session links, and feedback reports',
};

export default async function MentorSessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, hourly_rate_usd, verified')
    .eq('profile_id', user.id)
    .single();

  if (!mentor) {
    redirect('/mentor/dashboard');
  }

  // Get all bookings for this mentor with candidate profile data
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, start_at, end_at, status, session_link, candidate_notes,
      mentor_feedback, mentor_score, mentor_rate_usd, mentor_earning_usd, created_at,
      profiles (id, full_name, email, avatar_url, title, company)
    `)
    .eq('mentor_id', mentor.id)
    .order('start_at', { ascending: false });

  return (
    <MentorSessionsClient
      mentorId={mentor.id}
      hourlyRate={mentor.hourly_rate_usd ?? 0}
      initialBookings={bookings ?? []}
    />
  );
}
