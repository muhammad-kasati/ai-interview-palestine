import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MentorAvailabilityClient from './_components/MentorAvailabilityClient';

export const metadata: Metadata = {
  title: 'Mentor Availability',
  description: 'Manage your weekly availability slots and time zones for candidate bookings',
};

export default async function MentorAvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, verified')
    .eq('profile_id', user.id)
    .single();

  if (!mentor) {
    redirect('/dashboard');
  }

  const { data: availability } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentor.id)
    .order('day_of_week', { ascending: true });

  return (
    <MentorAvailabilityClient
      mentorId={mentor.id}
      initialAvailability={availability ?? []}
    />
  );
}
