-- View para tasks com nome do criador
CREATE OR REPLACE VIEW tasks_view_horario_br_with_creator AS
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
  COALESCE(u.name, 'Sistema') as created_by_name
FROM tasks t
LEFT JOIN public.users u ON t.created_by = u.id
ORDER BY t.created_at DESC;

GRANT SELECT ON tasks_view_horario_br_with_creator TO authenticated;
ALTER VIEW tasks_view_horario_br_with_creator SET (security_barrier = on);

-- View para alertas_paciente com nome do criador
CREATE OR REPLACE VIEW alertas_paciente_view_completa_with_creator AS
SELECT 
  a.id,
  a.patient_id,
  a.alerta_descricao as description,
  a.responsavel as responsible,
  a.hora_selecionada as timeLabel,
  a.status,
  a.justificativa,
  a.created_at,
  a.updated_at,
  a.created_by,
  COALESCE(u.name, 'Sistema') as created_by_name
FROM alertas_paciente a
LEFT JOIN public.users u ON a.created_by = u.id
ORDER BY a.created_at DESC;

GRANT SELECT ON alertas_paciente_view_completa_with_creator TO authenticated;
ALTER VIEW alertas_paciente_view_completa_with_creator SET (security_barrier = on);
