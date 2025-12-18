
import React from 'react';

export interface Device {
  id: number | string;
  name: string;
  location: string;
  startDate: string; // "YYYY-MM-DD"
  removalDate?: string; // "YYYY-MM-DD"
  isArchived?: boolean;
}

export interface Exam {
  id: number | string;
  name: string;
  date: string; // "YYYY-MM-DD"
  result: 'Pendente' | 'Normal' | 'Alterado';
  observation?: string;
  isArchived?: boolean;
}

export interface Medication {
  id: number | string;
  name: string;
  dosage: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  isArchived?: boolean;
}

export interface SurgicalProcedure {
  id: number | string;
  name: string;
  date: string; // "YYYY-MM-DD"
  surgeon: string;
  notes?: string;
  isArchived?: boolean;
}

export interface ScaleScore {
  id: number | string;
  scaleName: string;
  score: number;
  interpretation: string;
  date: string; // ISO String for timestamp
}

export interface Culture {
  id: number | string;
  site: string; // local
  microorganism: string; // microorganismo
  collectionDate: string; // data_coleta
  observation?: string; // observação (opcional)
  isArchived?: boolean;
}

export interface Patient {
  id: number | string;
  name: string;
  bedNumber: number;
  motherName: string;
  dob: string; // "YYYY-MM-DD"
  ctd: string; // Used for Diagnosis
  devices: Device[];
  exams: Exam[];
  medications: Medication[];
  surgicalProcedures: SurgicalProcedure[];
  scaleScores: ScaleScore[];
  cultures: Culture[];
}

export interface Category {
  id: number;
  name: string;
  icon?: React.FC<{ className?: string; }>;
}

export interface AlertOption {
  id: string;
  label: string;
  hasInput?: boolean;
  inputPlaceholder?: string;
}

export interface Question {
  id: number;
  text: string;
  categoryId: number;
  alertOptions?: AlertOption[];
}

export type Answer = 'sim' | 'não' | 'nao_se_aplica';

export interface ChecklistAnswer {
  [questionId: number]: Answer;
}

export interface Alert {
  id: number | string;
  text: string;
  categoryId: number;
  patientId: number | string;
}

export type TaskStatus = 'alerta' | 'no_prazo' | 'fora_do_prazo' | 'concluido';

export interface Task {
  id: number | string;
  patientId: number | string;
  categoryId: number;
  description: string;
  responsible: string;
  deadline: string; // ISO String for date and time
  status: TaskStatus;
  justification?: string;
  // New fields for DB integration
  patientName?: string;
  categoryName?: string;
  timeLabel?: string;
  options?: any; // JSONB
}

// --- USER & THEME ---
export interface User {
  id?: string; // UUID from auth.users
  name: string;
  title: string; // role field from public.users
  avatarUrl: string; // foto field from public.users
  sector?: string; // Setor/Unidade from public.users
  access_level?: 'adm' | 'geral'; // 'adm' for administrator, 'geral' for general user
}

export type Theme = 'light' | 'dark';


// --- CONTEXT TYPE DEFINITIONS ---

export interface TasksContextType {
  tasks: Task[];
  updateTaskJustification: (taskId: number | string, justification: string) => void;
  updateTaskStatus: (taskId: number | string, status: TaskStatus) => void;
  addTask: (taskData: Omit<Task, 'id' | 'status' | 'justification'>) => void;
  addPatientAlert: (data: { patientId: string | number; description: string; responsible: string; timeLabel: string }) => Promise<void>;
}

export interface PatientsContextType {
  patients: Patient[];
  questions: Question[];
  categories: Category[];
  checklistAnswers: Record<string, Record<number, Answer>>; // patientId -> questionId -> Answer
  addDeviceToPatient: (patientId: number | string, device: Omit<Device, 'id'>) => void;
  addExamToPatient: (patientId: number | string, exam: Omit<Exam, 'id'>) => void;
  addMedicationToPatient: (patientId: number | string, medication: Omit<Medication, 'id'>) => void;
  addSurgicalProcedureToPatient: (patientId: number | string, procedure: Omit<SurgicalProcedure, 'id'>) => void;
  addRemovalDateToDevice: (patientId: number | string, deviceId: number | string, removalDate: string) => void;
  deleteDeviceFromPatient: (patientId: number | string, deviceId: number | string) => void;
  addEndDateToMedication: (patientId: number | string, medicationId: number | string, endDate: string) => void;
  deleteMedicationFromPatient: (patientId: number | string, medicationId: number | string) => void;
  updateExamInPatient: (patientId: number | string, examData: Exam) => void;
  deleteExamFromPatient: (patientId: number | string, examId: number | string) => void;
  updateDeviceInPatient: (patientId: number | string, deviceData: Device) => void;
  updateMedicationInPatient: (patientId: number | string, medicationData: Medication) => void;
  updateSurgicalProcedureInPatient: (patientId: number | string, procedureData: SurgicalProcedure) => void;
  deleteSurgicalProcedureFromPatient: (patientId: number | string, procedureId: number | string) => void;
  addScaleScoreToPatient: (patientId: number | string, score: Omit<ScaleScore, 'id'>) => void;
  updatePatientDetails: (patientId: number | string, data: { motherName?: string; ctd?: string }) => void;
  saveChecklistAnswer: (patientId: number | string, categoryId: number, questionId: number, answer: Answer) => Promise<void>;
  addCultureToPatient: (patientId: number | string, culture: Omit<Culture, 'id'>) => void;
  deleteCultureFromPatient: (patientId: number | string, cultureId: number | string) => void;
  updateCultureInPatient: (patientId: number | string, cultureData: Culture) => void;
}

// --- NOTIFICATION TYPES ---
export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (notification: NotificationState) => void;
  hideNotification: () => void;
}

export interface UserContextType {
  user: User;
  updateUser: (userData: Partial<User>) => void;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
