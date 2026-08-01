import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { 
  onAuthStateChanged, 
  signInWithCredential, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { auth, db } from '../config/firebase';
import { AppUser } from '../types';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signInWithApple: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'placeholder',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch(console.error);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let appUser: AppUser;

        if (!userSnap.exists()) {
          // Registro nuevo usuario
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

  const signInWithGoogle = () => {
    promptAsync();
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
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // user canceled
      } else {
        console.error(e);
      }
    }
  };

  const signOut = async () => {
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
