
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { PatientsContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { CheckCircleIcon, AlertIcon, WarningIcon } from '../components/icons';
import { formatDateToBRL, ALERT_SYSTEMS } from '../constants';
import { Patient } from '../types';
import { supabase } from '../supabaseClient';
import { ControlesSaidasSection } from '../components/ControlesSaidasSection';

interface DiagItem {
  opcao_id: number;
  label: string;
  texto_digitado?: string;
  status: 'resolvido' | 'nao_resolvido';
  tipo: 'principal' | 'secundario';
  sistema?: string;
  created_at?: string;
  resolved_at?: string | null;
}

interface BHBalanceRecord {
  created_at: string;
  peso: number;
  volume: number;
}

interface BHCumulativoRecord {
  bh_historico_antigo: number;
  bh_ultimas_24h: number;
  bh_cumulativo_total: number;
  registros_ultimas_24h: number;
}

interface DiureseRecord {
  id: string;
  created_at: string;
  peso: number;
  volume: number;
  horas: number;
}

interface AporteRecord {
  id: string;
  data_referencia: string;
  vo_ml_kg_h: number;
  hv_npt_ml_kg_h: number;
  medicacoes_ml_kg_h: number;
  tht_ml_kg_h: number;
  sistema?: string;
  mostrar_evolucao?: boolean;
}

interface SituacaoClinicaRecord {
  id: string;
  situacao_texto: string;
  created_at: string;
  visible_until: string;
}

interface AlertaRecord {
  id: string;
  alerta_descricao: string;
  sistemas: string[];
  responsavel: string;
  status: string;
  created_at: string;
  hora_selecionada: string;
  mostrar_evolucao?: boolean;
}

interface PropedeuticaExameImagem {
  id: string;
  exame: string;
  categoria: string;
  data_exame: string;
  sistema: string | null;
  resultado: string | null;
  observacao: string | null;
  mostrar_evolucao?: boolean;
}

interface PropedeuticaParecer {
  id: string;
  especialista: string;
  data_parecer: string;
  parecer: string | null;
  mostrar_evolucao?: boolean;
}

interface PainelViralRecord {
  id: string;
  categoria: string;
  painel: string;
  data_coleta: string;
  resultado: string | null;
  valor: string | null;
  sistema: string | null;
  observacao: string | null;
  mostrar_evolucao?: boolean;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ControlesState {
  pamMin: string; pamMax: string;
  fcMin: string; fcMax: string;
  frMin: string; frMax: string;
  taxMin: string; taxMax: string;
  dxtMin: string; dxtMax: string;
}

interface SaidasState {
  diurese: string; evacuacoes: string;
  drenoTorax: string; dve: string; sng: string;
  ileostomia: string; penrose: string; outrosDrenos: string;
  hemodialise: string; dialisePeritoneal: string;
}

interface ExameFisicoState {
  monitorizacao: string; ectoscopia: string; peleFaneros: string;
  respiratorio: string; cardiovascular: string; digestivo: string;
  urinario: string; neurologico: string;
}

interface ControlesSaidasRec {
  pam_min: string; pam_max: string;
  fc_min: string;  fc_max: string;
  fr_min: string;  fr_max: string;
  tax_min: string; tax_max: string;
  dxt_min: string; dxt_max: string;
  spo2_min: string; spo2_max: string;
  evacuacoes: string;
  dreno_torax: string;
  dve: string; sng: string; ileostomia: string;
  penrose: string; outros_drenos: string; outros_drenos_label: string;
  hemodialise: string; dialise_peritoneal: string;
}


// ─── Constants ────────────────────────────────────────────────────────────────


const EXAME_SECTIONS = [
  { key: 'monitorizacao',  label: '13.1 Monitorização' },
  { key: 'ectoscopia',     label: '13.2 Ectoscopia' },
  { key: 'peleFaneros',    label: '13.3 Pele e Fâneros' },
  { key: 'respiratorio',   label: '13.4 Aparelho Respiratório' },
  { key: 'cardiovascular', label: '13.5/13.6 Aparelho Cardiovascular' },
  { key: 'digestivo',      label: '13.7 Aparelho Digestivo' },
  { key: 'urinario',       label: '13.8 Sistema Urinário' },
  { key: 'neurologico',    label: '13.9 Neurológico' },
];

const AVALIACAO_SECTIONS = [
  { id: 'respiratoria',   label: '14.1 Avaliação Respiratória' },
  { id: 'cardiovascular', label: '14.2 Avaliação Cardiovascular / Hemodinâmica' },
  { id: 'infecciosa',     label: '14.3 Avaliação Infecciosa', hasIRAS: true },
  { id: 'renal',          label: '14.4 Avaliação Renal' },
  { id: 'dhe_metabolica', label: '14.5 Avaliação DHE / Metabólica' },
  { id: 'endocrinologia', label: '14.6 Avaliação Endocrinologia' },
  { id: 'gastrointestinal', label: '14.7 Avaliação Gastrointestinal' },
  { id: 'nutricional',      label: '14.8 Avaliação Nutricional e Metabólica' },
  { id: 'hematologica',   label: '14.9/14.10 Avaliação Hematológica / Oncológica' },
  { id: 'genetica',       label: '14.10 Avaliação Genética' },
  { id: 'imunologica',    label: '14.11 Avaliação Imunológica' },
  { id: 'neurologica_av', label: '14.12 Avaliação Neurológica' },
  { id: 'psiquiatrica',   label: '14.13 Avaliação Psiquiátrica' },
  { id: 'gerenciamento',  label: '14.14/14.15 Gerenciamento de Riscos' },
  { id: 'eventos',        label: '14.16 Eventos x Notificações' },
  { id: 'outras_av',      label: '14.17 Outras' },
] as const;


const PREC_BADGE: Record<string, { label: string; cls: string }> = {
  padrao:                     { label: 'Padrão',              cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  contato:                    { label: 'Contato',             cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  goticula:                   { label: 'Gotículas',           cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  aerossois:                  { label: 'Aerossóis',           cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  contato_goticula:           { label: 'Contato + Gotículas', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  contato_aerossois:          { label: 'Contato + Aerossóis', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  contato_goticula_aerossois: { label: 'C + G + A',           cls: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200' },
};

const STATUS_CONFIG = {
  estavel:  { label: 'Estável',   text: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30',  border: 'border-green-500',  listBg: 'bg-green-50 dark:bg-green-900/10',  barBg: 'bg-green-500' },
  instavel: { label: 'Instável',  text: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-100 dark:bg-yellow-900/30',border: 'border-yellow-500', listBg: 'bg-yellow-50 dark:bg-yellow-900/10', barBg: 'bg-yellow-500' },
  em_risco: { label: 'Em Risco',  text: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30',      border: 'border-red-500',    listBg: 'bg-red-50 dark:bg-red-900/10',      barBg: 'bg-red-500' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SECTION_SISTEMAS: Record<string, string[]> = {
  respiratoria:     ['Avaliação respiratória', 'Sist. respiratório'],
  cardiovascular:   ['Avaliação cardiovascular'],
  infecciosa:       ['Avaliação infecciosa', 'Infecções Relacionadas à Assistência à Saúde (IRAS)', 'Outras infecções'],
  renal:            ['Avaliação renal'],
  dhe_metabolica:   ['Distúrbios hidroeletrolíticos/metabólicos e DAB', 'Distúrbios hidroeletrolíticos e metabólicos'],
  endocrinologia:   [],
  gastrointestinal: ['Avaliação gastrointestinal'],
  nutricional:      ['Avaliação nutricional e metabólica'],
  hematologica:     ['Avaliação hematológica/ oncológica'],
  genetica:         ['Avaliação genética'],
  imunologica:      ['Avaliação imunológica', 'Avaliação reumatológica'],
  neurologica_av:   ['Avaliação neurológica', 'Sedação /Analgesia'],
  psiquiatrica:     ['Avaliação psiquiátrica', 'Avaliação psicológica'],
  gerenciamento:    ['Gestão de riscos assistenciais', 'Precauções e controle de infecção', 'Avaliação cirúrgica'],
  eventos:          ['Notificação de eventos adversos'],
  outras_av:        ['Outros', 'Avaliação dermatológica', 'Avaliação odontológica', 'Serviço Social'],
};

const SYSTEM_EXTRA_MATCHES: Record<string, string[]> = {
  'Avaliação respiratória': ['Sist. respiratório'],
};

const ESPECIALISTA_TO_SISTEMAS: Record<string, string[]> = {
  'Alergologia Ped':      ['Avaliação imunológica'],
  'CIPE':                 ['Gestão de riscos assistenciais'],
  'Dermatologia Ped':     ['Avaliação dermatológica'],
  'Endoscopia':           ['Avaliação gastrointestinal'],
  'Farmácia Clínica':     ['Gestão de riscos assistenciais'],
  'Genética':             ['Avaliação genética'],
  'Gastropediatria':      ['Avaliação gastrointestinal'],
  'Hematologia Ped':      ['Avaliação hematológica/ oncológica'],
  'Infectologia Ped':     ['Infecções Relacionadas à Assistência à Saúde (IRAS)', 'Outras infecções'],
  'Imunologia':           ['Avaliação imunológica'],
  'Neurologia Pediátrica':['Avaliação neurológica'],
  'Nefrologia Ped':       ['Avaliação renal'],
  'Neurocirurgia':        ['Avaliação cirúrgica'],
  'Oftalmologista':       ['Outros'],
  'Ortopedia':            ['Avaliação cirúrgica'],
  'Oncologia Ped':        ['Avaliação hematológica/ oncológica'],
  'Pneumologia':          ['Avaliação respiratória'],
  'Psiquiatria':          ['Avaliação psiquiátrica'],
  'Psicologia':           ['Avaliação psicológica'],
  'Reumatologista':       ['Avaliação imunológica'],
};

const todayStr = () => new Date().toISOString().split('T')[0];

const formatAge = (dob: string) => {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  if (years >= 1) return years === 1 ? '1 ano' : `${years} anos`;
  if (months >= 1) return months === 1 ? '1 mês' : `${months} meses`;
  return days === 1 ? '1 dia' : `${days} dias`;
};

const calcDays = (startDate: string) => {
  const d = startDate.split('T')[0].split('-').map(Number);
  const start = new Date(d[0], d[1] - 1, d[2]);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  if (start.getTime() > now.getTime()) return 0;
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── CSS ─────────────────────────────────────────────────────────────────────

const inputCls = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelCls = "block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5";

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  id: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, open, onToggle, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left"
    >
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{title}</span>
      <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
    </button>
    {open && (
      <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5 pt-4 space-y-4">
        {children}
      </div>
    )}
  </div>
);

const SubSection: React.FC<{
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, open, onToggle, children }) => (
  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
    >
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</span>
      <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
    </button>
    {open && (
      <div className="px-4 pb-4 pt-3 space-y-3">
        {children}
      </div>
    )}
  </div>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}> = ({ label, value, onChange, rows = 2, placeholder }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <textarea
      className={inputCls}
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const InfoBox: React.FC<{ label: string; value: React.ReactNode; colSpan?: boolean }> = ({ label, value, colSpan }) => (
  <div className={`bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 ${colSpan ? 'sm:col-span-2' : ''}`}>
    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">{value}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const EvolucaoDiariaScreen: React.FC = () => {
  useHeader('Evolução Diária');
  const { patients } = useContext(PatientsContext)!;

  const [patientId, setPatientId] = useState('');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(todayStr());

  const [diagItems, setDiagItems] = useState<DiagItem[]>([]);
  const [diagLoading, setDiagLoading] = useState(false);

  const [bhBalance, setBhBalance] = useState<BHBalanceRecord | null>(null);
  const [bhCumul, setBhCumul] = useState<BHCumulativoRecord | null>(null);
  const [bhLoading, setBhLoading] = useState(false);
  const [diureseRec, setDiureseRec] = useState<DiureseRecord | null>(null);
  const [diureseLoading, setDiureseLoading] = useState(false);
  const [aportesList, setAportesList] = useState<AporteRecord[]>([]);
  const [aportesLoading, setAportesLoading] = useState(false);
  const [situacaoRec, setSituacaoRec] = useState<SituacaoClinicaRecord | null>(null);
  const [situacaoLoading, setSituacaoLoading] = useState(false);
  const [controlesSaidasRec, setControlesSaidasRec] = useState<ControlesSaidasRec | null>(null);
  const [exameFisico, setExameFisico] = useState<ExameFisicoState>({
    monitorizacao: '', ectoscopia: '', peleFaneros: '',
    respiratorio: '', cardiovascular: '', digestivo: '',
    urinario: '', neurologico: '',
  });
  const [alertasList, setAlertasList] = useState<AlertaRecord[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(false);
  const [examesImagemList, setExamesImagemList] = useState<PropedeuticaExameImagem[]>([]);
  const [pareceresList, setPareceresList] = useState<PropedeuticaParecer[]>([]);
  const [paineisViraisList, setPaineisViraisList] = useState<PainelViralRecord[]>([]);
  const [condutasCriticas, setCondutasCriticas] = useState('');
  const [wordExcluded, setWordExcluded] = useState<Set<string>>(new Set());
  const toggleWordItem = (key: string) => setWordExcluded(prev => {
    const s = new Set(prev);
    s.has(key) ? s.delete(key) : s.add(key);
    return s;
  });

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['diagPrincipais', 'diagSecundarios']));
  const [openAvaliacoes, setOpenAvaliacoes] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setOpenSections(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleAv = (id: string) => setOpenAvaliacoes(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });


  const updateExame = (key: keyof ExameFisicoState, val: string) =>
    setExameFisico(prev => ({ ...prev, [key]: val }));


  const filteredPatients = useMemo(() =>
    patients
      .filter(p => !p.localTransferencia)
      .filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.bedNumber.toString().includes(search)
      )
      .sort((a, b) => a.bedNumber - b.bedNumber),
    [patients, search]
  );

  const selectedPatient = patients.find(p => String(p.id) === patientId);

  const apSystems = useMemo(() => {
    const custom = new Set<string>();
    const known = new Set(ALERT_SYSTEMS);
    const add = (s: string | undefined | null) => { if (s && !known.has(s)) custom.add(s); };
    diagItems.forEach(d => add(d.sistema));
    (selectedPatient?.medications ?? []).filter(m => !m.isArchived).forEach(m => add(m.sistema));
    (selectedPatient?.exams ?? []).filter(e => !e.isArchived).forEach(e => add(e.sistema));
    (selectedPatient?.surgicalProcedures ?? []).filter(s => !s.isArchived).forEach(s => add(s.sistema));
    (selectedPatient?.cultures ?? []).filter(c => !c.isArchived).forEach(c => add(c.sistema));
    (selectedPatient?.diets ?? []).filter(d => !d.isArchived).forEach(d => add(d.sistema));
    examesImagemList.forEach(ei => add(ei.sistema));
    paineisViraisList.forEach(pn => add(pn.sistema));
    alertasList.forEach(a => a.sistemas.forEach(s => add(s)));
    return [
      ...ALERT_SYSTEMS.filter(s => s !== 'Outros'),
      ...[...custom].sort(),
      'Outros',
    ];
  }, [diagItems, selectedPatient, examesImagemList, paineisViraisList, alertasList]);

  useEffect(() => {
    if (!patientId) { setDiagItems([]); return; }
    const fetch = async () => {
      setDiagLoading(true);
      try {
        const [diagRes, optsRes, qsRes] = await Promise.all([
          supabase.from('paciente_diagnosticos').select('*').eq('patient_id', patientId).eq('arquivado', false),
          supabase.from('pergunta_opcoes_diagnostico').select('id, pergunta_id, label'),
          supabase.from('perguntas_diagnistico').select('id, tipo'),
        ]);
        const opts: Record<number, { label: string; pergunta_id: number }> = {};
        (optsRes.data || []).forEach((o: any) => { opts[o.id] = { label: o.label, pergunta_id: o.pergunta_id }; });
        const qTipo: Record<number, 'principal' | 'secundario'> = {};
        (qsRes.data || []).forEach((q: any) => { qTipo[q.id] = q.tipo; });
        // Apenas ativos (não resolvidos), sem repetir opcao_id
        const byOpcao = new Map<number, DiagItem>();
        (diagRes.data || [])
          .filter((d: any) => d.status !== 'resolvido')
          .forEach((d: any) => {
            const existing = byOpcao.get(d.opcao_id);
            if (!existing || new Date(d.created_at) < new Date(existing.created_at!)) {
              byOpcao.set(d.opcao_id, {
                opcao_id: d.opcao_id,
                label: opts[d.opcao_id]?.label ?? '—',
                texto_digitado: d.texto_digitado,
                status: d.status,
                tipo: qTipo[opts[d.opcao_id]?.pergunta_id] ?? 'principal',
                sistema: d.sistema,
                created_at: d.created_at,
                resolved_at: d.resolved_at,
              });
            }
          });
        setDiagItems(Array.from(byOpcao.values()));
      } catch (e) {
        console.error('Erro ao carregar diagnósticos:', e);
      } finally {
        setDiagLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setBhBalance(null); setBhCumul(null); return; }
    const fetchBH = async () => {
      setBhLoading(true);
      try {
        const [balRes, cumRes] = await Promise.all([
          supabase.from('balanco_hidrico').select('created_at, peso, volume, data_registro').eq('patient_id', patientId).order('data_registro', { ascending: false }).limit(1),
          supabase.from('balanco_hidrico_cumulativo').select('bh_historico_antigo, bh_ultimas_24h, bh_cumulativo_total, registros_ultimas_24h').eq('patient_id', patientId).single(),
        ]);
        setBhBalance(balRes.data?.[0] ? {
          created_at: balRes.data[0].data_registro || balRes.data[0].created_at,
          peso: parseFloat(balRes.data[0].peso),
          volume: parseFloat(balRes.data[0].volume),
        } : null);
        setBhCumul(cumRes.data ?? null);
      } catch (e) {
        console.error('Erro ao carregar BH:', e);
      } finally {
        setBhLoading(false);
      }
    };
    fetchBH();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setDiureseRec(null); return; }
    const fetchDiurese = async () => {
      setDiureseLoading(true);
      try {
        const { data } = await supabase
          .from('diurese')
          .select('id, data_registro, peso, volume, horas')
          .eq('patient_id', patientId)
          .order('data_registro', { ascending: false })
          .limit(1);
        if (data?.[0]) {
          setDiureseRec({
            id: data[0].id,
            created_at: data[0].data_registro,
            peso: parseFloat(data[0].peso),
            volume: parseFloat(data[0].volume),
            horas: parseInt(data[0].horas),
          });
        } else {
          setDiureseRec(null);
        }
      } catch (e) {
        console.error('Erro ao carregar diurese:', e);
      } finally {
        setDiureseLoading(false);
      }
    };
    fetchDiurese();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setAportesList([]); return; }
    const fetchAportes = async () => {
      setAportesLoading(true);
      try {
        const { data } = await supabase
          .from('aportes_pacientes')
          .select('id, data_referencia, vo_ml_kg_h, hv_npt_ml_kg_h, medicacoes_ml_kg_h, tht_ml_kg_h, sistema, mostrar_evolucao')
          .eq('paciente_id', patientId)
          .is('archived_at', null)
          .order('data_referencia', { ascending: false });
        setAportesList((data ?? []).map((r: any) => ({
          id: r.id,
          data_referencia: r.data_referencia,
          vo_ml_kg_h: parseFloat(r.vo_ml_kg_h),
          hv_npt_ml_kg_h: parseFloat(r.hv_npt_ml_kg_h),
          medicacoes_ml_kg_h: parseFloat(r.medicacoes_ml_kg_h),
          tht_ml_kg_h: parseFloat(r.tht_ml_kg_h),
          sistema: r.sistema,
          mostrar_evolucao: r.mostrar_evolucao !== false,
        })));
      } catch (e) {
        console.error('Erro ao carregar aportes:', e);
      } finally {
        setAportesLoading(false);
      }
    };
    fetchAportes();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setSituacaoRec(null); return; }
    const fetchSituacao = async () => {
      setSituacaoLoading(true);
      try {
        const { data } = await supabase
          .from('clinical_situations_24h')
          .select('id, situacao_texto, created_at, visible_until')
          .eq('patient_id', patientId)
          .gt('visible_until', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setSituacaoRec(data ?? null);
      } catch (e) {
        console.error('Erro ao carregar situação clínica:', e);
      } finally {
        setSituacaoLoading(false);
      }
    };
    fetchSituacao();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setExamesImagemList([]); setPareceresList([]); setPaineisViraisList([]); return; }
    const fetchPropedeutica = async () => {
      try {
        const [imgRes, parRes, pnlRes] = await Promise.all([
          supabase
            .from('exames_imagem_pacientes')
            .select('id, exame, categoria, data_exame, sistema, resultado, observacao, mostrar_evolucao')
            .eq('paciente_id', patientId)
            .is('archived_at', null),
          supabase
            .from('pareceres_pacientes')
            .select('id, especialista, data_parecer, parecer, mostrar_evolucao')
            .eq('paciente_id', patientId)
            .is('archived_at', null),
          supabase
            .from('paineis_virais_pacientes')
            .select('id, categoria, painel, data_coleta, resultado, valor, sistema, observacao, mostrar_evolucao')
            .eq('paciente_id', patientId)
            .is('archived_at', null),
        ]);
        setExamesImagemList((imgRes.data ?? []) as PropedeuticaExameImagem[]);
        setPareceresList((parRes.data ?? []) as PropedeuticaParecer[]);
        setPaineisViraisList((pnlRes.data ?? []) as PainelViralRecord[]);
      } catch (e) {
        console.error('Erro ao carregar propedêutica:', e);
      }
    };
    fetchPropedeutica();
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setAlertasList([]); return; }
    const fetchAlertas = async () => {
      setAlertasLoading(true);
      try {
        const { data } = await supabase
          .from('alertas_paciente')
          .select('id, alerta_descricao, sistemas, responsavel, status, created_at, hora_selecionada, mostrar_evolucao')
          .eq('patient_id', patientId)
          .is('archived_at', null);
        setAlertasList((data ?? []).map((r: any) => ({
          id: r.id,
          alerta_descricao: r.alerta_descricao,
          sistemas: Array.isArray(r.sistemas) ? r.sistemas : [],
          responsavel: r.responsavel ?? '',
          status: r.status ?? '',
          created_at: r.created_at,
          hora_selecionada: r.hora_selecionada ?? '',
          mostrar_evolucao: r.mostrar_evolucao !== false,
        })));
      } catch (e) {
        console.error('Erro ao carregar alertas:', e);
      } finally {
        setAlertasLoading(false);
      }
    };
    fetchAlertas();
  }, [patientId]);

  useEffect(() => {
    if (!patientId || !date) { setControlesSaidasRec(null); return; }
    supabase
      .from('patient_controles_saidas')
      .select('*')
      .eq('patient_id', patientId)
      .eq('data', date)
      .is('archived_at', null)
      .maybeSingle()
      .then(({ data: row }) => {
        if (!row) { setControlesSaidasRec(null); return; }
        setControlesSaidasRec({
          pam_min: row.pam_min ?? '', pam_max: row.pam_max ?? '',
          fc_min:  row.fc_min  ?? '', fc_max:  row.fc_max  ?? '',
          fr_min:  row.fr_min  ?? '', fr_max:  row.fr_max  ?? '',
          tax_min: row.tax_min ?? '', tax_max: row.tax_max ?? '',
          dxt_min: row.dxt_min ?? '', dxt_max: row.dxt_max ?? '',
          spo2_min: row.spo2_min ?? '', spo2_max: row.spo2_max ?? '',
          evacuacoes:          row.evacuacoes          ?? '',
          dreno_torax:         row.dreno_torax         ?? '',
          dve:                 row.dve                 ?? '',
          sng:                 row.sng                 ?? '',
          ileostomia:          row.ileostomia          ?? '',
          penrose:             row.penrose             ?? '',
          outros_drenos:       row.outros_drenos       ?? '',
          outros_drenos_label: row.outros_drenos_label ?? '',
          hemodialise:         row.hemodialise         ?? '',
          dialise_peritoneal:  row.dialise_peritoneal  ?? '',
        });
      });
  }, [patientId, date]);

  const handleSelectPatient = (p: Patient) => {
    setPatientId(String(p.id));
    setSearch('');
  };

  const handleTrocarLeito = () => {
    setPatientId('');
  };

  const buildTextContent = (): string => {
    const p = selectedPatient!;
    const lines: string[] = [];
    const sep = '─'.repeat(60);
    const add = (l: string) => lines.push(l);
    const blank = () => lines.push('');
    const title = (t: string) => { blank(); add(t); add(sep); };

    add('EVOLUÇÃO DIÁRIA');
    add(`Data: ${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}`);
    blank();

    title('1. IDENTIFICAÇÃO');
    add(`Paciente: ${p.name}`);
    add(`Prontuário: ${p.prontuario || '—'}   Leito: ${p.bedNumber}`);
    add(`Idade: ${p.dob ? formatAge(p.dob) : '—'}   Sexo: ${p.sexo === 'Masculino' || p.sexo === 'M' ? 'Masculino' : p.sexo === 'Feminino' || p.sexo === 'F' ? 'Feminino' : p.sexo ?? 'Não informado'}`);
    if (p.motherName) add(`Mãe: ${p.motherName}`);
    add(`Peso: ${p.peso ? `${p.peso} kg` : '—'}   SC: ${p.sc ? `${p.sc} m²` : '—'}`);
    add(`Internação: ${p.admissionDate ? `${formatDateToBRL(p.admissionDate)} · ${calcDays(p.admissionDate)} dia(s)` : '—'}`);

    if (p.status) {
      const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG];
      if (cfg) {
        title('2. STATUS');
        add(cfg.label);
      }
    }

    if (p.comorbidade) {
      title('3. COMORBIDADES');
      p.comorbidade.split('|').filter(c => c.trim()).forEach(c => add(`• ${c.trim()}`));
    }

    const precAtivas = (p.precautions ?? []).filter(pr => !pr.isArchived && !pr.data_fim);
    if (precAtivas.length > 0) {
      title('4. PRECAUÇÕES');
      precAtivas.forEach(pr => add(`• ${PREC_BADGE[pr.tipo_precaucao]?.label ?? pr.tipo_precaucao}`));
    }

    const we = wordExcluded;
    const principais = diagItems.filter(d => d.tipo === 'principal');
    if (principais.length > 0) {
      title('5. DIAGNÓSTICOS PRINCIPAIS');
      principais.forEach(d => {
        const lbl = d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label;
        const det = d.label !== 'Outros' && d.texto_digitado ? ` (${d.texto_digitado})` : '';
        const dataCriacao = d.created_at ? `  Em ${formatDateToBRL(d.created_at)}` : '';
        add(`• ${lbl}${det}${dataCriacao}`);
      });
    }

    const secundarios = diagItems.filter(d => d.tipo === 'secundario');
    if (secundarios.length > 0) {
      title('6. DIAGNÓSTICOS SECUNDÁRIOS');
      secundarios.forEach(d => {
        const lbl = d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label;
        const det = d.label !== 'Outros' && d.texto_digitado ? ` (${d.texto_digitado})` : '';
        const dataCriacao = d.created_at ? `  Em ${formatDateToBRL(d.created_at)}` : '';
        add(`• ${lbl}${det}${dataCriacao}`);
      });
    }

    if (controlesSaidasRec || diureseRec) {
      const cs = controlesSaidasRec;
      const vitaisLines: string[] = [];
      if (cs) {
        const vitaisDef = [
          { min: cs.pam_min, max: cs.pam_max, label: 'Δ PAM', unit: 'mmHg' },
          { min: cs.fc_min,  max: cs.fc_max,  label: 'Δ FC',  unit: 'bpm' },
          { min: cs.fr_min,  max: cs.fr_max,  label: 'Δ Fr',  unit: 'irpm' },
          { min: cs.tax_min, max: cs.tax_max, label: 'Δ Tax', unit: 'ºC' },
          { min: cs.dxt_min, max: cs.dxt_max, label: 'Δ Dxt', unit: 'mg/dl' },
          { min: cs.spo2_min, max: cs.spo2_max, label: 'SpO₂', unit: '%' },
        ];
        vitaisDef.forEach(v => {
          if (v.min || v.max) vitaisLines.push(`  ${v.label}: ${v.min || '—'} – ${v.max || '—'} ${v.unit}`);
        });
      }
      const saidasLines: string[] = [];
      if (cs) {
        if (cs.evacuacoes)         saidasLines.push(`  Evacuações: ${cs.evacuacoes}`);
        if (cs.dreno_torax)        saidasLines.push(`  Dreno Tórax: ${cs.dreno_torax} ml`);
        if (cs.dve)                saidasLines.push(`  DVE: ${cs.dve} ml`);
        if (cs.sng)                saidasLines.push(`  SNG: ${cs.sng} ml`);
        if (cs.ileostomia)         saidasLines.push(`  Ileostomia: ${cs.ileostomia} ml`);
        if (cs.penrose)            saidasLines.push(`  Penrose: ${cs.penrose} ml`);
        if (cs.outros_drenos)      saidasLines.push(`  ${cs.outros_drenos_label || 'Outros'}: ${cs.outros_drenos} ml`);
        if (cs.hemodialise)        saidasLines.push(`  Hemodiálise: ${cs.hemodialise} ml`);
        if (cs.dialise_peritoneal) saidasLines.push(`  Diálise Peritoneal: ${cs.dialise_peritoneal} ml`);
      }
      if (diureseRec) saidasLines.push(`  Diurese: ${((diureseRec.volume / diureseRec.horas) / diureseRec.peso).toFixed(2)} mL/kg/h | Volume: ${diureseRec.volume} mL`);
      if (vitaisLines.length > 0 || saidasLines.length > 0) {
        title('7. CONTROLES E SAÍDAS');
        if (vitaisLines.length > 0) { add('Controles:'); vitaisLines.forEach(l => add(l)); }
        if (saidasLines.length > 0) { if (vitaisLines.length > 0) blank(); add('Saídas:'); saidasLines.forEach(l => add(l)); }
      }
    }

    if (bhBalance) {
      title('8. BH DIÁRIO');
      const pct = bhBalance.volume / (bhBalance.peso * 10);
      add(`${pct.toFixed(2)}% — ${bhBalance.volume > 0 ? 'Ganho' : 'Perda'} | Volume: ${bhBalance.volume > 0 ? '+' : ''}${bhBalance.volume} mL`);
    }

    if (bhCumul && bhCumul.registros_ultimas_24h > 0) {
      title('9. BH CUMULATIVO');
      add(`Total: ${bhCumul.bh_cumulativo_total > 0 ? '+' : ''}${bhCumul.bh_cumulativo_total.toFixed(2)}% | BH Anterior: ${bhCumul.bh_historico_antigo.toFixed(2)}% | Últimas 24h: ${bhCumul.bh_ultimas_24h.toFixed(2)}%`);
    }

    const aportesVisiveis = aportesList.filter(a => a.mostrar_evolucao !== false);
    if (aportesVisiveis.length > 0) {
      title('10. APORTES');
      aportesVisiveis.forEach(a => {
        add(new Date(a.data_referencia + 'T12:00:00').toLocaleDateString('pt-BR'));
        add(`VO: ${a.vo_ml_kg_h.toFixed(2)} mL/kg/h`);
        add(`HV/NPT: ${a.hv_npt_ml_kg_h.toFixed(2)} mL/kg/h`);
        add(`MED: ${a.medicacoes_ml_kg_h.toFixed(2)} mL/kg/h`);
        add(`THT: ${a.tht_ml_kg_h.toFixed(2)} mL/kg/h`);
        blank();
      });
    }

    const dietasWord = (p.diets ?? []).filter(d => !d.isArchived && d.mostrar_evolucao !== false && (d.vet_at != null || d.pt_at != null));
    if (dietasWord.length > 0) {
      title('11. DIETAS');
      dietasWord.forEach(d => {
        const parts: string[] = [d.type];
        if (d.vet_at != null) parts.push(`VET atual: ${d.vet_at.toFixed(0)}%`);
        if (d.pt_at != null) parts.push(`PT atual: ${d.pt_at.toFixed(0)}%`);
        add(parts.join(' | '));
      });
      blank();
    }

    const activeDevicesWord = (p.devices ?? []).filter(d => !d.isArchived);
    if (activeDevicesWord.length > 0) {
      title('12. DISPOSITIVOS');
      add('@@DEVICES_TABLE@@');
      blank();
    }

    if (situacaoRec) {
      title('13. SITUAÇÃO CLÍNICA');
      add(situacaoRec.situacao_texto);
    }

    if (Object.values(exameFisico).some(v => v.trim())) {
      title('14. EXAME FÍSICO');
      EXAME_SECTIONS.forEach(s => {
        const val = exameFisico[s.key as keyof ExameFisicoState];
        if (val?.trim()) add(`${s.label.replace(/^[\d./ ]+/, '')}: ${val}`);
      });
    }

    const calcDias = (dateStr: string): string => {
      const s = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
      const t = new Date(); t.setHours(0, 0, 0, 0);
      return `${Math.max(1, Math.floor((t.getTime() - s.getTime()) / 86400000) + 1)}d`;
    };

    const ALL_KNOWN_SISTEMAS = new Set(Object.values(SECTION_SISTEMAS).flat());
    const apLines: string[] = [];
    AVALIACAO_SECTIONS.forEach(sec => {
      const sistemas = SECTION_SISTEMAS[sec.id] ?? [];
      const matchSistema = (s: string | undefined | null): boolean =>
        !!s && (sistemas.includes(s) || (sec.id === 'outras_av' && !ALL_KNOWN_SISTEMAS.has(s)));
      const diags = diagItems.filter(d => matchSistema(d.sistema) && !we.has(`diag_${d.opcao_id}`));
      const cirgs = (p.surgicalProcedures ?? []).filter(c => !c.isArchived && c.mostrar_evolucao !== false && matchSistema(c.sistema) && !we.has(`cir_${c.id}`));
      const cults = (p.cultures ?? []).filter(c => !c.isArchived && c.mostrar_evolucao !== false && matchSistema(c.sistema) && !we.has(`cult_${c.id}`));
      const diets = (p.diets ?? []).filter(d => !d.isArchived && d.mostrar_evolucao !== false && matchSistema(d.sistema) && !we.has(`diet_${d.id}`));
      const _today = new Date(); _today.setHours(0, 0, 0, 0);
      const meds  = (p.medications ?? []).filter(m => !m.isArchived && m.mostrar_evolucao !== false && matchSistema(m.sistema) && !we.has(`med_${m.id}`) && (!m.endDate || new Date(m.endDate + 'T00:00:00') >= _today));
      const exs   = (p.exams ?? []).filter(e => !e.isArchived && e.mostrar_evolucao !== false && matchSistema(e.sistema) && !we.has(`exam_${e.id}`));
      const imgs  = examesImagemList.filter(ei => ei.mostrar_evolucao !== false && matchSistema(ei.sistema) && !we.has(`img_${ei.id}`));
      const pnls  = paineisViraisList.filter(pn => pn.mostrar_evolucao !== false && matchSistema(pn.sistema) && !we.has(`pnl_${pn.id}`));
      const pars  = pareceresList.filter(par => {
        if (par.mostrar_evolucao === false || we.has(`par_${par.id}`)) return false;
        const mapped = ESPECIALISTA_TO_SISTEMAS[par.especialista] ?? [];
        if (mapped.some(s => sistemas.includes(s))) return true;
        return sec.id === 'outras_av' && mapped.length === 0;
      });
      const alts  = alertasList.filter(a => {
        if (a.mostrar_evolucao === false || we.has(`alt_${a.id}`) || a.created_at.split('T')[0] !== date) return false;
        if (a.sistemas.some(s => sistemas.includes(s))) return true;
        return sec.id === 'outras_av' && a.sistemas.some(s => !ALL_KNOWN_SISTEMAS.has(s));
      });
      if (diags.length + cirgs.length + cults.length + diets.length + meds.length + exs.length + imgs.length + pnls.length + pars.length + alts.length === 0) return;
      apLines.push('');
      apLines.push(sec.label.replace(/^[\d./]+\s*/, ''));
      if (diags.length) {
        diags.forEach(d => {
          const lbl = d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label;
          const det = d.label !== 'Outros' && d.texto_digitado ? ` (${d.texto_digitado})` : '';
          apLines.push(`  • ${lbl}${det}`);
        });
      }
      if (cirgs.length) {
        apLines.push('  CIRURGIAS:');
        cirgs.forEach(c => {
          apLines.push(`    • ${c.name} — ${formatDateToBRL(c.date)} (${calcDias(c.date)})`);
          if (c.notes) apLines.push(`      ${c.notes}`);
        });
      }
      if (cults.length) {
        apLines.push('  CULTURAS:');
        cults.forEach(c => {
          apLines.push(`    • ${c.site}${c.microorganism ? ` — ${c.microorganism}` : ''} — ${formatDateToBRL(c.collectionDate)}`);
          if (c.observation) apLines.push(`      ${c.observation}`);
        });
      }
      if (diets.length) {
        apLines.push('  DIETAS:');
        diets.forEach(d => {
          apLines.push(`    • ${d.type}${d.volume ? ` ${d.volume}ml` : ''} — Início: ${formatDateToBRL(d.data_inicio.split('T')[0])} (${calcDias(d.data_inicio)})`);
          if (d.observacao) apLines.push(`      ${d.observacao}`);
        });
      }
      if (meds.length) {
        apLines.push('  MEDICAÇÕES:');
        meds.forEach(m => {
          const medDias = m.endDate
            ? `${Math.max(1, Math.floor((new Date(m.endDate + 'T00:00:00').getTime() - new Date(m.startDate + 'T00:00:00').getTime()) / 86400000) + 1)}d`
            : calcDias(m.startDate);
          let line = `    • ${m.name}${m.dosage ? ` (${m.dosage})` : ''} — Início: ${formatDateToBRL(m.startDate)}`;
          if (m.endDate) line += ` | Fim: ${formatDateToBRL(m.endDate)}`;
          line += ` (${medDias})`;
          apLines.push(line);
          if (m.observacao) apLines.push(`      ${m.observacao}`);
        });
      }
      if (exs.length) {
        apLines.push('  EXAMES:');
        exs.forEach(e => {
          apLines.push(`    • ${e.name} — ${formatDateToBRL(e.date)}`);
          if (e.observation) apLines.push(`      ${e.observation}`);
        });
      }
      if (imgs.length) {
        apLines.push('  IMAGEM:');
        imgs.forEach(i => {
          apLines.push(`    • ${i.exame} — ${formatDateToBRL(i.data_exame)}${i.resultado ? ` — ${i.resultado}` : ''}`);
          if (i.observacao) apLines.push(`      ${i.observacao}`);
        });
      }
      if (pnls.length) {
        apLines.push('  PAINÉIS VIRAIS:');
        pnls.forEach(pn => {
          apLines.push(`    • ${pn.categoria} — ${pn.painel} — ${formatDateToBRL(pn.data_coleta)}${pn.resultado ? ` — ${pn.resultado}` : ''}${pn.valor ? ` (${pn.valor})` : ''}`);
          if (pn.observacao) apLines.push(`      ${pn.observacao}`);
        });
      }
      if (pars.length) {
        apLines.push('  PARECERES:');
        pars.forEach(par => apLines.push(`    • ${par.especialista} — ${formatDateToBRL(par.data_parecer)}: ${par.parecer ?? '—'}`));
      }
      const activeAlts = alts.filter(a => { const st = (a.status || '').toLowerCase(); return !st.includes('concluí') && !st.includes('concluido') && !st.includes('resolvido') && !st.includes('arquivado'); });
      if (activeAlts.length) {
        apLines.push('  CONDUTAS:');
        activeAlts.forEach(a => apLines.push(`    • ${a.alerta_descricao}`));
      }
    });
    if (apLines.length > 0) {
      title('15. AP — AVALIAÇÃO x PROPEDÊUTICA');
      apLines.forEach(l => add(l));
    }

    title('16. CONDUTAS CRÍTICAS — PRÓXIMAS 24H');
    if (condutasCriticas.trim()) add(condutasCriticas);

    blank();
    add(sep);
    add(`Gerado em: ${new Date().toLocaleString('pt-BR')} | RoundKids`);
    return lines.join('\n');
  };


  const handleDownloadDoc = async () => {
    const content = buildTextContent()
      .split('\n')
      .filter(line => !/^─+$/.test(line.trim()))
      .join('\n');
    const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const activeDevicesDoc = (selectedPatient!.devices ?? []).filter(d => !d.isArchived);
    const devicesTableHtml = activeDevicesDoc.length > 0 ? `
<table border="1" style="border-collapse:collapse;width:100%;margin:6px 0;font-family:Arial,sans-serif;font-size:11pt;">
  <thead><tr style="background:#e8e8e8;">
    <th style="padding:4px 8px;text-align:left;">Dispositivo</th>
    <th style="padding:4px 8px;text-align:left;">Descrição</th>
    <th style="padding:4px 8px;text-align:left;">Inserção</th>
    <th style="padding:4px 8px;text-align:left;">Retirada</th>
    <th style="padding:4px 8px;text-align:left;">Dias</th>
  </tr></thead>
  <tbody>
    ${activeDevicesDoc.map(d => {
      const nowSP = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const todaySP = Date.UTC(nowSP.getUTCFullYear(), nowSP.getUTCMonth(), nowSP.getUTCDate());
      const [sy, sm, sd] = d.startDate.split('-').map(Number);
      const startSP = Date.UTC(sy, sm - 1, sd);
      const days = Math.floor((todaySP - startSP) / 86400000);
      return `<tr>
        <td style="padding:4px 8px;">${escHtml(d.name)}</td>
        <td style="padding:4px 8px;">${d.observacao ? escHtml(d.observacao) : ''}</td>
        <td style="padding:4px 8px;">${formatDateToBRL(d.startDate)}</td>
        <td style="padding:4px 8px;">${d.removalDate ? formatDateToBRL(d.removalDate) : '—'}</td>
        <td style="padding:4px 8px;">${days} dia${days !== 1 ? 's' : ''}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>` : '';
    const parts = content.split('@@DEVICES_TABLE@@');
    const htmlBody = parts.map((part, i) =>
      `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:11pt;">${escHtml(part)}</pre>${i < parts.length - 1 ? devicesTableHtml : ''}`
    ).join('');
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Evolução Diária</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.6;}</style>
</head><body>${htmlBody}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolucao_${selectedPatient!.name.replace(/\s+/g, '_')}_${date}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const hasExame = Object.values(exameFisico).some(v => v.trim());
    if (hasExame || condutasCriticas.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('evolucao_diaria_registros').insert({
        patient_id: patientId,
        data_evolucao: date,
        exame_fisico_monitorizacao:  exameFisico.monitorizacao  || null,
        exame_fisico_ectoscopia:     exameFisico.ectoscopia     || null,
        exame_fisico_pele_faneros:   exameFisico.peleFaneros    || null,
        exame_fisico_respiratorio:   exameFisico.respiratorio   || null,
        exame_fisico_cardiovascular: exameFisico.cardiovascular || null,
        exame_fisico_digestivo:      exameFisico.digestivo      || null,
        exame_fisico_urinario:       exameFisico.urinario       || null,
        exame_fisico_neurologico:    exameFisico.neurologico    || null,
        condutas_criticas:           condutasCriticas           || null,
        created_by: user?.id ?? null,
      });
    }

    setExameFisico({ monitorizacao: '', ectoscopia: '', peleFaneros: '', respiratorio: '', cardiovascular: '', digestivo: '', urinario: '', neurologico: '' });
    setCondutasCriticas('');
  };

  // ─── Patient selector ─────────────────────────────────────────────────────

  if (!selectedPatient) {
    return (
      <div className="space-y-4">
        <div className="text-center pb-1">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Selecione o Leito</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Escolha o paciente para iniciar a evolução diária</p>
        </div>

        <input
          type="text"
          placeholder="Buscar por nome ou leito..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
        />

        {filteredPatients.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">Nenhum paciente encontrado</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPatients.map(patient => {
              const cfg = STATUS_CONFIG[patient.status as keyof typeof STATUS_CONFIG];
              const borderCls = cfg?.border ?? 'border-slate-300 dark:border-slate-600';
              const precAtivas = (patient.precautions ?? []).filter(p => !p.isArchived && !p.data_fim);

              return (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`text-left rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all border-2 ${borderCls} bg-white dark:bg-slate-900 overflow-hidden flex flex-col`}
                >
                  <div className={`h-1.5 w-full shrink-0 ${cfg?.barBg ?? 'bg-slate-300'}`} />
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg shrink-0">
                      {patient.bedNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight line-clamp-2">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(patient.dob).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {cfg && (
                        <span className={`self-start text-xs font-bold px-2 py-0.5 rounded-full ${cfg.text} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      )}
                      {precAtivas.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {precAtivas.map(p => {
                            const b = PREC_BADGE[p.tipo_precaucao];
                            return b ? (
                              <span key={p.id} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${b.cls}`}>
                                {b.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Form view ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* 1. Identificação — Patient card */}
      <div className="rounded-2xl shadow-lg overflow-hidden border border-blue-500/20 dark:border-blue-400/20">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 relative">
          <button
            onClick={handleTrocarLeito}
            className="absolute top-4 right-4 text-xs font-semibold text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition"
          >
            Trocar Leito
          </button>

          <div className="flex items-center gap-3 pr-28 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white font-bold text-lg">{selectedPatient.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                {selectedPatient.name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Leito {selectedPatient.bedNumber}
                </span>
                {selectedPatient.prontuario && (
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    · Pront. {selectedPatient.prontuario}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <InfoBox label="Idade" value={formatAge(selectedPatient.dob)} />
            <InfoBox label="Sexo" value={
              selectedPatient.sexo === 'Masculino' ? '♂ Masculino'
              : selectedPatient.sexo === 'Feminino' ? '♀ Feminino'
              : <span className="text-orange-500 italic font-normal">Não informado</span>
            } />
            <InfoBox label="Mãe" colSpan value={selectedPatient.motherName || '-'} />
            <InfoBox label="Peso" value={
              selectedPatient.peso
                ? `${selectedPatient.peso} kg`
                : <span className="text-orange-500 italic font-normal">Não informado</span>
            } />
            <InfoBox label="SC" value={
              selectedPatient.sc
                ? `${selectedPatient.sc} m²`
                : <span className="text-orange-500 italic font-normal">Não informado</span>
            } />
            <InfoBox label="Internação" colSpan value={
              selectedPatient.admissionDate
                ? <>
                    {formatDateToBRL(selectedPatient.admissionDate)}{' '}
                    <span className="text-blue-500 dark:text-blue-400 font-bold">
                      · {calcDays(selectedPatient.admissionDate)} {calcDays(selectedPatient.admissionDate) === 1 ? 'dia' : 'dias'}
                    </span>
                  </>
                : <span className="text-orange-500 italic font-normal">Não informado</span>
            } />
          </div>
        </div>
      </div>

      {/* Date + print bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Data da Evolução</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadDoc}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Baixar Word
          </button>
        </div>
      </div>

      {/* 2. Status */}
      {selectedPatient.status && (() => {
        const cfg = STATUS_CONFIG[selectedPatient.status as keyof typeof STATUS_CONFIG];
        return cfg ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Status</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-slate-600">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}>
                {selectedPatient.status === 'estavel'  && <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />}
                {selectedPatient.status === 'instavel' && <AlertIcon       className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                {selectedPatient.status === 'em_risco' && <WarningIcon     className="w-5 h-5 text-red-600 dark:text-red-400" />}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status Atual</p>
                <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* 3. Comorbidades */}
      {selectedPatient.comorbidade && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Comorbidades</p>
          <div className="flex flex-wrap gap-2">
            {selectedPatient.comorbidade.split('|').filter(c => c.trim()).map((c, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-blue-400 dark:border-blue-500 text-slate-700 dark:text-slate-200">
                {c.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Precauções */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Precauções</p>
        {(() => {
          const ativas = (selectedPatient.precautions ?? []).filter(p => !p.isArchived && !p.data_fim);
          return ativas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ativas.map(p => {
                const b = PREC_BADGE[p.tipo_precaucao];
                return b ? (
                  <span key={p.id} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${b.cls}`}>
                    {b.label}
                  </span>
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhuma precaução ativa no momento.</p>
          );
        })()}
      </div>

      {/* 5. Diagnósticos Principais */}
      <Section title="5. Diagnósticos Principais" id="diagPrincipais" open={openSections.has('diagPrincipais')} onToggle={() => toggle('diagPrincipais')}>
        {diagLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : (() => {
          const principais = diagItems.filter(d => d.tipo === 'principal');
          return principais.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum diagnóstico principal registrado.</p>
          ) : (
            <div className="space-y-2">
              {principais.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label}
                    </p>
                    {d.label !== 'Outros' && d.texto_digitado && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">{d.texto_digitado}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                    d.status === 'resolvido'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                  }`}>
                    {d.status === 'resolvido' ? 'Resolvido' : 'Não resolvido'}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </Section>

      {/* 6. Diagnósticos Secundários */}
      <Section title="6. Diagnósticos Secundários" id="diagSecundarios" open={openSections.has('diagSecundarios')} onToggle={() => toggle('diagSecundarios')}>
        {diagLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : (() => {
          const secundarios = diagItems.filter(d => d.tipo === 'secundario');
          return secundarios.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum diagnóstico secundário registrado.</p>
          ) : (
            <div className="space-y-2">
              {secundarios.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label}
                    </p>
                    {d.label !== 'Outros' && d.texto_digitado && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">{d.texto_digitado}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                    d.status === 'resolvido'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                  }`}>
                    {d.status === 'resolvido' ? 'Resolvido' : 'Não resolvido'}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </Section>

      {/* 7. Controles e Saídas */}
      <ControlesSaidasSection patientId={patientId} readOnly />

      {/* 8. BH Diário */}
      <Section title="8. BH Diário" id="bhDiario" open={openSections.has('bhDiario')} onToggle={() => toggle('bhDiario')}>
        {bhLoading ? (
          <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
        ) : !bhBalance ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum balanço hídrico registrado.</p>
        ) : (() => {
          const pct = bhBalance.volume / (bhBalance.peso * 10);
          const isGain = bhBalance.volume > 0;
          const colorCls = isGain ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
          const bgCls = isGain ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
          return (
            <div className={`p-4 rounded-lg border ${bgCls}`}>
              <p className={`text-xs font-medium mb-1 ${colorCls}`}>BALANÇO HÍDRICO</p>
              <p className={`text-2xl font-bold mb-1 ${colorCls}`}>{isGain ? '+' : ''}{pct.toFixed(2)}%</p>
              <p className={`text-xs font-medium mb-2 ${colorCls}`}>{isGain ? 'Ganho' : 'Perda'}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Peso: {bhBalance.peso}kg | Volume: {isGain ? '+' : ''}{bhBalance.volume}mL
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {new Date(bhBalance.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          );
        })()}
      </Section>

      {/* 9. BH Cumulativo */}
      <Section title="9. BH Cumulativo" id="bhCumulativo" open={openSections.has('bhCumulativo')} onToggle={() => toggle('bhCumulativo')}>
        {bhLoading ? (
          <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
        ) : !bhCumul || bhCumul.registros_ultimas_24h === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum dado cumulativo disponível.</p>
        ) : (() => {
          const val = bhCumul.bh_cumulativo_total;
          const alert = Math.abs(val) > 200;
          const colorCls = alert
            ? val > 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
            : val > 0 ? 'text-blue-600 dark:text-blue-400' : val < 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400';
          const bgCls = alert
            ? val > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            : val > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : val < 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700';
          const label = alert
            ? val > 0 ? '⚠️ Retenção' : '⚠️ Perda'
            : val > 0 ? '💧 Ganho' : val < 0 ? '✓ Eliminação' : 'Neutro';
          return (
            <div className={`p-4 rounded-lg border ${bgCls}`}>
              <p className={`text-xs font-medium mb-1 ${colorCls}`}>BH CUMULATIVO</p>
              <p className={`text-2xl font-bold mb-1 ${colorCls}`}>{val > 0 ? '+' : ''}{val.toFixed(2)}%</p>
              <p className={`text-xs font-medium mb-2 ${colorCls}`}>{label}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Anterior: {bhCumul.bh_historico_antigo > 0 ? '+' : ''}{bhCumul.bh_historico_antigo.toFixed(2)}% | 24h: {bhCumul.bh_ultimas_24h > 0 ? '+' : ''}{bhCumul.bh_ultimas_24h.toFixed(2)}%
              </p>
            </div>
          );
        })()}
      </Section>

      {/* 10. Diurese */}
      <Section title="10. Diurese" id="diurese" open={openSections.has('diurese')} onToggle={() => toggle('diurese')}>
        {diureseLoading ? (
          <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" /></div>
        ) : !diureseRec ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum registro de diurese.</p>
        ) : (
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-1">DIURESE</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-0.5">
              {((diureseRec.volume / diureseRec.horas) / diureseRec.peso).toFixed(2)}
            </p>
            <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2">mL/kg/h</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Volume: {diureseRec.volume}mL | {diureseRec.horas}h
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {new Date(diureseRec.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </Section>

      {/* 11. Aportes */}
      <Section title="11. Aportes" id="aportes" open={openSections.has('aportes')} onToggle={() => toggle('aportes')}>
        {aportesLoading ? (
          <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
        ) : aportesList.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum aporte registrado.</p>
        ) : (
          <div className="space-y-2">
            {aportesList.map(a => (
              <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {new Date(a.data_referencia + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'VO', value: a.vo_ml_kg_h },
                    { label: 'HV/NPT', value: a.hv_npt_ml_kg_h },
                    { label: 'MED', value: a.medicacoes_ml_kg_h },
                    { label: 'THT', value: a.tht_ml_kg_h },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white dark:bg-slate-700 rounded px-2 py-1.5 text-center border border-slate-200 dark:border-slate-600">
                      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value.toFixed(3)}</p>
                      <p className="text-xs text-slate-400">mL/kg/h</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 12. Dispositivos */}
      <Section title="12. Dispositivos" id="dispositivos" open={openSections.has('dispositivos')} onToggle={() => toggle('dispositivos')}>
        {(() => {
          const activeDevices = (selectedPatient?.devices ?? []).filter(d => !d.isArchived);
          if (activeDevices.length === 0)
            return <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhum dispositivo ativo.</p>;
          return (
            <div className="space-y-2">
              {activeDevices.map(d => {
                const nowSP = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const todaySP = Date.UTC(nowSP.getUTCFullYear(), nowSP.getUTCMonth(), nowSP.getUTCDate());
      const [sy, sm, sd] = d.startDate.split('-').map(Number);
      const startSP = Date.UTC(sy, sm - 1, sd);
      const days = Math.floor((todaySP - startSP) / 86400000);
                return (
                  <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{d.name}</p>
                    {d.location && <p className="text-xs text-slate-500 dark:text-slate-400">{d.location}</p>}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Inserção: {new Date(d.startDate + 'T12:00:00').toLocaleDateString('pt-BR')} — {days} dia{days !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </Section>

      {/* 13. S — Situação Clínica */}
      <Section title="13. S — Situação Clínica" id="situacao" open={openSections.has('situacao')} onToggle={() => toggle('situacao')}>
        {situacaoLoading ? (
          <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
        ) : !situacaoRec ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">Nenhuma situação clínica registrada nas últimas 24h.</p>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Situação clínica nas últimas 24 horas
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(situacaoRec.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {situacaoRec.situacao_texto}
            </p>
          </div>
        )}
      </Section>

      {/* 13. O — Exame Físico */}
      <Section title="14. O — Exame Físico" id="exameFisico" open={openSections.has('exameFisico')} onToggle={() => toggle('exameFisico')}>
        {EXAME_SECTIONS.map(({ key, label }) => (
          <Field
            key={key}
            label={label}
            value={exameFisico[key as keyof ExameFisicoState]}
            onChange={v => updateExame(key as keyof ExameFisicoState, v)}
            rows={2}
          />
        ))}
      </Section>

      {/* 14. AP — Avaliação x Propedêutica */}
      <Section title="15. AP — Avaliação x Propedêutica (Alertas)" id="avaliacoes" open={openSections.has('avaliacoes')} onToggle={() => toggle('avaliacoes')}>
        {alertasLoading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
        ) : (
          <div className="space-y-2">
            {apSystems.map(system => {
              const allNames = [system, ...(SYSTEM_EXTRA_MATCHES[system] ?? [])];

              const secDiags = diagItems.filter(d => d.sistema && allNames.includes(d.sistema));
              const secCirurgias = (selectedPatient?.surgicalProcedures ?? [])
                .filter(c => !c.isArchived && c.mostrar_evolucao !== false && c.sistema && allNames.includes(c.sistema));
              const secCulturas = (selectedPatient?.cultures ?? [])
                .filter(c => !c.isArchived && c.mostrar_evolucao !== false && c.sistema && allNames.includes(c.sistema));
              const secDietas = (selectedPatient?.diets ?? [])
                .filter(d => !d.isArchived && d.mostrar_evolucao !== false && d.sistema && allNames.includes(d.sistema));
              const secMedicacoes = (selectedPatient?.medications ?? [])
                .filter(m => !m.isArchived && m.mostrar_evolucao !== false && m.sistema && allNames.includes(m.sistema));
              const secExames = (selectedPatient?.exams ?? [])
                .filter(e => !e.isArchived && e.mostrar_evolucao !== false && e.sistema && allNames.includes(e.sistema));
              const secExamesImagem = examesImagemList
                .filter(ei => ei.mostrar_evolucao !== false && ei.sistema && allNames.includes(ei.sistema));
              const secPaineisVirais = paineisViraisList
                .filter(pn => pn.mostrar_evolucao !== false && pn.sistema && allNames.includes(pn.sistema));
              const secPareceres = pareceresList
                .filter(p => p.mostrar_evolucao !== false && (ESPECIALISTA_TO_SISTEMAS[p.especialista] ?? []).some(s => allNames.includes(s)));
              const secAlertas = alertasList.filter(a =>
                a.mostrar_evolucao !== false && a.sistemas.some(s => allNames.includes(s))
              );

              const total = secDiags.length + secCirurgias.length + secCulturas.length + secDietas.length + secMedicacoes.length + secExames.length + secExamesImagem.length + secPaineisVirais.length + secPareceres.length + secAlertas.length;
              if (total === 0) return null;

              return (
                <SubSection
                  key={system}
                  title={`${system} (${total})`}
                  open={openAvaliacoes.has(system)}
                  onToggle={() => toggleAv(system)}
                >
                  <div className="space-y-3">

                    {secDiags.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1.5">Diagnósticos</p>
                        <div className="space-y-1">
                          {secDiags.map((d, i) => {
                            const wk = `diag_${d.opcao_id}`;
                            const off = wordExcluded.has(wk);
                            const lbl = d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label;
                            const det = d.label !== 'Outros' && d.texto_digitado ? ` (${d.texto_digitado})` : '';
                            return (
                              <div key={i} className={`relative p-2 pr-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{lbl}{det}</p>
                                {d.created_at && <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(d.created_at).toLocaleDateString('pt-BR')}</p>}
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secCirurgias.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-1.5">Cirurgias</p>
                        <div className="space-y-1">
                          {secCirurgias.map(c => {
                            const wk = `cir_${c.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={c.id} className={`relative p-2 pr-10 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</p>
                                {c.surgeon && <p className="text-xs text-slate-500 dark:text-slate-400">{c.surgeon}</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.date).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secCulturas.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wide mb-1.5">Culturas</p>
                        <div className="space-y-1">
                          {secCulturas.map(c => {
                            const wk = `cult_${c.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={c.id} className={`relative p-2 pr-10 bg-lime-50 dark:bg-lime-900/20 rounded-lg border border-lime-200 dark:border-lime-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.site}</p>
                                {c.microorganism && <p className="text-xs text-slate-500 dark:text-slate-400">{c.microorganism}</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.collectionDate).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secDietas.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1.5">Dietas</p>
                        <div className="space-y-1">
                          {secDietas.map(d => {
                            const wk = `diet_${d.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={d.id} className={`relative p-2 pr-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{d.type}</p>
                                {d.volume && <p className="text-xs text-slate-500 dark:text-slate-400">Volume: {d.volume} ml</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(d.data_inicio).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}


                    {secMedicacoes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1.5">Medicações</p>
                        <div className="space-y-1">
                          {secMedicacoes.map(m => {
                            const wk = `med_${m.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={m.id} className={`relative p-2 pr-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.name}</p>
                                {m.dosage && <p className="text-xs text-slate-500 dark:text-slate-400">{m.dosage}</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(m.startDate).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secExames.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1.5">Exames</p>
                        <div className="space-y-1">
                          {secExames.map(e => {
                            const wk = `exam_${e.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={e.id} className={`relative p-2 pr-10 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <div className="flex items-center justify-between gap-2 pr-2">
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{e.name}</p>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(e.date).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secExamesImagem.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1.5">Exames de Imagem</p>
                        <div className="space-y-1">
                          {secExamesImagem.map(ei => {
                            const wk = `img_${ei.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={ei.id} className={`relative p-2 pr-10 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ei.exame}</p>
                                {ei.resultado && <p className="text-xs text-slate-500 dark:text-slate-400">{ei.resultado}</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(ei.data_exame).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secPaineisVirais.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wide mb-1.5">Painéis Virais</p>
                        <div className="space-y-1">
                          {secPaineisVirais.map(pn => {
                            const wk = `pnl_${pn.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={pn.id} className={`relative p-2 pr-10 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-lg border border-fuchsia-200 dark:border-fuchsia-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{pn.painel}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{pn.categoria}</p>
                                {pn.resultado && <p className="text-xs text-slate-500 dark:text-slate-400">{pn.resultado}{pn.valor ? ` (${pn.valor})` : ''}</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(pn.data_coleta + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secPareceres.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-1.5">Pareceres</p>
                        <div className="space-y-1">
                          {secPareceres.map(p => {
                            const wk = `par_${p.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={p.id} className={`relative p-2 pr-10 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.especialista}</p>
                                {p.parecer && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.parecer}</p>}
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(p.data_parecer).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {secAlertas.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5">Condutas</p>
                        <div className="space-y-2">
                          {secAlertas.map(a => {
                            const wk = `alt_${a.id}`; const off = wordExcluded.has(wk);
                            return (
                              <div key={a.id} className={`relative p-2 pr-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 transition-opacity ${off ? 'opacity-40' : ''}`}>
                                <p className="text-sm text-slate-700 dark:text-slate-200">{a.alerta_descricao}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(a.created_at).toLocaleDateString('pt-BR')}</p>
                                <button onClick={() => toggleWordItem(wk)} className="absolute top-1.5 right-1.5 p-0.5 rounded transition-all hover:scale-110"><span className={`material-symbols-rounded text-[20px] ${off ? 'text-slate-400 dark:text-slate-600' : 'text-blue-500'}`}>{off ? 'check_box_outline_blank' : 'check_box'}</span></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </SubSection>
              );
            })}
          </div>
        )}
      </Section>

      {/* 15. Condutas Críticas */}
      <Section title="16. Condutas Críticas — Próximas 24h" id="condutasCriticas" open={openSections.has('condutasCriticas')} onToggle={() => toggle('condutasCriticas')}>
        <Field label="Condutas Críticas" value={condutasCriticas} onChange={setCondutasCriticas} rows={6} placeholder="Liste as condutas críticas para as próximas 24 horas..." />
      </Section>

    </div>
  );
};
