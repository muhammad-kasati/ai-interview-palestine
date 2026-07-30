import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('full_name, email, title, company, bio, linkedin_url, github_url').eq('id', user.id).single();
  return <ProfileClient profile={profile} userId={user.id} email={user.email ?? ''} />;
}
