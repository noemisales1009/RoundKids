import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ShieldIcon } from '../components/icons';
import { UserContext } from '../contexts';
import { supabase } from '../supabaseClient';

/**
 * Gestão de usuários (só admin): listar, bloquear e desbloquear pelo campo
 * users.ativo. Bloqueado não loga (LoginScreen) e tem a sessão derrubada na
 * próxima abertura/renovação de token (UserProvider).
 *
 * O UPDATE em linha de outro usuário depende da policy admins_can_update_all
 * (ADD_USERS_ADMIN_UPDATE_POLICY.sql). Sem ela o Supabase retorna sucesso com
 * 0 linhas — por isso o .select() confere se a alteração realmente aconteceu.
 */

interface DbUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  sector: string | null;
  access_level: string | null;
  ativo: boolean;
}

const LEVEL_BADGE: Record<string, string> = {
  adm: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  super: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  geral: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

export const AdminUsersScreen: React.FC = () => {
  const { user: currentUser } = useContext(UserContext)!;
  const [usuarios, setUsuarios] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  const carregar = async () => {
    setLoading(true);
    setErro('');
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, sector, access_level, ativo')
      .order('name', { ascending: true });
    if (error) setErro(`Não foi possível listar os usuários: ${error.message}`);
    setUsuarios((data as DbUser[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { carregar(); }, []);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(u =>
      (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q));
  }, [usuarios, busca]);

  const alternarBloqueio = async (u: DbUser) => {
    const bloquear = u.ativo !== false;
    if (bloquear && !window.confirm(`Bloquear ${u.name || u.email}?\n\nA pessoa não conseguirá mais entrar no app e a sessão atual dela será encerrada na próxima abertura.`)) {
      return;
    }
    setSalvandoId(u.id);
    setErro('');

    const { data, error } = await supabase
      .from('users')
      .update({ ativo: !bloquear, updated_at: new Date().toISOString() })
      .eq('id', u.id)
      .select('id, ativo');

    if (error) {
      setErro(`Não foi possível ${bloquear ? 'bloquear' : 'desbloquear'}: ${error.message}`);
    } else if (!data || data.length === 0) {
      // RLS barrou em silêncio: sem policy de UPDATE para admin em linhas de terceiros
      setErro('Sem permissão para alterar outros usuários — aplique ADD_USERS_ADMIN_UPDATE_POLICY.sql no Supabase.');
    } else {
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ativo: data[0].ativo } : x));
    }
    setSalvandoId(null);
  };

  const totalBloqueados = usuarios.filter(u => u.ativo === false).length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <ShieldIcon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gestão de Usuários</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {usuarios.length} usuário{usuarios.length === 1 ? '' : 's'}
            {totalBloqueados > 0 && <> · {totalBloqueados} bloqueado{totalBloqueados === 1 ? '' : 's'}</>}
          </p>
        </div>
      </div>

      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Buscar por nome ou email..."
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
      />

      {erro && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : visiveis.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">Nenhum usuário encontrado.</p>
      ) : (
        <div className="space-y-2">
          {visiveis.map(u => {
            const souEu = u.id === currentUser?.id;
            const bloqueado = u.ativo === false;
            return (
              <div
                key={u.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 bg-white dark:bg-slate-900 ${bloqueado
                  ? 'border-red-300 dark:border-red-800 opacity-80'
                  : 'border-slate-200 dark:border-slate-700'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${bloqueado ? 'bg-slate-400 dark:bg-slate-600' : 'bg-gradient-to-br from-primary-500 to-primary-700'}`}>
                  {(u.name || u.email || '?').charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {u.name || 'Sem nome'}{souEu && <span className="text-xs font-normal text-slate-400"> (você)</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {u.email}{u.role ? ` · ${u.role}` : ''}{u.sector ? ` · ${u.sector}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.access_level && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[u.access_level] ?? LEVEL_BADGE.geral}`}>
                      {u.access_level}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bloqueado
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                    {bloqueado ? 'Bloqueado' : 'Ativo'}
                  </span>

                  {!souEu && (
                    <button
                      onClick={() => alternarBloqueio(u)}
                      disabled={salvandoId === u.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${bloqueado
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    >
                      {salvandoId === u.id ? '...' : bloqueado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
        Bloqueado não consegue mais entrar no app; se estiver com o app aberto, a sessão é encerrada
        na próxima abertura ou renovação automática (até ~1 h). O bloqueio não apaga nada — os registros
        criados pela pessoa continuam no prontuário.
      </p>
    </div>
  );
};

export default AdminUsersScreen;
