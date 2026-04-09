-- ============================================================
-- TELEGRAM BOT - TABELAS E FUNCTIONS
-- Data: 06/04/2026
-- ============================================================
-- Cria:
--   1. telegram_users          - Vincular Telegram ao RoundKids
--   2. telegram_sessions       - Memória das conversas
--   3. telegram_message_buffer - Buffer para mensagens picotadas
--   4. buffer_message()        - Acumula mensagens no buffer
--   5. get_and_lock_buffer()   - Pega msgs acumuladas (debounce)
--   6. get_patient_summary()   - Retorna TUDO do paciente
--   7. search_patient()        - Busca paciente por nome/leito
-- ============================================================

-- ============================================================
-- 1. TABELA: telegram_users
-- Vincula chat_id do Telegram ao usuário do RoundKids
-- ============================================================
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL UNIQUE,
  telegram_username TEXT,
  telegram_first_name TEXT,
  user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT telegram_users_user_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id
  ON public.telegram_users(telegram_chat_id);

CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id
  ON public.telegram_users(user_id);

COMMENT ON TABLE public.telegram_users IS 'Vincula contas do Telegram aos usuários do RoundKids para autenticação do bot';

-- ============================================================
-- 2. TABELA: telegram_sessions
-- Memória das conversas + estado de confirmação pendente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.telegram_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,

  -- Contexto da conversa
  patient_id UUID NULL,
  patient_name TEXT NULL,

  -- Estado de confirmação pendente (para cadastros)
  pending_action JSONB NULL,
  -- Exemplo: { "type": "insert_bh", "table": "balanco_hidrico", "data": {...} }

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),

  CONSTRAINT telegram_sessions_chat_fkey
    FOREIGN KEY (telegram_chat_id) REFERENCES public.telegram_users(telegram_chat_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat_id
  ON public.telegram_sessions(telegram_chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telegram_sessions_expires
  ON public.telegram_sessions(expires_at);

COMMENT ON TABLE public.telegram_sessions IS 'Histórico de conversas do bot Telegram com memória de contexto e confirmações pendentes';

-- Limpar sessões expiradas (rodar via cron ou pg_cron)
-- DELETE FROM telegram_sessions WHERE expires_at < NOW();

-- ============================================================
-- 3. TABELA: telegram_message_buffer
-- Acumula mensagens picotadas antes de processar
-- ============================================================
CREATE TABLE IF NOT EXISTS public.telegram_message_buffer (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  messages TEXT[] NOT NULL DEFAULT '{}',
  first_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'done')),

  CONSTRAINT telegram_buffer_unique_chat UNIQUE (chat_id, status)
);

CREATE INDEX IF NOT EXISTS idx_telegram_buffer_chat_status
  ON public.telegram_message_buffer(chat_id, status);

COMMENT ON TABLE public.telegram_message_buffer IS 'Buffer para acumular mensagens picotadas do Telegram antes de processar (debounce de 8s)';

-- ============================================================
-- 4. FUNCTION: buffer_message
-- Acumula uma mensagem no buffer do chat
-- Se já existe buffer 'waiting', adiciona ao array
-- Se não existe, cria novo
-- ============================================================
CREATE OR REPLACE FUNCTION buffer_message(
  p_chat_id BIGINT,
  p_text TEXT
) RETURNS VOID AS $$
BEGIN
  -- Tentar atualizar buffer existente
  UPDATE telegram_message_buffer
  SET
    messages = array_append(messages, p_text),
    last_message_at = NOW()
  WHERE chat_id = p_chat_id AND status = 'waiting';

  -- Se não atualizou nada, criar novo
  IF NOT FOUND THEN
    INSERT INTO telegram_message_buffer (chat_id, messages, first_message_at, last_message_at, status)
    VALUES (p_chat_id, ARRAY[p_text], NOW(), NOW(), 'waiting')
    ON CONFLICT (chat_id, status) DO UPDATE
    SET
      messages = array_append(telegram_message_buffer.messages, p_text),
      last_message_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. FUNCTION: get_and_lock_buffer
-- Pega mensagens acumuladas se passaram N segundos
-- sem nova mensagem (debounce).
-- Retorna texto combinado e marca como 'done'.
-- Se ainda está dentro do debounce, retorna vazio.
-- ============================================================
CREATE OR REPLACE FUNCTION get_and_lock_buffer(
  p_chat_id BIGINT,
  p_seconds INTEGER DEFAULT 8
) RETURNS TABLE(combined_text TEXT, message_count INTEGER) AS $$
DECLARE
  v_buffer RECORD;
BEGIN
  -- Buscar buffer waiting
  SELECT * INTO v_buffer
  FROM telegram_message_buffer
  WHERE chat_id = p_chat_id AND status = 'waiting'
  FOR UPDATE SKIP LOCKED;

  -- Sem buffer
  IF v_buffer IS NULL THEN
    combined_text := '';
    message_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Verificar se passou o tempo de debounce
  IF (EXTRACT(EPOCH FROM (NOW() - v_buffer.last_message_at))) < p_seconds THEN
    -- Ainda dentro do debounce, outra execução vai pegar
    combined_text := '';
    message_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Passou o debounce! Marcar como done e retornar
  UPDATE telegram_message_buffer
  SET status = 'done'
  WHERE id = v_buffer.id;

  combined_text := array_to_string(v_buffer.messages, ' ');
  message_count := array_length(v_buffer.messages, 1);
  RETURN NEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Limpar buffers antigos (rodar via cron)
-- DELETE FROM telegram_message_buffer WHERE status = 'done' AND last_message_at < NOW() - INTERVAL '1 hour';

-- ============================================================
-- 3. FUNCTION: get_patient_summary
-- Retorna TUDO do paciente em uma única chamada
-- ============================================================
CREATE OR REPLACE FUNCTION get_patient_summary(p_patient_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v_patient JSONB;
  v_diagnosticos JSONB;
  v_dispositivos JSONB;
  v_exames JSONB;
  v_medicacoes JSONB;
  v_procedimentos JSONB;
  v_culturas JSONB;
  v_dietas JSONB;
  v_alertas JSONB;
  v_precaucoes JSONB;
  v_escalas JSONB;
  v_situacao_24h JSONB;
  v_bh_cumulativo JSONB;
  v_diurese JSONB;
  v_bh_recentes JSONB;
BEGIN

  -- DADOS BÁSICOS DO PACIENTE
  SELECT jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'bed_number', p.bed_number,
    'dob', p.dob,
    'mother_name', p.mother_name,
    'diagnosis', p.diagnosis,
    'peso', p.peso,
    'sc', p.sc,
    'dt_internacao', p.dt_internacao,
    'comorbidade', p.comorbidade,
    'status', p.status,
    'dias_internacao', EXTRACT(DAY FROM (NOW() - p.dt_internacao))::INTEGER
  ) INTO v_patient
  FROM patients p
  WHERE p.id = p_patient_id AND p.archived_at IS NULL;

  IF v_patient IS NULL THEN
    RETURN jsonb_build_object('error', 'Paciente não encontrado ou arquivado');
  END IF;

  -- DIAGNÓSTICOS (ativos)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id,
    'opcao_label', d.opcao_label,
    'texto_digitado', d.texto_digitado,
    'status', d.status,
    'created_at', d.created_at
  ) ORDER BY d.created_at DESC), '[]'::jsonb)
  INTO v_diagnosticos
  FROM paciente_diagnosticos d
  WHERE d.patient_id = p_patient_id
    AND (d.arquivado IS NULL OR d.arquivado = FALSE);

  -- DISPOSITIVOS (ativos)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id,
    'tipo_dispositivo', d.tipo_dispositivo,
    'localizacao', d.localizacao,
    'data_insercao', d.data_insercao,
    'observacao', d.observacao
  ) ORDER BY d.data_insercao DESC), '[]'::jsonb)
  INTO v_dispositivos
  FROM dispositivos_pacientes d
  WHERE d.paciente_id = p_patient_id
    AND (d.is_archived = FALSE OR d.is_archived IS NULL);

  -- EXAMES (ativos)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'nome_exame', e.nome_exame,
    'data_exame', e.data_exame,
    'status', e.status,
    'observacao', e.observacao
  ) ORDER BY e.data_exame DESC), '[]'::jsonb)
  INTO v_exames
  FROM exames_pacientes e
  WHERE e.paciente_id = p_patient_id
    AND (e.is_archived = FALSE OR e.is_archived IS NULL);

  -- MEDICAÇÕES (ativas)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'nome_medicacao', m.nome_medicacao,
    'dosagem_valor', m.dosagem_valor,
    'unidade_medida', m.unidade_medida,
    'data_inicio', m.data_inicio,
    'data_fim', m.data_fim,
    'observacao', m.observacao
  ) ORDER BY m.data_inicio DESC), '[]'::jsonb)
  INTO v_medicacoes
  FROM medicacoes_pacientes m
  WHERE m.paciente_id = p_patient_id
    AND (m.is_archived = FALSE OR m.is_archived IS NULL);

  -- PROCEDIMENTOS CIRÚRGICOS (ativos)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', pr.id,
    'nome_procedimento', pr.nome_procedimento,
    'data_procedimento', pr.data_procedimento,
    'nome_cirurgiao', pr.nome_cirurgiao,
    'notas', pr.notas
  ) ORDER BY pr.data_procedimento DESC), '[]'::jsonb)
  INTO v_procedimentos
  FROM procedimentos_pacientes pr
  WHERE pr.paciente_id = p_patient_id
    AND (pr.is_archived = FALSE OR pr.is_archived IS NULL);

  -- CULTURAS (ativas)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'local', c.local,
    'microorganismo', c.microorganismo,
    'data_coleta', c.data_coleta,
    'observacao', c.observacao
  ) ORDER BY c.data_coleta DESC), '[]'::jsonb)
  INTO v_culturas
  FROM culturas_pacientes c
  WHERE c.paciente_id = p_patient_id
    AND (c.is_archived = FALSE OR c.is_archived IS NULL);

  -- DIETAS (ativas)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id,
    'tipo', d.tipo,
    'data_inicio', d.data_inicio,
    'volume', d.volume,
    'vet', d.vet,
    'vet_pleno', d.vet_pleno,
    'pt', d.pt,
    'pt_g_dia', d.pt_g_dia,
    'vet_at', d.vet_at,
    'pt_at', d.pt_at,
    'th', d.th,
    'observacao', d.observacao
  ) ORDER BY d.data_inicio DESC), '[]'::jsonb)
  INTO v_dietas
  FROM dietas_pacientes d
  WHERE d.paciente_id = p_patient_id
    AND (d.is_archived = FALSE OR d.is_archived IS NULL);

  -- ALERTAS (das duas tabelas - visíveis 24h)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', a.id_alerta,
    'descricao', a.alertaclinico,
    'responsavel', a.responsavel,
    'status', a.status,
    'live_status', a.live_status,
    'tipo_origem', a.tipo_origem,
    'tempo_visibilidade', a.tempo_visibilidade,
    'created_at', a.created_at,
    'deadline', a.deadline,
    'concluded_at', a.concluded_at
  ) ORDER BY a.created_at DESC), '[]'::jsonb)
  INTO v_alertas
  FROM alertas_paciente_visibilidade_24h a
  WHERE a.patient_id = p_patient_id;

  -- PRECAUÇÕES
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', pr.id,
    'tipo_precaucao', pr.tipo_precaucao,
    'data_inicio', pr.data_inicio,
    'data_fim', pr.data_fim
  ) ORDER BY pr.data_inicio DESC), '[]'::jsonb)
  INTO v_precaucoes
  FROM precautions pr
  WHERE pr.patient_id = p_patient_id
    AND (pr.data_fim IS NULL OR pr.data_fim >= CURRENT_DATE);

  -- ESCALAS (últimas de cada tipo)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'scale_name', s.scale_name,
    'score', s.score,
    'interpretation', s.interpretation,
    'date', s.date,
    'notes', s.notes
  ) ORDER BY s.date DESC), '[]'::jsonb)
  INTO v_escalas
  FROM (
    SELECT DISTINCT ON (scale_name) *
    FROM scale_scores
    WHERE patient_id = p_patient_id
    ORDER BY scale_name, date DESC
  ) s;

  -- SITUAÇÃO 24H (visíveis)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', cs.id,
    'situacao_texto', cs.situacao_texto,
    'created_at', cs.created_at,
    'visible_until', cs.visible_until
  ) ORDER BY cs.created_at DESC), '[]'::jsonb)
  INTO v_situacao_24h
  FROM clinical_situations_24h cs
  WHERE cs.patient_id = p_patient_id
    AND cs.visible_until >= NOW()
    AND cs.archived_at IS NULL;

  -- BH CUMULATIVO
  SELECT jsonb_build_object(
    'bh_historico_antigo', bh.bh_historico_antigo,
    'bh_ultimas_24h', bh.bh_ultimas_24h,
    'bh_cumulativo_total', bh.bh_cumulativo_total,
    'registros_ultimas_24h', bh.registros_ultimas_24h
  ) INTO v_bh_cumulativo
  FROM balanco_hidrico_cumulativo bh
  WHERE bh.patient_id = p_patient_id;

  -- DIURESE (último registro)
  SELECT jsonb_build_object(
    'volume', d.volume,
    'peso', d.peso,
    'horas', d.horas,
    'resultado', d.resultado,
    'data_registro', d.data_registro
  ) INTO v_diurese
  FROM diurese d
  WHERE d.patient_id = p_patient_id
  ORDER BY d.data_registro DESC
  LIMIT 1;

  -- BH REGISTROS RECENTES (últimos 5)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'volume', bh.volume,
    'peso', bh.peso,
    'resultado', bh.resultado,
    'data_registro', bh.data_registro
  ) ORDER BY bh.data_registro DESC), '[]'::jsonb)
  INTO v_bh_recentes
  FROM (
    SELECT * FROM balanco_hidrico
    WHERE patient_id = p_patient_id
    ORDER BY data_registro DESC
    LIMIT 5
  ) bh;

  -- MONTAR RESULTADO FINAL
  result := jsonb_build_object(
    'paciente', v_patient,
    'diagnosticos', v_diagnosticos,
    'dispositivos', v_dispositivos,
    'exames', v_exames,
    'medicacoes', v_medicacoes,
    'procedimentos', v_procedimentos,
    'culturas', v_culturas,
    'dietas', v_dietas,
    'alertas', v_alertas,
    'precaucoes', v_precaucoes,
    'escalas', v_escalas,
    'situacao_24h', v_situacao_24h,
    'balanco_hidrico', jsonb_build_object(
      'cumulativo', COALESCE(v_bh_cumulativo, '{}'::jsonb),
      'ultima_diurese', COALESCE(v_diurese, '{}'::jsonb),
      'registros_recentes', v_bh_recentes
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_patient_summary IS 'Retorna todos os dados clínicos do paciente em uma única chamada JSONB para o bot do Telegram';

-- ============================================================
-- 4. FUNCTION AUXILIAR: buscar paciente por nome ou leito
-- ============================================================
CREATE OR REPLACE FUNCTION search_patient(p_search TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  bed_number TEXT,
  peso NUMERIC,
  dt_internacao TIMESTAMP WITH TIME ZONE,
  diagnosis TEXT,
  comorbidade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.bed_number,
    p.peso,
    p.dt_internacao,
    p.diagnosis,
    p.comorbidade
  FROM patients p
  WHERE p.archived_at IS NULL
    AND (
      p.name ILIKE '%' || p_search || '%'
      OR p.bed_number ILIKE '%' || p_search || '%'
    )
  ORDER BY p.bed_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_patient IS 'Busca pacientes ativos por nome ou número do leito';

-- ============================================================
-- TESTES
-- ============================================================
-- SELECT * FROM search_patient('João');
-- SELECT * FROM search_patient('3');
-- SELECT get_patient_summary('uuid-do-paciente-aqui');
-- ============================================================
