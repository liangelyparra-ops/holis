import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Timer, 
  Flame, 
  Skull, 
  Upload, 
  Play, 
  Check, 
  ChevronRight,
  Star,
  AlertCircle,
  User,
  Info,
  HelpCircle,
  X,
  Settings,
  Shuffle,
  Type as TypeIcon,
  Linkedin
} from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { Toaster, toast } from 'sonner';
import { Player, GameCard, GameState, DEFAULT_CARDS, PREDEFINED_PLAYERS, PRIMOS_CARDS, PAPELITO_RANDOM_THEMES, HOLIS_CARDS } from './types';
import { db } from './firebase';
import { useCases } from './data/useCases';
import { AnalyticsMockup, WireframeMockup, DesignTokensMockup } from './components/ProjectMockups';
import { DifferentialMockup } from './components/DifferentialMockup';
import GameSection from './components/GameSection';

const USER_ID_KEY = 'party-game-user-id-v2';
const NICKNAME_KEY = 'party-game-nickname';
const AVATAR_KEY = 'party-game-avatar';

function getOrCreateUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `guest-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || 'global-party';
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function shuffleAlternating(cards: GameCard[]): GameCard[] {
  const categories = Array.from(new Set(cards.map(c => c.category)));
  const cardsByCategory: Record<string, GameCard[]> = {};
  
  categories.forEach(cat => {
    cardsByCategory[cat] = shuffleArray(cards.filter(c => c.category === cat));
  });

  const result: GameCard[] = [];
  let hasMore = true;
  let index = 0;

  while (hasMore) {
    hasMore = false;
    categories.forEach(cat => {
      if (cardsByCategory[cat][index]) {
        result.push(cardsByCategory[cat][index]);
        hasMore = true;
      }
    });
    index++;
  }

  return result;
}

const INITIAL_GAME_ID = getRoomId();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function getDirectDriveUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    // 1. Matches /file/d/FILE_ID/
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }
    // 2. Matches ?id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }
  return url;
}

function getEmbedUrl(url: string | undefined): string {
  if (!url) return '';

  // 1. Google Drive Links (PDF, Video, Docs, etc.)
  if (url.includes('drive.google.com')) {
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
    }
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

  // 2. YouTube Links
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    } else if (url.includes('watch?v=')) {
      const match = url.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    } else if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    } else if (url.includes('/embed/')) {
      const parts = url.split('/embed/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // 3. Vimeo Links
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
    if (match && match[3]) {
      return `https://player.vimeo.com/video/${match[3]}`;
    }
  }

  return url;
}

const getFirstMediaBlock = (project: any) => {
  if (project.blocks && project.blocks.length > 0) {
    return project.blocks.find((b: any) => ['image', 'carousel', 'video', 'pdf'].includes(b.type));
  }
  return null;
};

const CardCarousel: React.FC<{ images: string[]; getDirectDriveUrl: (url: string) => string }> = ({ images, getDirectDriveUrl }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.img 
          key={activeSlide}
          src={getDirectDriveUrl(images[activeSlide])}
          alt={`Card slide showcase ${activeSlide + 1}`}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.3 }}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Navigation overlays */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide(prev => (prev === 0 ? images.length - 1 : prev - 1));
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10 animate-fade-in"
      >
        <span className="material-symbols-outlined text-xs font-bold leading-none">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveSlide(prev => (prev === images.length - 1 ? 0 : prev + 1));
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
      >
        <span className="material-symbols-outlined text-xs font-bold leading-none">chevron_right</span>
      </button>

      {/* Dot markers */}
      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none">
        {images.map((_: string, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide(idx);
            }}
            className={`w-1.5 h-1.5 rounded-full pointer-events-auto transition-all duration-300 ${
              idx === activeSlide ? 'w-3.5 bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const CarouselBlock: React.FC<{ block: any; getDirectDriveUrl: (url: string) => string }> = ({ block, getDirectDriveUrl }) => {
  const [index, setIndex] = useState(0);
  const images = block.carouselImages || [];

  if (images.length === 0) return null;

  return (
    <div className="space-y-2 select-none">
      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-250 bg-neutral-900 shadow-3xs">
        <AnimatePresence mode="wait">
          <motion.img 
            key={index}
            src={getDirectDriveUrl(images[index])}
            alt={`Deep dive slide showcase ${index + 1}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
        </AnimatePresence>

        {/* Navigation overlays */}
        <button
          type="button"
          onClick={() => setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
        >
          <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={() => setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
        >
          <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
        </button>

        {/* Navigation dot pips */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
          {images.map((_: string, idx: number) => {
            const isActive = idx === index;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full pointer-events-auto transition-all ${
                  isActive ? 'w-4 bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>

      {block.carouselCaption && (
        <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
          {block.carouselCaption}
        </p>
      )}
    </div>
  );
};

interface CaseStudyCardProps {
  key?: string | number;
  project: any;
  idx: number;
  onOpen: () => void;
}

function CaseStudyCard({ project, idx, onOpen }: CaseStudyCardProps) {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={onOpen}
      className="group relative custom-glass border border-neutral-150/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 transition-all duration-500 ease-out shadow-xs hover:shadow-[0_24px_48px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.01)] hover:border-neutral-300/80 hover:bg-white cursor-pointer select-none overflow-hidden"
    >
      {/* Subtle background glow inspired by Lia Brand Base */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {project.tags?.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border bg-neutral-100/70 border-neutral-200/40 text-neutral-500 shadow-3xs group-hover:bg-neutral-100 group-hover:text-black group-hover:border-neutral-200 transition-all duration-500"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="material-symbols-outlined text-neutral-400 group-hover:text-black group-hover:scale-110 transition-all duration-500 text-lg shrink-0">
          {project.icon}
        </span>
      </div>

      {/* Title & Challenge Description */}
      <div className="space-y-2">
        <h3 className="font-headline text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-black transition-colors duration-300">
          {project.title}
          <span className="inline-block text-black opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 ml-2 font-sans font-normal text-lg sm:text-xl">
            →
          </span>
        </h3>
        <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-3xl">
          <strong className="text-neutral-800 font-semibold group-hover:text-neutral-900 transition-all duration-300">Challenge:</strong> {project.challenge}
        </p>
      </div>

      {/* IN-BETWEEN RESPONSIVE MEDIA BLOCK (Dynamic showcase of the FIRST media block in the project) */}
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        {(() => {
          const firstMediaBlock = getFirstMediaBlock(project);
          if (!firstMediaBlock) return null;

          if (firstMediaBlock.type === 'image' && (firstMediaBlock.imageUrl || firstMediaBlock.carouselImages?.[0])) {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="overflow-hidden rounded-lg border border-neutral-200/50 relative bg-neutral-900 aspect-video shadow-3xs">
                  <img 
                    src={getDirectDriveUrl(firstMediaBlock.imageUrl || firstMediaBlock.carouselImages?.[0])} 
                    alt={firstMediaBlock.imageCaption || "Image style preview"} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/media:scale-[1.02] transition-transform duration-700 ease-out brightness-[0.98] group-hover/media:brightness-100"
                  />
                </div>
                {firstMediaBlock.imageCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.imageCaption}
                  </p>
                )}
              </div>
            );
          }

          if (firstMediaBlock.type === 'carousel' && firstMediaBlock.carouselImages && firstMediaBlock.carouselImages.length > 0) {
            return (
              <div className="space-y-3 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs select-none">
                  <CardCarousel images={firstMediaBlock.carouselImages} getDirectDriveUrl={getDirectDriveUrl} />
                </div>
                {firstMediaBlock.carouselCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.carouselCaption}
                  </p>
                )}
              </div>
            );
          }

          if (firstMediaBlock.type === 'video' && firstMediaBlock.videoUrl) {
            const isVideoEmbed = firstMediaBlock.videoUrl.includes('youtube.com') || 
                                firstMediaBlock.videoUrl.includes('youtu.be') || 
                                firstMediaBlock.videoUrl.includes('vimeo.com') ||
                                firstMediaBlock.videoUrl.includes('drive.google.com') ||
                                firstMediaBlock.videoUrl.includes('embed');
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs">
                  {isVideoEmbed ? (
                    <iframe 
                      src={getEmbedUrl(firstMediaBlock.videoUrl)} 
                      title="Dynamic collapsed video presentation"
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={firstMediaBlock.videoUrl} 
                      controls 
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                {firstMediaBlock.videoCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.videoCaption}
                  </p>
                )}
              </div>
            );
          }

          if (firstMediaBlock.type === 'pdf' && firstMediaBlock.pdfUrl) {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs">
                  <iframe 
                    src={getEmbedUrl(firstMediaBlock.pdfUrl)}
                    className="w-full h-full border-0"
                    title="PDF collapsed stream frame preview"
                  />
                </div>
                {firstMediaBlock.pdfCaption && (
                  <p className="font-sans text-[11px] text-neutral-500 italic">
                    {firstMediaBlock.pdfCaption}
                  </p>
                )}
              </div>
            );
          }

          return null;
        })()}
      </div>

      {/* Decorative Bottom / Empirical Metrics Block (Key Results) */}
      <div className="flex flex-col gap-3.5 border-t border-neutral-100/80 pt-4 mt-2 select-none">
        <div className="p-3.5 bg-neutral-50/60 rounded-xl border border-neutral-200/30 italic text-[11px] sm:text-xs text-neutral-600 leading-relaxed group-hover:bg-neutral-100/50 group-hover:border-neutral-200/50 transition-all duration-500">
          <strong className="text-neutral-800 font-bold not-italic block mb-0.5 group-hover:text-black transition-colors">Key Result Integration:</strong> 
          {project.impact}
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider select-none">
          <span className="text-neutral-400 group-hover:text-neutral-600 transition-colors max-w-[65%] truncate font-mono">{project.footerBadge}</span>
          <span className="flex items-center gap-1 text-black font-sans group-hover:translate-x-1.5 transition-all duration-300 ease-out shrink-0">
            Explore Case Study
            <span className="material-symbols-outlined text-xs font-bold leading-none">arrow_forward</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'IMPACT' | 'PROCESS' | 'VISION' | 'GAMES' | 'CONTACT'>('IMPACT');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('UX Consultancy');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [availableMenuOpen, setAvailableMenuOpen] = useState(false);
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);
  const [useCaseFilter, setUseCaseFilter] = useState<'All' | 'UX Strategy' | 'Design Systems' | 'Information Architecture' | 'Branding'>('All');
  
  // Player state synchronized from the modular GameSection
  const [myPlayer, setMyPlayer] = useState<{ name: string; avatar: string } | null>(null);

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
      } else if (hash === '#vision') {
        setActiveTab('VISION');
      } else if (hash === '#about' || hash === '#contact') {
        setActiveTab('CONTACT');
      } else if (hash === '#experience' || hash === '#experiences' || hash === '#use-cases') {
        setActiveTab('IMPACT');
      } else {
        // Default on blank or unexpected hashes
        setActiveTab('IMPACT');
      }
    };

    // Run once on mount to handle direct landing link
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
    else if (activeTab === 'VISION') targetHash = '#vision';
    else if (activeTab === 'CONTACT') targetHash = '#about';

    if (window.location.hash.toLowerCase() !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
  }, [activeTab]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Please fill in all required fields.", { duration: 3000 });
      return;
    }
    setContactSubmitting(true);
    try {
      const submissionId = `submission-${Date.now()}`;
      
      // Save to Firestore for reliable persistence backup
      await setDoc(doc(db, 'contacts', submissionId), {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        createdAt: new Date().toISOString()
      });

      // Submit to server endpoint to trigger email alert / log
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      setContactSubmitted(true);
      toast.success("Message logged successfully! ✉️", {
        description: "Choose an instant option below to complete your connection.",
        duration: 5000
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not send message. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };


















  const [selectedProcessStep, setSelectedProcessStep] = useState(0);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [deepDiveCarouselIndex, setDeepDiveCarouselIndex] = useState(0);

  // Automatically reset the carousel indexes when a new project is selected
  useEffect(() => {
    setCarouselIndex(0);
    setDeepDiveCarouselIndex(0);
  }, [selectedProjectForModal]);

  const renderImpact = () => {

    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left select-none">
        {/* Section Header with End-to-End Differential Showcase Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3 animate-fade-in">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
                Sr. Product Designer UX / UI Lead
              </span>
              <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
                Strategy &amp; <span className="font-cursive italic font-normal text-neutral-400 pr-1">Design</span> <br />
                as a Growth Engine
              </h2>
            </div>
            <p className="font-sans text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
              Connecting premium visual narratives with empirical business outcomes. Every design decision serves to translate complex engineering workflows into frictionless user experiences and lasting brand value.
            </p>
          </div>
          <div className="lg:col-span-5 w-full">
            <DifferentialMockup />
          </div>
        </div>

        {/* Featured Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full mb-10">
          {filteredCases.map((project, idx) => {
            return (
              <CaseStudyCard 
                key={project.id}
                project={project} 
                idx={idx} 
                onOpen={() => setSelectedProjectForModal(project)} 
              />
            );
          })}
        </div>

        {/* Co-Creation Game Card positioned inline with Case Studies */}
        <div className="max-w-6xl mx-auto w-full">
          {renderPapelitoCoCreationPanel()}
        </div>
      </div>
    );
  };

  const renderPapelitoCoCreationPanel = () => {
    return (
      <div className="bg-[#111113] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 hover:border-neutral-700 max-w-4xl mx-auto w-full select-none text-left">
        <div className="flex flex-col sm:flex-row gap-5 items-stretch">
          {/* Left Hand: Smaller, low-height Preview Image */}
          <div className="w-full sm:w-40 md:w-48 shrink-0 flex flex-col justify-center space-y-1.5">
            <div className="overflow-hidden rounded-xl border border-neutral-800 relative bg-neutral-900 aspect-video shadow-3xs">
              <img 
                src={getDirectDriveUrl("https://drive.google.com/file/d/1xN0fZzNMSZKh5252z38-m09XZokC0_Qf/view?usp=share_link")} 
                alt="Papelito game interface preview" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="font-sans text-[9px] text-neutral-400 italic pl-0.5 leading-normal select-text">
              Preview: Real-time Papelito Multi-agent Engine
            </p>
          </div>

          {/* Right Hand: Description & Horizontal Steps Bar */}
          <div className="flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 text-left">
            {/* Header Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest font-mono text-[#3C48C3] bg-[#3C48C3]/10 border border-[#3C48C3]/30">
                  AI x UX Co-Creation
                </span>
                <span className="text-[10px] text-neutral-400 font-body italic">
                  From raw prompt to live lobby
                </span>
              </div>
              <h3 className="font-headline text-sm sm:text-base font-bold text-white tracking-tight">
                Co-Creating Papelito Lobby Engine
              </h3>
              <p className="font-sans text-[11px] sm:text-xs text-neutral-400 leading-relaxed mb-0.5">
                Designing a multiplayer party game requires granular event management. Using structured prompt sequencing, we co-designed and deployed the entire party flow featuring custom Web Audio synthesizers and low-latency Firestore subscriptions. The resulting framework translates responsive gameplay into frictionless user events, bringing interactive state models to life directly on this staging stage.
              </p>
            </div>

            {/* Bottom Row / Flat horizontal layout */}
            <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-x-3 gap-y-1 flex-wrap text-[10px] text-neutral-400 select-text">
                <span className="text-[#3C48C3] font-bold uppercase text-[8px] tracking-widest">Pipeline:</span>
                <span className="font-mono text-[9px] text-neutral-300 font-bold">01 Prompt Blueprint</span>
                <span className="text-neutral-700">•</span>
                <span className="font-mono text-[9px] text-neutral-300 font-bold">02 State Machine</span>
                <span className="text-neutral-700">•</span>
                <span className="font-mono text-[9px] text-neutral-300 font-bold">03 Web Synth</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('GAMES');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="shrink-0 py-1.5 px-3.5 bg-[#3C48C3] hover:brightness-110 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-xs"
              >
                Launch Game (Live Dev Stage)
                <span className="material-symbols-outlined text-[11px] font-bold leading-none">sports_esports</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVision = () => {
    const steps = [
      {
        title: "Discover",
        icon: "search",
        sub: "Research & Audit",
        desc: "Deep immersion into target user behaviors, workflows, and communication barriers to explicitly catalog inefficiencies and opportunities.",
        deliverables: ["User & Host Journey Logs", "Bottleneck Friction Matrices", "Behavioral Target Maps"]
      },
      {
        title: "Define",
        icon: "fact_check",
        sub: "Taxonomy & Protocol",
        desc: "Constructing scalable data taxonomies, system states, and structured communication flows to build conflict-free real-time protocols.",
        deliverables: ["Product Information Hierarchy", "State Transition Controllers", "Information Flow Pipelines"]
      },
      {
        title: "Design",
        icon: "palette",
        sub: "Auditory & Visual UX",
        desc: "Drafting minimalist high-contrast layouts. Injecting micro-animations and custom synthetic sounds that elevate response speeds and player retention.",
        deliverables: ["High-Contrast Adaptive Wireframes", "Web Audio Waveforms", "Responsive Motion Frameworks"]
      },
      {
        title: "Deliver",
        icon: "terminal",
        sub: "Interactive Handoff",
        desc: "Bundling atomic design tokens and optimizing real-time state listeners. Guaranteeing sub-20ms latency and high-performance cross-device rendering.",
        deliverables: ["Atomic JSON Design Tokens", "Lighter Build Audits", "Production Lobby Integration"]
      }
    ];

    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left select-none">
        {/* Header Block */}
        <div className="max-w-3xl space-y-6">
          <div className="space-y-3 animate-fade-in">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
              Core Vision
            </span>
            <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
              Empirical <span className="font-cursive italic font-normal text-neutral-400 pr-1">Architecture</span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
            Every pixel must serve a metric. We design visual interfaces not as decorative static skins, but as high-fidelity operational flows engineered to eliminate user friction.
          </p>
        </div>

        {/* 1. Double Diamond Infographic Section */}
        <div className="space-y-8 border-t border-neutral-100 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
                Methodology in Action
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                The <span className="font-cursive italic font-normal text-neutral-400">Double-Diamond</span> Cycle
              </h3>
            </div>
            <p className="font-sans text-xs sm:text-sm text-neutral-500 max-w-sm leading-relaxed">
              Click any quadrant of the interactive dual-diamond map below to audit deliverables, methodologies, and outcomes across the product lifecycle.
            </p>
          </div>

          {/* Core Interactive SVG Diamond diagram */}
          <div className="w-full bg-neutral-50/40 border border-neutral-200/40 p-6 sm:p-8 rounded-2xl custom-glass flex flex-col items-center justify-center shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
            {/* SVG Double Diamond */}
            <div className="w-full overflow-x-auto scrollbar-thin py-6">
              <div className="min-w-[640px] max-w-4xl mx-auto">
                <svg className="w-full h-auto overflow-visible" viewBox="0 0 800 220" fill="none">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="grad-active-discover" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c8c5be" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#edeae3" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="grad-active-define" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#edeae3" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#111110" stopOpacity="0.25" />
                    </linearGradient>
                    <linearGradient id="grad-active-design" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#111110" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#edeae3" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="grad-active-deliver" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#edeae3" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#111110" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Flow Guide Line */}
                  <path
                    d="M 40,110 L 760,110"
                    stroke="#e5e5e5"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    className="opacity-70"
                  />

                  {/* Particle Flow path along diamond margins */}
                  <motion.circle
                     r="4"
                     fill="#111110"
                     filter="drop-shadow(0 0 4px rgba(0,0,0,0.15))"
                     animate={{
                       cx: [40, 200, 360, 440, 600, 760],
                       cy: [110, 30, 110, 110, 30, 110],
                       opacity: [0, 1, 0, 0, 1, 0]
                     }}
                     transition={{
                       duration: 7,
                       repeat: Infinity,
                       ease: "easeInOut"
                     }}
                  />

                  {/* DIAMOND 1: RESEARCH & STRATEGY */}
                  <g className="cursor-pointer group">
                    {/* Discover Segment */}
                    <motion.path
                      onClick={() => setSelectedProcessStep(0)}
                      d="M 40,110 L 200,30 L 200,190 Z"
                      fill={selectedProcessStep === 0 ? "url(#grad-active-discover)" : "transparent"}
                      stroke={selectedProcessStep === 0 ? "#111110" : "#e4e1d9"}
                      strokeWidth={selectedProcessStep === 0 ? "2.5" : "1.5"}
                      strokeDasharray={selectedProcessStep === 0 ? "0" : "5 5"}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors"
                    />

                    {/* Define Segment */}
                    <motion.path
                      onClick={() => setSelectedProcessStep(1)}
                      d="M 200,30 L 360,110 L 200,190 Z"
                      fill={selectedProcessStep === 1 ? "url(#grad-active-define)" : "transparent"}
                      stroke={selectedProcessStep === 1 ? "#111110" : "#e4e1d9"}
                      strokeWidth={selectedProcessStep === 1 ? "2.5" : "1.5"}
                      strokeDasharray={selectedProcessStep === 1 ? "0" : "5 5"}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors"
                    />
                  </g>

                  {/* DIAMOND 2: CREATION & DEPLOYMENT */}
                  <g className="cursor-pointer group">
                    {/* Design Segment */}
                    <motion.path
                      onClick={() => setSelectedProcessStep(2)}
                      d="M 440,110 L 600,30 L 600,190 Z"
                      fill={selectedProcessStep === 2 ? "url(#grad-active-design)" : "transparent"}
                      stroke={selectedProcessStep === 2 ? "#111110" : "#e4e1d9"}
                      strokeWidth={selectedProcessStep === 2 ? "2.5" : "1.5"}
                      strokeDasharray={selectedProcessStep === 2 ? "0" : "5 5"}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors"
                    />

                    {/* Deliver Segment */}
                    <motion.path
                      onClick={() => setSelectedProcessStep(3)}
                      d="M 600,30 L 760,110 L 600,190 Z"
                      fill={selectedProcessStep === 3 ? "url(#grad-active-deliver)" : "transparent"}
                      stroke={selectedProcessStep === 3 ? "#111110" : "#e4e1d9"}
                      strokeWidth={selectedProcessStep === 3 ? "2.5" : "1.5"}
                      strokeDasharray={selectedProcessStep === 3 ? "0" : "5 5"}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors"
                    />
                  </g>

                  {/* Hotspot Circles / Anchor Vertices */}
                  <circle cx="40" cy="110" r="5" fill="#fff" stroke="#c8c5be" strokeWidth="2" />
                  <circle cx="200" cy="110" r="5" fill="#fff" stroke="#111110" strokeWidth="2" />
                  <circle cx="360" cy="110" r="5" fill="#fff" stroke="#111110" strokeWidth="2" />
                  <circle cx="440" cy="110" r="5" fill="#fff" stroke="#111110" strokeWidth="2" />
                  <circle cx="600" cy="110" r="5" fill="#fff" stroke="#111110" strokeWidth="2" />
                  <circle cx="760" cy="110" r="5" fill="#fff" stroke="#c8c5be" strokeWidth="2" />

                  {/* Phase Titles & Direction Labels */}
                  <text x="120" y="114" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle">DIVERGE</text>
                  <text x="280" y="114" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle">CONVERGE</text>
                  <text x="520" y="114" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle">DIVERGE</text>
                  <text x="680" y="114" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle">CONVERGE</text>

                  {/* Anchor label tags */}
                  <text x="40" y="130" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">INPUT</text>
                  <text x="200" y="24" fill="#262626" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">PROBLEM DEF</text>
                  <text x="360" y="130" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">JUNCTION</text>
                  <text x="600" y="24" fill="#262626" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">CODE BLUEPRINT</text>
                  <text x="760" y="130" fill="#a3a3a3" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle text-right">DEPLOY</text>

                  {/* Dynamic Floating Labels on Top of diamonds */}
                  <g onClick={() => setSelectedProcessStep(0)} className="cursor-pointer">
                    <rect x="70" y="55" width="60" height="18" rx="4" fill={selectedProcessStep === 0 ? "#111110" : "transparent"} />
                    <text x="100" y="67" fill={selectedProcessStep === 0 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">01. DISCOVER</text>
                  </g>

                  <g onClick={() => setSelectedProcessStep(1)} className="cursor-pointer">
                    <rect x="270" y="55" width="50" height="18" rx="4" fill={selectedProcessStep === 1 ? "#111110" : "transparent"} />
                    <text x="295" y="67" fill={selectedProcessStep === 1 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">02. DEFINE</text>
                  </g>

                  <g onClick={() => setSelectedProcessStep(2)} className="cursor-pointer">
                    <rect x="470" y="55" width="50" height="18" rx="4" fill={selectedProcessStep === 2 ? "#111110" : "transparent"} />
                    <text x="495" y="67" fill={selectedProcessStep === 2 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">03. DESIGN</text>
                  </g>

                  <g onClick={() => setSelectedProcessStep(3)} className="cursor-pointer">
                    <rect x="670" y="55" width="50" height="18" rx="4" fill={selectedProcessStep === 3 ? "#111110" : "transparent"} />
                    <text x="695" y="67" fill={selectedProcessStep === 3 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">04. DELIVER</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Selection indicators (Mobile layout switcher button pills) */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 sm:hidden">
              {steps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedProcessStep(idx)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border cursor-pointer transition-all ${
                    selectedProcessStep === idx
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-500 border-neutral-200'
                  }`}
                >
                  {idx + 1}. {st.title}
                </button>
              ))}
            </div>
          </div>

          {/* Connected Audit Card */}
          <motion.div
            key={selectedProcessStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white border border-neutral-200/40 p-6 sm:p-8 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow text-left"
          >
            <div className="md:col-span-12 lg:col-span-7 space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] xs:text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit block">
                Stage 0{selectedProcessStep + 1} • {steps[selectedProcessStep].sub}
              </span>
              <h4 className="font-headline text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-tight">
                Evaluating the "{steps[selectedProcessStep].title}" Phase
              </h4>
              <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed font-sans leading-relaxed">
                {steps[selectedProcessStep].desc}
              </p>
            </div>

            <div className="lg:col-span-1 border-r border-[#ffe4e6] h-full hidden lg:block" />

            <div className="md:col-span-12 lg:col-span-4 space-y-3">
              <span className="font-sans text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                Deliverable Checklist:
              </span>
              <div className="space-y-2">
                {steps[selectedProcessStep].deliverables.map((item, id) => (
                  <div key={id} className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <span className="material-symbols-outlined text-neutral-800 text-base">verified</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 2. Design Philosophy Infographic Row */}
        <div className="space-y-8 border-t border-neutral-100 pt-10">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
              02 • Aesthetics & Performance Infographic
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Design Pillars as <span className="font-cursive italic font-normal text-neutral-400">Operational Metrics</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Infographic card 1: Functional Brutalism */}
            <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60 transition-all duration-300">
              <div className="space-y-4 text-left">
                <span className="inline-flex items-center justify-center p-2 bg-neutral-100 border border-neutral-200/40 text-black rounded-xl text-lg w-fit shadow-3xs">
                  <span className="material-symbols-outlined leading-none">architecture</span>
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-headline text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                    Functional Brutalism
                  </h4>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                    We dismantle excessive cosmetic overlays to assert complete focus on structural, strategic user experiences.
                  </p>
                </div>
              </div>

              {/* Graphic element */}
              <div className="bg-neutral-50 rounded-xl p-4 space-y-3 border border-neutral-100">
                <div className="flex justify-between items-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                  <span>UX Interaction Hierarchy</span>
                  <span className="text-black">92% Core Focus</span>
                </div>
                
                {/* Horizontal Stack Bar Diagram */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-neutral-700 font-bold">Utility Blocks</span>
                      <span className="text-black font-bold">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neutral-400 to-black rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-neutral-400">Decorative Visual Noise</span>
                      <span className="text-neutral-400">8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-300 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Infographic card 2: Tactile Sensory Audio */}
            <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60 transition-all duration-300">
              <div className="space-y-4 text-left">
                <span className="inline-flex items-center justify-center p-2 bg-neutral-100 border border-neutral-200/40 text-black rounded-xl text-lg w-fit shadow-3xs">
                  <span className="material-symbols-outlined leading-none">volume_up</span>
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-headline text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                    Multimodal Sound Resonance
                  </h4>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                    High-response chord checkers and subtle auditory checks prevent error loops, mimicking real physical play.
                  </p>
                </div>
              </div>

              {/* Graphical Synth Wave display */}
              <div className="bg-neutral-50 rounded-xl p-4 flex flex-col justify-between border border-neutral-100 min-h-[96px]">
                <div className="flex justify-between items-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                  <span>Web Audio Wave Pattern</span>
                  <span className="text-emerald-600 animate-pulse">• Wave Active</span>
                </div>
                
                {/* SVG Sine Wave Graphics */}
                <div className="h-10 flex items-end justify-between px-1 relative">
                  <svg className="absolute inset-0 w-full h-full text-neutral-200" viewBox="0 0 160 40" fill="none">
                    <path d="M0,20 Q20,5 40,20 T80,20 T120,20 T160,20" stroke="currentColor" strokeWidth="1" />
                    <motion.path 
                      id="synth-wave"
                      d="M0,20 Q15,4 30,20 T60,20 T90,20 T120,20 T150,20 T160,20" 
                      stroke="#111110" 
                      strokeWidth="2" 
                      animate={{
                        d: [
                          "M0,20 Q15,4 30,20 T60,20 T90,20 T120,20 T150,20 T160,20",
                          "M0,20 Q15,36 30,20 T60,20 T90,20 T120,20 T150,20 T160,20",
                          "M0,20 Q15,4 30,20 T60,20 T90,20 T120,20 T150,20 T160,20"
                        ]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                  <div className="w-1.5 bg-black h-3 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 bg-neutral-400 h-6 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1.5 bg-black h-4 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  <div className="w-1.5 bg-neutral-300 h-2 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 bg-black h-5 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <div className="w-1.5 bg-neutral-400 h-3 animate-bounce" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>
            </div>

            {/* Infographic card 3: Target Velocity Gauge */}
            <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60 transition-all duration-300">
              <div className="space-y-4 text-left">
                <span className="inline-flex items-center justify-center p-2 bg-neutral-100 border border-neutral-200/40 text-black rounded-xl text-lg w-fit shadow-3xs">
                  <span className="material-symbols-outlined leading-none">speed</span>
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-headline text-lg font-bold text-neutral-900 tracking-tight leading-snug">
                    Velocity is a Core Metric
                  </h4>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed">
                    Every user interaction is optimized to avoid script delays, producing smooth and clean layouts instantly.
                  </p>
                </div>
              </div>

              {/* Graphic element speed parameters */}
              <div className="bg-neutral-50 rounded-xl p-4 flex justify-between items-center border border-neutral-100">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Operational specs</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-headline font-black text-neutral-900">0.1</span>
                    <span className="text-[10px] text-neutral-500 font-bold">ms Engine lag</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-headline font-black text-black">120</span>
                    <span className="text-[10px] text-neutral-500 font-bold">FPS Active target</span>
                  </div>
                </div>

                {/* Circular indicator infographic */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="#e5e5e5" strokeWidth="4" fill="transparent" />
                    <motion.circle 
                      cx="28" 
                      cy="28" 
                      r="24" 
                      stroke="#111110" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="150"
                      animate={{ strokeDashoffset: [150, 25, 25] }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-[9px] font-black text-neutral-800">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 py-10 sm:py-16 space-y-16 md:space-y-24 text-left select-none">
        <div className="space-y-6">
          <div className="space-y-3 animate-fade-in">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-700 bg-neutral-100 border border-neutral-200/40 shadow-3xs w-fit">
              Partner with Lia
            </span>
            <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
              Consultancy &amp; <span className="font-cursive italic font-normal text-neutral-400 pr-1">Action</span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
            Need to solve immediate conversions boundaries, improve retention rates, or build clean corporate design languages? Leave a message or connect directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Information block */}
          <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60 space-y-8">
            <div className="space-y-6">
              <h3 className="font-headline text-2xl font-black text-neutral-900 tracking-tight">Lia Parra</h3>
              <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                Sr. Product Designer UX / UI Lead and experience strategist driving conversion, interactive interfaces, and cross-platform UX structures.
              </p>
              <div className="space-y-4 pt-6 border-t border-neutral-150 text-sm font-sans">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">mail</span>
                  <a href="mailto:liangelyp@gmail.com" className="text-neutral-700 select-all font-medium hover:text-black hover:underline transition-all">liangelyp@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">chat</span>
                  <a href="https://wa.me/5491156424162?text=Hello%20Lia!%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you." target="_blank" rel="noreferrer" className="text-neutral-700 font-medium hover:text-black hover:underline transition-all">+54 9 11 5642-4162 (WhatsApp)</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">location_on</span>
                  <span className="text-neutral-700 font-medium">Remote • Global / Digital Sync</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-6 border-t border-neutral-150">
              <a 
                href="https://linkedin.com/in/liangely-diseno-grafico"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest text-black hover:underline transition-colors"
                id="contact-linkedin-link"
              >
                <Linkedin className="w-3.5 h-3.5 shrink-0" />
                LinkedIn ↗
              </a>
            </div>
          </div>

          {/* Contact form block */}
          <div className="lg:col-span-2 custom-glass border border-neutral-200/50 bg-white/45 p-6 sm:p-8 rounded-2xl transition-all duration-300 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:bg-white/60">
            {contactSubmitted ? (
              <div className="text-center py-6 space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100/80 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-black text-neutral-900 tracking-tight">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="font-sans text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    Your details have been registered on our servers. To establish immediate contact and send this message instantly to my private channels, click one of the options below:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                  <a
                    href={`https://wa.me/5491156424162?text=${encodeURIComponent(`Hello Lia! This is ${contactName} (${contactEmail}).\n\n*Collaboration Area*: ${contactSubject}\n\n*Project Context*:\n${contactMessage}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all scale-100 hover:scale-[1.02] active:scale-95 animate-fade-in"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    Send via WhatsApp
                  </a>
                  <a
                    href={`mailto:liangelyp@gmail.com?subject=${encodeURIComponent(`Portfolio Contact: ${contactSubject}`)}&body=${encodeURIComponent(`Hi Lia,\n\nMy name is ${contactName} (${contactEmail}).\n\nArea of Interaction: ${contactSubject}\n\nMessage Detail:\n${contactMessage}`)}`}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-neutral-950 hover:bg-black text-white font-sans text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all scale-100 hover:scale-[1.02] active:scale-95 animate-fade-in"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    Send via Email Client
                  </a>
                </div>

                <div className="pt-6 border-t border-neutral-150">
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                    }}
                    className="text-[10px] font-sans font-black uppercase tracking-widest text-black hover:underline transition-all cursor-pointer"
                  >
                    ← Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-black/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. alex@company.com"
                      className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-black/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                    Area of Collaboration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UX Consultancy', 'Product Design', 'Game UX'].map((sub) => {
                      const isSelected = contactSubject === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          id={`subject-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => setContactSubject(sub)}
                          className={`py-2 px-2 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-mono font-bold uppercase border tracking-widest transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-950 text-white border-neutral-950 shadow-2xs scale-[1.01]'
                              : 'bg-white/40 border-neutral-200/50 text-neutral-500 hover:border-neutral-400 hover:text-black hover:bg-neutral-50 shadow-3xs'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 font-mono">
                    Tell me about your product challenge *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your design objectives, timelines or parameters..."
                    className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-black/10"
                  />
                </div>

                <button
                  type="submit"
                  id="contact-form-submit-btn"
                  disabled={contactSubmitting}
                  className="w-full py-3.5 bg-neutral-950 text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all rounded-xl shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  {contactSubmitting ? 'Sending inquiry...' : 'Send Message'}
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen font-body transition-colors duration-500 overflow-x-hidden ${
      activeTab === 'GAMES' ? 'bg-[#0e0e0e] text-on-surface' : 'bg-[#fafafa] text-on-surface'
    }`}>
      <Toaster position="top-right" richColors closeButton />

      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {activeTab === 'GAMES' ? (
          <>
            {/* Cyberpunk Neon Tone Abstract Shapes */}
            <motion.div 
              animate={{
                x: [0, 80, -60, 0],
                y: [0, -80, 60, 0],
                scale: [1, 1.25, 0.85, 1],
                borderRadius: [
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%"
                ],
                rotate: [0, 120, 240, 360]
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#3C48C3]/15 blur-[120px]"
            />
            <motion.div 
              animate={{
                x: [0, -70, 60, 0],
                y: [0, 90, -70, 0],
                scale: [1, 0.9, 1.15, 1],
                borderRadius: [
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%"
                ],
                rotate: [360, 240, 120, 0]
              }}
              transition={{
                duration: 26,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-10 -right-10 w-[650px] h-[650px] bg-[#3C48C3]/10 blur-[140px]"
            />
            <motion.div 
              animate={{
                x: [0, 50, -50, 0],
                y: [0, 50, -50, 0],
                scale: [1, 1.1, 0.9, 1],
                borderRadius: [
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%"
                ],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#3C48C3]/10 blur-[110px]"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/50 via-[#f0f9ff]/60 to-[#f7f5f0]">
            {/* Elegant Puffy Clouds in the Sky — Smooth drifting and morphing */}
            
            {/* Cloud 1: Fluffy Main Cumulus in top-left */}
            <motion.div 
              animate={{
                x: [0, 60, -30, 0],
                y: [0, -20, 15, 0],
                scale: [1, 1.08, 0.95, 1],
                borderRadius: [
                  "65% 55% 60% 45% / 50% 55% 45% 50%",
                  "75% 45% 65% 40% / 60% 45% 55% 40%",
                  "55% 65% 45% 55% / 45% 55% 45% 55%",
                  "65% 55% 60% 45% / 50% 55% 45% 50%"
                ],
              }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[8%] left-[8%] w-[500px] h-[300px] bg-white/70 blur-[90px] mix-blend-normal"
            />

            {/* Cloud 2: Soft Sunset Highlight Cloud in middle-right (with light pink/peach edges) */}
            <motion.div 
              animate={{
                x: [0, -70, 40, 0],
                y: [0, 30, -25, 0],
                scale: [1, 0.95, 1.12, 1],
                borderRadius: [
                  "55% 65% 50% 60% / 45% 55% 40% 60%",
                  "70% 50% 60% 45% / 55% 40% 60% 45%",
                  "45% 70% 55% 50% / 35% 65% 50% 55%",
                  "55% 65% 50% 60% / 45% 55% 40% 60%"
                ],
              }}
              transition={{
                duration: 42,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[25%] right-[5%] w-[550px] h-[320px] bg-rose-100/40 blur-[110px] mix-blend-multiply"
            />

            {/* Cloud 3: Warm Morning Sunshine Reflection Cloud (Golden peach tint) */}
            <motion.div 
              animate={{
                x: [0, 40, -50, 0],
                y: [0, 25, -35, 0],
                scale: [1, 1.1, 0.9, 1],
                borderRadius: [
                  "60% 60% 50% 50% / 50% 50% 50% 50%",
                  "50% 70% 40% 60% / 40% 60% 40% 60%",
                  "70% 55% 55% 45% / 55% 45% 55% 45%",
                  "60% 60% 50% 50% / 50% 50% 50% 50%"
                ],
              }}
              transition={{
                duration: 38,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[45%] left-[20%] w-[450px] h-[280px] bg-[#fef9c3]/35 blur-[100px] mix-blend-multiply"
            />

            {/* Cloud 4: Deep Sky Lavender/Blue Cloud in bottom-right */}
            <motion.div 
              animate={{
                x: [0, -30, 50, 0],
                y: [0, -40, 30, 0],
                scale: [1, 1.05, 0.95, 1],
                borderRadius: [
                  "50% 70% 60% 50% / 40% 60% 50% 60%",
                  "65% 50% 70% 45% / 55% 45% 60% 45%",
                  "45% 65% 50% 60% / 35% 55% 45% 65%",
                  "50% 70% 60% 50% / 40% 60% 50% 60%"
                ],
              }}
              transition={{
                duration: 45,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-[20%] right-[15%] w-[600px] h-[350px] bg-sky-200/35 blur-[120px] mix-blend-multiply"
            />

            {/* Cloud 5: Low Alt Horizon Mist (puffy, soft, sweeping white cloud at the bottom) */}
            <motion.div 
              animate={{
                x: [0, 80, -80, 0],
                y: [0, 15, -15, 0],
                scale: [1, 1.15, 0.9, 1],
                borderRadius: [
                  "80% 40% 75% 45% / 50% 40% 60% 50%",
                  "70% 50% 65% 55% / 45% 50% 55% 50%",
                  "85% 35% 80% 40% / 55% 35% 65% 45%",
                  "80% 40% 75% 45% / 50% 40% 60% 50%"
                ],
              }}
              transition={{
                duration: 50,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-[5%] left-[5%] w-[650px] h-[320px] bg-white/75 blur-[130px] mix-blend-normal"
            />
          </div>
        )}
        
        {/* Grainy Noise texture overlay via SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none mix-blend-overlay">
          <filter id="grainy-noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="contrast" values="110%" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainy-noise-filter)" />
        </svg>
      </div>

      {/* Top Custom Navigation Bar */}
      <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[16px] sm:px-[24px] md:px-[24px] lg:px-[32px] xl:px-[120px] py-[23px] transition-all border-b ${
        activeTab === 'GAMES' 
          ? 'bg-[#0e0e0e]/90 text-white border-outline-variant/10 backdrop-blur-md' 
          : 'bg-[#fafafa]/90 text-on-surface border-outline-variant/30 backdrop-blur-md'
      }`}>
        <div 
          onClick={() => { 
            setActiveTab('IMPACT'); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
          }}
          className={`flex items-center gap-1.5 cursor-pointer select-none transition-all ${
            activeTab === 'GAMES' 
              ? 'text-white hover:opacity-80' 
              : 'text-neutral-950 hover:opacity-80'
          }`}
        >
          {activeTab === 'GAMES' ? (
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs font-black tracking-widest text-[#3C48C3] uppercase">
                Lia Parra
              </span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#3C48C3] bg-[#3C48C3]/10 px-1.5 py-0.5 rounded uppercase">
                Labs Game
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm font-black uppercase tracking-widest text-[#111110]">
                Lia Parra
              </span>
              <span className="w-1.5 h-1.5 bg-[#111110] rounded-full animate-pulse shrink-0" />
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 border border-neutral-200/50 px-1.5 py-0.5 rounded leading-none sm:hidden md:block">
                Lab Sandbox
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Link Tabs (Always Visible for portfolio, hidden for GAMES which uses Burger) */}
        {activeTab !== 'GAMES' && (
          <nav className="hidden lg:flex items-center gap-8 font-headline text-xs font-bold uppercase tracking-widest">
            {[
              { id: 'IMPACT', label: 'Portfolio' },
              { id: 'VISION', label: 'My Vision' },
              { id: 'GAMES', label: 'Game' },
              { id: 'CONTACT', label: 'About' }
            ].map((tab) => {
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
        )}

        {/* Top Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative hidden sm:block">
            <button 
              onClick={() => setAvailableMenuOpen(!availableMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shadow-xs border transition-all cursor-pointer ${
                activeTab === 'GAMES'
                  ? 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25'
                  : 'bg-[#89ffab]/10 border-[#89ffab]/30 hover:bg-[#89ffab]/20 text-emerald-800 font-sans font-bold shadow-xs'
              }`}
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
                i'm available
              </span>
              <span className="material-symbols-outlined text-[12px] opacity-70">expand_more</span>
            </button>

            <AnimatePresence>
              {availableMenuOpen && (
                <>
                  {/* Invisible backdrop to close menu when clicking outside */}
                  <div 
                    className="fixed inset-0 z-[19]" 
                    onClick={() => setAvailableMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-xl border z-20 backdrop-blur-xl ${
                      activeTab === 'GAMES'
                        ? 'bg-[#121212]/95 border-neutral-800 text-white shadow-black/80 shadow-2xl'
                        : 'bg-white/95 border-neutral-200/50 text-neutral-800 shadow-neutral-900/5 shadow-2xl'
                    }`}
                  >
                    <a
                      href="mailto:liangelyp@gmail.com"
                      onClick={() => setAvailableMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                        activeTab === 'GAMES'
                          ? 'hover:bg-neutral-800 text-neutral-200'
                          : 'hover:bg-neutral-50 text-neutral-800 font-sans'
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
                          ? 'hover:bg-neutral-800 text-neutral-200'
                          : 'hover:bg-neutral-50 text-neutral-800 font-sans'
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

          {activeTab === 'GAMES' && myPlayer && (
            <div className="hidden sm:flex items-center gap-2 bg-[#201f1f] border border-[#3C48C3]/30 px-3 py-1 bg-opacity-65 rounded-full">
              <img src={myPlayer.avatar} alt={myPlayer.name} className="w-4 h-4 rounded-full" />
              <span className="font-sans text-[11px] font-bold text-white truncate max-w-[80px]">
                {myPlayer.name}
              </span>
            </div>
          )}

          {/* Mobile landscape & Burger menu toggle buttons (Always shown in game tab) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`block p-2 rounded-lg hover:bg-surface-container-high/50 transition-colors z-[100] ${
              activeTab === 'GAMES' ? '' : 'lg:hidden'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'GAMES' ? 'text-[#3C48C3]' : 'text-primary'}`}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile/Burger Drawer Overlay (Burger overlay covers desktop too when inside activeTab === 'GAMES') */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 p-6 pt-24 flex flex-col justify-center items-center gap-6 shadow-lg backdrop-blur-2xl ${
              activeTab === 'GAMES' 
                ? 'bg-[#0e0e0e]/98 text-white' 
                : 'bg-[#fafafa]/95 text-on-surface lg:hidden'
            }`}
          >
            {[
              { id: 'IMPACT', label: 'Portfolio' },
              { id: 'VISION', label: 'My Vision' },
              { id: 'GAMES', label: 'Game' },
              { id: 'CONTACT', label: 'About' }
            ].map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`py-3 text-xl font-headline font-bold uppercase tracking-widest text-center transition-all duration-300 ${
                    activeTab === 'GAMES' 
                      ? isTabActive ? 'text-[#3C48C3] scale-105' : 'text-neutral-400 hover:text-white'
                      : isTabActive ? 'text-[#111110] scale-105' : 'text-on-surface-variant'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Study Dialog Modal */}
      <AnimatePresence>
        {selectedProjectForModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/50 backdrop-blur-md overflow-hidden select-none"
            onClick={() => setSelectedProjectForModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-2xl border border-neutral-200/80 rounded-3xl w-full max-h-[88vh] sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-neutral-900 max-w-4xl"
            >
              {/* Modal Top Bar */}
              <div className="flex justify-between items-center px-6 sm:px-8 py-4 border-b border-neutral-100 bg-neutral-50/70">
                <div className="flex items-center gap-3">
                  {selectedProjectForModal.tags?.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border bg-neutral-150/50 border-neutral-200/50 text-neutral-600 shadow-3xs"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="material-symbols-outlined text-black text-lg leading-none shrink-0" aria-hidden="true">
                    {selectedProjectForModal.icon}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSelectedProjectForModal(null)}
                  className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:text-black hover:border-neutral-300 flex items-center justify-center text-neutral-500 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-3xs"
                >
                  <span className="material-symbols-outlined text-base font-bold leading-none">close</span>
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto style-scrollbar text-left p-6 sm:p-8 md:p-10 space-y-8 bg-white">
                <div className="space-y-4">
                  <h2 className="font-headline text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
                    {selectedProjectForModal.title}
                  </h2>

                  {/* Empirical Key Metrics inside Modal for clean data presentation */}
                  {selectedProjectForModal.metrics && selectedProjectForModal.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-b border-neutral-100">
                      {selectedProjectForModal.metrics.map((metric: any, mIdx: number) => (
                        <div key={mIdx} className="space-y-1">
                          <div className="font-headline text-2xl sm:text-3xl font-black text-black tracking-tight">
                            {metric.value}
                          </div>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-5 bg-neutral-50/80 rounded-2xl border border-neutral-200/50 select-text">
                    <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                      <strong className="text-neutral-800 font-semibold uppercase font-mono text-[9px] tracking-widest block mb-1">The Challenge</strong>
                      {selectedProjectForModal.challenge}
                    </p>
                  </div>
                </div>

                    {/* Dynamic Block-Based Narrative Case Study Flow */}
                    {selectedProjectForModal.blocks && selectedProjectForModal.blocks.length > 0 ? (
                      <div className="space-y-6 sm:space-y-8 select-text">
                        {selectedProjectForModal.blocks.map((block: any, idx: number) => {
                          switch (block.type) {
                            case 'text':
                              return (
                                <div key={idx} className="space-y-4 select-text">
                                  {block.title && (
                                    <h4 className="font-headline text-base sm:text-lg font-bold text-neutral-900 uppercase tracking-wider font-mono border-b border-neutral-100 pb-1.5 pt-2">
                                      {block.title}
                                    </h4>
                                  )}
                                  
                                  {block.paragraphs && block.paragraphs.length > 0 && (
                                    <div className="space-y-3.5">
                                      {block.paragraphs.map((para: string, pIdx: number) => (
                                        <p key={pIdx} className="text-neutral-600 font-sans text-xs sm:text-sm leading-relaxed">
                                          {para}
                                        </p>
                                      ))}
                                    </div>
                                  )}

                                  {block.bulletPoints && block.bulletPoints.length > 0 && (
                                    <div className="space-y-4 bg-neutral-50 p-5 sm:p-6 rounded-2xl border border-neutral-200/50 mt-4 text-left">
                                      {block.title && (
                                        <h5 className="font-headline text-xs font-bold text-black uppercase tracking-wider font-mono mb-2">
                                          {block.title} Key Action Points
                                        </h5>
                                      )}
                                      <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                                        {block.bulletPoints.map((bullet: string, bIdx: number) => (
                                          <li key={bIdx} className="flex items-start gap-2.5">
                                            <span className="text-black font-black text-sm select-none leading-none mt-0.5">•</span>
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );

                        case 'image':
                          return (
                            <div key={idx} className="space-y-2 select-none">
                              <div className="overflow-hidden rounded-xl border border-neutral-250 group/img relative bg-neutral-900 aspect-video sm:aspect-[21/9] shadow-3xs">
                                <img 
                                  src={getDirectDriveUrl(block.imageUrl || block.carouselImages?.[0])} 
                                  alt={block.imageCaption || "Case study graphics block"} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover/img:scale-101 transition-transform duration-700 ease-out brightness-[0.98] group-hover/img:brightness-100"
                                />
                              </div>
                              {block.imageCaption && (
                                <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
                                  {block.imageCaption}
                                </p>
                              )}
                            </div>
                          );

                        case 'carousel':
                          return (
                            <CarouselBlock key={idx} block={block} getDirectDriveUrl={getDirectDriveUrl} />
                          );

                        case 'video':
                          const isEmbed = block.videoUrl?.includes('youtube.com') || 
                                          block.videoUrl?.includes('youtu.be') || 
                                          block.videoUrl?.includes('vimeo.com') ||
                                          block.videoUrl?.includes('drive.google.com') ||
                                          block.videoUrl?.includes('embed');
                          return (
                            <div key={idx} className="space-y-2 select-none">
                              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-250 bg-neutral-950 shadow-3xs">
                                {isEmbed ? (
                                  <iframe 
                                    src={getEmbedUrl(block.videoUrl)} 
                                    title="Video presentation player"
                                    className="absolute inset-0 w-full h-full border-0"
                                    style={{ border: 0 }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video 
                                    src={block.videoUrl} 
                                    controls 
                                    playsInline
                                    preload="metadata"
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                )}
                              </div>

                              {block.videoCaption && (
                                <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
                                  {block.videoCaption}
                                </p>
                              )}
                            </div>
                          );

                        case 'pdf':
                          return (
                            <div key={idx} className="space-y-2 select-none">
                              <div className="relative bg-neutral-150 rounded-xl overflow-hidden border border-neutral-250 aspect-video sm:aspect-[21/9] flex flex-col shadow-3xs group">
                                <iframe 
                                  src={getEmbedUrl(block.pdfUrl)}
                                  className="w-full h-full border-0 rounded-xl bg-neutral-100"
                                  title="Case study PDF document"
                                />
                                <div className="absolute top-3 right-3 opacity-90 hover:opacity-100 transition-opacity">
                                  <a 
                                    href={block.pdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-mono text-[9px] text-black bg-white hover:bg-black hover:text-white border border-neutral-200 hover:border-black px-2.5 py-1 rounded-full font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                  >
                                    Open PDF
                                    <span className="material-symbols-outlined text-[10px] font-bold">open_in_new</span>
                                  </a>
                                </div>
                              </div>

                              {block.pdfCaption && (
                                <p className="font-sans text-xs text-neutral-500 italic mt-2 select-text pl-0.5">
                                  {block.pdfCaption}
                                </p>
                              )}
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}

                    {/* Styled Footer Badge at the end of deep-dive blocks flow */}
                    {selectedProjectForModal.footerBadge && (
                      <div className="pt-4 border-t border-neutral-150 select-none">
                        <div className="bg-neutral-50/90 text-neutral-600 border border-neutral-200/80 p-3.5 rounded-2xl font-mono font-bold text-[10px] tracking-widest text-center uppercase shadow-3xs">
                          {selectedProjectForModal.footerBadge}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-neutral-400 text-xs text-center py-8">
                    No modules or narrative blocks found.
                  </div>
                )}
              </div>

              {/* Modal Bottom Footer */}
              <div className="px-6 sm:px-8 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForModal(null)}
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-3xs"
                >
                  Close Case Study
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Content Container */}
      <main className="relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col pt-20 pb-6">
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
            {activeTab === 'VISION' && renderVision()}
            {activeTab === 'CONTACT' && renderContact()}
            
            {activeTab === 'GAMES' && (
              <GameSection onPlayerJoin={(player) => setMyPlayer(player)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Available Indicator for Mobile Portrait */}
      <div className="fixed bottom-6 right-6 z-50 block sm:hidden">
        <div className="relative">
          <button 
            onClick={() => setFloatingMenuOpen(!floatingMenuOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full shadow-lg border transition-all cursor-pointer ${
              activeTab === 'GAMES'
                ? 'bg-green-500/90 border-green-500/40 text-green-100 backdrop-blur-md'
                : 'bg-white/95 border-neutral-250 text-emerald-800 font-sans font-bold shadow-md'
            }`}
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
              i'm available
            </span>
            <span className="material-symbols-outlined text-[12px] opacity-70">expand_more</span>
          </button>

          <AnimatePresence>
            {floatingMenuOpen && (
              <>
                {/* Invisible backdrop to close menu when clicking outside */}
                <div 
                  className="fixed inset-0 z-[19]" 
                  onClick={() => setFloatingMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 bottom-full mb-3 w-52 rounded-2xl p-2 shadow-xl border z-20 backdrop-blur-xl ${
                    activeTab === 'GAMES'
                      ? 'bg-[#121212]/95 border-neutral-800 text-white shadow-black/80 shadow-2xl'
                      : 'bg-white/95 border-neutral-200/50 text-neutral-800 shadow-neutral-900/5 shadow-2xl'
                  }`}
                >
                  <a
                    href="mailto:liangelyp@gmail.com"
                    onClick={() => setFloatingMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                      activeTab === 'GAMES'
                        ? 'hover:bg-neutral-800 text-neutral-200'
                        : 'hover:bg-neutral-50 text-neutral-800 font-sans'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    Contact by Mail
                  </a>
                  <a
                    href="https://wa.me/5491156424162?text=Hello%20Lia!%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you."
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setFloatingMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                      activeTab === 'GAMES'
                        ? 'hover:bg-neutral-800 text-neutral-200'
                        : 'hover:bg-neutral-50 text-neutral-800 font-sans'
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
      </div>

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
              Sr. Product Designer UX / UI Lead
            </p>
          </div>
          <div className="sm:text-right space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest font-black text-black">
              B2B SAAS, AI & ENTERPRISE SYSTEMS
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
