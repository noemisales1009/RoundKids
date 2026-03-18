-- Verificar RLS policies na tabela medicacoes_pacientes
SELECT * FROM pg_policies 
WHERE tablename = 'medicacoes_pacientes'
ORDER BY policyname;

-- Se não houver policies, a tabela deve permitir inserts
-- Se houver, você precisa ter uma policy que permite INSERT

-- Teste: tente inserir uma medicação diretamente
INSERT INTO public.medicacoes_pacientes 
  (paciente_id, nome_medicacao, dosagem_valor, unidade_medida, data_inicio, criado_por_id)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Teste', 'Valor Teste', NULL, CURRENT_DATE, NULL)
RETURNING *;

-- Se isso der erro de permissão, o problema é RLS
-- Se isso funcionar, o problema é com o patientId sendo enviado

-- Verificar medicações já salvas
SELECT id, paciente_id, nome_medicacao, dosagem_valor, unidade_medida, data_inicio, criado_por_id
FROM public.medicacoes_pacientes
ORDER BY created_at DESC
LIMIT 5;
