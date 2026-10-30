import { SecurityIncident, IncidentStatus, IncidentSeverity, IncidentType } from '@/types';
import { INITIAL_INCIDENTS } from '@/lib/seed';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'campusops_incidents_v2';
const FIRESTORE_COLLECTION = 'incidents';

const getStore = (): SecurityIncident[] => {
  if (typeof window === 'undefined') return INITIAL_INCIDENTS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS));
    return INITIAL_INCIDENTS;
  }
  try { return JSON.parse(raw); } catch { return INITIAL_INCIDENTS; }
};

const saveStore = (items: SecurityIncident[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const incidentService = {
  getAll: async (): Promise<SecurityIncident[]> => {
    if (db) {
      try {
        const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
        if (!snap.empty) {
          const list: SecurityIncident[] = [];
          snap.forEach(d => list.push(d.data() as SecurityIncident));
          saveStore(list);
          return list;
        }
      } catch {
        // fallback
      }
    }
    return getStore();
  },

  triggerEmergencySOS: async (
    reporterId: string, 
    reporterName: string, 
    locationStr?: string, 
    coords?: { lat: number; lng: number }
  ): Promise<SecurityIncident> => {
    const list = getStore();
    const id = `SOS-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const incident: SecurityIncident = {
      id,
      title: '🚨 EMERGENCY SOS PANIC BEACON ACTIVATED',
      description: 'Immediate student/personnel distress call transmitted to Security Dispatch, Joint Registrar, and Medical Units.',
      type: 'security',
      severity: 'critical_sos',
      status: 'dispatched',
      location: locationStr || 'Live User Device GPS coordinates',
      coordinates: coords || { lat: 37.7749, lng: -122.4194 },
      isEmergencySos: true,
      reporterId,
      reporterName,
      anonymous: false,
      respondingUnit: 'Central Command Rapid Response Unit 1',
      actionTaken: 'High-decibel alert broadcast to on-duty campus security officers.',
      createdAt: now,
    };
    list.unshift(incident);
    saveStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), incident);
      } catch {
        // fallback
      }
    }

    return incident;
  },

  report: async (data: Omit<SecurityIncident, 'id' | 'createdAt'>): Promise<SecurityIncident> => {
    const list = getStore();
    const id = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const incident: SecurityIncident = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    list.unshift(incident);
    saveStore(list);

    if (db) {
      try {
        await setDoc(doc(db, FIRESTORE_COLLECTION, id), incident);
      } catch {
        // fallback
      }
    }

    return incident;
  },

  updateStatus: async (
    id: string, 
    status: IncidentStatus, 
    respondingUnit?: string, 
    actionTaken?: string,
    incidentCommander?: string
  ): Promise<SecurityIncident | null> => {
    const list = getStore();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      status,
      respondingUnit: respondingUnit !== undefined ? respondingUnit : list[index].respondingUnit,
      actionTaken: actionTaken !== undefined ? actionTaken : list[index].actionTaken,
      incidentCommander: incidentCommander !== undefined ? incidentCommander : list[index].incidentCommander,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : list[index].resolvedAt,
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
