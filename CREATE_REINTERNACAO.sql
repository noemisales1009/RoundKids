-- ============================================================================
-- CREATE_REINTERNACAO.sql
-- Reinternação: reconhecer o paciente que já esteve internado e trazer de volta
-- tudo o que ele tinha.
--
-- COMO FUNCIONA
-- Todo dia o n8n cria um cadastro NOVO e vazio para quem aparece no PDF do NIR
-- e não está entre os ativos. Se a criança já esteve internada, o cadastro
-- antigo dela continua arquivado, com todo o histórico.
--
-- O aplicativo compara o cadastro novo com os arquivados (mesma data de
-- nascimento e nome igual ou parecido) e mostra o aviso "Possível
-- reinternação". Um ADMINISTRADOR confere nome completo, data de nascimento e
-- nome da mãe e decide:
--   * "É o mesmo paciente" -> a função unir_reinternacao():
--        1. guarda as datas e o nome da internação anterior (internacoes_anteriores);
--        2. passa para o cadastro antigo o que já tiver sido lançado no novo;
--        3. arquiva o cadastro novo como "Duplicado";
--        4. reativa o cadastro antigo, com o nome do NIR, o leito e a data de
--           internação novos.
--     O paciente volta com TODO o histórico: diagnósticos, medicações,
--     dispositivos, exames, alertas, escalas, evoluções.
--   * "Não é o mesmo" -> fica registrado e o aviso não aparece mais para o par.
--
-- A união roda inteira ou não roda: se qualquer passo falhar, nada muda.
-- NADA É APAGADO: o cadastro duplicado fica arquivado.
--
-- ATENÇÃO — o que estava EM ABERTO na internação anterior (medicação sem data
-- de fim, dispositivo sem retirada, alerta não concluído, precaução ativa)
-- volta como ativo. A equipe precisa revisar esses itens depois de unir.
--
-- Depende de public.is_admin_user(), já usada em outras tabelas.
-- Os identificadores de paciente são guardados como texto para não depender do
-- tipo da coluna patients.id.
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabelas
-- ----------------------------------------------------------------------------
-- Internações anteriores de um paciente (uma linha por reinternação confirmada)
CREATE TABLE IF NOT EXISTS public.internacoes_anteriores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_ref    TEXT NOT NULL,          -- patients.id do cadastro que foi reativado
  dt_internacao  DATE,                   -- admissão daquela internação
  dt_saida       TIMESTAMPTZ,            -- quando foi arquivado
  motivo_saida   TEXT,
  nome_anterior  TEXT,                   -- nome que a ficha tinha antes de receber o do NIR
  registrado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_por UUID DEFAULT auth.uid()
);
-- Para quem criou a tabela antes desta coluna existir
ALTER TABLE public.internacoes_anteriores ADD COLUMN IF NOT EXISTS nome_anterior TEXT;
CREATE INDEX IF NOT EXISTS idx_internacoes_anteriores_ref ON public.internacoes_anteriores (patient_ref);

-- Decisão tomada sobre um par "cadastro novo x cadastro arquivado"
CREATE TABLE IF NOT EXISTS public.paciente_vinculos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  novo_ref      TEXT NOT NULL,           -- patients.id do cadastro novo
  anterior_ref  TEXT NOT NULL,           -- patients.id do cadastro arquivado
  decisao       TEXT NOT NULL CHECK (decisao IN ('mesmo', 'diferente')),
  decidido_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  decidido_por  UUID DEFAULT auth.uid(),
  UNIQUE (novo_ref, anterior_ref)
);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- Todo usuário logado lê (o aviso aparece para a equipe inteira).
-- Só administrador grava a decisão. Nada para anon.
-- ----------------------------------------------------------------------------
ALTER TABLE public.internacoes_anteriores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paciente_vinculos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_internacoes_anteriores" ON public.internacoes_anteriores;
CREATE POLICY "authenticated_select_internacoes_anteriores"
  ON public.internacoes_anteriores FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_paciente_vinculos" ON public.paciente_vinculos;
CREATE POLICY "authenticated_select_paciente_vinculos"
  ON public.paciente_vinculos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_paciente_vinculos" ON public.paciente_vinculos;
CREATE POLICY "admin_insert_paciente_vinculos"
  ON public.paciente_vinculos FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user() AND decidido_por = auth.uid());

GRANT SELECT ON public.internacoes_anteriores TO authenticated;
GRANT SELECT, INSERT ON public.paciente_vinculos TO authenticated;

-- ----------------------------------------------------------------------------
-- ETAPA 3 — Função que une os dois cadastros (só administrador)
-- Devolve quantos registros lançados no cadastro novo foram passados ao antigo.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unir_reinternacao(p_novo TEXT, p_anterior TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  novo      public.patients%ROWTYPE;
  anterior  public.patients%ROWTYPE;
  col       RECORD;
  movidos   INTEGER := 0;
  n         INTEGER;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Só administrador pode unir cadastros';
  END IF;

  SELECT * INTO novo     FROM public.patients WHERE id::text = p_novo     FOR UPDATE;
  SELECT * INTO anterior FROM public.patients WHERE id::text = p_anterior FOR UPDATE;

  IF novo.id IS NULL OR anterior.id IS NULL THEN
    RAISE EXCEPTION 'Cadastro não encontrado';
  END IF;
  IF novo.id = anterior.id THEN
    RAISE EXCEPTION 'Os dois cadastros são o mesmo';
  END IF;
  IF novo.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'O cadastro novo não está ativo';
  END IF;
  IF anterior.archived_at IS NULL THEN
    RAISE EXCEPTION 'O cadastro anterior não está arquivado';
  END IF;
  -- A data de nascimento é o identificador que não muda: sem ela igual, não une
  IF novo.dob IS DISTINCT FROM anterior.dob THEN
    RAISE EXCEPTION 'As datas de nascimento são diferentes';
  END IF;

  -- 1. Guarda as datas da internação anterior e o nome que a ficha tinha
  INSERT INTO public.internacoes_anteriores (patient_ref, dt_internacao, dt_saida, motivo_saida, nome_anterior)
  VALUES (anterior.id::text, anterior.dt_internacao::date, anterior.archived_at, anterior.motivo_arquivamento, anterior.name);

  -- 2. Passa para o cadastro antigo o que já foi lançado no novo.
  --    Vale para toda tabela do aplicativo que aponta para o paciente por
  --    patient_id ou paciente_id. Se alguma recusar (registro repetido), a
  --    função inteira é desfeita.
  FOR col IN
    SELECT c.table_name, c.column_name, c.udt_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND c.column_name IN ('patient_id', 'paciente_id')
      AND c.is_generated = 'NEVER'
  LOOP
    EXECUTE format(
      'UPDATE public.%I SET %I = %L::%I WHERE %I::text = %L',
      col.table_name, col.column_name, anterior.id::text, col.udt_name, col.column_name, novo.id::text
    );
    GET DIAGNOSTICS n = ROW_COUNT;
    movidos := movidos + n;
  END LOOP;

  -- Paciente com mais de uma internação anterior: as que já estavam registradas
  -- na ficha de agora seguem para a ficha que vai ficar ativa
  UPDATE public.internacoes_anteriores SET patient_ref = anterior.id::text
  WHERE patient_ref = novo.id::text;

  -- 3. Arquiva o cadastro novo (não apaga). Vem antes da reativação para os
  --    dois nunca ficarem ativos com o mesmo nome ao mesmo tempo.
  UPDATE public.patients SET
    archived_at         = now(),
    motivo_arquivamento = 'Duplicado: unido ao cadastro anterior (reinternação)'
  WHERE id = novo.id;

  -- 4. Reativa o cadastro antigo com o leito e a internação novos.
  --    Mãe, prontuário e sexo: mantém o que já havia; só preenche o que faltava.
  UPDATE public.patients SET
    archived_at         = NULL,
    motivo_arquivamento = NULL,
    -- Fica o nome que veio do NIR: o n8n reconhece o paciente pelo nome e, se
    -- continuasse o antigo, arquivaria esta ficha e criaria outra no dia seguinte
    name                = novo.name,
    bed_number          = novo.bed_number,
    dt_internacao       = novo.dt_internacao,
    mother_name         = COALESCE(NULLIF(anterior.mother_name, ''), novo.mother_name),
    prontuario          = COALESCE(NULLIF(anterior.prontuario, ''), novo.prontuario),
    sexo                = COALESCE(NULLIF(anterior.sexo, ''), novo.sexo),
    peso                = COALESCE(novo.peso, anterior.peso)
  WHERE id = anterior.id;

  INSERT INTO public.paciente_vinculos (novo_ref, anterior_ref, decisao)
  VALUES (novo.id::text, anterior.id::text, 'mesmo')
  ON CONFLICT (novo_ref, anterior_ref) DO UPDATE SET decisao = 'mesmo', decidido_em = now(), decidido_por = auth.uid();

  RETURN movidos;
END;
$$;

REVOKE ALL ON FUNCTION public.unir_reinternacao(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unir_reinternacao(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.unir_reinternacao(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- CHECKLIST DE TESTE — fazer com o paciente de teste (CACAU), nunca com real
-- ============================================================================
-- [ ] 1. Depois das etapas 1 e 2 — tabelas vazias, com RLS:
--          SELECT count(*) FROM internacoes_anteriores;   -- 0
--          SELECT count(*) FROM paciente_vinculos;        -- 0
--          SELECT tablename, policyname, cmd FROM pg_policies
--          WHERE tablename IN ('internacoes_anteriores', 'paciente_vinculos');
-- [ ] 2. Depois da etapa 3 — anon não executa a função:
--          SELECT has_function_privilege('anon', 'public.unir_reinternacao(text, text)', 'execute');   -- false
-- [ ] 3. Cadastrar um paciente de teste com o MESMO nome e a MESMA data de
--        nascimento de um CACAU arquivado. Abrir a ficha do novo: aparece o
--        aviso "Possível reinternação".
-- [ ] 4. Clicar em Conferir, marcar a conferência e confirmar. O app abre o
--        cadastro antigo, agora ativo, com o histórico dele, no leito novo.
-- [ ] 5. Conferir no banco:
--          SELECT name, bed_number, dt_internacao, archived_at, motivo_arquivamento
--          FROM patients WHERE name ILIKE 'CACAU' ORDER BY created_at DESC LIMIT 4;
--        Um ativo (o antigo) e o novo arquivado como "Duplicado...".
--          SELECT * FROM internacoes_anteriores ORDER BY registrado_em DESC LIMIT 1;
-- [ ] 6. Na ficha reativada aparece "Reinternação", com as datas da anterior.
-- [ ] 7. No dia seguinte, depois do n8n das 7h50: o paciente continua ativo e
--        não foi criado outro cadastro com o mesmo nome.
-- [ ] 8. Com uma conta que não é administradora: o aviso aparece, mas sem os
--        botões de decisão.

-- ============================================================================
-- COMO DESFAZER UMA UNIÃO FEITA POR ENGANO (à mão, caso a caso)
-- ============================================================================
-- A união não é desfeita por um botão. Para um caso específico:
--   1. Arquivar de novo o cadastro antigo, com a data de saída original:
--        UPDATE patients SET archived_at = '<dt_saida de internacoes_anteriores>',
--               motivo_arquivamento = '<motivo_saida>', dt_internacao = '<dt_internacao>',
--               name = '<nome_anterior>'
--        WHERE id = '<anterior_ref>';
--   2. Reativar o cadastro novo:
--        UPDATE patients SET archived_at = NULL, motivo_arquivamento = NULL WHERE id = '<novo_ref>';
--   3. Os registros lançados no cadastro novo ANTES da união ficaram no antigo;
--      se houver, precisam ser devolvidos tabela por tabela. Por isso: conferir
--      os três identificadores antes de unir.
--   4. Apagar a linha de internacoes_anteriores e trocar a decisão em
--      paciente_vinculos para 'diferente'.

-- ============================================================================
-- ROLLBACK DA ESTRUTURA (não desfaz uniões já feitas)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.unir_reinternacao(TEXT, TEXT);
-- DROP TABLE IF EXISTS public.paciente_vinculos;
-- DROP TABLE IF EXISTS public.internacoes_anteriores;
