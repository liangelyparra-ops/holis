export type MultimediaCategory = 
  | 'TODOS'
  | 'MOTION_VIDEO'
  | 'AI_GENERATIVO'
  | 'KEY_VISUAL_PAID'
  | 'THREED_CONCEPT'
  | 'SOCIAL_HOOKS';

export type MediaFormat = '9:16' | '1:1' | '16:9' | '4:5' | 'auto';

export type MediaType = 'video' | 'image' | 'drive_video' | 'drive_image' | 'embed';

export interface MultimediaItem {
  id: string;
  title: string;
  category: Exclude<MultimediaCategory, 'TODOS'>;
  mediaType: MediaType;
  url: string; // Original URL or transformed preview URL
  rawUrl?: string; // Original link entered by user (e.g. Drive share link)
  driveFileId?: string;
  thumbnailUrl?: string;
  format: MediaFormat;
  tools: string[]; // e.g. ["After Effects", "Runway Gen-3", "Midjourney", "Photoshop"]
  description: string;
  hookRationale?: string;
  featured?: boolean;
  createdAt: number;
}
