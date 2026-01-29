-- 🔧 FIX: Recriar VIEW diagnosticos_historico_com_usuario

-- 1️⃣ Garantir que diagnosticos_historico tenha a coluna arquivado
ALTER TABLE IF EXISTS public.diagnosticos_historico 
ADD COLUMN IF NOT EXISTS arquivado boolean DEFAULT false;

-- 2️⃣ Recriar a VIEW sem WHERE (deixar filtro no app)
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario CASCADE;

CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.arquivado,
  dh.created_at,
  COALESCE(dh.opcao_label, po.label) AS opcao_label,
  dh.created_by,
  COALESCE(u.name, 'Sistema'::text) AS created_by_name
FROM
  diagnosticos_historico dh
  LEFT JOIN users u ON dh.created_by = u.id
  LEFT JOIN pergunta_opcoes_diagnostico po ON dh.opcao_id = po.id
ORDER BY
  dh.created_at DESC;

-- 3️⃣ Verificar se VIEW foi criada
-- SELECT * FROM diagnosticos_historico_com_usuario LIMIT 5;
