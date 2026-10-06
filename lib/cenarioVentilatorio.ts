// Cenário ventilatório da unidade: uma modalidade por paciente internado.
// Mesmas 12 modalidades do painel do Fisio Beira Leito, para os dois apps falarem a mesma língua.
//
// De onde vem a modalidade de cada paciente, em ordem:
//   1. suporte registrado — episódio em curso do bloco "Oxigenação e Ventilação" do Round
//      ou "Suporte Ventilatório Atual" do Fisio; se houver os dois, vale o mais recente;
//   2. dispositivo respiratório ativo (dispositivos_pacientes);
//   3. sem nenhum registro: conta como Ar Ambiente (mesma regra do Fisio), marcado como 'assumido'.

export const MODALIDADES = [
  'Ar Ambiente', 'Cateter Nasal (CN)', 'Máscara Venturi',
  'Máscara Comum', 'CNAF', 'VNI',
  'TQT em Ar Amb.', 'TQT em O₂', 'TQT em VM',
  'TOT em VM', 'Pronados', 'Em NOI',
] as const;

export type Modalidade = typeof MODALIDADES[number];
export type OrigemModalidade = 'round' | 'fisio' | 'dispositivo' | 'assumido';

export const MODALIDADES_VM: Modalidade[] = ['TQT em VM', 'TOT em VM'];

export interface EpisodioAtivo { situacao: string; dispositivo: string | null; inicio: string }
export interface SuporteFisio { suporte: string; updated_at: string | null }

// NFKD também troca o "₂" de "O₂" por "2"
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

const RE_TQT = /\btqt\b|traqueost/;

// Valor do campo "suporte" da tabela fisio_suporte_ventilatorio
export function modalidadeDoFisio(suporte: string): Modalidade | null {
  const t = norm(suporte);
  if (/prona/.test(t)) return 'Pronados';
  if (/\bnoi\b|oxido nitrico/.test(t)) return 'Em NOI';
  if (/\btot\b/.test(t)) return 'TOT em VM';
  if (RE_TQT.test(t)) {
    if (/\bvm\b/.test(t)) return 'TQT em VM';
    return /o2|oxig/.test(t) ? 'TQT em O₂' : 'TQT em Ar Amb.';
  }
  if (/cnaf/.test(t)) return 'CNAF';
  if (/\bvni\b|cpap|bipap/.test(t)) return 'VNI';
  if (/ventur/.test(t)) return 'Máscara Venturi';
  if (/masc/.test(t)) return 'Máscara Comum';
  if (/cateter nasal/.test(t)) return 'Cateter Nasal (CN)';
  if (/ar ambiente/.test(t)) return 'Ar Ambiente';
  return null;
}

// Episódio em curso de suporte_resp_episodios. O bloco não registra a via aérea,
// então a traqueostomia vem dos dispositivos ativos.
export function modalidadeDoEpisodio(ep: EpisodioAtivo, temTqt: boolean): Modalidade | null {
  switch (ep.situacao) {
    case 'ar_ambiente': return temTqt ? 'TQT em Ar Amb.' : 'Ar Ambiente';
    case 'o2_convencional':
      if (temTqt) return 'TQT em O₂';
      return ep.dispositivo === 'cateter_nasal' ? 'Cateter Nasal (CN)' : 'Máscara Comum';
    case 'alto_fluxo': return ep.dispositivo === 'venturi' ? 'Máscara Venturi' : 'CNAF';
    case 'vni': return 'VNI';
    case 'vmi': return temTqt ? 'TQT em VM' : 'TOT em VM';
    default: return null;
  }
}

// Dispositivos respiratórios ativos: vale o de maior suporte.
// TQT sem outro registro conta como "TQT em VM", igual ao Fisio.
export function modalidadeDosDispositivos(tipos: string[]): Modalidade | null {
  const t = tipos.map(norm);
  const tem = (re: RegExp) => t.some(x => re.test(x));
  if (tem(/\btot\b/)) return 'TOT em VM';
  if (tem(RE_TQT)) return 'TQT em VM';
  if (tem(/\bvpm\b/)) return 'TOT em VM';
  if (tem(/\bvni\b|cpap|bipap/)) return 'VNI';
  if (tem(/cnaf/)) return 'CNAF';
  if (tem(/ventur/)) return 'Máscara Venturi';
  if (tem(/masc/)) return 'Máscara Comum';
  if (tem(/cateter nasal/)) return 'Cateter Nasal (CN)';
  return null;
}

export function modalidadeDoPaciente(e: {
  episodio?: EpisodioAtivo | null;
  fisio?: SuporteFisio | null;
  dispositivos: string[];
}): { modalidade: Modalidade; origem: OrigemModalidade; confirmar?: boolean } {
  const temTqt = e.dispositivos.some(d => RE_TQT.test(norm(d)));
  const doRound = e.episodio ? modalidadeDoEpisodio(e.episodio, temTqt) : null;
  const doFisio = e.fisio ? modalidadeDoFisio(e.fisio.suporte) : null;

  if (doRound && doFisio) {
    const fisioMaisRecente = !!e.fisio?.updated_at && new Date(e.fisio.updated_at) > new Date(e.episodio!.inicio);
    return fisioMaisRecente ? { modalidade: doFisio, origem: 'fisio' } : { modalidade: doRound, origem: 'round' };
  }
  if (doRound) return { modalidade: doRound, origem: 'round' };
  if (doFisio) return { modalidade: doFisio, origem: 'fisio' };

  const doDispositivo = modalidadeDosDispositivos(e.dispositivos);
  if (doDispositivo) {
    // TQT sem ventilador (VPM) nem suporte registrado: a VM é suposição, alguém precisa confirmar
    const confirmar = doDispositivo === 'TQT em VM' && !e.dispositivos.some(d => /\bvpm\b/.test(norm(d)));
    return { modalidade: doDispositivo, origem: 'dispositivo', confirmar };
  }
  return { modalidade: 'Ar Ambiente', origem: 'assumido' };
}
