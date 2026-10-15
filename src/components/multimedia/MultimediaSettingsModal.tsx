import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Copy,
  Layers,
  Edit3,
  Sliders,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { MultimediaItem, MediaFormat, MediaAsset } from '../../types/multimedia';
import { normalizeCategory, getItemAssets, getItemCategories } from '../../types/multimedia';
import { parseMediaUrl, extractDriveFileId } from '../../utils/driveUrlHelper';
import type { MultimediaSectionId } from '../../types/multimediaContent';

interface MultimediaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MultimediaItem[];
  onUpdateItems: (newItems: MultimediaItem[]) => void;
  onEnterEditMode: () => void;
  sectionsOrder: MultimediaSectionId[];
  onUpdateSectionsOrder: (order: MultimediaSectionId[]) => void;
}

interface AssetInputState {
  id: string;
  url: string;
  preferredType: 'video' | 'image';
  format: MediaFormat;
  title: string;
}

export const MultimediaSettingsModal: React.FC<MultimediaSettingsModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  onEnterEditMode,
  sectionsOrder,
  onUpdateSectionsOrder,
}) => {
  // Tab state: 'items' or 'page-editor'
  const [activeTab, setActiveTab] = useState<'items' | 'page-editor'>('items');

  // Dynamically populate availableCategories from default categories + any category found in items
  React.useEffect(() => {
    const baseMap = new Map<string, string>([
      ['MOTION', 'Motion'],
      ['IA', 'IA'],
      ['KEY_VISUALS', 'Key Visuals'],
    ]);
    items.forEach((it) => {
      const cats = getItemCategories(it);
      cats.forEach((c) => {
        if (!baseMap.has(c)) {
          const label = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase().replace(/_/g, ' ');
          baseMap.set(c, label);
        }
      });
    });
    setAvailableCategories(
      Array.from(baseMap.entries()).map(([value, label]) => ({ value, label }))
    );
  }, [items]);

  // Form state for adding or editing items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<string[]>(['MOTION']);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [availableCategories, setAvailableCategories] = useState<{ value: string; label: string }[]>([
    { value: 'MOTION', label: 'Motion' },
    { value: 'IA', label: 'IA' },
    { value: 'KEY_VISUALS', label: 'Key Visuals' },
  ]);
  const [toolsInput, setToolsInput] = useState('After Effects, Runway Gen-3, Midjourney');
  const [description, setDescription] = useState('');
  const [hookRationale, setHookRationale] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Multi-asset state
  const [assetsList, setAssetsList] = useState<AssetInputState[]>([
    { id: 'asset-1', url: '', preferredType: 'video', format: '16:9', title: '' },
  ]);

  // Drag and drop state for items
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const resetForm = () => {
    setEditingItemId(null);
    setTitle('');
    setDescription('');
    setHookRationale('');
    setToolsInput('After Effects, Runway Gen-3, Midjourney');
    setCategories(['MOTION']);
    setCustomCategoryInput('');
    setIsVisible(true);
    setAssetsList([{ id: `asset-${Date.now()}`, url: '', preferredType: 'video', format: '16:9', title: '' }]);
  };

  const handleAddAssetRow = () => {
    setAssetsList((prev) => [
      ...prev,
      { id: `asset-${Date.now()}-${prev.length}`, url: '', preferredType: 'video', format: '16:9', title: '' },
    ]);
  };

  const handleRemoveAssetRow = (index: number) => {
    if (assetsList.length <= 1) return;
    setAssetsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAsset = <K extends keyof AssetInputState>(
    index: number,
    field: K,
    value: AssetInputState[K]
  ) => {
    setAssetsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validAssets = assetsList.filter((a) => a.url.trim().length > 0);
    if (validAssets.length === 0) {
      alert('Debes ingresar al menos un enlace de recurso multimedia (Google Drive, video o imagen).');
      return;
    }

    const parsedAssets: MediaAsset[] = validAssets.map((a, idx) => {
      const parsed = parseMediaUrl(a.url, a.preferredType);
      return {
        id: a.id || `asset-${idx}-${Date.now()}`,
        url: parsed.url,
        rawUrl: parsed.rawUrl,
        mediaType: parsed.mediaType,
        format: a.format,
        title: a.title.trim() || undefined,
        thumbnailUrl: parsed.thumbnailUrl,
        driveFileId: parsed.driveFileId,
      };
    });

    const primary = parsedAssets[0];
    const toolsArray = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalCategories = categories.length > 0 ? categories : ['MOTION'];
    const primaryCategory = (finalCategories[0] as any) || 'MOTION';

    if (editingItemId) {
      // Update existing item
      const updated = items.map((item) => {
        if (item.id === editingItemId) {
          return {
            ...item,
            title,
            category: primaryCategory,
            categories: finalCategories,
            tools: toolsArray.length ? toolsArray : ['Design', 'Motion'],
            description,
            hookRationale,
            hidden: !isVisible,
            assets: parsedAssets,
            mediaType: primary.mediaType,
            url: primary.url,
            rawUrl: primary.rawUrl,
            driveFileId: primary.driveFileId,
            thumbnailUrl: primary.thumbnailUrl || item.thumbnailUrl,
            format: primary.format,
          };
        }
        return item;
      });
      onUpdateItems(updated);
    } else {
      // Add new item to the top
      const newItem: MultimediaItem = {
        id: `item-${Date.now()}`,
        title,
        category: primaryCategory,
        categories: finalCategories,
        tools: toolsArray.length ? toolsArray : ['Creative Direction', 'AI'],
        description: description || 'Pieza multimedia creada para campañas digitales.',
        hookRationale: hookRationale || '',
        hidden: !isVisible,
        createdAt: Date.now(),
        assets: parsedAssets,
        mediaType: primary.mediaType,
        url: primary.url,
        rawUrl: primary.rawUrl,
        driveFileId: primary.driveFileId,
        thumbnailUrl: primary.thumbnailUrl,
        format: primary.format,
      };
      onUpdateItems([newItem, ...items]);
    }

    resetForm();
  };

  const handleStartEdit = (item: MultimediaItem) => {
    setActiveTab('items');
    setEditingItemId(item.id);
    setTitle(item.title);
    const itemCats = getItemCategories(item);
    setCategories(itemCats);
    setToolsInput(item.tools.join(', '));
    setDescription(item.description);
    setHookRationale(item.hookRationale || '');
    setIsVisible(!item.hidden);

    const itemAssets = getItemAssets(item);
    setAssetsList(
      itemAssets.map((a, idx) => ({
        id: a.id || `asset-${idx}`,
        url: a.rawUrl || a.url,
        preferredType: a.mediaType.includes('image') ? 'image' : 'video',
        format: a.format || '16:9',
        title: a.title || '',
      }))
    );
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta pieza permanentemente de la galería?')) {
      onUpdateItems(items.filter((item) => item.id !== id));
      if (editingItemId === id) resetForm();
    }
  };

  // Toggle item visibility without deleting it
  const handleToggleVisibility = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          hidden: !item.hidden,
        };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    onUpdateItems(newItems);
  };

  // Section reordering logic
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionsOrder.length) return;
    const newOrder = [...sectionsOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    onUpdateSectionsOrder(newOrder);
  };

  const sectionLabels: Record<MultimediaSectionId, { title: string; desc: string }> = {
    hero: {
      title: 'Hero / Presentación & Stack Creativo',
      desc: 'Titular H1 principal, biografía, propuesta de valor y caja de herramientas.',
    },
    gallery: {
      title: 'Galería / Portfolio Showcase',
      desc: 'Parrilla de piezas audiovisuales, filtros por categoría y visor interactivo.',
    },
    methodology: {
      title: 'Cómo trabajo / Metodología',
      desc: '3 Pilares: Hooks de 3s, IA integrada al pipeline real y adaptabilidad omnicanal.',
    },
    contact: {
      title: 'Contacto & Banner Final',
      desc: 'Llamado a la acción para proyectos y enlaces directos a WhatsApp, Email y LinkedIn.',
    },
  };

  // Drag and drop handlers for items
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    onUpdateItems(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCopyDirectLink = () => {
    const currentUrl = window.location.origin + window.location.pathname + '#multimedia';
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLaunchEditMode = () => {
    onClose();
    onEnterEditMode();
  };

  const visibleItemsCount = items.filter((i) => !i.hidden).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 z-10 my-auto text-left"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-headline text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                Panel de Configuración Multimedia
              </h2>
            </div>
            <p className="font-sans text-xs text-stone-600">
              Administra los videos, su visibilidad (mostrar/ocultar), o reordena las secciones de la página.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchEditMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Modo Editor de Página</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDirectLink}
              title="Copiar enlace directo a esta página"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link copiado' : 'Copiar URL'}
            </button>

            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-stone-200 bg-white flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-neutral-800'
            }`}
          >
            <Video className="w-4 h-4" />
            Piezas de la Galería ({visibleItemsCount} visibles / {items.length} total)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page-editor')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'page-editor'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-stone-500 hover:text-neutral-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Reordenar Secciones &amp; Editor Visual
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'items' ? (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form to Add/Edit */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-neutral-900">
                  {editingItemId ? '✏️ Editar Entrada' : '➕ Añadir Nueva Entrada'}
                </h3>
                {editingItemId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {/* Title & Category */}
                <div className="space-y-1">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Título de la entrada *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej: Campaña Visual 360° & Reels AI"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Categorías (selecciona una o más)
                  </label>

                  {/* Tag Checkboxes */}
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((cat) => {
                      const isSelected = categories.includes(cat.value);
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setCategories((prev) =>
                              isSelected
                                ? prev.filter((c) => c !== cat.value)
                                : [...prev, cat.value]
                            );
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-300 hover:border-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom category */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = customCategoryInput.trim();
                          if (!trimmed) return;
                          const val = trimmed.toUpperCase().replace(/\s+/g, '_');
                          if (!availableCategories.find((c) => c.value === val)) {
                            setAvailableCategories((prev) => [...prev, { value: val, label: trimmed }]);
                          }
                          if (!categories.includes(val)) {
                            setCategories((prev) => [...prev, val]);
                          }
                          setCustomCategoryInput('');
                        }
                      }}
                      placeholder="Nueva categoría... (Enter para añadir)"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = customCategoryInput.trim();
                        if (!trimmed) return;
                        const val = trimmed.toUpperCase().replace(/\s+/g, '_');
                        if (!availableCategories.find((c) => c.value === val)) {
                          setAvailableCategories((prev) => [...prev, { value: val, label: trimmed }]);
                        }
                        if (!categories.includes(val)) {
                          setCategories((prev) => [...prev, val]);
                        }
                        setCustomCategoryInput('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Multi-Assets Section */}
                <div className="space-y-3 pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="font-headline text-xs font-bold uppercase tracking-wider text-neutral-900">
                        Recursos &amp; Assets ({assetsList.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAssetRow}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir otro asset
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {assetsList.map((asset, index) => {
                      const isDrive = asset.url ? !!extractDriveFileId(asset.url) : false;
                      return (
                        <div
                          key={asset.id}
                          className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2.5 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                              Asset #{index + 1} {index === 0 ? '(Principal / Portada)' : ''}
                            </span>

                            {assetsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAssetRow(index)}
                                className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                title="Eliminar este asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* URL field */}
                          <div className="relative">
                            <input
                              type="url"
                              required={index === 0}
                              value={asset.url}
                              onChange={(e) => handleUpdateAsset(index, 'url', e.target.value)}
                              placeholder="Enlace de Google Drive, video .mp4 o imagen..."
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900 pr-8 bg-white"
                            />
                            <div className="absolute right-2.5 top-2.5 text-stone-400 pointer-events-none">
                              <LinkIcon className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          {/* Asset Title (optional label) */}
                          <input
                            type="text"
                            value={asset.title}
                            onChange={(e) => handleUpdateAsset(index, 'title', e.target.value)}
                            placeholder="Etiqueta opcional (ej: Reel 9:16, Key Visual Feed, Storyboard)"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-sans bg-white focus:outline-none focus:border-neutral-900"
                          />

                          {/* Type toggle & Format selector */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="flex rounded-lg border border-stone-200 bg-white overflow-hidden p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateAsset(index, 'preferredType', 'video')}
                                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                  asset.preferredType === 'video'
                                    ? 'bg-neutral-900 text-white font-semibold'
                                    : 'text-stone-600 hover:bg-stone-50'
                                }`}
                              >
                                <Video className="w-3.5 h-3.5" />
                                Video
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateAsset(index, 'preferredType', 'image')}
                                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                  asset.preferredType === 'image'
                                    ? 'bg-neutral-900 text-white font-semibold'
                                    : 'text-stone-600 hover:bg-stone-50'
                                }`}
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Imagen
                              </button>
                            </div>

                            <select
                              value={asset.format}
                              onChange={(e) => handleUpdateAsset(index, 'format', e.target.value as any)}
                              className="px-2 py-1 rounded-lg border border-stone-200 text-xs font-sans bg-white focus:outline-none focus:border-neutral-900"
                            >
                              <option value="9:16">9:16 (Vertical)</option>
                              <option value="1:1">1:1 (Cuadrado)</option>
                              <option value="16:9">16:9 (Horizontal)</option>
                              <option value="4:5">4:5 (Feed)</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>

                          {isDrive && (
                            <p className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                              ✨ Link de Google Drive detectado
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAssetRow}
                    className="w-full py-2 rounded-xl border border-dashed border-stone-300 hover:border-neutral-900 text-stone-600 hover:text-black font-sans text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Añadir otro asset a esta entrada
                  </button>
                </div>

                {/* Tools */}
                <div className="space-y-1 pt-2 border-t border-stone-200">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Herramientas usadas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={toolsInput}
                    onChange={(e) => setToolsInput(e.target.value)}
                    placeholder="After Effects, Runway Gen-3, Midjourney, Figma"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Concepto / Rationale creativo
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explica brevemente la idea, el objetivo de comunicación y la ejecución técnica."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {/* Hook / Social Retención */}
                <div className="space-y-1">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Hook de 3s o Estrategia de Retención (Opcional)
                  </label>
                  <input
                    type="text"
                    value={hookRationale}
                    onChange={(e) => setHookRationale(e.target.value)}
                    placeholder="ej: Hook visual de 2s con contraste cromático para detener el scroll."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900"
                  />
                </div>

                {/* Visibility Switch (Show/Hide without deleting) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isVisible
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-sans text-xs font-semibold text-neutral-900">
                        {isVisible ? 'Visible en el portafolio' : 'Oculto del portafolio'}
                      </p>
                      <p className="font-sans text-[11px] text-stone-500">
                        {isVisible
                          ? 'Esta pieza se muestra activamente en la galería pública.'
                          : 'No se muestra en la web pública (se conserva guardada aquí).'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                      isVisible ? 'bg-emerald-500' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        isVisible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neutral-950 text-white font-sans text-xs font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {editingItemId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingItemId ? 'Guardar Cambios' : 'Añadir a la Galería'}
                </button>
              </form>
            </div>

            {/* Right Column: Items Manager with Visibility Toggles */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-neutral-900">
                      🔀 Casos &amp; Visibilidad ({items.length})
                    </h3>
                    <p className="font-sans text-[11px] text-stone-500">
                      Activa o desactiva el ojo 👁️ para mostrar u ocultar casos sin borrarlos.
                    </p>
                  </div>
                </div>

                {/* Items List with Drag & Drop and Visibility Toggles */}
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl space-y-2">
                      <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="font-sans text-xs text-stone-600">No hay piezas añadidas aún.</p>
                      <p className="font-sans text-[11px] text-stone-400">
                        Crea una entrada con uno o más assets a la izquierda.
                      </p>
                    </div>
                  ) : (
                    items.map((item, index) => {
                      const isDragging = draggedIndex === index;
                      const isOver = dragOverIndex === index;
                      const itemAssets = getItemAssets(item);
                      const primary: MediaAsset = itemAssets[0] || { id: 'fallback', url: '', mediaType: 'image', format: '16:9' };
                      const isItemHidden = Boolean(item.hidden);

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop(index)}
                          className={`group p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none ${
                            isOver
                              ? 'border-neutral-950 bg-stone-100 scale-[1.01]'
                              : isDragging
                              ? 'opacity-40 border-dashed border-stone-400'
                              : isItemHidden
                              ? 'bg-stone-50/70 border-dashed border-stone-300 opacity-75 hover:opacity-100'
                              : 'bg-white border-stone-200 hover:border-stone-400 shadow-2xs'
                          }`}
                        >
                          {/* Drag Handle & Info */}
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 text-stone-400 group-hover:text-stone-700"
                              title="Arrastrar para ordenar"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Mini Thumbnail */}
                            <div className="w-12 h-12 rounded-lg bg-neutral-900 shrink-0 overflow-hidden relative">
                              {primary.thumbnailUrl || (primary.mediaType === 'image' && primary.url) ? (
                                <img
                                  src={primary.thumbnailUrl || primary.url}
                                  alt={item.title}
                                  className={`w-full h-full object-cover ${isItemHidden ? 'grayscale' : ''}`}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px]">
                                  <Video className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            {/* Title & Tag */}
                            <div className="min-w-0 flex-1">
                              <p className={`font-headline text-xs font-semibold truncate ${isItemHidden ? 'text-stone-600 line-through' : 'text-neutral-900'}`}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {/* Visibility Badge */}
                                {isItemHidden ? (
                                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/90 px-1.5 py-0.2 rounded flex items-center gap-1">
                                    <EyeOff className="w-2.5 h-2.5" />
                                    Oculto
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-1.5 py-0.2 rounded flex items-center gap-1">
                                    <Eye className="w-2.5 h-2.5" />
                                    Visible
                                  </span>
                                )}

                                {itemAssets.length > 1 && (
                                  <span className="text-[10px] font-mono font-bold text-stone-700 bg-stone-100 border border-stone-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                                    <Layers className="w-2.5 h-2.5" />
                                    {itemAssets.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Visibility Toggle, Arrows, Edit, Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Eye Visibility Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleVisibility(item.id, e)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                isItemHidden
                                  ? 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                                  : 'text-emerald-600 hover:text-stone-500 hover:bg-stone-100'
                              }`}
                              title={isItemHidden ? 'Mostrar este caso en el portafolio' : 'Ocultar este caso sin borrar'}
                            >
                              {isItemHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMove(index, 'up')}
                              className="w-7 h-7 rounded-lg text-stone-500 hover:text-black hover:bg-stone-100 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Subir"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === items.length - 1}
                              onClick={() => handleMove(index, 'down')}
                              className="w-7 h-7 rounded-lg text-stone-500 hover:text-black hover:bg-stone-100 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Bajar"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="px-2 py-1 text-[11px] font-sans font-medium text-stone-700 hover:text-black hover:bg-stone-100 rounded-md cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                              title="Eliminar permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom info alert */}
              <div className="p-3 bg-stone-100 rounded-2xl text-[11px] font-sans text-stone-600 flex items-center justify-between">
                <span>💾 Los cambios se guardan y sincronizan en vivo.</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-black cursor-pointer shadow-xs"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Page Editor Mode & Section Reordering */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Direct Visual Edit Mode Hero Action */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white relative overflow-hidden shadow-xl border border-blue-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white/20 text-blue-200 border border-white/20">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Editor Visual en Vivo
                </span>
                <h3 className="font-headline text-2xl font-bold tracking-tight text-white">
                  Editar directamente en pantalla todos los textos y títulos
                </h3>
                <p className="font-sans text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Al entrar en este modo, podrás hacer clic sobre cualquier titular, párrafo o botón de la página multimedia y modificarlo al instante con tu teclado, viendo el resultado en vivo.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunchEditMode}
                className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-950 font-sans text-sm font-bold hover:bg-blue-50 transition-all shadow-lg hover:scale-105 cursor-pointer shrink-0"
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Entrar en Modo Editor Visual</span>
              </button>
            </div>

            {/* Sections Reordering Section */}
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <h3 className="font-headline text-base font-bold text-neutral-950">
                  Reordenar Secciones de la Página
                </h3>
                <p className="font-sans text-xs text-stone-500">
                  Cambia el orden en el que se visualizan los bloques de la página en tiempo real.
                </p>
              </div>

              <div className="space-y-3">
                {sectionsOrder.map((sectionId, idx) => {
                  const info = sectionLabels[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-neutral-400 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-neutral-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          0{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-headline text-sm font-bold text-neutral-900">
                            {info?.title || sectionId}
                          </h4>
                          <p className="font-sans text-xs text-stone-600 line-clamp-1">
                            {info?.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Subir sección"
                        >
                          <ArrowUp className="w-4 h-4 text-stone-700" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sectionsOrder.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Bajar sección"
                        >
                          <ArrowDown className="w-4 h-4 text-stone-700" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
