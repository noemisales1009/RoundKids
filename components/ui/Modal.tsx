import React, { useEffect } from 'react';
import { CloseIcon } from '../icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' } as const;

/**
 * Modal padrão: overlay, painel responsivo (padding em mobile), fecha no Esc e
 * no clique fora, com aria-modal e botão de fechar acessível.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${sizes[size]} max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
