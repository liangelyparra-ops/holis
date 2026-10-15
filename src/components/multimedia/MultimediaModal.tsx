import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Film,
  Image as ImageIcon,
  Layers,
  Video,
  Volume2,
  VolumeX,
  ChevronDown,
} from 'lucide-react';
import type { MultimediaItem, MediaAsset } from '../../types/multimedia';
import { normalizeCategory, getItemAssets, getItemCategories, getCategoryDisplay } from '../../types/multimedia';

interface MultimediaModalProps {
  item: MultimediaItem | null;
  onClose: () => void;
}

// Dedicated Video Component with Auto-play on Hover and Audio Toggle
const ModalVideoPlayer: React.FC<{
  asset: MediaAsset;
  index?: number;
  autoPlayInitial?: boolean;
}> = ({ asset, index = 0, autoPlayInitial = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Ignored browser restriction
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isHovered]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 group/player flex items-center justify-center"
    >
      <video
        ref={videoRef}
        src={asset.url}
        poster={asset.thumbnailUrl}
        muted={isMuted}
        loop
        playsInline
        preload="auto"
        controls
        className="w-full max-h-[68vh] object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Hover & Audio Status Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto z-20">
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
          className="px-2.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-mono flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? 'Mudo' : 'Audio On'}</span>
        </button>
      </div>

      {/* Subtitle / Hover hint overlay */}
      {!isPlaying && (
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-sans text-stone-300 pointer-events-none transition-opacity duration-300 opacity-80 group-hover/player:opacity-0">
          Pasa el cursor para reproducir automáticamente
        </div>
      )}
    </div>
  );
};

export const MultimediaModal: React.FC<MultimediaModalProps> = ({ item, onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  const assets = item ? getItemAssets(item) : [];

  useEffect(() => {
    setActiveAssetIndex(0);
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (assets.length <= 1) return;
    const container = e.currentTarget;
    const containerTop = container.scrollTop;
    
    // Find which asset is currently at top
    for (let i = 0; i < assets.length; i++) {
      const el = document.getElementById(`modal-asset-${i}`);
      if (el) {
        const top = el.offsetTop - container.offsetTop;
        if (containerTop >= top - 80) {
          setActiveAssetIndex(i);
        }
      }
    }
  };

  if (!item || assets.length === 0) return null;

  const normalized = normalizeCategory(item.category);
  const categoryLabels: Record<string, { label: string; icon: any }> = {
    MOTION: { label: 'Motion', icon: Film },
    IA: { label: 'IA', icon: Sparkles },
    KEY_VISUALS: { label: 'Key Visuals', icon: ImageIcon },
  };
  const currentCat = categoryLabels[normalized] || { label: normalized, icon: Sparkles };
  const CategoryIcon = currentCat.icon;

  const handleCopyLink = () => {
    const shareUrl = item.rawUrl || item.url || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToAsset = (index: number) => {
    setActiveAssetIndex(index);
    const target = document.getElementById(`modal-asset-${index}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop with Deep Glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-2xl"
        />

        {/* Modal Window: Extra Large & High-End Glass Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-[96vw] max-w-[1420px] h-[92vh] max-h-[94vh] flex flex-col lg:flex-row bg-neutral-950/85 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] border border-white/20 z-10 text-white"
        >
          {/* Subtle Glass Highlights */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Area (Left/Main - Scrollable when multi-asset) */}
          <div className="lg:w-8/12 flex-1 bg-black/40 flex flex-col overflow-hidden relative border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Multi-Asset Top Quick Jump Navigation Bar - Slim Text Tabs */}
            {assets.length > 1 && (
              <div className="px-5 bg-black/60 backdrop-blur-xl border-b border-white/10 flex items-center gap-6 overflow-x-auto scrollbar-none shrink-0 z-20 h-10">
                {assets.map((asset, idx) => {
                  const isActive = activeAssetIndex === idx;
                  return (
                    <button
                      key={asset.id || idx}
                      type="button"
                      onClick={() => scrollToAsset(idx)}
                      className={`h-full flex items-center text-xs font-sans transition-all shrink-0 cursor-pointer border-b-2 relative ${
                        isActive
                          ? 'text-white font-semibold border-white'
                          : 'text-stone-400 font-normal hover:text-stone-200 border-transparent'
                      }`}
                    >
                      {asset.title || asset.format}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Scrollable Media Feed */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-10 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40"
            >
              {assets.map((asset, idx) => {
                const isAssetVideo = asset.mediaType === 'video';
                const isAssetDriveVideo = asset.mediaType === 'drive_video';
                const isAssetEmbed = asset.mediaType === 'embed';

                return (
                  <div
                    key={asset.id || idx}
                    id={`modal-asset-${idx}`}
                    className="space-y-4 transition-all scroll-mt-6"
                  >
                    {/* Header info for this asset if multi-asset */}
                    {assets.length > 1 && asset.title && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-white/90 font-sans text-xs sm:text-sm font-semibold truncate max-w-md">
                          {asset.title}
                        </span>
                      </div>
                    )}

                    {/* Media Item Display */}
                    <div className="w-full flex items-center justify-center">
                      {isAssetDriveVideo ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
                          <iframe
                            src={asset.url}
                            title={asset.title || item.title}
                            allow="autoplay; fullscreen"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : isAssetEmbed ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
                          <iframe
                            src={asset.url}
                            title={asset.title || item.title}
                            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : isAssetVideo ? (
                        <ModalVideoPlayer asset={asset} index={idx} autoPlayInitial={idx === 0} />
                      ) : (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
                          <img
                            src={asset.url}
                            alt={asset.title || item.title}
                            loading="lazy"
                            className="w-full max-h-[70vh] object-contain transition-transform duration-500 hover:scale-[1.02]"
                            onError={(e) => {
                              if (asset.thumbnailUrl && asset.thumbnailUrl !== asset.url) {
                                (e.target as HTMLImageElement).src = asset.thumbnailUrl;
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Thin subtle divider between assets */}
                    {assets.length > 1 && idx < assets.length - 1 && (
                      <div className="pt-8 border-b border-white/[0.08]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Column (Right Sidebar) */}
          <div className="lg:w-4/12 bg-white/[0.02] backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6 text-left">
            <div className="space-y-5">
              {/* Category Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {getItemCategories(item).map((catKey) => {
                  const { key, label } = getCategoryDisplay(catKey);
                  let CatIcon = Sparkles;
                  if (key === 'MOTION') CatIcon = Film;
                  else if (key === 'IA') CatIcon = Sparkles;
                  else if (key === 'KEY_VISUALS') CatIcon = ImageIcon;

                  return (
                    <span
                      key={catKey}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 backdrop-blur-md"
                    >
                      <CatIcon className="w-3.5 h-3.5 text-emerald-400" />
                      {label}
                    </span>
                  );
                })}
              </div>

              {/* Title */}
              <div>
                <h2 className="font-headline text-2xl sm:text-3xl font-light text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Concepto &amp; Proceso Creativo
                </p>
                <p className="font-sans text-sm sm:text-base text-stone-200 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Hook Rationale / Social Retención */}
              {item.hookRationale && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1 backdrop-blur-sm">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Hook &amp; Criterio de Retención
                  </p>
                  <p className="font-sans text-xs sm:text-sm text-amber-100 leading-relaxed">
                    {item.hookRationale}
                  </p>
                </div>
              )}

              {/* Tools List */}
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Herramientas &amp; Pipeline
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tools.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white/10 text-stone-200 border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
