-- ============================================================================
-- ADD_USERS_ADMIN_UPDATE_POLICY.sql
-- Permite que ADMIN atualize a linha de OUTROS usuários em public.users
-- (necessário para o botão Bloquear/Desbloquear da tela Gestão de Usuários)
--
-- Contexto: hoje só existem "users_can_update_own" (cada um edita a própria
-- linha) e "admins_can_read_all" (admin lê todos). Sem esta policy, o UPDATE
-- do admin em linha de terceiro retorna sucesso com 0 linhas — e a tela avisa.
--
-- SEGURO: usa a função is_admin() já existente (Etapa 3 do FIX_SECURITY_RLS).
-- O trigger trg_prevent_privilege_escalation continua vigiando access_level
-- e role — esta policy não abre brecha de escalada de privilégio.
-- A tabela é compartilhada com EduJuju/Telegram; nada muda para anon.
-- ============================================================================

-- >>> APLICAR <<<
DROP POLICY IF EXISTS "admins_can_update_all" ON public.users;
CREATE POLICY "admins_can_update_all"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- CHECKLIST DE TESTE
-- ============================================================================
-- 1) Policies da tabela (deve listar users_can_read_own, users_can_update_own,
--    admins_can_read_all, admins_can_update_all — todas SEM anon):
--
-- SELECT policyname, roles::text, cmd FROM pg_policies WHERE tablename = 'users';
--
-- 2) Logada como ADMIN no app: menu Usuários > Bloquear um usuário de teste.
--    O selo deve virar "Bloqueado" na hora, sem tarja vermelha.
--
-- 3) Com o usuário de teste: tentar logar → "Usuário bloqueado. Contate o
--    administrador." Depois Desbloquear e confirmar que volta a entrar.
--
-- 4) Logada como usuário comum (não-admin): editar o próprio perfil em
--    Ajustes ainda salva (users_can_update_own preservada).

-- ============================================================================
-- ROLLBACK (desfaz só esta policy)
-- ============================================================================
-- DROP POLICY IF EXISTS "admins_can_update_all" ON public.users;
