import React, { useState } from 'react';
import NPTCalculator from './NPTCalculator';
import { CalculationHistory } from './components/CalculationHistory';

interface NPTWrapperProps {
  initialPatient: {
    id: string;
    name: string;
    dob: string;
    peso?: number | null;
  };
}

const NPTWrapper: React.FC<NPTWrapperProps> = ({ initialPatient }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [historyKey, setHistoryKey] = useState(0);

  return (
    <div>
      {/* Sub-tabs: Calculadora / Histórico */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'calculator'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          🧮 Calculadora
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          📋 Histórico de Cálculos
        </button>
      </div>

      {activeTab === 'calculator' && (
        <NPTCalculator
          initialPatient={initialPatient}
          onCalculationSaved={() => setHistoryKey(prev => prev + 1)}
        />
      )}

      {activeTab === 'history' && (
        <CalculationHistory
          key={historyKey}
          patientId={initialPatient.id}
          patientName={initialPatient.name}
        />
      )}
    </div>
  );
};

export default NPTWrapper;
