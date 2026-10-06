import React, { useContext, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { UserContext } from '../../contexts';
import { sanitizeText } from '../../lib/sanitize';

// Registro de plantão: houve inconformidade ou pane de equipamento?
// Tabela plantao_equipamentos (CREATE_PLANTAO_EQUIPAMENTOS.sql), só SELECT e INSERT.

interface Registro {
  id: string;
  registrado_em: string;
  registrado_por_nome: string | null;
  houve_problema: boolean;
  descricao: string | null;
}

const DIAS_LISTA = 7;

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const ProblemasEquipamento: React.FC = () => {
  const { user } = useContext(UserContext)!;
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'sem_tabela' | 'erro'>('carregando');
  const [houve, setHouve] = useState<'N' | 'S'>('N');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const carregar = async () => {
    const desde = new Date(Date.now() - DIAS_LISTA * 86_400_000).toISOString();
    const { data, error } = await supabase
      .from('plantao_equipamentos')
      .select('id, registrado_em, registrado_por_nome, houve_problema, descricao')
      .gte('registrado_em', desde)
      .order('registrado_em', { ascending: false });
    if (error) {
      // 42P01 (Postgres) ou PGRST205 (PostgREST): a tabela ainda não foi criada neste banco
      setEstado(error.code === '42P01' || error.code === 'PGRST205' ? 'sem_tabela' : 'erro');
      console.error('Problemas com equipamento:', error);
      return;
    }
    setRegistros(data || []);
    setEstado('pronto');
  };

  useEffect(() => { carregar(); }, []);

  const registrar = async () => {
    const texto = sanitizeText(descricao);
    if (houve === 'S' && !texto) {
      setMensagem({ tipo: 'erro', texto: 'Descreva o equipamento e o defeito.' });
      return;
    }
    setSalvando(true);
    setMensagem(null);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const { error } = await supabase.from('plantao_equipamentos').insert({
      houve_problema: houve === 'S',
      descricao: houve === 'S' ? texto : null,
      registrado_por: authUser?.id ?? null,
      registrado_por_nome: user?.name ?? null,
    });
    setSalvando(false);
    if (error) {
      console.error('Problemas com equipamento:', error);
      setMensagem({ tipo: 'erro', texto: 'Não foi possível registrar: ' + error.message });
      return;
    }
    setHouve('N');
    setDescricao('');
    setMensagem({ tipo: 'ok', texto: 'Registro salvo.' });
    carregar();
  };

  const ultimo = registros[0];
  const problemas = registros.filter(r => r.houve_problema);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">🔧 Problemas com Equipamento?</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Houve alguma inconformidade ou pane durante o plantão?</p>

      {estado === 'carregando' && <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>}

      {estado === 'sem_tabela' && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Este registro ainda não está disponível neste banco. Falta aplicar o script <span className="font-semibold">CREATE_PLANTAO_EQUIPAMENTOS.sql</span> no Supabase.
        </p>
      )}

      {estado === 'erro' && <p className="text-sm text-danger-600 dark:text-danger-400">Não foi possível carregar os registros. Tente atualizar.</p>}

      {estado === 'pronto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="equip-houve" className="sr-only">Houve problema com equipamento?</label>
            <select
              id="equip-houve"
              value={houve}
              onChange={e => setHouve(e.target.value as 'N' | 'S')}
              className="w-full min-h-[44px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 px-3 py-2 mb-2"
            >
              <option value="N">Não, todos os equipamentos normais</option>
              <option value="S">Sim, relatar problema ou pane</option>
            </select>
            {houve === 'S' && (
              <>
                <label htmlFor="equip-descricao" className="sr-only">Descrição do problema</label>
                <textarea
                  id="equip-descricao"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Descreva o equipamento e o defeito..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 px-3 py-2 mb-2 resize-none"
                />
              </>
            )}
            <button
              type="button"
              onClick={registrar}
              disabled={salvando}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-semibold transition"
            >
              {salvando ? 'Salvando...' : 'Registrar'}
            </button>
            {mensagem && (
              <p role="status" className={`text-xs mt-2 ${mensagem.tipo === 'ok' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>{mensagem.texto}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              {ultimo
                ? `Último registro: ${dataHora(ultimo.registrado_em)}${ultimo.registrado_por_nome ? `, ${ultimo.registrado_por_nome}` : ''} — ${ultimo.houve_problema ? 'problema relatado' : 'todos normais'}.`
                : `Nenhum registro nos últimos ${DIAS_LISTA} dias.`}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Problemas relatados nos últimos {DIAS_LISTA} dias</p>
            {problemas.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum problema relatado.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {problemas.map(r => (
                  <li key={r.id} className="py-2">
                    <p className="text-sm text-slate-800 dark:text-slate-200 break-words">{r.descricao}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{dataHora(r.registrado_em)}{r.registrado_por_nome ? ` · ${r.registrado_por_nome}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
