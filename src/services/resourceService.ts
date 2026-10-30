import { CampusResource, ResourceBooking, BookingStatus, UserRole } from '@/types';
import { INITIAL_RESOURCES, INITIAL_BOOKINGS } from '@/lib/seed';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const RES_STORAGE_KEY = 'campusops_resources_v2';
const BKG_STORAGE_KEY = 'campusops_bookings_v2';

const getResourcesStore = (): CampusResource[] => {
  if (typeof window === 'undefined') return INITIAL_RESOURCES;
  const raw = localStorage.getItem(RES_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(RES_STORAGE_KEY, JSON.stringify(INITIAL_RESOURCES));
    return INITIAL_RESOURCES;
  }
  try { return JSON.parse(raw); } catch { return INITIAL_RESOURCES; }
};

const getBookingsStore = (): ResourceBooking[] => {
  if (typeof window === 'undefined') return INITIAL_BOOKINGS;
  const raw = localStorage.getItem(BKG_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(BKG_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  }
  try { return JSON.parse(raw); } catch { return INITIAL_BOOKINGS; }
};

const saveBookingsStore = (items: ResourceBooking[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BKG_STORAGE_KEY, JSON.stringify(items));
  }
};

export const resourceService = {
  getResources: async (): Promise<CampusResource[]> => {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'resources'));
        if (!snap.empty) {
          const list: CampusResource[] = [];
          snap.forEach(d => list.push(d.data() as CampusResource));
          return list;
        }
      } catch {
        // fallback
      }
    }
    return getResourcesStore();
  },

  getBookings: async (): Promise<ResourceBooking[]> => {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        if (!snap.empty) {
          const list: ResourceBooking[] = [];
          snap.forEach(d => list.push(d.data() as ResourceBooking));
          saveBookingsStore(list);
          return list;
        }
      } catch {
        // fallback
      }
    }
    return getBookingsStore();
  },

  createBooking: async (data: Omit<ResourceBooking, 'id' | 'createdAt' | 'status'>): Promise<ResourceBooking> => {
    const list = getBookingsStore();
    const id = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: ResourceBooking = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newBooking);
    saveBookingsStore(list);

    if (db) {
      try {
        await setDoc(doc(db, 'bookings', id), newBooking);
      } catch {
        // fallback
      }
    }
    return newBooking;
  },

  updateBookingStatus: async (
    id: string, 
    status: BookingStatus, 
    approvedBy?: string, 
    approverRole?: UserRole, 
    remarks?: string
  ): Promise<ResourceBooking | null> => {
    const list = getBookingsStore();
    const index = list.findIndex(b => b.id === id);
    if (index === -1) return null;

    list[index] = { 
      ...list[index], 
      status,
      approvedBy: approvedBy || list[index].approvedBy,
      approverRole: approverRole || list[index].approverRole,
      remarks: remarks || list[index].remarks,
    };
    saveBookingsStore(list);

    if (db) {
      try {
        await setDoc(doc(db, 'bookings', id), list[index], { merge: true });
      } catch {
        // fallback
      }
    }
    return list[index];
  }
};
