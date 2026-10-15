import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Sparkles,
  Film,
  Video,
  Image as ImageIcon,
  Layers,
  Share2,
  Check,
  Send,
  Linkedin,
  MessageCircle,
  Compass,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MultimediaItem, MultimediaCategory } from '../../types/multimedia';
import { normalizeCategory, getItemCategories } from '../../types/multimedia';
import type { MultimediaPageContent, MultimediaSectionId } from '../../types/multimediaContent';
import { defaultMultimediaPageContent } from '../../types/multimediaContent';
import { MultimediaCard } from './MultimediaCard';
import { MultimediaModal } from './MultimediaModal';
import { MultimediaSettingsModal } from './MultimediaSettingsModal';
import { MultimediaAuthModal } from './MultimediaAuthModal';
import {
  subscribeToMultimediaItems,
  saveMultimediaItemsLive,
  subscribeToMultimediaPageContent,
  saveMultimediaPageContentLive,
} from '../../services/multimediaSyncService';

// Inline Editable Component
interface InlineEditableProps {
  value: string;
  onChange: (val: string) => void;
  isEditMode: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

const InlineEditable: React.FC<InlineEditableProps> = ({
  value,
  onChange,
  isEditMode,
  className = '',
  as = 'span',
}) => {
  const Component = as as any;

  if (!isEditMode) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onInput={(e: React.FormEvent<HTMLElement>) => {
        onChange(e.currentTarget.innerText);
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        onChange(e.currentTarget.innerText);
      }}
      className={`${className} outline-dashed outline-2 outline-blue-400 hover:outline-blue-600 bg-blue-50/40 hover:bg-blue-100/50 rounded-lg px-2 py-0.5 cursor-text transition-all focus:outline-solid focus:outline-2 focus:outline-blue-600 focus:bg-white`}
      title="Haz clic para editar este texto directamente"
    >
      {value}
    </Component>
  );
};

export const MultimediaDesignerPage: React.FC = () => {
  const [items, setItems] = useState<MultimediaItem[]>([]);
  const [pageContent, setPageContent] = useState<MultimediaPageContent>(defaultMultimediaPageContent);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MultimediaItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pageContentRef = useRef(pageContent);
  useEffect(() => {
    pageContentRef.current = pageContent;
  }, [pageContent]);

  // Real-time synchronization — Firestore is the source of truth
  useEffect(() => {
    const unsubscribeItems = subscribeToMultimediaItems(
      (syncedItems) => {
        if (Array.isArray(syncedItems)) {
          setItems(syncedItems);
        }
      },
      (loading) => setIsLoadingItems(loading)
    );

    const unsubscribeContent = subscribeToMultimediaPageContent((syncedContent) => {
      if (syncedContent) {
        setPageContent(syncedContent);
        pageContentRef.current = syncedContent;
      }
    });

    return () => {
      unsubscribeItems();
      unsubscribeContent();
    };
  }, []);

  const handleGearClick = () => {
    const isAuthed = sessionStorage.getItem('multimedia_auth') === 'true';
    if (isAuthed) {
      setIsSettingsOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleUpdateItems = async (newItems: MultimediaItem[]) => {
    setItems(newItems);
    const cloudSaved = await saveMultimediaItemsLive(newItems);
    if (cloudSaved) {
      toast.success('Galería sincronizada en vivo para todos los visitantes');
    } else {
      toast.error('Error al sincronizar en la nube. Revisa tu conexión.');
    }
  };

  const handleSavePageContent = async () => {
    setIsSaving(true);
    try {
      // Blur any currently focused editable field to trigger change
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await new Promise((r) => setTimeout(r, 80));

      const cloudSaved = await saveMultimediaPageContentLive(pageContentRef.current);
      if (cloudSaved) {
        toast.success('¡Página guardada y sincronizada en vivo en la nube!');
      } else {
        toast.error('Error al guardar en la nube. Revisa tu conexión.');
      }
      setIsEditMode(false);
    } catch (err) {
      toast.error('Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pageContent.sectionsOrder.length) return;
    const newOrder = [...pageContent.sectionsOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    const updated = {
      ...pageContent,
      sectionsOrder: newOrder,
    };
    setPageContent(updated);
    await saveMultimediaPageContentLive(updated);
  };

  const handleUpdateSectionsOrder = async (newOrder: MultimediaSectionId[]) => {
    const updated = { ...pageContent, sectionsOrder: newOrder };
    setPageContent(updated);
    await saveMultimediaPageContentLive(updated);
  };

  const handleCopyPageUrl = () => {
    const fullUrl = window.location.origin + window.location.pathname + '#multimedia';
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredItems = items.filter((item) => {
    if (item.hidden) return false;
    if (selectedCategory === 'TODOS') return true;
    const itemCats = getItemCategories(item);
    if (itemCats.includes(selectedCategory)) return true;
    const normCats = itemCats.map((c) => normalizeCategory(c));
    return normCats.includes(selectedCategory as any);
  });

  // Collect any custom categories added across all items
  const customCategories = useMemo(() => {
    const list: string[] = [];
    items.forEach((it) => {
      if (it.hidden) return;
      getItemCategories(it).forEach((cat) => {
        if (!['MOTION', 'IA', 'KEY_VISUALS'].includes(cat) && !list.includes(cat)) {
          list.push(cat);
        }
      });
    });
    return list;
  }, [items]);

  const categoryTabs: { id: string; label: string; icon: any }[] = [
    { id: 'TODOS', label: 'Todos', icon: Layers },
    { id: 'MOTION', label: 'Motion', icon: Film },
    { id: 'IA', label: 'IA', icon: Sparkles },
    { id: 'KEY_VISUALS', label: 'Key Visuals', icon: ImageIcon },
    ...customCategories.map((c) => ({
      id: c,
      label: c.charAt(0).toUpperCase() + c.slice(1).toLowerCase().replace(/_/g, ' '),
      icon: Sparkles,
    })),
  ];

  const getSectionTitle = (id: MultimediaSectionId) => {
    switch (id) {
      case 'hero':
        return 'Hero / Presentación Principal';
      case 'gallery':
        return 'Galería / Portfolio Showcase';
      case 'methodology':
        return 'Cómo Trabajo / Metodología';
      case 'contact':
        return 'Contacto & Banner Final';
    }
  };

  // Render individual sections
  const renderHeroSection = (sectionIndex: number) => {
    return (
      <section
        key="hero"
        className={`relative space-y-6 transition-all duration-300 ${
          isEditMode
            ? 'p-6 sm:p-8 rounded-3xl border-2 border-dashed border-blue-400/80 bg-blue-50/20 shadow-md'
            : ''
        }`}
      >
        {isEditMode && (
          <div className="flex items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl shadow-lg border border-neutral-700 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
                Sección {sectionIndex + 1} de {pageContent.sectionsOrder.length}:
              </span>
              <span className="font-sans text-xs font-semibold text-white">
                {getSectionTitle('hero')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={sectionIndex === 0}
                onClick={() => handleMoveSection(sectionIndex, 'up')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Subir sección"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Subir
              </button>
              <button
                type="button"
                disabled={sectionIndex === pageContent.sectionsOrder.length - 1}
                onClick={() => handleMoveSection(sectionIndex, 'down')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Bajar sección"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bajar
              </button>
            </div>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-neutral-800 bg-neutral-100 border border-neutral-200 shadow-3xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <InlineEditable
            value={pageContent.hero.badge}
            onChange={(val) =>
              setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, badge: val } }))
            }
            isEditMode={isEditMode}
            as="span"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-5">
            <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-light text-neutral-950 tracking-[-0.03em] leading-[1.08]">
              <InlineEditable
                value={pageContent.hero.headline}
                onChange={(val) =>
                  setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, headline: val } }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </h1>
            <p className="font-sans text-base sm:text-lg text-stone-700 leading-relaxed max-w-3xl">
              <InlineEditable
                value={pageContent.hero.description}
                onChange={(val) =>
                  setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, description: val } }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </p>
          </div>

          {/* Quick Skills & Toolkit Pillar Box */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-5">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
              <InlineEditable
                value={pageContent.hero.toolkitTitle}
                onChange={(val) =>
                  setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, toolkitTitle: val } }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </p>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <InlineEditable
                    value={pageContent.hero.aiTitle}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, aiTitle: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
                <p className="text-stone-600 leading-relaxed">
                  <InlineEditable
                    value={pageContent.hero.aiDesc}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, aiDesc: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                  <InlineEditable
                    value={pageContent.hero.motionTitle}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, motionTitle: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
                <p className="text-stone-600 leading-relaxed">
                  <InlineEditable
                    value={pageContent.hero.motionDesc}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, motionDesc: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <InlineEditable
                    value={pageContent.hero.designTitle}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, designTitle: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
                <p className="text-stone-600 leading-relaxed">
                  <InlineEditable
                    value={pageContent.hero.designDesc}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, designDesc: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <p className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <InlineEditable
                    value={pageContent.hero.locationTitle}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, locationTitle: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
                <p className="text-stone-600 leading-relaxed">
                  <InlineEditable
                    value={pageContent.hero.locationDesc}
                    onChange={(val) =>
                      setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, locationDesc: val } }))
                    }
                    isEditMode={isEditMode}
                    as="span"
                  />
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="mailto:liangelyp@gmail.com"
                className="w-full py-3 rounded-xl bg-neutral-950 text-white font-sans text-xs font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <InlineEditable
                  value={pageContent.hero.contactBtnText}
                  onChange={(val) =>
                    setPageContent((prev) => ({ ...prev, hero: { ...prev.hero, contactBtnText: val } }))
                  }
                  isEditMode={isEditMode}
                  as="span"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderGallerySection = (sectionIndex: number) => {
    return (
      <section
        key="gallery"
        id="galeria"
        className={`relative space-y-8 scroll-mt-20 transition-all duration-300 ${
          isEditMode
            ? 'p-6 sm:p-8 rounded-3xl border-2 border-dashed border-blue-400/80 bg-blue-50/20 shadow-md'
            : ''
        }`}
      >
        {isEditMode && (
          <div className="flex items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl shadow-lg border border-neutral-700 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
                Sección {sectionIndex + 1} de {pageContent.sectionsOrder.length}:
              </span>
              <span className="font-sans text-xs font-semibold text-white">
                {getSectionTitle('gallery')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={sectionIndex === 0}
                onClick={() => handleMoveSection(sectionIndex, 'up')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Subir sección"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Subir
              </button>
              <button
                type="button"
                disabled={sectionIndex === pageContent.sectionsOrder.length - 1}
                onClick={() => handleMoveSection(sectionIndex, 'down')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Bajar sección"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bajar
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1.5">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
              <InlineEditable
                value={pageContent.gallery.badge}
                onChange={(val) =>
                  setPageContent((prev) => ({ ...prev, gallery: { ...prev.gallery, badge: val } }))
                }
                isEditMode={isEditMode}
                as="span"
              />{' '}
              ({filteredItems.length} piezas)
            </p>
            <h2 className="font-headline text-2xl sm:text-3xl font-light text-neutral-950 tracking-tight">
              <InlineEditable
                value={pageContent.gallery.title}
                onChange={(val) =>
                  setPageContent((prev) => ({ ...prev, gallery: { ...prev.gallery, title: val } }))
                }
                isEditMode={isEditMode}
                as="span"
              />
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
        {isLoadingItems ? (
          /* Loading skeleton while Firestore data arrives */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-md w-full" />
                  <div className="h-3 bg-stone-100 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
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
    );
  };

  const renderMethodologySection = (sectionIndex: number) => {
    return (
      <section
        key="methodology"
        className={`relative bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-xs space-y-8 transition-all duration-300 ${
          isEditMode
            ? 'border-2 border-dashed border-blue-400/80 bg-blue-50/20 shadow-md'
            : ''
        }`}
      >
        {isEditMode && (
          <div className="flex items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl shadow-lg border border-neutral-700 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
                Sección {sectionIndex + 1} de {pageContent.sectionsOrder.length}:
              </span>
              <span className="font-sans text-xs font-semibold text-white">
                {getSectionTitle('methodology')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={sectionIndex === 0}
                onClick={() => handleMoveSection(sectionIndex, 'up')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Subir sección"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Subir
              </button>
              <button
                type="button"
                disabled={sectionIndex === pageContent.sectionsOrder.length - 1}
                onClick={() => handleMoveSection(sectionIndex, 'down')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Bajar sección"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bajar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
            <InlineEditable
              value={pageContent.methodology.badge}
              onChange={(val) =>
                setPageContent((prev) => ({
                  ...prev,
                  methodology: { ...prev.methodology, badge: val },
                }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </p>
          <h3 className="font-headline text-2xl sm:text-3xl font-light text-neutral-950 tracking-tight">
            <InlineEditable
              value={pageContent.methodology.title}
              onChange={(val) =>
                setPageContent((prev) => ({
                  ...prev,
                  methodology: { ...prev.methodology, title: val },
                }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
          {/* Card 1 */}
          <div className="space-y-2.5 p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-mono font-bold text-xs">
              <InlineEditable
                value={pageContent.methodology.card1Num}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card1Num: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </span>
            <h4 className="font-headline text-base font-semibold text-neutral-900">
              <InlineEditable
                value={pageContent.methodology.card1Title}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card1Title: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </h4>
            <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
              <InlineEditable
                value={pageContent.methodology.card1Desc}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card1Desc: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </p>
          </div>

          {/* Card 2 */}
          <div className="space-y-2.5 p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
              <InlineEditable
                value={pageContent.methodology.card2Num}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card2Num: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </span>
            <h4 className="font-headline text-base font-semibold text-neutral-900">
              <InlineEditable
                value={pageContent.methodology.card2Title}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card2Title: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </h4>
            <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
              <InlineEditable
                value={pageContent.methodology.card2Desc}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card2Desc: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </p>
          </div>

          {/* Card 3 */}
          <div className="space-y-2.5 p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
            <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-xs">
              <InlineEditable
                value={pageContent.methodology.card3Num}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card3Num: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </span>
            <h4 className="font-headline text-base font-semibold text-neutral-900">
              <InlineEditable
                value={pageContent.methodology.card3Title}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card3Title: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </h4>
            <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
              <InlineEditable
                value={pageContent.methodology.card3Desc}
                onChange={(val) =>
                  setPageContent((prev) => ({
                    ...prev,
                    methodology: { ...prev.methodology, card3Desc: val },
                  }))
                }
                isEditMode={isEditMode}
                as="span"
              />
            </p>
          </div>
        </div>
      </section>
    );
  };

  const renderContactSection = (sectionIndex: number) => {
    return (
      <section
        key="contact"
        className={`relative p-8 sm:p-12 rounded-3xl bg-neutral-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 ${
          isEditMode
            ? 'border-2 border-dashed border-blue-400/80 shadow-md ring-4 ring-blue-500/10'
            : ''
        }`}
      >
        {isEditMode && (
          <div className="w-full flex items-center justify-between p-3 bg-neutral-900 text-white rounded-2xl shadow-lg border border-neutral-700 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
                Sección {sectionIndex + 1} de {pageContent.sectionsOrder.length}:
              </span>
              <span className="font-sans text-xs font-semibold text-white">
                {getSectionTitle('contact')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={sectionIndex === 0}
                onClick={() => handleMoveSection(sectionIndex, 'up')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Subir sección"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Subir
              </button>
              <button
                type="button"
                disabled={sectionIndex === pageContent.sectionsOrder.length - 1}
                onClick={() => handleMoveSection(sectionIndex, 'down')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono transition-colors cursor-pointer"
                title="Bajar sección"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Bajar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-white/10 text-white/90 border border-white/20">
            <InlineEditable
              value={pageContent.contact.badge}
              onChange={(val) =>
                setPageContent((prev) => ({ ...prev, contact: { ...prev.contact, badge: val } }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </span>
          <h3 className="font-headline text-2xl sm:text-3xl font-semibold tracking-tight">
            <InlineEditable
              value={pageContent.contact.title}
              onChange={(val) =>
                setPageContent((prev) => ({ ...prev, contact: { ...prev.contact, title: val } }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </h3>
          <p className="font-sans text-sm text-white/70 max-w-xl">
            <InlineEditable
              value={pageContent.contact.description}
              onChange={(val) =>
                setPageContent((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, description: val },
                }))
              }
              isEditMode={isEditMode}
              as="span"
            />
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
            <InlineEditable
              value={pageContent.contact.whatsappText}
              onChange={(val) =>
                setPageContent((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, whatsappText: val },
                }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </a>
          <a
            href="mailto:liangelyp@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-neutral-950 font-sans text-sm font-semibold transition-colors shadow-lg"
          >
            <Send className="w-4 h-4" />
            <InlineEditable
              value={pageContent.contact.emailText}
              onChange={(val) =>
                setPageContent((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, emailText: val },
                }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/liangely-diseno-grafico/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-sm font-medium transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <InlineEditable
              value={pageContent.contact.linkedinText}
              onChange={(val) =>
                setPageContent((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, linkedinText: val },
                }))
              }
              isEditMode={isEditMode}
              as="span"
            />
          </a>
        </div>
      </section>
    );
  };

  const renderSectionById = (sectionId: MultimediaSectionId, index: number) => {
    switch (sectionId) {
      case 'hero':
        return renderHeroSection(index);
      case 'gallery':
        return renderGallerySection(index);
      case 'methodology':
        return renderMethodologySection(index);
      case 'contact':
        return renderContactSection(index);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-body selection:bg-neutral-200">
      {/* Sticky Floating Control Bar when in Visual Edit Mode */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="sticky top-0 z-50 w-full bg-neutral-950/90 text-white backdrop-blur-xl border-b border-blue-500/40 shadow-xl px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
                  Modo Editor Visual Activo
                </span>
                <span className="hidden md:inline text-stone-300 text-xs font-sans">
                  · Haz clic directamente en cualquier texto para editarlo. Usa las flechas ▲ ▼ para reordenar secciones.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePageContent}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-sans text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Top Navigation for this specific page */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-sm tracking-tight text-neutral-900">
              Lia Parra
            </span>
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-neutral-100 text-neutral-700 border border-neutral-200">
              MULTIMEDIA &amp; AI
            </span>
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

      {/* Main Container: Dynamic Sections in Custom Order */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16 text-left">
        {pageContent.sectionsOrder.map((sectionId, index) =>
          renderSectionById(sectionId, index)
        )}
      </main>

      {/* Floating Settings Gear Button (⚙️ Ruedita discreta abajo a la derecha) */}
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
        onEnterEditMode={() => setIsEditMode(true)}
        sectionsOrder={pageContent.sectionsOrder}
        onUpdateSectionsOrder={handleUpdateSectionsOrder}
      />
    </div>
  );
};
