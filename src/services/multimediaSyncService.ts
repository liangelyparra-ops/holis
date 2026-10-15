import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
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
 * Subscribes to real-time updates from Firestore.
 * Load order:
 *  1. localStorage cache (immediate, ~0ms) so UI doesn't flash blank
 *  2. Firestore getDoc (fast first fetch, ~300-800ms) — overrides cache
 *  3. onSnapshot realtime listener (live updates from any device)
 * This ensures Firestore is ALWAYS the source of truth.
 */
export function subscribeToMultimediaItems(
  onUpdate: (items: MultimediaItem[]) => void,
  onLoadingChange?: (loading: boolean) => void
): () => void {
  onLoadingChange?.(true);

  // 1. Show cached data immediately to avoid blank flash
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed);
      }
    }
  } catch {
    // Ignore parse errors
  }

  const liveDocRef = doc(db, 'games', MULTIMEDIA_DOC_PATH);

  // 2. Fetch from Firestore immediately on mount (not waiting for snapshot)
  getDoc(liveDocRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.items));
          } catch {
            // Ignore storage errors
          }
          onUpdate(data.items);
        }
      } else {
        // No Firestore doc yet — seed it with initial items so it persists
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!cached) {
          onUpdate(multimediaInitialItems);
        }
      }
      onLoadingChange?.(false);
    })
    .catch((err) => {
      console.warn('Firestore initial fetch failed, falling back to cache/defaults:', err.message);
      // If Firestore is unreachable, use cache or defaults
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!cached) {
        onUpdate(multimediaInitialItems);
      }
      onLoadingChange?.(false);
    });

  // 3. Realtime listener for live cross-device sync
  try {
    const unsubscribe = onSnapshot(
      liveDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.items));
            } catch {
              // Ignore storage errors
            }
            onUpdate(data.items);
          }
        }
        onLoadingChange?.(false);
      },
      (error) => {
        console.warn('Firestore realtime listener error:', error.message);
        onLoadingChange?.(false);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach Firestore listener:', err);
    return () => {};
  }
}

/**
 * Saves updated items to Firestore (source of truth) AND localStorage (speed cache).
 * Returns true if cloud save succeeded.
 */
export async function saveMultimediaItemsLive(items: MultimediaItem[]): Promise<boolean> {
  // Immediate local cache for fast reload
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore
  }

  // Cloud save — this is the real persistence
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
 * Subscribes to page text/content updates from Firestore.
 * Same load order: cache → getDoc → onSnapshot
 */
export function subscribeToMultimediaPageContent(
  onUpdate: (content: MultimediaPageContent) => void
): () => void {
  // 1. Immediate cache load
  try {
    const cached = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        onUpdate({ ...defaultMultimediaPageContent, ...parsed });
      }
    }
  } catch {
    // Ignore
  }

  const docRef = doc(db, 'games', CONTENT_DOC_PATH);

  // 2. Immediate Firestore fetch
  getDoc(docRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.content) {
          try {
            localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data.content));
          } catch {
            // Ignore
          }
          onUpdate({ ...defaultMultimediaPageContent, ...data.content });
        }
      }
    })
    .catch((err) => {
      console.warn('Firestore content initial fetch failed:', err.message);
    });

  // 3. Realtime listener
  try {
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.content) {
            try {
              localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data.content));
            } catch {
              // Ignore
            }
            onUpdate({ ...defaultMultimediaPageContent, ...data.content });
          }
        }
      },
      (error) => {
        console.warn('Firestore content listener error:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach content listener:', err);
    return () => {};
  }
}

/**
 * Saves page content to Firestore (source of truth) AND localStorage (speed cache).
 */
export async function saveMultimediaPageContentLive(content: MultimediaPageContent): Promise<boolean> {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
  } catch {
    // Ignore
  }

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
