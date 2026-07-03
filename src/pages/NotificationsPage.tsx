import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Check, CheckCheck, MessageCircle, Heart, Users, AlertCircle, ArrowLeft, Filter, Settings as Cog } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import communityService, { Notification } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader, Button, Badge, EmptyState, Skeleton, Tabs } from '../components/ui';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const currentUserId = user?.uid || '';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>(
    (searchParams.get('filter') as any) || 'all',
  );

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);

    const unsubscribe = communityService.subscribeToNotifications(
      currentUserId,
      (newNotifications) => {
        setNotifications(newNotifications);
        const unread = newNotifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
        setLoading(false);
      },
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentUserId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await communityService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return;
    try {
      await communityService.markAllNotificationsRead(currentUserId);
      toast.success(t('notifications.markedAllRead', 'All marked as read'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(t('notifications.failedMarkAll', 'Failed to mark all as read'));
    }
  };

  const handleNotificationClick = (n: Notification & { link?: string }) => {
    if (!n.read) handleMarkAsRead(n.id);
    // Deep-link to the related resource
    if (n.link) navigate(n.link);
    else if (n.type === 'reply' && n.postId) navigate('/community');
    else if (n.type === 'group_invite' && n.groupId) navigate(`/groups/${n.groupId}`);
    else if (n.type === 'alert') navigate('/notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-sky-600" />;
      case 'like':
        return <Heart className="w-4 h-4 text-danger-600" />;
      case 'group_invite':
        return <Users className="w-4 h-4 text-[#7e22ce]" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-harvest-700" />;
      default:
        return <Bell className="w-4 h-4 text-ink-500" />;
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    if (filter === 'read') return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const setFilterAndUrl = (f: 'all' | 'unread' | 'read') => {
    setFilter(f);
    setSearchParams({ filter: f });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-app py-5 md:py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="md:hidden inline-flex items-center gap-1 text-sm text-ink-600 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back', 'Back')}
        </button>

        <PageHeader
          eyebrow={t('notifications.inbox', 'Inbox')}
          title={t('notifications.title', 'Notifications')}
          description={`${unreadCount} ${t('notifications.unread', 'unread')} ${unreadCount === 1 ? t('notifications.notification', 'notification') : t('notifications.notifications', 'notifications')}`}
          actions={
            unreadCount > 0 && (
              <Button variant="secondary" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllAsRead}>
                {t('notifications.markAllRead', 'Mark all as read')}
              </Button>
            )
          }
        />

        <div className="mt-5">
          <Tabs
            variant="underline"
            tabs={[
              { id: 'all', label: `${t('common.all', 'All')} (${notifications.length})` },
              { id: 'unread', label: `${t('notifications.unread', 'Unread')} (${unreadCount})` },
              { id: 'read', label: `${t('notifications.read', 'Read')} (${notifications.length - unreadCount})` },
            ]}
            active={filter}
            onChange={(id) => setFilterAndUrl(id as any)}
          />
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card card-padded flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-12 h-12 text-ink-300" />}
              title={t('notifications.caughtUp', "You're all caught up")}
              description={filter === 'unread' ? t('notifications.noUnread', 'No unread notifications') : t('notifications.noneYet', 'No notifications yet')}
            />
          ) : (
            filtered.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left card card-padded flex items-start gap-3 transition-colors ${
                  !n.read ? 'border-l-4 border-l-leaf-500 bg-leaf-50/30' : ''
                } hover:bg-sunken`}
              >
                <div className="w-8 h-8 rounded-full bg-sunken flex items-center justify-center flex-shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-strong">{n.title || n.message}</p>
                      {n.title && <p className="text-xs text-muted mt-0.5">{n.message}</p>}
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-leaf-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-500">
                    <span>{new Date((n as any).createdAt || n.timestamp).toLocaleString()}</span>
                    {n.type && (
                      <Badge tone="default" className="text-[10px]">{n.type}</Badge>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    className="p-1.5 rounded hover:bg-sunken text-ink-600"
                    aria-label="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
