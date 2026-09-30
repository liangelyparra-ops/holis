import React from 'react';
import { motion } from 'motion/react';
import type { UseCase } from '../../data/useCases';
import { CaseVisual } from './CustomCaseBlocks';

export interface CaseStudyCardProps {
  key?: string | number | null;
  project: UseCase;
  idx: number;
  onOpen: () => void;
}

export function CaseStudyCard({ project, idx, onOpen }: CaseStudyCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
      className="group relative custom-glass border border-neutral-200/80 rounded-2xl p-5 sm:p-8 flex flex-col gap-6 shadow-xs hover:border-neutral-300 transition-colors min-w-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => <span key={tag} className="rounded-full border border-neutral-200 bg-neutral-100/70 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-600">{tag}</span>)}
        </div>
        <span className="material-symbols-outlined text-neutral-500 text-lg" aria-hidden="true">{project.icon}</span>
      </div>
      <div className="space-y-3">
        <h3 className="font-headline text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
          <button type="button" onClick={onOpen} className="text-left cursor-pointer hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900">{project.title}</button>
        </h3>
        <p className="font-sans text-sm text-neutral-600 leading-relaxed">{project.challenge}</p>
      </div>
      <CaseVisual type={project.visualType} compact />
      <div className="mt-auto border-t border-neutral-200/60 pt-4 space-y-5">
        <p className="font-sans text-xs leading-relaxed text-neutral-600"><strong className="block mb-1 text-neutral-900">Design contribution</strong>{project.impact}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-neutral-500">{project.footerBadge}</span>
          <button type="button" onClick={onOpen} aria-label={`Read case study: ${project.title}`} className="font-sans text-xs font-semibold text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 cursor-pointer">Read case study →</button>
        </div>
      </div>
    </motion.article>
  );
}