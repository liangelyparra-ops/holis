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
  categories?: string[];
  tools: string[];
  description: string;
  hookRationale?: string;
  featured?: boolean;
  hidden?: boolean;
  createdAt: number;
  assets?: MediaAsset[];

  // Per-item layout configuration for multiple assets
  showTabs?: boolean;
  assetsLayout?: 'stacked' | 'grid-2' | 'grid-3' | 'grid-auto';
  assetsGap?: 'compact' | 'normal' | 'spacious';
  mediaFit?: 'contain' | 'cover';
  maxMediaHeight?: 'full' | 'medium' | 'compact';

  // Legacy single asset fields for backward compatibility
  mediaType?: MediaType;
  url?: string;
  rawUrl?: string;
  driveFileId?: string;
  thumbnailUrl?: string;
  format?: MediaFormat;
}

export function getItemCategories(item: MultimediaItem): string[] {
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    return item.categories;
  }
  return item.category ? [item.category] : ['MOTION'];
}

export function normalizeCategory(cat: string): string {
  if (cat === 'MOTION' || cat === 'MOTION_VIDEO' || cat === 'SOCIAL_HOOKS') return 'MOTION';
  if (cat === 'IA' || cat === 'AI_GENERATIVO') return 'IA';
  if (cat === 'KEY_VISUALS' || cat === 'KEY_VISUAL_PAID') return 'KEY_VISUALS';
  return cat;
}

export function getCategoryIconName(cat: string): 'film' | 'sparkles' | 'image' | 'box' | 'palette' | 'globe' | 'tag' {
  const norm = (cat || '').trim().toUpperCase();
  if (norm === 'IA' || norm === 'AI' || norm.includes('INTELIGENCIA') || norm.includes('GENERATIV')) {
    return 'sparkles';
  }
  if (norm === 'MOTION' || norm.includes('VIDEO') || norm.includes('REEL') || norm.includes('ANIMAT')) {
    return 'film';
  }
  if (norm === 'KEY_VISUALS' || norm.includes('PHOTO') || norm.includes('FOTO') || norm.includes('IMAGE') || norm.includes('POSTER')) {
    return 'image';
  }
  if (norm.includes('3D') || norm.includes('RENDER') || norm.includes('MODEL')) {
    return 'box';
  }
  if (norm.includes('BRAND') || norm.includes('DISEN') || norm.includes('DISEÑ') || norm.includes('LOGO') || norm.includes('IDENTI')) {
    return 'palette';
  }
  if (norm.includes('WEB') || norm.includes('UI') || norm.includes('UX') || norm.includes('APP') || norm.includes('SITE')) {
    return 'globe';
  }
  return 'tag';
}

export function getCategoryDisplay(cat: string): { key: string; label: string } {
  const raw = (cat || '').trim();
  if (raw === 'MOTION' || raw === 'MOTION_VIDEO' || raw === 'SOCIAL_HOOKS') {
    return { key: 'MOTION', label: 'Motion' };
  }
  if (raw === 'IA' || raw === 'AI_GENERATIVO') {
    return { key: 'IA', label: 'IA' };
  }
  if (raw === 'KEY_VISUALS' || raw === 'KEY_VISUAL_PAID') {
    return { key: 'KEY_VISUALS', label: 'Key Visuals' };
  }
  // Custom tag: format preserving original word casing
  const label = raw.includes('_')
    ? raw.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : raw.length <= 4
    ? raw.toUpperCase()
    : raw.charAt(0).toUpperCase() + raw.slice(1);

  return { key: raw, label };
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
