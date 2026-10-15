import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { MultimediaItem } from '../types/multimedia';
import { multimediaInitialItems } from '../data/multimediaInitialItems';
import type { MultimediaPageContent } from '../types/multimediaContent';
import { defaultMultimediaPageContent } from '../types/multimediaContent';

const MULTIMEDIA_DOC_PATH = 'multimedia_gallery_live';
const CONTENT_DOC_PATH = 'multimedia_page_content_live';

/**
 * Subscribes to real-time gallery items from Firestore.
 * Load order:
 *  1. getDoc (immediate first fetch ~300ms) — Firestore is source of truth
 *  2. onSnapshot (realtime listener for cross-device sync)
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
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          onUpdate(data.items as MultimediaItem[]);
        }
      } else {
        // No doc yet — use defaults
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
        if (data && Array.isArray(data.items) && data.items.length > 0) {
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
 * Returns true if the save succeeded.
 */
export async function saveMultimediaItemsLive(items: MultimediaItem[]): Promise<boolean> {
  try {
    const liveDocRef = doc(db, 'games', MULTIMEDIA_DOC_PATH);
    await setDoc(liveDocRef, {
      items,
      updatedAt: Date.now(),
    });
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
  onUpdate: (content: MultimediaPageContent) => void
): () => void {
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
    })
    .catch((err) => {
      console.warn('[Content] getDoc failed:', err.message);
      onUpdate(defaultMultimediaPageContent);
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
    },
    (error) => {
      console.warn('[Content] onSnapshot error:', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Saves page content to Firestore.
 * Returns true if the save succeeded.
 */
export async function saveMultimediaPageContentLive(content: MultimediaPageContent): Promise<boolean> {
  try {
    const docRef = doc(db, 'games', CONTENT_DOC_PATH);
    await setDoc(docRef, {
      content,
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('[Content] Firestore save error:', err);
    return false;
  }
}
