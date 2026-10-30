import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'orvian-89563.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'orvian-89563',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'orvian-89563.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '109283746501',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:109283746501:web:9f8a7e6d5c4b3a210',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let isConfigured = false;

try {
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  }
} catch (error) {
  console.warn('Firebase initialization notice: Running in mock-resilient hybrid mode', error);
}

export { app, auth, db, storage, isConfigured };
