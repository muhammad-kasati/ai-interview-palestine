import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SessionsClient from './sessions-client';

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data } = await supabase
    .from('bookings')
    .select(`
      id, start_at, end_at, status, session_link, room_code, candidate_notes, mentor_feedback, mentor_score,
      mentors (
        hourly_rate_usd,
        profiles ( full_name, avatar_url, title )
      )
    `)
    .eq('candidate_id', user.id)
    .order('start_at', { ascending: false });

  return <SessionsClient sessions={data ?? []} />;
}
