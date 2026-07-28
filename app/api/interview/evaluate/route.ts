import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

interface EvaluateBody {
  interviewId: string;
  transcript: string;
  answers: { question: string; answer: string }[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: EvaluateBody = await request.json();
  const { interviewId, transcript, answers } = body;

  // Verify ownership
  const { data: interview } = await supabase
    .from('interviews')
    .select('candidate_id, job_role, experience_level, tech_stack')
    .eq('id', interviewId)
    .single();

  if (!interview || interview.candidate_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const qa = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || '[No answer given]'}`).join('\n\n');

  const prompt = `You are a senior tech interviewer evaluating a mock interview for a ${interview.experience_level} ${interview.job_role.replace('_', ' ')} developer.

Tech Stack: ${(interview.tech_stack as string[]).join(', ')}

Interview Q&A:
${qa}

Provide a comprehensive evaluation in this exact JSON format:
{
  "overallScore": 75,
  "technicalScore": 80,
  "communicationScore": 70,
  "problemSolvingScore": 75,
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "improvements": ["Improvement area 1", "Improvement area 2", "Improvement area 3"],
  "report": "A detailed 4-5 paragraph markdown report covering: overall performance, technical depth, communication quality, specific examples from answers, and concrete next steps for improvement"
}

Score guide: 0-49=poor, 50-69=developing, 70-84=good, 85-100=excellent
Return ONLY valid JSON, no markdown fences`;

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    // Save evaluation
    await supabase.from('interview_evaluations').upsert({
      interview_id:          interviewId,
      overall_score:         evaluation.overallScore,
      technical_score:       evaluation.technicalScore,
      communication_score:   evaluation.communicationScore,
      problem_solving_score: evaluation.problemSolvingScore,
      strengths:             evaluation.strengths,
      improvements:          evaluation.improvements,
      gemini_report:         evaluation.report,
      transcript,
    });

    // Mark interview as completed
    await supabase
      .from('interviews')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', interviewId);

    return NextResponse.json(evaluation);
  } catch (err) {
    console.error('[interview/evaluate]', err);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
