-- Criar view para histórico de diagnósticos com nome do usuário
CREATE OR REPLACE VIEW diagnosticos_historico_com_usuario AS
SELECT 
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.created_at,
  dh.opcao_label,
  dh.created_by,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Sistema') as created_by_name
FROM diagnosticos_historico dh
LEFT JOIN auth.users au ON dh.created_by = au.id
ORDER BY dh.created_at DESC;

-- Dar permissão de leitura para usuários autenticados
GRANT SELECT ON diagnosticos_historico_com_usuario TO authenticated;

-- Se você tiver RLS ativado, pode criar uma política
ALTER VIEW diagnosticos_historico_com_usuario SET (security_barrier = on);
