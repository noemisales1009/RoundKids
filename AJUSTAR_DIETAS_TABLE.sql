-- SCRIPT DE AJUSTE DA TABELA dietas_pacientes
-- Execute este script no Supabase SQL Editor para fazer os ajustes necessários

-- ✅ Alterar as colunas para NUMERIC com comentários explicativos
ALTER TABLE public.dietas_pacientes
ALTER COLUMN volume TYPE NUMERIC(10,2);

ALTER TABLE public.dietas_pacientes
ALTER COLUMN vet TYPE NUMERIC(10,2);

ALTER TABLE public.dietas_pacientes
ALTER COLUMN pt TYPE NUMERIC(10,2);

ALTER TABLE public.dietas_pacientes
ALTER COLUMN th TYPE NUMERIC(10,2);

-- ✅ Adicionar comentários nas colunas para documentação
COMMENT ON COLUMN public.dietas_pacientes.volume IS 'Volume total (ml)';
COMMENT ON COLUMN public.dietas_pacientes.vet IS 'Valor Energético Total [kcal/dia]';
COMMENT ON COLUMN public.dietas_pacientes.pt IS 'Proteínas [g/dia]';
COMMENT ON COLUMN public.dietas_pacientes.th IS 'Taxa Hídrica [ml/m²/dia]';

-- ✅ Adicionar comentário na tabela
COMMENT ON TABLE public.dietas_pacientes IS 'Registros de dietas dos pacientes com tipos (Oral, Enteral, Parenteral) e parâmetros nutricionais';
