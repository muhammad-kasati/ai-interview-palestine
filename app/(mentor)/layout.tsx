import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default async function MentorLayout({
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

  // Only mentor or admin can access
  if (profile?.role !== 'mentor' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar
        userRole={profile?.role ?? 'mentor'}
        userName={profile?.full_name ?? user.email ?? 'Mentor'}
        avatarUrl={profile?.avatar_url}
      />
      <main className="container-page py-8">
        {children}
      </main>
    </div>
  );
}
