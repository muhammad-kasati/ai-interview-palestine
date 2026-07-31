'use client';

import Link from 'next/link';
import { Calendar, CheckCircle2, CircleDollarSign, Download, Landmark, TrendingUp, Wallet } from 'lucide-react';

interface MentorEarningsClientProps {
  hourlyRate: number;
  bookings: Array<{ id: string; start_at: string; end_at: string; status: string; created_at: string; mentor_rate_usd: number | null; mentor_earning_usd: number | null; profiles: { full_name: string | null; email: string | null }[] | null }>;
}

export default function MentorEarningsClient({ hourlyRate, bookings }: MentorEarningsClientProps) {
  const earningFor = (booking: MentorEarningsClientProps['bookings'][number]) =>
    Number(booking.mentor_earning_usd ?? booking.mentor_rate_usd ?? hourlyRate);
  const total = bookings.reduce((sum, booking) => sum + earningFor(booking), 0);
  const thisMonth = bookings.filter((booking) => {
    const date = new Date(booking.start_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((sum, booking) => sum + earningFor(booking), 0);

  return <div className="max-w-5xl mx-auto space-y-7">
    <section className="relative overflow-hidden card rounded-3xl p-6 sm:p-8 border-glow-green">
      <div className="absolute -right-10 -top-12 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(0,217,126,.15)' }} />
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-neon-green text-xs font-bold uppercase tracking-[.16em]"><Wallet className="w-4 h-4" /> Mentor finance</div>
          <h1 className="text-3xl font-black text-white mt-2">Earnings overview</h1>
          <p className="mt-2 max-w-xl">Your earnings record is generated from completed mentoring sessions. Payouts will appear here once payment processing is enabled.</p>
        </div>
        <Link href="/mentor/profile" className="btn-ghost text-xs"><CircleDollarSign className="w-4 h-4 text-neon-green" /> Session rate: ${hourlyRate}</Link>
      </div>
    </section>

    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: 'All-time earnings', value: `$${total.toFixed(2)}`, detail: `${bookings.length} completed sessions`, Icon: CircleDollarSign, color: 'var(--neon-green)' },
        { label: 'This month', value: `$${thisMonthTotal.toFixed(2)}`, detail: `${thisMonth.length} completed sessions`, Icon: TrendingUp, color: 'var(--neon-cyan)' },
        { label: 'Available to payout', value: '$0.00', detail: 'Payouts are coming soon', Icon: Landmark, color: '#A78BFA' },
      ].map(({ label, value, detail, Icon, color }) => <div key={label} className="stat-card">
        <Icon className="w-5 h-5 mb-5" style={{ color }} />
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <div className="text-2xl font-black text-white mt-1">{value}</div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
      </div>)}
    </section>

    <section className="card rounded-2xl overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-b border-white/5">
        <div><h2 className="text-lg font-bold text-white">Session earnings</h2><p className="text-xs mt-1">A line item is created when you submit feedback and complete a session.</p></div>
        <button type="button" disabled className="btn-ghost text-xs opacity-60 cursor-not-allowed"><Download className="w-3.5 h-3.5" /> Export CSV soon</button>
      </div>
      {bookings.length === 0 ? <div className="p-12 text-center"><Calendar className="w-10 h-10 mx-auto text-text-muted mb-3" /><h3 className="font-bold text-white">No earnings yet</h3><p className="text-sm mt-1">Complete a candidate session to see it in your financial record.</p></div> : <div className="divide-y divide-white/5">
        {bookings.map((booking) => <div key={booking.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,217,126,.10)' }}><CheckCircle2 className="w-5 h-5 text-neon-green" /></div><div><p className="font-semibold text-white">{booking.profiles?.[0]?.full_name ?? 'Candidate session'}</p><p className="text-xs">{new Date(booking.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div>
          <div className="flex items-center justify-between sm:justify-end gap-5"><span className="badge-green">Completed</span><span className="font-mono text-lg font-bold text-neon-green">+${earningFor(booking).toFixed(2)}</span></div>
        </div>)}
      </div>}
    </section>
  </div>;
}
