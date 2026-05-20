
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
    UserIcon,
    createMaterialIcon
} from './components/icons';

// Map string names from Database to React Components
export const ICON_MAP: Record<string, React.FC<{className?: string}>> = {
    // Legacy SVG icon names
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
    'UserIcon': UserIcon,
    // Material Symbols (nomes vindos do banco)
    'restaurant': createMaterialIcon('restaurant'),
    'water_drop': createMaterialIcon('water_drop'),
    'monitor_heart': createMaterialIcon('monitor_heart'),
    'bloodtype': createMaterialIcon('bloodtype'),
    'science': createMaterialIcon('science'),
    'content_cut': createMaterialIcon('content_cut'),
    'psychology': createMaterialIcon('psychology'),
    'lungs': LungsIcon,
    'accessibility_new': createMaterialIcon('accessibility_new'),
    'warning': createMaterialIcon('warning'),
    'local_pharmacy': createMaterialIcon('local_pharmacy'),
    'family_restroom': createMaterialIcon('family_restroom'),
    'exit_to_app': createMaterialIcon('exit_to_app'),
};

// Remove static sample data - load from database instead

export const DIAGNOSTICO_CATEGORIAS: Record<number, string> = {
  // ── Principal (pergunta_id = 1) ──────────────────────────────────────────
  // Cardiovascular
  4: 'Cardiovascular', 8: 'Cardiovascular', 44: 'Cardiovascular', 49: 'Cardiovascular',
  58: 'Cardiovascular', 67: 'Cardiovascular', 77: 'Cardiovascular', 83: 'Cardiovascular', 84: 'Cardiovascular',
  // Choque / Distributivo
  9: 'Choque / Distributivo', 10: 'Choque / Distributivo', 11: 'Choque / Distributivo',
  12: 'Choque / Distributivo', 13: 'Choque / Distributivo',
  // Gastrointestinal / Hepático
  1: 'Gastrointestinal / Hepático', 2: 'Gastrointestinal / Hepático', 17: 'Gastrointestinal / Hepático',
  20: 'Gastrointestinal / Hepático', 30: 'Gastrointestinal / Hepático', 42: 'Gastrointestinal / Hepático',
  43: 'Gastrointestinal / Hepático', 47: 'Gastrointestinal / Hepático', 50: 'Gastrointestinal / Hepático',
  // Hematológico / Oncológico
  3: 'Hematológico / Oncológico', 14: 'Hematológico / Oncológico', 15: 'Hematológico / Oncológico',
  16: 'Hematológico / Oncológico', 22: 'Hematológico / Oncológico', 59: 'Hematológico / Oncológico',
  72: 'Hematológico / Oncológico', 73: 'Hematológico / Oncológico', 85: 'Hematológico / Oncológico',
  86: 'Hematológico / Oncológico', 87: 'Hematológico / Oncológico',
  // Infeccioso / Séptico
  6: 'Infeccioso / Séptico', 24: 'Infeccioso / Séptico', 40: 'Infeccioso / Séptico',
  46: 'Infeccioso / Séptico', 69: 'Infeccioso / Séptico', 70: 'Infeccioso / Séptico',
  // Metabólico / Endócrino
  7: 'Metabólico / Endócrino', 23: 'Metabólico / Endócrino', 26: 'Metabólico / Endócrino',
  27: 'Metabólico / Endócrino', 28: 'Metabólico / Endócrino', 33: 'Metabólico / Endócrino',
  38: 'Metabólico / Endócrino', 48: 'Metabólico / Endócrino', 71: 'Metabólico / Endócrino',
  78: 'Metabólico / Endócrino', 88: 'Metabólico / Endócrino',
  // Neurológico
  18: 'Neurológico', 21: 'Neurológico', 32: 'Neurológico', 34: 'Neurológico',
  36: 'Neurológico', 37: 'Neurológico', 45: 'Neurológico', 56: 'Neurológico', 57: 'Neurológico',
  // Nutricional / Outros
  25: 'Nutricional / Outros', 39: 'Nutricional / Outros', 54: 'Nutricional / Outros',
  60: 'Nutricional / Outros', 61: 'Nutricional / Outros', 62: 'Nutricional / Outros', 63: 'Nutricional / Outros',
  // Psiquiátrico / Social
  31: 'Psiquiátrico / Social', 35: 'Psiquiátrico / Social', 55: 'Psiquiátrico / Social', 81: 'Psiquiátrico / Social',
  // Renal
  51: 'Renal', 52: 'Renal', 74: 'Renal', 75: 'Renal', 76: 'Renal', 89: 'Renal',
  // Respiratório
  5: 'Respiratório', 29: 'Respiratório', 41: 'Respiratório', 53: 'Respiratório',
  64: 'Respiratório', 79: 'Respiratório', 80: 'Respiratório', 90: 'Respiratório',
  91: 'Respiratório', 92: 'Respiratório', 93: 'Respiratório',
  // Trauma / Cirúrgico
  19: 'Trauma / Cirúrgico', 65: 'Trauma / Cirúrgico', 66: 'Trauma / Cirúrgico',
  68: 'Trauma / Cirúrgico', 82: 'Trauma / Cirúrgico',

  // ── Secundário (pergunta_id = 2) ─────────────────────────────────────────
  // Cardiovascular
  97: 'Cardiovascular', 138: 'Cardiovascular', 178: 'Cardiovascular', 180: 'Cardiovascular',
  // Gastrointestinal / Hepático
  104: 'Gastrointestinal / Hepático', 109: 'Gastrointestinal / Hepático', 120: 'Gastrointestinal / Hepático',
  121: 'Gastrointestinal / Hepático', 124: 'Gastrointestinal / Hepático', 127: 'Gastrointestinal / Hepático',
  131: 'Gastrointestinal / Hepático', 153: 'Gastrointestinal / Hepático', 166: 'Gastrointestinal / Hepático',
  // Hematológico / Oncológico
  96: 'Hematológico / Oncológico', 100: 'Hematológico / Oncológico', 102: 'Hematológico / Oncológico',
  103: 'Hematológico / Oncológico', 158: 'Hematológico / Oncológico',
  // Infeccioso / Séptico
  101: 'Infeccioso / Séptico', 105: 'Infeccioso / Séptico', 108: 'Infeccioso / Séptico',
  130: 'Infeccioso / Séptico', 148: 'Infeccioso / Séptico', 149: 'Infeccioso / Séptico',
  150: 'Infeccioso / Séptico', 157: 'Infeccioso / Séptico', 161: 'Infeccioso / Séptico', 181: 'Infeccioso / Séptico',
  // Metabólico / Endócrino
  94: 'Metabólico / Endócrino', 95: 'Metabólico / Endócrino', 99: 'Metabólico / Endócrino',
  111: 'Metabólico / Endócrino', 115: 'Metabólico / Endócrino', 116: 'Metabólico / Endócrino',
  118: 'Metabólico / Endócrino', 119: 'Metabólico / Endócrino', 123: 'Metabólico / Endócrino',
  126: 'Metabólico / Endócrino', 128: 'Metabólico / Endócrino', 132: 'Metabólico / Endócrino',
  133: 'Metabólico / Endócrino', 134: 'Metabólico / Endócrino', 135: 'Metabólico / Endócrino',
  136: 'Metabólico / Endócrino', 137: 'Metabólico / Endócrino', 139: 'Metabólico / Endócrino',
  140: 'Metabólico / Endócrino', 141: 'Metabólico / Endócrino', 142: 'Metabólico / Endócrino',
  143: 'Metabólico / Endócrino', 144: 'Metabólico / Endócrino', 145: 'Metabólico / Endócrino',
  146: 'Metabólico / Endócrino', 147: 'Metabólico / Endócrino', 151: 'Metabólico / Endócrino',
  152: 'Metabólico / Endócrino', 174: 'Metabólico / Endócrino',
  // Neurológico
  106: 'Neurológico', 110: 'Neurológico', 112: 'Neurológico', 113: 'Neurológico',
  122: 'Neurológico', 169: 'Neurológico', 171: 'Neurológico', 172: 'Neurológico', 173: 'Neurológico',
  // Nutricional / Outros
  117: 'Nutricional / Outros', 125: 'Nutricional / Outros', 159: 'Nutricional / Outros',
  160: 'Nutricional / Outros', 162: 'Nutricional / Outros', 163: 'Nutricional / Outros',
  164: 'Nutricional / Outros', 165: 'Nutricional / Outros',
  // Renal
  154: 'Renal', 155: 'Renal', 175: 'Renal', 176: 'Renal', 177: 'Renal', 179: 'Renal',
  // Respiratório
  98: 'Respiratório', 114: 'Respiratório', 129: 'Respiratório', 156: 'Respiratório',
  167: 'Respiratório', 168: 'Respiratório',
  // Trauma / Cirúrgico
  107: 'Trauma / Cirúrgico', 170: 'Trauma / Cirúrgico',
};

export interface StaticDiagnosticOption {
  pergunta_id: 1 | 2;
  codigo: string;
  label: string;
  categoria: string;
  ordem: number;
  has_input?: boolean;
  input_placeholder?: string;
}

export const STATIC_DIAGNOSTICO_OPTIONS: StaticDiagnosticOption[] = [
  // ── Novos Principal (pergunta_id = 1) ────────────────────────────────────
  { pergunta_id: 1, codigo: 'PRIN_PARDS',       label: 'PARDS',                                 categoria: 'Respiratório',           ordem: 94 },
  { pergunta_id: 1, codigo: 'PRIN_PAV',          label: 'PAV (Pneumonia Associada à Ventilação)', categoria: 'Respiratório',           ordem: 95 },
  { pergunta_id: 1, codigo: 'PRIN_PNEUMO_HOSP',  label: 'Pneumonia Hospitalar',                  categoria: 'Respiratório',           ordem: 96 },
  { pergunta_id: 1, codigo: 'PRIN_BRONCO_DISP',  label: 'Broncodisplasia',                       categoria: 'Respiratório',           ordem: 97 },
  { pergunta_id: 1, codigo: 'PRIN_CORP_VIAS',    label: 'Corpo Estranho em Vias Aéreas',         categoria: 'Respiratório',           ordem: 98 },
  { pergunta_id: 1, codigo: 'PRIN_FALHA_EXT',    label: 'Falha de Extubação',                    categoria: 'Respiratório',           ordem: 99 },
  { pergunta_id: 1, codigo: 'PRIN_PNEUMO_VIR',   label: 'Pneumonia Viral',                       categoria: 'Respiratório',           ordem: 100 },
  { pergunta_id: 1, codigo: 'PRIN_OUTROS_CHOQUE', label: 'Outros choques',                        categoria: 'Choque / Distributivo',  ordem: 101, has_input: true, input_placeholder: 'Especifique o tipo de choque' },
  { pergunta_id: 1, codigo: 'PRIN_BRADIARR',     label: 'Bradicarritmias',                       categoria: 'Cardiovascular',         ordem: 102 },
  { pergunta_id: 1, codigo: 'PRIN_TAQUIARR',     label: 'Taquiarritmias',                        categoria: 'Cardiovascular',         ordem: 102 },
  { pergunta_id: 1, codigo: 'PRIN_PCR_ASSIST',   label: 'PCR – Assistolia',                      categoria: 'Cardiovascular',         ordem: 103 },
  { pergunta_id: 1, codigo: 'PRIN_PCR_AESP',     label: 'PCR – AESP',                            categoria: 'Cardiovascular',         ordem: 104 },
  { pergunta_id: 1, codigo: 'PRIN_PCR_FA',       label: 'PCR – FA (Fibrilação Atrial)',          categoria: 'Cardiovascular',         ordem: 105 },
  { pergunta_id: 1, codigo: 'PRIN_PCR_TV',       label: 'PCR – TV (Taquicardia Ventricular)',    categoria: 'Cardiovascular',         ordem: 106 },
  { pergunta_id: 1, codigo: 'PRIN_DELIRIUM',     label: 'Delírium',                              categoria: 'Neurológico',            ordem: 107 },
  { pergunta_id: 1, codigo: 'PRIN_DIAB_CEN2',    label: 'Diabetes Insipidus Central',            categoria: 'Neurológico',            ordem: 108 },
  { pergunta_id: 1, codigo: 'PRIN_POLINEURO',    label: 'Polineuropatia do Paciente Crítico',    categoria: 'Neurológico',            ordem: 109 },
  { pergunta_id: 1, codigo: 'PRIN_SIHAD',        label: 'SIHAD',                                 categoria: 'Neurológico',            ordem: 110 },
  { pergunta_id: 1, codigo: 'PRIN_SIND_ABS',     label: 'Síndrome de Abstinência',               categoria: 'Neurológico',            ordem: 111 },
  { pergunta_id: 1, codigo: 'PRIN_SPSC_NEUR',    label: 'Síndrome Perdedora de Sal Cerebral',    categoria: 'Neurológico',            ordem: 112 },
  { pergunta_id: 1, codigo: 'PRIN_GUILLAN',      label: 'Síndrome de Guillain-Barré',            categoria: 'Neurológico',            ordem: 113 },
  { pergunta_id: 1, codigo: 'PRIN_ACID_MET',     label: 'Acidose Metabólica',                    categoria: 'Metabólico / Endócrino', ordem: 114 },
  { pergunta_id: 1, codigo: 'PRIN_HIPOCALC',     label: 'Hipocalcemia',                          categoria: 'Metabólico / Endócrino', ordem: 115 },
  { pergunta_id: 1, codigo: 'PRIN_HIPOCAL',      label: 'Hipocalemia (Hipopotassemia)',           categoria: 'Metabólico / Endócrino', ordem: 116 },
  { pergunta_id: 1, codigo: 'PRIN_HIPOFOS',      label: 'Hipofosforemia',                        categoria: 'Metabólico / Endócrino', ordem: 117 },
  { pergunta_id: 1, codigo: 'PRIN_HIPOGLICE',    label: 'Hipoglicemia',                          categoria: 'Metabólico / Endócrino', ordem: 118 },
  { pergunta_id: 1, codigo: 'PRIN_HIPOMAGNES',   label: 'Hipomagnesemia',                        categoria: 'Metabólico / Endócrino', ordem: 119 },
  { pergunta_id: 1, codigo: 'PRIN_HIPONATR',     label: 'Hiponatremia',                          categoria: 'Metabólico / Endócrino', ordem: 120 },
  { pergunta_id: 1, codigo: 'PRIN_CONSTIP',      label: 'Constipação Intestinal',                categoria: 'Gastrointestinal / Hepático', ordem: 121 },
  { pergunta_id: 1, codigo: 'PRIN_DIARR_AG',     label: 'Diarreia Aguda',                        categoria: 'Gastrointestinal / Hepático', ordem: 122 },
  { pergunta_id: 1, codigo: 'PRIN_DIARR_CRO',    label: 'Diarreia Crônica',                      categoria: 'Gastrointestinal / Hepático', ordem: 123 },
  { pergunta_id: 1, codigo: 'PRIN_PARASIT',      label: 'Parasitoses',                           categoria: 'Gastrointestinal / Hepático', ordem: 124 },
  { pergunta_id: 1, codigo: 'PRIN_ACID_TUB',     label: 'Acidose Tubular Renal',                 categoria: 'Renal',                  ordem: 125 },
  { pergunta_id: 1, codigo: 'PRIN_DIAB_NEF2',    label: 'Diabetes Insipidus Nefrogênico',        categoria: 'Renal',                  ordem: 126 },
  { pergunta_id: 1, codigo: 'PRIN_SIND_COMP',    label: 'Síndrome Compartimental',               categoria: 'Trauma / Cirúrgico',     ordem: 127 },
  { pergunta_id: 1, codigo: 'PRIN_OUTROS_TRAU',  label: 'Outros',                                categoria: 'Trauma / Cirúrgico',     ordem: 128, has_input: true, input_placeholder: 'Especifique' },
  { pergunta_id: 1, codigo: 'PRIN_ALERGIA',      label: 'Alergias Alimentares',                  categoria: 'Nutricional / Outros',   ordem: 129 },
  { pergunta_id: 1, codigo: 'PRIN_LESAO_DEC',    label: 'Lesão de Decúbito',                     categoria: 'Nutricional / Outros',   ordem: 130 },
  // ── Novos Secundário (pergunta_id = 2) ──────────────────────────────────
  { pergunta_id: 2, codigo: 'SEC_PARDS',         label: 'PARDS',                                 categoria: 'Respiratório',           ordem: 89 },
  { pergunta_id: 2, codigo: 'SEC_PNEUMO_HOSP',   label: 'Pneumonia Hospitalar',                  categoria: 'Respiratório',           ordem: 90 },
  { pergunta_id: 2, codigo: 'SEC_CORP_VIAS',     label: 'Corpo Estranho em Vias Aéreas',         categoria: 'Respiratório',           ordem: 91 },
  { pergunta_id: 2, codigo: 'SEC_PNEUMO_VIR',    label: 'Pneumonia Viral',                       categoria: 'Respiratório',           ordem: 92 },
  { pergunta_id: 2, codigo: 'SEC_BRADIARR',      label: 'Bradicarritmias',                       categoria: 'Cardiovascular',         ordem: 93 },
  { pergunta_id: 2, codigo: 'SEC_TAQUIARR',      label: 'Taquiarritmias',                        categoria: 'Cardiovascular',         ordem: 94 },
  { pergunta_id: 2, codigo: 'SEC_PCR_ASSIST',    label: 'PCR – Assistolia',                      categoria: 'Cardiovascular',         ordem: 95 },
  { pergunta_id: 2, codigo: 'SEC_PCR_AESP',      label: 'PCR – AESP',                            categoria: 'Cardiovascular',         ordem: 96 },
  { pergunta_id: 2, codigo: 'SEC_PCR_FA',        label: 'PCR – FA (Fibrilação Atrial)',          categoria: 'Cardiovascular',         ordem: 97 },
  { pergunta_id: 2, codigo: 'SEC_PCR_TV',        label: 'PCR – TV (Taquicardia Ventricular)',    categoria: 'Cardiovascular',         ordem: 98 },
  { pergunta_id: 2, codigo: 'SEC_DIAB_CEN',      label: 'Diabetes Insipidus Central',            categoria: 'Neurológico',            ordem: 99 },
  { pergunta_id: 2, codigo: 'SEC_SPSC_NEUR',     label: 'Síndrome Perdedora de Sal Cerebral',    categoria: 'Neurológico',            ordem: 100 },
  { pergunta_id: 2, codigo: 'SEC_GUILLAN',       label: 'Síndrome de Guillain-Barré',            categoria: 'Neurológico',            ordem: 101 },
  { pergunta_id: 2, codigo: 'SEC_ACID_MET',      label: 'Acidose Metabólica',                    categoria: 'Metabólico / Endócrino', ordem: 102 },
  { pergunta_id: 2, codigo: 'SEC_HIPOFOS',       label: 'Hipofosforemia',                        categoria: 'Metabólico / Endócrino', ordem: 103 },
  { pergunta_id: 2, codigo: 'SEC_DIARR_CRO',     label: 'Diarreia Crônica',                      categoria: 'Gastrointestinal / Hepático', ordem: 104 },
  { pergunta_id: 2, codigo: 'SEC_PARASITOSES',   label: 'Parasitoses',                           categoria: 'Gastrointestinal / Hepático', ordem: 105 },
  { pergunta_id: 2, codigo: 'SEC_ACID_TUB',      label: 'Acidose Tubular Renal',                 categoria: 'Renal',                  ordem: 106 },
  { pergunta_id: 2, codigo: 'SEC_DIAB_NEF',      label: 'Diabetes Insipidus Nefrogênico',        categoria: 'Renal',                  ordem: 107 },
  { pergunta_id: 2, codigo: 'SEC_SIND_COMP',     label: 'Síndrome Compartimental',               categoria: 'Trauma / Cirúrgico',     ordem: 108 },
  { pergunta_id: 2, codigo: 'SEC_ALERGIA',       label: 'Alergias Alimentares',                  categoria: 'Nutricional / Outros',   ordem: 109 },
];

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
    'Psicólogo',
    'Fonoaudiólogo',
    'Serviço Social',
    'Terapeuta Ocupacional',
    'Médico / Enfermeiro',
    'Médico / Fisioterapeuta',
    'Médico / Nutricionista',
    'Médico / Enfermeiro / Fisioterapeuta',
    'Médico / Enfermeiro / Nutricionista',
    'Médico / Odontólogo / Enfermeiro',
    'Médico / Serviço Social / Enfermeiro',
    'Médico / Psicólogo / Enfermeiro'
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

export const ALERT_SYSTEMS: string[] = [
    'Avaliação respiratória',
    'Avaliação cardiovascular',
    'Avaliação infecciosa',
    'Avaliação renal',
    'Distúrbios hidroeletrolíticos/metabólicos e DAB',
    'Avaliação gastrointestinal',
    'Avaliação cirúrgica',
    'Avaliação hematológica/ oncológica',
    'Avaliação neurológica',
    'Sedação /Analgesia',
    'Avaliação nutricional / metabólica / hídrico',
    'Avaliação imunológica',
    'Avaliação genética',
    'Avaliação reumatológica',
    'Avaliação dermatológica',
    'Avaliação psiquiátrica',
    'Avaliação psicológica',
    'Avaliação odontológica',
    'Serviço Social',
    'Gestão de riscos assistenciais',
    'Notificação de eventos adversos',
    'Outros',
];

export const INITIAL_USER: User = {
    name: '',
    title: '',
    avatarUrl: '',
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
  const option = question.alertOptions?.find(opt => opt.id === optionId);
  return option ? option.label : optionId;
}
