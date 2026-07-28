import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface CreateBookingBody {
  mentorId: string;
  startAt: string;
  endAt: string;
  notes?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: CreateBookingBody = await request.json();
  const { mentorId, startAt, endAt, notes } = body;

  if (!mentorId || !startAt || !endAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify mentor exists and is verified
  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, verified, hourly_rate_usd')
    .eq('id', mentorId)
    .eq('verified', true)
    .single();

  if (!mentor) {
    return NextResponse.json({ error: 'Mentor not found or not verified' }, { status: 404 });
  }

  // Check for conflicting bookings in the same time slot
  const { data: conflict } = await supabase
    .from('bookings')
    .select('id')
    .eq('mentor_id', mentorId)
    .neq('status', 'cancelled')
    .lt('start_at', endAt)
    .gt('end_at', startAt)
    .single();

  if (conflict) {
    return NextResponse.json({ error: 'This time slot is already booked. Please choose another.' }, { status: 409 });
  }

  // Create the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      candidate_id:    user.id,
      mentor_id:       mentorId,
      start_at:        startAt,
      end_at:          endAt,
      status:          'pending',
      candidate_notes: notes ?? null,
    })
    .select('id, start_at, end_at, status')
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  return NextResponse.json({ bookingId: booking.id, status: booking.status }, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, start_at, end_at, status, candidate_notes, session_link,
      mentors(id, hourly_rate_usd, profiles(full_name, avatar_url, title))
    `)
    .eq('candidate_id', user.id)
    .order('start_at', { ascending: false });

  return NextResponse.json({ bookings: bookings ?? [] });
}
