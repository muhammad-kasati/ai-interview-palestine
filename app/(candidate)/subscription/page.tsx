import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SubscriptionClient from './subscription-client';

export default async function SubscriptionPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login');
  const { data: subscription } = await supabase.from('subscriptions').select('tier, valid_until').eq('user_id', user.id).eq('is_active', true).single();
  return <SubscriptionClient tier={subscription?.tier ?? 'free'} validUntil={subscription?.valid_until ?? null} />;
}
