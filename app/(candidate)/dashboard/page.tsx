import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import DashboardClient from './_components/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Set up your AI mock interview session',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single();

  const { data: recentInterviews } = await supabase
    .from('interviews')
    .select(`
      id, mode, status, job_role, experience_level, created_at,
      interview_evaluations(overall_score)
    `)
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, is_active, valid_until')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return (
    <DashboardClient
      userName={profile?.full_name ?? user.email ?? 'there'}
      recentInterviews={recentInterviews ?? []}
      currentTier={subscription?.tier ?? 'free'}
    />
  );
}
