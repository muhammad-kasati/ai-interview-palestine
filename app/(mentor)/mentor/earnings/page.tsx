import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MentorEarningsClient from './_components/MentorEarningsClient';

export const metadata: Metadata = {
  title: 'Mentor Earnings',
  description: 'Review income generated from completed mentor sessions',
};

export default async function MentorEarningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, hourly_rate_usd')
    .eq('profile_id', user.id)
    .single();
  if (!mentor) redirect('/mentor/dashboard');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, start_at, end_at, status, created_at, mentor_rate_usd, mentor_earning_usd, profiles(full_name, email)')
    .eq('mentor_id', mentor.id)
    .eq('status', 'completed')
    .order('start_at', { ascending: false });

  return <MentorEarningsClient hourlyRate={Number(mentor.hourly_rate_usd ?? 0)} bookings={bookings ?? []} />;
}
