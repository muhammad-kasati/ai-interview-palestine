import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Generate a short-lived Vapi web token via Vapi Management API
  // This keeps the private API key server-side only
  try {
    const response = await fetch('https://api.vapi.ai/call/web-call-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: process.env.VAPI_ASSISTANT_ID,
      }),
    });

    if (!response.ok) {
      // Fallback: return the public web token directly (for dev)
      return NextResponse.json({
        token: process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN,
        mode: 'public',
      });
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token, mode: 'private' });
  } catch {
    return NextResponse.json({
      token: process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN,
      mode: 'public',
    });
  }
}
