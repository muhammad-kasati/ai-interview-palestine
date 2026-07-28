import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import AdminDashboardClient from './_components/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Platform management and mentor verification',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Platform statistics
  const [
    { count: totalUsers },
    { count: totalInterviews },
    { count: pendingMentors },
    { count: activeSessions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('interviews').select('*', { count: 'exact', head: true }),
    supabase.from('mentors').select('*', { count: 'exact', head: true }).eq('verified', false),
    supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  // Pending mentor applications
  const { data: pendingMentorList } = await supabase
    .from('mentors')
    .select(`
      id, verified, hourly_rate_usd, specializations, years_experience, company, created_at,
      profiles(full_name, email, avatar_url, bio, title)
    `)
    .eq('verified', false)
    .order('created_at', { ascending: true });

  // Recent interviews
  const { data: recentInterviews } = await supabase
    .from('interviews')
    .select(`
      id, mode, status, job_role, experience_level, created_at,
      profiles(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // All users
  const { data: allUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <AdminDashboardClient
      stats={{
        totalUsers: totalUsers ?? 0,
        totalInterviews: totalInterviews ?? 0,
        pendingMentors: pendingMentors ?? 0,
        activeSessions: activeSessions ?? 0,
      }}
      pendingMentors={pendingMentorList ?? []}
      recentInterviews={recentInterviews ?? []}
      allUsers={allUsers ?? []}
    />
  );
}
