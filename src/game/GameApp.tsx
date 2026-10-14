import React from 'react';
import { Toaster } from 'sonner';
import GameSection from './GameSection';

export default function GameApp() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      {/* Ambient background matching the game aesthetic */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#3C48C3]/15 blur-[120px]" />
        <div className="absolute -bottom-10 -right-10 w-[650px] h-[650px] bg-[#3C48C3]/10 blur-[140px]" />
      </div>

      <Toaster position="top-right" richColors closeButton />

      {/* Back to portfolio link */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white font-sans text-xs font-medium transition-all backdrop-blur-md shadow-md hover:scale-105"
        aria-label="Back to portfolio"
      >
        <span className="material-symbols-outlined text-xs">arrow_back</span>
        Portfolio
      </a>

      <main className="relative z-10 w-full min-h-screen flex flex-col pt-16 pb-6 px-3 sm:px-6">
        <GameSection />
      </main>
    </div>
  );
}
