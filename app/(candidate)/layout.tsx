import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

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

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)' }}>
      <Sidebar
        userRole={profile?.role ?? 'candidate'}
        userName={profile?.full_name ?? user.email ?? 'User'}
        userEmail={user.email}
        avatarUrl={profile?.avatar_url}
        currentTier={subscription?.tier ?? 'free'}
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
