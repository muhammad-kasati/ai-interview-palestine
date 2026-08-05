'use client';

import { useEffect } from 'react';
import { playNotificationSound } from '@/lib/audio';

export default function SessionReminderChecker() {
  useEffect(() => {
    async function checkReminders() {
      try {
        const res = await fetch('/api/cron/session-reminders', { method: 'POST' });
        const data = await res.json();
        if (data?.reminders1hSent > 0 || data?.remindersStartSent > 0) {
          playNotificationSound();
          // Trigger custom app notification update event
          window.dispatchEvent(
            new CustomEvent('app-notification', {
              detail: {
                title: 'Session Reminder ⏰',
                body: 'You have an upcoming mentor interview session. Check notifications!',
                type: 'booking',
              },
            })
          );
        }
      } catch (e) {
        // Silent catch for background polling
      }
    }

    // Initial run
    void checkReminders();

    // Poll every 3 minutes
    const interval = setInterval(checkReminders, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
