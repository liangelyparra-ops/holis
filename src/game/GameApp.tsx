import React, { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Home, Mail, Share2 } from 'lucide-react';
import GameSection from './GameSection';
import { portfolioContent } from '../data/portfolioContent';

export default function GameApp() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomId, setRoomId] = useState('global-party');

  const handleShare = async () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.get('room') && roomId) {
      url.searchParams.set('room', roomId);
    }
    const shareUrl = url.toString();
    const shareData = {
      title: 'Holis Party Game',
      text: '¡Únete a mi partida en Holis!',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('¡Link de la partida copiado al portapapeles!');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-[600px] h-[600px] bg-[#3C48C3]/15 blur-[120px]" />
        <div className="absolute -bottom-10 -right-10 w-[650px] h-[650px] bg-[#3C48C3]/10 blur-[140px]" />
      </div>

      <Toaster position="top-right" richColors closeButton />

      {/* Floating icon menu — only shown when NOT in a room */}
      {!isInRoom ? (
        <nav
          className="fixed top-4 right-4 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 shadow-xl transition-all"
          aria-label="Game navigation"
        >
          {/* Home / Back to portfolio */}
          <div className="relative group">
            <a
              href="/"
              aria-label="Volver al portafolio"
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </a>
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900/95 border border-neutral-800 text-white text-[10px] font-sans font-medium tracking-wide shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Portafolio
            </span>
          </div>

          {/* WhatsApp */}
          <div className="relative group">
            <a
              href={portfolioContent.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900/95 border border-neutral-800 text-white text-[10px] font-sans font-medium tracking-wide shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              WhatsApp
            </span>
          </div>

          {/* Mail */}
          <div className="relative group">
            <a
              href={`mailto:${portfolioContent.email}`}
              aria-label="Enviar correo"
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-indigo-400 hover:bg-indigo-950/40 transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900/95 border border-neutral-800 text-white text-[10px] font-sans font-medium tracking-wide shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Mail
            </span>
          </div>
        </nav>
      ) : (
        /* Floating share button when inside a room */
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-800 hover:border-[#3C48C3]/70 hover:bg-neutral-850 shadow-xl text-neutral-200 hover:text-white transition-all cursor-pointer group active:scale-95"
            aria-label="Compartir partida"
            title="Compartir link de la partida"
          >
            <Share2 className="w-4 h-4 text-[#3C48C3] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-headline font-bold uppercase tracking-wider">
              Compartir
            </span>
          </button>
        </div>
      )}

      <main className="relative z-10 w-full min-h-screen flex flex-col pt-6 pb-6 px-3 sm:px-6">
        <GameSection onStatusChange={(_status, inRoom, rId) => {
          setIsInRoom(Boolean(inRoom));
          if (rId) setRoomId(rId);
        }} />
      </main>
    </div>
  );
}
