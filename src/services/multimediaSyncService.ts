import type { MultimediaItem } from '../types/multimedia';
import { multimediaInitialItems } from '../data/multimediaInitialItems';
import type { MultimediaPageContent } from '../types/multimediaContent';
import { defaultMultimediaPageContent } from '../types/multimediaContent';

// ─── All persistence goes through the server-side API ─────────────────────────
// The Firebase client SDK cannot connect to Firestore reliably from the browser
// in the Cloud Run / AI Studio environment (WebSocket restrictions, CSP, etc.).
// Instead, we proxy all reads/writes through our own Express API endpoints,
// which use the Firestore REST API from the server side — no restrictions there.

const POLL_INTERVAL_MS = 5000; // Polling interval for cross-device sync

/**
 * Subscribes to real-time gallery items from the server API.
 * Load order:
 *  1. Immediate fetch from /api/gallery (fast, ~200ms)
 *  2. Poll every 5s for cross-device sync
 */
export function subscribeToMultimediaItems(
  onUpdate: (items: MultimediaItem[]) => void,
  onLoadingChange?: (loading: boolean) => void
): () => void {
  onLoadingChange?.(true);
  let cancelled = false;

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        onUpdate(data.items as MultimediaItem[]);
      } else if (data.items?.length === 0) {
        // Server returned empty — show defaults but don't override existing
        onUpdate(multimediaInitialItems);
      }
    } catch (err) {
      console.warn('[Gallery] fetch from /api/gallery failed:', err);
      // Fallback: show defaults so UI isn't blank
      onUpdate(multimediaInitialItems);
    } finally {
      onLoadingChange?.(false);
    }
  };

  // Initial fetch immediately
  fetchItems();

  // Poll for cross-device updates
  const intervalId = setInterval(() => {
    if (!cancelled) fetchItems();
  }, POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}

/**
 * Saves gallery items to Firestore via the server API.
 * Returns true if the save succeeded.
 */
export async function saveMultimediaItemsLive(items: MultimediaItem[]): Promise<boolean> {
  try {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Gallery] save failed:', err);
      return false;
    }
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error('[Gallery] save network error:', err);
    return false;
  }
}

/**
 * Subscribes to page content from the server API.
 */
export function subscribeToMultimediaPageContent(
  onUpdate: (content: MultimediaPageContent) => void
): () => void {
  let cancelled = false;

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/page-content');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.content && typeof data.content === 'object') {
        onUpdate({ ...defaultMultimediaPageContent, ...data.content });
      } else {
        onUpdate(defaultMultimediaPageContent);
      }
    } catch (err) {
      console.warn('[Content] fetch from /api/page-content failed:', err);
      onUpdate(defaultMultimediaPageContent);
    }
  };

  // Initial fetch immediately
  fetchContent();

  // Poll for cross-device updates
  const intervalId = setInterval(() => {
    if (!cancelled) fetchContent();
  }, POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}

/**
 * Saves page content to Firestore via the server API.
 * Returns true if the save succeeded.
 */
export async function saveMultimediaPageContentLive(content: MultimediaPageContent): Promise<boolean> {
  try {
    const res = await fetch('/api/page-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Content] save failed:', err);
      return false;
    }
    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error('[Content] save network error:', err);
    return false;
  }
}
