import React from 'react';
import { getDirectDriveUrl } from '../../utils/media';

interface PapelitoCaseCardProps {
  onLaunchGame: () => void;
}

export const PapelitoCaseCard: React.FC<PapelitoCaseCardProps> = ({ onLaunchGame }) => {
  return (
    <div className="bg-[#111113] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-neutral-700 max-w-6xl mx-auto w-full select-none text-left">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
        {/* Left Hand: Preview Image */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center space-y-2">
          <div className="overflow-hidden rounded-xl border border-neutral-800 relative bg-neutral-900 aspect-video shadow-3xs">
            <img 
              src={getDirectDriveUrl("https://drive.google.com/file/d/1xN0fZzNMSZKh5252z38-m09XZokC0_Qf/view?usp=share_link")} 
              alt="Papelito game interface preview" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="font-sans text-[10px] text-neutral-400 italic pl-0.5 leading-normal select-text">
            Preview: Real-time Multi-agent Engine &amp; Web Audio
          </p>
        </div>

        {/* Right Hand: Description & CTA */}
        <div className="flex-1 flex flex-col justify-between space-y-4 text-left">
          {/* Header Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest font-mono text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/30">
                AI x UX Co-Creation
              </span>
              <span className="text-[11px] text-neutral-400 font-body italic">
                From raw prompt to live lobby
              </span>
            </div>
            <h3 className="font-headline text-lg sm:text-2xl font-bold text-white tracking-tight">
              Holis / Papelito Game: Real-time Multiplayer Engine
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Designing a multiplayer party game requires granular event management and zero-latency feedback. Using structured prompt sequencing with Gemini, we co-designed and deployed the entire party flow featuring custom Web Audio synthesizers, Firestore realtime state machines, and dynamic AI card generation.
            </p>
          </div>

          {/* Bottom Row / Pipeline badges + Launch CTA */}
          <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-x-4 gap-y-1 flex-wrap text-[11px] text-neutral-400 select-text">
              <span><strong className="text-white font-mono">Audio:</strong> Web Audio Synth</span>
              <span><strong className="text-white font-mono">AI:</strong> Gemini 2.5 Flash</span>
              <span><strong className="text-white font-mono">Sync:</strong> Firestore Realtime</span>
            </div>

            <button
              type="button"
              onClick={onLaunchGame}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-indigo-900/30 cursor-pointer"
            >
              <span>Launch Live Demo</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
