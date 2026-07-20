import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bell,
  CheckCircle,
  MessageCircle,
  Heart,
  GraduationCap,
  CalendarDays,
  Zap,
  Gift,
} from './Icons';
import { AppNotification, NotificationType } from '../types';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from '../services/notificationService';
import { fetchRecentActivity } from '../services/leaderboardService';
import { formatTimeAgo } from '../utils/formatHelper';

const TYPE_STYLES: Record<NotificationType, { icon: React.ReactNode; classes: string }> = {
  reply: { icon: <MessageCircle className="h-3.5 w-3.5" />, classes: 'bg-blue-100 text-blue-600' },
  accepted: {
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    classes: 'bg-green-100 text-green-600',
  },
  reaction: { icon: <Heart className="h-3.5 w-3.5" />, classes: 'bg-pink-100 text-pink-500' },
  enrollment: {
    icon: <GraduationCap className="h-3.5 w-3.5" />,
    classes: 'bg-indigo-100 text-indigo-600',
  },
  booking: {
    icon: <CalendarDays className="h-3.5 w-3.5" />,
    classes: 'bg-amber-100 text-amber-600',
  },
};

interface NotificationBellProps {
  profile: { id: string; spendable_points?: number } | null;
}

/**
 * Header bell: live notification center (tab 1) + recent point activity (tab 2).
 * New notifications arrive over Supabase Realtime; the backend is set up by
 * SUPABASE_NOTIFICATIONS.sql.
 */
const NotificationBell: React.FC<NotificationBellProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activity, setActivity] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'alerts' | 'points'>('alerts');

  useEffect(() => {
    if (!profile?.id) return;

    fetchNotifications().then(setNotifications);
    fetchUnreadCount().then(setUnreadCount);
    fetchRecentActivity().then(setActivity);

    const unsubscribe = subscribeToNotifications(profile.id, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(notification.title, { icon: '🔔' });
    });
    return unsubscribe;
  }, [profile?.id]);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickNotification = (notification: AppNotification) => {
    if (!notification.is_read) {
      markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="p-2 text-gray-400 hover:text-primary relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setTab('alerts')}
                className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${tab === 'alerts' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400'}`}
              >
                ការជូនដំណឹង
              </button>
              <button
                type="button"
                onClick={() => setTab('points')}
                className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${tab === 'points' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400'}`}
              >
                ពិន្ទុ ({profile?.spendable_points || 0})
              </button>
            </div>

            {tab === 'alerts' ? (
              <>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      មិនទាន់មានការជូនដំណឹងទេ។
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const style = TYPE_STYLES[notification.type] || {
                        icon: <Bell className="h-3.5 w-3.5" />,
                        classes: 'bg-gray-100 text-gray-500',
                      };
                      return (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() => handleClickNotification(notification)}
                          className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 flex items-start gap-3 ${notification.is_read ? '' : 'bg-teal-50/50'}`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${style.classes}`}>
                            {style.icon}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}
                            >
                              {notification.title}
                            </p>
                            {notification.body && (
                              <p className="text-[11px] text-gray-400 truncate">
                                {notification.body}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="ml-auto mt-1 w-2 h-2 bg-primary rounded-full shrink-0"></span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="block w-full p-2 text-center text-xs font-bold text-primary bg-teal-50 hover:bg-teal-100 transition-colors"
                  >
                    សម្គាល់ថាបានអានទាំងអស់ (Mark all read)
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="max-h-72 overflow-y-auto">
                  {activity.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      មិនទាន់មានសកម្មភាពទេ។
                    </div>
                  ) : (
                    activity.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 border-b border-gray-50 hover:bg-gray-50 flex items-start gap-3"
                      >
                        <div
                          className={`mt-0.5 p-1 rounded-full ${act.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                        >
                          {act.amount > 0 ? (
                            <Zap className="h-3 w-3" />
                          ) : (
                            <Gift className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-800 font-medium">{act.reason}</p>
                          <p
                            className={`text-[10px] font-bold ${act.amount > 0 ? 'text-green-600' : 'text-red-500'}`}
                          >
                            {act.amount > 0 ? '+' : ''}
                            {act.amount} ពិន្ទុ
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  to="/leaderboard"
                  className="block p-2 text-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  មើលតារាងពិន្ទុ (Leaderboard)
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
