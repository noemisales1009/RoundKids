-- ============================================================================
-- ALTER_APORTES_UPDATE_AUTHENTICATED.sql
-- Aportes: qualquer pessoa logada pode editar e arquivar.
--
-- PROBLEMA: a policy de UPDATE de aportes_pacientes exigia
--   created_by = auth.uid() OR is_admin_user()
-- Ou seja, só o autor do aporte (ou um admin) conseguia arquivar ou editar.
-- Quem tentava arquivar o aporte de outra pessoa não recebia erro: o banco
-- simplesmente não alterava nada, e o app mostrava "arquivado com sucesso".
-- Dispositivos, medicações e culturas não têm essa restrição.
--
-- DECISÃO (Noemi, 2026-09-23): alinhar com o resto do app — qualquer usuário
-- autenticado edita e arquiva. O registro de quem criou (created_by) e de quem
-- alterou (updated_by) continua guardado, e o histórico não muda.
--
-- SEGURO: a policy nova é criada ANTES de remover a antiga, então em nenhum
-- momento a tabela fica sem permissão de UPDATE. Nada para anon.
-- INSERT e DELETE continuam como estavam (autor ou admin).
-- ============================================================================

-- ETAPA 1 — cria a policy permissiva (a partir daqui o arquivamento já funciona)
DROP POLICY IF EXISTS aportes_update_authenticated ON public.aportes_pacientes;
CREATE POLICY aportes_update_authenticated
ON public.aportes_pacientes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ETAPA 2 — remove a policy antiga, restrita ao autor
DROP POLICY IF EXISTS aportes_update_owner_or_admin ON public.aportes_pacientes;

-- ============================================================================
-- CHECKLIST DE TESTE (rodar depois de aplicar)
-- ============================================================================
-- 1) Deve aparecer só aportes_update_authenticated no comando UPDATE:
--
-- SELECT policyname, cmd, roles, qual
-- FROM pg_policies WHERE tablename = 'aportes_pacientes' ORDER BY cmd, policyname;
--
-- 2) No app: abrir um paciente > Aportes > arquivar um aporte cadastrado por
--    OUTRA pessoa, informando o motivo. Ele deve sair da lista na hora.
--    Editar e marcar/desmarcar "Exibir na Evolução Diária" também devem funcionar.
--
-- 3) Conferir o arquivamento gravado:
--
-- SELECT data_referencia, archived_at, motivo_arquivamento, created_by, updated_by
-- FROM aportes_pacientes WHERE archived_at IS NOT NULL
-- ORDER BY archived_at DESC LIMIT 5;

-- ============================================================================
-- ROLLBACK (volta a restringir ao autor ou admin)
-- ============================================================================
-- CREATE POLICY aportes_update_owner_or_admin
-- ON public.aportes_pacientes FOR UPDATE TO authenticated
-- USING (created_by = auth.uid() OR public.is_admin_user())
-- WITH CHECK (created_by = auth.uid() OR public.is_admin_user());
-- DROP POLICY IF EXISTS aportes_update_authenticated ON public.aportes_pacientes;
