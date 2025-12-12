-- Criar ou substituir a view
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
  -- Busca o nome na tabela public.users. Se for nulo, exibe 'Sistema'
  COALESCE(u.name, 'Sistema') as created_by_name
FROM diagnosticos_historico dh
LEFT JOIN public.users u ON dh.created_by = u.id
ORDER BY dh.created_at DESC;

-- Configurações de segurança (Opcional, mas recomendado se usar RLS)
ALTER VIEW diagnosticos_historico_com_usuario SET (security_barrier = on);

-- Permissões
GRANT SELECT ON diagnosticos_historico_com_usuario TO authenticated;
