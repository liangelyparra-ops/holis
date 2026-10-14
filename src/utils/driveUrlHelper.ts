import type { MediaType } from '../types/multimedia';

export interface ParsedMediaUrl {
  rawUrl: string;
  url: string;
  thumbnailUrl?: string;
  mediaType: MediaType;
  isDrive: boolean;
  driveFileId?: string;
  isEmbed: boolean;
}

/**
 * Extracts a Google Drive file ID from various formats of Google Drive links
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Pattern 1: /file/d/{id}/...
  const matchFileD = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Pattern 2: id={id} query param
  const matchIdParam = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: /folders/{id} or /d/{id}
  const matchD = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) return matchD[1];

  return null;
}

/**
 * Parses any incoming media URL (Drive, YouTube, Vimeo, direct MP4/JPG, etc.)
 * and prepares optimal embed or direct streaming URLs.
 */
export function parseMediaUrl(inputUrl: string, preferredType?: 'video' | 'image'): ParsedMediaUrl {
  const rawUrl = (inputUrl || '').trim();
  if (!rawUrl) {
    return {
      rawUrl: '',
      url: '',
      mediaType: 'image',
      isDrive: false,
      isEmbed: false,
    };
  }

  // 1. Google Drive Link
  const driveId = extractDriveFileId(rawUrl);
  if (driveId) {
    // If the user specified preferredType as 'video' or if URL hints at video
    const isVideoHint = preferredType === 'video' || /\.(mp4|mov|webm|m4v)/i.test(rawUrl);
    
    if (isVideoHint) {
      return {
        rawUrl,
        url: `https://drive.google.com/file/d/${driveId}/preview`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`,
        mediaType: 'drive_video',
        isDrive: true,
        driveFileId: driveId,
        isEmbed: true,
      };
    } else {
      // Default to image if preferredType is 'image' or not specified
      return {
        rawUrl,
        url: `https://lh3.googleusercontent.com/d/${driveId}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`,
        mediaType: 'drive_image',
        isDrive: true,
        driveFileId: driveId,
        isEmbed: false,
      };
    }
  }

  // 2. YouTube
  const youtubeMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    const ytId = youtubeMatch[1];
    return {
      rawUrl,
      url: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      mediaType: 'embed',
      isDrive: false,
      isEmbed: true,
    };
  }

  // 3. Vimeo
  const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      rawUrl,
      url: `https://player.vimeo.com/video/${vimeoId}?dnt=1&app_id=122963`,
      mediaType: 'embed',
      isDrive: false,
      isEmbed: true,
    };
  }

  // 4. Direct video files
  if (/\.(mp4|webm|ogg|m4v)(\?.*)?$/i.test(rawUrl)) {
    return {
      rawUrl,
      url: rawUrl,
      mediaType: 'video',
      isDrive: false,
      isEmbed: false,
    };
  }

  // 5. Default: treat as image URL
  return {
    rawUrl,
    url: rawUrl,
    thumbnailUrl: rawUrl,
    mediaType: preferredType === 'video' ? 'video' : 'image',
    isDrive: false,
    isEmbed: false,
  };
}
