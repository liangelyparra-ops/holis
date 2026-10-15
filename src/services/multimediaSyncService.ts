import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { MultimediaItem } from '../types/multimedia';
import { multimediaInitialItems } from '../data/multimediaInitialItems';
import type { MultimediaPageContent } from '../types/multimediaContent';
import { defaultMultimediaPageContent } from '../types/multimediaContent';

const MULTIMEDIA_DOC_PATH = 'multimedia_gallery_live';
const LOCAL_STORAGE_KEY = 'multimedia_portfolio_items_v2';

const CONTENT_DOC_PATH = 'multimedia_page_content_live';
const CONTENT_STORAGE_KEY = 'multimedia_page_content_v1';

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

/**
 * Subscribes to page texts, titles, and section ordering updates
 */
export function subscribeToMultimediaPageContent(
  onUpdate: (content: MultimediaPageContent) => void
): () => void {
  // 1. Immediate local cache load
  try {
    const cached = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        onUpdate({ ...defaultMultimediaPageContent, ...parsed });
      } else {
        onUpdate(defaultMultimediaPageContent);
      }
    } else {
      onUpdate(defaultMultimediaPageContent);
    }
  } catch (e) {
    onUpdate(defaultMultimediaPageContent);
  }

  // 2. Realtime listener to Firestore
  try {
    const docRef = doc(db, 'games', CONTENT_DOC_PATH);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.content) {
            try {
              localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data.content));
            } catch (err) {
              // Ignore
            }
            onUpdate({ ...defaultMultimediaPageContent, ...data.content });
          }
        }
      },
      (error) => {
        console.warn('Firestore content listener warning:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach content listener:', err);
    return () => {};
  }
}

/**
 * Saves updated page texts and section ordering to both Firestore and localStorage
 */
export async function saveMultimediaPageContentLive(content: MultimediaPageContent): Promise<boolean> {
  // Immediate local cache
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
  } catch (e) {
    console.warn('LocalStorage save content warning:', e);
  }

  // Live Firestore sync
  try {
    const docRef = doc(db, 'games', CONTENT_DOC_PATH);
    await setDoc(docRef, {
      content,
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('Firestore content sync error:', err);
    return false;
  }
}
