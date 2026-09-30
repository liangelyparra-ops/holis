import React from 'react';

export const IllowDiagramBlock: React.FC = () => {
  return (
    <div className="bg-stone-50 border border-neutral-200/80 p-6 sm:p-8 rounded-2xl space-y-4 select-none my-6">
      <div className="overflow-x-auto">
        <div className="min-w-[640px] max-w-full mx-auto">
          <svg viewBox="0 0 760 260" xmlns="http://www.w3.org/2000/svg" width="100%" className="overflow-visible">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#525252"/>
              </marker>
            </defs>
            <g fontFamily="Inter, sans-serif" fontSize="12" fill="#171717">
              <rect x="20" y="110" width="120" height="46" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="80" y="136" textAnchor="middle" fill="#171717" className="font-semibold text-[11px]">Set permission</text>

              <rect x="190" y="110" width="140" height="46" fill="#ffffff" stroke="#171717" strokeWidth="2" rx="6" />
              <text x="260" y="131" textAnchor="middle" fill="#171717" className="font-bold text-[11px]">Conflict</text>
              <text x="260" y="145" textAnchor="middle" fill="#525252" className="text-[10px] opacity-90">detected inline</text>

              <rect x="380" y="30" width="150" height="46" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="455" y="51" textAnchor="middle" fill="#171717" className="font-semibold text-[11px]">Explain clash</text>
              <text x="455" y="65" textAnchor="middle" fill="#525252" className="text-[10px]">in plain language</text>

              <rect x="380" y="190" width="150" height="46" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="455" y="211" textAnchor="middle" fill="#171717" className="font-semibold text-[11px]">Offer 2 resolution</text>
              <text x="455" y="225" textAnchor="middle" fill="#525252" className="text-[10px]">paths</text>

              <rect x="580" y="110" width="150" height="46" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="655" y="131" textAnchor="middle" fill="#171717" className="font-semibold text-[11px]">Resolved &amp;</text>
              <text x="655" y="145" textAnchor="middle" fill="#525252" className="text-[10px]">saved</text>

              <rect x="580" y="0" width="150" height="46" fill="#f5f5f4" stroke="#a1a1aa" strokeDasharray="4 4" rx="6" strokeWidth="1.5" />
              <text x="655" y="21" textAnchor="middle" fill="#525252" className="font-medium text-[11px]">Exit mid-flow</text>
              <text x="655" y="35" textAnchor="middle" fill="#71717a" className="text-[10px]">→ partial save</text>
            </g>
            <path d="M140,133 L182,133" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none" />
            <path d="M330,120 L372,82" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none" />
            <path d="M330,146 L372,203" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none" />
            <path d="M530,60 L572,103" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none" />
            <path d="M530,210 L572,157" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none" />
            <path d="M655,76 L655,102" stroke="#71717a" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow)" fill="none" />
          </svg>
        </div>
      </div>
      <p className="text-center font-sans text-xs text-neutral-500 italic mt-2">
        Inline conflict resolution flow — replacing a hard block with explanation, resolution paths, and partial save.
      </p>
    </div>
  );
};

export const BigIDDiagramBlock: React.FC = () => {
  return (
    <div className="bg-stone-50 border border-neutral-200/80 p-6 sm:p-8 rounded-2xl space-y-4 select-none my-6">
      <div className="overflow-x-auto">
        <div className="min-w-[640px] max-w-full mx-auto">
          <svg viewBox="0 0 760 300" xmlns="http://www.w3.org/2000/svg" width="100%" className="overflow-visible">
            <defs>
              <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#525252"/>
              </marker>
            </defs>
            <g fontFamily="Inter, sans-serif" fontSize="12" fill="#171717">
              {/* before */}
              <text x="120" y="24" textAnchor="middle" fill="#525252" className="text-[10px] font-bold tracking-widest font-mono">BEFORE — FLAT RULESET</text>
              <rect x="30" y="40" width="180" height="46" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="120" y="66" textAnchor="middle" fill="#525252" className="text-[11px]">One rule layer for all tenants</text>

              {/* after */}
              <text x="580" y="24" textAnchor="middle" fill="#171717" className="text-[10px] font-bold tracking-widest font-mono">AFTER — LAYERED MODEL</text>
              <rect x="470" y="40" width="220" height="40" fill="#ffffff" stroke="#171717" rx="6" strokeWidth="2" />
              <text x="580" y="64" textAnchor="middle" fill="#171717" className="font-bold text-[11px]">Org-wide policy</text>

              <rect x="490" y="110" width="180" height="40" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="580" y="134" textAnchor="middle" fill="#171717" className="font-semibold text-[11px]">Business unit override</text>

              <rect x="510" y="180" width="140" height="40" fill="#ffffff" stroke="#d4d4d8" rx="6" strokeWidth="1.5" />
              <text x="580" y="204" textAnchor="middle" fill="#525252" className="text-[11px]">Regional exception</text>

              <path d="M580,80 L580,102" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow2)" fill="none"/>
              <path d="M580,150 L580,172" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow2)" fill="none"/>

              <path d="M240,63 L462,55" stroke="#71717a" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow2)" fill="none"/>
              <text x="350" y="46" textAnchor="middle" fill="#71717a" className="text-[10px] italic">restructured, not rebuilt</text>

              <rect x="220" y="230" width="320" height="46" fill="#f5f5f4" stroke="#a1a1aa" strokeDasharray="4 4" rx="6" strokeWidth="1.5" />
              <text x="380" y="250" textAnchor="middle" fill="#525252" className="text-[11px] font-medium">Same base components,</text>
              <text x="380" y="264" textAnchor="middle" fill="#71717a" className="text-[10px]">reused across all 3 layers</text>
            </g>
          </svg>
        </div>
      </div>
      <p className="text-center font-sans text-xs text-neutral-500 italic mt-2">
        Moving from a flat permission model to a layered one — reusing the same base components at every level instead of building three separate UIs.
      </p>
    </div>
  );
};

export const CookieLivePrototypeBlock: React.FC = () => {
  return (
    <div className="my-6 relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs">
      <iframe
        src="https://cookie-ai-assist.lovable.app"
        title="Cookie AI Classification Interactive Prototype"
        className="w-full h-full border-0"
        loading="lazy"
        allow="clipboard-write"
      />
    </div>
  );
};

export const BrandDiagramBlock: React.FC = () => {
  return (
    <div className="bg-stone-50 border border-neutral-200/80 p-6 sm:p-8 rounded-2xl space-y-4 select-none my-6">
      <div className="overflow-x-auto">
        <div className="min-w-[640px] max-w-full mx-auto text-center">
          <svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-stone-900 inline-block">
            <g fontFamily="Inter, sans-serif" fontSize="12" fill="#171717">
              {/* Central Node: Brand system */}
              <rect x="270" y="125" width="160" height="70" fill="#ffffff" stroke="#171717" strokeWidth="1.5" rx="8"/>
              <text x="350" y="154" textAnchor="middle" fill="#171717" fontWeight="600" fontSize="13">Brand System</text>
              <text x="350" y="172" textAnchor="middle" fill="#525252" fontSize="10">color · type · voice</text>

              {/* Connection Paths */}
              <path d="M270,145 L180,65" stroke="#71717a" strokeWidth="1.2" fill="none" />
              <path d="M430,145 L520,65" stroke="#71717a" strokeWidth="1.2" fill="none" />
              <path d="M270,175 L180,265" stroke="#71717a" strokeWidth="1.2" fill="none" />
              <path d="M430,175 L520,265" stroke="#71717a" strokeWidth="1.2" fill="none" />

              {/* Channels */}
              {/* Website */}
              <rect x="30" y="40" width="150" height="50" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" rx="6"/>
              <text x="105" y="70" textAnchor="middle" fontWeight="500">Website</text>

              {/* Paid Ads */}
              <rect x="520" y="40" width="150" height="50" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" rx="6"/>
              <text x="595" y="70" textAnchor="middle" fontWeight="500">Paid Ads</text>

              {/* Social Content */}
              <rect x="30" y="240" width="150" height="50" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" rx="6"/>
              <text x="105" y="270" textAnchor="middle" fontWeight="500">Social Content</text>

              {/* Product UI */}
              <rect x="520" y="240" width="150" height="50" fill="#ffffff" stroke="#d4d4d8" strokeWidth="1" rx="6"/>
              <text x="595" y="265" textAnchor="middle" fontWeight="500">Product UI</text>
              <text x="595" y="280" textAnchor="middle" fontSize="9" fill="#71717a">(later, case study 02)</text>
            </g>
          </svg>
        </div>
      </div>
      <p className="text-center font-sans text-xs text-neutral-500 italic mt-2">
        One shared system feeding every channel — not four separate visual languages.
      </p>
    </div>
  );
};

export const BrandGalleryBlock: React.FC = () => {
  return (
    <div className="space-y-6 select-none my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Identity — logo & color system */}
        <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xs hover:border-stone-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">01 • Identity</span>
            <span className="w-1.5 h-1.5 bg-stone-900 rounded-full shrink-0" />
          </div>
          <div className="space-y-3">
            {/* Mock Logo Mark */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-stone-900 flex items-center justify-center font-bold text-white text-xs font-headline">i</div>
              <span className="font-headline font-bold text-lg tracking-tight text-stone-900">illow</span>
            </div>
            {/* Color Palette bar */}
            <div className="flex gap-1.5 pt-2">
              <span className="w-5 h-5 rounded bg-stone-900 border border-stone-300" title="#171717" />
              <span className="w-5 h-5 rounded bg-stone-700 border border-stone-300" title="#44403c" />
              <span className="w-5 h-5 rounded bg-stone-100 border border-stone-300" title="#f5f5f4" />
              <span className="w-5 h-5 rounded bg-[#cfc6b4] border border-stone-300" title="#cfc6b4" />
            </div>
          </div>
          <p className="font-sans text-[11px] text-stone-600 leading-relaxed">Logo system, precise neutral tokens, and corporate typography rules.</p>
        </div>

        {/* Card 2: Website — landing page */}
        <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xs hover:border-stone-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">02 • Website</span>
            <span className="w-1.5 h-1.5 bg-stone-900 rounded-full shrink-0 animate-pulse" />
          </div>
          {/* Mock Browser Hero Screen */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2 text-left">
            <div className="flex gap-1">
              <span className="w-1 h-1 rounded-full bg-stone-400" />
              <span className="w-1 h-1 rounded-full bg-stone-400" />
              <span className="w-1 h-1 rounded-full bg-stone-400" />
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-stone-300 rounded w-16" />
              <div className="h-2.5 bg-stone-800 rounded w-24" />
              <div className="h-1 bg-stone-400 rounded w-20" />
            </div>
            <div className="h-4 bg-stone-900 rounded flex items-center justify-center text-[7px] text-white font-bold uppercase tracking-widest">Sign Up</div>
          </div>
          <p className="font-sans text-[11px] text-stone-600 leading-relaxed">Landing-page structure adapted to funnel-stage intent.</p>
        </div>

        {/* Card 3: Paid ad creative set */}
        <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xs hover:border-stone-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">03 • Paid Ads</span>
            <span className="material-symbols-outlined text-xs text-stone-900">ads_click</span>
          </div>
          {/* Mock display ad */}
          <div className="bg-stone-100 text-stone-900 p-3 rounded-lg border border-stone-200 space-y-2 flex flex-col justify-between h-24">
            <div className="space-y-1">
              <span className="font-mono text-[6px] uppercase tracking-wider bg-stone-200 px-1 py-0.5 rounded font-bold">B2B Privacy</span>
              <p className="font-headline font-semibold text-[9px] leading-tight">Privacy sells trust before it sells features.</p>
            </div>
            <div className="flex justify-between items-center text-[7px]">
              <span className="font-mono text-[5px] text-stone-600">B2B Privacy Product</span>
              <span className="bg-stone-900 text-white px-1.5 py-0.5 rounded font-bold">Learn More</span>
            </div>
          </div>
          <p className="font-sans text-[11px] text-stone-600 leading-relaxed">Modular templates allowing campaign variants in hours.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Card 4: Social content grid */}
        <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xs hover:border-stone-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">04 • Social Content Grid</span>
            <span className="material-symbols-outlined text-xs text-stone-900">grid_view</span>
          </div>
          {/* Mock social post layout previews */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-stone-50 border border-stone-200 rounded-lg p-2 aspect-square flex flex-col justify-between">
                <span className="text-[6px] font-mono text-stone-700 font-bold">POST 0{item}</span>
                <div className="space-y-0.5">
                  <div className="h-1 bg-stone-800 rounded w-full" />
                  <div className="h-1 bg-stone-400 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
          <p className="font-sans text-[11px] text-stone-600 leading-relaxed">Defined repeatable template guidelines designed to scale without handcrafting.</p>
        </div>

        {/* Card 5: Brand guidelines excerpt */}
        <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between h-56 shadow-xs hover:border-stone-400 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">05 • Brandbook Guidelines</span>
            <span className="material-symbols-outlined text-xs text-stone-900">auto_stories</span>
          </div>
          {/* Mock guideline specs */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center border-b border-stone-200 pb-1.5 text-[8px] font-mono text-stone-500">
              <span>Typography Pairing</span>
              <span className="text-emerald-700 font-bold">Active Specification</span>
            </div>
            <div className="space-y-1">
              <span className="font-headline font-bold text-[10px] text-stone-900 block">Syne Heavy (Display)</span>
              <span className="font-sans text-[8px] text-stone-700 block">Inter Regular (Paragraph / Meta)</span>
            </div>
          </div>
          <p className="font-sans text-[11px] text-stone-600 leading-relaxed">Unified tokens across typography pairings and UI layouts.</p>
        </div>
      </div>
    </div>
  );
};
