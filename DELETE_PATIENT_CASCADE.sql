-- ============================================
-- DELETAR PACIENTE E TODOS OS DADOS RELACIONADOS
-- ============================================
-- Este script deleta um paciente de forma segura, removendo:
-- - Dispositivos
-- - Medicações
-- - Exames
-- - Culturas
-- - Procedimentos cirúrgicos
-- - Escalas (scale_scores)
-- - Dietas
-- - Aportes
-- - Situações clínicas 24h
-- - Diagnósticos
-- - Tarefas
-- - Histórico de balanço hídrico
-- - Precauções
-- - Alertas
-- - Finalmente, o próprio paciente

BEGIN;

-- Substituir 'PATIENT_ID_AQUI' pelo ID do paciente que quer deletar
DO $$
DECLARE
  p_id uuid := 'PATIENT_ID_AQUI'::uuid;
BEGIN
  -- Deletar em ordem para evitar problemas de chave estrangeira
  DELETE FROM public.dispositivos_pacientes WHERE paciente_id = p_id;
  DELETE FROM public.medicacoes_pacientes WHERE paciente_id = p_id;
  DELETE FROM public.exames_pacientes WHERE paciente_id = p_id;
  DELETE FROM public.culturas_pacientes WHERE paciente_id = p_id;
  DELETE FROM public.procedimentos_cirurgicos WHERE paciente_id = p_id;
  DELETE FROM public.scale_scores WHERE patient_id = p_id;
  DELETE FROM public.dietas_pacientes WHERE paciente_id = p_id;
  DELETE FROM public.aportes_pacientes WHERE paciente_id = p_id;
  DELETE FROM public.clinical_situations_24h WHERE patient_id = p_id;
  DELETE FROM public.paciente_diagnosticos WHERE patient_id = p_id;
  DELETE FROM public.tasks WHERE patient_id = p_id::text;
  DELETE FROM public.balanco_hidrico_historico WHERE paciente_id = p_id;
  DELETE FROM public.precautions WHERE patient_id = p_id;
  DELETE FROM public.alertas_paciente WHERE paciente_id = p_id;
  -- Finalmente, deletar o paciente
  DELETE FROM public.patients WHERE id = p_id;
  
  RAISE NOTICE 'Paciente % e todos os dados relacionados foram deletados com sucesso!', p_id;
END $$;

COMMIT;
