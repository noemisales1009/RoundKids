import React from 'react';
import { CloseIcon, FileTextIcon } from './icons';

interface Props {
    titulo: string;
    onClose: () => void;
    children: React.ReactNode;
    // Área de rolagem, para o leitor medir a largura e rolar até a página do trecho
    areaRef?: React.Ref<HTMLDivElement>;
}

// Pop-up de leitura do protocolo. Fica separado do leitor para aparecer na hora do clique,
// antes mesmo de o leitor de PDF terminar de carregar.
export const JanelaProtocolo: React.FC<Props> = ({ titulo, onClose, children, areaRef }) => (
    <div
        className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex justify-center items-center p-2 sm:p-4"
        onClick={onClose}
    >
        <div
            className="w-full max-w-3xl h-[92vh] bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            <div className="bg-primary-600 dark:bg-primary-700 p-3 sm:p-4 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2 text-white min-w-0">
                    <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                    <h2 className="text-sm sm:text-lg font-bold truncate">{titulo}</h2>
                </div>
                <button onClick={onClose} aria-label="Fechar" className="text-white/80 hover:text-white bg-primary-800/50 p-1 rounded-full shrink-0">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div
                ref={areaRef}
                onContextMenu={e => e.preventDefault()}
                className="flex-1 overflow-y-auto p-2 sm:p-4 select-none"
            >
                {children}
            </div>
        </div>
    </div>
);

export const AvisoProtocolo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-center text-sm text-slate-500 dark:text-slate-300 py-8">{children}</p>
);
