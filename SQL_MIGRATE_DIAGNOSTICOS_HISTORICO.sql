-- Adicionar coluna opcao_label na tabela diagnosticos_historico
ALTER TABLE public.diagnosticos_historico
ADD COLUMN opcao_label TEXT NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_diagnosticos_historico_patient_id ON public.diagnosticos_historico(patient_id);
CREATE INDEX idx_diagnosticos_historico_created_at ON public.diagnosticos_historico(created_at DESC);
CREATE INDEX idx_diagnosticos_historico_status ON public.diagnosticos_historico(status);

-- RLS (Row Level Security)
ALTER TABLE public.diagnosticos_historico ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura apenas do próprio paciente
CREATE POLICY "Pacientes podem ver seu próprio histórico de diagnósticos" ON public.diagnosticos_historico
  FOR SELECT
  USING (patient_id = auth.uid());

-- Política para permitir inserção apenas do próprio paciente
CREATE POLICY "Pacientes podem inserir no seu histórico de diagnósticos" ON public.diagnosticos_historico
  FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Atualizar registros existentes com os labels das opções
UPDATE public.diagnosticos_historico dh
SET opcao_label = po.label
FROM public.pergunta_opcoes_diagnostico po
WHERE dh.opcao_id = po.id
AND dh.opcao_label IS NULL;

-- Verificar quantos registros foram atualizados
SELECT COUNT(*) as registros_com_label
FROM public.diagnosticos_historico
WHERE opcao_label IS NOT NULL;
