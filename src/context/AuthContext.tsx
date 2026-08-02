import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';
import { AppUser } from '../types';

// Configure Google Sign-In with the Web Client ID
// (The native module uses google-services.json for the Android Client ID automatically)
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

interface AuthContextProps {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let appUser: AppUser;

        if (!userSnap.exists()) {
          // First-time user — create profile in Firestore
          appUser = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            teamId: 'Equipo de Medios',
            createdAt: Date.now(),
          };
          await setDoc(userRef, appUser);
        } else {
          appUser = userSnap.data() as AppUser;
        }
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Native Google Sign-In flow
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        }
      }
    } catch (error: any) {
      // User cancelled or error — silently ignore cancellations
      if (error?.code !== 'SIGN_IN_CANCELLED' && error?.code !== '12501') {
        console.error('Google Sign-In error:', error);
      }
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken } = credential;
      if (identityToken) {
        const provider = new OAuthProvider('apple.com');
        const authCredential = provider.credential({
          idToken: identityToken,
        });
        await signInWithCredential(auth, authCredential);
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // user canceled
      } else {
        console.error('Apple Sign-In error:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (_) {
      // Google SDK might not have an active session
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
