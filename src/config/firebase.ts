import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore — getReactNativePersistence is exported from the RN bundle at runtime
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'placeholder',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'placeholder',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'placeholder',
};

// Initialize Firebase App (safe for hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth (safe for hot reload — getAuth returns existing instance)
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Auth was already initialized (hot reload) — reuse existing instance
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
