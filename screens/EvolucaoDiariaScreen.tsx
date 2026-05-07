
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { PatientsContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { CheckCircleIcon, AlertIcon, WarningIcon } from '../components/icons';
import { formatDateToBRL } from '../constants';
import { Patient } from '../types';
import { supabase } from '../supabaseClient';
import { ControlesSaidasSection } from '../components/ControlesSaidasSection';

interface DiagItem {
  opcao_id: number;
  label: string;
  texto_digitado?: string;
  status: 'resolvido' | 'nao_resolvido';
  tipo: 'principal' | 'secundario';
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
}

interface PropedeuticaExameImagem {
  id: string;
  exame: string;
  categoria: string;
  data_exame: string;
  sistema: string | null;
  resultado: string | null;
  observacao: string | null;
}

interface PropedeuticaParecer {
  id: string;
  especialista: string;
  data_parecer: string;
  parecer: string | null;
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


// ─── Constants ────────────────────────────────────────────────────────────────

const VITAIS = [
  { keyMin: 'pamMin', keyMax: 'pamMax', label: 'Δ PAM', unit: 'mmHg', desc: 'Delta da Pressão Arterial Média' },
  { keyMin: 'fcMin',  keyMax: 'fcMax',  label: 'Δ FC',  unit: 'bpm',  desc: 'Delta da Frequência Cardíaca' },
  { keyMin: 'frMin',  keyMax: 'frMax',  label: 'Δ Fr',  unit: 'irpm', desc: 'Delta da Frequência Respiratória' },
  { keyMin: 'taxMin', keyMax: 'taxMax', label: 'Δ Tax', unit: 'ºC',   desc: 'Delta da Temperatura Axilar' },
  { keyMin: 'dxtMin', keyMax: 'dxtMax', label: 'Δ Dxt', unit: 'mg/dl',desc: 'Delta do Dextro / Glicemia capilar' },
];

const DRENOS = [
  { key: 'dve',         label: 'DVE (Derivação Ventricular Externa)' },
  { key: 'sng',         label: 'SNG (Sonda Nasogástrica)' },
  { key: 'ileostomia',  label: 'ILEOSTOMIA' },
  { key: 'penrose',     label: 'PENROSE' },
  { key: 'outrosDrenos',label: 'OUTROS' },
];

const EXAME_SECTIONS = [
  { key: 'monitorizacao',  label: '9.1 Monitorização' },
  { key: 'ectoscopia',     label: '9.2 Ectoscopia' },
  { key: 'peleFaneros',    label: '9.3 Pele e Fâneros' },
  { key: 'respiratorio',   label: '9.4 Aparelho Respiratório' },
  { key: 'cardiovascular', label: '9.5/9.6 Aparelho Cardiovascular' },
  { key: 'digestivo',      label: '9.7 Aparelho Digestivo' },
  { key: 'urinario',       label: '9.8 Sistema Urinário' },
  { key: 'neurologico',    label: '9.9 Neurológico' },
];

const AVALIACAO_SECTIONS = [
  { id: 'respiratoria',   label: '10.1 Avaliação Respiratória' },
  { id: 'cardiovascular', label: '10.2 Avaliação Cardiovascular / Hemodinâmica' },
  { id: 'infecciosa',     label: '10.3 Avaliação Infecciosa', hasIRAS: true },
  { id: 'renal',          label: '10.4 Avaliação Renal' },
  { id: 'dhe_metabolica', label: '10.5 Avaliação DHE / Metabólica' },
  { id: 'endocrinologia', label: '10.6 Avaliação Endocrinologia' },
  { id: 'gastrointestinal', label: '10.7 Avaliação Gastrointestinal' },
  { id: 'hematologica',   label: '10.8/10.9 Avaliação Hematológica / Oncológica' },
  { id: 'genetica',       label: '10.10 Avaliação Genética' },
  { id: 'imunologica',    label: '10.11 Avaliação Imunológica' },
  { id: 'neurologica_av', label: '10.12 Avaliação Neurológica' },
  { id: 'psiquiatrica',   label: '10.13 Avaliação Psiquiátrica' },
  { id: 'gerenciamento',  label: '10.14/10.15 Gerenciamento de Riscos' },
  { id: 'eventos',        label: '10.16 Eventos x Notificações' },
  { id: 'outras_av',      label: '10.17 Outras' },
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
  respiratoria:     ['Avaliação respiratória'],
  cardiovascular:   ['Avaliação cardiovascular'],
  infecciosa:       ['Infecções Relacionadas à Assistência à Saúde (IRAS)', 'Outras infecções'],
  renal:            ['Avaliação renal'],
  dhe_metabolica:   ['Distúrbios hidroeletrolíticos e metabólicos'],
  endocrinologia:   [],
  gastrointestinal: ['Avaliação gastrointestinal'],
  hematologica:     ['Avaliação hematológica/ oncológica'],
  genetica:         ['Avaliação genética'],
  imunologica:      ['Avaliação imunológica'],
  neurologica_av:   ['Avaliação neurológica'],
  psiquiatrica:     ['Avaliação psiquiátrica', 'Avaliação psicológica'],
  gerenciamento:    ['Gestão de riscos assistenciais', 'Precauções e controle de infecção', 'Avaliação cirúrgica'],
  eventos:          ['Notificação de eventos adversos'],
  outras_av:        ['Outros', 'Avaliação nutricional e metabólica', 'Avaliação dermatológica', 'Avaliação odontológica', 'Serviço Social'],
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
const numInputCls = "w-20 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center";

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
  const [controles, setControles] = useState<ControlesState>({
    pamMin: '', pamMax: '', fcMin: '', fcMax: '',
    frMin: '', frMax: '', taxMin: '', taxMax: '', dxtMin: '', dxtMax: '',
  });
  const [saidas, setSaidas] = useState<SaidasState>({
    diurese: '', evacuacoes: '', drenoTorax: '',
    dve: '', sng: '', ileostomia: '', penrose: '', outrosDrenos: '',
    hemodialise: '', dialisePeritoneal: '',
  });
  const [bhBalance, setBhBalance] = useState<BHBalanceRecord | null>(null);
  const [bhCumul, setBhCumul] = useState<BHCumulativoRecord | null>(null);
  const [bhLoading, setBhLoading] = useState(false);
  const [diureseRec, setDiureseRec] = useState<DiureseRecord | null>(null);
  const [diureseLoading, setDiureseLoading] = useState(false);
  const [aportesList, setAportesList] = useState<AporteRecord[]>([]);
  const [aportesLoading, setAportesLoading] = useState(false);
  const [situacaoRec, setSituacaoRec] = useState<SituacaoClinicaRecord | null>(null);
  const [situacaoLoading, setSituacaoLoading] = useState(false);
  const [exameFisico, setExameFisico] = useState<ExameFisicoState>({
    monitorizacao: '', ectoscopia: '', peleFaneros: '',
    respiratorio: '', cardiovascular: '', digestivo: '',
    urinario: '', neurologico: '',
  });
  const [alertasList, setAlertasList] = useState<AlertaRecord[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(false);
  const [examesImagemList, setExamesImagemList] = useState<PropedeuticaExameImagem[]>([]);
  const [pareceresList, setPareceresList] = useState<PropedeuticaParecer[]>([]);
  const [condutasCriticas, setCondutasCriticas] = useState('');

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

  const updateControles = (key: keyof ControlesState, val: string) =>
    setControles(prev => ({ ...prev, [key]: val }));

  const updateSaidas = (key: keyof SaidasState, val: string) =>
    setSaidas(prev => ({ ...prev, [key]: val }));

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
        const items: DiagItem[] = (diagRes.data || []).map((d: any) => ({
          opcao_id: d.opcao_id,
          label: opts[d.opcao_id]?.label ?? '—',
          texto_digitado: d.texto_digitado,
          status: d.status,
          tipo: qTipo[opts[d.opcao_id]?.pergunta_id] ?? 'principal',
          created_at: d.created_at,
          resolved_at: d.resolved_at,
        }));
        setDiagItems(items);
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
          .select('id, data_referencia, vo_ml_kg_h, hv_npt_ml_kg_h, medicacoes_ml_kg_h, tht_ml_kg_h')
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
    if (!patientId) { setExamesImagemList([]); setPareceresList([]); return; }
    const fetchPropedeutica = async () => {
      try {
        const [imgRes, parRes] = await Promise.all([
          supabase
            .from('exames_imagem_pacientes')
            .select('id, exame, categoria, data_exame, sistema, resultado, observacao')
            .eq('paciente_id', patientId)
            .is('archived_at', null),
          supabase
            .from('pareceres_pacientes')
            .select('id, especialista, data_parecer, parecer')
            .eq('paciente_id', patientId)
            .is('archived_at', null),
        ]);
        setExamesImagemList((imgRes.data ?? []) as PropedeuticaExameImagem[]);
        setPareceresList((parRes.data ?? []) as PropedeuticaParecer[]);
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
          .select('id, alerta_descricao, sistemas, responsavel, status, created_at, hora_selecionada')
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
        })));
      } catch (e) {
        console.error('Erro ao carregar alertas:', e);
      } finally {
        setAlertasLoading(false);
      }
    };
    fetchAlertas();
  }, [patientId]);

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
    add(sep);
    add(`PACIENTE: ${p.name}`);
    add(`LEITO: ${p.bedNumber}`);
    add(`IDADE: ${p.dob ? formatAge(p.dob) : '—'} | SEXO: ${p.sexo === 'Masculino' || p.sexo === 'M' ? 'Masculino' : p.sexo === 'Feminino' || p.sexo === 'F' ? 'Feminino' : p.sexo ?? 'Não informado'}`);
    if (p.motherName) add(`MÃE: ${p.motherName}`);
    add(`PESO: ${p.peso ? `${p.peso} kg` : '—'} | SC: ${p.sc ? `${p.sc} m²` : '—'}`);
    add(`INTERNAÇÃO: ${p.admissionDate ? `${formatDateToBRL(p.admissionDate)} · ${calcDays(p.admissionDate)} dia(s)` : '—'}`);
    add(sep);

    if (p.status) {
      const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG];
      if (cfg) add(`STATUS: ${cfg.label}`);
    }
    if (p.comorbidade) {
      add(`COMORBIDADES: ${p.comorbidade.split('|').filter(c => c.trim()).join(', ')}`);
    }
    const precAtivas = (p.precautions ?? []).filter(pr => !pr.isArchived && !pr.data_fim);
    if (precAtivas.length > 0) {
      add(`PRECAUÇÕES: ${precAtivas.map(pr => PREC_BADGE[pr.tipo_precaucao]?.label ?? pr.tipo_precaucao).join(', ')}`);
    }

    const principais = diagItems.filter(d => d.tipo === 'principal');
    if (principais.length > 0) {
      title('5. DIAGNÓSTICOS PRINCIPAIS');
      principais.forEach(d => {
        const lbl = d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label;
        const det = d.label !== 'Outros' && d.texto_digitado ? ` (${d.texto_digitado})` : '';
        add(`• ${lbl}${det} — ${d.status === 'resolvido' ? 'Resolvido' : 'Não resolvido'}`);
      });
    }

    const secundarios = diagItems.filter(d => d.tipo === 'secundario');
    if (secundarios.length > 0) {
      title('6. DIAGNÓSTICOS SECUNDÁRIOS');
      secundarios.forEach(d => {
        const lbl = d.label === 'Outros' && d.texto_digitado ? d.texto_digitado : d.label;
        const det = d.label !== 'Outros' && d.texto_digitado ? ` (${d.texto_digitado})` : '';
        add(`• ${lbl}${det} — ${d.status === 'resolvido' ? 'Resolvido' : 'Não resolvido'}`);
      });
    }

    if (bhBalance) {
      title('8. BH DIÁRIO');
      const pct = bhBalance.volume / (bhBalance.peso * 10);
      add(`${pct.toFixed(2)}% — ${bhBalance.volume > 0 ? 'Ganho' : 'Perda'}`);
      add(`Peso: ${bhBalance.peso} kg | Volume: ${bhBalance.volume > 0 ? '+' : ''}${bhBalance.volume} mL`);
    }

    if (bhCumul && bhCumul.registros_ultimas_24h > 0) {
      title('9. BH CUMULATIVO');
      add(`Total: ${bhCumul.bh_cumulativo_total > 0 ? '+' : ''}${bhCumul.bh_cumulativo_total.toFixed(2)}%`);
      add(`Anterior: ${bhCumul.bh_historico_antigo.toFixed(2)}% | Últimas 24h: ${bhCumul.bh_ultimas_24h.toFixed(2)}%`);
    }

    if (diureseRec) {
      title('10. DIURESE');
      add(`${((diureseRec.volume / diureseRec.horas) / diureseRec.peso).toFixed(2)} mL/kg/h`);
      add(`Peso: ${diureseRec.peso} kg | Volume: ${diureseRec.volume} mL | ${diureseRec.horas}h`);
    }

    if (aportesList.length > 0) {
      title('11. APORTES');
      aportesList.forEach(a => {
        add(`${new Date(a.data_referencia + 'T12:00:00').toLocaleDateString('pt-BR')}: VO ${a.vo_ml_kg_h.toFixed(3)} | HV/NPT ${a.hv_npt_ml_kg_h.toFixed(3)} | MED ${a.medicacoes_ml_kg_h.toFixed(3)} | THT ${a.tht_ml_kg_h.toFixed(3)} mL/kg/h`);
      });
    }

    if (situacaoRec) {
      title('12. SITUAÇÃO CLÍNICA');
      add(situacaoRec.situacao_texto);
    }

    if (Object.values(exameFisico).some(v => v.trim())) {
      title('13. EXAME FÍSICO');
      EXAME_SECTIONS.forEach(s => {
        const val = exameFisico[s.key as keyof ExameFisicoState];
        if (val?.trim()) add(`${s.label}: ${val}`);
      });
    }

    const apLines: string[] = [];
    AVALIACAO_SECTIONS.forEach(sec => {
      const sistemas = SECTION_SISTEMAS[sec.id] ?? [];
      const meds = (p.medications ?? []).filter(m => !m.isArchived && m.sistema && sistemas.includes(m.sistema));
      const exs  = (p.exams ?? []).filter(e => !e.isArchived && e.sistema && sistemas.includes(e.sistema));
      const imgs = examesImagemList.filter(ei => ei.sistema && sistemas.includes(ei.sistema));
      const pars = pareceresList.filter(par => (ESPECIALISTA_TO_SISTEMAS[par.especialista] ?? []).some(s => sistemas.includes(s)));
      const alts = alertasList.filter(a => sistemas.length > 0 && a.sistemas.some(s => sistemas.includes(s)));
      if (meds.length + exs.length + imgs.length + pars.length + alts.length === 0) return;
      apLines.push('');
      apLines.push(sec.label);
      if (meds.length) apLines.push(`  Medicações: ${meds.map(m => `${m.name}${m.dosage ? ` (${m.dosage})` : ''}`).join(', ')}`);
      if (exs.length)  apLines.push(`  Exames: ${exs.map(e => `${e.name} — ${e.result}`).join(', ')}`);
      if (imgs.length) apLines.push(`  Imagem: ${imgs.map(i => `${i.exame}${i.resultado ? ` — ${i.resultado}` : ''}`).join(', ')}`);
      pars.forEach(par => apLines.push(`  Parecer (${par.especialista}): ${par.parecer ?? '—'}`));
      if (alts.length) apLines.push(`  Alertas: ${alts.map(a => `${a.alerta_descricao} [${a.status}]`).join(' | ')}`);
    });
    if (apLines.length > 0) {
      title('14. AP — AVALIAÇÃO x PROPEDÊUTICA');
      apLines.forEach(l => add(l));
    }

    if (condutasCriticas.trim()) {
      title('15. CONDUTAS CRÍTICAS');
      add(condutasCriticas);
    }

    blank();
    add(sep);
    add(`Gerado em: ${new Date().toLocaleString('pt-BR')} | RoundKids`);
    return lines.join('\n');
  };

  const handleDownloadTxt = () => {
    const content = buildTextContent();
    const blob = new Blob(['﻿' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolucao_${selectedPatient!.name.replace(/\s+/g, '_')}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    const content = buildTextContent();
    const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Evolução Diária</title>
<style>body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.6;}pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:11pt;}</style>
</head><body><pre>${escaped}</pre></body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolucao_${selectedPatient!.name.replace(/\s+/g, '_')}_${date}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            onClick={handleDownloadTxt}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Baixar TXT
          </button>
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
                    {d.created_at && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Registrado em {new Date(d.created_at).toLocaleDateString('pt-BR')}
                      </p>
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
                    {d.created_at && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Registrado em {new Date(d.created_at).toLocaleDateString('pt-BR')}
                      </p>
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
              Peso: {diureseRec.peso}kg | Volume: {diureseRec.volume}mL | {diureseRec.horas}h
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

      {/* 12. S — Situação Clínica */}
      <Section title="12. S — Situação Clínica" id="situacao" open={openSections.has('situacao')} onToggle={() => toggle('situacao')}>
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
      <Section title="13. O — Exame Físico" id="exameFisico" open={openSections.has('exameFisico')} onToggle={() => toggle('exameFisico')}>
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
      <Section title="14. AP — Avaliação x Propedêutica (Alertas)" id="avaliacoes" open={openSections.has('avaliacoes')} onToggle={() => toggle('avaliacoes')}>
        {alertasLoading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
        ) : (
          <div className="space-y-2">
            {AVALIACAO_SECTIONS.map(sec => {
              const sistemas = SECTION_SISTEMAS[sec.id] ?? [];

              const secMedicacoes = (selectedPatient?.medications ?? [])
                .filter(m => !m.isArchived && m.sistema && sistemas.includes(m.sistema));
              const secExames = (selectedPatient?.exams ?? [])
                .filter(e => !e.isArchived && e.sistema && sistemas.includes(e.sistema));
              const secExamesImagem = examesImagemList
                .filter(ei => ei.sistema && sistemas.includes(ei.sistema));
              const secPareceres = pareceresList
                .filter(p => (ESPECIALISTA_TO_SISTEMAS[p.especialista] ?? []).some(s => sistemas.includes(s)));
              const secAlertas = alertasList.filter(a =>
                sistemas.length > 0 && a.sistemas.some(s => sistemas.includes(s))
              );

              const total = secMedicacoes.length + secExames.length + secExamesImagem.length + secPareceres.length + secAlertas.length;
              if (total === 0) return null;

              return (
                <SubSection
                  key={sec.id}
                  title={`${sec.label} (${total})`}
                  open={openAvaliacoes.has(sec.id)}
                  onToggle={() => toggleAv(sec.id)}
                >
                  <div className="space-y-3">

                    {secMedicacoes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1.5">Medicações</p>
                        <div className="space-y-1">
                          {secMedicacoes.map(m => (
                            <div key={m.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.name}</p>
                              {m.dosage && <p className="text-xs text-slate-500 dark:text-slate-400">{m.dosage}</p>}
                              <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(m.startDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {secExames.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1.5">Exames</p>
                        <div className="space-y-1">
                          {secExames.map(e => (
                            <div key={e.id} className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{e.name}</p>
                                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                  e.result === 'Alterado'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                    : e.result === 'Normal'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                }`}>{e.result}</span>
                              </div>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(e.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {secExamesImagem.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1.5">Exames de Imagem</p>
                        <div className="space-y-1">
                          {secExamesImagem.map(ei => (
                            <div key={ei.id} className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ei.exame}</p>
                              {ei.resultado && <p className="text-xs text-slate-500 dark:text-slate-400">{ei.resultado}</p>}
                              <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(ei.data_exame).toLocaleDateString('pt-BR')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {secPareceres.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-1.5">Pareceres</p>
                        <div className="space-y-1">
                          {secPareceres.map(p => (
                            <div key={p.id} className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.especialista}</p>
                              {p.parecer && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.parecer}</p>}
                              <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(p.data_parecer).toLocaleDateString('pt-BR')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {secAlertas.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1.5">Alertas</p>
                        <div className="space-y-2">
                          {secAlertas.map(a => {
                            const isPendente = a.status === 'Pendente';
                            return (
                              <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-slate-700 dark:text-slate-200 flex-1">{a.alerta_descricao}</p>
                                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                    isPendente
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                      : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                  }`}>
                                    {a.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(a.created_at).toLocaleDateString('pt-BR')}</p>
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
      <Section title="15. Condutas Críticas — Próximas 24h" id="condutasCriticas" open={openSections.has('condutasCriticas')} onToggle={() => toggle('condutasCriticas')}>
        <Field label="Condutas Críticas" value={condutasCriticas} onChange={setCondutasCriticas} rows={6} placeholder="Liste as condutas críticas para as próximas 24 horas..." />
      </Section>

    </div>
  );
};
