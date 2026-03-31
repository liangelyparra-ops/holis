import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Anonymous sign-in for all users (no authentication needed)
export const loginAnonymously = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log('Signed in anonymously');
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  }
};
