import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Public client Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDe8T7drOKb6Mu7XvAXhx_M-IlU-FysvkM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nexalus-innovations-llp.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nexalus-innovations-llp',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nexalus-innovations-llp.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '894384495280',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:894384495280:web:67dd37f90189b14ebdb975'
};

// Determine if valid production Firebase config is supplied
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization error; falling back to resilient local store:', error);
  }
}

export { app, auth, db, storage };
