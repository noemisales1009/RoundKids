-- Alterar medicacoes_pacientes para aceitar unidade_medida nullable
-- Motivo: Medicações sem dosagem não precisam de unidade_medida

ALTER TABLE public.medicacoes_pacientes 
ALTER COLUMN unidade_medida DROP NOT NULL;

-- Adicionar comentário
COMMENT ON COLUMN public.medicacoes_pacientes.unidade_medida IS 'Unidade de medida (ex: mg/kg/dia). NULL se medicação não requer dosagem com unidade';
COMMENT ON COLUMN public.medicacoes_pacientes.dosagem_valor IS 'Valor da dosagem. Pode salvar apenas o nome se não tiver unidade (ex: "Salbutamol spray")';

-- Verificar dados
SELECT id, nome_medicacao, dosagem_valor, unidade_medida, data_inicio 
FROM public.medicacoes_pacientes 
LIMIT 10;
