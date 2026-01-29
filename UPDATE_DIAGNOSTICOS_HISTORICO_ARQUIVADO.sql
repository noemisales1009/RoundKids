-- ✅ COMPLETO: Soft Delete para Diagnósticos com Arquivo

-- 1️⃣ Adicionar coluna arquivado em diagnosticos_historico (se não existir)
ALTER TABLE public.diagnosticos_historico 
ADD COLUMN IF NOT EXISTS arquivado boolean DEFAULT false;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_arquivado 
ON public.diagnosticos_historico(patient_id, arquivado);

-- 2️⃣ Recriar VIEW com coluna arquivado
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario;

CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.arquivado,  -- Coluna para filtrar (WHERE arquivado = false)
  dh.created_at,
  COALESCE(dh.opcao_label, po.label) AS opcao_label,
  dh.created_by,
  COALESCE(u.name, 'Sistema'::text) AS created_by_name
FROM
  diagnosticos_historico dh
  LEFT JOIN users u ON dh.created_by = u.id
  LEFT JOIN pergunta_opcoes_diagnostico po ON dh.opcao_id = po.id
WHERE
  dh.arquivado = false  -- Filtra apenas diagnósticos não arquivados
ORDER BY
  dh.created_at DESC;

-- 3️⃣ Verificar estrutura (opcional)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'diagnosticos_historico' ORDER BY ordinal_position;
