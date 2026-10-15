import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { MultimediaItem } from '../types/multimedia';
import { multimediaInitialItems } from '../data/multimediaInitialItems';
import type { MultimediaPageContent } from '../types/multimediaContent';
import { defaultMultimediaPageContent } from '../types/multimediaContent';

const MULTIMEDIA_DOC_PATH = 'multimedia_gallery_live';
const CONTENT_DOC_PATH = 'multimedia_page_content_live';

/**
 * Sanitizes an object before sending to Firestore.
 * Firestore throws a fatal error if any field is `undefined`.
 * This recursive function converts `undefined` to `null`, ensuring setDoc always succeeds.
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (value === undefined ? null : value))
  );
}

/**
 * Subscribes to real-time gallery items from Firestore.
 * Firestore is the single source of truth across all devices.
 */
export function subscribeToMultimediaItems(
  onUpdate: (items: MultimediaItem[]) => void,
  onLoadingChange?: (loading: boolean) => void
): () => void {
  onLoadingChange?.(true);

  const liveDocRef = doc(db, 'games', MULTIMEDIA_DOC_PATH);

  // 1. Immediate fetch from Firestore on mount
  getDoc(liveDocRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          onUpdate(data.items as MultimediaItem[]);
        } else {
          onUpdate(multimediaInitialItems);
        }
      } else {
        // No doc exists in Firestore yet — use initial defaults
        onUpdate(multimediaInitialItems);
      }
      onLoadingChange?.(false);
    })
    .catch((err) => {
      console.warn('[Gallery] getDoc failed:', err.message);
      onUpdate(multimediaInitialItems);
      onLoadingChange?.(false);
    });

  // 2. Realtime listener for cross-device sync
  const unsubscribe = onSnapshot(
    liveDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          onUpdate(data.items as MultimediaItem[]);
        }
      }
      onLoadingChange?.(false);
    },
    (error) => {
      console.warn('[Gallery] onSnapshot error:', error.message);
      onLoadingChange?.(false);
    }
  );

  return unsubscribe;
}

/**
 * Saves gallery items to Firestore.
 * Sanitizes data to prevent undefined field crashes.
 * Returns true if the save succeeded.
 */
export async function saveMultimediaItemsLive(items: MultimediaItem[]): Promise<boolean> {
  try {
    const liveDocRef = doc(db, 'games', MULTIMEDIA_DOC_PATH);
    const payload = sanitizeForFirestore({
      items,
      updatedAt: Date.now(),
    });
    await setDoc(liveDocRef, payload);
    console.log('[Gallery] Successfully saved to Firestore cloud:', items.length, 'items');
    return true;
  } catch (err) {
    console.error('[Gallery] Firestore save error:', err);
    return false;
  }
}

/**
 * Subscribes to page content from Firestore.
 */
export function subscribeToMultimediaPageContent(
  onUpdate: (content: MultimediaPageContent) => void,
  onLoadingChange?: (loading: boolean) => void
): () => void {
  onLoadingChange?.(true);
  const docRef = doc(db, 'games', CONTENT_DOC_PATH);

  // Immediate fetch
  getDoc(docRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.content) {
          onUpdate({ ...defaultMultimediaPageContent, ...data.content });
        } else {
          onUpdate(defaultMultimediaPageContent);
        }
      } else {
        onUpdate(defaultMultimediaPageContent);
      }
      onLoadingChange?.(false);
    })
    .catch((err) => {
      console.warn('[Content] getDoc failed:', err.message);
      onUpdate(defaultMultimediaPageContent);
      onLoadingChange?.(false);
    });

  // Realtime listener
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.content) {
          onUpdate({ ...defaultMultimediaPageContent, ...data.content });
        }
      }
      onLoadingChange?.(false);
    },
    (error) => {
      console.warn('[Content] onSnapshot error:', error.message);
      onLoadingChange?.(false);
    }
  );

  return unsubscribe;
}

/**
 * Saves page content to Firestore.
 * Sanitizes data to prevent undefined field crashes.
 * Returns true if the save succeeded.
 */
export async function saveMultimediaPageContentLive(content: MultimediaPageContent): Promise<boolean> {
  try {
    const docRef = doc(db, 'games', CONTENT_DOC_PATH);
    const payload = sanitizeForFirestore({
      content,
      updatedAt: Date.now(),
    });
    await setDoc(docRef, payload);
    console.log('[Content] Successfully saved page content to Firestore cloud');
    return true;
  } catch (err) {
    console.error('[Content] Firestore save error:', err);
    return false;
  }
}
