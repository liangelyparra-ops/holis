export type MultimediaCategory = 
  | 'TODOS'
  | 'MOTION'
  | 'IA'
  | 'KEY_VISUALS';

export type LegacyCategory = 
  | 'MOTION_VIDEO'
  | 'AI_GENERATIVO'
  | 'KEY_VISUAL_PAID'
  | 'THREED_CONCEPT'
  | 'SOCIAL_HOOKS';

export type AnyCategory = Exclude<MultimediaCategory, 'TODOS'> | LegacyCategory;

export type MediaFormat = '9:16' | '1:1' | '16:9' | '4:5' | 'auto';

export type MediaType = 'video' | 'image' | 'drive_video' | 'drive_image' | 'embed';

export interface MediaAsset {
  id: string;
  url: string;
  rawUrl?: string;
  mediaType: MediaType;
  format: MediaFormat;
  title?: string;
  thumbnailUrl?: string;
  driveFileId?: string;
}

export interface MultimediaItem {
  id: string;
  title: string;
  category: AnyCategory;
  tools: string[];
  description: string;
  hookRationale?: string;
  featured?: boolean;
  hidden?: boolean;
  createdAt: number;
  assets?: MediaAsset[];

  // Legacy single asset fields for backward compatibility
  mediaType?: MediaType;
  url?: string;
  rawUrl?: string;
  driveFileId?: string;
  thumbnailUrl?: string;
  format?: MediaFormat;
}

export function normalizeCategory(cat: string): 'MOTION' | 'IA' | 'KEY_VISUALS' {
  if (cat === 'MOTION' || cat === 'MOTION_VIDEO' || cat === 'SOCIAL_HOOKS') return 'MOTION';
  if (cat === 'IA' || cat === 'AI_GENERATIVO') return 'IA';
  return 'KEY_VISUALS';
}

export function getItemAssets(item: MultimediaItem): MediaAsset[] {
  if (item.assets && item.assets.length > 0) {
    return item.assets;
  }
  return [
    {
      id: `${item.id}-asset-0`,
      url: item.url || '',
      rawUrl: item.rawUrl || item.url || '',
      mediaType: item.mediaType || 'image',
      format: item.format || '16:9',
      thumbnailUrl: item.thumbnailUrl,
      driveFileId: item.driveFileId,
    },
  ];
}
