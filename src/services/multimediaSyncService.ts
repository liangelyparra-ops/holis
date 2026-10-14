import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { MultimediaItem } from '../types/multimedia';
import { multimediaInitialItems } from '../data/multimediaInitialItems';

const MULTIMEDIA_DOC_PATH = 'multimedia_gallery_live';
const LOCAL_STORAGE_KEY = 'multimedia_portfolio_items_v2';

/**
 * Subscribes to real-time updates from Firestore so any change made on any device
 * updates instantly on the live website.
 */
export function subscribeToMultimediaItems(
  onUpdate: (items: MultimediaItem[]) => void
): () => void {
  // 1. Initial immediate load from local storage or defaults
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed);
      }
    } else {
      onUpdate(multimediaInitialItems);
    }
  } catch (e) {
    onUpdate(multimediaInitialItems);
  }

  // 2. Realtime listener to Firestore
  try {
    const liveDocRef = doc(db, 'games', MULTIMEDIA_DOC_PATH);
    const unsubscribe = onSnapshot(
      liveDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.items));
            } catch (err) {
              // Ignore storage errors
            }
            onUpdate(data.items);
          }
        }
      },
      (error) => {
        console.warn('Firestore live listener notice (falling back to cache):', error.message);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach Firestore listener:', err);
    return () => {};
  }
}

/**
 * Saves updated items to both Firestore (for live worldwide sync) and localStorage (for offline/fast cache)
 */
export async function saveMultimediaItemsLive(items: MultimediaItem[]): Promise<boolean> {
  // Immediate local cache
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }

  // Live Cloud sync
  try {
    const liveDocRef = doc(db, 'games', MULTIMEDIA_DOC_PATH);
    await setDoc(liveDocRef, {
      items,
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('Firestore cloud sync error:', err);
    return false;
  }
}
