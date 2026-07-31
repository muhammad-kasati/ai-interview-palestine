'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Calendar, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Notification = { id: string; title: string; body: string; createdAt: string; read: boolean; type: 'booking' | 'system' };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  useEffect(() => {
    const supabase = createClient();
    const loadNotifications = async () => {
      const { data } = await supabase.from('notifications').select('id, title, body, type, read_at, created_at').order('created_at', { ascending: false }).limit(30);
      if (data) setItems(data.map((item) => ({ id: item.id, title: item.title, body: item.body, type: item.type as Notification['type'], read: Boolean(item.read_at), createdAt: item.created_at })));
    };
    void loadNotifications();
    const onNotify = (event: Event) => {
      const detail = (event as CustomEvent<{ title: string; body: string; type?: Notification['type'] }>).detail;
      if (!detail) return;
      setItems((current) => [{ id: crypto.randomUUID(), title: detail.title, body: detail.body, type: detail.type ?? 'system', createdAt: new Date().toISOString(), read: false }, ...current]);
    };
    window.addEventListener('app-notification', onNotify);
    return () => window.removeEventListener('app-notification', onNotify);
  }, []);
  const unread = items.filter((item) => !item.read).length;
  const markAll = async () => { setItems((current) => current.map((item) => ({ ...item, read: true }))); await createClient().from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null); };
  const markRead = async (id: string) => { setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)); await createClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id); };
  return <div className="relative"><button onClick={() => setOpen((value) => !value)} className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }} aria-label="Notifications"><Bell className="w-3.5 h-3.5" />{unread > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full px-1 flex items-center justify-center text-[9px] font-bold" style={{ background: 'var(--neon-cyan)', color: '#06121a' }}>{unread}</span>}</button>{open && <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] card rounded-2xl overflow-hidden z-50" style={{ boxShadow: '0 18px 45px rgba(0,0,0,.4)' }}><div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}><div><h2 className="font-bold text-white">Notifications</h2><p className="text-[11px]">{unread ? `${unread} unread` : 'You are all caught up'}</p></div><button onClick={markAll} className="text-xs flex items-center gap-1 cursor-pointer" style={{ color: 'var(--neon-cyan)' }}><CheckCheck className="w-3.5 h-3.5" /> Mark all read</button></div><div className="max-h-80 overflow-y-auto">{items.length ? items.map((item) => <button key={item.id} onClick={() => void markRead(item.id)} className="w-full p-4 flex gap-3 text-left border-b cursor-pointer" style={{ background: item.read ? 'transparent' : 'rgba(0,194,255,.05)', borderColor: 'var(--border-subtle)' }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.type === 'booking' ? 'rgba(124,92,252,.15)' : 'rgba(0,194,255,.12)' }}>{item.type === 'booking' ? <Calendar className="w-4 h-4 text-neon-purple" /> : <Info className="w-4 h-4 text-neon-cyan" />}</div><div className="flex-1"><p className="text-xs font-bold text-white">{item.title}</p><p className="text-xs mt-1">{item.body}</p><p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleString()}</p></div>{!item.read && <span className="w-2 h-2 rounded-full mt-1" style={{ background: 'var(--neon-cyan)' }} />}</button>) : <div className="p-10 text-center"><Bell className="w-7 h-7 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} /><p className="text-sm font-semibold text-white">No notifications yet</p><p className="text-xs mt-1">Booking updates and session reminders will appear here.</p></div>}</div></div>}</div>;
}
