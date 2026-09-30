import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Linkedin } from 'lucide-react';
import { Toaster } from 'sonner';
import { useCases } from './data/useCases';
import type { UseCase } from './data/useCases';
import { portfolioContent } from './data/portfolioContent';
import { DifferentialMockup } from './components/DifferentialMockup';
import { HeaderNav } from './components/portfolio/HeaderNav';
import { CaseStudyCard } from './components/portfolio/CaseStudyCard';
import { CaseStudyModal } from './components/portfolio/CaseStudyModal';
import { ContactSection } from './components/portfolio/ContactSection';
import { PapelitoCaseCard } from './components/portfolio/PapelitoCaseCard';

// Lazy-load the heavy multiplayer game engine only when accessed
const GameSection = lazy(() => import('./components/GameSection'));

export default function App() {
  const [activeTab, setActiveTab] = useState<'IMPACT' | 'CONTACT' | 'GAMES'>('IMPACT');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<UseCase | null>(null);
  const closeCaseStudy = useCallback(() => setSelectedProjectForModal(null), []);

  // Sync tab with URL hash for deep linking & back/forward navigation support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#game' || hash === '#games') {
        setActiveTab('GAMES');
      } else if (hash === '#about' || hash === '#contact') {
        setActiveTab('CONTACT');
      } else {
        setActiveTab('IMPACT');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash whenever tab changes, maintaining clean state
  useEffect(() => {
    let targetHash = '#experience';
    if (activeTab === 'GAMES') targetHash = '#game';
    else if (activeTab === 'CONTACT') targetHash = '#about';

    if (window.location.hash.toLowerCase() !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
  }, [activeTab]);

  const renderImpact = () => {
    return (
      <div className="max-w-6xl w-full mx-auto px-5 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left">
        {/* Section Header with End-to-End Differential Showcase Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3 animate-fade-in">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
                {portfolioContent.title}
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
                {portfolioContent.headline}
              </h1>
            </div>
            <p className="font-sans text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed">
              {portfolioContent.summary}
            </p>
            <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {portfolioContent.specialization}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#selected-work" className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-neutral-950 text-white font-sans text-sm font-semibold hover:bg-black transition-colors">
                View selected work
              </a>
              <a href={portfolioContent.resumeUrl} download className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 bg-white/60 text-neutral-900 font-sans text-sm font-semibold hover:bg-white hover:border-neutral-500 transition-colors">
                <Download className="w-4 h-4" />
                Download resume
              </a>
            </div>
            <p className="font-sans text-sm text-neutral-500">{portfolioContent.location}</p>
          </div>
          <div className="lg:col-span-5 w-full">
            <DifferentialMockup />
          </div>
        </div>

        {/* Professional context and externally attributed recognition */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs text-left grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500 font-mono">Product experience across startup and enterprise</p>
            <div className="space-y-3">
              {portfolioContent.experience.map((item) => (
                <div key={item.company} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-stone-200 pb-3 last:border-0 last:pb-0">
                  <p className="font-headline text-lg font-semibold text-stone-900">{item.company}</p>
                  <p className="font-sans text-sm text-stone-600">{item.context} · {item.dates}</p>
                </div>
              ))}
            </div>
            <p className="font-sans text-sm text-stone-600 leading-relaxed">
              Continued working on the product after illow’s acquisition by BigID.
            </p>
          </div>
          <div className="space-y-3 lg:border-l lg:border-stone-200 lg:pl-8">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500 font-mono">Product recognition</p>
            <h2 className="font-headline text-2xl font-semibold text-stone-900">{portfolioContent.recognition.title}</h2>
            <p className="font-sans text-sm text-stone-600 leading-relaxed">{portfolioContent.recognition.description}</p>
          </div>
        </div>

        {/* Featured Case Studies Grid */}
        <section id="selected-work" className="space-y-8 scroll-mt-24">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">Selected work</p>
            <h2 className="font-headline text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight">Product decisions in context.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
            {useCases.map((project, idx) => (
            <CaseStudyCard 
              key={project.id}
              project={project} 
              idx={idx} 
              onOpen={() => setSelectedProjectForModal(project)} 
            />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start border-t border-neutral-200 pt-10">
          <h2 className="lg:col-span-5 font-headline text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight">
            From startup product building to enterprise systems.
          </h2>
          <div className="lg:col-span-7 space-y-5">
            <p className="font-sans text-base text-neutral-600 leading-relaxed">{portfolioContent.shortAbout}</p>
            <button type="button" onClick={() => setActiveTab('CONTACT')} className="font-sans text-sm font-semibold text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 cursor-pointer">
              More about me
            </button>
          </div>
        </section>

        {/* Experimental work remains separate from selected product cases */}
        <section className="max-w-6xl mx-auto w-full space-y-6" aria-labelledby="experiments-heading">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">Experiments</p>
            <h2 id="experiments-heading" className="font-headline text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight">Playful prototypes and live builds.</h2>
          </div>
          <PapelitoCaseCard onLaunchGame={() => {
            setActiveTab('GAMES');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </section>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-body transition-colors duration-500 overflow-x-hidden ${
      activeTab === 'GAMES' ? 'bg-[#0e0e0e] text-on-surface' : 'bg-[#fafafa] text-on-surface'
    }`}>
      <Toaster position="top-right" richColors closeButton />

      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {activeTab === 'GAMES' ? (
          <>
            <div className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#3C48C3]/15 blur-[120px]" />
            <div className="absolute -bottom-10 -right-10 w-[650px] h-[650px] bg-[#3C48C3]/10 blur-[140px]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/50 via-[#f0f9ff]/60 to-[#f7f5f0]" />
        )}
      </div>

      {/* Navigation Header */}
      <HeaderNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Case Study Modal */}
      <CaseStudyModal 
        project={selectedProjectForModal} 
        onClose={closeCaseStudy}
      />

      {/* Main View Transition */}
      <main id="main-content" className={`relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col pb-6 ${
        activeTab === 'GAMES' ? 'pt-24 sm:pt-28 px-3 sm:px-6' : 'pt-20'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex flex-col items-center justify-center"
          >
            {activeTab === 'IMPACT' && renderImpact()}
            {activeTab === 'CONTACT' && <ContactSection />}
            
            {activeTab === 'GAMES' && (
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-white">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                    Initializing Holis Game Engine...
                  </p>
                </div>
              }>
                <GameSection />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Interactive Portfolio Footer */}
      <footer className={`relative z-10 w-full border-t py-8 font-sans text-xs transition-colors duration-300 ${
        activeTab === 'GAMES'
          ? 'bg-[#090909] text-neutral-400 border-neutral-800/60'
          : 'bg-[#fafafa] text-neutral-500 border-neutral-200/45'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div className="space-y-1">
            <p className={`font-serif italic text-base sm:text-lg tracking-wide ${
              activeTab === 'GAMES' ? 'text-white' : 'text-neutral-900'
            }`}>
              Lia Parra <span className="font-sans not-italic text-xs text-neutral-400 font-normal ml-1">© 2026</span>
            </p>
            <p className="text-[11px] font-sans tracking-wide text-neutral-500 font-medium">
              {portfolioContent.title}
            </p>
          </div>
          <div className="sm:text-right space-y-0.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-medium">
              B2B SAAS, AI &amp; ENTERPRISE SYSTEMS
            </p>
            <a 
              href="https://linkedin.com/in/liangely-diseno-grafico" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-sans font-medium transition-colors mt-0.5 uppercase tracking-wider text-neutral-500 hover:text-neutral-800"
              id="footer-linkedin-link"
            >
              <Linkedin className="w-3 h-3 shrink-0" />
              LinkedIn ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
