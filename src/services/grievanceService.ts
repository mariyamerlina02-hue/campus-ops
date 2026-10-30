import { Grievance, GrievanceComment, GrievanceStatus, GrievancePriority, GrievanceCategory } from '@/types';
import { INITIAL_GRIEVANCES } from '@/lib/seed';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'campusops_grievances_v2';
const FIRESTORE_COLLECTION = 'grievances';

const getLocalStore = (): Grievance[] => {
  if (typeof window === 'undefined') return INITIAL_GRIEVANCES;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GRIEVANCES));
    return INITIAL_GRIEVANCES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_GRIEVANCES;
  }
};

const saveLocalStore = (items: Grievance[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const grievanceService = {
  getAll: async (): Promise<Grievance[]> => {
    // Attempt Firestore first
    if (db) {
      try {
        const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
        if (!snap.empty) {
          const list: Grievance[] = [];
          snap.forEach(d => list.push(d.data() as Grievance));
          saveLocalStore(list);
          return list;
        }
      } catch (err) {
        console.warn('Firebase Firestore read notice: using synchronized local store', err);
      }
    }
    return getLocalStore();
  },

  getById: async (id: string): Promise<Grievance | undefined> => {
    const list = await grievanceService.getAll();
    return list.find(g => g.id === id);
  },

  create: async (data: Omit<Grievance, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'comments'>): Promise<Grievance> => {
    const list = getLocalStore();
    const id = `GRV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const newGrievance: Grievance = {
      ...data,
      id,
      upvotes: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newGrievance);
    saveLocalStore(list);

    // Sync to Firestore
    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), newGrievance);
      } catch (e) {
        console.warn('Firebase write deferred to local persistence:', e);
      }
    }

    return newGrievance;
  },

  updateStatus: async (
    id: string, 
    status: GrievanceStatus, 
    assignedTo?: string, 
    assignedName?: string, 
    resolutionNotes?: string,
    escalationLevel?: 'department' | 'school' | 'university_executive'
  ): Promise<Grievance | null> => {
    const list = getLocalStore();
    const index = list.findIndex(g => g.id === id);
    if (index === -1) return null;

    const updated: Grievance = {
      ...list[index],
      status,
      assignedTo: assignedTo !== undefined ? assignedTo : list[index].assignedTo,
      assignedName: assignedName !== undefined ? assignedName : list[index].assignedName,
      resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : list[index].resolutionNotes,
      escalationLevel: escalationLevel !== undefined ? escalationLevel : list[index].escalationLevel,
      updatedAt: new Date().toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : list[index].resolvedAt,
    };

    list[index] = updated;
    saveLocalStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), updated, { merge: true });
      } catch (e) {
        console.warn('Firebase sync deferred:', e);
      }
    }

    return updated;
  },

  toggleUpvote: async (id: string, userId: string): Promise<Grievance | null> => {
    const list = getLocalStore();
    const index = list.findIndex(g => g.id === id);
    if (index === -1) return null;

    const item = list[index];
    const hasUpvoted = item.upvotes.includes(userId);
    const newUpvotes = hasUpvoted 
      ? item.upvotes.filter(u => u !== userId)
      : [...item.upvotes, userId];

    const updated: Grievance = {
      ...item,
      upvotes: newUpvotes,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    saveLocalStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), { upvotes: newUpvotes }, { merge: true });
      } catch {
        // local sync
      }
    }

    return updated;
  },

  addComment: async (id: string, comment: Omit<GrievanceComment, 'id' | 'createdAt'>): Promise<Grievance | null> => {
    const list = getLocalStore();
    const index = list.findIndex(g => g.id === id);
    if (index === -1) return null;

    const newComment: GrievanceComment = {
      ...comment,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    const updated: Grievance = {
      ...list[index],
      comments: [...list[index].comments, newComment],
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    saveLocalStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), { comments: updated.comments }, { merge: true });
      } catch {
        // local sync
      }
    }

    return updated;
  }
};
