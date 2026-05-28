import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../contexts';

interface MedItem {
  id: number;
  nome: string;
  dosagem?: string;
  mostrarEvolucao: boolean;
}

interface ResolveDiagnosticModalProps {
  diagLabel: string;
  medications: MedItem[];
  onConfirm: (checkedMedIds: Set<number>) => Promise<void>;
  onClose: () => void;
}

export const ResolveDiagnosticModal: React.FC<ResolveDiagnosticModalProps> = ({
  diagLabel,
  medications,
  onConfirm,
  onClose,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.theme === 'dark';

  const [checked, setChecked] = useState<Set<number>>(
    new Set(medications.filter(m => m.mostrarEvolucao).map(m => m.id))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggle = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(checked);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-30">
      <div className={`p-6 rounded-xl shadow-xl w-full max-w-md m-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-1">
          <h2 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            Resolver diagnóstico
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`text-lg leading-none mt-0.5 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-50`}
          >
            ✕
          </button>
        </div>

        <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{diagLabel}</p>

        <p className={`text-sm mb-4 mt-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Selecione as medicações que devem continuar aparecendo na avaliação diária:
        </p>

        <div className="space-y-1.5 mb-5 max-h-64 overflow-y-auto">
          {medications.map(med => (
            <label
              key={med.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked.has(med.id)}
                onChange={() => toggle(med.id)}
                className="w-4 h-4 accent-emerald-500 shrink-0"
              />
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {med.nome}
                </p>
                {med.dosagem && (
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{med.dosagem}</p>
                )}
              </div>
              <span className={`ml-auto text-xs shrink-0 font-medium ${
                checked.has(med.id)
                  ? 'text-emerald-500'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {checked.has(med.id) ? 'Incluída' : 'Excluída'}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
              isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
