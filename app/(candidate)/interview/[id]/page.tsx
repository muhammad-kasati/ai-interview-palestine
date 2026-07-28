import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import InterviewRoom from './_components/InterviewRoom';

export const metadata: Metadata = {
  title: 'Live Interview',
};

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: interview } = await supabase
    .from('interviews')
    .select(`
      id, mode, status, job_role, experience_level, tech_stack, target_market,
      interview_questions(id, question, category, difficulty, order_index),
      interview_evaluations(overall_score, technical_score, communication_score, problem_solving_score, strengths, improvements, gemini_report)
    `)
    .eq('id', id)
    .eq('candidate_id', user.id)
    .single();

  if (!interview) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const questions = (interview.interview_questions as { id: string; question: string; category: string; difficulty: string; order_index: number }[])
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <InterviewRoom
      interview={{
        id: interview.id,
        mode: interview.mode as 'free' | 'audio' | 'video' | 'human',
        status: interview.status,
        jobRole: interview.job_role,
        experienceLevel: interview.experience_level,
        techStack: interview.tech_stack as string[],
      }}
      questions={questions}
      evaluation={interview.interview_evaluations?.[0] ?? null}
      candidateName={profile?.full_name ?? 'Candidate'}
    />
  );
}
