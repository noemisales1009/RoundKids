-- Verificar medicações salvas no banco
SELECT 
    id,
    paciente_id,
    nome_medicacao,
    dosagem_valor,
    unidade_medida,
    data_inicio,
    is_archived,
    criado_por_id
FROM public.medicacoes_pacientes
ORDER BY created_at DESC
LIMIT 20;

-- Ver contagem por paciente
SELECT 
    paciente_id,
    COUNT(*) as total_medicacoes,
    ARRAY_AGG(nome_medicacao) as medicamentos
FROM public.medicacoes_pacientes
WHERE is_archived = false
GROUP BY paciente_id
ORDER BY paciente_id;
