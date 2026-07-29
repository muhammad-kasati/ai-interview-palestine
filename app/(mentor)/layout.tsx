import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

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

  if (profile?.role !== 'mentor' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)' }}>
      <Sidebar
        userRole={profile?.role ?? 'mentor'}
        userName={profile?.full_name ?? user.email ?? 'Mentor'}
        userEmail={user.email}
        avatarUrl={profile?.avatar_url}
      />
      <div className="main-content">
        <Topbar />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
