import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Palette, Layers, BarChart2, ArrowRight, Zap } from 'lucide-react';

// ==========================================
// CONFIGURATION FOR HERO DIFFERENTIAL SHOWCASE
// This makes it extremely easy to modify. You can easily swap the text,
// icons, colors, or replace the mockups with images, GIFs, or videos!
// ==========================================
export const DIFFERENTIAL_CONFIG = {
  // Title & Taglines
  title: "End-to-End Synergy",
  subtitle: "Branding + Product + Business",
  description: "My design methodology connects three essential pillars to guarantee that sensory beauty directly drives functional utility and enterprise growth.",
  
  // Media configuration: Set useMedia to true if you want to display an image/GIF/video
  // instead of the interactive animated tabs.
  media: {
    useMedia: false, // Change to TRUE to use your custom image/GIF/video instead
    type: "image", // "image" (for jpg, png, gif) or "video" (mp4)
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", // Your path/URL (e.g., "/assets/my_flow.gif" or "/assets/diferencial_anim.mp4")
    alt: "Extreme Differential Strategy • Lia Parra",
    dimensions: {
      width: "w-full",
      height: "h-[300px]",
    }
  }
};

export const DifferentialMockup: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Auto-play steps cycle
  useEffect(() => {
    if (DIFFERENTIAL_CONFIG.media.useMedia) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 0,
      title: "01 • Branding",
      slug: "brand",
      badge: "Sensory Identity & Voice",
      colorClass: "text-[#be123c]",
      bgColorClass: "bg-[#be123c]/10 border-[#be123c]/20",
      pillBg: "bg-[#be123c]",
      icon: <Palette className="w-4 h-4" />,
      description: "Establishing cohesive visual codes, elegant typography hierarchies, and premium aesthetic tokens that attract user trust immediately.",
      interactivePreview: (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white/40 p-2.5 rounded-xl border border-[#be123c]/10">
            <span className="font-mono text-[9px] text-[#be123c] font-bold uppercase tracking-wider">Accent Swatches</span>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded bg-[#be123c]" />
              <span className="w-3 h-3 rounded bg-[#9f1239]" />
              <span className="w-3 h-3 rounded bg-neutral-900" />
            </div>
          </div>
          <div className="p-3 bg-neutral-950 text-white rounded-xl space-y-1.5 text-left border border-neutral-800">
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#be123c] font-black">Brand Architecture</p>
            <h5 className="font-headline text-lg font-black leading-none lowercase tracking-tight">lia parra ♡</h5>
            <p className="font-sans text-[9px] text-neutral-400">Inter (Sans) • Space Grotesk (Display) • JetBrains Mono (Technical)</p>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "02 • Product",
      slug: "product",
      badge: "UX Design & System Logic",
      colorClass: "text-amber-600",
      bgColorClass: "bg-amber-500/10 border-amber-500/20",
      pillBg: "bg-amber-500",
      icon: <Layers className="w-4 h-4" />,
      description: "Translating brand strategy into frictionless interaction states, accessible form grids, and robust developer-ready handoff workflows.",
      interactivePreview: (
        <div className="space-y-3">
          <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Interactive Component</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="h-2 w-2/3 bg-neutral-100 rounded" />
            <div className="flex gap-2">
              <button className="flex-1 py-1 bg-[#be123c] text-white text-[9px] font-bold uppercase tracking-wider rounded-md cursor-pointer hover:bg-[#9f1239] transition-all">
                Save Code
              </button>
              <button className="flex-1 py-1 border border-neutral-300 text-neutral-600 text-[9px] font-bold uppercase tracking-wider rounded-md">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "03 • Business",
      slug: "business",
      badge: "Growth & Conversation Assets",
      colorClass: "text-emerald-600",
      bgColorClass: "bg-emerald-500/10 border-emerald-500/20",
      pillBg: "bg-emerald-500",
      icon: <BarChart2 className="w-4 h-4" />,
      description: "Connecting interaction paths with empirical outcomes—scaling checkout pipelines, increasing opt-in conversions, and ensuring high-stakes performance.",
      interactivePreview: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-white rounded-xl space-y-1">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Conversion</span>
              <p className="text-sm font-bold text-emerald-400">+42.6%</p>
            </div>
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-white rounded-xl space-y-1">
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Bounce Rate</span>
              <p className="text-sm font-bold text-emerald-400">-18.4%</p>
            </div>
          </div>
          <div className="h-10 bg-neutral-900 rounded-xl flex items-end justify-between p-1 border border-neutral-800">
            {[30, 45, 35, 60, 50, 75, 95].map((h, i) => (
              <div key={i} className="w-[12%] bg-neutral-800 hover:bg-neutral-700 rounded-sm relative h-full">
                <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-sm" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  // If the user specified to use raw media image/video instead, show that:
  if (DIFFERENTIAL_CONFIG.media.useMedia) {
    return (
      <div className={`w-full bg-white/70 backdrop-blur-xl border border-neutral-200/50 p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-center items-center ${DIFFERENTIAL_CONFIG.media.dimensions.height}`}>
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neutral-300" />
          <span className="w-2 h-2 rounded-full bg-neutral-200" />
        </div>
        
        {DIFFERENTIAL_CONFIG.media.type === "video" ? (
          <video 
            src={DIFFERENTIAL_CONFIG.media.src} 
            className="w-full h-full object-cover rounded-xl"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <img 
            src={DIFFERENTIAL_CONFIG.media.src} 
            alt={DIFFERENTIAL_CONFIG.media.alt} 
            className="w-full h-full object-cover rounded-xl shadow-inner referrer-policy='no-referrer'" 
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-white/70 backdrop-blur-xl border border-neutral-200/50 p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between h-auto gap-5 text-left">
      {/* Background glow matrix */}
      <span className="absolute -top-12 -right-12 w-24 h-24 bg-[#be123c]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
        <div className="flex items-center gap-1.5 text-neutral-850">
          <Zap className="w-3.5 h-3.5 text-[#be123c] animate-pulse" />
          <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#be123c]">
            {DIFFERENTIAL_CONFIG.title}
          </span>
        </div>
        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest font-bold">
          {DIFFERENTIAL_CONFIG.subtitle}
        </span>
      </div>

      {/* Interactive Tabs row */}
      <div className="grid grid-cols-3 gap-1.5">
        {steps.map((st, i) => {
          const isSelected = activeStep === i;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStep(i)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? `${st.bgColorClass} border-transparent scale-105 shadow-xs`
                  : 'bg-neutral-50/50 hover:bg-neutral-50 border-neutral-200/40 text-neutral-550'
              }`}
            >
              <span className={`p-1 rounded-lg ${isSelected ? st.pillBg + ' text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                {st.icon}
              </span>
              <span className={`font-headline text-[9px] font-black tracking-widest uppercase truncate w-full ${isSelected ? 'text-neutral-900 font-extrabold' : 'text-neutral-500'}`}>
                {st.slug}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic step detail container */}
      <div className="bg-neutral-50/50 border border-neutral-150 p-4 rounded-2xl min-h-[170px] flex flex-col justify-between relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 h-full flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="inline-block font-sans text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                {steps[activeStep].badge}
              </span>
              <p className="font-sans text-xs text-neutral-600 leading-relaxed">
                {steps[activeStep].description}
              </p>
            </div>

            {/* Simulated Live Interface preview inside */}
            <div className="mt-2 pt-2 border-t border-dashed border-neutral-200/65">
              {steps[activeStep].interactivePreview}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center text-[9px] text-neutral-400 font-serif italic pt-1 border-t border-neutral-100">
        <span>End-to-End value system</span>
        <span className="flex items-center gap-1">Click to pivot <ArrowRight className="w-2.5 h-2.5" /></span>
      </div>
    </div>
  );
};
