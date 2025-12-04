import React, { useState } from 'react';

interface ComfortBScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string }) => void;
}

export const ComfortBScale: React.FC<ComfortBScaleProps> = ({ onSaveScore }) => {
  const [isIntubated, setIsIntubated] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    { id: 'alert', label: '1. Alerta', min: 1, max: 5 },
    { id: 'calma', label: '2. Calma / Agitação', min: 1, max: 5 },
    { id: 'choro', label: '3. Choro (Não Intubado)', min: 1, max: 5, onlyIfNotIntubated: true },
    { id: 'movimentos', label: '4. Movimentos Físicos', min: 1, max: 5 },
    { id: 'expressao', label: '5. Expressão Facial', min: 1, max: 5 },
    { id: 'tonus', label: '6. Tônus Muscular', min: 1, max: 5 },
  ];

  const visibleQuestions = questions.filter(q => !q.onlyIfNotIntubated || !isIntubated);

  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const calculateScore = () => {
    const scores = Object.values(answers) as number[];
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : 0;
  };

  const getInterpretation = (score: number) => {
    if (score <= 10) return 'Confortável/Relaxado';
    if (score <= 17) return 'Pouco desconfortável';
    if (score <= 24) return 'Moderadamente desconfortável';
    return 'Muito desconfortável';
  };

  const handleSubmit = () => {
    const totalScore = calculateScore();
    const interpretation = getInterpretation(totalScore);
    
    onSaveScore({
      scaleName: 'COMFORT-B',
      score: totalScore,
      interpretation
    });
    
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const isComplete = isIntubated !== null && visibleQuestions.every(q => answers[q.id] !== undefined);
  const totalScore = calculateScore();

  return (
    <div className="space-y-6 bg-slate-900 p-6 rounded-lg">
      <div className="border-b border-slate-700 pb-4">
        <h3 className="text-xl font-bold text-slate-100 mb-2">Nova Avaliação COMFORT-B</h3>
        <p className="text-sm text-slate-400">Escala de conforto para pacientes em cuidados intensivos</p>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isIntubated || false}
            onChange={(e) => {
              setIsIntubated(e.target.checked);
              setAnswers({});
            }}
            className="w-5 h-5 rounded accent-blue-500"
          />
          <span className="text-slate-200 font-medium">O paciente está INTUBADO?</span>
        </label>
      </div>

      <div className="space-y-4">
        {visibleQuestions.map(question => (
          <div key={question.id} className="bg-slate-800 p-4 rounded-lg">
            <label className="block text-slate-200 font-medium mb-3">{question.label}</label>
            
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: question.max - question.min + 1 }).map((_, i) => {
                const score = question.min + i;
                const isSelected = answers[question.id] === score;
                
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswerChange(question.id, score)}
                    className={`w-12 h-12 rounded-lg font-bold text-sm transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 text-xs text-slate-400 flex justify-between">
              <span>Melhor</span>
              <span>Pior</span>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(answers).length > 0 && (
        <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Pontuação Total</p>
              <p className="text-3xl font-bold text-blue-300">{totalScore}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Interpretação</p>
              <p className="text-lg font-bold text-blue-300">{getInterpretation(totalScore)}</p>
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <div className="bg-green-900/30 border border-green-500/50 p-3 rounded-lg text-green-300 text-sm">
          ✓ Escala salva com sucesso!
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isComplete}
        className={`w-full py-3 rounded-lg font-bold transition ${
          isComplete
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        Salvar Avaliação
      </button>
    </div>
  );
};
