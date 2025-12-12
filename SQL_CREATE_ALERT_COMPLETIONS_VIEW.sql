-- View para alert_completions com nome de quem concluiu
CREATE OR REPLACE VIEW alert_completions_with_user AS
SELECT 
  ac.id,
  ac.alert_id,
  ac.source,
  ac.completed_at,
  ac.completed_by,
  COALESCE(u.name, 'Sistema') as completed_by_name,
  ac.created_at
FROM alert_completions ac
LEFT JOIN public.users u ON ac.completed_by = u.id
ORDER BY ac.created_at DESC;

GRANT SELECT ON alert_completions_with_user TO authenticated;
ALTER VIEW alert_completions_with_user SET (security_barrier = on);
