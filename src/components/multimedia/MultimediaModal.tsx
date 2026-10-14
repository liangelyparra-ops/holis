import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Sparkles, Film, Image as ImageIcon, Box, Video, Share2, Check } from 'lucide-react';
import type { MultimediaItem } from '../../types/multimedia';
import { normalizeCategory } from '../../types/multimedia';

interface MultimediaModalProps {
  item: MultimediaItem | null;
  onClose: () => void;
}

export const MultimediaModal: React.FC<MultimediaModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);

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

  if (!item) return null;

  const isVideo = item.mediaType === 'video' || item.mediaType === 'drive_video' || item.mediaType === 'embed';
  const normalized = normalizeCategory(item.category);

  const categoryLabels: Record<string, { label: string; icon: any }> = {
    MOTION: { label: 'Motion', icon: Film },
    IA: { label: 'IA', icon: Sparkles },
    KEY_VISUALS: { label: 'Key Visuals', icon: ImageIcon },
  };
  const currentCat = categoryLabels[normalized] || { label: normalized, icon: Sparkles };
  const CategoryIcon = currentCat.icon;

  const handleCopyLink = () => {
    const shareUrl = item.rawUrl || item.url;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="lg:w-7/12 bg-neutral-950 flex items-center justify-center min-h-[320px] sm:min-h-[440px] max-h-[60vh] lg:max-h-none overflow-hidden relative">
            {item.mediaType === 'drive_video' ? (
              <iframe
                src={item.url}
                title={item.title}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="w-full h-full min-h-[380px] lg:min-h-[540px] border-0"
              />
            ) : item.mediaType === 'embed' ? (
              <iframe
                src={item.url}
                title={item.title}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full min-h-[380px] lg:min-h-[540px] border-0"
              />
            ) : item.mediaType === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[70vh] object-contain"
              />
            ) : (
              <img
                src={item.url}
                alt={item.title}
                className="w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  if (item.thumbnailUrl && item.thumbnailUrl !== item.url) {
                    (e.target as HTMLImageElement).src = item.thumbnailUrl;
                  }
                }}
              />
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
                  Formato: {item.format}
                </span>
                {item.driveFileId && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Google Drive
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
                {item.title}
              </h2>

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
              {(item.rawUrl || item.url) && (
                <a
                  href={item.rawUrl || item.url}
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
