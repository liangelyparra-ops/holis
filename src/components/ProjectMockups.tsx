import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Eye, 
  BarChart3, 
  CheckCircle2, 
  ChevronRight, 
  Layout, 
  Palette, 
  Database,
  Sliders,
  Type,
  Maximize2
} from 'lucide-react';

// ==========================================
// MOCKUP TYPE 1: Analytics & Conversion Dashboard Panel
// ==========================================
export const AnalyticsMockup: React.FC = () => {
  return (
    <div className="w-full bg-stone-50 text-stone-900 rounded-2xl border border-stone-200/80 p-5 font-sans space-y-4 shadow-xs overflow-hidden mt-4 text-left">
      {/* Browser bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 -mt-2 -mx-2">
        <div className="flex gap-1.5 items-center pl-1">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-stone-300 block" />
        </div>
        <div className="bg-stone-100 px-4 py-0.5 rounded-md text-[9px] text-stone-600 font-mono tracking-wide w-[180px] text-center truncate border border-stone-200">
          admin.illow.co/analytics
        </div>
        <div className="w-3" />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 font-mono">Consent Analytics</h4>
          <p className="text-sm font-semibold text-stone-900">Opt-In Performance Suite</p>
        </div>
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full">
          Live Syncing <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        </span>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-stone-200 p-3 rounded-xl space-y-1 shadow-2xs">
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Opt-in Conversion Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-stone-900">94.8%</span>
            <span className="text-emerald-700 text-[10px] font-bold flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +12.4%
            </span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-stone-900 h-full rounded-full" style={{ width: '94.8%' }} />
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-3 rounded-xl space-y-1 shadow-2xs">
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Privacy Interaction Time</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-stone-900">1.2s</span>
            <span className="text-emerald-700 text-[10px] font-bold flex items-center">
              Down 40%
            </span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '30%' }} />
          </div>
        </div>
      </div>

      {/* Sparkline simulation area */}
      <div className="bg-white border border-stone-200 p-3 rounded-xl space-y-3 shadow-2xs">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-semibold text-stone-800">Audits &amp; Compliances Over Time</span>
          <span className="text-stone-500 font-mono">Completed: 14.8k / 15k</span>
        </div>
        
        {/* Custom pure Tailwind micro-graph bars */}
        <div className="flex items-end justify-between h-14 pt-2 px-1">
          {[20, 35, 45, 30, 55, 65, 40, 75, 80, 95, 85, 98].map((height, idx) => (
            <div key={idx} className="w-[6%] bg-stone-100 hover:bg-stone-200 rounded-sm relative group h-full">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-stone-900 rounded-sm transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-stone-500 font-mono">
          <span>00:00</span>
          <span>08:00</span>
          <span>16:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MOCKUP TYPE 2: Interactive Wireframe & Field Configuration Canvas
// ==========================================
export const WireframeMockup: React.FC = () => {
  return (
    <div className="w-full bg-neutral-50 text-neutral-900 rounded-2xl border border-neutral-200/80 p-5 font-sans space-y-4 shadow-sm mt-4">
      {/* Wireframe Identifier */}
      <div className="flex justify-between items-center">
        <div className="inline-flex items-center gap-1.5 bg-neutral-200/50 text-neutral-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          <Layout className="w-2.5 h-2.5" /> Wireframe Component
        </div>
        <span className="text-[10px] font-mono text-neutral-400">ID: CN-WIRE-402</span>
      </div>

      {/* Main wireframe interactive dialog card simulation */}
      <div className="border border-neutral-300/80 bg-white rounded-xl p-4 shadow-xs space-y-3.5 relative">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#2563eb] bg-blue-50 px-1.5 py-0.5 rounded">Consent Banner Model</span>
            <h5 className="text-xs font-bold text-neutral-800">Choose cookie classification preferences</h5>
          </div>
          <span className="w-2   h-2 bg-neutral-300 rounded-full" />
        </div>

        {/* Categories checklist simulation */}
        <div className="space-y-2">
          {/* Item 1 */}
          <div className="flex justify-between items-center p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div>
                <p className="text-[11px] font-semibold text-neutral-800">Strictly Necessary Cookies</p>
                <p className="text-[9px] text-neutral-400 leading-none">Core site mechanics & security</p>
              </div>
            </div>
            {/* Disabled switch wireframe */}
            <div className="w-7 h-4 bg-[#2563eb] rounded-full p-0.5 flex justify-end cursor-not-allowed opacity-85">
              <span className="w-3 h-3 bg-white rounded-full block" />
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex justify-between items-center p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <div>
                <p className="text-[11px] font-semibold text-neutral-800">Performance & Analytical</p>
                <p className="text-[9px] text-neutral-400 leading-none">Measures visit volume & paths</p>
              </div>
            </div>
            {/* Active switch wireframe */}
            <div className="w-7 h-4 bg-neutral-300 rounded-full p-0.5 flex justify-start cursor-pointer hover:bg-neutral-400 transition-colors">
              <span className="w-3 h-3 bg-white rounded-full block shadow-sm" />
            </div>
          </div>
        </div>

        {/* Dialog confirmation actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider rounded-md text-neutral-600 transition-all">
            Customize
          </button>
          <button className="px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[10px] font-bold uppercase tracking-wider rounded-md transition-all">
            Save & Allow
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MOCKUP TYPE 3: Design Tokens System Style Kit
// ==========================================
export const DesignTokensMockup: React.FC = () => {
  return (
    <div className="w-full bg-white text-neutral-900 rounded-2xl border border-neutral-200/80 p-5 font-sans space-y-4 shadow-sm mt-4">
      {/* Design System Identification */}
      <div className="flex justify-between items-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#2563eb] text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          <Palette className="w-2.5 h-2.5" /> Design System Tokens
        </div>
        <span className="text-[10px] font-mono text-neutral-400">Ver 2.1 • Coded Swatches</span>
      </div>

      <div className="space-y-3.5">
        {/* Swatch grid */}
        <div>
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Palette Color Swatches</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { hex: '#2563eb', name: 'Rose Dark', bg: 'bg-[#2563eb]', text: 'text-white' },
              { hex: '#1d4ed8', name: 'Rose Deep', bg: 'bg-[#1d4ed8]', text: 'text-white' },
              { hex: '#3b82f6', name: 'Rose Bright', bg: 'bg-[#3b82f6]', text: 'text-white' },
              { hex: '#f0f5ff', name: 'Rose Light', bg: 'bg-[#f0f5ff]', text: 'text-neutral-800' }
            ].map((swatch, idx) => (
              <div key={idx} className="bg-neutral-50/70 border border-neutral-200/60 p-1.5 rounded-lg space-y-1.5">
                <div className={`h-8 w-full rounded ${swatch.bg} flex items-center justify-center`} />
                <div className="text-[8px] leading-tight text-center">
                  <p className="font-bold text-neutral-800 truncate">{swatch.name}</p>
                  <p className="font-mono text-neutral-400 truncate">{swatch.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons & States components */}
        <div>
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5">Reactive Interactive Components</span>
          <div className="grid grid-cols-2 gap-2">
            {/* Primary active component */}
            <div className="bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl space-y-1 text-center">
              <span className="text-[7.5px] font-semibold text-neutral-400 uppercase tracking-wider block">Btn-Primary (Default)</span>
              <button className="w-full py-1.5 bg-[#2563eb] text-white rounded-md text-[9px] uppercase font-bold tracking-wider cursor-pointer hover:bg-[#1d4ed8] transition-all">
                Submit Data
              </button>
            </div>
            {/* Action secondary component */}
            <div className="bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl space-y-1 text-center">
              <span className="text-[7.5px] font-semibold text-neutral-400 uppercase tracking-wider block">Btn-Secondary (Border)</span>
              <button className="w-full py-1.5 border border-[#2563eb] text-[#2563eb] hover:bg-blue-50/50 rounded-md text-[9px] uppercase font-bold tracking-wider cursor-pointer transition-all">
                Cancel Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MOCKUP TYPE 4: Enterprise Layered Hierarchy Configuration Model
// ==========================================
export const EnterpriseHierarchyMockup: React.FC = () => {
  return (
    <div className="w-full bg-stone-50 text-stone-900 rounded-2xl border border-stone-200/80 p-5 font-sans space-y-4 shadow-xs overflow-hidden mt-4 text-left">
      {/* Browser bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 -mt-2 -mx-2">
        <div className="flex gap-1.5 items-center pl-1 select-none">
          <span className="w-2 h-2 rounded-full bg-stone-300 block" />
          <span className="w-2 h-2 rounded-full bg-stone-300 block" />
          <span className="w-2 h-2 rounded-full bg-stone-300 block" />
        </div>
        <div className="bg-stone-100 px-4 py-0.5 rounded-md text-[9px] text-stone-600 font-mono tracking-wide w-[220px] text-center truncate border border-stone-200 select-none">
          admin.bigid.com/governance/layers
        </div>
        <div className="w-3" />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-stone-900 font-mono">Layered Rule Engine</h4>
          <p className="text-xs font-semibold text-stone-700">Multi-Tenant Consent Architecture</p>
        </div>
        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 border border-stone-200 text-[9px] font-mono px-2 py-0.5 rounded-full select-none">
          Nest Depth: 3L <Sliders className="w-2.5 h-2.5 text-stone-700" />
        </span>
      </div>

      {/* Structured Layer Stack */}
      <div className="space-y-2.5">
        {/* Layer 1: Org Wide */}
        <div className="border border-stone-200 bg-white rounded-xl p-3 relative space-y-2 shadow-2xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-stone-100 border border-stone-300 flex items-center justify-center text-[8px] font-bold font-mono text-stone-900 select-none">L1</span>
              <div>
                <p className="text-[11px] font-bold text-stone-900">Global Org-Wide Policy</p>
                <p className="text-[9px] text-stone-500">Default baseline rules applied to 42 subsidiaries</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider select-none font-bold">Locked</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[8px] font-mono px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 rounded select-none">GDPR Default</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 rounded select-none">CCPA Default</span>
          </div>
        </div>

        {/* Layer 2: Business Unit Override */}
        <div className="border border-stone-200 bg-white rounded-xl p-3 relative space-y-2 ml-4 border-l-2 border-l-stone-900 shadow-2xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-stone-900 text-white flex items-center justify-center text-[8px] font-bold font-mono select-none">L2</span>
              <div>
                <p className="text-[11px] font-bold text-stone-900">Retail BU Override</p>
                <p className="text-[9px] text-stone-500">Marketing &amp; behavioral tracking permission tweaks</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold select-none">Active Override</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[8px] font-mono px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-800 font-bold rounded select-none">Custom Pixel Consent</span>
          </div>
        </div>

        {/* Layer 3: Regional Exception */}
        <div className="border border-stone-200 bg-white rounded-xl p-3 relative space-y-2 ml-8 border-l-2 border-l-amber-500 shadow-2xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-[8px] font-bold font-mono text-amber-900 select-none">L3</span>
              <div>
                <p className="text-[11px] font-bold text-stone-900">EU-Germany Exception</p>
                <p className="text-[9px] text-stone-500">Strict local logging &amp; zero-cookie pre-consent state</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold select-none">Local Exception</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[8px] font-mono px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 rounded select-none">Schrems II Hard-Audit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
