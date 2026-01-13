-- SCRIPT DE ALTERAÇÃO: Adicionar campos VET Pleno e PT em g/dia
-- Execute este script no Supabase SQL Editor

-- Adicionar VET Pleno (Valor Energético Total - Meta/Alvo)
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS vet_pleno NUMERIC(10,2) NULL;

-- Adicionar PT em gramas/dia (Proteína Total em gramas absolutas)
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS pt_g_dia NUMERIC(10,2) NULL;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.dietas_pacientes.vet_pleno IS 'VET Pleno - Valor Energético Total alvo/meta [kcal/dia]';
COMMENT ON COLUMN public.dietas_pacientes.pt_g_dia IS 'Proteína Total em gramas absolutas [g/dia]';

-- Verificar alterações
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'dietas_pacientes'
ORDER BY ordinal_position;
