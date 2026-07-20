import { supabase } from './supabaseClient';
import { AppNotification } from '../types';

// Backend: notifications table + triggers created by SUPABASE_NOTIFICATIONS.sql.
// Rows are inserted only by database triggers (replies, accepted answers,
// reactions, enrollment and booking status changes); the client reads,
// marks-as-read, and subscribes for live inserts.

// The table ships in a separate SQL file, so tolerate a database that has not
// run it yet: log once and behave as "no notifications" instead of erroring.
let tableMissing = false;

const isMissingTable = (error: { code?: string } | null): boolean => error?.code === '42P01';

/**
 * Fetches the current user's notifications, newest first.
 */
export const fetchNotifications = async (limit: number = 20): Promise<AppNotification[]> => {
  if (tableMissing) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) {
      tableMissing = true;
      console.warn('Notifications table missing; run SUPABASE_NOTIFICATIONS.sql.');
    } else {
      console.error('Error fetching notifications:', error);
    }
    return [];
  }
  return (data || []) as AppNotification[];
};

/**
 * Counts the current user's unread notifications.
 */
export const fetchUnreadCount = async (): Promise<number> => {
  if (tableMissing) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) {
    if (isMissingTable(error)) tableMissing = true;
    return 0;
  }
  return count || 0;
};

/**
 * Marks a single notification as read.
 */
export const markNotificationRead = async (id: string): Promise<void> => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error && !isMissingTable(error)) {
    console.error('Error marking notification read:', error);
  }
};

/**
 * Marks all of the current user's notifications as read.
 */
export const markAllNotificationsRead = async (): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error && !isMissingTable(error)) {
    console.error('Error marking notifications read:', error);
  }
};

/**
 * Subscribes to live notification inserts for a user.
 * Returns an unsubscribe function; always call it on cleanup.
 */
export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: AppNotification) => void
): (() => void) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as AppNotification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
