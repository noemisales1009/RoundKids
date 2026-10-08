-- ============================================================================
-- CREATE_ACESSOS_LOG.sql
-- Histórico de acessos ao Round Braga: quem entrou, quando e como.
--
-- O aplicativo grava uma linha a cada entrada:
--   login         = a pessoa digitou e-mail e senha
--   vindo_do_sbar = chegou pelo botão "Voltar ao Round" do SBAR Kids
--   sessao_salva  = abriu o aplicativo já logada (uma vez por aba do navegador)
--
-- Só registra o Round Braga, e só a partir da publicação. Acessos antigos e
-- acessos ao SBAR Kids não aparecem. Para o último login de cada conta em
-- qualquer aplicativo, o painel do Supabase mostra em Authentication > Users,
-- coluna "Last sign in".
--
-- SEGURO: cria tabela nova, não toca em nada existente.
-- RLS ligada desde o início: cada usuário grava só a própria linha, e só
-- administrador lê. Nada para anon.
-- Enquanto isto não for rodado, o aplicativo funciona normalmente e só não
-- registra; a tela Acessos avisa que os dados não estão disponíveis.
--
-- Depende de public.is_admin_user(), já usada em outras tabelas.
--
-- Rodar uma etapa de cada vez no SQL Editor do Supabase.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ETAPA 1 — Tabela
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acessos_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),          -- hora do servidor, não a do aparelho
  usuario_id   UUID NOT NULL DEFAULT auth.uid(),
  tipo         TEXT NOT NULL,     -- login | vindo_do_sbar | sessao_salva
  dispositivo  TEXT               -- ex.: "Computador · Chrome"
);

CREATE INDEX IF NOT EXISTS idx_acessos_log_criado_em ON public.acessos_log (criado_em DESC);

-- ----------------------------------------------------------------------------
-- ETAPA 2 — RLS (rodar logo depois da etapa 1)
-- ----------------------------------------------------------------------------
ALTER TABLE public.acessos_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_insert_acessos_log" ON public.acessos_log;
CREATE POLICY "authenticated_insert_acessos_log"
  ON public.acessos_log FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "admin_select_acessos_log" ON public.acessos_log;
CREATE POLICY "admin_select_acessos_log"
  ON public.acessos_log FOR SELECT TO authenticated
  USING (public.is_admin_user());

GRANT SELECT, INSERT ON public.acessos_log TO authenticated;

-- Nada para anon: sem GRANT e sem policy. Ninguém altera nem apaga pelo aplicativo.

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- [ ] 1. Tabela vazia, com RLS e duas policies:
--          SELECT count(*) FROM acessos_log;                                       -- 0
--          SELECT relrowsecurity FROM pg_class WHERE relname = 'acessos_log';      -- true
--          SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'acessos_log';
-- [ ] 2. No app: sair e entrar de novo com e-mail e senha. Depois:
--          SELECT criado_em, tipo, dispositivo FROM acessos_log ORDER BY criado_em DESC LIMIT 5;
--        A primeira linha deve ser "login", com a hora de agora.
-- [ ] 3. Como administradora: menu Acessos mostra esse login, com o seu nome.
-- [ ] 4. Atualizar a página (F5) várias vezes NÃO cria linhas novas.
-- [ ] 5. Com uma conta que não é administradora: o menu não aparece, e o login
--        dela aparece na sua tela de Acessos.
-- [ ] 6. O login e o restante do aplicativo seguem funcionando normalmente.

-- Limpeza periódica (opcional; rodar à mão quando quiser):
--   DELETE FROM acessos_log WHERE criado_em < now() - interval '180 days';

-- ============================================================================
-- ROLLBACK (o app volta a funcionar sem registrar acessos)
-- ============================================================================
-- DROP TABLE IF EXISTS public.acessos_log;
