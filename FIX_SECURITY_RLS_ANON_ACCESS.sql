-- ============================================================
-- CORREÇÃO DE SEGURANÇA: acesso anônimo (anon) a dados clínicos
-- Cobre FIND-001, FIND-002 (via RLS) e FIND-004 do laudo SAST.
--
-- COMO USAR:
-- Rode UMA ETAPA por vez no SQL Editor do Supabase. Depois de cada
-- etapa, teste o app (checklist indicado). Só passe pra próxima
-- etapa se tudo continuar funcionando.
--
-- Se algo quebrar numa etapa, rode APENAS o "ROLLBACK" daquela
-- etapa (não o de outra) e me avise com a mensagem de erro exata
-- que apareceu no Supabase, pra diagnosticarmos a causa real.
--
-- Estado atual conhecido: você rodou um GRANT ALL ON ALL TABLES/
-- SEQUENCES TO anon para destravar o app. Isso reabriu TODAS as
-- tabelas do schema public pra anon, não só as listadas abaixo.
-- As etapas abaixo vão fechando de volta, uma peça por vez.
-- ============================================================


-- ============================================================
-- ETAPA 1 — Views/relatórios com dado clínico (menor risco)
-- Não mexe em tabela nem em policy de tabela, só remove o SELECT
-- direto de anon nessas views específicas.
-- ============================================================

-- >>> APLICAR <<<
REVOKE SELECT ON public.alertas_paciente_view_completa FROM anon;
REVOKE SELECT ON public.tasks_view_horario_br FROM anon;
REVOKE SELECT ON public.monitoramento_arquivamento_geral FROM anon;
REVOKE SELECT ON public.monitoramento_geral_justificativas FROM anon;
REVOKE SELECT ON public.vw_dispositivos_detalhado FROM anon;
REVOKE SELECT ON public.diagnosticos_historico_com_usuario FROM anon;
REVOKE SELECT ON public.alert_completions_with_user FROM anon;

-- >>> ROLLBACK DA ETAPA 1 (só se travar) <<<
-- GRANT SELECT ON public.alertas_paciente_view_completa TO anon;
-- GRANT SELECT ON public.tasks_view_horario_br TO anon;
-- GRANT SELECT ON public.monitoramento_arquivamento_geral TO anon;
-- GRANT SELECT ON public.monitoramento_geral_justificativas TO anon;
-- GRANT SELECT ON public.vw_dispositivos_detalhado TO anon;
-- GRANT SELECT ON public.diagnosticos_historico_com_usuario TO anon;
-- GRANT SELECT ON public.alert_completions_with_user TO anon;

-- CHECKLIST DE TESTE (logada no app):
--   [ ] Dashboard abre e mostra alertas
--   [ ] Tela "Histórico de Alertas" carrega
--   [ ] Detalhe do paciente mostra dispositivos
--   [ ] Histórico de diagnósticos aparece


-- ============================================================
-- ETAPA 2 — Tabelas de triagem (IPCS, MR, PAV)
-- ============================================================

-- >>> APLICAR <<<
REVOKE ALL ON public.triagem_ipcs_pacientes FROM anon;
REVOKE ALL ON public.triagem_mr_pacientes FROM anon;
REVOKE ALL ON public.triagem_pav_pacientes FROM anon;

ALTER POLICY "Permitir acesso ao app (triagem_ipcs)" ON public.triagem_ipcs_pacientes TO authenticated;
ALTER POLICY "Permitir acesso ao app (triagem_mr)" ON public.triagem_mr_pacientes TO authenticated;
ALTER POLICY "Permitir acesso ao app (triagem_pav)" ON public.triagem_pav_pacientes TO authenticated;

-- >>> ROLLBACK DA ETAPA 2 (só se travar) <<<
-- GRANT ALL ON public.triagem_ipcs_pacientes TO anon;
-- GRANT ALL ON public.triagem_mr_pacientes TO anon;
-- GRANT ALL ON public.triagem_pav_pacientes TO anon;
-- ALTER POLICY "Permitir acesso ao app (triagem_ipcs)" ON public.triagem_ipcs_pacientes TO anon, authenticated;
-- ALTER POLICY "Permitir acesso ao app (triagem_mr)" ON public.triagem_mr_pacientes TO anon, authenticated;
-- ALTER POLICY "Permitir acesso ao app (triagem_pav)" ON public.triagem_pav_pacientes TO anon, authenticated;

-- CHECKLIST DE TESTE:
--   [ ] Abrir um paciente e ver o card "Triagem IPCS" — carrega e salva
--   [ ] Card "Triagem MR" — carrega e salva
--   [ ] Card "Triagem PAV" — carrega e salva


-- ============================================================
-- ETAPA 3 — Tabela users: corrige recursão de policy e bloqueia
-- auto-promoção a admin (FIND-004). Não encontrei no código
-- nenhuma tela que altere access_level/role pelo cliente, então
-- o risco de quebrar alguma feature aqui é baixo.
-- ============================================================

-- >>> APLICAR <<<
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND access_level = 'adm'
  );
$$;

DROP POLICY IF EXISTS "admins_can_read_all" ON public.users;
CREATE POLICY "admins_can_read_all"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.access_level IS DISTINCT FROM OLD.access_level
      OR NEW.role IS DISTINCT FROM OLD.role)
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar access_level ou role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.users;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();

-- >>> ROLLBACK DA ETAPA 3 (só se travar) <<<
-- DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.users;
-- DROP FUNCTION IF EXISTS public.prevent_privilege_escalation();
-- DROP POLICY IF EXISTS "admins_can_read_all" ON public.users;
-- CREATE POLICY "admins_can_read_all" ON public.users FOR SELECT
--   USING ((SELECT access_level FROM public.users WHERE id = auth.uid()) = 'adm');
-- DROP FUNCTION IF EXISTS public.is_admin();

-- CHECKLIST DE TESTE:
--   [ ] Login normal continua funcionando
--   [ ] Tela de configurações/perfil do usuário abre e salva nome/foto/setor
--   [ ] Se você tem uma tela de gestão de usuários (admin), abrir e (se aplicável)
--       promover/rebaixar outro usuário ainda funciona


-- ============================================================
-- ETAPA 4 — Tabela patients (a mais crítica e a de maior risco
-- de travar algo, porque hoje o RLS dela está DESLIGADO —
-- ver FIX_UPDATE_FUNCTION_AND_RLS.sql). Faça por último, com
-- calma, e teste tudo que mexe em paciente.
-- ============================================================

-- >>> APLICAR <<<
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.patients FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;

DROP POLICY IF EXISTS "patients_authenticated_only" ON public.patients;
CREATE POLICY "patients_authenticated_only"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- >>> ROLLBACK DA ETAPA 4 (só se travar) <<<
-- ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
-- GRANT ALL ON public.patients TO anon;

-- CHECKLIST DE TESTE (o mais importante):
--   [ ] Login -> Dashboard carrega lista de pacientes
--   [ ] Abrir detalhe de um paciente
--   [ ] Criar paciente novo
--   [ ] Editar informações do paciente (nome, leito etc.)
--   [ ] Arquivar paciente / ver tela "Arquivados"
--   [ ] Evolução Diária, NPT, Balanço Hídrico abrem normalmente


-- ============================================================
-- VERIFICAÇÃO FINAL (rodar depois das 4 etapas)
-- Deve retornar ZERO linhas.
-- ============================================================
-- SELECT table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'anon'
--   AND table_schema = 'public'
--   AND table_name IN (
--     'patients','triagem_ipcs_pacientes','triagem_mr_pacientes',
--     'triagem_pav_pacientes','alertas_paciente_view_completa',
--     'tasks_view_horario_br','monitoramento_arquivamento_geral',
--     'monitoramento_geral_justificativas','vw_dispositivos_detalhado',
--     'diagnosticos_historico_com_usuario','alert_completions_with_user'
--   );
--
-- IMPORTANTE: como o GRANT ALL anterior atingiu TODAS as tabelas do
-- schema public (não só as 11 acima), rode esta query sem o filtro
-- de table_name pra ver o que mais ficou aberto pra anon:
-- SELECT table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE grantee = 'anon' AND table_schema = 'public'
-- ORDER BY table_name;
