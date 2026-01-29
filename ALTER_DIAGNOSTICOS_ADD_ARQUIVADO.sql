-- Adicionar coluna arquivado para soft delete em diagnósticos
-- Quando clicar em X, marca como arquivado em vez de deletar

ALTER TABLE public.paciente_diagnosticos 
ADD COLUMN arquivado boolean DEFAULT false;

-- Criar índice para melhorar performance nas queries com filtro
CREATE INDEX IF NOT EXISTS idx_paciente_diagnosticos_arquivado 
ON public.paciente_diagnosticos(patient_id, arquivado);

-- Verificar estrutura atualizada
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'paciente_diagnosticos' 
-- ORDER BY ordinal_position;
