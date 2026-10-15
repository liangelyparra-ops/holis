import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Video, Image as ImageIcon, ExternalLink, Film, Layers, Tag, Box, Palette, Globe } from 'lucide-react';
import type { MultimediaItem, MediaAsset } from '../../types/multimedia';
import { normalizeCategory, getItemAssets, getItemCategories, getCategoryDisplay, getCategoryIconName } from '../../types/multimedia';

export function getBentoSpanClasses(format?: string): string {
  switch (format) {
    case '16:9':
    case '16:10':
      return 'sm:col-span-2 sm:row-span-1';
    case '9:16':
    case '4:5':
      return 'sm:col-span-1 sm:row-span-2';
    case '1:1':
    default:
      return 'sm:col-span-1 sm:row-span-1';
  }
}

interface MultimediaCardProps {
  item: MultimediaItem;
  onClick: () => void;
  index: number;
  isBento?: boolean;
  className?: string;
}

export const MultimediaCard: React.FC<MultimediaCardProps> = ({
  item,
  onClick,
  index,
  isBento = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const assets = getItemAssets(item);
  const primaryAsset: MediaAsset = assets[0] || {
    id: 'fallback',
    url: '',
    mediaType: 'image',
    format: '16:9',
  };
  const isVideo = primaryAsset.mediaType === 'video' || primaryAsset.mediaType === 'drive_video' || primaryAsset.mediaType === 'embed';

  // Automatically play video on hover, pause when hover ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Handled browser policies gracefully
        });
      }
    } else {
      video.pause();
    }
  }, [isHovered]);

  const itemCategories = getItemCategories(item);

  const getCategoryMeta = (cat: string) => {
    const { key, label } = getCategoryDisplay(cat);
    const iconName = getCategoryIconName(cat);

    let icon = Tag;
    if (iconName === 'film') icon = Film;
    else if (iconName === 'sparkles') icon = Sparkles;
    else if (iconName === 'image') icon = ImageIcon;
    else if (iconName === 'box') icon = Box;
    else if (iconName === 'palette') icon = Palette;
    else if (iconName === 'globe') icon = Globe;

    // Solo el chip de IA lleva color
    const isIA = iconName === 'sparkles';
    const color = isIA
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
      : 'bg-white/90 text-stone-700 border-stone-200/90 shadow-2xs';

    const iconColor = isIA ? 'text-emerald-600' : 'text-stone-500';

    return { label, icon, color, iconColor };
  };

  // Format aspect ratio class based on primary asset format
  const getAspectRatioClass = () => {
    switch (primaryAsset.format) {
      case '9:16':
        return 'aspect-[9/16] max-h-[520px]';
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '4:5':
        return 'aspect-[4/5]';
      default:
        return 'aspect-[16/10]';
    }
  };

  const bentoSpan = isBento ? getBentoSpanClasses(primaryAsset.format) : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 hover:border-neutral-900/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
        isBento ? 'h-full' : ''
      } ${bentoSpan} ${className}`}
    >
      {/* Media Preview Container */}
      <div
        className={`relative w-full ${
          isBento
            ? `${getAspectRatioClass()} sm:aspect-auto sm:flex-1 sm:min-h-0`
            : getAspectRatioClass()
        } bg-neutral-900 overflow-hidden`}
      >
        {primaryAsset.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={primaryAsset.url}
            poster={primaryAsset.thumbnailUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : primaryAsset.mediaType === 'drive_video' ? (
          <div className="w-full h-full relative">
            {primaryAsset.thumbnailUrl ? (
              <img
                src={primaryAsset.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 text-neutral-950 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ) : primaryAsset.mediaType === 'embed' ? (
          <div className="w-full h-full relative">
            {primaryAsset.thumbnailUrl ? (
              <img
                src={primaryAsset.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white/60">
                <Film className="w-10 h-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/90 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={primaryAsset.url}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              if (primaryAsset.thumbnailUrl && primaryAsset.thumbnailUrl !== primaryAsset.url) {
                (e.target as HTMLImageElement).src = primaryAsset.thumbnailUrl;
              }
            }}
          />
        )}

        {/* Top Badges Overlay - only visible on hover */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[75%]">
            {itemCategories.map((catKey) => {
              const meta = getCategoryMeta(catKey);
              const CatIcon = meta.icon;
              return (
                <span
                  key={catKey}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs backdrop-blur-md ${meta.color}`}
                >
                  <CatIcon className={`w-3 h-3 ${meta.iconColor}`} />
                  {meta.label}
                </span>
              );
            })}
          </div>

          {assets.length > 1 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-950/80 text-white backdrop-blur-md border border-white/10 shadow-2xs">
              <Layers className="w-3 h-3 text-neutral-300" />
              {assets.length}
            </span>
          )}
        </div>

        {/* Play Icon Indicator overlay for direct video - fades out while playing on hover */}
        {isVideo && primaryAsset.mediaType === 'video' && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${isHovered ? 'opacity-0 scale-90' : 'opacity-90 scale-100'}`}>
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-neutral-950 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

      </div>

      {/* Card Content - Compact Glass Title Bar */}
      <div className="px-3 py-1.5 sm:px-3 sm:py-2 bg-white/85 backdrop-blur-md flex items-center justify-between gap-2 border-t border-stone-200/60 shrink-0">
        <div className="min-w-0 flex-1">
          <h3 className="font-headline text-[10px] sm:text-[11px] font-semibold text-neutral-800 group-hover:text-black tracking-tight leading-tight truncate">
            {item.title}
          </h3>
        </div>
        <div className="shrink-0 flex items-center text-stone-400 group-hover:text-neutral-900 transition-colors">
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </motion.article>
  );
};
