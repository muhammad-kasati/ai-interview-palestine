'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, CheckCircle2, CircleDollarSign, Download, Landmark,
  TrendingUp, Wallet, BarChart3, Filter, ArrowUpRight, Clock, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingRecord {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  created_at: string;
  mentor_rate_usd: number | null;
  mentor_earning_usd: number | null;
  profiles: { full_name: string | null; email: string | null }[] | null;
}

interface MentorEarningsClientProps {
  hourlyRate: number;
  bookings: BookingRecord[];
}

export default function MentorEarningsClient({
  hourlyRate,
  bookings,
}: MentorEarningsClientProps) {
  const [timeframe, setTimeframe] = useState<'all' | '6months' | 'year'>('all');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const pendingOrConfirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');

  const earningFor = (booking: BookingRecord) => {
    if (booking.mentor_earning_usd !== null && booking.mentor_earning_usd !== undefined) {
      return Number(booking.mentor_earning_usd);
    }
    const hours = Math.max(
      (new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / 3_600_000,
      0
    );
    return Number(booking.mentor_rate_usd ?? hourlyRate) * hours;
  };

  const totalEarnings = completedBookings.reduce((sum, b) => sum + earningFor(b), 0);
  const projectedEarnings = pendingOrConfirmed.reduce((sum, b) => sum + earningFor(b), 0);

  const now = new Date();
  const currentMonthBookings = completedBookings.filter((b) => {
    const d = new Date(b.start_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const currentMonthTotal = currentMonthBookings.reduce((sum, b) => sum + earningFor(b), 0);

  const avgSessionRate = completedBookings.length > 0
    ? totalEarnings / completedBookings.length
    : hourlyRate;

  // Monthly Aggregation Data for Chart
  const getMonthlyChartData = () => {
    const monthsMap: Record<string, { monthLabel: string; earnings: number; count: number; dateObj: Date }> = {};

    // Generate last 6 or 12 months buckets
    const monthsCount = timeframe === '6months' ? 6 : 12;
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      monthsMap[key] = { monthLabel, earnings: 0, count: 0, dateObj: date };
    }

    // Aggregate completed bookings
    completedBookings.forEach((b) => {
      const d = new Date(b.start_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[key]) {
        monthsMap[key].earnings += earningFor(b);
        monthsMap[key].count += 1;
      }
    });

    return Object.values(monthsMap);
  };

  const chartData = getMonthlyChartData();
  const maxMonthlyEarnings = Math.max(...chartData.map((d) => d.earnings), 100);

  const handleExportCSV = () => {
    if (completedBookings.length === 0) {
      toast.error('No earnings records to export');
      return;
    }

    const headers = ['Booking ID,Candidate Name,Candidate Email,Date,Earning (USD),Status\n'];
    const rows = completedBookings.map((b) => {
      const candidate = b.profiles?.[0] || (b.profiles as any);
      const name = candidate?.full_name || 'Candidate';
      const email = candidate?.email || 'N/A';
      const date = new Date(b.start_at).toLocaleDateString();
      const amount = earningFor(b).toFixed(2);
      return `"${b.id}","${name}","${email}","${date}",${amount},"${b.status}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mentor_earnings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Earnings statement exported as CSV!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fade-up">
      {/* Top Banner Card */}
      <section className="relative overflow-hidden card rounded-3xl p-6 sm:p-8 border border-neon-green/30 bg-gradient-to-r from-neon-green/5 via-transparent to-neon-cyan/5">
        <div className="absolute -right-10 -top-12 w-48 h-48 rounded-full blur-3xl bg-neon-green/15" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-neon-green text-xs font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4" /> Mentor Finance & Financial Analytics
            </div>
            <h1 className="text-3xl font-black text-white mt-2">Earnings Overview</h1>
            <p className="mt-2 text-sm text-text-secondary max-w-xl">
              Track revenue from completed candidate sessions, analyze monthly performance trends, and manage your hourly rate.
            </p>
          </div>

          <Link href="/mentor/profile" className="btn-ghost text-xs py-2 px-4 flex items-center gap-2 border-white/10 text-white">
            <CircleDollarSign className="w-4 h-4 text-neon-green" /> Hourly Rate: ${hourlyRate}/hr
          </Link>
        </div>
      </section>

      {/* Primary Key Financial Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Total Revenue</span>
            <CircleDollarSign className="w-4 h-4 text-neon-green" />
          </div>
          <div className="text-2xl font-black text-white">${totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-neon-green font-mono">{completedBookings.length} paid sessions</p>
        </div>

        <div className="card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">This Month</span>
            <TrendingUp className="w-4 h-4 text-neon-cyan" />
          </div>
          <div className="text-2xl font-black text-neon-cyan">${currentMonthTotal.toFixed(2)}</div>
          <p className="text-xs text-text-secondary">{currentMonthBookings.length} sessions completed</p>
        </div>

        <div className="card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Avg Rate / Session</span>
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">${avgSessionRate.toFixed(2)}</div>
          <p className="text-xs text-text-muted">Per session average</p>
        </div>

        <div className="card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Projected Upcoming</span>
            <Landmark className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">${projectedEarnings.toFixed(2)}</div>
          <p className="text-xs text-text-secondary">{pendingOrConfirmed.length} pending/confirmed</p>
        </div>
      </section>

      {/* Interactive Monthly Revenue Chart Card */}
      <section className="card rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-green" /> Monthly Revenue Trend
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Visual analytics showing monthly earnings in USD and completed sessions volume.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            {(['all', '6months', 'year'] as const).map((tKey) => (
              <button
                key={tKey}
                onClick={() => setTimeframe(tKey)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  timeframe === tKey
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tKey === 'all' ? 'All Months' : tKey === '6months' ? 'Last 6 Months' : 'This Year'}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Responsive Bar & Area Chart */}
        <div className="h-64 w-full relative pt-8 pb-4 flex items-end gap-3 sm:gap-6 border-b border-white/10 px-2">
          {chartData.map((data, index) => {
            const barHeightPercent = Math.max((data.earnings / maxMonthlyEarnings) * 100, 6);
            const isHovered = hoveredBarIndex === index;

            return (
              <div
                key={data.monthLabel + index}
                onMouseEnter={() => setHoveredBarIndex(index)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-gray-900 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-neon-green/30 shadow-xl pointer-events-none whitespace-nowrap animate-fade-in">
                    <p className="font-bold text-neon-green">${data.earnings.toFixed(2)}</p>
                    <p className="text-[10px] text-text-muted">{data.count} session(s)</p>
                  </div>
                )}

                {/* Animated Column Bar */}
                <div
                  className="w-full max-w-[42px] rounded-t-xl transition-all duration-300 relative overflow-hidden"
                  style={{
                    height: `${barHeightPercent}%`,
                    background: isHovered
                      ? 'linear-gradient(180deg, var(--neon-cyan), var(--neon-green))'
                      : 'linear-gradient(180deg, rgba(0,217,126,0.8), rgba(0,217,126,0.2))',
                    boxShadow: isHovered ? 'var(--glow-green)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Month Label below */}
                <span className="text-[11px] font-mono mt-3 text-text-muted group-hover:text-white transition-colors">
                  {data.monthLabel}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Additional Analytics: Status Breakdown & Efficiency ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Session Status Distribution Donut Chart */}
        <div className="card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-neon-cyan" /> Session Status Breakdown
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Distribution of your session requests and fulfillment rates.
            </p>
          </div>

          <div className="py-6 flex items-center justify-around gap-4">
            {/* SVG Donut Chart */}
            {(() => {
              const total = bookings.length || 1;
              const completedPct = Math.round((completedBookings.length / total) * 100);
              const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
              const confirmedPct = Math.round((confirmedCount / total) * 100);
              const pendingCount = bookings.filter((b) => b.status === 'pending').length;
              const pendingPct = Math.max(0, 100 - completedPct - confirmedPct);

              return (
                <>
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {/* Background ring */}
                      <path
                        className="text-white/10 stroke-current"
                        strokeWidth="3.8"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Completed arc (Green) */}
                      <path
                        className="text-neon-green stroke-current transition-all duration-500"
                        strokeDasharray={`${completedPct}, 100`}
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Confirmed arc (Cyan) */}
                      <path
                        className="text-neon-cyan stroke-current transition-all duration-500"
                        strokeDasharray={`${confirmedPct}, 100`}
                        strokeDashoffset={`-${completedPct}`}
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black text-white font-mono">{bookings.length}</span>
                      <span className="text-[10px] text-text-muted">Total Booked</span>
                    </div>
                  </div>

                  {/* Legend & Count Details */}
                  <div className="space-y-2.5 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <span className="w-2.5 h-2.5 rounded-full bg-neon-green inline-block" />
                        Completed
                      </span>
                      <span className="font-mono font-bold text-white">{completedBookings.length} ({completedPct}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan inline-block" />
                        Confirmed
                      </span>
                      <span className="font-mono font-bold text-white">{confirmedCount} ({confirmedPct}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        Pending
                      </span>
                      <span className="font-mono font-bold text-white">{pendingCount} ({pendingPct}%)</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Financial Performance Metrics Card */}
        <div className="card rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-green" /> Key Performance Analytics
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Fulfillment statistics and session conversion insights.
            </p>
          </div>

          <div className="space-y-4">
            {/* Fulfillment Rate Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">Session Completion Rate</span>
                <span className="font-mono font-bold text-neon-green">
                  {bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 100}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full transition-all duration-500"
                  style={{
                    width: `${bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Average Revenue Per Session Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium">Effective Hourly Earnings</span>
                <span className="font-mono font-bold text-neon-cyan">${hourlyRate}/hr</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-neon-cyan rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (hourlyRate / 150) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-text-muted">Top Earning Month</span>
            <span className="font-bold text-white font-mono">
              {(() => {
                const best = chartData.reduce((prev, curr) => (curr.earnings > prev.earnings ? curr : prev), chartData[0]);
                return best && best.earnings > 0 ? `${best.monthLabel} ($${best.earnings.toFixed(0)})` : 'N/A';
              })()}
            </span>
          </div>
        </div>
      </section>


      {/* Detailed Financial Statement Table */}
      <section className="card rounded-2xl overflow-hidden border border-white/10">
        <div className="p-5 flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Session Earnings Record</h2>
            <p className="text-xs text-text-secondary mt-1">
              Detailed financial list for completed mentoring sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-ghost text-xs py-2 px-4 flex items-center gap-2 border-white/10 text-white hover:bg-white/10 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neon-green" /> Export CSV Statement
          </button>
        </div>

        {completedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-text-muted mb-3" />
            <h3 className="font-bold text-white text-base">No earnings record yet</h3>
            <p className="text-xs text-text-secondary mt-1">
              Complete a candidate interview session to view line item payout records.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {completedBookings.map((b) => {
              const candidate = b.profiles?.[0] || (b.profiles as any);
              const startDate = new Date(b.start_at);

              return (
                <div
                  key={b.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {candidate?.full_name ?? 'Candidate Session'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {candidate?.email} · {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <span className="badge-green text-xs px-2.5 py-0.5">Completed</span>
                    <span className="font-mono text-lg font-bold text-neon-green">
                      +${earningFor(b).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
