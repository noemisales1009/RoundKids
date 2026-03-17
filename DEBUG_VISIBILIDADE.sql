-- ========================================
-- DEBUG: Verificar dados nas views base
-- ========================================

-- 1. Ver quantos alertas concluídos existem
SELECT 
  COUNT(*) as total_alertas,
  status,
  patient_id
FROM public.alertas_paciente_view_completa
WHERE patient_id = 'COLOQUE_AQUI_O_PATIENT_ID'
GROUP BY status, patient_id;

-- 2. Ver quantas tasks concluídas existem
SELECT 
  COUNT(*) as total_tasks,
  status,
  patient_id
FROM public.tasks_view_horario_br
WHERE patient_id = 'COLOQUE_AQUI_O_PATIENT_ID'
GROUP BY status, patient_id;

-- 3. Testar se a função existe
SELECT 
  tempo_restante_visibilidade('Concluído', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours') as teste;

-- 4. Ver o que a view retorna
SELECT *
FROM public.alertas_paciente_visibilidade_24h
WHERE patient_id = 'COLOQUE_AQUI_O_PATIENT_ID'
LIMIT 5;

-- 5. Se nada aparecer, testar a query base sem a função
SELECT
  'DEBUG' as source,
  av.status,
  trim(upper(av.status)) as status_upper
FROM public.alertas_paciente_view_completa av
LIMIT 5;
