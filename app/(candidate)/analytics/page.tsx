import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AnalyticsClient from './analytics-client';
export default async function AnalyticsPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login'); const { data } = await supabase.from('interviews').select('duration_seconds, status, interview_evaluations(overall_score)').eq('candidate_id', user.id); return <AnalyticsClient interviews={data ?? []} />; }
