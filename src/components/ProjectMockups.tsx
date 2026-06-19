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
    <div className="w-full bg-neutral-900 text-white rounded-2xl border border-neutral-800 p-5 font-sans space-y-4 shadow-xl overflow-hidden mt-4">
      {/* Browser bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 -mt-2 -mx-2">
        <div className="flex gap-1.5 items-center pl-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600/70 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 block" />
        </div>
        <div className="bg-neutral-800 px-4 py-0.5 rounded-md text-[9px] text-neutral-400 font-mono tracking-wide w-[180px] text-center truncate">
          admin.illow.co/analytics
        </div>
        <div className="w-3" />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Consent Analytics</h4>
          <p className="text-sm font-semibold text-neutral-200">Opt-In Performance Suite</p>
        </div>
        <span className="inline-flex items-center gap-1 bg-emerald-950/45 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
          Live Syncing <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-950/40 border border-neutral-800/80 p-3 rounded-xl space-y-1">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Opt-in Conversion Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white">94.8%</span>
            <span className="text-emerald-500 text-[10px] font-semibold flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +12.4%
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-blue-700 h-full rounded-full" style={{ width: '94.8%' }} />
          </div>
        </div>

        <div className="bg-neutral-950/40 border border-neutral-800/80 p-3 rounded-xl space-y-1">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Privacy Interaction Time</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-white">1.2s</span>
            <span className="text-emerald-500 text-[10px] font-semibold flex items-center">
              Down 40%
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '30%' }} />
          </div>
        </div>
      </div>

      {/* Sparkline simulation area */}
      <div className="bg-neutral-950/40 border border-neutral-800/80 p-3 rounded-xl space-y-3">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-semibold text-neutral-300">Audits & Compliances Over Time</span>
          <span className="text-neutral-500 font-mono">Completed: 14.8k / 15k</span>
        </div>
        
        {/* Custom pure Tailwind micro-graph bars */}
        <div className="flex items-end justify-between h-14 pt-2 px-1">
          {[20, 35, 45, 30, 55, 65, 40, 75, 80, 95, 85, 98].map((height, idx) => (
            <div key={idx} className="w-[6%] bg-neutral-800/80 hover:bg-neutral-700 rounded-sm relative group h-full">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 to-blue-700 rounded-sm group-hover:from-blue-800 group-hover:to-blue-600 transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-neutral-500 font-mono">
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
