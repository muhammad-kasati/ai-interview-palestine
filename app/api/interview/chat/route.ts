import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

interface ChatBody {
  interviewId: string;
  question: string;
  answer: string;
  questionIndex: number;
  totalQuestions: number;
  nextQuestion: string | null;
  jobRole: string;
  experienceLevel: string;
  techStack: string[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: ChatBody = await request.json();
  const {
    question, answer, questionIndex, totalQuestions,
    nextQuestion, jobRole, experienceLevel, techStack,
  } = body;

  const isLastQuestion = questionIndex === totalQuestions - 1;
  const questionNum = questionIndex + 1;

  const systemPrompt = `You are a professional technical interviewer conducting a mock interview for a ${experienceLevel} ${jobRole.replace('_', ' ')} position.
Tech stack: ${techStack.join(', ')}.

Your behavior:
- Be conversational but professional, like a real interviewer
- Give brief, constructive feedback on the candidate's answer (1-2 sentences)
- If answer is incomplete, ask ONE follow-up question to probe deeper
- If answer is good, acknowledge it briefly
- Then transition to the next question naturally
- Keep responses concise (max 3-4 sentences total)
- Do not repeat the question back word-for-word`;

  let userContent: string;

  if (isLastQuestion) {
    userContent = `Question ${questionNum} of ${totalQuestions}: "${question}"
Candidate's answer: "${answer || '[No answer provided]'}"

This is the LAST question. Give brief feedback, then say the interview is now complete and encourage them to click "Submit & Get Report" to receive their full evaluation.`;
  } else {
    userContent = `Question ${questionNum} of ${totalQuestions}: "${question}"
Candidate's answer: "${answer || '[No answer provided]'}"

After brief feedback, naturally transition to:
Question ${questionNum + 1}: "${nextQuestion}"`;
  }

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userContent }] },
      ],
    });

    const reply = response.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Thank you for your answer. Let\'s continue.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[interview/chat]', err);
    return NextResponse.json({ reply: 'Thank you for your answer. Please continue to the next question.' });
  }
}
