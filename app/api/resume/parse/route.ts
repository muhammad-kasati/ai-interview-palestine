import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const model = genai.models;

    const response = await model.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64,
              },
            },
            {
              text: `Analyze this developer resume and extract the following information in JSON format:
{
  "skills": ["list", "of", "technical", "skills", "frameworks", "languages", "tools"],
  "experienceLevel": "junior" | "mid" | "senior",
  "yearsExperience": number,
  "summary": "brief 1-sentence professional summary",
  "jobRoles": ["suggested", "job", "roles", "from: fullstack|backend|frontend|mobile|devops|system_design|data_engineer|ml_engineer"]
}

Rules:
- skills: extract programming languages, frameworks, tools, cloud platforms (max 15)
- experienceLevel: infer from years of experience (junior: 0-2, mid: 2-5, senior: 5+)
- Return ONLY valid JSON, no markdown, no explanation`,
            },
          ],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    // Clean markdown code fences if present
    const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      skills: parsed.skills ?? [],
      experienceLevel: parsed.experienceLevel ?? 'junior',
      yearsExperience: parsed.yearsExperience ?? 0,
      summary: parsed.summary ?? '',
      jobRoles: parsed.jobRoles ?? [],
    });
  } catch (err) {
    console.error('[resume/parse]', err);
    return NextResponse.json(
      { error: 'Failed to parse resume', skills: [] },
      { status: 500 }
    );
  }
}
