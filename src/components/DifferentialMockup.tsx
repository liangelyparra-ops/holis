import React from 'react';

export const DifferentialMockup: React.FC = () => {
  return (
    <figure className="w-full rounded-2xl border border-neutral-200/80 bg-white/80 p-4 sm:p-5 shadow-xs" aria-labelledby="cookie-review-caption">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-neutral-200">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Action required</p>
            <p className="font-headline text-sm font-semibold text-neutral-900">Review AI suggestion</p>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-800">
            Pending review
          </span>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs font-semibold text-neutral-900">Category</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-700">AI suggested</span>
            </div>
            <p className="font-sans text-sm text-neutral-700">Analytics</p>
          </div>

          <div className="rounded-lg border border-neutral-300 bg-white p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs font-semibold text-neutral-900">Vendor</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">Edited manually</span>
            </div>
            <p className="font-sans text-sm text-neutral-700">Example Analytics Ltd.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-center font-sans text-xs font-semibold text-neutral-700">Reject</div>
            <div className="rounded-lg bg-neutral-950 px-3 py-2 text-center font-sans text-xs font-semibold text-white">Approve</div>
          </div>
        </div>
      </div>
      <figcaption id="cookie-review-caption" className="mt-3 font-sans text-xs text-neutral-500 leading-relaxed">
        Reconstructed example: an AI suggestion stays visible while an edited field becomes a manual entry.
      </figcaption>
    </figure>
  );
};