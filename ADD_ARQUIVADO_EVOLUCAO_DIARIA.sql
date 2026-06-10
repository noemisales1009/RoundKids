-- Adiciona a coluna "arquivado" para diferenciar rascunho salvo (false)
-- de avaliação concluída/arquivada (true) na evolução diária.
-- Rodar no SQL Editor do Supabase.

ALTER TABLE public.evolucao_diaria_registros
  ADD COLUMN IF NOT EXISTS arquivado BOOLEAN;

-- Registros antigos eram todos gravados no momento do arquivamento
UPDATE public.evolucao_diaria_registros
  SET arquivado = true
  WHERE arquivado IS NULL;

ALTER TABLE public.evolucao_diaria_registros
  ALTER COLUMN arquivado SET DEFAULT false;

ALTER TABLE public.evolucao_diaria_registros
  ALTER COLUMN arquivado SET NOT NULL;

-- O botão "Salvar" atualiza o rascunho existente em vez de criar linhas novas,
-- então a tabela passa a precisar de permissão de UPDATE (criador ou admin).
DROP POLICY IF EXISTS evolucao_diaria_update ON public.evolucao_diaria_registros;
CREATE POLICY evolucao_diaria_update
ON public.evolucao_diaria_registros
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin_user())
WITH CHECK (created_by = auth.uid() OR public.is_admin_user());

GRANT UPDATE
ON public.evolucao_diaria_registros
TO authenticated;
