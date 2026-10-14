import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  Share2,
  Copy,
} from 'lucide-react';
import type { MultimediaItem, MultimediaCategory, MediaFormat } from '../../types/multimedia';
import { parseMediaUrl, extractDriveFileId } from '../../utils/driveUrlHelper';
import { multimediaInitialItems } from '../../data/multimediaInitialItems';

interface MultimediaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MultimediaItem[];
  onUpdateItems: (newItems: MultimediaItem[]) => void;
}

export const MultimediaSettingsModal: React.FC<MultimediaSettingsModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
}) => {
  // Form state for adding or editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [preferredType, setPreferredType] = useState<'video' | 'image'>('video');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<MultimediaCategory, 'TODOS'>>('MOTION_VIDEO');
  const [format, setFormat] = useState<MediaFormat>('16:9');
  const [toolsInput, setToolsInput] = useState('After Effects, Runway Gen-3, Midjourney');
  const [description, setDescription] = useState('');
  const [hookRationale, setHookRationale] = useState('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDriveHelp, setShowDriveHelp] = useState(false);

  // Compute live preview of the entered URL
  const parsedPreview = inputUrl.trim() ? parseMediaUrl(inputUrl, preferredType) : null;
  const isDriveDetected = inputUrl ? !!extractDriveFileId(inputUrl) : false;

  const resetForm = () => {
    setEditingItemId(null);
    setInputUrl('');
    setTitle('');
    setDescription('');
    setHookRationale('');
    setToolsInput('After Effects, Runway Gen-3, Midjourney');
    setFormat('16:9');
    setCategory('MOTION_VIDEO');
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !title.trim()) return;

    const parsed = parseMediaUrl(inputUrl, preferredType);
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
            mediaType: parsed.mediaType,
            url: parsed.url,
            rawUrl: parsed.rawUrl,
            driveFileId: parsed.driveFileId,
            thumbnailUrl: parsed.thumbnailUrl || item.thumbnailUrl,
            format,
            tools: toolsArray.length ? toolsArray : ['Design', 'Motion'],
            description,
            hookRationale,
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
        mediaType: parsed.mediaType,
        url: parsed.url,
        rawUrl: parsed.rawUrl,
        driveFileId: parsed.driveFileId,
        thumbnailUrl: parsed.thumbnailUrl,
        format,
        tools: toolsArray.length ? toolsArray : ['Creative Direction', 'AI'],
        description: description || 'Pieza multimedia creada para campañas digitales.',
        hookRationale: hookRationale || '',
        createdAt: Date.now(),
      };
      onUpdateItems([newItem, ...items]);
    }

    resetForm();
  };

  const handleStartEdit = (item: MultimediaItem) => {
    setEditingItemId(item.id);
    setInputUrl(item.rawUrl || item.url);
    setTitle(item.title);
    setCategory(item.category);
    setFormat(item.format);
    setToolsInput(item.tools.join(', '));
    setDescription(item.description);
    setHookRationale(item.hookRationale || '');
    setPreferredType(item.mediaType === 'image' || item.mediaType === 'drive_image' ? 'image' : 'video');
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
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 z-10 my-auto text-left"
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
              Pega links de Google Drive, videos o imágenes y organiza el orden con drag &amp; drop.
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
          {/* Left Column: Form to Paste & Add/Edit */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-neutral-900">
                {editingItemId ? '✏️ Editar Pieza' : '➕ Añadir Nueva Pieza'}
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
              {/* Drive link or URL field */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-semibold text-neutral-800">
                  Enlace de Google Drive, Video o Imagen *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... o https://.../video.mp4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 pr-9"
                  />
                  <div className="absolute right-3 top-3 text-stone-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                </div>

                {isDriveDetected && (
                  <div className="flex items-center justify-between text-[11px] text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2.5 py-1.5 rounded-lg">
                    <span className="font-medium">✨ Enlace de Google Drive detectado</span>
                    <button
                      type="button"
                      onClick={() => setShowDriveHelp(!showDriveHelp)}
                      className="inline-flex items-center gap-1 font-semibold underline text-blue-800 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      Permisos
                    </button>
                  </div>
                )}
              </div>

              {/* Drive help toggle */}
              {showDriveHelp && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
                  <p className="font-semibold">Importante para enlaces de Google Drive:</p>
                  <p>
                    1. En Google Drive, haz clic derecho en el archivo &gt; <strong>Compartir</strong>.<br />
                    2. En &quot;Acceso general&quot;, selecciona <strong>&quot;Cualquier persona con el enlace&quot;</strong>.<br />
                    3. Los videos se reproducen con el visor de Drive y las imágenes se renderizan en alta resolución.
                  </p>
                </div>
              )}

              {/* Type Preference (Video vs Imagen) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredType('video')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    preferredType === 'video'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Es Video / Reel
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredType('image')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    preferredType === 'image'
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Es Imagen / Gráfico
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block font-sans text-xs font-semibold text-neutral-800">
                  Título de la pieza *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej: Reel Lanzamiento Producto · AI Motion"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-sans focus:outline-none focus:border-neutral-900"
                />
              </div>

              {/* Category & Format */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-sans bg-white focus:outline-none focus:border-neutral-900"
                  >
                    <option value="MOTION_VIDEO">Motion &amp; Video</option>
                    <option value="AI_GENERATIVO">IA Generativa</option>
                    <option value="KEY_VISUAL_PAID">Key Visual · Paid Ads</option>
                    <option value="SOCIAL_HOOKS">Social Hook (9:16)</option>
                    <option value="THREED_CONCEPT">3D &amp; Motion</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-sans text-xs font-semibold text-neutral-800">
                    Formato
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-sans bg-white focus:outline-none focus:border-neutral-900"
                  >
                    <option value="9:16">9:16 (Vertical Reels/TikTok)</option>
                    <option value="1:1">1:1 (Cuadrado Feed)</option>
                    <option value="16:9">16:9 (Horizontal)</option>
                    <option value="4:5">4:5 (Feed Vertical)</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-1">
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

            {/* Instant Preview Box */}
            {parsedPreview && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <p className="font-mono text-[10px] uppercase font-bold tracking-wider text-stone-500">
                  Vista Previa en Vivo
                </p>
                <div className="h-32 bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center">
                  {parsedPreview.mediaType === 'drive_video' ? (
                    <div className="text-white text-xs font-sans text-center p-2">
                      <Video className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                      Google Drive Video Embed ({parsedPreview.driveFileId})
                    </div>
                  ) : parsedPreview.mediaType === 'video' ? (
                    <video
                      src={parsedPreview.url}
                      muted
                      autoPlay
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={parsedPreview.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Drag and Drop Reordering List */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
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
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl space-y-2">
                    <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
                    <p className="font-sans text-xs text-stone-600">No hay piezas añadidas aún.</p>
                    <p className="font-sans text-[11px] text-stone-400">
                      Pega un link en el formulario de la izquierda para comenzar.
                    </p>
                  </div>
                ) : (
                  items.map((item, index) => {
                    const isDragging = draggedIndex === index;
                    const isOver = dragOverIndex === index;
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
                            {item.thumbnailUrl || (item.mediaType === 'image' && item.url) ? (
                              <img
                                src={item.thumbnailUrl || item.url}
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
                              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                                {item.format}
                              </span>
                              <span className="text-[10px] font-sans text-stone-500 truncate">
                                {item.category.replace(/_/g, ' ')}
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
              <span>💾 Los cambios se guardan automáticamente en tu navegador.</span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black cursor-pointer"
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
