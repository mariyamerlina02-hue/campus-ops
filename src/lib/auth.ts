import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '@/types';

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  student: {
    uid: 'demo-student-001',
    email: 'alex.rivers@campus.edu',
    displayName: 'Alex Rivers',
    role: 'student',
    roleTitle: 'Undergraduate Scholar',
    department: 'Computer Science & Engineering',
    studentOrEmployeeId: 'STU-2024-8841',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  faculty: {
    uid: 'demo-faculty-002',
    email: 'dr.chen@campus.edu',
    displayName: 'Dr. Marcus Chen',
    role: 'faculty',
    roleTitle: 'Assistant Professor & Lab In-charge',
    department: 'Computer Science & Engineering',
    studentOrEmployeeId: 'FAC-CSE-104',
    phone: '+1 (555) 345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date().toISOString(),
  },
  add_hod: {
    uid: 'demo-add-hod-003',
    email: 'dr.vasanth@campus.edu',
    displayName: 'Dr. R. Vasanth',
    role: 'add_hod',
    roleTitle: 'Associate Professor & Additional HOD',
    department: 'Computer Science & Engineering',
    studentOrEmployeeId: 'AHOD-CSE-019',
    phone: '+1 (555) 456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: new Date().toISOString(),
  },
  hod: {
    uid: 'demo-hod-004',
    email: 'prof.sharma@campus.edu',
    displayName: 'Prof. Arvind Sharma',
    role: 'hod',
    roleTitle: 'Head of Department (HOD)',
    department: 'Computer Science & Engineering',
    studentOrEmployeeId: 'HOD-CSE-001',
    phone: '+1 (555) 567-8901',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: new Date().toISOString(),
  },
  dean: {
    uid: 'demo-dean-005',
    email: 'dean.academics@campus.edu',
    displayName: 'Dr. Eleanor Harrison',
    role: 'dean',
    roleTitle: 'Dean of Academic & Student Affairs',
    department: 'School of Engineering & Computing',
    studentOrEmployeeId: 'DEAN-ACAD-01',
    phone: '+1 (555) 678-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    createdAt: new Date().toISOString(),
  },
  joint_registrar: {
    uid: 'demo-jr-006',
    email: 'jr.operations@campus.edu',
    displayName: 'Suresh Nair',
    role: 'joint_registrar',
    roleTitle: 'Joint Registrar (Campus Infrastructure & Ops)',
    department: 'University Central Administration',
    studentOrEmployeeId: 'JR-OPS-003',
    phone: '+1 (555) 789-0123',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    createdAt: new Date().toISOString(),
  },
  registrar: {
    uid: 'demo-reg-007',
    email: 'registrar@campus.edu',
    displayName: 'Dr. K. S. Ramanathan',
    role: 'registrar',
    roleTitle: 'University Registrar & Chief Administrative Officer',
    department: 'Office of the Registrar',
    studentOrEmployeeId: 'REG-EXEC-001',
    phone: '+1 (555) 999-0001',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
    createdAt: new Date().toISOString(),
  },
  staff: {
    uid: 'demo-staff-008',
    email: 'sarah.miller@campus.edu',
    displayName: 'Sarah Miller',
    role: 'staff',
    roleTitle: 'Facility Maintenance Supervisor',
    department: 'Campus Facilities & Operations',
    studentOrEmployeeId: 'STAFF-OPS-330',
    phone: '+1 (555) 456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: new Date().toISOString(),
  },
  security: {
    uid: 'demo-security-009',
    email: 'officer.jackson@campus.edu',
    displayName: 'Officer Davis Jackson',
    role: 'security',
    roleTitle: 'Emergency Sentinel Commander',
    department: 'Campus Security & Emergency Response',
    studentOrEmployeeId: 'SEC-UNIT-07',
    phone: '+1 (555) 911-0022',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    createdAt: new Date().toISOString(),
  },
  admin: {
    uid: 'demo-admin-010',
    email: 'admin.ops@campus.edu',
    displayName: 'System Administrator',
    role: 'admin',
    roleTitle: 'CampusOps Master Controller',
    department: 'Information Technology Services',
    studentOrEmployeeId: 'SYS-ROOT-00',
    phone: '+1 (555) 888-0000',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString(),
  },
};

export const loginWithFirebaseOrDemo = async (email: string, pass: string): Promise<UserProfile> => {
  const normalized = email.toLowerCase().trim();
  
  // 1. Direct match with verified demo accounts
  const foundDemo = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === normalized);
  if (foundDemo) {
    // Sync profile into Firestore if available
    syncUserToFirestore(foundDemo);
    return foundDemo;
  }

  // 2. Real Firebase Auth execution
  if (auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;
      
      // Try to read custom role from Firestore
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
          }
        } catch {
          // ignore
        }
      }

      const generatedProfile: UserProfile = {
        uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        role: 'student',
        roleTitle: 'University Member',
        department: 'General Studies',
        studentOrEmployeeId: 'ID-' + uid.slice(0, 6).toUpperCase(),
        createdAt: new Date().toISOString(),
      };

      syncUserToFirestore(generatedProfile);
      return generatedProfile;
    } catch {
      // Synthesize fallback persona
      const roleFromEmail: UserRole = 
        email.includes('registrar') ? 'registrar' :
        email.includes('jr') ? 'joint_registrar' :
        email.includes('dean') ? 'dean' :
        email.includes('hod') ? 'hod' :
        email.includes('prof') || email.includes('chen') ? 'faculty' : 'student';

      const fallback = DEMO_USERS[roleFromEmail] || DEMO_USERS.student;
      return fallback;
    }
  }

  return DEMO_USERS.student;
};

export const registerUser = async (data: Partial<UserProfile> & { password?: string }): Promise<UserProfile> => {
  const uid = 'user-' + Date.now();
  const role = data.role || 'student';
  const profile: UserProfile = {
    uid,
    email: data.email || 'user@campus.edu',
    displayName: data.displayName || 'New User',
    role,
    roleTitle: ROLE_LABELS_MAP[role] || 'Member',
    department: data.department || 'Undergraduate Studies',
    studentOrEmployeeId: data.studentOrEmployeeId || 'ID-' + Math.floor(10000 + Math.random() * 90000),
    phone: data.phone || '',
    avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString(),
  };

  syncUserToFirestore(profile);
  return profile;
};

const ROLE_LABELS_MAP: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty Member',
  add_hod: 'Additional HOD',
  hod: 'Head of Department (HOD)',
  dean: 'Dean',
  joint_registrar: 'Joint Registrar',
  registrar: 'University Registrar',
};

async function syncUserToFirestore(profile: UserProfile) {
  if (db) {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (err) {
      console.warn('Firestore user sync deferred:', err);
    }
  }
}
