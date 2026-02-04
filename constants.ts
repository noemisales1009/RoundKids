
import React from 'react';
import { Patient, Category, Question, Device, Exam, Medication, Alert, Task, User, SurgicalProcedure } from './types';
import { 
    AppleIcon, 
    DropletIcon,
    HeartPulseIcon,
    BeakerIcon,
    LiverIcon,
    LungsIcon,
    DumbbellIcon,
    BrainIcon,
    PillIcon,
    ShieldIcon,
    UsersIcon,
    HomeIcon,
    ScalpelIcon,
    UserIcon
} from './components/icons';

// Map string names from Database to React Components
export const ICON_MAP: Record<string, React.FC<{className?: string}>> = {
    'AppleIcon': AppleIcon,
    'DropletIcon': DropletIcon,
    'HeartPulseIcon': HeartPulseIcon,
    'BeakerIcon': BeakerIcon,
    'LiverIcon': LiverIcon,
    'LungsIcon': LungsIcon,
    'DumbbellIcon': DumbbellIcon,
    'BrainIcon': BrainIcon,
    'PillIcon': PillIcon,
    'ShieldIcon': ShieldIcon,
    'UsersIcon': UsersIcon,
    'HomeIcon': HomeIcon,
    'ScalpelIcon': ScalpelIcon,
    'UserIcon': UserIcon
};

// Remove static sample data - load from database instead

export const DEVICE_TYPES: string[] = [
    'AVP1', 'AVP2', 'CNAF', 'CURATIVO À VÁCUO', 'CVC 1', 'CVC 2', 'CATETER DE SHILLY',
    'CATETER DE TENCKHOFF', 'DRENO TORÁXICO D', 'DRENO TORÁXICO E', 'DVE', 'GTT',
    'OUTROS DRENOS', 'PICC1', 'PICC2', 'SNE', 'SNG', 'SVD', 'TOT', 'VENTURY', 'VNI', 'VPM',
] as const;

export const DEVICE_LOCATIONS: string[] = [
    'ABDOME', 'CABEÇA', 'FACE', 'HTD', 'HTE', 'LOCAIS', 'MÃO D', 'MÃO E', 'MID', 'MIE',
    'MSD', 'MSE', 'NASAL', 'ORAL', 'PÉ D', 'PÉ E', 'PERÍNEO', 'REGIÃO LOMBAR', 'TRAQUÉIA',
    'TRONCO', 'VBD', 'VBE', 'VFD', 'VFE', 'VJID', 'VJIE', 'VJED', 'VJEE', 'VSD', 'VSE',
] as const;

export const EXAM_STATUSES: Array<'Pendente' | 'Normal' | 'Alterado'> = ['Pendente', 'Normal', 'Alterado'] as const;

export const MEDICATION_LIST: string[] = [
    // Vasoativos
    'Epinefrina',
    'Noraepinefrina',
    'Milrinona',
    'Dobutamina',
    'Vasopressina',
    'Nipride',
    // Sedativos e Analgésicos
    'Midazolam',
    'Fentanyl (Fentanila)',
    'Morfina',
    'Precedex (Dexmedetomidina)',
    'Propofol',
    'Clonidina',
    'Cetamina',
    'Tiopental',
    'Lorazepam',
    'Metadona',
    'Diazepam',
    // Anticonvulsivantes
    'Fenitoína',
    'Fenobarbital',
    'Topiramato',
    'Levetiracetam',
    'Ácido Valproico',
    'Oxcarbazepina',
    // Diuréticos e Eletrólitos
    'Furosemida',
    'Hidroclorotiazida',
    'Omeprazol',
    'Espironolactona',
    'Acetazolamida',
    'Bicarbonato de Sódio',
    'Correção de Potássio',
    // Corticoides
    'Hidrocortisona',
    'Metilprednisolona',
    'Dexametasona',
    // Broncodilatadores
    'Salbutamol injetável',
    'Salbutamol spray',
    'Clenil Spray',
    'Terbutalina EV',
    // Outros
    'Octreotida',
    'N-Acetilcisteína',
    'Vitamina K',
    // Hemoderivados
    'Complexo Protrombínico',
    'Plasma Fresco',
    'Concentrado de Hemácias',
    'Plaquetas',
    'Crioprecipitado',
    // Antibióticos
    'Tazocin',
    'Oxacilina',
    'Cefepime',
    'Linezolida',
    'Ampicilina',
    'Cefalotina',
    'Sulfametoxazol + TMP',
    'Ciprofloxacino',
    'Levofloxacino',
    'Anfotericina L',
    'Meropenem',
    'Polimixina B',
    'Amicacina',
    'Ceftriaxone',
    'Teicoplanina',
    'Vancomicina',
    'Cefazolina',
    'Metronidazol',
    'Gentamicina',
    'Tigeciclina',
    'Torgena',
    'Aztreonam',
    // Antifúngicos
    'Anfotericina B',
    'Fluconazol',
    'Micafungina',
    // Insulinas
    'Insulina Regular',
    'Insulina NPH',
    'Outro'
] as const;

export const MEDICATION_DOSAGE_UNITS: string[] = [
    'mg/dia', 'mg/h', 'mg/kg/dia', 'mg/kg/h', 'mg/kg/min', 'mg/ml', 'UI/dia', 'UI/h',
    'UI/kg/dia', 'UI/kg/h', 'UI/kg/min', 'UI/ml', 'ug/dia', 'ug/h', 'ug/kg/dia',
    'ug/kg/h', 'ug/kg/min', 'ug/ml'
] as const;

// Alert Categories for Dashboard
export const ALERT_CATEGORIES: string[] = [
    'Sistema Nutricional',
    'Hídrico',
    'Hemodinâmico/Infecção',
    'Hematológico',
    'Hepático',
    'Cirúrgico',
    'Neurológico',
    'Respiratório/Fisioterapia',
    'Terapia Ocupacional',
    'Gerenciamento de Risco',
    'Farmácia',
    'Família',
    'Avaliação de Alta',
    'Geral'
];

// DEPRECATED: Load from database instead. Kept for backward compatibility.
export const PATIENTS: Patient[] = [];

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Sistema Nutricional', icon: AppleIcon },
  { id: 2, name: 'Hídrico', icon: DropletIcon },
  { id: 3, name: 'Hemodinâmico', icon: HeartPulseIcon },
  { id: 4, name: 'Hematológico', icon: BeakerIcon },
  { id: 5, name: 'Hepático', icon: LiverIcon },
  { id: 6, name: 'Respiratório', icon: LungsIcon },
  { id: 7, name: 'Fisioterapia', icon: DumbbellIcon },
  { id: 8, name: 'Neurológico', icon: BrainIcon },
  { id: 9, name: 'Farmácia', icon: PillIcon },
  { id: 10, name: 'Gerenciamento de Risco', icon: ShieldIcon },
  { id: 11, name: 'Família', icon: UsersIcon },
  { id: 12, name: 'Avaliação de Alta', icon: HomeIcon },
  { id: 13, name: 'Cirúrgico', icon: ScalpelIcon },
  { id: 14, name: 'Terapia Ocupacional (TO)', icon: UserIcon },
];

export const QUESTIONS: Question[] = [
  // --- SISTEMA NUTRICIONAL (10 PERGUNTAS) ---
  {
    id: 1,
    categoryId: 1,
    text: 'NUTRIÇÃO ADEQUADA? (INICIAR ORAL/ENTERAL/NPT)',
    alertOptions: [
      { id: 'get', label: 'GET', hasInput: true, inputPlaceholder: 'Valor...' },
      { id: 'pnt', label: 'PNT', hasInput: true, inputPlaceholder: 'Valor...' },
      { id: 'ge_atual', label: 'GE ATUAL', hasInput: true, inputPlaceholder: 'Valor...' },
      { id: 'pn_atual', label: 'PN ATUAL', hasInput: true, inputPlaceholder: 'Valor...' }
    ]
  },
  {
    id: 2,
    categoryId: 1,
    text: 'TOLERÂNCIA À ALIMENTAÇÃO (VOMITO,DISTENSÃO)?',
    alertOptions: [
      { id: 'sng', label: 'NECESSIDADE DE DESCOMPRESSÃO GÁSTRICA- SNG' },
      { id: 'reduzir_vol', label: 'REDUZIR VOLUME DA DIETA' },
      { id: 'rx_abdome', label: 'RX DE ABDOME' },
      { id: 'procinetico', label: 'INICIAR PROCINÉTICO' },
      { id: 'outras', label: 'OUTRAS', hasInput: true, inputPlaceholder: 'Descreva...' }
    ]
  },
  {
    id: 3,
    categoryId: 1,
    text: 'RELATA DIARRÉIA OU CONSTIPAÇÃO?',
    alertOptions: [
      { id: 'constipante', label: 'DIETA CONSTIPANTE' },
      { id: 'laxante', label: 'DIETA LAXANTE' },
      { id: 'vazao', label: 'ALTERAR VAZÃO DA DIETA', hasInput: true, inputPlaceholder: 'Nova vazão...' },
      { id: 'formula', label: 'TROCAR FÓRMULA', hasInput: true, inputPlaceholder: 'Qual fórmula?' }
    ]
  },
  {
    id: 4,
    categoryId: 1,
    text: 'GLICEMIA CONTROLADA? (DX>60<150/180 mg/dl)',
    alertOptions: [
      { id: 'susp_glicose', label: 'SUSPENDER APORTE DE GLICOSE' },
      { id: 'rep_volemica', label: 'RESPOSIÇÃO VOLÊMICA' },
      { id: 'insulina', label: 'INSULINOTERAPIA' },
      { id: 'bolus', label: 'BOLUS DE GLICOSE' },
      { id: 'tig', label: 'AUMENTAR TIG' },
      { id: 'hidrocort', label: 'HIDROCORTISONA' }
    ]
  },
  {
    id: 5,
    categoryId: 1,
    text: 'NECESSIDADE DE PROFILAXIA PARA LAMG?',
    alertOptions: [
      { id: 'manter', label: 'MANTER' },
      { id: 'aumentar', label: 'AUMENTAR 3,3MG/KG/DIA' },
      { id: 'ic', label: 'PASSAR PARA IC' },
      { id: 'suspender', label: 'SUSPENDER' }
    ]
  },
  {
    id: 6,
    categoryId: 1,
    text: 'NECESSIDADE DE CONTROLE RG?',
    alertOptions: [
      { id: 'repor', label: 'REPOR RG' },
      { id: 'bbp', label: 'AJUSTAR DOSE DE BBP' },
      { id: 'susp_dieta', label: 'SUSPENDER DIETA' },
      { id: 'imagem', label: 'EXAME DE IMAGEM', hasInput: true, inputPlaceholder: 'Qual exame?' }
    ]
  },
  {
    id: 7,
    categoryId: 1,
    text: 'FIXAÇÃO DE SNG/SNE OK?',
    alertOptions: [
      { id: 'pincel', label: 'MARCAR COM PINCEL' }
    ]
  },
  {
    id: 8,
    categoryId: 1,
    text: 'NECESSIDADE DE RX DE ABDOMEN (POSIÇÃO)?',
    alertOptions: [
      { id: 'rx', label: 'RX DE ABDOME' }
    ]
  },
  {
    id: 9,
    categoryId: 1,
    text: 'NECESSIDADE DE ACOMPANHAMENTO FONOAUDIÓLOGA?',
    alertOptions: [
      { id: 'fono', label: 'FONO', hasInput: true, inputPlaceholder: 'Observação...' },
      { id: 'video', label: 'REALIZAR VIDEODEGLUTOGRAMA' },
      { id: 'eda', label: 'REALIZAR EDA' }
    ]
  },
  {
    id: 10,
    categoryId: 1,
    text: 'POSSIBILIDADE DE RETIRADA DE SNE?',
    alertOptions: [
      { id: 'retirar', label: 'RETIRAR SNE' }
    ]
  },
  
  // --- SISTEMA HÍDRICO ---
  {
    id: 11,
    categoryId: 2,
    text: 'HÁ SINAIS DE SOBRECARGA HÍDRICA OU DESIDRATAÇÃO?',
    alertOptions: [
      { id: 'bh_diario', label: 'CALCULAR BH DIÁRIO' },
      { id: 'bh_cumulativo', label: 'CALCULAR BH CUMULATIVO' },
      { id: 'restricao', label: 'INICIAR RESTRIÇÃO HÍDRICA' },
      { id: 'susp_hv', label: 'SUSPENDER H.V' }
    ]
  }
];

// DEPRECATED: Load from database instead
export const ALERTS: Alert[] = [];
export const TASKS: Task[] = [];

export const RESPONSIBLES: string[] = [
    'Médico', 
    'Enfermeiro', 
    'Fisioterapeuta', 
    'Farmacêutico', 
    'Nutricionista',
    'Odontólogo', 
    'Médico / Enfermeiro', 
    'Médico / Fisioterapeuta'
] as const;

// Lazy generate alert deadlines
let cachedAlertDeadlines: string[] | null = null;
export const getAlertDeadlines = (): string[] => {
    if (!cachedAlertDeadlines) {
        cachedAlertDeadlines = Array.from({ length: 24 }, (_, i) => 
            `${i + 1} hora${i === 0 ? '' : 's'}`
        );
    }
    return cachedAlertDeadlines;
};

// Keep backward compatibility
export const ALERT_DEADLINES: string[] = [
    '1 hora', '2 horas', '3 horas', '4 horas', '5 horas', '6 horas',
    '7 horas', '8 horas', '9 horas', '10 horas', '11 horas', '12 horas',
    '13 horas', '14 horas', '15 horas', '16 horas', '17 horas', '18 horas',
    '19 horas', '20 horas', '21 horas', '22 horas', '23 horas', '24 horas'
] as const;

export const INITIAL_USER: User = {
    name: 'Noemi',
    title: 'Médica',
    avatarUrl: 'https://i.pravatar.cc/150?u=noemi',
};

// ========== DATE FORMATTING UTILITIES ==========
/**
 * Formata uma data string no formato DD/MM/AAAA
 * @param dateString - Data em formato "YYYY-MM-DD" ou ISO String
 * @returns Data formatada em DD/MM/AAAA ou string vazia se inválida
 */
export const formatDateToBRL = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    
    try {
        // Se for apenas data (YYYY-MM-DD), parse diretamente
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        
        // Se tiver horário, cria a data de forma segura
        const normalizedDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(normalizedDate);
        
        // Verifica se a data é válida
        if (isNaN(date.getTime())) return '';
        
        // Formata em DD/MM/AAAA
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return '';
    }
};

/**
 * Formata uma data com dia, mês por extenso e ano
 * Exemplo: "10 de dezembro de 2025"
 * @param dateString - Data em formato "YYYY-MM-DD" ou ISO String
 * @returns Data formatada ou string vazia se inválida
 */
export const formatDateToLongBRL = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    
    try {
        const normalizedDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
        const date = new Date(normalizedDate);
        
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return '';
    }
};

/**
 * Formata data com hora no formato DD/MM/AAAA HH:mm
 * @param dateString - Data em formato ISO String
 * @returns Data e hora formatadas
 */
export const formatDateTimeWithHour = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) return '';
        
        const datePart = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const timePart = date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `${datePart} ${timePart}`;
    } catch {
        return '';
    }
};

/**
 * Calcula o número de dias entre uma data inicial e hoje
 * @param startDateString - Data de início em formato "YYYY-MM-DD"
 * @returns Número de dias ou -1 se inválido
 */
export const calculateDaysSinceDate = (startDateString: string | undefined | null): number => {
    if (!startDateString) return -1;
    
    try {
        const normalizedDate = startDateString.includes('T') ? startDateString : `${startDateString}T00:00:00`;
        const startDate = new Date(normalizedDate);
        const today = new Date();
        
        if (isNaN(startDate.getTime())) return -1;
        
        // Zera as horas para comparação apenas de data
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    } catch {
        return -1;
    }
};

// Helper function to get today's date as string (YYYY-MM-DD)
export const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


/**
 * Busca o label de uma opção de diagnóstico a partir do id da pergunta e do id da opção
 * @param questionId - id da pergunta
 * @param optionId - id da opção (string)
 * @returns label da opção ou o próprio id se não encontrar
 */
export function getDiagnosisOptionLabel(questionId: number, optionId: string): string {
  const question = QUESTIONS.find(q => q.id === questionId);
  if (!question) return optionId;
  const option = question.alertOptions.find(opt => opt.id === optionId);
  return option ? option.label : optionId;
}
