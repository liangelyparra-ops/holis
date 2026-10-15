import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Sparkles,
  Film,
  Image as ImageIcon,
  Share2,
  Check,
  Layers,
  Video,
  Volume2,
  VolumeX,
  ChevronDown,
} from 'lucide-react';
import type { MultimediaItem, MediaAsset } from '../../types/multimedia';
import { normalizeCategory, getItemAssets } from '../../types/multimedia';

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
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const assets = item ? getItemAssets(item) : [];

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
            {/* Multi-Asset Top Quick Jump Navigation Bar */}
            {assets.length > 1 && (
              <div className="px-5 py-3 bg-white/[0.04] backdrop-blur-xl border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
                <div className="flex items-center gap-2 text-white/90 text-xs font-mono font-medium">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Colección de {assets.length} archivos
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-white/50 text-[11px] font-sans">
                    · Haz scroll o clic en un chip para explorar
                    <ChevronDown className="w-3 h-3 text-white/60 animate-bounce" />
                  </span>
                </div>

                {/* Quick Asset Jump Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 scrollbar-none">
                  {assets.map((asset, idx) => (
                    <button
                      key={asset.id || idx}
                      type="button"
                      onClick={() => scrollToAsset(idx)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono border border-white/10 transition-colors shrink-0 cursor-pointer"
                    >
                      #{idx + 1} {asset.title ? `· ${asset.title.slice(0, 15)}...` : asset.format}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scrollable Media Feed */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40"
            >
              {assets.map((asset, idx) => {
                const isAssetVideo = asset.mediaType === 'video';
                const isAssetDriveVideo = asset.mediaType === 'drive_video';
                const isAssetEmbed = asset.mediaType === 'embed';

                return (
                  <div
                    key={asset.id || idx}
                    id={`modal-asset-${idx}`}
                    className="p-3 sm:p-5 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 space-y-4 transition-all scroll-mt-6"
                  >
                    {/* Header info for this asset if multi-asset */}
                    {assets.length > 1 && (
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/15 text-white text-[10px] font-mono font-bold">
                            ARCHIVO {idx + 1} DE {assets.length}
                          </span>
                          {asset.title && (
                            <span className="text-white/90 font-sans text-xs sm:text-sm font-semibold truncate max-w-md">
                              {asset.title}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-black/60 text-stone-300 text-[10px] font-mono border border-white/10">
                          Formato: {asset.format}
                        </span>
                      </div>
                    )}

                    {/* Media Item Display */}
                    <div className="w-full flex items-center justify-center">
                      {isAssetDriveVideo ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                          <iframe
                            src={asset.url}
                            title={asset.title || item.title}
                            allow="autoplay; fullscreen"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : isAssetEmbed ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
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
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Column (Right Sidebar) */}
          <div className="lg:w-4/12 bg-white/[0.02] backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6 text-left">
            <div className="space-y-5">
              {/* Category & Format Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 backdrop-blur-md">
                  <CategoryIcon className="w-3.5 h-3.5 text-emerald-400" />
                  {currentCat.label}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-black/70 text-stone-200 border border-white/10">
                  Formato: {item.format || 'Multiformato'}
                </span>

                {assets.length > 1 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <Layers className="w-3 h-3" />
                    {assets.length} Archivos (Scroll)
                  </span>
                )}
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
                <p className="font-sans text-sm sm:text-base text-stone-200 leading-relaxed">
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

            {/* Actions Footer */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
              {(item.rawUrl || item.url) && (
                <a
                  href={item.rawUrl || item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-sans text-xs font-semibold hover:bg-stone-200 transition-colors shadow-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir recurso original
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-sans text-xs font-semibold hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-md"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? '¡Copiado!' : 'Copiar enlace'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
