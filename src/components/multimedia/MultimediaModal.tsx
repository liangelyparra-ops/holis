import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Sparkles,
  Film,
  Image as ImageIcon,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Video,
} from 'lucide-react';
import type { MultimediaItem } from '../../types/multimedia';
import { normalizeCategory, getItemAssets } from '../../types/multimedia';

interface MultimediaModalProps {
  item: MultimediaItem | null;
  onClose: () => void;
}

export const MultimediaModal: React.FC<MultimediaModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  const assets = item ? getItemAssets(item) : [];
  const activeAsset = assets[activeAssetIndex] || assets[0];

  useEffect(() => {
    setActiveAssetIndex(0);
  }, [item?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && assets.length > 1) {
        setActiveAssetIndex((prev) => (prev + 1) % assets.length);
      }
      if (e.key === 'ArrowLeft' && assets.length > 1) {
        setActiveAssetIndex((prev) => (prev - 1 + assets.length) % assets.length);
      }
    };
    if (item) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose, assets.length]);

  if (!item || !activeAsset) return null;

  const normalized = normalizeCategory(item.category);
  const categoryLabels: Record<string, { label: string; icon: any }> = {
    MOTION: { label: 'Motion', icon: Film },
    IA: { label: 'IA', icon: Sparkles },
    KEY_VISUALS: { label: 'Key Visuals', icon: ImageIcon },
  };
  const currentCat = categoryLabels[normalized] || { label: normalized, icon: Sparkles };
  const CategoryIcon = currentCat.icon;

  const handleCopyLink = () => {
    const shareUrl = activeAsset.rawUrl || activeAsset.url || item.rawUrl || item.url || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    setActiveAssetIndex((prev) => (prev + 1) % assets.length);
  };

  const handlePrev = () => {
    setActiveAssetIndex((prev) => (prev - 1 + assets.length) % assets.length);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 z-10 my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Display Area (Left or Top) */}
          <div className="lg:w-7/12 bg-neutral-950 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[460px] max-h-[60vh] lg:max-h-none overflow-hidden relative">
            <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden">
              {activeAsset.mediaType === 'drive_video' ? (
                <iframe
                  key={activeAsset.id + activeAsset.url}
                  src={activeAsset.url}
                  title={activeAsset.title || item.title}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="w-full h-full min-h-[380px] lg:min-h-[500px] border-0"
                />
              ) : activeAsset.mediaType === 'embed' ? (
                <iframe
                  key={activeAsset.id + activeAsset.url}
                  src={activeAsset.url}
                  title={activeAsset.title || item.title}
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[380px] lg:min-h-[500px] border-0"
                />
              ) : activeAsset.mediaType === 'video' ? (
                <video
                  key={activeAsset.id + activeAsset.url}
                  src={activeAsset.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[65vh] object-contain"
                />
              ) : (
                <img
                  key={activeAsset.id + activeAsset.url}
                  src={activeAsset.url}
                  alt={activeAsset.title || item.title}
                  className="w-full max-h-[65vh] object-contain transition-opacity duration-300"
                  onError={(e) => {
                    if (activeAsset.thumbnailUrl && activeAsset.thumbnailUrl !== activeAsset.url) {
                      (e.target as HTMLImageElement).src = activeAsset.thumbnailUrl;
                    }
                  }}
                />
              )}

              {/* Prev / Next Floating Arrows for Multi-Asset */}
              {assets.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Asset anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer border border-white/10 shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Asset siguiente"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer border border-white/10 shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Multi-Asset Bottom Thumbnail / Selector Strip */}
            {assets.length > 1 && (
              <div className="w-full bg-neutral-900/90 border-t border-neutral-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 z-10">
                <div className="flex items-center gap-1.5 text-white/70 text-xs font-mono font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    Asset {activeAssetIndex + 1} de {assets.length}
                  </span>
                  {activeAsset.title && (
                    <span className="text-white/90 truncate max-w-[150px] sm:max-w-xs font-sans">
                      · {activeAsset.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                  {assets.map((asset, idx) => {
                    const isSelected = idx === activeAssetIndex;
                    return (
                      <button
                        key={asset.id || idx}
                        type="button"
                        onClick={() => setActiveAssetIndex(idx)}
                        className={`w-9 h-9 rounded-lg overflow-hidden border transition-all cursor-pointer shrink-0 relative ${
                          isSelected
                            ? 'border-white ring-2 ring-emerald-500 scale-105'
                            : 'border-white/20 opacity-50 hover:opacity-100'
                        }`}
                        title={asset.title || `Asset ${idx + 1}`}
                      >
                        {asset.thumbnailUrl || (asset.mediaType === 'image' && asset.url) ? (
                          <img
                            src={asset.thumbnailUrl || asset.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/70">
                            {asset.mediaType.includes('video') ? (
                              <Video className="w-3.5 h-3.5" />
                            ) : (
                              <ImageIcon className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 px-1 text-[8px] font-mono bg-black/80 text-white rounded-tl">
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details / Narrative Column (Right) */}
          <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[85vh] text-left space-y-6">
            <div className="space-y-4">
              {/* Category & Format Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                  <CategoryIcon className="w-3.5 h-3.5" />
                  {currentCat.label}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-neutral-900 text-white">
                  Formato: {activeAsset.format}
                </span>

                {assets.length > 1 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Layers className="w-3 h-3" />
                    {assets.length} Assets
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {item.title}
                </h2>
                {activeAsset.title && (
                  <p className="font-sans text-xs font-semibold text-emerald-700 mt-1">
                    Visualizando: {activeAsset.title} ({activeAssetIndex + 1}/{assets.length})
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                  Concepto &amp; Proceso Creativo
                </p>
                <p className="font-sans text-sm sm:text-base text-stone-700 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Hook Rationale / Social Retención */}
              {item.hookRationale && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Hook &amp; Criterio de Retención
                  </p>
                  <p className="font-sans text-xs sm:text-sm text-amber-950 leading-relaxed">
                    {item.hookRationale}
                  </p>
                </div>
              )}

              {/* Tools List */}
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                  Herramientas &amp; Pipeline
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tools.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-stone-100 text-neutral-800 border border-stone-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center gap-3">
              {(activeAsset.rawUrl || activeAsset.url) && (
                <a
                  href={activeAsset.rawUrl || activeAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white font-sans text-xs font-semibold hover:bg-black transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir recurso original
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 font-sans text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                {copied ? '¡Copiado!' : 'Copiar enlace'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
