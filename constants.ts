
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

// Sample data for the new fields for Patient 1 (Leandro)
const devices1: Device[] = [
  { id: 1, name: 'CVC 1', location: 'VJID', startDate: '2025-11-10' },
  { id: 2, name: 'SNE', location: 'Nasal', startDate: '2025-11-11' },
];

const exams1: Exam[] = [
  { id: 1, name: 'Hemograma completo', date: '2025-11-11', result: 'Pendente', observation: 'Aguardando resultado laboratorial.' },
];

const medications1: Medication[] = [
  { id: 1, name: 'Dipirona', dosage: '500mg 6/6h', startDate: '2025-11-10' },
  { id: 2, name: 'Amoxicilina', dosage: '250mg 8/8h', startDate: '2025-11-11' },
];

const surgicalProcedures1: SurgicalProcedure[] = [
  { id: 1, name: 'Apendicectomia', date: '2025-11-05', surgeon: 'Dr. House', notes: 'Procedimento ocorreu sem intercorrências.' },
];

export const DEVICE_TYPES: string[] = [
    'AVP1',
    'AVP2',
    'CNAF',
    'CURATIVO À VÁCUO',
    'CVC 1',
    'CVC 2',
    'DRENO TORÁXICO D',
    'DRENO TORÁXICO E',
    'DVE',
    'GTT',
    'OUTROS DRENOS',
    'PICC1',
    'PICC2',
    'SNE',
    'SNG',
    'SVD',
    'TOT',
    'VENTURY',
    'VNI',
    'VPM',
];
export const DEVICE_LOCATIONS: string[] = [
    'ABDOME',
    'CABEÇA',
    'FACE',
    'HTD',
    'HTE',
    'LOCAIS',
    'MÃO D',
    'MÃO E',
    'MID',
    'MIE',
    'MSD',
    'MSE',
    'NASAL',
    'ORAL',
    'PÉ D',
    'PÉ E',
    'PERÍNEO',
    'REGIÃO LOMBAR',
    'TRAQUÉIA',
    'TRONCO',
    'VFD',
    'VFE',
    'VJID',
    'VJIE',
    'VSD',
    'VSE',
];
export const EXAM_STATUSES: Array<'Pendente' | 'Normal' | 'Alterado'> = ['Pendente', 'Normal', 'Alterado'];

export const MEDICATION_DOSAGE_UNITS: string[] = [
    'mg/dia',
    'mg/h',
    'mg/kg/dia',
    'mg/kg/h',
    'mg/kg/min',
    'mg/ml',
    'UI/dia',
    'UI/h',
    'UI/kg/dia',
    'UI/kg/h',
    'UI/kg/min',
    'UI/ml',
    'ug/dia',
    'ug/h',
    'ug/kg/dia',
    'ug/kg/h',
    'ug/kg/min',
    'ug/ml'
];

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

// Updated Patient List based on the provided screenshot
export const PATIENTS: Patient[] = [
  { id: 1, name: 'LEANDRO SOUSA SOARES', bedNumber: 115, motherName: '-', dob: '2025-05-11', ctd: 'Estável', devices: devices1, exams: exams1, medications: medications1, surgicalProcedures: surgicalProcedures1, scaleScores: [], cultures: [] },
  { id: 2, name: 'MARIA MAITE DA SILVA DE SOUSA', bedNumber: 110, motherName: '-', dob: '2025-10-03', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 3, name: 'SOPHIA SOUSA ALVES', bedNumber: 104, motherName: '-', dob: '2014-01-31', ctd: 'Observação', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 4, name: 'ARTHUR CARVALHO MOURA', bedNumber: 112, motherName: '-', dob: '2017-04-16', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 5, name: 'AVILA MANUELLE NASCIMENTO BRASIL', bedNumber: 4, motherName: '-', dob: '2025-09-18', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 6, name: 'AYLA VALENTINA ALMEIDA BRITO', bedNumber: 98, motherName: '-', dob: '2017-01-26', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 7, name: 'GABRIEL RAVICK LIMEIRA GOMES', bedNumber: 108, motherName: '-', dob: '2016-02-11', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 8, name: 'DAVI EVANGELISTA DA CRUZ', bedNumber: 102, motherName: 'Orcilene Barros', dob: '2019-03-12', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 9, name: 'ELIAS DOS SANTOS SILVA LIMA', bedNumber: 101, motherName: '-', dob: '2024-10-03', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 10, name: 'CARLOS DANIEL COSTA FERREIRA', bedNumber: 45, motherName: '-', dob: '2018-05-06', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 11, name: 'JOSE ALEF SOUSA VILANTE FIALHO', bedNumber: 105, motherName: '-', dob: '2023-10-20', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 12, name: 'NICOLAS EMANUEL BRITO BEZERRA', bedNumber: 113, motherName: '-', dob: '2017-01-31', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 13, name: 'VITORIA DOS MILAGRES SOUSA', bedNumber: 100, motherName: '-', dob: '2020-10-12', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 14, name: 'PABLO GAEL SILVA SANTOS', bedNumber: 106, motherName: '-', dob: '2025-07-18', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 15, name: 'ANNALICY DE MIRANDA OLIVEIRA DA', bedNumber: 107, motherName: '-', dob: '2015-10-06', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 16, name: 'NATANAEL RIKELMY DE AGUIAR LIMA', bedNumber: 99, motherName: 'Francisca da Costa', dob: '2012-06-20', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 17, name: 'MAYLLA LAVINIA SILVA CANTANHEDE', bedNumber: 103, motherName: 'Maria Clara', dob: '2025-08-15', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 18, name: 'DAVILLA HELOYSA CHAVES PEREIRA', bedNumber: 109, motherName: '-', dob: '2020-12-01', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 19, name: 'CAIO EDUARDO DOS SANTOS CAMPOS', bedNumber: 3, motherName: 'Ana paula', dob: '2024-03-09', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 20, name: 'DAVI LUIZ SILVA BRITO', bedNumber: 111, motherName: '-', dob: '2025-04-05', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 21, name: 'ABIMAEL MENDES DA CONCEICAO', bedNumber: 46, motherName: 'MARIA FLORISMAR', dob: '2017-01-09', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
  { id: 22, name: 'MARIA HELOISA SOUSA SILVA', bedNumber: 114, motherName: '-', dob: '2022-05-16', ctd: 'Estável', devices: [], exams: [], medications: [], surgicalProcedures: [], scaleScores: [], cultures: [] },
];

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

// Updated Alerts to match new patient list IDs
export const ALERTS: Alert[] = [
    { id: 1, text: "PA instável", categoryId: 3, patientId: 1 },
    { id: 2, text: "Saturação baixa", categoryId: 6, patientId: 16 },
    { id: 3, text: "Pico hipertensivo", categoryId: 3, patientId: 2 },
    { id: 4, text: "Necessidade de ajuste de ventilação", categoryId: 6, patientId: 5 },
    { id: 5, text: "Glicemia alta", categoryId: 1, patientId: 3 },
    { id: 6, text: "Taquicardia", categoryId: 3, patientId: 16 },
    { id: 7, text: "Risco de queda", categoryId: 10, patientId: 1 },
    { id: 8, text: "Interação medicamentosa", categoryId: 9, patientId: 3 },
    { id: 9, text: "Esforço respiratório", categoryId: 6, patientId: 1 },
    { id: 10, text: "Balanço hídrico muito positivo", categoryId: 2, patientId: 2 },
    { id: 11, text: "Hipotensão", categoryId: 3, patientId: 3 },
    { id: 12, text: "Anemia importante", categoryId: 4, patientId: 1 },
];

export const TASKS: Task[] = [
    // Alertas
    ...ALERTS.map((alert, index) => ({
        id: index + 1,
        patientId: alert.patientId,
        categoryId: alert.categoryId,
        description: alert.text,
        responsible: 'Dr. João',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'alerta' as const,
    })),
    // Fora do Prazo
    { id: 13, patientId: 1, categoryId: 1, description: 'Reavaliar necessidade de SNE', responsible: 'Enf. Maria', deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo', justification: 'Aguardando avaliação do nutricionista.' },
    { id: 14, patientId: 16, categoryId: 9, description: 'Checar interação medicamentosa', responsible: 'Farm. Ana', deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 15, patientId: 3, categoryId: 7, description: 'Iniciar fisioterapia motora', responsible: 'Fisio. Carlos', deadline: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 16, patientId: 1, categoryId: 10, description: 'Aplicar escala de Braden', responsible: 'Enf. Maria', deadline: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo', justification: 'Paciente instável hemodinamicamente.' },
    { id: 17, patientId: 16, categoryId: 8, description: 'Avaliação neurológica completa', responsible: 'Dr. João', deadline: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 18, patientId: 3, categoryId: 2, description: 'Ajustar balanço hídrico', responsible: 'Dr. João', deadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 19, patientId: 1, categoryId: 4, description: 'Coletar nova amostra de sangue', responsible: 'Téc. Lúcia', deadline: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    { id: 20, patientId: 16, categoryId: 5, description: 'Solicitar ultrassom hepático', responsible: 'Dr. João', deadline: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), status: 'fora_do_prazo' },
    // No Prazo
    { id: 21, patientId: 3, categoryId: 1, description: 'Monitorar glicemia capilar 4x/dia', responsible: 'Enf. Maria', deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), status: 'no_prazo' },
    { id: 22, patientId: 1, categoryId: 6, description: 'Realizar aspiração de vias aéreas se necessário', responsible: 'Fisio. Carlos', deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), status: 'no_prazo' },
    // Concluídos
    { id: 23, patientId: 16, categoryId: 10, description: 'Avaliar risco de lesão por pressão', responsible: 'Enf. Maria', deadline: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), status: 'concluido' },
];

export const RESPONSIBLES: string[] = [
    'Médico', 
    'Enfermeiro', 
    'Fisioterapeuta', 
    'Farmacêutico', 
    'Nutricionista',
    'Odontólogo', 
    'Médico / Enfermeiro', 
    'Médico / Fisioterapeuta'
];

export const ALERT_DEADLINES: string[] = [
    '1 hora', 
    '2 horas', 
    '3 horas', 
    '4 horas',
    '5 horas',
    '6 horas',
    '7 horas',
    '8 horas',
    '9 horas',
    '10 horas',
    '11 horas',
    '12 horas',
    '13 horas',
    '14 horas',
    '15 horas',
    '16 horas',
    '17 horas',
    '18 horas',
    '19 horas',
    '20 horas',
    '21 horas',
    '22 horas',
    '23 horas',
    '24 horas'
];

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
