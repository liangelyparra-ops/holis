import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Palette, Layers, Heart, Star } from 'lucide-react';

export const DifferentialMockup: React.FC = () => {
  return (
    <div className="w-full relative select-none flex flex-col justify-center items-center text-center">
      {/* Hand-made illustration canvas - Transparent, borderless (Sin fondo) */}
      <div className="relative w-full aspect-[4/3] max-h-[220px] sm:max-h-[260px] flex items-center justify-center overflow-visible">
        {/* Curved dotted hand-drawn styling connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 400 200">
          {/* Handsketched styled path 1 */}
          <motion.path
            d="M 80,105 Q 140,45 200,105"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 5"
            className="opacity-60"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -20 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 3 }}
          />

          {/* Handsketched styled path 2 */}
          <motion.path
            d="M 200,105 Q 260,165 320,105"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 5"
            className="opacity-60"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 20 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 3 }}
          />

          {/* Sparkles / Flow particles gliding along the path */}
          <motion.circle
            r="3.5"
            fill="#818cf8"
            filter="drop-shadow(0px 0px 3px #818cf8)"
            animate={{
              cx: [80, 105, 140, 175, 200],
              cy: [105, 80, 63, 76, 105],
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.circle
            r="3.5"
            fill="#2563eb"
            filter="drop-shadow(0px 0px 3px #2563eb)"
            animate={{
              cx: [200, 225, 260, 295, 320],
              cy: [105, 134, 147, 134, 105],
              opacity: [0, 1, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>

        {/* 1. BRANDING NODE */}
        <div className="absolute left-[5%] top-[40%] flex flex-col items-center">
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-12 h-12 rounded-full border border-[#818cf8]/40 bg-white/40 backdrop-blur-sm shadow-sm flex items-center justify-center text-[#818cf8]"
          >
            <div className="relative">
              <Palette className="w-5 h-5 stroke-[1.5]" />
              <Heart className="w-2 h-2 fill-current absolute -top-1 -right-1.5 text-[#818cf8] animate-pulse" />
            </div>
          </motion.div>
          <span className="font-headline text-[9px] font-bold uppercase tracking-widest mt-2 text-neutral-600">
            brand ♡
          </span>
        </div>

        {/* 2. PRODUCT NODE */}
        <div className="absolute left-[43%] top-[12%] flex flex-col items-center">
          <motion.div
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2.8,
              delay: 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-12 h-12 rounded-2xl border border-blue-300/40 bg-white/40 backdrop-blur-sm shadow-sm flex items-center justify-center text-blue-500"
          >
            <div className="relative">
              <Layers className="w-5 h-5 stroke-[1.5]" />
              <Star className="w-2 h-2 fill-current absolute -top-1 -right-1 text-blue-400" />
            </div>
          </motion.div>
          <span className="font-headline text-[9px] font-bold uppercase tracking-widest mt-2 text-neutral-600">
            product ✨
          </span>
        </div>

        {/* 3. BUSINESS NODE */}
        <div className="absolute right-[5%] top-[40%] flex flex-col items-center">
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3.2,
              delay: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-12 h-12 rounded-full border border-[#2563eb]/40 bg-white/40 backdrop-blur-sm shadow-sm flex items-center justify-center text-[#2563eb]"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1.5 text-[8px] font-bold text-[#2563eb]">↗</span>
            </div>
          </motion.div>
          <span className="font-headline text-[9px] font-bold uppercase tracking-widest mt-2 text-neutral-600">
            business ⚡︎
          </span>
        </div>

        {/* Center organic hand-sketched connector tag annotation */}
        <div className="absolute top-[48%] left-[34%] bg-[#eff6ff]/40 border border-[#dbeafe]/40 text-[#2563eb] font-sans text-[8px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full scale-90 sm:scale-100">
          synergy • lead
        </div>
      </div>
    </div>
  );
};
