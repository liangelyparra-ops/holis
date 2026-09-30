import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { UseCase } from '../../data/useCases';
import { CaseVisual, CookieLivePrototypeBlock } from './CustomCaseBlocks';
import { getDirectDriveUrl } from '../../utils/media';

interface CaseStudyModalProps {
  project: UseCase | null;
  onClose: () => void;
}

export const CaseStudyModal = ({ project, onClose }: CaseStudyModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  useEffect(() => {
    if (!project) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!(dialog instanceof HTMLDivElement)) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), iframe, [tabindex="0"]'));
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-neutral-950/60 backdrop-blur-md" onClick={onClose}>
          <motion.div key={project.id} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={event => event.stopPropagation()}
            className="bg-white border border-neutral-200 rounded-3xl w-full max-w-6xl max-h-[95dvh] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)] flex flex-col overflow-hidden text-neutral-900 focus:outline-none">
            {/* Modal header */}
            <div className="flex justify-between items-center gap-4 px-6 sm:px-10 py-5 border-b border-neutral-100 bg-neutral-50/80 backdrop-blur-sm shrink-0">
              <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">{project.footerBadge}</p>
              <button type="button" onClick={onClose} aria-label="Close case study" className="shrink-0 w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-colors focus-visible:outline-2 focus-visible:outline-neutral-900 cursor-pointer"><span aria-hidden="true" className="material-symbols-outlined text-xl">close</span></button>
            </div>
            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto style-scrollbar px-6 sm:px-10 md:px-14 py-8 sm:py-10 md:py-12 space-y-10 text-left">
              <header className="space-y-6 max-w-4xl">
                <h2 id={titleId} className="font-headline text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{project.title}</h2>
                <p className="font-sans text-base sm:text-lg leading-relaxed text-neutral-600">{project.challenge}</p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-neutral-200 py-6">
                  <div><dt className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Contribution</dt><dd className="mt-2.5 text-sm sm:text-base text-neutral-700 leading-relaxed">{project.role}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Context</dt><dd className="mt-2.5 text-sm sm:text-base text-neutral-700 leading-relaxed">{project.context}</dd></div>
                </dl>
                <aside className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-sm leading-relaxed text-stone-600"><strong className="block mb-1.5 text-stone-900 text-sm font-semibold">About the material shown</strong>{project.evidenceNote}</aside>
              </header>
              {project.blocks.map((block, index) => {
                if (block.type === 'custom') {
                  return block.customType === 'cookie_live_prototype'
                    ? project.liveUrl && <CookieLivePrototypeBlock key={index} url={project.liveUrl} />
                    : block.customType && <CaseVisual key={index} type={block.customType} />;
                }

                if (block.type === 'image') {
                  return (
                    <figure key={index} className="space-y-2.5 my-6 max-w-4xl">
                      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm relative group">
                        <img
                          src={getDirectDriveUrl(block.imageUrl)}
                          alt={block.alt || block.imageCaption || project.title}
                          className="w-full h-auto max-h-[580px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {block.imageCaption && (
                        <figcaption className="font-sans text-xs text-stone-500 italic pl-1 flex items-center justify-between flex-wrap gap-2">
                          <span>{block.imageCaption}</span>
                          {block.imageUrl && (
                            <a
                              href={block.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="not-italic text-[11px] font-sans text-neutral-500 hover:text-neutral-900 underline underline-offset-2 shrink-0"
                            >
                              View original asset ↗
                            </a>
                          )}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                return (
                  <section key={index} className="space-y-5 max-w-4xl">
                    {block.title && <h3 className="font-headline text-lg sm:text-xl font-semibold border-b border-neutral-100 pb-4">{block.title}</h3>}
                    {block.paragraphs?.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="font-sans text-sm sm:text-base leading-relaxed text-neutral-600">{paragraph}</p>)}
                    {block.bulletPoints && <ul className="list-disc pl-6 space-y-3 font-sans text-sm sm:text-base leading-relaxed text-neutral-600">{block.bulletPoints.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}</ul>}
                  </section>
                );
              })}
            </div>
            {/* Modal footer */}
            <div className="px-6 sm:px-10 py-5 border-t border-neutral-100 bg-neutral-50/80 flex justify-end shrink-0">
              <button type="button" onClick={onClose} className="rounded-xl bg-neutral-950 hover:bg-neutral-800 px-6 py-3 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 cursor-pointer">Close case study</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};