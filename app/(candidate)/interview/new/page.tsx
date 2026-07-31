import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import NewInterviewClient from './NewInterviewClient';

export const metadata: Metadata = { title: 'New Interview', description: 'Configure and start an AI mock interview.' };

export default async function NewInterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subscription } = user ? await supabase.from('subscriptions').select('tier').eq('user_id', user.id).eq('is_active', true).single() : { data: null };
  return <NewInterviewClient currentTier={subscription?.tier ?? 'free'} />;
}
