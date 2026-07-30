import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InterviewsClient from './interviews-client';

export default async function InterviewsPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login');
  const { data } = await supabase.from('interviews').select('id, job_role, experience_level, mode, status, duration_seconds, created_at, interview_evaluations(overall_score)').eq('candidate_id', user.id).order('created_at', { ascending: false });
  return <InterviewsClient interviews={data ?? []} />;
}
