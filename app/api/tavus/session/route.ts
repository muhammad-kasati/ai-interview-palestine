import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface TavusSessionBody {
  interviewId: string;
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  candidateName: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: TavusSessionBody = await request.json();

  const conversationalContext = `You are a professional technical interviewer conducting a mock interview.
The candidate is ${body.candidateName}, a ${body.experienceLevel} ${body.jobRole.replace('_', ' ')} developer.
Their tech stack includes: ${body.techStack.join(', ')}.
Conduct a professional, encouraging interview. Ask technical questions relevant to their stack.
Provide brief feedback after each answer. Keep a friendly but professional tone.`;

  try {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.TAVUS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id:             process.env.TAVUS_REPLICA_ID,
        persona_id:             process.env.TAVUS_PERSONA_ID,
        conversational_context: conversationalContext,
        properties: {
          max_call_duration:        3600,
          participant_left_timeout: 60,
          enable_recording:         false,
          language:                 'english',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[tavus/session] API error:', errText);
      return NextResponse.json({ error: 'Failed to create Tavus session', details: errText }, { status: 500 });
    }

    const data = await response.json();

    // Store Tavus conversation ID in interview record
    await supabase
      .from('interviews')
      .update({ tavus_conversation_id: data.conversation_id })
      .eq('id', body.interviewId);

    return NextResponse.json({
      conversationId:  data.conversation_id,
      conversationUrl: data.conversation_url,
    });
  } catch (err) {
    console.error('[tavus/session]', err);
    return NextResponse.json({ error: 'Tavus session creation failed' }, { status: 500 });
  }
}
