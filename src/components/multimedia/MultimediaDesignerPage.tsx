import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Sparkles,
  Film,
  Video,
  Image as ImageIcon,
  Box,
  Layers,
  ArrowLeft,
  Share2,
  Check,
  Send,
  Linkedin,
  MessageCircle,
  Plus,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MultimediaItem, MultimediaCategory } from '../../types/multimedia';
import { multimediaInitialItems } from '../../data/multimediaInitialItems';
import { MultimediaCard } from './MultimediaCard';
import { MultimediaModal } from './MultimediaModal';
import { MultimediaSettingsModal } from './MultimediaSettingsModal';
import { MultimediaAuthModal } from './MultimediaAuthModal';
import { subscribeToMultimediaItems, saveMultimediaItemsLive } from '../../services/multimediaSyncService';

export const MultimediaDesignerPage: React.FC = () => {
  const [items, setItems] = useState<MultimediaItem[]>(multimediaInitialItems);
  const [selectedCategory, setSelectedCategory] = useState<MultimediaCategory>('TODOS');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MultimediaItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Real-time synchronization: loads cached items immediately and connects to live Firestore
  useEffect(() => {
    const unsubscribe = subscribeToMultimediaItems((syncedItems) => {
      if (syncedItems && syncedItems.length > 0) {
        setItems(syncedItems);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGearClick = () => {
    const isAuthed = sessionStorage.getItem('multimedia_auth') === 'true';
    if (isAuthed) {
      setIsSettingsOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Sync state to both Firestore (for all live visitors) and localStorage
  const handleUpdateItems = async (newItems: MultimediaItem[]) => {
    setItems(newItems);
    const cloudSaved = await saveMultimediaItemsLive(newItems);
    if (cloudSaved) {
      toast.success('Galería sincronizada en vivo para todos los visitantes');
    } else {
      toast.success('Galería guardada localmente');
    }
  };

  const handleCopyPageUrl = () => {
    const fullUrl = window.location.origin + window.location.pathname + '#multimedia';
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'TODOS') return true;
    return item.category === selectedCategory;
  });

  const categoryTabs: { id: MultimediaCategory; label: string; icon: any }[] = [
    { id: 'TODOS', label: 'Todos', icon: Layers },
    { id: 'MOTION_VIDEO', label: 'Motion & Video', icon: Film },
    { id: 'AI_GENERATIVO', label: 'IA Generativa', icon: Sparkles },
    { id: 'KEY_VISUAL_PAID', label: 'Key Visuals & Paid Ads', icon: ImageIcon },
    { id: 'SOCIAL_HOOKS', label: 'Social Hooks (9:16)', icon: Video },
    { id: 'THREED_CONCEPT', label: '3D & Motion', icon: Box },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-body selection:bg-neutral-200">
      {/* Subtle Top Navigation for this specific page */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="#experience"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-stone-500 hover:text-stone-900 transition-colors p-1.5 rounded-lg hover:bg-stone-100"
              title="Volver a portafolio principal de producto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portafolio General</span>
            </a>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-sm tracking-tight text-neutral-900">
                Lia Parra
              </span>
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-neutral-100 text-neutral-700 border border-neutral-200">
                MULTIMEDIA &amp; AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCopyPageUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:text-neutral-950 hover:border-stone-400 text-xs font-semibold shadow-3xs transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado' : 'Compartir link'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16 text-left">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-neutral-800 bg-neutral-100 border border-neutral-200 shadow-3xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Multimedia Designer · AI, Motion &amp; Content
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-5">
              <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-light text-neutral-950 tracking-[-0.03em] leading-[1.08]">
                Creatividad visual impulsada por <span className="font-semibold text-neutral-950">Inteligencia Artificial</span>, <span className="font-semibold">Motion Graphics</span> y contenido de alto impacto.
              </h1>
              <p className="font-sans text-base sm:text-lg text-stone-700 leading-relaxed max-w-3xl">
                Diseñadora multimedia con formación sólida en diseño gráfico y dirección de arte. Especializada en la conceptualización de <strong>key visuals</strong>, producción audiovisual para <strong>paid media y redes sociales</strong>, integración de herramientas de <strong>IA generativa</strong> en el pipeline creativo y desarrollo de piezas en <strong>3D y animación</strong>.
              </p>

              {/* Portuguese highlight for Brazilian accounts */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/40 border border-emerald-200/90 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" role="img" aria-label="Bandera de Brasil">🇧🇷</span>
                  <div className="space-y-0.5">
                    <p className="font-headline font-bold text-sm text-emerald-950">
                      Português Fluente / Avançado (Oral &amp; Escrito)
                    </p>
                    <p className="font-sans text-xs text-emerald-800 leading-normal">
                      Totalmente capacitada para liderar a ideação, criação de copys, adaptação de key visuals e alinhamento direto com contas e equipes do Brasil.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300/60">
                  Pronta para contas de Brasil
                </span>
              </div>
            </div>

            {/* Quick Skills & Toolkit Pillar Box */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
                Stack Creativo &amp; Producción
              </p>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    IA Generativa &amp; Workflows
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    Midjourney, Runway Gen-3, Kling, Luma Dream Machine, Stable Diffusion, Photoshop AI / Generative Fill, Magnific, ElevenLabs.
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-violet-600" />
                    Motion &amp; Video
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    After Effects, Premiere Pro, Animate, Kinetic Typography, Micro-animaciones, edición rítmica y sound design.
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Diseño, Key Visuals &amp; 3D
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    Photoshop, Illustrator, Figma, Blender 3D, Spline, adaptaciones multiformato (9:16, 1:1, 16:9).
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    Ubicación &amp; Modalidad
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    Buenos Aires (Palermo / CABA) · Modalidad Híbrida / Remota · Disponibilidad Inmediata.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="mailto:liangelyp@gmail.com"
                  className="w-full py-3 rounded-xl bg-neutral-950 text-white font-sans text-xs font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Contactar a Lia Parra
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Work & Media Showcase Section */}
        <section id="galeria" className="space-y-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
            <div className="space-y-1.5">
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
                Portfolio Showcase ({filteredItems.length} piezas)
              </p>
              <h2 className="font-headline text-2xl sm:text-3xl font-light text-neutral-950 tracking-tight">
                Piezas audiovisuales, conceptos y adaptaciones.
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-950 text-white font-semibold shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-neutral-950 font-medium'
                    }`}
                  >
                    <TabIcon className="w-3 h-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-3xl space-y-3">
              <p className="font-sans text-sm text-stone-600">
                No hay piezas en la categoría seleccionada.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('TODOS')}
                className="text-xs font-semibold text-neutral-900 underline cursor-pointer"
              >
                Ver todas las piezas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map((item, index) => (
                <MultimediaCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => setSelectedItemForModal(item)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Methodology & Creative Mindset */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-xs space-y-8">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
              Cómo trabajo
            </p>
            <h3 className="font-headline text-2xl sm:text-3xl font-light text-neutral-950 tracking-tight">
              Velocidad de ejecución con criterio visual y entendimiento de métricas.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            <div className="space-y-2.5 p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
              <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-mono font-bold text-xs">
                01
              </span>
              <h4 className="font-headline text-base font-semibold text-neutral-900">
                Hooks de 3 Segundos &amp; Retención
              </h4>
              <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                Diseño cada pieza pensando en los códigos específicos de cada plataforma (Reels, TikTok, Shorts). Pattern interrupts, tipografía de lectura rápida y ritmo audiovisual para frenar el scroll.
              </p>
            </div>

            <div className="space-y-2.5 p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
                02
              </span>
              <h4 className="font-headline text-base font-semibold text-neutral-900">
                IA Integrada al Pipeline Real
              </h4>
              <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                La IA no reemplaza la dirección de arte: la potencia. Utilizo modelos generativos para explorar conceptos a alta velocidad, generar footage único y acelerar iteraciones manteniendo consistencia de marca.
              </p>
            </div>

            <div className="space-y-2.5 p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-xs">
                03
              </span>
              <h4 className="font-headline text-base font-semibold text-neutral-900">
                Adaptabilidad Omnicanal
              </h4>
              <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                Capacidad de tomar un concepto visual y transformarlo de forma coherente en adaptaciones 9:16 vertical, 1:1 feed, 16:9 paid ads y piezas de email marketing sin perder fuerza estética.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Footer Banner */}
        <section className="p-8 sm:p-12 rounded-3xl bg-neutral-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-white/10 text-white/90 border border-white/20">
              Hablemos
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-semibold tracking-tight">
              ¿Hablamos sobre tu próximo proyecto o campaña?
            </h3>
            <p className="font-sans text-sm text-white/70 max-w-xl">
              Disponible para sumarme en modalidad híbrida o remota y liderar proyectos de alto impacto visual, motion graphics y cuentas internacionales (incluyendo Brasil).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/5491136593866?text=Hola%20Lia!%20Vi%20tu%20portafolio%20multimedia%20y%20me%20gustar%C3%ADa%20conversar."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-sans text-sm font-semibold transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href="mailto:liangelyp@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-neutral-950 font-sans text-sm font-semibold transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" />
              Enviar Email
            </a>
            <a
              href="https://www.linkedin.com/in/liangely-diseno-grafico/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-sm font-medium transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </section>
      </main>

      {/* Floating Settings Gear Button (⚙️ Ruedita muy disimulada abajo) */}
      <div className="fixed bottom-3 right-3 z-30">
        <button
          type="button"
          onClick={handleGearClick}
          aria-label="Configuración"
          title="Configuración"
          className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-800 bg-stone-100/50 hover:bg-white border border-stone-200/50 hover:border-stone-400 shadow-2xs hover:shadow-xs transition-all duration-300 opacity-25 hover:opacity-100 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Detail Viewer Modal */}
      <MultimediaModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />

      {/* Password Authentication Modal */}
      <MultimediaAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Settings & Drag-and-Drop Manager Modal */}
      <MultimediaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        items={items}
        onUpdateItems={handleUpdateItems}
      />
    </div>
  );
};
