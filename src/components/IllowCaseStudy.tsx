import { useState } from 'react';
import { motion } from 'framer-motion';

interface IllowCaseStudyProps {
  onClose: () => void;
}

export function IllowCaseStudy({ onClose }: IllowCaseStudyProps) {
  // Mini-interactive states to showcase elite micro-UX and high-fidelity prototype detail
  const [toggleNecessary, setToggleNecessary] = useState(true);
  const [toggleStatistics, setToggleStatistics] = useState(true);
  const [toggleMarketing, setToggleMarketing] = useState(false);
  const [togglePreferences, setTogglePreferences] = useState(false);

  const [inputValue, setInputValue] = useState("illow.io");
  const [showModalAlert, setShowModalAlert] = useState(true);

  // Region controls for desktop layout preview
  const [activeTabRegion, setActiveTabRegion] = useState('region');

  return (
    <div className="relative font-body text-neutral-900 bg-[#f8f9ff] min-h-screen selection:bg-blue-200">
      {/* Scrollable View Navigation bar modeled after B2B SaaS layout */}
      <nav className="sticky top-0 z-40 bg-[#f8f9ff]/90 backdrop-blur-md border-b border-[#E5E5F0] flex items-center justify-between px-6 py-3.5 select-none">
        <div className="flex items-center gap-1.5 animate-fade-in">
     
          <span className="text-[10px] uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-200/50 font-bold font-mono px-2.5 py-0.5 rounded-md">
            UX Case Study
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-500 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
            B2B SaaS • Privacy Tech
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-3xs"
            title="Close Case Study"
          >
            <span className="material-symbols-outlined text-[18px] font-bold">close</span>
          </button>
        </div>
      </nav>

      {/* Hero Header Area */}
      <header className="relative bg-[#111113] text-white pt-16 pb-12 overflow-hidden select-none">
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-40 w-[600px] h-[600px] bg-[#2563eb]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[400px] bg-[#3b82f6]/5 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-6 relative z-10 text-left">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-blue-300">
            <span className="w-6 h-[1px] bg-[#2563eb]" /> Use Case 01 — Core Product Architecture
          </p>
          
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] max-w-3xl">
            Designing a <span className="italic text-[#2563eb] font-cursive lowercase">scalable</span> privacy SaaS platform from scratch.
          </h1>

          <p className="font-sans text-xs sm:text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed">
            How I translated dense global compliance regulations into an intuitive B2B product — and built the design system that took a startup all the way to acquisition.
          </p>

          {/* Technology and Domain Badges */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border border-blue-500/30 text-blue-300 bg-blue-950/20">
              Lead UX Designer
            </span>
            {["GDPR • CCPA • LGPD", "Design System", "B2B SaaS", "0 → 1 Product", "Acquisition"].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border border-neutral-800 text-neutral-300 bg-neutral-900/60 shadow-3xs hover:border-blue-500/30 transition-all duration-305">
                {tag}
              </span>
            ))}
          </div>

          {/* Visual Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-neutral-800 mt-6 text-left">
            <div className="space-y-1">
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight">
                40<span className="text-[#2563eb] font-light font-sans">+</span>
              </div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Core B2B Workflows Designed</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-neutral-800 sm:pl-6">
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight">
                1<span className="text-[#2563eb] font-light font-sans">×</span>
              </div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Shared Component Ecosystem</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-neutral-800 sm:pl-6">
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-1.5">
                <span className="text-sm mt-1 sm:mt-1.5 text-neutral-400 font-light font-sans">→</span>
                <span className="text-blue-300">BigID</span>
              </div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Commercial Acquisition</p>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 1: STRATEGIC BLUEPRINT */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 text-left">
        <div className="flex items-center gap-2 mb-4 select-none">
          <span className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-200 rounded animate-pulse">
            01
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
            Introduction & Strategic Alignment
          </span>
        </div>

        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-4">
          From regulation to roadmap.
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl mb-6 font-body">
          I didn&apos;t work from a polished brief. Working hand-in-hand with the CEO, I turned raw business goals, abstract data-privacy law, and engineering constraints into a tangible digital product — before any of it had a name.
        </p>

        {/* Role Pills */}
        <div className="flex flex-wrap gap-1.5 mb-8 select-none">
          {["Strategic Discovery", "Executive Collaboration", "Requirements Audit", "Feature Roadmapping", "UX Architecture"].map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono text-[#2563eb] bg-blue-50/50 border border-blue-100">
              {p}
            </span>
          ))}
        </div>

        {/* Blueprint flow system */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch select-none mt-4">
          {/* Input block */}
          <div className="bg-white border border-[#E5E5F0] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-[#2563eb]" />
            <div className="space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold font-mono uppercase bg-blue-50 border border-blue-200 text-[#2563eb]">
                ⬛ The Input
              </span>
              <div className="text-xl pl-0.5">📋</div>
              <h3 className="font-headline text-sm font-bold text-neutral-900">Raw Legal & Tech Complexity</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-body">
                Global compliance frameworks (GDPR, CCPA, LGPD) and engineering telemetry data initially existed only as fragmented legal documents and abstract database parameters.
              </p>
            </div>
            <div className="flex gap-1.5 pt-4">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wide border border-blue-100 text-[#2563eb] bg-blue-50/50">GDPR</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wide border border-blue-100 text-[#2563eb] bg-blue-50/50">CCPA</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wide border border-emerald-200 text-emerald-600 bg-emerald-50">ENG</span>
            </div>
          </div>

          {/* Alignment block */}
          <div className="bg-white border border-[#E5E5F0] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
            <div className="space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold font-mono uppercase bg-blue-50 border border-blue-200 text-[#2563eb]">
                ⟳ The Alignment
              </span>
              <div className="text-xl pl-0.5">🤝</div>
              <h3 className="font-headline text-sm font-bold text-neutral-900">The Strategic Partnership</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-body">
                Working directly alongside the CEO, we ran bi-directional audits of requirements, broke down business goals vs. user friction, and defined a prioritized feature roadmap through interactive sessions.
              </p>
            </div>
            {/* Interactive Venn representation */}
            <div className="flex items-center justify-center -space-x-3 pt-4 h-12">
              <div className="w-10 h-10 rounded-full border border-blue-200 bg-blue-100/40 text-[7px] text-[#2563eb] font-bold flex items-center justify-center text-center leading-none">
                CEO<br/>STRAT
              </div>
              <div className="w-6 h-6 rounded-full border border-emerald-300 bg-emerald-100 text-[10px] text-emerald-700 font-bold flex items-center justify-center z-10 shadow-3xs">
                ✓
              </div>
              <div className="w-10 h-10 rounded-full border border-blue-200 bg-blue-100/40 text-[7px] text-[#2563eb] font-bold flex items-center justify-center text-center leading-none">
                LEAD<br/>UX
              </div>
            </div>
          </div>

          {/* Output block */}
          <div className="bg-white border border-[#E5E5F0] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-[#2563eb]" />
            <div className="space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold font-mono uppercase bg-blue-50 border border-blue-200 text-blue-700">
                📤 The Output
              </span>
              <div className="text-xl pl-0.5">⚙️</div>
              <h3 className="font-headline text-sm font-bold text-neutral-900">Intuitive UX Framework</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-body">
                Abstract legal parameters translated into structural interface flows, defined navigation patterns, and a core component architecture — the foundation for 40+ complex B2B workflows.
              </p>
            </div>
            {/* Direct miniature UI diagram representation */}
            <div className="bg-blue-50 border border-blue-100/60 rounded-lg p-2 flex gap-1.5 mt-3 select-none">
              <div className="w-6 flex flex-col gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                <div className="h-1 bg-blue-200 rounded" />
                <div className="h-1 bg-blue-200 rounded w-4" />
                <div className="h-1 bg-blue-200 rounded w-3" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-1 bg-[#2563eb] rounded" />
                <div className="h-1 bg-blue-300 rounded w-10" />
                <div className="h-1 bg-blue-300 rounded w-12" />
                <div className="h-1 bg-blue-400 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DESIGN SYSTEM (DARK BEAUTIFUL ATOMIC SYSTEM) */}
      <section className="bg-[#111113] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-left space-y-8">
          <div className="flex items-center gap-2 select-none">
            <span className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest text-[#2563eb] bg-blue-950/40 border border-blue-900 rounded">
              02
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400">
              Foundation: Unified Design System
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Atoms first. Chaos eliminated.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl font-body">
              Every startup eventually drowns in UX inconsistency. The answer was a fully atomic component library — built so engineering pods could ship features without waiting for design to re-specify every interaction state.
            </p>
          </div>

          {/* Atoms interactive grid showcasing exquisite UI fidelity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800 rounded-xl overflow-hidden border border-neutral-800 shadow-xl">
            
            {/* Buttons Component Box */}
            <div className="bg-[#161618]/90 border border-neutral-800/20 p-5 rounded-lg flex flex-col justify-between shadow-2xs">
              <div>
                <span className="font-mono text-[8px] text-blue-400 tracking-widest uppercase block mb-3 font-semibold select-none">
                  Buttons — States
                </span>
                <div className="space-y-2.5 select-none font-body">
                  <div className="py-2 px-3 rounded-lg bg-[#2563eb] text-center text-[10.5px] font-bold text-white cursor-pointer hover:bg-[#1d4ed8] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xs">
                    Reject All
                  </div>
                  <div className="py-2 px-3 rounded-lg border border-blue-500/30 text-center text-[10.5px] font-semibold text-blue-300 cursor-pointer hover:bg-blue-950/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                    Save Preferences
                  </div>
                  <div className="py-2 px-3 rounded-lg border border-neutral-800 text-center text-[10.5px] font-semibold text-neutral-400 cursor-pointer hover:bg-neutral-900/40 transition-all hover:scale-[1.01] active:scale-[0.99]">
                    Learn More
                  </div>
                  <div className="py-2 px-3 rounded-lg border border-blue-500/30 bg-blue-950/20 text-center text-[10.5px] font-bold text-blue-300 cursor-pointer hover:bg-red-905/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
                    Delete Domain
                  </div>
                </div>
              </div>
            </div>

            {/* Toggles Component Box - Real live interactive state triggers */}
            <div className="bg-[#161618]/90 border border-neutral-800/20 p-5 rounded-lg flex flex-col justify-between shadow-2xs">
              <div>
                <span className="font-mono text-[8px] text-blue-400 tracking-widest uppercase block mb-3 font-semibold select-none">
                  Toggles — Consent Controls
                </span>
                <div className="space-y-3.5 mt-1 text-[11px] text-neutral-300 select-none font-body">
                  <div className="flex items-center justify-between">
                    <span>Necessary (Locked)</span>
                    <div className="relative w-8 h-4 bg-[#2563eb] rounded-full cursor-not-allowed">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Statistics</span>
                    <button 
                      type="button"
                      onClick={() => setToggleStatistics(!toggleStatistics)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none ${toggleStatistics ? 'bg-[#2563eb]' : 'bg-neutral-800'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${toggleStatistics ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Marketing</span>
                    <button 
                      type="button"
                      onClick={() => setToggleMarketing(!toggleMarketing)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none ${toggleMarketing ? 'bg-[#2563eb]' : 'bg-neutral-800'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${toggleMarketing ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Preferences</span>
                    <button 
                      type="button"
                      onClick={() => setTogglePreferences(!togglePreferences)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none ${togglePreferences ? 'bg-[#2563eb]' : 'bg-neutral-800'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${togglePreferences ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Validation inputs block with focused trigger mockup */}
            <div className="bg-[#1a1919] p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[7px] text-blue-500 tracking-widest uppercase block mb-3 font-semibold">
                  Inputs — Form Validation
                </span>
                <div className="space-y-2 text-[10.5px]">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#111113] border border-neutral-800 hover:border-neutral-700 rounded px-2.5 py-1.5 focus:border-[#2563eb] focus:outline-none transition-colors text-white" 
                  />
                  <div className="w-full bg-[#111113] border border-[#2563eb] rounded px-2.5 py-1.5 flex items-center justify-between text-blue-300">
                    <span>illow.io</span>
                    <span className="text-[#2563eb]">✓</span>
                  </div>
                  <div className="w-full bg-[#111113] border border-red-500/50 rounded px-2.5 py-1.5 flex items-center justify-between text-blue-300">
                    <span>invalid domain...</span>
                    <span>✕</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Settings Cards */}
            <div className="bg-[#161618]/90 border border-neutral-800/20 p-5 rounded-lg flex flex-col justify-between shadow-2xs">
              <div>
                <span className="font-mono text-[8px] text-blue-400 tracking-widest uppercase block mb-3 font-semibold select-none">
                  Settings Cards
                </span>
                <div className="space-y-2 text-[10px] select-none text-neutral-300 font-body">
                  <div className="bg-[#111113] border border-neutral-800 p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span>GDPR Banner</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Active</span>
                  </div>
                  <div className="bg-[#111113] border border-neutral-800 p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span>US Opt-Out Banner</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Active</span>
                  </div>
                  <div className="bg-[#111113] border border-neutral-800 p-2.5 rounded-lg flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-700" />
                      <span>Global Privacy Portal</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Disabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badges Group */}
            <div className="bg-[#161618]/90 border border-neutral-800/20 p-5 rounded-lg flex flex-col justify-between shadow-2xs">
              <div>
                <span className="font-mono text-[8px] text-blue-400 tracking-widest uppercase block mb-3 font-semibold select-none">
                  Status Badges
                </span>
                <div className="flex flex-wrap gap-1.5 select-none font-mono text-[8px]">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-950/40 border border-blue-900/50 text-blue-300">GDPR</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 font-semibold">Active</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-950/40 border border-purple-900/50 text-purple-300">DSR Form</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-neutral-900 border border-neutral-800 text-neutral-400">Unclassified</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 font-semibold">Protected</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-950/45 border border-blue-900/50 text-blue-300">TCF v2.2</span>
                </div>
              </div>
            </div>

            {/* Interactive Destructive Modal Sample inside mock container */}
            <div className="bg-[#161618]/90 border border-neutral-800/20 p-5 rounded-lg flex flex-col justify-between shadow-2xs">
              <div>
                <span className="font-mono text-[8px] text-blue-400 tracking-widest uppercase block mb-3 font-semibold select-none">
                  Destructive Confirmation
                </span>
                {showModalAlert ? (
                  <div className="bg-[#111113] border border-red-500/20 p-2.5 rounded text-left space-y-2 font-body">
                    <div className="text-[10px] font-black text-white flex items-center gap-1.5">
                      <span className="text-red-400">⚠</span> Block all cookies?
                    </div>
                    <p className="text-[9px] text-neutral-400 leading-snug">
                      User scripts will be blocked until explicit consent. Action immediate.
                    </p>
                    <div className="flex justify-end gap-1.5 text-[8.5px] font-bold pt-1">
                      <button 
                        type="button"
                        onClick={() => setShowModalAlert(false)}
                        className="py-1 px-2.5 bg-red-900/30 text-blue-300 border border-red-800/40 rounded transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowModalAlert(false)}
                        className="py-1 px-1.5 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 font-body">
                    <button 
                      type="button"
                      onClick={() => setShowModalAlert(true)} 
                      className="text-[10px] uppercase tracking-wider font-mono px-2.5 py-1 rounded border border-neutral-800 text-neutral-300 hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      Show Prototype Alert
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          <p className="text-xs text-neutral-450 italic pt-1 max-w-2xl select-text leading-normal">
            <strong className="text-white not-italic font-semibold">Engineering impact:</strong> By standardizing atoms into reusable tokens, engineering pods eliminated repeated design clarification cycles — the same toggle component rendered consent modals, cookie banners, and settings panels with zero re-specification.
          </p>
        </div>
      </section>

      {/* SECTION 3: FEATURE DENSITY & COGNITIVE PROGRESSION */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 text-left">
        <div className="flex items-center gap-2 mb-4 select-none">
          <span className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-200 rounded">
            03
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
            Feature Mapping & Information Density
          </span>
        </div>

        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-4">
          Complex data, zero overwhelm.
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl mb-8 font-body">
          Data privacy demands multi-step flows, per-region configurations, and intricate toggle hierarchies. I used progressive disclosure and responsive layout logic to make every screen feel navigable regardless of the cognitive load underneath.
        </p>

        {/* Dynamic Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Desktop Region control frame simulation */}
          <div className="bg-white border border-[#E5E5F0] rounded-xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-headline text-sm font-bold text-neutral-900 tracking-tight">
              Desktop — Multi-Region Banner Control
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-body">
              Users manage GDPR, CCPA, and global consent rules from a single interface. Tab navigation isolates complexity without losing system context.
            </p>

            {/* Simulated Desktop frame with tabs */}
            <div className="bg-[#111113] border border-neutral-800 rounded-lg p-3 text-white">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              </div>
              <div className="bg-[#1a1919] rounded p-2.5 space-y-3">
                {/* Mini interactive tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 border-b border-neutral-800 select-none text-[8.5px]">
                  <button 
                    onClick={() => setActiveTabRegion('region')}
                    className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTabRegion === 'region' ? 'bg-[#2563eb] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    Banners
                  </button>
                  <button 
                    onClick={() => setActiveTabRegion('cookie')}
                    className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTabRegion === 'cookie' ? 'bg-[#2563eb] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    Scans
                  </button>
                  <button 
                    onClick={() => setActiveTabRegion('policies')}
                    className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTabRegion === 'policies' ? 'bg-[#2563eb] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    Policies
                  </button>
                </div>

                {activeTabRegion === 'region' ? (
                  <div className="space-y-2 text-[10px]">
                    <div className="flex items-center justify-between border-b border-neutral-800 py-1">
                      <span className="text-neutral-300">EU & UK Legislation</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-950/40 text-blue-300 border border-blue-900/40">GDPR</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 py-1">
                      <span className="text-neutral-300">California, Virginia</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-900/40">US Opt-Out</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 py-1">
                      <span className="text-neutral-300">Brazil Regulation</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-950/40 text-blue-300 border border-blue-900/40">LGPD</span>
                    </div>
                  </div>
                ) : activeTabRegion === 'cookie' ? (
                  <div className="space-y-1.5 text-[9.5px] py-1 text-center text-neutral-400">
                    <p>✓ Monthly Automated Domain Deep scan complete.</p>
                    <div className="bg-neutral-900 border border-neutral-800 p-1.5 rounded text-[9px] text-left text-neutral-300 font-mono">
                      No tracking cookies unclassified
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 py-1 text-[10px] text-neutral-300">
                    <div className="flex justify-between">
                      <span>Cookie Statement Link</span>
                      <span className="text-blue-300">Manage link</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GDPR Compliance Policy</span>
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile progressive displacement visualization */}
          <div className="bg-white border border-[#E5E5F0] rounded-xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-headline text-sm font-bold text-neutral-900 tracking-tight">
              Mobile — Progressive Disclosure Accordions
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-body">
              On smaller viewports, the same regulatory depth is accessible through a single-column accordion -- no information loss, all the clarity.
            </p>

            {/* Mobile layout simulation mockups side-by-side */}
            <div className="flex gap-3 justify-center pt-2 select-none">
              
              {/* Phone screen 1 */}
              <div className="w-24 bg-[#111113] rounded-xl p-2 border border-neutral-800 text-[8px] text-white">
                <div className="w-7 h-1.5 bg-neutral-800 rounded-full mx-auto mb-2.5" />
                <div className="space-y-1.5 text-left bg-[#1a1919] p-1.5 rounded">
                  <div className="h-1 bg-neutral-800 rounded w-full" />
                  <div className="h-1 bg-neutral-800 rounded w-3/4" />
                  <div className="h-px bg-neutral-800 my-1" />
                  <div className="h-1.5 bg-[#2563eb] rounded w-full" />
                  <div className="h-1 bg-neutral-800 rounded w-1/2" />
                  <div className="h-px bg-neutral-800 my-1" />
                  <div className="flex items-center justify-between text-[6.5px]">
                    <span className="text-neutral-400">Cookie Block</span>
                    <span className="w-3.5 h-2 rounded-full bg-[#2563eb] flex items-center justify-end px-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone screen 2 */}
              <div className="w-24 bg-[#111113] rounded-xl p-2 border border-neutral-800 text-[8px] text-white">
                <div className="w-7 h-1.5 bg-neutral-800 rounded-full mx-auto mb-2.5" />
                <div className="space-y-1.5 text-left bg-[#1a1919] p-1.5 rounded">
                  <span className="text-blue-300 tracking-wider font-bold block text-[5.5px]">YOUR PREFERENCES</span>
                  <div className="h-1.5 bg-emerald-600 rounded w-full" />
                  <div className="h-1 bg-neutral-800 rounded w-2/3" />
                  <div className="h-px bg-neutral-800 my-1" />
                  <div className="flex items-center justify-between text-[6.5px] pt-0.5">
                    <span className="text-neutral-400">Marketing</span>
                    <span className="w-3.5 h-2 rounded-full bg-neutral-800 flex items-center justify-start px-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[6.5px] pt-1 border-t border-neutral-800">
                    <span className="text-neutral-400 font-semibold">Analytics</span>
                    <span className="w-3.5 h-2 rounded-full bg-[#2563eb] flex items-center justify-end px-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <div className="w-full h-px bg-[#E5E5F0]" />

      {/* SECTION 4: ERROR STATES & UX GUARDRAILS */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 text-left">
        <div className="flex items-center gap-2 mb-4 select-none">
          <span className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-200 rounded">
            04
          </span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">
            Error States & UX Guardrails
          </span>
        </div>

        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-4">
          Design for the moment things go wrong.
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl mb-8 font-body">
          In a compliance product, a misunderstood toggle can create legal exposure. Every high-stakes action was paired with micro-copy, confirmation gates, and success feedback — so users act with confidence, not anxiety.
        </p>

        {/* States Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 select-none">
          <div className="bg-white border border-[#E5E5F0] rounded-xl p-4 text-center space-y-2 shadow-2xs">
            <div className="w-9 h-9 mx-auto rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-sm">
              ⚠️
            </div>
            <h4 className="text-[11px] font-bold text-neutral-800 font-sans tracking-wide">Warning State</h4>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans font-body">
              Surfaces before any destructive or legally-sensitive action.
            </p>
          </div>

          <div className="bg-white border border-[#E5E5F0] rounded-xl p-4 text-center space-y-2 shadow-2xs">
            <div className="w-9 h-9 mx-auto rounded-lg bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-sm">
              🔒
            </div>
            <h4 className="text-[11px] font-bold text-neutral-800 font-sans tracking-wide">Confirmation Gate</h4>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans font-body">
              Two-step confirmation modal prevents accidental actions.
            </p>
          </div>

          <div className="bg-white border border-[#E5E5F0] rounded-xl p-4 text-center space-y-2 shadow-2xs">
            <div className="w-9 h-9 mx-auto rounded-lg bg-red-50 border border-red-200/40 flex items-center justify-center text-sm">
              ✕
            </div>
            <h4 className="text-[11px] font-bold text-neutral-800 font-sans tracking-wide">Validation Error</h4>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans font-body">
              Inline plain-language guidance — never a vague, generic code.
            </p>
          </div>

          <div className="bg-white border border-[#E5E5F0] rounded-xl p-4 text-center space-y-2 shadow-2xs">
            <div className="w-9 h-9 mx-auto rounded-lg bg-blue-50 border border-blue-200/50 flex items-center justify-center text-sm text-[#2563eb]">
              ✓
            </div>
            <h4 className="text-[11px] font-bold text-neutral-800 font-sans tracking-wide">Success feedback</h4>
            <p className="text-[10px] text-neutral-500 leading-normal font-sans font-body">
              Immediate feedback confirms: &quot;Cookie policy saved.&quot;
            </p>
          </div>
        </div>

        {/* Interaction Flow Path Mini representation */}
        <div className="mt-8 bg-white border border-[#E5E5F0] rounded-2xl p-5 select-none text-left shadow-2xs">
          <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-500 block mb-4 font-bold">
            Interaction Flow — Destructive Toggle Path
          </span>
          <div className="flex overflow-x-auto gap-4 items-center pb-2">
            <div className="flex flex-col items-center gap-2 min-w-[100px] shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-200 text-[#2563eb] flex items-center justify-center text-xs">🎛</div>
              <span className="text-[9px] font-medium text-neutral-700 text-center leading-normal font-body">User adjusts toggle</span>
            </div>
            <span className="text-neutral-300 font-mono">→</span>
            <div className="flex flex-col items-center gap-2 min-w-[100px] shrink-0">
              <div className="w-10 h-10 rounded-full bg-orange-50 border-2 border-orange-200 text-orange-600 flex items-center justify-center text-xs">⚠️</div>
              <span className="text-[9px] font-medium text-neutral-700 text-center leading-normal font-body">Alert modal surfaces</span>
            </div>
            <span className="text-neutral-300 font-mono">→</span>
            <div className="flex flex-col items-center gap-2 min-w-[100px] shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-50 border-2 border-purple-200 text-purple-600 flex items-center justify-center text-xs">📋</div>
              <span className="text-[9px] font-medium text-neutral-700 text-center leading-normal font-body">Validation path shown</span>
            </div>
            <span className="text-neutral-300 font-mono">→</span>
            <div className="flex flex-col items-center gap-2 min-w-[100px] shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#f0f5ff] border-2 border-blue-200 text-[#2563eb] flex items-center justify-center text-xs">✅</div>
              <span className="text-[9px] font-medium text-neutral-700 text-center leading-normal font-body">Dynamic success logs</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: OUTCOMES (DARK OUTCOME SECTIONS) */}
      <section className="bg-[#111113] text-white py-12 sm:py-16 animate-fade-in">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-left space-y-8">
          <div className="flex items-center gap-2 select-none">
            <span className="font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest text-[#2563eb] bg-blue-950/40 border border-blue-900 rounded">
              05
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400">
              Business Outcome
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Design velocity that earned acquisition.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl font-body">
              A modular system and user-tested platform gave the team one thing most startups never have: the ability to ship features faster than the market expected. That maturity didn&apos;t go unnoticed.
            </p>
          </div>

          {/* Outcomes visual dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-neutral-900/45 border border-neutral-800/80 rounded-xl p-5 text-left relative overflow-hidden shadow-2xs">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                40<span className="text-[#2563eb] font-light font-sans">+</span>
              </div>
              <p className="text-xs font-bold text-neutral-300 tracking-wide mb-1 font-sans">Core Workflows Delivered</p>
              <p className="text-[10.5px] text-neutral-500 leading-relaxed font-sans mt-1">
                From cookie banners and DSR forms to multi-domain consent management — all built on a single shared component foundation.
              </p>
            </div>

            <div className="bg-neutral-900/45 border border-neutral-800/80 rounded-xl p-5 text-left relative overflow-hidden shadow-2xs">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                ↓ Friction
              </div>
              <p className="text-xs font-bold text-neutral-300 tracking-wide mb-1 font-sans">Engineering Handoff Optimized</p>
              <p className="text-[10.5px] text-neutral-500 leading-relaxed font-sans mt-1">
                Atomic components with documented states eliminated re-specification cycles between design and engineering pods across the product.
              </p>
            </div>

            <div className="bg-neutral-900/45 border border-neutral-800/80 rounded-xl p-5 text-left relative overflow-hidden shadow-2xs">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                1<span className="text-[#2563eb] font-light font-sans">×</span>
              </div>
              <p className="text-xs font-bold text-neutral-300 tracking-wide mb-1 font-sans">Unified Visual Language</p>
              <p className="text-[10.5px] text-neutral-500 leading-relaxed font-sans mt-1">
                One design system governed every surface — consent banners, settings dashboards, privacy portals, DSR flows, and pricing — cohesive at scale.
              </p>
            </div>

            <div className="bg-neutral-900/45 border border-neutral-800/80 rounded-xl p-5 text-left relative overflow-hidden shadow-2xs">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563eb] to-[#3b82f6]" />
              <div className="font-headline text-3xl sm:text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-1">
                ✓ <span className="text-sm tracking-widest text-[#10B981] font-mono select-none uppercase font-bold text-emerald-450">Live</span>
              </div>
              <p className="text-xs font-bold text-neutral-300 tracking-wide mb-1 font-sans">3,000+ Clients Served</p>
              <p className="text-[10.5px] text-neutral-500 leading-relaxed font-sans mt-1">
                B2B code snippet active on thousands of international clients&apos; domains, ensuring fast loading and legal robustness.
              </p>
            </div>

          </div>

          {/* Acquisition Callout Box */}
          <div className="bg-gradient-to-br from-neutral-900 to-[#111113] border border-neutral-800 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-6 select-none shadow-md">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-950 border border-blue-900 text-[10px] font-bold tracking-wider text-blue-300 uppercase shrink-0">
                  Exit Milestone
                </span>
                <span className="text-xs text-neutral-500 tracking-tight font-serif italic">
                  Acquired by BigID
                </span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-black text-white tracking-tight">
                Product Maturity Built to Scaler Standards
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 max-w-xl leading-relaxed">
                The visual robustness, high design QA standards, and comprehensive component taxonomy helped positioning the platform as a key strategic takeover asset for BigID.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-3xs"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
