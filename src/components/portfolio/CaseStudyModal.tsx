import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { UseCase } from '../../data/useCases';
import { CaseVisual, CookieLivePrototypeBlock } from './CustomCaseBlocks';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/50 backdrop-blur-md" onClick={onClose}>
          <motion.div key={project.id} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ duration: 0.2 }}
            onClick={event => event.stopPropagation()}
            className="bg-white border border-neutral-200 rounded-3xl w-full max-w-4xl max-h-[90dvh] shadow-2xl flex flex-col overflow-hidden text-neutral-900 focus:outline-none">
            <div className="flex justify-between items-center gap-3 px-5 sm:px-8 py-4 border-b border-neutral-100 bg-neutral-50">
              <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{project.footerBadge}</p>
              <button type="button" onClick={onClose} aria-label="Close case study" className="shrink-0 w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-neutral-900 cursor-pointer"><span aria-hidden="true" className="material-symbols-outlined text-lg">close</span></button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto style-scrollbar p-5 sm:p-8 md:p-10 space-y-8 text-left">
              <header className="space-y-5">
                <h2 id={titleId} className="font-headline text-2xl sm:text-4xl font-bold tracking-tight leading-tight">{project.title}</h2>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-neutral-600">{project.challenge}</p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-neutral-200 py-5">
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">Contribution</dt><dd className="mt-2 text-sm text-neutral-700">{project.role}</dd></div>
                  <div><dt className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">Context</dt><dd className="mt-2 text-sm text-neutral-700">{project.context}</dd></div>
                </dl>
                <aside className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-600"><strong className="block mb-1 text-stone-900">About the material shown</strong>{project.evidenceNote}</aside>
              </header>
              {project.blocks.map((block, index) => block.type === 'custom' ? (
                block.customType === 'cookie_live_prototype'
                  ? project.liveUrl && <CookieLivePrototypeBlock key={index} url={project.liveUrl} />
                  : block.customType && <CaseVisual key={index} type={block.customType} />
              ) : (
                <section key={index} className="space-y-4">
                  {block.title && <h3 className="font-headline text-lg font-semibold border-b border-neutral-100 pb-3">{block.title}</h3>}
                  {block.paragraphs?.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="font-sans text-sm leading-relaxed text-neutral-600">{paragraph}</p>)}
                  {block.bulletPoints && <ul className="list-disc pl-5 space-y-3 font-sans text-sm leading-relaxed text-neutral-600">{block.bulletPoints.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}</ul>}
                </section>
              ))}
              {project.references && <section className="space-y-3 border-t border-neutral-200 pt-5">
                <h3 className="text-sm font-semibold">Existing asset references</h3>
                <p className="text-xs text-neutral-500">External links retained from the portfolio. Availability and publication permission are not independently verified; these links are not required to understand the case.</p>
                <ul className="space-y-3">{project.references.map(reference => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-700 underline underline-offset-4">{reference.label} ↗</a></li>)}</ul>
              </section>}
            </div>
            <div className="px-5 sm:px-8 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button type="button" onClick={onClose} className="rounded-xl bg-neutral-950 hover:bg-neutral-800 px-5 py-2.5 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 cursor-pointer">Close case study</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};