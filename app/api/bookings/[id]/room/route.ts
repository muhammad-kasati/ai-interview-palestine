import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Fetch candidate profile
  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, title, email')
    .eq('id', booking.candidate_id)
    .single();

  const mentorProfileUserId = (booking.mentors as any)?.profile_id;
  const isCandidate = user.id === booking.candidate_id;
  const isMentor = user.id === mentorProfileUserId;

  if (!isCandidate && !isMentor) {
    return NextResponse.json({ error: 'Forbidden: You are not part of this session' }, { status: 403 });
  }

  return NextResponse.json({
    booking,
    candidateProfile,
    roleInSession: isCandidate ? 'candidate' : 'mentor',
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { codeSnapshot, candidateNotes, mentorFeedback, mentorScore, sessionLink } = body;

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (codeSnapshot !== undefined) updates.code_snapshot = codeSnapshot;
  if (candidateNotes !== undefined) updates.candidate_notes = candidateNotes;
  if (mentorFeedback !== undefined) updates.mentor_feedback = mentorFeedback;
  if (mentorScore !== undefined) updates.mentor_score = mentorScore;
  if (sessionLink !== undefined) updates.session_link = sessionLink;

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }

  return NextResponse.json({ success: true, booking: data });
}
