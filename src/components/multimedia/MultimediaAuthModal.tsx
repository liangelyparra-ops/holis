import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, ArrowRight, KeyRound } from 'lucide-react';

interface MultimediaAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_PASSWORDS = ['holis', '1234', 'lia', 'admin'];

export const MultimediaAuthModal: React.FC<MultimediaAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customPin = localStorage.getItem('multimedia_custom_pin');
    const validPins = customPin ? [...DEFAULT_PASSWORDS, customPin] : DEFAULT_PASSWORDS;

    if (validPins.includes(password.trim().toLowerCase())) {
      sessionStorage.setItem('multimedia_auth', 'true');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 z-10 text-left space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title */}
          <div className="space-y-1.5 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center mb-2">
              <KeyRound className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-headline text-lg font-bold text-neutral-900 tracking-tight">
              Acceso de Edición
            </h3>
            <p className="font-sans text-xs text-stone-500 leading-relaxed">
              Ingresa tu contraseña para gestionar las piezas y enlaces de Drive.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Contraseña..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-sans focus:outline-none transition-colors pr-10 ${
                    error
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500'
                      : 'border-stone-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                  }`}
                />
                <div className="absolute right-3 top-3 text-stone-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-sans text-[11px] text-rose-600 font-medium pl-1"
                >
                  Contraseña incorrecta.
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-neutral-950 text-white font-sans text-xs font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Ingresar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
