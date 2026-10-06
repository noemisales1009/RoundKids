import React from 'react';
import { Question, Category } from '../../types';
import { ProtocolosConsulta } from '../ProtocolosConsulta';
import { CloseIcon, FileTextIcon } from '../icons';

interface Props {
    question: Question;
    category: Category;
    onClose: () => void;
}

// Consulta dos protocolos institucionais aberta a partir de uma pergunta do round.
export const ProtocolosModal: React.FC<Props> = ({ question, category, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-primary-600 dark:bg-primary-700 p-3 sm:p-4 flex justify-between items-center sticky top-0">
                <div className="flex items-center gap-2 text-white">
                    <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h2 className="text-base sm:text-lg font-bold">Protocolos institucionais</h2>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white bg-primary-800/50 p-1 rounded-full">
                    <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
            <div className="p-4 sm:p-6">
                <ProtocolosConsulta question={question} category={category} />
            </div>
        </div>
    </div>
);
