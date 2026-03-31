import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Sign in anonymously (no popup) so anyone with the link can join
export const loginAnonymously = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      // optional: console.log('Signed in anonymously', auth.currentUser?.uid);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  }
};
