import { CampusAnnouncement, UserRole } from '@/types';
import { INITIAL_ANNOUNCEMENTS } from '@/lib/seed';

const STORAGE_KEY = 'campusops_announcements_v1';

const getStore = (): CampusAnnouncement[] => {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    return INITIAL_ANNOUNCEMENTS;
  }
  try { return JSON.parse(raw); } catch { return INITIAL_ANNOUNCEMENTS; }
};

const saveStore = (items: CampusAnnouncement[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const announcementService = {
  getAll: async (userRole?: UserRole): Promise<CampusAnnouncement[]> => {
    const list = getStore();
    if (!userRole) return list;
    return list.filter(a => a.targetRoles.includes(userRole));
  },

  create: async (data: Omit<CampusAnnouncement, 'id' | 'createdAt'>): Promise<CampusAnnouncement> => {
    const list = getStore();
    const id = `ANN-2026-${Math.floor(10 + Math.random() * 90)}`;
    const announcement: CampusAnnouncement = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    list.unshift(announcement);
    saveStore(list);
    return announcement;
  }
};
