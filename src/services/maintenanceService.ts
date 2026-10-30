import { MaintenanceTicket, MaintenanceStatus } from '@/types';
import { INITIAL_MAINTENANCE } from '@/lib/seed';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'campusops_maintenance_v2';
const FIRESTORE_COLLECTION = 'maintenance';

const getStore = (): MaintenanceTicket[] => {
  if (typeof window === 'undefined') return INITIAL_MAINTENANCE;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MAINTENANCE));
    return INITIAL_MAINTENANCE;
  }
  try { return JSON.parse(raw); } catch { return INITIAL_MAINTENANCE; }
};

const saveStore = (items: MaintenanceTicket[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const maintenanceService = {
  getAll: async (): Promise<MaintenanceTicket[]> => {
    if (db) {
      try {
        const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
        if (!snap.empty) {
          const list: MaintenanceTicket[] = [];
          snap.forEach(d => list.push(d.data() as MaintenanceTicket));
          saveStore(list);
          return list;
        }
      } catch {
        // fallback
      }
    }
    return getStore();
  },

  create: async (data: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTicket> => {
    const list = getStore();
    const id = `MNT-${Math.floor(4000 + Math.random() * 5000)}`;
    const now = new Date().toISOString();
    const ticket: MaintenanceTicket = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(ticket);
    saveStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), ticket);
      } catch {
        // fallback
      }
    }

    return ticket;
  },

  updateStatus: async (
    id: string, 
    status: MaintenanceStatus, 
    assignedTechnician?: string, 
    completionNotes?: string
  ): Promise<MaintenanceTicket | null> => {
    const list = getStore();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      status,
      assignedTechnician: assignedTechnician !== undefined ? assignedTechnician : list[index].assignedTechnician,
      completionNotes: completionNotes !== undefined ? completionNotes : list[index].completionNotes,
      updatedAt: new Date().toISOString(),
    };

    saveStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), list[index], { merge: true });
      } catch {
        // fallback
      }
    }

    return list[index];
  }
};
