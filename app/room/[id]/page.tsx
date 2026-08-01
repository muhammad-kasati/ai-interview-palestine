import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import RoomClient from './RoomClient';

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/room/${id}`);

  // Fetch booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      id, start_at, end_at, status, session_link, room_code, code_snapshot, candidate_notes, mentor_feedback, mentor_score,
      candidate_id, mentor_id,
      mentors (
        id, profile_id, hourly_rate_usd, specializations, years_experience, company,
        profiles ( full_name, avatar_url, title, email )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !booking) {
    notFound();
  }

  // Fetch candidate profile details
  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, title, email')
    .eq('id', booking.candidate_id)
    .single();

  const mentorUserId = (booking.mentors as any)?.profile_id;
  const isCandidate = user.id === booking.candidate_id;
  const isMentor = user.id === mentorUserId;

  // Restrict room access to candidate or mentor of this booking
  if (!isCandidate && !isMentor) {
    redirect('/dashboard');
  }

  return (
    <RoomClient
      booking={booking}
      candidateProfile={candidateProfile}
      currentUserRole={isCandidate ? 'candidate' : 'mentor'}
      userId={user.id}
    />
  );
}
