import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin } from 'lucide-react';
import { Toaster } from 'sonner';
import { useCases } from './data/useCases';
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
  const [useCaseFilter, setUseCaseFilter] = useState<'All' | 'UX Strategy' | 'Design Systems' | 'Information Architecture' | 'Branding'>('All');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any | null>(null);

  // Memoized useCases filtering for optimal rendering performance
  const filteredCases = useMemo(() => {
    return useCases.filter(
      (item) => useCaseFilter === 'All' || item.tags.includes(useCaseFilter as any)
    );
  }, [useCaseFilter]);

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
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left select-none">
        {/* Section Header with End-to-End Differential Showcase Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3 animate-fade-in">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
                Senior Product &amp; UX Designer
              </span>
              <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
                Strategy &amp; <span className="font-cursive italic font-normal text-neutral-400 pr-1">Design</span> <br />
                as a Growth Engine
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-stone-700 max-w-2xl leading-relaxed">
              I simplify extreme technical complexity into clean, intuitive, and high-performing B2B SaaS products. Former Lead Product Designer at illow (acquired by BigID). Specialized in multi-tenant architecture, global regulatory compliance, scalable design systems, and AI-powered interfaces.
            </p>
          </div>
          <div className="lg:col-span-5 w-full">
            <DifferentialMockup />
          </div>
        </div>

        {/* Proof Bar / Key Highlights */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs my-6 text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-stone-900 font-mono mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-stone-900 text-sm">verified_user</span>
            Proof Bar / Key Highlights
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <h4 className="font-headline text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-stone-700 text-sm">handshake</span>
                Corporate Acquisition
              </h4>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                Led illow’s product strategy from 0-to-1 through its acquisition by BigID and global relaunch as BigID CMP Express.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-headline text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-stone-700 text-sm">workspace_premium</span>
                12+ G2 Badges
              </h4>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                Earned top recognitions for usability and implementation excellence (including Easiest Setup and High Performer) with a 4.8/5 average user rating.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-headline text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-stone-700 text-sm">public</span>
                Global Scale
              </h4>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                Architected systems supporting 250+ localized languages and processing millions of monthly visitors per account.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-headline text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-stone-700 text-sm">auto_awesome</span>
                AI Innovation
              </h4>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                Automated a database of 50,000+ cookies using AI and accelerated design workflows with the Figma MCP server.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full mb-10">
          {filteredCases.map((project, idx) => (
            <CaseStudyCard 
              key={project.id}
              project={project} 
              idx={idx} 
              onOpen={() => setSelectedProjectForModal(project)} 
            />
          ))}
        </div>

        {/* Co-Creation Game Case Study Card with Direct Live Demo Launch */}
        <div className="max-w-6xl mx-auto w-full">
          <PapelitoCaseCard onLaunchGame={() => {
            setActiveTab('GAMES');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
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
        onClose={() => setSelectedProjectForModal(null)} 
      />

      {/* Main View Transition */}
      <main className={`relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col pb-6 ${
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
            <p className={`font-headline text-[11px] font-black uppercase tracking-widest ${
              activeTab === 'GAMES' ? 'text-white' : 'text-neutral-950'
            }`}>
              Lia Parra. © 2026
            </p>
            <p className="text-[10px] uppercase tracking-wider font-bold">
              Senior Product &amp; UX Designer
            </p>
          </div>
          <div className="sm:text-right space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest font-black text-black">
              B2B SAAS, AI &amp; ENTERPRISE SYSTEMS
            </p>
            <a 
              href="https://linkedin.com/in/liangely-diseno-grafico" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold transition-colors mt-0.5 uppercase tracking-widest text-neutral-500 hover:text-neutral-800"
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
