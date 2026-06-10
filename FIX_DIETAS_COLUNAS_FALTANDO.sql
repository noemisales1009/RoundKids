-- ============================================================
-- FIX: Adiciona colunas faltando na tabela dietas_pacientes
-- Execute este script no Supabase SQL Editor (produção)
-- ============================================================

-- 1. Adiciona coluna 'sistema' (usada para vincular ao sistema clínico)
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS sistema TEXT;

-- 2. Adiciona coluna 'mostrar_evolucao' (controla exibição na evolução diária)
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS mostrar_evolucao BOOLEAN DEFAULT true;

-- 3. Adiciona coluna 'criado_por_id' (rastreamento de quem cadastrou)
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS criado_por_id UUID NULL;

-- 4. Adiciona coluna 'arquivado_por_id' (rastreamento de quem arquivou)
ALTER TABLE public.dietas_pacientes
ADD COLUMN IF NOT EXISTS arquivado_por_id UUID NULL;

-- 5. Verifica a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'dietas_pacientes'
ORDER BY ordinal_position;
