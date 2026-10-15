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
  Tag,
  Box,
  Palette,
  Globe,
  Play,
  Pause,
} from 'lucide-react';
import type { MultimediaItem, MediaAsset } from '../../types/multimedia';
import { normalizeCategory, getItemAssets, getItemCategories, getCategoryDisplay, getCategoryIconName } from '../../types/multimedia';

interface MultimediaModalProps {
  item: MultimediaItem | null;
  onClose: () => void;
}

// Dedicated Video Component with Auto-play on Open, minimal hover controls and clean transparent background
const ModalVideoPlayer: React.FC<{
  asset: MediaAsset;
  index?: number;
  autoPlayInitial?: boolean;
}> = ({ asset }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-play on mount / open
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset progress
    setProgress(0);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy: retry muted if needed
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  }, [asset.url]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const targetTime = clickPos * videoRef.current.duration;
    if (Number.isFinite(targetTime)) {
      videoRef.current.currentTime = targetTime;
      setProgress(clickPos * 100);
    }
  };

  return (
    <div
      onClick={togglePlay}
      className="relative w-fit max-w-full mx-auto rounded-2xl overflow-hidden group/player flex items-center justify-center cursor-pointer select-none"
    >
      <video
        ref={videoRef}
        src={asset.url}
        poster={asset.thumbnailUrl}
        muted={isMuted}
        loop
        playsInline
        preload="auto"
        className="max-w-full max-h-[72vh] w-auto h-auto object-contain block rounded-2xl"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Center Subtle Play/Pause Indicator on hover when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
          <div className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center shadow-lg border border-white/20">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      )}

      {/* Floating Audio Toggle - Minimal pill at top-right (visible on hover or always subtle) */}
      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto z-20 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
          className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow-md"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Minimal Bottom Controls Overlay (visible on hover) */}
      <div
        className="absolute inset-x-0 bottom-0 p-3 pt-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col gap-2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clickable Progress Bar */}
        <div
          onClick={handleSeek}
          className="w-full h-1.5 hover:h-2 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer relative overflow-hidden transition-all"
        >
          <div
            className="h-full bg-white rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Minimal Control Bar */}
        <div className="flex items-center justify-between text-white/90 text-xs px-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-white text-white/80 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              className="p-1 hover:text-white text-white/80 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>
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

  const isClickScrollingRef = useRef(false);
  const clickScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (assets.length <= 1) return;
    if (isClickScrollingRef.current) return;
    const container = e.currentTarget;
    const containerTop = container.scrollTop;
    
    // Find which asset is currently in view
    let currentIdx = 0;
    for (let i = 0; i < assets.length; i++) {
      const el = document.getElementById(`modal-asset-${i}`);
      if (el) {
        const top = el.offsetTop - container.offsetTop;
        if (containerTop >= top - 120) {
          currentIdx = i;
        }
      }
    }
    setActiveAssetIndex(currentIdx);
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
    isClickScrollingRef.current = true;
    if (clickScrollTimeoutRef.current) clearTimeout(clickScrollTimeoutRef.current);
    clickScrollTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 800);

    const target = document.getElementById(`modal-asset-${index}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden"
        onClick={onClose}
      >
        {/* Backdrop with Deep Glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-2xl"
        />

        {/* Modal Window: Integrated, more compact, adapting to content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-neutral-950/90 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.85)] border border-white/15 z-10 text-white"
        >
          {/* Subtle Glass Highlights */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />

          {/* Modal Header: Category Badges & Close Button */}
          <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/10 bg-white/[0.02] backdrop-blur-md shrink-0 z-20">
            <div className="flex flex-wrap items-center gap-2">
              {getItemCategories(item).map((catKey) => {
                const { label } = getCategoryDisplay(catKey);
                const iconName = getCategoryIconName(catKey);

                let CatIcon = Tag;
                if (iconName === 'film') CatIcon = Film;
                else if (iconName === 'sparkles') CatIcon = Sparkles;
                else if (iconName === 'image') CatIcon = ImageIcon;
                else if (iconName === 'box') CatIcon = Box;
                else if (iconName === 'palette') CatIcon = Palette;
                else if (iconName === 'globe') CatIcon = Globe;

                const isIA = iconName === 'sparkles';
                const badgeClass = isIA
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-xs'
                  : 'bg-white/10 text-stone-200 border-white/15';

                const iconColor = isIA ? 'text-emerald-300' : 'text-stone-400';

                return (
                  <span
                    key={catKey}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${badgeClass}`}
                  >
                    <CatIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                    {label}
                  </span>
                );
              })}
            </div>

            <button
              onClick={onClose}
              type="button"
              aria-label="Cerrar modal"
              className="shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 shadow-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Multi-Asset Quick Jump Tabs (if multiple assets exist) */}
          {assets.length > 1 && (
            <div className="px-6 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center gap-6 overflow-x-auto scrollbar-none shrink-0 z-20 h-11">
              {assets.map((asset, idx) => {
                const isActive = activeAssetIndex === idx;
                return (
                  <button
                    key={asset.id || idx}
                    type="button"
                    onClick={() => scrollToAsset(idx)}
                    className={`h-full flex items-center text-xs sm:text-sm font-sans tracking-tight transition-all shrink-0 cursor-pointer border-b-2 relative ${
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

          {/* Integrated Scrollable Body */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-7 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40 text-left"
          >
            {/* Media Area (adjusts nicely to media size) */}
            <div className="space-y-6">
              {assets.map((asset, idx) => {
                const isAssetVideo = asset.mediaType === 'video';
                const isAssetDriveVideo = asset.mediaType === 'drive_video';
                const isAssetEmbed = asset.mediaType === 'embed';

                return (
                  <div
                    key={asset.id || idx}
                    id={`modal-asset-${idx}`}
                    className="space-y-3 transition-all scroll-mt-6"
                  >
                    <div className="w-full flex items-center justify-center">
                      {isAssetDriveVideo ? (
                        <div className="relative w-full max-w-full mx-auto rounded-2xl overflow-hidden group/drive flex items-center justify-center bg-black/90 border border-white/10">
                          <div className="w-full aspect-video max-h-[60vh] relative rounded-2xl overflow-hidden">
                            <iframe
                              src={asset.url.includes('?') ? `${asset.url}&autoplay=1` : `${asset.url}?autoplay=1`}
                              title={asset.title || item.title}
                              allow="autoplay; fullscreen"
                              allowFullScreen
                              className="w-full h-full border-0 rounded-2xl"
                            />
                            {/* Blocker overlay for Google Drive top-right pop-out (open in new tab) button */}
                            <div
                              className="absolute top-0 right-0 w-24 h-14 z-30 pointer-events-auto bg-transparent cursor-default"
                              title="Reproductor de video"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            />
                          </div>
                        </div>
                      ) : isAssetEmbed ? (
                        <div className="relative w-full max-w-full mx-auto rounded-2xl overflow-hidden flex items-center justify-center bg-black/90 border border-white/10">
                          <div className="w-full aspect-video max-h-[60vh] relative rounded-2xl overflow-hidden">
                            <iframe
                              src={asset.url}
                              title={asset.title || item.title}
                              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0 rounded-2xl"
                            />
                          </div>
                        </div>
                      ) : isAssetVideo ? (
                        <ModalVideoPlayer asset={asset} index={idx} autoPlayInitial={idx === 0} />
                      ) : (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                          <img
                            src={asset.url}
                            alt={asset.title || item.title}
                            loading="lazy"
                            className="w-full max-h-[60vh] object-contain transition-transform duration-500 hover:scale-[1.01]"
                            onError={(e) => {
                              if (asset.thumbnailUrl && asset.thumbnailUrl !== asset.url) {
                                (e.target as HTMLImageElement).src = asset.thumbnailUrl;
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Thin subtle divider between multiple assets */}
                    {assets.length > 1 && idx < assets.length - 1 && (
                      <div className="pt-6 border-b border-white/[0.08]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Integrated Details Section */}
            <div className="space-y-5 pt-2 border-t border-white/10">
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
