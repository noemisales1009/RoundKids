-- Adicionar coluna ordem_exibicao se não existir
ALTER TABLE public.medicamentos 
ADD COLUMN IF NOT EXISTS ordem_exibicao integer;

-- Atualizar ordem de exibição para cada categoria
UPDATE public.medicamentos SET ordem_exibicao = 1 WHERE categoria = 'VASOATIVOS';
UPDATE public.medicamentos SET ordem_exibicao = 2 WHERE categoria = 'SEDATIVOS E ANALGÉSICOS';
UPDATE public.medicamentos SET ordem_exibicao = 3 WHERE categoria = 'ANTICONVULSIVANTES';
UPDATE public.medicamentos SET ordem_exibicao = 4 WHERE categoria = 'DIURÉTICOS';
UPDATE public.medicamentos SET ordem_exibicao = 5 WHERE categoria = 'ELETRÓLITOS';
UPDATE public.medicamentos SET ordem_exibicao = 6 WHERE categoria = 'CORTICOIDES';
UPDATE public.medicamentos SET ordem_exibicao = 7 WHERE categoria = 'BRONCODILATADORES';
UPDATE public.medicamentos SET ordem_exibicao = 8 WHERE categoria = 'ANTIBIÓTICOS';
UPDATE public.medicamentos SET ordem_exibicao = 9 WHERE categoria = 'OUTROS';

-- Verificar dados
SELECT DISTINCT categoria, ordem_exibicao 
FROM public.medicamentos 
ORDER BY ordem_exibicao;

-- Atualizar medicamentos para ter ordem dentro de cada categoria
-- Fazendo ordenação alfabética dentro de cada categoria
WITH ranked_meds AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY nome) as rn
  FROM public.medicamentos
)
UPDATE public.medicamentos m
SET ordem_exibicao = (SELECT rn FROM ranked_meds WHERE ranked_meds.id = m.id);
