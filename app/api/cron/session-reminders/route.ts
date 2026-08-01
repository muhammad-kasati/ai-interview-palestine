import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return handleReminders();
}

export async function POST(request: Request) {
  return handleReminders();
}

async function handleReminders() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Fetch confirmed bookings that need reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, start_at, end_at, status, room_code, session_link, candidate_id, mentor_id,
        reminder_1h_sent, reminder_start_sent,
        mentors (
          id,
          profile_id,
          profiles ( full_name )
        )
      `)
      .eq('status', 'confirmed');

    if (error || !bookings) {
      return NextResponse.json({ error: error?.message || 'Failed to fetch bookings' }, { status: 500 });
    }

    const notificationsToInsert: any[] = [];
    const bookingsToUpdate1h: string[] = [];
    const bookingsToUpdateStart: string[] = [];

    for (const booking of bookings) {
      const startTime = new Date(booking.start_at);
      const endTime = new Date(booking.end_at);

      // Mentor profile user id
      const mentorUserId = (booking.mentors as any)?.profile_id;
      const mentorName = (booking.mentors as any)?.profiles?.full_name || 'your mentor';

      const roomUrl = booking.session_link && booking.session_link.startsWith('/')
        ? booking.session_link
        : `/room/${booking.id}`;

      // 1-Hour Reminder Check
      if (
        !booking.reminder_1h_sent &&
        startTime > now &&
        startTime <= oneHourFromNow
      ) {
        bookingsToUpdate1h.push(booking.id);

        // Candidate notification
        notificationsToInsert.push({
          user_id: booking.candidate_id,
          title: 'Session Starts in 1 Hour ⏰',
          body: `Your interview session with ${mentorName} starts in 1 hour. Get ready to join!`,
          type: 'session',
        });

        // Mentor notification
        if (mentorUserId) {
          notificationsToInsert.push({
            user_id: mentorUserId,
            title: 'Upcoming Session in 1 Hour ⏰',
            body: `Your mentor session is scheduled in 1 hour. Open your sessions dashboard to prepare.`,
            type: 'session',
          });
        }
      }

      // Meeting Start Reminder Check
      if (
        !booking.reminder_start_sent &&
        startTime <= now &&
        endTime > new Date(now.getTime() - 30 * 60 * 1000)
      ) {
        bookingsToUpdateStart.push(booking.id);

        // Candidate notification
        notificationsToInsert.push({
          user_id: booking.candidate_id,
          title: 'Session Started 🎥',
          body: `Your interview session with ${mentorName} is live! Click to enter the room.`,
          type: 'session',
        });

        // Mentor notification
        if (mentorUserId) {
          notificationsToInsert.push({
            user_id: mentorUserId,
            title: 'Session Started 🎥',
            body: `Your candidate is ready for the session. Click to open the interview room.`,
            type: 'session',
          });
        }
      }
    }

    if (notificationsToInsert.length > 0) {
      await supabase.from('notifications').insert(notificationsToInsert);
    }

    if (bookingsToUpdate1h.length > 0) {
      await supabase
        .from('bookings')
        .update({ reminder_1h_sent: true })
        .in('id', bookingsToUpdate1h);
    }

    if (bookingsToUpdateStart.length > 0) {
      await supabase
        .from('bookings')
        .update({ reminder_start_sent: true })
        .in('id', bookingsToUpdateStart);
    }

    return NextResponse.json({
      success: true,
      processed: bookings.length,
      reminders1hSent: bookingsToUpdate1h.length,
      remindersStartSent: bookingsToUpdateStart.length,
    });
  } catch (err: any) {
    console.error('Error processing session reminders:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
