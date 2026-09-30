import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderNavProps {
  activeTab: 'IMPACT' | 'CONTACT' | 'GAMES';
  setActiveTab: (tab: 'IMPACT' | 'CONTACT' | 'GAMES') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab }) => {
  const [availableMenuOpen, setAvailableMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'IMPACT', label: 'Experience' },
    { id: 'CONTACT', label: 'About me' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#fafafa]/80 backdrop-blur-md border-b border-neutral-200/40 px-4 sm:px-12 py-3.5 flex items-center justify-between transition-all duration-300">
      {/* Brand logo & title */}
      <div 
        onClick={() => {
          setActiveTab('IMPACT');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="flex items-center gap-3 cursor-pointer group select-none"
      >
        <div className="w-8 h-8 rounded-full border border-neutral-200/80 bg-white flex items-center justify-center shadow-3xs group-hover:border-neutral-400 group-hover:scale-105 transition-all">
          <span className="font-headline font-bold text-xs tracking-tighter text-black">LP</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-headline font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-black transition-colors leading-tight">
            Lia Parra
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-600 font-mono">
            Sr. Product Designer
          </span>
        </div>
      </div>

      {/* Desktop Navigation */}
      {activeTab !== 'GAMES' ? (
        <nav className="hidden lg:flex items-center gap-8 font-sans text-xs uppercase tracking-wider">
          {navItems.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`py-1 transition-all duration-300 cursor-pointer ${
                  isTabActive 
                    ? 'text-[#111110] font-black scale-105' 
                    : 'text-neutral-500 hover:text-[#111110]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('IMPACT');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1919] border border-neutral-700 hover:border-neutral-500 text-white font-sans text-xs transition-all cursor-pointer shadow-xs hover:scale-105"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Portfolio
          </button>
        </div>
      )}

      {/* Top Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Availability Badge */}
        <div className="relative hidden sm:block">
          <button 
            onClick={() => setAvailableMenuOpen(!availableMenuOpen)}
            className={`flex items-center gap-[6px] px-[12px] py-[5px] rounded-full shadow-xs border transition-all cursor-pointer ${
              activeTab === 'GAMES'
                ? 'bg-[#1a1b13] border-[#5a6224] hover:bg-[#25271b] hover:border-[#717b2e]'
                : 'bg-lime-50/70 border-lime-200/80 hover:bg-lime-100/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs bg-[#D9E93E]" />
            <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${
              activeTab === 'GAMES' ? 'text-white' : 'text-neutral-700'
            }`}>
              i'm available
            </span>
            <span className={`material-symbols-outlined text-[10px] opacity-70 transition-transform duration-200 ${
              activeTab === 'GAMES' ? 'text-white/80' : 'text-neutral-500'
            }`}>
              {availableMenuOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <AnimatePresence>
            {availableMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[19]" 
                  onClick={() => setAvailableMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-52 rounded-2xl p-1.5 shadow-xl border z-20 backdrop-blur-xl ${
                    activeTab === 'GAMES'
                      ? 'bg-[#121212]/95 border-neutral-800 text-white shadow-black/80'
                      : 'bg-white/95 border-neutral-200/50 text-neutral-800 shadow-neutral-900/5'
                  }`}
                >
                  <a
                    href="mailto:liangelyp@gmail.com"
                    onClick={() => setAvailableMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                      activeTab === 'GAMES'
                        ? 'hover:bg-[#222222] text-neutral-400'
                        : 'hover:bg-neutral-50 text-neutral-500 font-sans'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    Contact by Mail
                  </a>
                  <a
                    href="https://wa.me/5491156424162?text=Hello%20Lia!%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you."
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setAvailableMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                      activeTab === 'GAMES'
                        ? 'hover:bg-[#222222] text-neutral-400'
                        : 'hover:bg-neutral-50 text-neutral-500 font-sans'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    Contact by WhatsApp
                  </a>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu toggle */}
        <div className={`relative ${activeTab === 'GAMES' ? 'hidden' : 'lg:hidden'} z-50`}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer select-none hover:bg-neutral-200/50 text-[#111110]"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setMobileMenuOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl p-1.5 shadow-xl border z-50 backdrop-blur-md bg-white/95 border-neutral-200/60 text-[#111110] shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                >
                  {navItems.map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setMobileMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-sans font-medium rounded-xl transition-all duration-150 cursor-pointer block select-none ${
                          isTabActive
                            ? 'bg-neutral-100/90 text-[#111110] font-semibold'
                            : 'hover:bg-neutral-100/60 text-neutral-500'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
