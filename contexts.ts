import { createContext } from 'react';
import {
    TasksContextType,
    PatientsContextType,
    NotificationContextType,
    UserContextType,
    ThemeContextType
} from './types';

export interface PreviewContextType {
    showPreview: boolean;
    setShowPreview: (v: boolean) => void;
    previewText: string;
    setPreviewText: (v: string) => void;
    previewMinimized: boolean;
    setPreviewMinimized: (v: boolean | ((p: boolean) => boolean)) => void;
    patientName: string;
    setPatientName: (v: string) => void;
    downloadWordRef: { current: (() => void) | null };
}

export const TasksContext = createContext<TasksContextType | null>(null);
export const PatientsContext = createContext<PatientsContextType | null>(null);
export const NotificationContext = createContext<NotificationContextType | null>(null);
export const UserContext = createContext<UserContextType | null>(null);
export const ThemeContext = createContext<ThemeContextType | null>(null);

export interface HeaderContextType {
    setTitle: (title: string) => void;
}
export const HeaderContext = createContext<HeaderContextType | null>(null);
export const PreviewContext = createContext<PreviewContextType | null>(null);
