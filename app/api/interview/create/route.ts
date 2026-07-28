import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

interface CreateInterviewBody {
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
  mode: string;
  targetMarket: string;
  resumeUrl?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: CreateInterviewBody = await request.json();
  const { jobRole, experienceLevel, techStack, mode, targetMarket, resumeUrl } = body;

  // 1. Create interview record in Supabase
  const { data: interview, error: insertError } = await supabase
    .from('interviews')
    .insert({
      candidate_id:     user.id,
      mode,
      status:           'pending',
      job_role:         jobRole,
      experience_level: experienceLevel,
      tech_stack:       techStack,
      target_market:    targetMarket,
      resume_url:       resumeUrl,
    })
    .select('id')
    .single();

  if (insertError || !interview) {
    return NextResponse.json({ error: 'Failed to create interview' }, { status: 500 });
  }

  const interviewId = interview.id;

  // 2. Generate questions with Gemini
  try {
    const marketContext =
      targetMarket === 'local_palestine'
        ? 'Palestinian local tech market (companies like Exalt, Asal Technologies, Bisan, PalTech)'
        : 'global remote tech roles (international companies)';

    const prompt = `You are a senior technical interviewer. Generate 8 interview questions for:
- Role: ${jobRole.replace('_', ' ')}
- Level: ${experienceLevel}
- Tech Stack: ${techStack.join(', ')}
- Market: ${marketContext}

Return a JSON array of exactly 8 objects:
[
  {
    "question": "...",
    "category": "behavioral" | "technical" | "system_design" | "coding" | "situational",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Rules:
- Mix: 2 behavioral, 4 technical/coding, 2 system design
- Make technical questions specific to the tech stack
- For local Palestine market: include team collaboration and agile questions
- Return ONLY valid JSON array, no markdown, no explanation`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
    const questions: { question: string; category: string; difficulty: string }[] = JSON.parse(cleaned);

    // 3. Insert questions
    await supabase.from('interview_questions').insert(
      questions.map((q, i) => ({
        interview_id: interviewId,
        question:     q.question,
        category:     q.category,
        difficulty:   q.difficulty,
        order_index:  i,
      }))
    );

    // 4. Mark interview as active
    await supabase
      .from('interviews')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', interviewId);

    return NextResponse.json({ interviewId, questionCount: questions.length });
  } catch (err) {
    console.error('[interview/create]', err);
    // Still return the interview ID so the room can load
    return NextResponse.json({ interviewId, questionCount: 0 });
  }
}
