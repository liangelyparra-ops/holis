import React from 'react';
import { Toaster } from 'sonner';
import GameSection from './GameSection';

export default function GameApp() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#3C48C3]/15 blur-[120px]" />
        <div className="absolute -bottom-10 -right-10 w-[650px] h-[650px] bg-[#3C48C3]/10 blur-[140px]" />
      </div>

      <Toaster position="top-right" richColors closeButton />

      {/* Floating icon nav — top right */}
      <nav className="fixed top-4 right-4 z-50 flex items-center gap-2" aria-label="Game navigation">
        {/* Back to portfolio */}
        <a
          href="/"
          aria-label="Back to portfolio"
          className="w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md hover:scale-110 group relative"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[10px] font-sans font-medium tracking-wide shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Portfolio
          </span>
        </a>
      </nav>

      <main className="relative z-10 w-full min-h-screen flex flex-col pt-6 pb-6 px-3 sm:px-6">
        <GameSection />
      </main>
    </div>
  );
}
