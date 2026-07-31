import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MentorProfileSettingsClient from './_components/MentorProfileSettingsClient';

export const metadata: Metadata = {
  title: 'Mentor Profile Settings',
  description: 'Manage your mentor rates, specializations, job title, bio, and experience',
};

export default async function MentorProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, title, company, bio, linkedin_url, github_url, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, verified, hourly_rate_usd, specializations, years_experience, rating, sessions_completed')
    .eq('profile_id', user.id)
    .single();

  if (!mentor) {
    redirect('/mentor/dashboard');
  }

  return (
    <MentorProfileSettingsClient
      profile={profile}
      mentor={mentor}
      userId={user.id}
    />
  );
}
