import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  Copy,
  Layers,
} from 'lucide-react';
import type { MultimediaItem, MediaFormat, MediaAsset } from '../../types/multimedia';
import { normalizeCategory, getItemAssets } from '../../types/multimedia';
import { parseMediaUrl, extractDriveFileId } from '../../utils/driveUrlHelper';
import { multimediaInitialItems } from '../../data/multimediaInitialItems';

interface MultimediaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MultimediaItem[];
  onUpdateItems: (newItems: MultimediaItem[]) => void;
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
}) => {
  // Form state for adding or editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'MOTION' | 'IA' | 'KEY_VISUALS'>('MOTION');
  const [toolsInput, setToolsInput] = useState('After Effects, Runway Gen-3, Midjourney');
  const [description, setDescription] = useState('');
  const [hookRationale, setHookRationale] = useState('');

  // Multi-asset state
  const [assetsList, setAssetsList] = useState<AssetInputState[]>([
    { id: 'asset-1', url: '', preferredType: 'video', format: '16:9', title: '' },
  ]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDriveHelp, setShowDriveHelp] = useState(false);

  const resetForm = () => {
    setEditingItemId(null);
    setTitle('');
    setDescription('');
    setHookRationale('');
    setToolsInput('After Effects, Runway Gen-3, Midjourney');
    setCategory('MOTION');
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

    if (editingItemId) {
      // Update existing item
      const updated = items.map((item) => {
        if (item.id === editingItemId) {
          return {
            ...item,
            title,
            category,
            tools: toolsArray.length ? toolsArray : ['Design', 'Motion'],
            description,
            hookRationale,
            assets: parsedAssets,
            // primary fallbacks
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
        category,
        tools: toolsArray.length ? toolsArray : ['Creative Direction', 'AI'],
        description: description || 'Pieza multimedia creada para campañas digitales.',
        hookRationale: hookRationale || '',
        createdAt: Date.now(),
        assets: parsedAssets,
        // primary fallbacks
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
    setEditingItemId(item.id);
    setTitle(item.title);
    setCategory(normalizeCategory(item.category));
    setToolsInput(item.tools.join(', '));
    setDescription(item.description);
    setHookRationale(item.hookRationale || '');

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
    if (window.confirm('¿Seguro que deseas eliminar esta pieza de la galería?')) {
      onUpdateItems(items.filter((item) => item.id !== id));
      if (editingItemId === id) resetForm();
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    onUpdateItems(newItems);
  };

  // Drag and drop handlers
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

  const handleRestoreDefaults = () => {
    if (window.confirm('¿Deseas restaurar las piezas de muestra recomendadas?')) {
      onUpdateItems(multimediaInitialItems);
      resetForm();
    }
  };

  const handleCopyDirectLink = () => {
    const currentUrl = window.location.origin + window.location.pathname + '#multimedia';
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
        <div className="px-6 py-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-headline text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                Gestor Multimedia &amp; Drive Links
              </h2>
            </div>
            <p className="font-sans text-xs text-stone-600">
              Agrega uno o varios assets por entrada (Drive, videos, imágenes) y organiza el orden con drag &amp; drop.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDirectLink}
              title="Copiar enlace directo a esta página"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link copiado' : 'Copiar URL directa'}
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

        {/* Content Body: Two columns on Desktop */}
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

              <div className="space-y-1">
                <label className="block font-sans text-xs font-semibold text-neutral-800">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-sans bg-white focus:outline-none focus:border-neutral-900"
                >
                  <option value="MOTION">Motion</option>
                  <option value="IA">IA</option>
                  <option value="KEY_VISUALS">Key Visuals</option>
                </select>
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

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
                              <Video className="w-3 h-3" />
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
                              <ImageIcon className="w-3 h-3" />
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

          {/* Right Column: Drag and Drop Reordering List */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-neutral-900">
                    🔀 Orden de las Piezas ({items.length})
                  </h3>
                  <p className="font-sans text-[11px] text-stone-500">
                    Arrastra las tarjetas o usa las flechas para ordenar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  title="Restaurar ejemplos originales"
                  className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restablecer
                </button>
              </div>

              {/* Items List with Drag and Drop */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
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
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px]">
                                <Video className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Title & Tag */}
                          <div className="min-w-0 flex-1">
                            <p className="font-headline text-xs font-semibold text-neutral-900 truncate">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {itemAssets.length > 1 && (
                                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                                  <Layers className="w-2.5 h-2.5" />
                                  {itemAssets.length}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                                {primary.format}
                              </span>
                              <span className="text-[10px] font-sans text-stone-500 truncate">
                                {normalizeCategory(item.category) === 'MOTION'
                                  ? 'Motion'
                                  : normalizeCategory(item.category) === 'IA'
                                  ? 'IA'
                                  : 'Key Visuals'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Arrows, Edit, Delete */}
                        <div className="flex items-center gap-1 shrink-0">
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
                            title="Eliminar"
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
              <span>💾 Se sincroniza en vivo en la nube (Firestore).</span>
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
      </motion.div>
    </div>
  );
};
