import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--bg-base)' }}>
      <Navbar
        userRole={profile?.role ?? 'candidate'}
        userName={profile?.full_name ?? user.email ?? 'User'}
        avatarUrl={profile?.avatar_url}
      />
      <main className="container-page py-8">
        {children}
      </main>
    </div>
  );
}
