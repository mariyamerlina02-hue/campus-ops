import { CampusNotification } from '@/types';
import { INITIAL_NOTIFICATIONS } from '@/lib/seed';

const STORAGE_KEY = 'campusops_notifications_v1';

const getStore = (): CampusNotification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try { return JSON.parse(raw); } catch { return INITIAL_NOTIFICATIONS; }
};

const saveStore = (items: CampusNotification[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const notificationService = {
  getUserNotifications: async (userId: string): Promise<CampusNotification[]> => {
    const list = getStore();
    return list.filter(n => n.userId === userId || n.userId === 'all');
  },

  markAsRead: async (id: string): Promise<void> => {
    const list = getStore();
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      saveStore(list);
    }
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const list = getStore();
    list.forEach(n => {
      if (n.userId === userId || n.userId === 'all') {
        n.read = true;
      }
    });
    saveStore(list);
  },

  create: async (data: Omit<CampusNotification, 'id' | 'createdAt' | 'read'>): Promise<CampusNotification> => {
    const list = getStore();
    const notification: CampusNotification = {
      ...data,
      id: 'notif-' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(notification);
    saveStore(list);
    return notification;
  }
};
