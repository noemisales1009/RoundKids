-- ============================================================================
-- FIX_USERS_POLICIES_CLEANUP.sql
-- Limpeza das policies duplicadas de public.users
--
-- STATUS: APLICADO EM PRODUÇÃO em 2026-08-14 (3 etapas, todas com sucesso).
--
-- Contexto: a tabela acumulou 8 policies, com 3 pares duplicados e metade no
-- padrão antigo com roles {public}. Nenhum vazamento real (todas exigiam
-- auth.uid() = id, que para anon é NULL), mas duplicata confunde auditoria e
-- {public} foge do padrão pós-incidente (só authenticated).
--
-- Estado final (5 policies, todas {authenticated}):
--   users_select           SELECT  USING (true)         -- equipe vê nomes/perfis
--   users_update_own       UPDATE  auth.uid() = id
--   users_insert_own       INSERT  auth.uid() = id      -- recriada TO authenticated
--   admins_can_read_all    SELECT  is_admin()
--   admins_can_update_all  UPDATE  is_admin()           -- bloqueio de usuários
--
-- Nota: users_select USING (true) é proposital — o app mostra "criado por"
-- com nomes da equipe em vários lugares. A tabela é compartilhada com o
-- EduJuju/Telegram; se algo estranhar lá, usar o rollback abaixo.
-- ============================================================================

-- ETAPA 1 — duplicata de UPDATE (users_update_own já cobre)
DROP POLICY IF EXISTS "Usuário pode atualizar o próprio perfil" ON public.users;

-- ETAPA 2 — duplicatas de INSERT (recria a única necessária, TO authenticated)
DROP POLICY IF EXISTS "Usuário pode inserir o próprio registro" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ETAPA 3 — duplicata de SELECT (users_select já cobre)
DROP POLICY IF EXISTS "users_select_own" ON public.users;

-- ============================================================================
-- CHECKLIST DE TESTE (feito em 2026-08-14)
-- ============================================================================
-- [x] Etapas 1–3 aplicadas sem erro
-- [ ] SELECT policyname, roles::text, cmd FROM pg_policies WHERE tablename='users';
--     → 5 policies, todas {authenticated}
-- [ ] Ajustes > salvar perfil funciona (users_update_own)
-- [ ] Nomes "criado por" continuam aparecendo no app (users_select)
-- [ ] Primeiro login de conta nova cria registro (users_insert_own) — testar
--     na próxima conta nova da equipe

-- ============================================================================
-- ROLLBACK (recria as policies removidas como eram)
-- ============================================================================
-- CREATE POLICY "Usuário pode atualizar o próprio perfil" ON public.users
--   FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- CREATE POLICY "Usuário pode inserir o próprio registro" ON public.users
--   FOR INSERT WITH CHECK (auth.uid() = id);
-- CREATE POLICY "users_select_own" ON public.users
--   FOR SELECT USING (auth.uid() = id);
