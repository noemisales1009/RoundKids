-- Criar VIEW que JOIN diagnósticos com usuários para pegar o nome
-- Isso resolve o problema de "Não informado" no histórico

CREATE OR REPLACE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.arquivado,
  dh.archived_by,
  dh.archived_at,
  dh.created_at,
  COALESCE(dh.opcao_label, po.label) AS opcao_label,
  dh.created_by,
  COALESCE(u.name_user, u.name, 'Sistema'::text) AS created_by_name,
  -- JOINs para usuário que ocultou
  archived_by_user.id AS archived_by_id,
  COALESCE(archived_by_user.name_user, archived_by_user.name, 'Desconhecido'::text) AS archived_by_name
FROM
  paciente_diagnosticos dh
  LEFT JOIN users u ON dh.created_by = u.id
  LEFT JOIN users archived_by_user ON dh.archived_by = archived_by_user.id
  LEFT JOIN pergunta_opcoes_diagnostico po ON dh.opcao_id = po.id
ORDER BY
  dh.created_at DESC;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_patient_status 
ON public.paciente_diagnosticos(patient_id, status)
WHERE arquivado = false;

CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_archived 
ON public.paciente_diagnosticos(patient_id, arquivado);
