// ================================================================
// 🧪 TESTE RÁPIDO - FSS SCALE COMPONENT (EXEMPLO)
// Arquivo: TESTE_FSS_SCALE.tsx (TSX!)
// ================================================================

import React from 'react';
import { FSSScale } from './components/FSSScale';

// Exemplo de uso no App.tsx ou page correspondente:
export function TesteComponenteFSS() {
  
  // Handler para salvar pontuação
  const handleSaveScore = (data: {
    scaleName: string;
    score: number;
    interpretation: string;
  }) => {
    console.log('✅ Avaliação salva:', data);
    
    // TODO: Aqui você deve fazer a chamada para a API
    // para salvar no banco de dados (Supabase)
    
    // Exemplo:
    // const { data: result, error } = await supabase
    //   .from('scale_scores')
    //   .insert([{
    //     patient_id: patientId,
    //     scale_name: data.scaleName,
    //     score: data.score,
    //     interpretation: data.interpretation,
    //     date: new Date().toISOString(),
    //     created_by: userId
    //   }]);
  };

  return (
    <div className="p-4">
      <FSSScale onSaveScore={handleSaveScore} />
    </div>
  );
}
