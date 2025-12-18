-- ==========================================
-- ATUALIZAR VIEWS PARA INCLUIR NOME DO CRIADOR
-- ==========================================

-- DROP E RECRIE: tasks_view_horario_br
DROP VIEW IF EXISTS tasks_view_horario_br CASCADE;

CREATE VIEW tasks_view_horario_br AS
SELECT 
  t.id,
  t.patient_id,
  t.category_id,
  t.description,
  t.responsible,
  t.deadline,
  t.status,
  t.justification,
  t.created_at,
  t.updated_at,
  t.patient_name,
  t.category,
  t.time_label,
  t.options,
  t.created_by,
  COALESCE(u.name, 'Sistema') as created_by_name,
  CASE 
    WHEN t.status = 'concluido' THEN 'concluido'
    WHEN t.deadline IS NULL THEN 'sem_prazo'
    WHEN NOW() > t.deadline THEN 'fora_do_prazo'
    WHEN NOW() > (t.deadline - INTERVAL '24 hours') THEN 'no_prazo'
    ELSE 'no_prazo'
  END as live_status
FROM tasks t
LEFT JOIN public.users u ON t.created_by = u.id
ORDER BY t.created_at DESC;

GRANT SELECT ON tasks_view_horario_br TO authenticated;
ALTER VIEW tasks_view_horario_br SET (security_barrier = on);

-- ==========================================

-- DROP E RECRIE: alertas_paciente_view_completa
DROP VIEW IF EXISTS alertas_paciente_view_completa CASCADE;

CREATE VIEW alertas_paciente_view_completa AS
SELECT 
  a.id,
  a.patient_id,
  a.alerta_descricao as description,
  a.responsavel as responsible,
  a.hora_selecionada as timeLabel,
  a.status,
  a.justificativa as justification,
  a.created_at,
  a.updated_at,
  a.created_by,
  COALESCE(u.name, 'Sistema') as created_by_name,
  CASE 
    WHEN a.status = 'concluido' THEN 'concluido'
    WHEN a.status = 'Pendente' THEN 'alerta'
    ELSE a.status
  END as live_status
FROM alertas_paciente a
LEFT JOIN public.users u ON a.created_by = u.id
ORDER BY a.created_at DESC;

GRANT SELECT ON alertas_paciente_view_completa TO authenticated;
ALTER VIEW alertas_paciente_view_completa SET (security_barrier = on);

-- ==========================================
-- CRIAR VIEW PARA LISTAR COMPLETIONS COM NOMES
-- ==========================================

DROP VIEW IF EXISTS alert_completions_with_user CASCADE;

CREATE VIEW alert_completions_with_user AS
SELECT 
  ac.id,
  ac.alert_id,
  ac.source,
  ac.completed_at,
  ac.completed_by,
  COALESCE(u.name, 'Sistema') as completed_by_name,
  ac.created_at
FROM public.alert_completions ac
LEFT JOIN public.users u ON ac.completed_by = u.id
ORDER BY ac.created_at DESC;

GRANT SELECT ON alert_completions_with_user TO authenticated;
