'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Calendar, Info, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { playNotificationSound } from '@/lib/audio';

type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: 'booking' | 'system';
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, title, body, type, read_at, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) {
        setItems(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.body,
            type: item.type as Notification['type'],
            read: Boolean(item.read_at),
            createdAt: item.created_at,
          }))
        );
      }
    };

    void loadNotifications();

    const onNotify = (event: Event) => {
      const detail = (
        event as CustomEvent<{ title: string; body: string; type?: Notification['type'] }>
      ).detail;

      if (!detail) return;

      playNotificationSound();

      setItems((current) => [
        {
          id: crypto.randomUUID(),
          title: detail.title,
          body: detail.body,
          type: detail.type ?? 'system',
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...current,
      ]);
    };

    window.addEventListener('app-notification', onNotify);
    return () => window.removeEventListener('app-notification', onNotify);
  }, []);

  const unread = items.filter((item) => !item.read).length;

  const markAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    await createClient().from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
  };

  const handleNotificationClick = async (item: Notification) => {
    if (!item.read) {
      setItems((current) =>
        current.map((i) => (i.id === item.id ? { ...i, read: true } : i))
      );
      await createClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', item.id);
    }

    setOpen(false);

    // Smart route navigation depending on notification context
    const lowerTitle = item.title.toLowerCase();
    const lowerBody = item.body.toLowerCase();

    if (lowerTitle.includes('mentor') || lowerBody.includes('mentor')) {
      if (window.location.pathname.startsWith('/mentor')) {
        router.push('/mentor/sessions');
      } else {
        router.push('/sessions');
      }
    } else if (item.type === 'booking') {
      if (window.location.pathname.startsWith('/mentor')) {
        router.push('/mentor/sessions');
      } else {
        router.push('/sessions');
      }
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-pointer bg-white/[0.04] border border-white/10 hover:border-white/20 text-text-secondary hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full px-1 flex items-center justify-center text-[9px] font-bold animate-pulse"
            style={{ background: 'var(--neon-green)', color: '#06121a' }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] card rounded-2xl overflow-hidden z-50 border border-white/15"
          style={{ boxShadow: '0 18px 45px rgba(0,0,0,.6)' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h2 className="font-bold text-white text-sm">Notifications</h2>
              <p className="text-[11px] text-text-secondary">
                {unread ? `${unread} unread updates` : 'You are all caught up'}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs flex items-center gap-1 cursor-pointer text-neon-cyan hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors cursor-pointer group ${
                    item.read ? 'hover:bg-white/[0.03]' : 'bg-neon-cyan/[0.06] hover:bg-neon-cyan/[0.1]'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background:
                        item.type === 'booking'
                          ? 'rgba(124,92,252,.2)'
                          : 'rgba(0,194,255,.15)',
                    }}
                  >
                    {item.type === 'booking' ? (
                      <Calendar className="w-4 h-4 text-neon-purple" />
                    ) : (
                      <Info className="w-4 h-4 text-neon-cyan" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-white transition-colors shrink-0" />
                    </div>
                    <p className="text-xs mt-0.5 text-text-secondary line-clamp-2">{item.body}</p>
                    <p className="text-[10px] mt-1 text-text-muted">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-10 text-center">
                <Bell className="w-7 h-7 mx-auto mb-3 text-text-muted" />
                <p className="text-sm font-semibold text-white">No notifications yet</p>
                <p className="text-xs mt-1 text-text-secondary">
                  Booking updates and session reminders will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
