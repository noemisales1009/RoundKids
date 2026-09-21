-- Alertas: turno de referência escolhido no cadastro (manha / tarde / noite).
-- Serve para o registro tardio: quem está na tarde e esqueceu de lançar um alerta
-- da manhã registra agora, mas o alerta fica no turno da manhã.
--
-- Regras do desenho:
--   - created_at NUNCA muda: continua sendo a hora real do registro (auditoria/prontuário).
--   - O prazo segue contando de created_at, entao o alerta tardio nao nasce vencido.
--   - turno NULL = comportamento atual: o app deduz o turno pela hora de criação.
--
-- A view alertas_paciente_view_completa NÃO precisa ser recriada: o app le esta
-- coluna direto da tabela, junto com justificativa_motivo e continuo.

ALTER TABLE public.alertas_paciente
  ADD COLUMN IF NOT EXISTS turno text NULL;

ALTER TABLE public.alertas_paciente
  DROP CONSTRAINT IF EXISTS alertas_paciente_turno_check;

ALTER TABLE public.alertas_paciente
  ADD CONSTRAINT alertas_paciente_turno_check
  CHECK (turno IS NULL OR turno IN ('manha', 'tarde', 'noite'));

-- Rollback:
-- ALTER TABLE public.alertas_paciente DROP CONSTRAINT IF EXISTS alertas_paciente_turno_check;
-- ALTER TABLE public.alertas_paciente DROP COLUMN IF EXISTS turno;
