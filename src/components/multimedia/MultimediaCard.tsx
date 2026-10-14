import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Video, Image as ImageIcon, ExternalLink, Film, Box } from 'lucide-react';
import type { MultimediaItem } from '../../types/multimedia';

interface MultimediaCardProps {
  item: MultimediaItem;
  onClick: () => void;
  index: number;
}

export const MultimediaCard: React.FC<MultimediaCardProps> = ({ item, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = item.mediaType === 'video' || item.mediaType === 'drive_video' || item.mediaType === 'embed';

  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    MOTION_VIDEO: { label: 'Motion & Video', icon: Film, color: 'bg-violet-50 text-violet-700 border-violet-200' },
    AI_GENERATIVO: { label: 'IA Generativa', icon: Sparkles, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    KEY_VISUAL_PAID: { label: 'Key Visual · Paid Ads', icon: ImageIcon, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    THREED_CONCEPT: { label: '3D & Motion', icon: Box, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    SOCIAL_HOOKS: { label: 'Social Hook (9:16)', icon: Video, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const currentCategory = categoryLabels[item.category] || {
    label: item.category,
    icon: Sparkles,
    color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  };

  const CategoryIcon = currentCategory.icon;

  // Format aspect ratio class
  const getAspectRatioClass = () => {
    switch (item.format) {
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 hover:border-neutral-900/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Media Preview Container */}
      <div className={`relative w-full ${getAspectRatioClass()} bg-neutral-900 overflow-hidden`}>
        {/* If it's a direct video with preview, we can show video or thumbnail */}
        {item.mediaType === 'video' ? (
          <video
            src={item.url}
            poster={item.thumbnailUrl}
            muted
            loop
            playsInline
            autoPlay={isHovered}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : item.mediaType === 'drive_video' ? (
          <div className="w-full h-full relative">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if drive thumbnail fails
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
        ) : item.mediaType === 'embed' ? (
          <div className="w-full h-full relative">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
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
          /* Image or Drive Image */
          <img
            src={item.url}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              if (item.thumbnailUrl && item.thumbnailUrl !== item.url) {
                (e.target as HTMLImageElement).src = item.thumbnailUrl;
              }
            }}
          />
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs backdrop-blur-md ${currentCategory.color}`}>
            <CategoryIcon className="w-3 h-3" />
            {currentCategory.label}
          </span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium tracking-wider bg-black/70 text-white/90 backdrop-blur-md border border-white/10">
            {item.format}
          </span>
        </div>

        {/* Play Icon Indicator overlay for videos */}
        {isVideo && item.mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Hover Click prompt banner */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between text-white text-xs">
          <span className="font-sans font-medium flex items-center gap-1">
            Ver detalle & workflow <ExternalLink className="w-3 h-3" />
          </span>
          {item.driveFileId && (
            <span className="font-mono text-[10px] text-white/75 bg-white/15 px-1.5 py-0.5 rounded">
              Google Drive
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 text-left">
        <div className="space-y-1.5">
          <h3 className="font-headline text-base sm:text-lg font-semibold text-neutral-900 group-hover:text-black tracking-tight leading-snug">
            {item.title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Rationale / Hook Callout */}
        {item.hookRationale && (
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] font-sans text-stone-700 leading-normal">
            <span className="font-semibold text-neutral-900 mr-1 font-mono uppercase tracking-wider text-[9px] block mb-0.5">
              Hook &amp; Impacto
            </span>
            {item.hookRationale}
          </div>
        )}

        {/* Tools Badges */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
          {item.tools.map((tool) => (
            <span
              key={tool}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium font-mono text-stone-600 bg-stone-100/90 border border-stone-200/60"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
};
