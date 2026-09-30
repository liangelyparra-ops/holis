import React from 'react';
import { Mail } from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'IMPACT' | 'CONTACT' | 'GAMES';
  setActiveTab: (tab: 'IMPACT' | 'CONTACT' | 'GAMES') => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'IMPACT', label: 'Work' },
    { id: 'CONTACT', label: 'About' }
  ];

  return (
    <header className="fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl sm:w-auto transition-all duration-500 ease-out select-none">
      <div className={`h-11 sm:h-12 px-3 sm:px-4 py-1 flex items-center justify-between gap-3 sm:gap-6 rounded-full border transition-all duration-300 ${
        activeTab === 'GAMES'
          ? 'bg-[#141416]/90 border-neutral-800 text-white shadow-2xl shadow-black/80 backdrop-blur-xl'
          : 'bg-white/80 border-neutral-200/70 text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl'
      }`}>
        {/* Brand logo & name */}
        <div 
          onClick={() => {
            setActiveTab('IMPACT');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
            activeTab === 'GAMES'
              ? 'border-neutral-700 bg-neutral-800/90 text-white group-hover:border-neutral-500'
              : 'border-neutral-200/90 bg-neutral-50/90 text-neutral-900 group-hover:border-neutral-400 group-hover:bg-white shadow-3xs'
          }`}>
            <span className="font-serif italic font-normal text-xs sm:text-sm">LP</span>
          </div>
          <span className={`font-headline font-semibold text-xs sm:text-sm tracking-tight transition-colors ${
            activeTab === 'GAMES' ? 'text-white' : 'text-neutral-900 group-hover:text-black'
          }`}>
            Lia Parra
          </span>
        </div>

        {/* Center Navigation Tabs (Only in Portfolio mode) */}
        {activeTab !== 'GAMES' ? (
          <nav className="flex items-center gap-1 font-sans text-xs">
            {navItems.map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer text-xs ${
                    isTabActive 
                      ? 'bg-neutral-150/70 text-neutral-950 font-semibold shadow-3xs' 
                      : 'text-neutral-500 hover:text-neutral-900 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <button
            onClick={() => {
              setActiveTab('IMPACT');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-white font-sans text-xs font-medium transition-all cursor-pointer shadow-xs hover:scale-105"
          >
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            Portfolio
          </button>
        )}

        {/* Right Section: Two Icon Buttons (WhatsApp + Mail) with hover tooltips */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* WhatsApp Icon Button */}
          <div className="relative group">
            <a
              href="https://wa.me/5491156424162?text=Hello%20Lia!%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact via WhatsApp"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'GAMES'
                  ? 'border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/60 hover:bg-neutral-800'
                  : 'border-neutral-200/80 bg-neutral-50/60 text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/70 shadow-3xs'
              }`}
            >
              {/* Clean WhatsApp SVG vector */}
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50">
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[10px] font-sans font-medium tracking-wide shadow-md whitespace-nowrap">
                WhatsApp
              </span>
            </div>
          </div>

          {/* Mail Icon Button */}
          <div className="relative group">
            <a
              href="mailto:liangelyp@gmail.com"
              aria-label="Send Email"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                activeTab === 'GAMES'
                  ? 'border-neutral-700 bg-neutral-800/80 text-neutral-300 hover:text-white hover:border-neutral-500 hover:bg-neutral-800'
                  : 'border-neutral-200/80 bg-neutral-50/60 text-neutral-600 hover:text-neutral-950 hover:border-neutral-400 hover:bg-neutral-100 shadow-3xs'
              }`}
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50">
              <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[10px] font-sans font-medium tracking-wide shadow-md whitespace-nowrap">
                Mail
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
