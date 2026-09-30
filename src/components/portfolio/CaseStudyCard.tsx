import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WireframeMockup, EnterpriseHierarchyMockup } from '../ProjectMockups';
import { getDirectDriveUrl, getEmbedUrl, getFirstMediaBlock } from '../../utils/media';

export const CardCarousel: React.FC<{ images: string[]; getDirectDriveUrl: (url: string) => string }> = ({ images, getDirectDriveUrl }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.img 
          key={activeSlide}
          src={getDirectDriveUrl(images[activeSlide])}
          alt={`Card slide showcase ${activeSlide + 1}`}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.3 }}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Navigation overlays */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide(prev => (prev === 0 ? images.length - 1 : prev - 1));
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10 animate-fade-in"
      >
        <span className="material-symbols-outlined text-xs font-bold leading-none">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
      >
        <span className="material-symbols-outlined text-xs font-bold leading-none">chevron_right</span>
      </button>

      {/* Dot markers */}
      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none">
        {images.map((_: string, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide(idx);
            }}
            className={`w-1.5 h-1.5 rounded-full pointer-events-auto transition-all duration-300 ${
              idx === activeSlide ? 'w-3.5 bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const CarouselBlock: React.FC<{ block: any; getDirectDriveUrl: (url: string) => string }> = ({ block, getDirectDriveUrl }) => {
  const [index, setIndex] = useState(0);
  const images = block.carouselImages || [];

  if (images.length === 0) return null;

  return (
    <div className="space-y-2 select-none">
      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-250 bg-neutral-900 shadow-3xs">
        <AnimatePresence mode="wait">
          <motion.img 
            key={index}
            src={getDirectDriveUrl(images[index])}
            alt={`Deep dive slide showcase ${index + 1}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
        </AnimatePresence>

        {/* Navigation overlays */}
        <button
          type="button"
          onClick={() => setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
        >
          <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={() => setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
        >
          <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
        </button>

        {/* Navigation dot pips */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
          {images.map((_: string, idx: number) => {
            const isActive = idx === index;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full pointer-events-auto transition-all ${
                  isActive ? 'w-4 bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>

      {block.carouselCaption && (
        <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
          {block.carouselCaption}
        </p>
      )}
    </div>
  );
};

export interface CaseStudyCardProps {
  key?: React.Key;
  project: any;
  idx: number;
  onOpen: () => void;
}

export function CaseStudyCard({ project, idx, onOpen }: CaseStudyCardProps) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpen}
      className="group relative custom-glass border border-neutral-150/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 transition-all duration-500 ease-out shadow-xs hover:shadow-[0_24px_48px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.01)] hover:border-neutral-300/80 hover:bg-white cursor-pointer select-none overflow-hidden"
    >
      {/* Subtle background glow inspired by Lia Brand Base */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {project.tags?.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border bg-neutral-100/70 border-neutral-200/40 text-neutral-500 shadow-3xs group-hover:bg-neutral-100 group-hover:text-black group-hover:border-neutral-200 transition-all duration-500"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="material-symbols-outlined text-neutral-400 group-hover:text-black group-hover:scale-110 transition-all duration-500 text-lg shrink-0">
          {project.icon}
        </span>
      </div>

      {/* Title & Challenge Description */}
      <div className="space-y-2">
        <h3 className="font-headline text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-black transition-colors duration-300">
          {project.title}
          <span className="inline-block text-black opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 ml-2 font-sans font-normal text-lg sm:text-xl">
            →
          </span>
        </h3>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-3xl">
          <strong className="text-neutral-800 font-semibold group-hover:text-neutral-900 transition-all duration-300">Context:</strong> {project.challenge}
        </p>
      </div>

      {/* IN-BETWEEN RESPONSIVE MEDIA BLOCK */}
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        {(() => {
          if (project.id === 'illow_brand_to_product') {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <WireframeMockup />
                <p className="font-sans text-[11px] text-neutral-500 italic">
                  Medium-fidelity wireframe modeling for multi-tenant consent selection pref panes.
                </p>
              </div>
            );
          }

          if (project.id === 'bigid_scaling_to_enterprise') {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <EnterpriseHierarchyMockup />
                <p className="font-sans text-[11px] text-neutral-500 italic">
                  Systems architecture visualization for multi-layered permission models and enterprise exceptions.
                </p>
              </div>
            );
          }

          const firstMediaBlock = getFirstMediaBlock(project);
          if (!firstMediaBlock) return null;

          if (firstMediaBlock.type === 'image' && (firstMediaBlock.imageUrl || firstMediaBlock.carouselImages?.[0])) {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="overflow-hidden rounded-lg border border-neutral-200/50 relative bg-neutral-900 aspect-video shadow-3xs">
                  <img 
                    src={getDirectDriveUrl(firstMediaBlock.imageUrl || firstMediaBlock.carouselImages?.[0])} 
                    alt={firstMediaBlock.imageCaption || "Image style preview"} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/media:scale-[1.02] transition-transform duration-700 ease-out brightness-[0.98] group-hover/media:brightness-100"
                  />
                </div>
                {firstMediaBlock.imageCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.imageCaption}
                  </p>
                )}
              </div>
            );
          }

          if (firstMediaBlock.type === 'carousel' && firstMediaBlock.carouselImages && firstMediaBlock.carouselImages.length > 0) {
            return (
              <div className="space-y-3 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs select-none">
                  <CardCarousel images={firstMediaBlock.carouselImages} getDirectDriveUrl={getDirectDriveUrl} />
                </div>
                {firstMediaBlock.carouselCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.carouselCaption}
                  </p>
                )}
              </div>
            );
          }

          if (firstMediaBlock.type === 'video' && firstMediaBlock.videoUrl) {
            const isVideoEmbed = firstMediaBlock.videoUrl.includes('youtube.com') || 
                                firstMediaBlock.videoUrl.includes('youtu.be') || 
                                firstMediaBlock.videoUrl.includes('vimeo.com') ||
                                firstMediaBlock.videoUrl.includes('drive.google.com') ||
                                firstMediaBlock.videoUrl.includes('embed');
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs">
                  {isVideoEmbed ? (
                    <iframe 
                      src={getEmbedUrl(firstMediaBlock.videoUrl)} 
                      title="Dynamic collapsed video presentation"
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={firstMediaBlock.videoUrl} 
                      controls 
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                {firstMediaBlock.videoCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.videoCaption}
                  </p>
                )}
              </div>
            );
          }

          if (firstMediaBlock.type === 'pdf' && firstMediaBlock.pdfUrl) {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs">
                  <iframe 
                    src={getEmbedUrl(firstMediaBlock.pdfUrl)}
                    className="w-full h-full border-0"
                    title="PDF collapsed stream frame preview"
                  />
                </div>
                {firstMediaBlock.pdfCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.pdfCaption}
                  </p>
                )}
              </div>
            );
          }

          return null;
        })()}
      </div>

      {/* Concise summary for comparing project cards */}
      <div className="flex flex-col gap-3.5 border-t border-neutral-100/80 pt-4 mt-2 select-none">
        <div className="p-3.5 bg-neutral-50/60 rounded-xl border border-neutral-200/30 italic text-[11px] sm:text-xs text-neutral-600 leading-relaxed group-hover:bg-neutral-100/50 group-hover:border-neutral-200/50 transition-all duration-500">
          <strong className="text-neutral-800 font-bold not-italic block mb-0.5 group-hover:text-black transition-colors">Design contribution:</strong>
          {project.impact}
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider select-none">
          <span className="text-neutral-400 group-hover:text-neutral-600 transition-colors max-w-[65%] truncate font-mono">{project.footerBadge}</span>
          <span className="flex items-center gap-1 text-black font-sans group-hover:translate-x-1.5 transition-all duration-300 ease-out shrink-0">
            Explore Case Study
            <span className="material-symbols-outlined text-xs font-bold leading-none">arrow_forward</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
