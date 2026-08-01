import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import MentorSettingsClient from './_components/MentorSettingsClient';

export const metadata: Metadata = { title: 'Mentor Settings' };

export default async function MentorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: settings } = await supabase
    .from('mentor_settings')
    .select('booking_notifications, session_reminders, email_notifications, profile_visible, session_buffer_minutes')
    .eq('profile_id', user.id)
    .maybeSingle();

  return <MentorSettingsClient userId={user.id} initialSettings={settings} />;
}
