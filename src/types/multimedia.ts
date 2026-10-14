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

export interface MultimediaItem {
  id: string;
  title: string;
  category: AnyCategory;
  mediaType: MediaType;
  url: string;
  rawUrl?: string;
  driveFileId?: string;
  thumbnailUrl?: string;
  format: MediaFormat;
  tools: string[];
  description: string;
  hookRationale?: string;
  featured?: boolean;
  createdAt: number;
}

export function normalizeCategory(cat: string): 'MOTION' | 'IA' | 'KEY_VISUALS' {
  if (cat === 'MOTION' || cat === 'MOTION_VIDEO' || cat === 'SOCIAL_HOOKS') return 'MOTION';
  if (cat === 'IA' || cat === 'AI_GENERATIVO') return 'IA';
  return 'KEY_VISUALS';
}
