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
import { IllowCaseStudy } from './components/IllowCaseStudy';

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
        onClick={() => setActiveSlide(prev => (prev === 0 ? images.length - 1 : prev - 1))}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10 animate-fade-in"
      >
        <span className="material-symbols-outlined text-xs font-bold leading-none">chevron_left</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveSlide(prev => (prev === images.length - 1 ? 0 : prev + 1))}
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
            onClick={() => setActiveSlide(idx)}
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
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#2563eb] flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95 z-10"
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
      className="group relative custom-glass border border-neutral-150/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 transition-all duration-500 ease-out shadow-xs hover:shadow-[0_24px_48px_rgba(37,99,235,0.06),0_1px_3px_rgba(37,99,235,0.02)] hover:border-blue-200/80 hover:bg-white/95 hover:-translate-y-1.5 cursor-pointer select-none overflow-hidden"
    >
      {/* Subtle background glow inspired by Pomelli */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {project.tags?.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase font-mono border bg-neutral-100/70 border-neutral-200/40 text-neutral-500 shadow-3xs group-hover:bg-blue-50 group-hover:text-[#2563eb] group-hover:border-blue-100 transition-all duration-500"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="material-symbols-outlined text-neutral-400 group-hover:text-[#2563eb] group-hover:scale-110 transition-all duration-500 text-lg shrink-0">
          {project.icon}
        </span>
      </div>

      {/* Title & Challenge Description */}
      <div className="space-y-2">
        <h3 className="font-headline text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-black transition-colors duration-300">
          {project.title}
          <span className="inline-block text-[#2563eb] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 ml-2 font-sans font-normal text-lg sm:text-xl">
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

          if (firstMediaBlock.type === 'image' && firstMediaBlock.imageUrl) {
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="overflow-hidden rounded-lg border border-neutral-200/50 relative bg-neutral-900 aspect-video shadow-3xs">
                  <img 
                    src={getDirectDriveUrl(firstMediaBlock.imageUrl)} 
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
                                firstMediaBlock.videoUrl.includes('embed');
            return (
              <div className="space-y-2.5 bg-neutral-50/40 border border-neutral-200/40 rounded-xl p-3 sm:p-4 group/media transition-all duration-500 hover:border-neutral-250">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-neutral-200/50 bg-neutral-950 shadow-3xs">
                  {isVideoEmbed ? (
                    <iframe 
                      src={firstMediaBlock.videoUrl} 
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
                    src={firstMediaBlock.pdfUrl}
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
        <div className="p-3.5 bg-neutral-50/60 rounded-xl border border-neutral-200/30 italic text-[11px] sm:text-xs text-neutral-600 leading-relaxed group-hover:bg-blue-50/15 group-hover:border-blue-100/40 transition-all duration-500">
          <strong className="text-neutral-800 font-bold not-italic block mb-0.5 group-hover:text-[#2563eb] transition-colors">Key Result Integration:</strong> 
          {project.impact}
        </div>
        
        <div className="w-full">
          <button
            type="button"
            className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-3xs group-hover:bg-neutral-950 group-hover:text-white group-hover:border-neutral-950 group-hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            Explore Case Study
            <span className="material-symbols-outlined text-xs font-bold group-hover:translate-x-0.5 transition-transform duration-300">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState<string>(INITIAL_GAME_ID);
  // Shadow the global GAME_ID so that all inside functions refer to our reactive roomId state!
  const GAME_ID = roomId;

  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'HOME',
    players: [],
    cards: DEFAULT_CARDS,
    currentCardIndex: 0,
    timer: 90,
    mode: 'PAPELITO',
    currentTurnPlayerId: null,
    readyCount: 0,
    turnOrder: [],
  });

  const [selectedNickname, setSelectedNickname] = useState<string | null>(localStorage.getItem(NICKNAME_KEY));
  const [tempNickname, setTempNickname] = useState(localStorage.getItem(NICKNAME_KEY) || '');
  const [papelitoInput, setPapelitoInput] = useState('');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string | null>(localStorage.getItem(AVATAR_KEY) || 'avatar-1');
  const [showRoundAnimation, setShowRoundAnimation] = useState<number | null>(null);
  const lastPlayedSoundRef = useRef<string | null>(null);

  // Portfolio Navigation & Contact Form State
  const [activeTab, setActiveTab] = useState<'IMPACT' | 'PROCESS' | 'VISION' | 'GAMES' | 'CONTACT'>('IMPACT');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('UX Consultancy');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [availableMenuOpen, setAvailableMenuOpen] = useState(false);
  const [useCaseFilter, setUseCaseFilter] = useState<'All' | 'UX Strategy' | 'Design Systems' | 'Information Architecture' | 'Branding'>('All');
  const [showGameInstructions, setShowGameInstructions] = useState(true);

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
  
  const soundCacheRef = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = (url: string) => {
    console.log(`[Sound] Attempting to play: ${url}`);
    try {
      let audio = soundCacheRef.current[url];
      if (!audio) {
        audio = new Audio(url);
        audio.preload = 'auto';
        soundCacheRef.current[url] = audio;
      } else {
        audio.currentTime = 0;
      }
      audio.volume = 0.8;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("[Sound] Playback failed/blocked:", error);
        });
      }
    } catch (error) {
      console.warn("[Sound] Error playing audio:", error);
    }
  };

  const SOUNDS = {
    JOIN: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    START: 'https://raw.githubusercontent.com/liangely/holis-game/main/estan-listos-chicos.mp3',
    VOTE: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    WIN: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    TICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    NEXT_CARD: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    ROUND_START: 'https://raw.githubusercontent.com/liangely/holis-game/main/estan-listos-chicos.mp3',
    TIMEOUT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    NEXT: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    FINISH: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3',
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consolidated Sound Manager
  useEffect(() => {
    if (gameState.status === 'GAME') {
      if (gameState.currentCardIndex === 0) {
        // Start of game or round
        const playKey = `start-${gameState.currentRound || 1}`;
        if (lastPlayedSoundRef.current !== playKey) {
          // Small delay to ensure state is settled and UI has transitioned
          const timer = setTimeout(() => {
            console.log("[Sound] Triggering START sound now...");
            playSound(SOUNDS.START);
          }, 500);
          lastPlayedSoundRef.current = playKey;
          return () => clearTimeout(timer);
        }
      } else {
        // Card change
        const playKey = `card-${gameState.currentCardIndex}`;
        if (lastPlayedSoundRef.current !== playKey) {
          console.log(`[Sound] Triggering NEXT sound for card ${gameState.currentCardIndex}...`);
          playSound(SOUNDS.NEXT);
          lastPlayedSoundRef.current = playKey;
        }
      }
    } else if (gameState.status === 'RESULTS') {
      const playKey = 'results';
      if (lastPlayedSoundRef.current !== playKey) {
        console.log("[Sound] Triggering FINISH sound...");
        playSound(SOUNDS.FINISH);
        lastPlayedSoundRef.current = playKey;
      }
    } else {
      // Reset when back to HOME or LOBBY
      lastPlayedSoundRef.current = null;
    }
  }, [gameState.status, gameState.currentCardIndex, gameState.currentRound]);

  // Show winner notification to everyone
  useEffect(() => {
    if (gameState.isShowingWinner && gameState.lastWinnerName) {
      if (gameState.lastWinnerId === 'none') {
        toast.error("Nobody guessed... ❌", {
          description: "Next time!",
          duration: 1500,
        });
      } else {
        toast.success(`Point for ${gameState.lastWinnerName}! 🏆`, {
          description: "+10 points",
          duration: 1500,
        });
        playSound(SOUNDS.WIN);
      }
    }
  }, [gameState.isShowingWinner, gameState.lastWinnerName, gameState.lastWinnerId]);

  // Initialize Local User ID
  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsConnected(true);
  }, []);

  // Initialize Game State Listener
  useEffect(() => {
    if (!isConnected || !userId) return;

    const gameRef = doc(db, 'games', GAME_ID);
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as GameState;
        setGameState(data);
        
        // If user is already in the players list, they have "joined"
        const me = data.players.find(p => p.id === userId);
        if (me && !selectedNickname) {
          setSelectedNickname(me.name);
        }
      } else {
        // Initialize game if it doesn't exist
        setDoc(gameRef, {
          status: 'HOME',
          players: [],
          cards: shuffleArray(DEFAULT_CARDS),
          currentCardIndex: 0,
          timer: 90,
          mode: 'PAPELITO',
          currentTurnPlayerId: null,
          readyCount: 0,
          turnOrder: [],
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `games/${GAME_ID}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `games/${GAME_ID}`);
    });

    return () => unsubscribe();
  }, [isConnected, userId, roomId]);

  // Timer Logic (Client-side sync)
  useEffect(() => {
    if (gameState.status !== 'GAME' || !userId || gameState.isShowingWinner) return;

    // Only the first player (host-ish) handles the timer to avoid multiple decrements
    const isHost = gameState.players[0]?.id === userId;
    if (!isHost) return;

    const interval = setInterval(() => {
      if (gameState.timer > 0) {
        updateDoc(doc(db, 'games', GAME_ID), {
          timer: gameState.timer - 1
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
      } else {
        if (gameState.mode === 'PAPELITO') {
          // On timeout in Papelito, we just pass the turn but keep the same card
          // so the next player can try to explain it.
          const turnOrder = gameState.turnOrder || gameState.players.map(p => p.id);
          const currentTurnIdx = turnOrder.indexOf(gameState.currentTurnPlayerId || '');
          const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
          
          updateDoc(doc(db, 'games', GAME_ID), {
            currentTurnPlayerId: turnOrder[nextTurnIdx],
            timer: 90
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
        } else {
          updateDoc(doc(db, 'games', GAME_ID), {
            status: 'RESULTS'
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, gameState.timer, gameState.players, userId, gameState.mode, gameState.turnOrder, gameState.currentTurnPlayerId, gameState.isShowingWinner]);

  // Round Animation Logic (Visual only, sound handled by manager)
  useEffect(() => {
    if (gameState.status === 'GAME' && gameState.mode === 'PAPELITO' && gameState.currentRound) {
      setShowRoundAnimation(gameState.currentRound);
      const timer = setTimeout(() => setShowRoundAnimation(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentRound, gameState.status, gameState.mode]);

  const joinGame = async () => {
    if (!tempNickname.trim() || !selectedAvatarSeed) return;

    try {
      const currentUserId = userId;
      if (!currentUserId) {
        console.warn("No user ID available yet.");
        return;
      }

      const name = tempNickname.trim();
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`;
      const newPlayer: Player = { id: currentUserId, name, avatar, score: 0, isReady: false, isHost: false, papelitos: [] };
      
      const gameRef = doc(db, 'games', GAME_ID);
      const snapshot = await getDoc(gameRef);
      
      let updatedPlayers: Player[] = [];
      let currentStatus = 'HOME';
      let existingData: any = {};

      if (snapshot.exists()) {
        existingData = snapshot.data();
        updatedPlayers = [...(existingData.players || [])];
        currentStatus = existingData.status || 'HOME';
        
        // Check if player already exists
        const existingIdx = updatedPlayers.findIndex((p: Player) => p.id === currentUserId);
        if (existingIdx === -1) {
          updatedPlayers.push(newPlayer);
        } else {
          updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], name, avatar };
        }
      } else {
        updatedPlayers = [newPlayer];
      }

      const nextStatus = (currentStatus === 'HOME' || currentStatus === 'RESULTS' || (currentStatus === 'GAME' && updatedPlayers.length <= 1)) 
        ? 'LOBBY' 
        : currentStatus;

      await setDoc(gameRef, {
        ...existingData,
        players: updatedPlayers,
        status: nextStatus,
        cards: existingData.cards || DEFAULT_CARDS,
        currentCardIndex: existingData.currentCardIndex || 0,
        timer: existingData.timer !== undefined ? existingData.timer : 90,
        mode: existingData.mode || 'PAPELITO',
        currentTurnPlayerId: existingData.currentTurnPlayerId || null,
        readyCount: updatedPlayers.filter(p => p.isReady).length,
        turnOrder: existingData.turnOrder || [],
      });
      
      localStorage.setItem(NICKNAME_KEY, name);
      localStorage.setItem(AVATAR_KEY, selectedAvatarSeed);
      setSelectedNickname(name);
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const goHome = async () => {
    if (!userId) {
      setSelectedNickname(null);
      return;
    }
    
    try {
      const gameRef = doc(db, 'games', GAME_ID);
      const snapshot = await getDoc(gameRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const players = (data.players || []) as Player[];
        const filteredPlayers = players.filter(p => p.id !== userId);
        
        const updates: any = { 
          players: filteredPlayers,
          readyCount: filteredPlayers.filter(p => p.isReady).length
        };
        
        if (filteredPlayers.length <= 1 && data.status === 'GAME') {
          updates.status = 'LOBBY';
        }

        if (filteredPlayers.length === 0) {
          updates.status = 'HOME';
          updates.readyCount = 0;
        }

        await updateDoc(gameRef, updates);
      }
    } catch (error) {
      console.error("Error leaving game:", error);
    } finally {
      setSelectedNickname(null);
      setTempNickname('');
    }
  };

  const setReady = async () => {
    if (!userId) return;
    
    // Unlock audio on user interaction
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    silentAudio.play().catch(() => {});

    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const players = snapshot.data().players as Player[];
    const playerIdx = players.findIndex(p => p.id === userId);
    if (playerIdx === -1 || players[playerIdx].isReady) return;

    players[playerIdx].isReady = true;
    const readyPlayersCount = players.filter(p => p.isReady).length;

    const updates: any = {
      players,
      readyCount: readyPlayersCount
    };

    if (readyPlayersCount === players.length && players.length >= 3) {
      if (snapshot.data().mode === 'PAPELITO') {
        const allPapelitos: GameCard[] = [];
        players.forEach(p => {
          if (p.papelitos) {
            p.papelitos.forEach((text, i) => {
              allPapelitos.push({
                id: `papelito-${p.id}-${i}`,
                category: 'PAPELITO',
                content: text,
                emoji: '📝'
              });
            });
          }
        });
        updates.cards = shuffleArray(allPapelitos);
        updates.currentRound = 1;
      }
      
      updates.status = 'GAME';
      updates.currentCardIndex = 0;
      updates.timer = 90;
      updates.isShowingWinner = false;
      updates.lastWinnerName = null;
      const turnOrder = shuffleArray(players.map(p => p.id));
      updates.turnOrder = turnOrder;
      updates.currentTurnPlayerId = turnOrder[0];
    }

    try {
      await updateDoc(gameRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      toast.error("Error reading file.");
      setIsUploading(false);
    };

    reader.onload = async (event) => {
      let text = event.target?.result as string;
      console.log("File read successfully, length:", text.length);
      
      if (!text || text.trim().length < 10) {
        toast.error("The file seems empty or too short.");
        setIsUploading(false);
        return;
      }

      // Truncate text if it's too long to avoid token limits (approx 30k characters is safe for flash)
      if (text.length > 30000) {
        console.log("Truncating text from", text.length, "to 30000");
        text = text.substring(0, 30000);
      }

      try {
        console.log("Initializing Gemini API...");
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.error("GEMINI_API_KEY is missing from process.env");
          throw new Error("API Key (GEMINI_API_KEY) is not configured. Please check your secrets under the settings menu.");
        }

        const ai = new GoogleGenAI({ apiKey });
        console.log("Calling generateContent with model gemini-3-flash-preview...");
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Eres un experto en crear juegos de fiesta. Basándote en el siguiente historial de chat de WhatsApp, genera 30 cartas divertidas para el juego "Holis Game".
          
          El chat es: """${text}"""

          Debes generar cartas en estas 3 categorías específicas, extrayendo nombres reales y frases del chat:
          1. "QUIÉN DIJO ESTO": Frases icónicas, divertidas o polémicas dichas por personas en el chat. El 'content' es la frase exacta (sin el nombre) y el 'answer' es el nombre de la persona que la dijo.
          2. "TABÚ": Palabras, temas o "chistes internos" recurrentes en el chat. El 'content' es la palabra principal y 'tabooWords' son 3 palabras relacionadas que NO se pueden decir para describirla.
          3. "ACTUAR": Situaciones, manías o comportamientos típicos de los integrantes del grupo que se mencionen o se deduzcan del chat. El 'content' es la acción corta y el 'context' es una breve descripción de cómo actuarla.

          Devuelve un JSON que cumpla estrictamente con este formato:
          [{ 
            "category": "QUIÉN DIJO ESTO" | "TABÚ" | "ACTUAR", 
            "content": "texto principal", 
            "emoji": "un emoji relacionado",
            "answer": "nombre (solo para QUIÉN DIJO ESTO)",
            "tabooWords": ["palabra1", "palabra2", "palabra3"] (solo para TABÚ),
            "context": "descripción de la actuación" (solo para ACTUAR)
          }]`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "La categoría de la carta: QUIÉN DIJO ESTO, TABÚ o ACTUAR" },
                  content: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  tabooWords: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  context: { type: Type.STRING },
                },
                required: ["category", "content", "emoji"],
              },
            },
          },
        });

        console.log("Gemini response received");
        if (!response.text) {
          throw new Error("La IA no devolvió ninguna respuesta. Intenta con un chat más corto.");
        }

        const generatedData = JSON.parse(response.text);
        console.log("Generated cards count:", generatedData.length);

        if (!Array.isArray(generatedData) || generatedData.length === 0) {
          throw new Error("The AI could not generate valid cards from this chat.");
        }

        const newCards = shuffleArray(generatedData.map((c: any, i: number) => ({ 
          ...c, 
          id: `ai-${Date.now()}-${i}` 
        })));
        
        await updateDoc(doc(db, 'games', GAME_ID), { cards: newCards });
        toast.success("Custom deck generated successfully! 🔥");
      } catch (error: any) {
        console.error("Error generating cards:", error);
        const errorMessage = error.message || "Unknown error";
        toast.error(`Error generating cards: ${errorMessage}`, {
          description: "Make sure the file is a WhatsApp chat exports .txt file and the GEMINI_API_KEY is configured.",
          duration: 5000
        });
        // Fallback to default cards if generation fails
        await updateDoc(doc(db, 'games', GAME_ID), { cards: shuffleArray(DEFAULT_CARDS) });
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const useDemoCards = async () => {
    try {
      await updateDoc(doc(db, 'games', GAME_ID), { cards: shuffleArray(DEFAULT_CARDS) });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const updateMode = async (mode: 'PAPELITO' | 'HOLIS' | 'PRIMOS' | 'WHATSAPP') => {
    try {
      const updates: any = {
        mode,
        currentCardIndex: 0
      };
      if (mode === 'PRIMOS') {
        updates.cards = shuffleAlternating(PRIMOS_CARDS);
      } else if (mode === 'HOLIS') {
        updates.cards = shuffleAlternating(HOLIS_CARDS);
      } else if (mode === 'PAPELITO') {
        updates.papelitosPerPlayer = 1; // Default 1 papelito
        updates.papelitoTheme = 'libre'; // Default theme
        updates.papelitoCustomTheme = ''; // Default custom theme
      } else if (mode === 'WHATSAPP') {
        // Default to some cards if none uploaded yet
        updates.cards = shuffleArray(DEFAULT_CARDS);
      }
      await updateDoc(doc(db, 'games', GAME_ID), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const updatePapelitoSettings = async (settings: { papelitosPerPlayer?: number, papelitoTheme?: string, papelitoCustomTheme?: string }) => {
    try {
      await updateDoc(doc(db, 'games', GAME_ID), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const shufflePapelitoTheme = async () => {
    const randomTheme = PAPELITO_RANDOM_THEMES[Math.floor(Math.random() * PAPELITO_RANDOM_THEMES.length)];
    await updatePapelitoSettings({ papelitoTheme: 'custom', papelitoCustomTheme: randomTheme });
  };

  const addPapelito = async () => {
    const word = papelitoInput.trim();
    if (!word || !userId) return;
    
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      const snapshot = await getDoc(gameRef);
      if (!snapshot.exists()) return;
      const players = [...snapshot.data().players] as Player[];
      const playerIdx = players.findIndex(p => p.id === userId);
      if (playerIdx === -1) return;
      
      const currentPapelitos = players[playerIdx].papelitos || [];
      if (currentPapelitos.length >= (snapshot.data().papelitosPerPlayer || 1)) return;

      players[playerIdx].papelitos = [...currentPapelitos, word];
      await updateDoc(gameRef, { players });
      setPapelitoInput('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const removePapelito = async (index: number) => {
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      const snapshot = await getDoc(gameRef);
      if (!snapshot.exists()) return;
      const players = [...snapshot.data().players] as Player[];
      const playerIdx = players.findIndex(p => p.id === userId);
      if (playerIdx === -1) return;
      
      const currentPapelitos = players[playerIdx].papelitos || [];
      const newPapelitos = currentPapelitos.filter((_, i) => i !== index);

      players[playerIdx].papelitos = newPapelitos;
      await updateDoc(gameRef, { players });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const voteWinner = async (winnerId: string) => {
    if (gameState.isShowingWinner) return;
    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const data = snapshot.data() as GameState;
    const players = [...data.players];
    let winnerName = null;
    
    if (winnerId) {
      const winnerIdx = players.findIndex(p => p.id === winnerId);
      if (winnerIdx !== -1) {
        players[winnerIdx].score += 10;
        winnerName = players[winnerIdx].name;
      }
    }

    // Phase 1: Show winner to everyone
    try {
      await updateDoc(gameRef, {
        isShowingWinner: true,
        lastWinnerId: winnerId || 'none',
        lastWinnerName: winnerName || (winnerId ? 'Alguien' : 'Nadie'),
        players
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
      return;
    }

    // Wait for 1 second to let everyone see the notification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Phase 2: Move to next card
    const updates: any = { 
      isShowingWinner: false,
      lastWinnerId: null,
      lastWinnerName: null
    };
    
    playSound(SOUNDS.NEXT_CARD);

    if (data.mode === 'PAPELITO') {
      const isLastCard = data.currentCardIndex >= (data.cards?.length || 0) - 1;
      const isLastRound = (data.currentRound || 1) >= 3;

      if (!isLastCard) {
        // Move to next card and rotate turn
        updates.currentCardIndex = data.currentCardIndex + 1;
        updates.timer = 90;
        
        const turnOrder = data.turnOrder || data.players.map(p => p.id);
        const currentTurnIdx = turnOrder.indexOf(data.currentTurnPlayerId || '');
        const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
        updates.currentTurnPlayerId = turnOrder[nextTurnIdx];
      } else if (!isLastRound) {
        // Transition to next round, reshuffle cards, and rotate turn
        updates.currentRound = (data.currentRound || 1) + 1;
        updates.currentCardIndex = 0;
        updates.cards = shuffleArray(data.cards || []);
        updates.timer = 90;

        const turnOrder = data.turnOrder || data.players.map(p => p.id);
        const currentTurnIdx = turnOrder.indexOf(data.currentTurnPlayerId || '');
        const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
        updates.currentTurnPlayerId = turnOrder[nextTurnIdx];
      } else {
        updates.status = 'RESULTS';
      }
    } else {
      const totalTurns = data.players.length * 3;
      if (data.currentCardIndex < totalTurns - 1 && data.currentCardIndex < data.cards.length - 1) {
        updates.currentCardIndex = data.currentCardIndex + 1;
        
        const turnOrder = data.turnOrder || data.players.map(p => p.id);
        const currentTurnIdx = turnOrder.indexOf(data.currentTurnPlayerId || '');
        const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
        updates.currentTurnPlayerId = turnOrder[nextTurnIdx];
        updates.timer = 90;
      } else {
        updates.status = 'RESULTS';
      }
    }

    try {
      await updateDoc(gameRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const resetGame = async () => {
    try {
      await setDoc(doc(db, 'games', GAME_ID), {
        status: 'HOME',
        players: [],
        cards: shuffleArray(DEFAULT_CARDS),
        currentCardIndex: 0,
        timer: 90,
        mode: 'PAPELITO',
        currentTurnPlayerId: null,
        readyCount: 0,
        turnOrder: [],
        currentRound: 1,
        papelitosPerPlayer: 1,
        lastWinnerId: null,
        lastWinnerName: null,
        isShowingWinner: false,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `games/${GAME_ID}`);
    }
  };

  const restartGame = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    const players = data.players.map((p: Player) => ({ ...p, score: 0, isReady: false, papelitos: [] }));
    
    // Shuffle cards if they are exhausted or for a fresh start
    let shuffledCards = data.cards;
    if (data.currentCardIndex >= data.cards.length - (players.length * 3)) {
      shuffledCards = data.mode === 'PRIMOS' ? shuffleAlternating(PRIMOS_CARDS) : shuffleArray(data.cards);
    }

    try {
      await updateDoc(gameRef, {
        status: 'LOBBY',
        players,
        cards: shuffledCards,
        readyCount: 0,
        currentCardIndex: 0,
        timer: 90,
        lastWinnerId: null,
        lastWinnerName: null,
        isShowingWinner: false,
        currentRound: 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const continueWithPoints = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    const players = data.players.map((p: Player) => ({ ...p, isReady: false }));
    
    let shuffledCards = data.cards;
    if (data.currentCardIndex >= data.cards.length - (players.length * 3)) {
      shuffledCards = shuffleArray(data.cards);
    }

    try {
      await updateDoc(gameRef, {
        status: 'LOBBY',
        players,
        cards: shuffledCards,
        readyCount: 0,
        currentCardIndex: 0,
        timer: 90,
        lastWinnerId: null,
        lastWinnerName: null,
        isShowingWinner: false,
        currentRound: 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const myPlayer = gameState.players.find(p => p.id === userId);
  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === userId;

  const createPrivateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    // Dynamic smooth URL change without breaking iframe sandbox origins or reloading
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${newRoomId}`;
    try {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) {
      console.warn("Iframe history push restricted, relying on local state transition");
    }
    setRoomId(newRoomId);
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full p-8 text-center"
    >
      <div className="max-w-md mx-auto space-y-6 sm:space-y-8 bg-surface-container-high p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border-2 border-primary/20 shadow-2xl">
        <div className="space-y-4">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-primary ml-4">Your Nickname / Name</label>
          <input 
            type="text" 
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            placeholder="e.g. Party King"
            className="w-full bg-surface-container-highest border-2 border-outline-variant/30 rounded-2xl p-4 font-headline font-black uppercase text-on-surface focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-primary ml-4">Choose your Avatar</label>
          <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 scrollbar-hide">
            {Array.from({ length: 20 }).map((_, i) => {
              const seed = `avatar-${i + 1}`;
              const isSelected = selectedAvatarSeed === seed;
              return (
                <button
                  key={seed}
                  onClick={() => setSelectedAvatarSeed(seed)}
                  className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                    isSelected ? 'border-primary scale-110 shadow-[0_0_15px_rgba(255,137,171,0.4)]' : 'border-outline-variant/30 grayscale hover:grayscale-0 hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check size={20} className="text-on-primary-fixed" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {GAME_ID !== 'global-party' ? (
          <button 
            onClick={joinGame}
            disabled={!tempNickname.trim() || !selectedAvatarSeed}
            className={`w-full py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-headline font-black text-lg sm:text-2xl uppercase tracking-tight shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 px-4 ${
              !tempNickname.trim() || !selectedAvatarSeed
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                : 'bg-primary text-on-primary-fixed hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,137,171,0.3)]'
            }`}
          >
            <span className="truncate">ENTER ROOM</span>
            <ChevronRight className="shrink-0" />
          </button>
        ) : (
          <button 
            onClick={createPrivateRoom}
            className="w-full py-4 sm:py-6 bg-primary text-on-primary-fixed font-headline font-black text-lg sm:text-2xl uppercase tracking-tight rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,137,171,0.3)] active:scale-95 flex items-center justify-center gap-3 px-4 transition-all"
          >
            <Users size={22} className="shrink-0" />
            <span className="truncate">CREATE PRIVATE ROOM</span>
          </button>
        )}

        <div className="pt-6 border-t border-outline-variant/20 space-y-4">
          {GAME_ID !== 'global-party' && (
            <button 
              onClick={createPrivateRoom}
              className="w-full bg-surface-container-highest text-on-surface font-headline font-bold py-3.5 sm:py-4 text-xs sm:text-base rounded-2xl flex items-center justify-center gap-2 border-2 border-outline-variant/30 hover:bg-surface-bright transition-all px-4"
            >
              <Users size={18} className="shrink-0" />
              <span className="truncate">CREATE ANOTHER ROOM</span>
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-variant/30 rounded-full w-fit mx-auto">
            <div className={`w-2 h-2 rounded-full ${GAME_ID === 'global-party' ? 'bg-tertiary' : 'bg-primary animate-pulse'}`}></div>
            <span className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">
              {GAME_ID === 'global-party' ? 'NO ROOM SELECTED' : `ROOM: ${GAME_ID}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderLobby = () => {
    const myPlayer = gameState.players.find(p => p.id === userId);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full p-4 sm:p-8 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center bg-surface-container-high p-4 rounded-3xl border-2 border-primary/20 shadow-xl">
          <div className="flex items-center gap-3">
            <Users className="text-primary" size={24} />
            <h2 className="font-headline text-xl sm:text-2xl font-black uppercase tracking-tighter text-on-surface">Lobby</h2>
          </div>
          <div className="bg-primary/10 px-4 py-1 rounded-full border border-primary/20 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Waiting for Players</span>
            <button 
              onClick={resetGame}
              className="p-1 hover:bg-primary/20 rounded-full transition-all text-primary"
              title="Reset Room"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Game Mode</h3>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => updateMode('PAPELITO')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'PAPELITO' ? 'bg-secondary/10 border-secondary shadow-[0_0_15px_rgba(137,255,171,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Star size={20} className={gameState.mode === 'PAPELITO' ? 'text-secondary' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Papelito</span>
                </button>
                <button 
                  onClick={() => updateMode('HOLIS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'HOLIS' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(255,137,171,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Flame size={20} className={gameState.mode === 'HOLIS' ? 'text-primary' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Holis</span>
                </button>
                <button 
                  onClick={() => updateMode('PRIMOS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'PRIMOS' ? 'bg-tertiary/10 border-tertiary shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Users size={20} className={gameState.mode === 'PRIMOS' ? 'text-tertiary' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Primos</span>
                </button>
                <button 
                  onClick={() => updateMode('WHATSAPP')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'WHATSAPP' ? 'bg-error/10 border-error shadow-[0_0_15px_rgba(255,84,84,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Upload size={20} className={gameState.mode === 'WHATSAPP' ? 'text-error' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Custom</span>
                </button>
              </div>
            </div>

            {gameState.mode === 'PAPELITO' && (
              <div className="bg-surface-container-high p-4 rounded-[2rem] border-2 border-secondary/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary">Papelito Settings</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toast.info("Papelito: 3 Rounds. 1: Free Description, 2: Single Word, 3: Charades / Mimicry.")}
                      className="text-secondary/50 hover:text-secondary transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <Settings size={12} className="text-secondary/50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant">Papelitos</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          onClick={() => updatePapelitoSettings({ papelitosPerPlayer: num })}
                          className={`flex-1 py-1.5 rounded-lg border transition-all font-headline font-black text-xs ${
                            gameState.papelitosPerPlayer === num 
                              ? 'bg-secondary/10 border-secondary text-secondary' 
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant">Theme</p>
                    <div className="flex gap-1">
                      {['free', 'custom'].map(t => (
                        <button
                          key={t}
                          onClick={() => updatePapelitoSettings({ papelitoTheme: t })}
                          className={`flex-1 py-1.5 rounded-lg border transition-all font-headline font-black text-[9px] uppercase ${
                            gameState.papelitoTheme === t 
                              ? 'bg-secondary/10 border-secondary text-secondary' 
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        onClick={shufflePapelitoTheme}
                        className="p-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-secondary hover:text-secondary transition-all"
                      >
                        <Shuffle size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {gameState.papelitoTheme === 'custom' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <input 
                      type="text" 
                      value={gameState.papelitoCustomTheme || ''}
                      onChange={(e) => updatePapelitoSettings({ papelitoCustomTheme: e.target.value })}
                      placeholder="Write the round theme..."
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] text-on-surface focus:border-secondary outline-none transition-all"
                    />
                  </motion.div>
                )}

                <div className="pt-3 border-t border-outline-variant/20">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary mb-2">Your Phrase ({myPlayer?.papelitos?.length || 0} / {gameState.papelitosPerPlayer || 1})</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={papelitoInput}
                      onChange={(e) => setPapelitoInput(e.target.value)}
                      placeholder={gameState.papelitoTheme === 'free' ? "Write a phrase..." : `Theme: ${gameState.papelitoCustomTheme || '...'}...`}
                      className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] text-on-surface focus:border-secondary outline-none transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && addPapelito()}
                    />
                    <button 
                      onClick={addPapelito}
                      disabled={(myPlayer?.papelitos?.length || 0) >= (gameState.papelitosPerPlayer || 1)}
                      className="p-1.5 bg-secondary text-on-secondary-fixed rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {myPlayer?.papelitos?.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20">
                      <span className="text-[8px] font-black uppercase truncate max-w-[100px]">{p}</span>
                      <button 
                        onClick={() => removePapelito(i)}
                        className="hover:text-error transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState.mode === 'HOLIS' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Holis Deck</h3>
                  <Flame size={14} className="text-primary/50" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-body">Pre-loaded deck with the best Holis Game challenges.</p>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Deck Ready 🔥</span>
                </div>
              </div>
            )}

            {gameState.mode === 'PRIMOS' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-tertiary/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary">Primos Deck</h3>
                  <Users size={14} className="text-tertiary/50" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-body">Pre-loaded deck with family jokes and customized challenges.</p>
                <div className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Deck Ready 🔥</span>
                </div>
              </div>
            )}

            {gameState.mode === 'WHATSAPP' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-error/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-error">WhatsApp Deck (AI)</h3>
                  <Upload size={14} className="text-error/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-on-surface font-black uppercase tracking-widest">How it works?</p>
                  <ol className="text-[9px] text-on-surface-variant font-body list-decimal list-inside space-y-1">
                    <li>Go to your WhatsApp group</li>
                    <li>Settings {'>'} Export chat (without media)</li>
                    <li>Upload the .txt Chat file here</li>
                    <li>We generate custom challenges from your jokes!</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-container-highest rounded-2xl border-2 border-dashed border-outline-variant/50 text-on-surface-variant hover:border-error hover:text-error transition-all disabled:opacity-50"
                  >
                    {isUploading ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Generating...' : 'Upload Chat (.txt)'}</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".txt,text/plain" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Players ({gameState.players.length})</h3>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                {gameState.players.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-full">
                      <img src={player.avatar} alt={player.name} className={`w-full aspect-square rounded-2xl border-2 transition-all ${player.isReady ? 'border-primary shadow-[0_0_10px_rgba(255,137,171,0.3)]' : 'border-outline-variant/30 opacity-50'}`} />
                      {player.isReady && (
                        <div className="absolute -top-1 -right-1 bg-primary text-on-primary-fixed p-1 rounded-full shadow-lg">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-on-surface text-center truncate w-full px-0.5">
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {gameState.players.length < 3 && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} className="text-error shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-error leading-tight">
                  You need at least 3 players to start the game.
                </p>
              </div>
            )}
            <button 
              onClick={setReady}
              disabled={myPlayer?.isReady || gameState.players.length < 3 || (gameState.mode === 'PAPELITO' && (myPlayer?.papelitos?.length || 0) < (gameState.papelitosPerPlayer || 1))}
              className={`w-full py-6 rounded-3xl font-headline font-black text-2xl uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${
                myPlayer?.isReady || gameState.players.length < 3 || (gameState.mode === 'PAPELITO' && (myPlayer?.papelitos?.length || 0) < (gameState.papelitosPerPlayer || 1))
                  ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                  : 'bg-primary text-on-primary-fixed hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,137,171,0.4)]'
              }`}
            >
              {myPlayer?.isReady ? 'YOU ARE READY! 🔥' : 'I AM READY'}
            </button>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {gameState.readyCount} / {gameState.players.length} players ready
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGame = () => {
    const myPlayer = gameState.players.find(p => p.id === userId);
    if (gameState.status === 'GAME' && myPlayer && !myPlayer.isReady) return renderWaiting();
    
    const currentCard = gameState.cards[gameState.currentCardIndex];
    if (!currentCard) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl w-full p-6 flex flex-col items-center gap-8"
      >
        <div className="w-full flex justify-between items-center gap-4">
          <button 
            onClick={goHome}
            className="bg-surface-container-high p-3 rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-all shadow-lg"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
          
          <div className="flex-1 flex flex-col items-center gap-2">
            {gameState.mode === 'PAPELITO' && (
              <div className="bg-secondary/10 border border-secondary/20 px-4 py-1 rounded-full">
                <p className="text-[8px] font-black uppercase tracking-widest text-secondary text-center">
                  {gameState.currentRound === 1 ? 'Round 1: Description' : 
                   gameState.currentRound === 2 ? 'Round 2: One Word' : 
                   'Round 3: Mimicry'}
                </p>
              </div>
            )}
            <div className="flex justify-center gap-2">
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-full border border-primary/20 shadow-xl">
                <Timer className="text-primary" size={16} />
                <span className="font-headline font-black text-lg text-on-surface">{gameState.timer}s</span>
              </div>
              
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-full border border-primary/20 shadow-xl">
                {gameState.mode === 'HOLIS' ? <Flame className="text-primary" size={16} /> : 
                 gameState.mode === 'PRIMOS' ? <Users className="text-tertiary" size={16} /> : 
                 gameState.mode === 'WHATSAPP' ? <Upload className="text-error" size={16} /> :
                 <Star className="text-secondary" size={16} />}
                <span className="font-headline font-black text-[10px] uppercase tracking-widest text-on-surface">
                  {gameState.mode === 'HOLIS' ? 'Holis' : 
                   gameState.mode === 'PRIMOS' ? 'Primos' : 
                   gameState.mode === 'WHATSAPP' ? 'Custom' :
                   `Papelito R${gameState.currentRound}`}
                </span>
              </div>
            </div>
          </div>

          <div className="w-12 h-12 hidden sm:block"></div>
        </div>

        <motion.div 
          key={gameState.currentCardIndex}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className={`w-full aspect-[4/3] max-w-2xl bg-surface-container-high rounded-[2rem] border-4 shadow-[0_0_60px_rgba(255,137,171,0.15)] p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden transition-all duration-500 ${
            isMyTurn ? 'border-primary animate-pulse-border' : 'border-primary/30'
          }`}
        >
          {isMyTurn && (
            <div className="absolute top-4 right-4 bg-primary text-on-primary-fixed px-3 py-1 rounded-full flex items-center gap-2 animate-bounce">
              <Star size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">YOUR TURN!</span>
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary/20">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((gameState.currentCardIndex + 1) / (gameState.mode === 'PAPELITO' ? gameState.cards.length : (gameState.players.length * 3))) * 100}%` }}
            />
          </div>

          {isMyTurn ? (
            <>
              <span className="text-5xl sm:text-7xl">{currentCard.emoji}</span>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 group relative">
                  <h4 className="font-headline text-xs sm:text-lg font-black uppercase tracking-[0.2em] text-primary">{currentCard.category}</h4>
                  <HelpCircle size={14} className="text-primary/50 cursor-help" />
                  
                  <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 bg-surface-container-highest p-3 rounded-xl border border-outline-variant/30 shadow-2xl z-50 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{currentCard.category}</p>
                    <p className="text-[10px] text-on-surface-variant leading-tight normal-case font-body">
                      {currentCard.category === 'ACTING' || currentCard.category === 'ACTUAR' ? 'Act out the situation without speaking. Your friends must guess!' :
                       currentCard.category === 'WHO SAID THIS' || currentCard.category === 'WHO_SAID' || currentCard.category === 'QUIÉN DIJO ESTO' ? 'Who said this iconic quote? The group votes for the culprit.' :
                       currentCard.category === 'EXPOSE' ? 'Moment of truth. Answer with absolute honesty or drink.' :
                       currentCard.category === 'WHO IS MOST LIKELY' ? 'Vote on who is most likely to do this.' :
                       currentCard.category === 'TABÚ' || currentCard.category === 'TABU' ? 'Describe the word without using the forbidden words.' :
                       currentCard.category === 'TRUTH OR BOMB' ? 'Answer the question or explode (group punishment).' :
                       currentCard.category === 'PAPELITO' ? (
                         gameState.currentRound === 1 ? 'Round 1: Describe the paper slip using as many words as you want (without saying what is written).' :
                         gameState.currentRound === 2 ? 'Round 2: You can only say ONE word for the guess.' :
                         'Round 3: You can only do mimicry. Shhh! No talking allowed.'
                       ) :
                       'Follow the card instructions to win points.'}
                    </p>
                  </div>
                </div>
                <p className="font-headline text-xl sm:text-3xl md:text-4xl font-black text-on-surface leading-tight tracking-tighter italic">
                  "{currentCard.content}"
                </p>
                {currentCard.category === 'QUIÉN DIJO ESTO' && currentCard.answer && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Said by:</p>
                    <p className="text-xl font-headline font-black text-on-surface">
                      {currentCard.answer}
                    </p>
                  </div>
                )}
                {currentCard.category === 'ACTUAR' && currentCard.context && (
                  <div className="mt-2 p-2 bg-surface-container-highest border border-outline-variant/30 rounded-xl max-w-xs mx-auto">
                    <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">How to act:</p>
                    <p className="text-[10px] text-on-surface leading-tight font-body">
                      {currentCard.context}
                    </p>
                  </div>
                )}
                {currentCard.tabooWords && (
                  <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-widest text-error mb-1">Forbidden Words:</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {currentCard.tabooWords.map(word => (
                        <span key={word} className="bg-error text-on-error px-2 py-0.5 rounded-full text-[8px] font-bold uppercase">{word}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Skull size={80} className="text-primary/20 mx-auto animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star size={24} className="text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-on-surface">GUESS!</h2>
                <p className="text-on-surface-variant font-body uppercase tracking-widest text-[10px] font-black">
                  Pay attention to <span className="text-primary">{currentTurnPlayer?.name}</span>
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {gameState.isShowingWinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-md"
            >
              <div className="bg-surface-container-highest p-12 rounded-[3rem] border-4 border-primary shadow-[0_0_100px_rgba(255,137,171,0.4)] text-center space-y-6 relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
                />
                <Trophy size={80} className="text-primary mx-auto animate-bounce" />
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-primary">Round Winner!</h2>
                  <p className="font-headline text-5xl sm:text-7xl font-black text-on-surface uppercase tracking-tighter italic">
                    {gameState.lastWinnerName || 'Nobody!'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-on-surface-variant font-black uppercase tracking-widest text-xs">
                  <Star size={16} className="text-primary" />
                  <span>+10 POINTS</span>
                  <Star size={16} className="text-primary" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full bg-surface-container-high rounded-[2.5rem] p-6 sm:p-8 border-2 border-primary/20 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={currentTurnPlayer?.avatar} alt={currentTurnPlayer?.name} className="w-12 h-12 rounded-full border-2 border-primary" />
                <div className="absolute -top-1 -right-1 bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Star size={10} fill="currentColor" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Turn of:</p>
                <p className="font-headline font-black text-xl text-on-surface uppercase">{currentTurnPlayer?.name}</p>
              </div>
            </div>
            {isMyTurn && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">IT'S YOUR TURN! DON'T SHOW YOUR SCREEN</span>
                </div>
                <button
                  onClick={() => voteWinner('')}
                  disabled={gameState.isShowingWinner}
                  className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest hover:bg-error/10 hover:text-error hover:border-error/30 transition-all disabled:opacity-50"
                >
                  Nobody Guessed ❌
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {gameState.players.map((player) => (
              <button
                key={player.id}
                disabled={!isMyTurn || gameState.isShowingWinner}
                onClick={() => voteWinner(player.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  isMyTurn && !gameState.isShowingWinner
                    ? 'border-primary/30 bg-surface-container-low hover:border-primary hover:scale-105' 
                    : 'border-outline-variant/20 bg-surface-container-low opacity-80'
                }`}
              >
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full" />
                <span className="text-[8px] font-black uppercase tracking-tight text-on-surface truncate w-full text-center">{player.name}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderWaiting = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full p-8 bg-surface-container-high rounded-[2.5rem] border-2 border-primary/20 shadow-2xl text-center space-y-8"
    >
      <div className="space-y-4">
        <div className="relative inline-block">
          <Timer size={80} className="text-primary mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Star size={32} className="text-on-primary-fixed animate-spin" />
          </div>
        </div>
        <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-on-surface">Game in Progress</h2>
        <p className="text-on-surface-variant font-body">
          You arrived just in time for the fun! However, the match has already started.
        </p>
      </div>

      <div className="bg-surface-container-highest p-6 rounded-3xl border border-outline-variant/30">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Status:</p>
        <p className="font-headline font-black text-xl text-on-surface uppercase">I AM READY (WAITING)</p>
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        You will automatically enter on the next round.
      </p>

      <button 
        onClick={goHome}
        className="w-full py-4 bg-surface-container-low text-on-surface font-headline font-bold text-lg rounded-2xl border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
      >
        BACK TO HOME
      </button>
    </motion.div>
  );

  const renderResults = () => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-6 sm:p-8 bg-surface-container-high rounded-[2rem] sm:rounded-[3rem] border-4 border-primary/30 shadow-[0_0_80px_rgba(255,137,171,0.2)] text-center space-y-6 sm:space-y-10"
      >
        <div className="space-y-4">
          <Trophy size={64} className="text-tertiary mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-on-surface">Final Scores</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {sortedPlayers.map((player, index) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={player.id}
              className={`flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 ${
                index === 0 ? 'bg-tertiary/10 border-tertiary' : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="font-headline font-black text-xl sm:text-3xl text-on-surface-variant w-6 sm:w-8">{index + 1}</span>
                <img src={player.avatar} alt={player.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-primary/20" />
                <span className="font-headline font-black text-lg sm:text-2xl text-on-surface uppercase truncate max-w-[100px] sm:max-w-none">{player.name}</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-black text-2xl sm:text-3xl text-primary">{player.score}</span>
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Points</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={continueWithPoints}
            className="w-full py-5 bg-tertiary text-on-tertiary-fixed font-headline font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            CONTINUE WITH POINTS 🏆
          </button>
          <button 
            onClick={restartGame}
            className="w-full py-5 bg-primary text-on-primary-fixed font-headline font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            NEW GAME (RESET) 🔥
          </button>
          <button 
            onClick={goHome}
            className="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-lg rounded-2xl border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
          >
            EXIT TO LOBBY
          </button>
        </div>
      </motion.div>
    );
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-[#2563eb] bg-blue-50 border border-blue-200/50 shadow-3xs w-fit">
                Sr. Product Designer UX / UI Lead
              </span>
              <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
                Strategy &amp; <span className="font-cursive italic font-normal text-[#2563eb] pr-1">Design</span> <br />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
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

        {/* Flagship Technical Showcase Element: Papelito Game AI Co-creation */}
        <div className="bg-[#111113] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 hover:border-neutral-700 max-w-6xl mx-auto w-full select-none">
          <div className="flex flex-col sm:flex-row gap-5 items-stretch">
            {/* Left Hand: Smaller, low-height Preview Image */}
            <div className="w-full sm:w-40 md:w-48 shrink-0 flex flex-col justify-center space-y-1.5">
              <div className="overflow-hidden rounded-xl border border-neutral-800 relative bg-neutral-900 aspect-video shadow-3xs">
                <img 
                  src="./src/assets/images/papelito_preview_1781827745352.jpg" 
                  alt="Papelito game interface preview" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="font-sans text-[9px] text-neutral-450 italic pl-0.5 leading-normal select-text">
                Preview: Real-time Papelito Multi-agent Engine
              </p>
            </div>

            {/* Right Hand: Description & Horizontal Steps Bar & Play Trigger */}
            <div className="flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 text-left">
              {/* Header Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest font-mono text-blue-300 bg-blue-950/20 border border-blue-900/40">
                    AI x UX Co-Creation
                  </span>
                  <span className="text-[10px] text-neutral-400 font-body italic">
                    From raw prompt to live lobby
                  </span>
                </div>
                <h3 className="font-headline text-sm sm:text-base font-bold text-white tracking-tight">
                  Co-Creating Papelito Lobby Engine
                </h3>
                <p className="font-sans text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
                  Designing a multiplayer party game requires granular event management. Using structured prompt sequencing, we co-designed and deployed the entire party flow featuring custom Web Audio synthesizers and low-latency Firestore subscriptions.
                </p>
              </div>

              {/* Bottom Row / Flat horizontal layout */}
              <div className="pt-2 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-x-3 gap-y-1 flex-wrap text-[10px] text-neutral-400 select-text">
                  <span className="text-blue-500 font-bold uppercase text-[8px] tracking-widest">Pipeline:</span>
                  <span className="font-mono text-[9px] text-neutral-300">01 Direct Prompt</span>
                  <span className="text-neutral-700">•</span>
                  <span className="font-mono text-[9px] text-neutral-300">02 State Machine</span>
                  <span className="text-neutral-700">•</span>
                  <span className="font-mono text-[9px] text-neutral-300">03 Web Synth</span>
                  <span className="text-neutral-700">•</span>
                  <span className="font-mono text-[9px] text-neutral-300">04 Subscriptions</span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('GAMES');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="shrink-0 py-1.5 px-3 bg-white hover:bg-neutral-200 text-[#111113] font-sans text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-xs"
                >
                  Launch engine
                  <span className="material-symbols-outlined text-[12px] font-bold">sports_esports</span>
                </button>
              </div>
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-[#2563eb] bg-blue-50 border border-blue-200/50 shadow-3xs w-fit">
              Core Vision
            </span>
            <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
              Empirical <span className="font-cursive italic font-normal text-[#2563eb] pr-1">Architecture</span>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-[#2563eb] bg-blue-50 border border-blue-200/50 shadow-3xs w-fit">
                Methodology in Action
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                The <span className="font-cursive italic font-normal text-[#2563eb]">Double-Diamond</span> Cycle
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
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="grad-active-define" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="grad-active-design" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#fda4af" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="grad-active-deliver" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fda4af" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0.4" />
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
                     fill="#2563eb"
                     filter="drop-shadow(0 0 4px #2563eb)"
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
                      stroke={selectedProcessStep === 0 ? "#818cf8" : "#e5e5e5"}
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
                      stroke={selectedProcessStep === 1 ? "#2563eb" : "#e5e5e5"}
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
                      stroke={selectedProcessStep === 2 ? "#2563eb" : "#e5e5e5"}
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
                      stroke={selectedProcessStep === 3 ? "#e11d48" : "#e5e5e5"}
                      strokeWidth={selectedProcessStep === 3 ? "2.5" : "1.5"}
                      strokeDasharray={selectedProcessStep === 3 ? "0" : "5 5"}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors"
                    />
                  </g>

                  {/* Hotspot Circles / Anchor Vertices */}
                  <circle cx="40" cy="110" r="5" fill="#fff" stroke="#818cf8" strokeWidth="2" />
                  <circle cx="200" cy="110" r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="360" cy="110" r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="440" cy="110" r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="600" cy="110" r="5" fill="#fff" stroke="#2563eb" strokeWidth="2" />
                  <circle cx="760" cy="110" r="5" fill="#fff" stroke="#e11d48" strokeWidth="2" />

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
                    <rect x="70" y="55" width="60" height="18" rx="4" fill={selectedProcessStep === 0 ? "#818cf8" : "transparent"} />
                    <text x="100" y="67" fill={selectedProcessStep === 0 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">01. DISCOVER</text>
                  </g>

                  <g onClick={() => setSelectedProcessStep(1)} className="cursor-pointer">
                    <rect x="270" y="55" width="50" height="18" rx="4" fill={selectedProcessStep === 1 ? "#2563eb" : "transparent"} />
                    <text x="295" y="67" fill={selectedProcessStep === 1 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">02. DEFINE</text>
                  </g>

                  <g onClick={() => setSelectedProcessStep(2)} className="cursor-pointer">
                    <rect x="470" y="55" width="50" height="18" rx="4" fill={selectedProcessStep === 2 ? "#2563eb" : "transparent"} />
                    <text x="495" y="67" fill={selectedProcessStep === 2 ? "#fff" : "rgba(38,38,38,0.7)"} fontSize="9" fontFamily="sans-serif" fontWeight="black" textAnchor="middle">03. DESIGN</text>
                  </g>

                  <g onClick={() => setSelectedProcessStep(3)} className="cursor-pointer">
                    <rect x="670" y="55" width="50" height="18" rx="4" fill={selectedProcessStep === 3 ? "#e11d48" : "transparent"} />
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
                      ? 'bg-[#2563eb] text-white border-[#2563eb]'
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] xs:text-[10px] font-bold uppercase tracking-widest font-mono text-[#2563eb] bg-blue-50 border border-blue-200/50 shadow-3xs w-fit block">
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
                    <span className="material-symbols-outlined text-[#2563eb] text-base">verified</span>
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-[#2563eb] bg-blue-50 border border-blue-200/50 shadow-3xs w-fit">
              02 • Aesthetics & Performance Infographic
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Design Pillars as <span className="font-cursive italic font-normal text-[#2563eb]">Operational Metrics</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Infographic card 1: Functional Brutalism */}
            <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-200 hover:bg-white/60 transition-all duration-300">
              <div className="space-y-4 text-left">
                <span className="inline-flex items-center justify-center p-2 bg-blue-50 border border-blue-200/50 text-[#2563eb] rounded-xl text-lg w-fit shadow-3xs">
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
                  <span className="text-[#2563eb]">92% Core Focus</span>
                </div>
                
                {/* Horizontal Stack Bar Diagram */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-neutral-700 font-bold">Utility Blocks</span>
                      <span className="text-[#2563eb] font-bold">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#818cf8] to-[#2563eb] rounded-full" style={{ width: '92%' }} />
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
            <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-200 hover:bg-white/60 transition-all duration-300">
              <div className="space-y-4 text-left">
                <span className="inline-flex items-center justify-center p-2 bg-blue-50 border border-blue-200/50 text-[#2563eb] rounded-xl text-lg w-fit shadow-3xs">
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
                      stroke="#818cf8" 
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
                  <div className="w-1.5 bg-[#2563eb] h-3 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 bg-[#818cf8] h-6 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1.5 bg-[#2563eb] h-4 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  <div className="w-1.5 bg-neutral-300 h-2 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 bg-[#2563eb] h-5 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <div className="w-1.5 bg-[#818cf8] h-3 animate-bounce" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>
            </div>

            {/* Infographic card 3: Target Velocity Gauge */}
            <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-200 hover:bg-white/60 transition-all duration-300">
              <div className="space-y-4 text-left">
                <span className="inline-flex items-center justify-center p-2 bg-blue-50 border border-blue-200/50 text-[#2563eb] rounded-xl text-lg w-fit shadow-3xs">
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
                    <span className="text-xl font-headline font-black text-[#2563eb]">120</span>
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
                      stroke="#2563eb" 
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono text-[#2563eb] bg-blue-50 border border-blue-200/50 shadow-3xs w-fit">
              Partner with Lia
            </span>
            <h2 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-light text-neutral-900 tracking-[-0.03em] leading-[1.05]">
              Consultancy &amp; <span className="font-cursive italic font-normal text-[#2563eb] pr-1">Action</span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
            Need to solve immediate conversions boundaries, improve retention rates, or build clean corporate design languages? Leave a message or connect directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Information block */}
          <div className="custom-glass border border-neutral-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-200 hover:bg-white/60 space-y-8">
            <div className="space-y-6">
              <h3 className="font-headline text-2xl font-black text-neutral-900 tracking-tight">Lia Parra</h3>
              <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                Sr. Product Designer UX / UI Lead and experience strategist driving conversion, interactive interfaces, and cross-platform UX structures.
              </p>
              <div className="space-y-4 pt-6 border-t border-neutral-150 text-sm font-sans">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">mail</span>
                  <a href="mailto:liangelyp@gmail.com" className="text-neutral-700 select-all font-medium hover:text-[#2563eb] transition-all">liangelyp@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">chat</span>
                  <a href="https://wa.me/5491156424162?text=Hello%20Lia!%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect%20with%20you." target="_blank" rel="noreferrer" className="text-neutral-700 font-medium hover:text-[#2563eb] transition-all">+54 9 11 5642-4162 (WhatsApp)</a>
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
                className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-widest text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                id="contact-linkedin-link"
              >
                <Linkedin className="w-3.5 h-3.5 shrink-0" />
                LinkedIn ↗
              </a>
            </div>
          </div>

          {/* Contact form block */}
          <div className="lg:col-span-2 custom-glass border border-neutral-200/50 bg-white/45 p-6 sm:p-8 rounded-2xl transition-all duration-300 shadow-2xs hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-200 hover:bg-white/60">
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
                    className="text-[10px] font-sans font-black uppercase tracking-widest text-[#2563eb] hover:text-[#1d4ed8] transition-colors cursor-pointer"
                  >
                    ← Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#2563eb] font-mono">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-[#2563eb] outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-[#2563eb]/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#2563eb] font-mono">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. alex@company.com"
                      className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-[#2563eb] outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-[#2563eb]/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#2563eb] font-mono">
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
                              : 'bg-white/40 border-neutral-200/50 text-neutral-500 hover:border-blue-200 hover:text-[#2563eb] hover:bg-blue-50/25 shadow-3xs'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#2563eb] font-mono">
                    Tell me about your product challenge *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your design objectives, timelines or parameters..."
                    className="w-full bg-white/40 backdrop-blur-md border border-neutral-200/50 rounded-xl p-3 text-xs sm:text-sm font-sans focus:bg-white focus:border-[#2563eb] outline-none transition-all text-neutral-900 shadow-3xs focus:ring-1 focus:ring-[#2563eb]/10"
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
              className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#818cf8]/12 blur-[120px]"
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
              className="absolute -bottom-10 -right-10 w-[650px] h-[650px] bg-[#00f4fe]/10 blur-[140px]"
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
              className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#818cf8]/8 blur-[110px]"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#fafaf9]">
            {/* Soft Warm Tone Editorial Theme Abstract Shapes */}
            <motion.div 
              animate={{
                x: [0, 80, -40, 0],
                y: [0, -60, 50, 0],
                scale: [1, 1.15, 0.9, 1],
                borderRadius: [
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%"
                ],
                rotate: [0, 120, 240, 360]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#fecdd3]/35 blur-[100px] mix-blend-multiply"
            />
            <motion.div 
              animate={{
                x: [0, -90, 50, 0],
                y: [0, 70, -60, 0],
                scale: [1, 0.9, 1.2, 1],
                borderRadius: [
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%"
                ],
                rotate: [360, 240, 120, 0]
              }}
              transition={{
                duration: 32,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#ffedd5]/35 blur-[120px] mix-blend-multiply"
            />
            <motion.div 
              animate={{
                x: [0, 50, -60, 0],
                y: [0, 80, -40, 0],
                scale: [1, 1.1, 0.85, 1],
                borderRadius: [
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%"
                ],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-[#fef9c3]/35 blur-[90px] mix-blend-multiply"
            />
            <motion.div 
              animate={{
                x: [0, 30, -30, 0],
                y: [0, -50, 40, 0],
                scale: [1, 1.05, 0.95, 1],
                borderRadius: [
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 20% 80% 20% 80%",
                  "80% 20% 50% 50% / 50% 30% 70% 70%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%"
                ],
                rotate: [360, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-10 right-1/3 w-[450px] h-[450px] bg-blue-100/25 blur-[110px] mix-blend-multiply"
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
      <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-12 h-20 transition-all border-b ${
        activeTab === 'GAMES' 
          ? 'bg-[#0e0e0e]/90 text-white border-outline-variant/10 backdrop-blur-md' 
          : 'bg-[#fafafa]/90 text-on-surface border-outline-variant/30 backdrop-blur-md'
      }`}>
        <div 
          onClick={() => { 
            if (activeTab === 'GAMES') {
              goHome();
            } else {
              setActiveTab('IMPACT'); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
          }}
          className={`flex items-center gap-1.5 cursor-pointer select-none transition-all ${
            activeTab === 'GAMES' 
              ? 'text-white hover:opacity-80' 
              : 'text-neutral-950 hover:opacity-80'
          }`}
        >
          {activeTab === 'GAMES' ? (
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs font-black tracking-widest text-[#818cf8] uppercase">
                Lia Parra
              </span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-[#818cf8] bg-[#818cf8]/10 px-1.5 py-0.5 rounded uppercase">
                Labs Game
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm font-black uppercase tracking-widest text-neutral-900">
                Lia Parra
              </span>
              <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full animate-pulse shrink-0" />
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 border border-neutral-200/50 px-1.5 py-0.5 rounded leading-none">
                Lab Sandbox
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Link Tabs (Always Visible for portfolio, hidden for GAMES which uses Burger) */}
        {activeTab !== 'GAMES' && (
          <nav className="hidden md:flex items-center gap-8 font-headline text-xs font-bold uppercase tracking-widest">
            {[
              { id: 'IMPACT', label: 'Experience' },
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
                      ? 'text-[#2563eb] font-black scale-105' 
                      : 'text-neutral-500 hover:text-[#2563eb]'
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
          <div className="relative">
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
            <div className="hidden sm:flex items-center gap-2 bg-[#201f1f] border border-[#818cf8]/30 px-3 py-1 bg-opacity-65 rounded-full">
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
              activeTab === 'GAMES' ? '' : 'md:hidden'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'GAMES' ? 'text-[#818cf8]' : 'text-primary'}`}>
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
                : 'bg-[#fafafa]/95 text-on-surface md:hidden'
            }`}
          >
            {[
              { id: 'IMPACT', label: 'Experience' },
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
                      ? isTabActive ? 'text-[#818cf8] scale-105' : 'text-neutral-400 hover:text-white'
                      : isTabActive ? 'text-[#2563eb] scale-105' : 'text-on-surface-variant'
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
              className={`bg-white/95 backdrop-blur-2xl border border-neutral-200/80 rounded-3xl w-full max-h-[88vh] sm:max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-neutral-900 ${selectedProjectForModal.id === 'illow_case1' ? 'max-w-5xl' : 'max-w-4xl'}`}
            >
              {/* Modal Top Bar */}
              {selectedProjectForModal.id !== 'illow_case1' && (
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
                    <span className="material-symbols-outlined text-[#2563eb] text-lg leading-none shrink-0" aria-hidden="true">
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
              )}

              {/* Scrollable Modal Content */}
              <div className={`flex-1 overflow-y-auto style-scrollbar text-left ${selectedProjectForModal.id === 'illow_case1' ? 'p-0 bg-[#F7F7FB]' : 'p-6 sm:p-8 md:p-10 space-y-8'}`}>
                {selectedProjectForModal.id === 'illow_case1' ? (
                  <IllowCaseStudy onClose={() => setSelectedProjectForModal(null)} />
                ) : (
                  <>
                    <div className="space-y-4">
                      <h2 className="font-headline text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                        {selectedProjectForModal.title}
                      </h2>
                      <div className="p-5 bg-neutral-50/80 rounded-2xl border border-neutral-200/50 select-text">
                        <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                          <strong className="text-neutral-800 font-semibold uppercase font-mono text-[9px] tracking-widest block mb-2 text-[#2563eb]">The Challenge</strong>
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
                                    <div className="space-y-4 bg-blue-50/25 p-5 sm:p-6 rounded-2xl border border-blue-100/60 mt-4 text-left">
                                      {block.title && (
                                        <h5 className="font-headline text-xs font-bold text-[#2563eb] uppercase tracking-wider font-mono mb-2">
                                          {block.title} Key Action Points
                                        </h5>
                                      )}
                                      <ul className="space-y-3 font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                                        {block.bulletPoints.map((bullet: string, bIdx: number) => (
                                          <li key={bIdx} className="flex items-start gap-2.5">
                                            <span className="text-[#2563eb] font-black text-sm select-none leading-none mt-0.5">•</span>
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
                                  src={getDirectDriveUrl(block.imageUrl)} 
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
                                          block.videoUrl?.includes('embed');
                          return (
                            <div key={idx} className="space-y-2 select-none">
                              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-250 bg-neutral-950 shadow-3xs">
                                {isEmbed ? (
                                  <iframe 
                                    src={block.videoUrl} 
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
                                  src={block.pdfUrl}
                                  className="w-full h-full border-0 rounded-xl bg-neutral-100"
                                  title="Case study PDF document"
                                />
                                <div className="absolute top-3 right-3 opacity-90 hover:opacity-100 transition-opacity">
                                  <a 
                                    href={block.pdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-mono text-[9px] text-[#2563eb] bg-white hover:bg-[#2563eb] hover:text-white border border-neutral-200 hover:border-[#2563eb] px-2.5 py-1 rounded-full font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-xs"
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
                        <div className="bg-blue-600 text-white border border-blue-700 p-3.5 rounded-2xl font-mono font-bold text-[10px] tracking-widest text-center uppercase shadow-sm">
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
                  </>
                )}
              </div>

              {/* Modal Bottom Footer */}
              {selectedProjectForModal.id !== 'illow_case1' && (
                <div className="px-6 sm:px-8 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectForModal(null)}
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-3xs"
                  >
                    Close Case Study
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Content Container */}
      <main className="relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col pt-20 pb-6">
        <AnimatePresence mode="wait">
          {showRoundAnimation && activeTab === 'GAMES' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0e0e0e]/90 backdrop-blur-2xl"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Star size={120} className="text-secondary mx-auto drop-shadow-[0_0_30px_rgba(137,255,171,0.6)]" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="font-headline text-6xl sm:text-8xl font-black uppercase tracking-tighter text-secondary italic">
                    ROUND {showRoundAnimation}
                  </h2>
                  <p className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-white">
                    {showRoundAnimation === 1 ? 'Free Description' : 
                     showRoundAnimation === 2 ? 'Single Word' : 
                     'Pantomime'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

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
              <div className="game-theme text-on-surface bg-background select-none min-h-[55vh] relative w-full flex items-center justify-center p-0">
                <div className="w-full max-w-4xl py-6 px-4">
                  {!selectedNickname || gameState.status === 'HOME' ? (
                    renderHome()
                  ) : (
                    <>
                      {gameState.status === 'LOBBY' && renderLobby()}
                      {gameState.status === 'GAME' && renderGame()}
                      {gameState.status === 'RESULTS' && renderResults()}
                    </>
                  )}
                </div>
              </div>
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
              Sr. Product Designer UX / UI Lead
            </p>
          </div>
          <div className="sm:text-right space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest font-black text-[#2563eb]">
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

      {/* Papelito Game Instructions Dialog */}
      <AnimatePresence>
        {activeTab === 'GAMES' && showGameInstructions && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setShowGameInstructions(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#141414] border border-neutral-800 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl z-10 overflow-hidden text-left"
              style={{ boxShadow: '0 0 50px rgba(255, 137, 171, 0.15)' }}
            >
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#818cf8]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close "X" Button */}
              <button 
                onClick={() => setShowGameInstructions(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close instructions"
              >
                <span className="text-sm font-bold">✕</span>
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-1.5 pr-8">
                  <span className="font-sans text-[10px] font-black tracking-widest text-[#818cf8] bg-[#818cf8]/10 px-2.5 py-1 rounded-md uppercase">
                    How to Play Papelito! 📝🎮
                  </span>
                  <h3 className="font-headline text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mt-2">
                    Secret Phrases & Laughter
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-neutral-400">
                    A party match played in 3 hilarious rounds! Every player writes down secret concepts (papelitos) into a shared online pool before facing off.
                  </p>
                </div>

                {/* Steps/Rounds */}
                <div className="space-y-4">
                  <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                    <span className="font-headline font-black text-xs text-[#818cf8] bg-[#818cf8]/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Round 1 • Free Description</p>
                      <p className="font-sans text-xs text-neutral-400">
                        Describe the concept using as many words/hints as you want (except translation, spelling, or parts of the secret word).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                    <span className="font-headline font-black text-xs text-[#818cf8] bg-[#818cf8]/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Round 2 • Single Word</p>
                      <p className="font-sans text-xs text-neutral-400">
                        Now that your team knows all words in the pool, you are restricted to guiding them with **only one single word**! Choose wisely.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                    <span className="font-headline font-black text-[#818cf8] bg-[#818cf8]/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Round 3 • Full Pantomime</p>
                      <p className="font-sans text-xs text-neutral-400">
                        Zero sounds or lip syncing allowed. You must act out the concept using gestures/mime body language under clock pressure!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  onClick={() => setShowGameInstructions(false)}
                  className="w-full py-4 bg-gradient-to-r from-[#818cf8] to-[#4f46e5] hover:brightness-110 active:scale-[0.98] transition-all text-white font-headline font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,137,171,0.3)] block text-center cursor-pointer"
                >
                  Got it • Let's Play! 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
