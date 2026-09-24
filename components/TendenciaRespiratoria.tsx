import React, { useMemo, useState } from 'react';
import { fmt } from '../lib/calcRespiratoria';

// Tendência dos cálculos validados da Calculadora Respiratória.
// Um gráfico por indicador (small multiples): escalas diferentes nunca dividem
// o mesmo eixo. SVG puro, sem biblioteca de gráfico.
//
// Cores: uma série por gráfico, na cor institucional; âmbar e vermelho só
// marcam estado (fora do alvo), sempre com o valor escrito ao lado — nunca cor
// sozinha. Os pares de status foram validados para visão normal e daltonismo
// contra as duas superfícies (clara e escura).

interface Serie {
  coluna: string;
  label: string;
  unidade: string;
  casas: number;
  alvoMin?: number | null;   // null = sem limite inferior
  alvoMax?: number | null;   // null = sem limite superior
  alvoTexto?: string;
  critico?: (v: number) => boolean;
}

const SERIES: Serie[] = [
  {
    coluna: 'vte_kg', label: 'Volume corrente', unidade: 'mL/kg', casas: 1,
    alvoMin: 6, alvoMax: 8, alvoTexto: 'alvo 6 a 8',
    critico: v => v > 10,
  },
  {
    coluna: 'dp', label: 'Driving pressure', unidade: 'cmH₂O', casas: 1,
    alvoMin: null, alvoMax: 15, alvoTexto: 'alvo até 15',
    critico: v => v > 15,
  },
  {
    coluna: 'cstat', label: 'Complacência estática', unidade: 'mL/cmH₂O', casas: 1,
  },
  {
    coluna: 'io', label: 'Índice de oxigenação (IO)', unidade: '', casas: 1,
    alvoMin: null, alvoMax: 4, alvoTexto: 'sem critério de PARDS abaixo de 4',
    critico: v => v >= 16,
  },
  {
    coluna: 'pf', label: 'PaO₂/FiO₂', unidade: 'mmHg', casas: 0,
    alvoMin: 300, alvoMax: null, alvoTexto: 'alvo acima de 300',
    critico: v => v < 100,
  },
];

const PERIODOS = [
  { horas: 24, label: '24 h' },
  { horas: 24 * 7, label: '7 dias' },
];

interface Ponto { t: number; v: number; rotulo: string }

const numero = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

const hora = (t: number) =>
  new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

// Geometria do desenho (viewBox fixo; o SVG escala com o card)
const W = 320, H = 96;
const X0 = 8, X1 = 296, Y0 = 14, Y1 = 66;

const Grafico: React.FC<{ serie: Serie; pontos: Ponto[] }> = ({ serie, pontos }) => {
  const [ativo, setAtivo] = useState<number | null>(null);

  const { escalaX, escalaY, min, max } = useMemo(() => {
    const vs = pontos.map(p => p.v);
    // O alvo entra na escala para a faixa aparecer inteira
    if (serie.alvoMin != null) vs.push(serie.alvoMin);
    if (serie.alvoMax != null) vs.push(serie.alvoMax);
    let lo = Math.min(...vs), hi = Math.max(...vs);
    if (lo === hi) { lo -= 1; hi += 1; }
    const folga = (hi - lo) * 0.12;
    lo -= folga; hi += folga;
    const ts = pontos.map(p => p.t);
    const t0 = Math.min(...ts), t1 = Math.max(...ts);
    return {
      min: lo, max: hi,
      escalaX: (t: number) => (t1 === t0 ? (X0 + X1) / 2 : X0 + ((t - t0) / (t1 - t0)) * (X1 - X0)),
      escalaY: (v: number) => Y1 - ((v - lo) / (hi - lo)) * (Y1 - Y0),
    };
  }, [pontos, serie]);

  const foraDoAlvo = (v: number) =>
    (serie.alvoMin != null && v < serie.alvoMin) || (serie.alvoMax != null && v > serie.alvoMax);
  const estado = (v: number): 'ok' | 'atencao' | 'critico' =>
    serie.critico?.(v) ? 'critico' : foraDoAlvo(v) ? 'atencao' : 'ok';

  // Claro: âmbar 600 / vermelho 700. Escuro: âmbar 400 / vermelho 500.
  const classePonto = (v: number) =>
    estado(v) === 'critico' ? 'text-red-700 dark:text-red-500'
      : estado(v) === 'atencao' ? 'text-amber-600 dark:text-amber-400'
        : 'text-primary-600 dark:text-primary-400';

  const caminho = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${escalaX(p.t).toFixed(1)},${escalaY(p.v).toFixed(1)}`).join(' ');
  const ultimo = pontos[pontos.length - 1];
  const yAlvoTopo = serie.alvoMax != null ? escalaY(serie.alvoMax) : Y0;
  const yAlvoBase = serie.alvoMin != null ? escalaY(serie.alvoMin) : Y1;
  const temAlvo = serie.alvoMin != null || serie.alvoMax != null;
  const p = ativo != null ? pontos[ativo] : null;

  return (
    /* min-w-0: sem isso o item do grid não encolhe abaixo da largura intrínseca
       do SVG (320px) e o card vaza da tela no celular. */
    <div className="relative min-w-0 overflow-hidden p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{serie.label}</p>
        <p className={`shrink-0 text-sm font-bold tabular-nums ${classePonto(ultimo.v)}`}>
          {fmt(ultimo.v, serie.casas)}<span className="ml-0.5 text-[10px] font-semibold opacity-70">{serie.unidade}</span>
        </p>
      </div>
      {/* O estado nunca fica só na cor: vai escrito ao lado do valor */}
      {estado(ultimo.v) !== 'ok' && (
        <p className={`-mt-1 mb-1 text-[10px] font-bold text-right ${classePonto(ultimo.v)}`}>
          {estado(ultimo.v) === 'critico' ? 'crítico' : serie.alvoMax != null && ultimo.v > serie.alvoMax ? 'acima do alvo' : 'abaixo do alvo'}
        </p>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
        aria-label={`${serie.label}: ${pontos.length} medidas, de ${fmt(Math.min(...pontos.map(x => x.v)), serie.casas)} a ${fmt(Math.max(...pontos.map(x => x.v)), serie.casas)} ${serie.unidade}`}>
        {/* Faixa alvo: zona de fundo, não é uma série */}
        {temAlvo && (
          <rect
            x={X0} y={Math.max(Y0, yAlvoTopo)} width={X1 - X0}
            height={Math.max(0, Math.min(Y1, yAlvoBase) - Math.max(Y0, yAlvoTopo))}
            className="text-emerald-500 dark:text-emerald-400" fill="currentColor" fillOpacity={0.12}
          />
        )}

        {/* Grade: duas hairlines sólidas, recessivas */}
        <g className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeWidth={1}>
          <line x1={X0} y1={Y0} x2={X1} y2={Y0} />
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} />
        </g>

        {/* Linha da série */}
        <path d={caminho} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
          className="text-primary-600 dark:text-primary-400" stroke="currentColor" />

        {/* Pontos: anel da superfície para não colarem uns nos outros */}
        {pontos.map((pt, i) => (
          <g key={pt.t} className={classePonto(pt.v)}>
            <circle cx={escalaX(pt.t)} cy={escalaY(pt.v)} r={4} fill="currentColor"
              className="stroke-white dark:stroke-slate-900" strokeWidth={2} />
            {/* Alvo de toque maior que a marca */}
            <circle cx={escalaX(pt.t)} cy={escalaY(pt.v)} r={12} fill="transparent"
              onMouseEnter={() => setAtivo(i)} onMouseLeave={() => setAtivo(null)}
              onTouchStart={() => setAtivo(i)} style={{ cursor: 'pointer' }} />
          </g>
        ))}

        {/* Extremos da escala à esquerda; data só da medida mais recente, para
            não colidir com o rótulo do mínimo. O período está no seletor e a
            data de cada ponto aparece ao tocar nele. */}
        <g className="text-slate-400 dark:text-slate-500 fill-current" fontSize={8}>
          <text x={X0} y={Y0 - 4}>{fmt(max, serie.casas)}</text>
          <text x={X0} y={Y1 + 10}>{fmt(min, serie.casas)}</text>
          <text x={X1} y={Y1 + 10} textAnchor="end">{pontos.length} medidas · última {hora(ultimo.t)}</text>
        </g>
      </svg>

      {temAlvo && (
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-sm align-middle mr-1 bg-emerald-500/30 dark:bg-emerald-400/30" />
          {serie.alvoTexto}
        </p>
      )}

      {p && (
        <div className="absolute left-3 right-3 bottom-2 px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg pointer-events-none">
          {p.rotulo}: {fmt(p.v, serie.casas)} {serie.unidade}
          {estado(p.v) !== 'ok' && <span className="ml-1 font-bold">· {estado(p.v) === 'critico' ? 'crítico' : 'fora do alvo'}</span>}
        </div>
      )}
    </div>
  );
};

export const TendenciaRespiratoria: React.FC<{ registros: Record<string, unknown>[] }> = ({ registros }) => {
  const [horas, setHoras] = useState(24);

  const series = useMemo(() => {
    const limite = Date.now() - horas * 3600000;
    const linhas = registros
      .map(r => ({ t: new Date(String(r.criado_em)).getTime(), r }))
      .filter(x => Number.isFinite(x.t) && x.t >= limite)
      .sort((a, b) => a.t - b.t);
    return SERIES.map(s => ({
      serie: s,
      pontos: linhas
        .map(({ t, r }) => ({ t, v: numero(r[s.coluna]), rotulo: hora(t) }))
        .filter((p): p is Ponto => p.v != null),
    })).filter(x => x.pontos.length >= 2);   // com um ponto só não há tendência
  }, [registros, horas]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Evolução dos cálculos validados</p>
        <div className="flex gap-1">
          {PERIODOS.map(p => (
            <button
              key={p.horas} onClick={() => setHoras(p.horas)}
              className={`min-h-[32px] px-3 rounded-lg text-xs font-bold border transition ${horas === p.horas
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {series.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
          Sem dois cálculos validados neste período para desenhar a evolução. Os registros continuam na lista abaixo.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {series.map(({ serie, pontos }) => <Grafico key={serie.coluna} serie={serie} pontos={pontos} />)}
        </div>
      )}
    </div>
  );
};
