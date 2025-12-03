import { createContext } from 'react';
import {
    TasksContextType,
    PatientsContextType,
    NotificationContextType,
    UserContextType,
    ThemeContextType
} from './types';

export const TasksContext = createContext<TasksContextType | null>(null);
export const PatientsContext = createContext<PatientsContextType | null>(null);
export const NotificationContext = createContext<NotificationContextType | null>(null);
export const UserContext = createContext<UserContextType | null>(null);
export const ThemeContext = createContext<ThemeContextType | null>(null);

export interface HeaderContextType {
    setTitle: (title: string) => void;
}
export const HeaderContext = createContext<HeaderContextType | null>(null);
