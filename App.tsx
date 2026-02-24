
import React, { useState, useMemo, useContext, useEffect, createContext, useRef, lazy, Suspense } from 'react';
import type { Session } from '@supabase/supabase-js';
import { HashRouter, Routes, Route, useNavigate, Link, useParams, useLocation, Outlet, NavLink, Navigate } from 'react-router-dom';
import { Patient, Category, Question, ChecklistAnswer, Answer, Device, Exam, Medication, Task, TaskStatus, PatientsContextType, TasksContextType, NotificationState, NotificationContextType, User, UserContextType, Theme, ThemeContextType, SurgicalProcedure, ScaleScore, Culture, Diet, Precaution } from './types';
import { PATIENTS as initialPatients, CATEGORIES as STATIC_CATEGORIES, QUESTIONS as STATIC_QUESTIONS, TASKS as initialTasks, DEVICE_TYPES, DEVICE_LOCATIONS, EXAM_STATUSES, RESPONSIBLES, ALERT_DEADLINES, INITIAL_USER, MEDICATION_LIST, MEDICATION_DOSAGE_UNITS, ALERT_CATEGORIES, ICON_MAP, formatDateToBRL, formatDateTimeWithHour, calculateDaysSinceDate, getDiagnosisOptionLabel } from './constants';
import { BackArrowIcon, PlusIcon, WarningIcon, ClockIcon, AlertIcon, CheckCircleIcon, BedIcon, UserIcon, PencilIcon, BellIcon, InfoIcon, EyeOffIcon, ClipboardIcon, FileTextIcon, LogOutIcon, ChevronRightIcon, MenuIcon, DashboardIcon, CpuIcon, PillIcon, BarChartIcon, AppleIcon, DropletIcon, HeartPulseIcon, BeakerIcon, LiverIcon, LungsIcon, DumbbellIcon, BrainIcon, ShieldIcon, UsersIcon, HomeIcon, CloseIcon, SettingsIcon, CameraIcon, ScalpelIcon, SaveIcon, CheckSquareIcon, SquareIcon, ChevronDownIcon, CheckIcon, ChevronLeftIcon } from './components/icons';
import { LoadingIndicator } from './components/LoadingIndicator';

// Lazy load components pesados
const ComfortBScale = lazy(() => import('./components/ComfortBScale').then(m => ({ default: m.ComfortBScale })));
const DeliriumScale = lazy(() => import('./components/DeliriumScale').then(m => ({ default: m.DeliriumScale })));
const GlasgowScale = lazy(() => import('./components/GlasgowScale').then(m => ({ default: m.GlasgowScale })));
const CRSRScale = lazy(() => import('./components/CRSRScale').then(m => ({ default: m.CRSRScale })));
const FLACCScale = lazy(() => import('./components/FLACCScale').then(m => ({ default: m.FLACCScale })));
const BradenScale = lazy(() => import('./components/BradenScale').then(m => ({ default: m.BradenScale })));
const BradenQDScale = lazy(() => import('./components/BradenQDScale').then(m => ({ default: m.BradenQDScale })));
const VniCnafScale = lazy(() => import('./components/VniCnafScale').then(m => ({ default: m.VniCnafScale })));
const FSSScale = lazy(() => import('./components/FSSScale').then(m => ({ default: m.FSSScale })));
const BradenCalculator = lazy(() => import('./components/BradenCalculator').then(m => ({ default: m.BradenCalculator })));
const FLACCCalculator = lazy(() => import('./components/FLACCCalculator').then(m => ({ default: m.FLACCCalculator })));
const ComfortBCalculator = lazy(() => import('./components/ComfortBCalculator'));
const GlasgowCalculator = lazy(() => import('./components/GlasgowCalculator'));
const AbstinenciaCalculator = lazy(() => import('./components/AbstinenciaCalculator'));
const CAMICUCalculator = lazy(() => import('./components/CAMICUCalculator'));
const SOSPDCalculator = lazy(() => import('./components/SOSPDCalculator'));
const ConsciousnessCalculator = lazy(() => import('./components/ConsciousnessCalculator'));
const VNICNAFCalculator = lazy(() => import('./components/VNICNAFCalculator'));
const DiagnosticsSection = lazy(() => import('./components/DiagnosticsSection').then(m => ({ default: m.DiagnosticsSection })));
const AlertasSection = lazy(() => import('./components/AlertasSection').then(m => ({ default: m.AlertasSection })));
const DiuresisCalc = lazy(() => import('./components/DiuresisCalc'));
const DiuresisHistory = lazy(() => import('./components/DiuresisHistory'));
const FluidBalanceCalc = lazy(() => import('./components/FluidBalanceCalc'));
const FluidBalanceHistory = lazy(() => import('./components/FluidBalanceHistory'));
const LatestCalculationsCard = lazy(() => import('./components/LatestCalculationsCard'));
const BalancoCumulativoPorPeriodo = lazy(() => import('./components/BalancoCumulativoPorPeriodo'));
const StatusComponent = lazy(() => import('./components/StatusComponent'));
const ComorbidadeComponent = lazy(() => import('./components/ComorbidadeComponent'));
const DestinoComponent = lazy(() => import('./components/DestinoComponent'));
const ClinicalSituation24hCard = lazy(() => import('./components/ClinicalSituation24hCard').then(m => ({ default: m.ClinicalSituation24hCard })));
const AportesCard = lazy(() => import('./components/AportesCard').then(m => ({ default: m.AportesCard })));
const AlertsHistoryScreen = lazy(() => import('./AlertsHistoryScreen').then(m => ({ default: m.AlertsHistoryScreen })));
const PrecautionsCard = lazy(() => import('./components/PrecautionsCard').then(m => ({ default: m.PrecautionsCard })));
const DiagnosticsResultsCard = lazy(() => import('./components/DiagnosticsResultsCard'));

// Lazy load modals
const EditPatientInfoModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditPatientInfoModal })));
const CreateAlertModal = lazy(() => import('./components/modals').then(m => ({ default: m.CreateAlertModal })));
const AlertModal = lazy(() => import('./components/modals').then(m => ({ default: m.AlertModal })));
const JustificationModal = lazy(() => import('./components/modals').then(m => ({ default: m.JustificationModal })));
const AddCultureModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddCultureModal })));
const EditCultureModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditCultureModal })));
const ArchiveCultureModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveCultureModal })));
const ArchiveDietModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveDietModal })));
const AddDietModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddDietModal })));
const EditDietModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditDietModal })));
const AddDietRemovalDateModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddDietRemovalDateModal })));
const EditDietRemovalDateModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditDietRemovalDateModal })));
const AddDeviceModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddDeviceModal })));
const EditDeviceModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditDeviceModal })));
const AddRemovalDateModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddRemovalDateModal })));
const EditDeviceRemovalDateModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditDeviceRemovalDateModal })));
const ArchiveDeviceModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveDeviceModal })));
const AddExamModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddExamModal })));
const EditExamModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditExamModal })));
const ArchiveExamModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveExamModal })));
const AddMedicationModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddMedicationModal })));
const EditMedicationModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditMedicationModal })));
const AddEndDateModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddEndDateModal })));
const EditMedicationEndDateModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditMedicationEndDateModal })));
const ArchiveMedicationModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveMedicationModal })));
const AddSurgicalProcedureModal = lazy(() => import('./components/modals').then(m => ({ default: m.AddSurgicalProcedureModal })));
const EditSurgicalProcedureModal = lazy(() => import('./components/modals').then(m => ({ default: m.EditSurgicalProcedureModal })));
const ArchiveSurgicalProcedureModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveSurgicalProcedureModal })));

import { SecondaryNavigation } from './components/SecondaryNavigation';
import { supabase } from './supabaseClient';
import {
    TasksContext,
    PatientsContext,
    NotificationContext,
    UserContext,
    ThemeContext,
    HeaderContext
} from './contexts';

// --- LOADING COMPONENT ---
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

// --- HELPER FOR DATES ---
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- LAYOUT & NAVIGATION ---

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading } = useContext(UserContext)!;
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/patients', label: 'Leitos', icon: BedIcon },
        { path: '/history', label: 'Histórico Geral', icon: FileTextIcon },
        { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    const activeLinkClass = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
    const inactiveLinkClass = "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200";

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                <ClipboardIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Round Juju</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold transition ${isActive ? activeLinkClass : inactiveLinkClass
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                {isLoading ? (
                    <LoadingIndicator 
                        type="spinner"
                        message="Carregando seu perfil..."
                        size="md"
                    />
                ) : user.name ? (
                    <>
                        <div className="flex items-center space-x-3 mb-4">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="User avatar" className="w-12 h-12 rounded-full object-cover bg-slate-200" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.title || 'Usuário'}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ Nenhum usuário encontrado
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-semibold transition ${
                        isLoading 
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300'
                    }`}
                >
                    <LogOutIcon className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

const BottomNav: React.FC = () => {
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/patients', label: 'Leitos', icon: BedIcon },
        { path: '/history', label: 'Histórico Geral', icon: FileTextIcon },
        { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    const activeLinkClass = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
    const inactiveLinkClass = "text-slate-600 dark:text-slate-300";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-2 py-2 flex items-center justify-between lg:hidden">
            <div className="flex flex-1 gap-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition text-xs font-semibold ${isActive ? activeLinkClass : inactiveLinkClass}`
                        }
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

const useHeader = (title: string) => {
    const context = useContext(HeaderContext);
    useEffect(() => {
        if (context) {
            context.setTitle(title);
        }
        return () => {
            if (context) {
                // Optional: clear title on unmount
            }
        };
    }, [title, context]);
};

const Header: React.FC<{ title: string; onMenuClick: () => void }> = ({ title, onMenuClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getBackPath = (): string | number => {
        const pathParts = location.pathname.split('/').filter(Boolean);

        if (location.pathname.includes('/create-alert')) {
            return -1;
        }

        if (pathParts.length > 1) {
            const patientId = pathParts[1];
            if (pathParts[0] === 'status') {
                return '/dashboard';
            }
            if (pathParts[2] === 'history') {
                return `/patient/${patientId}`;
            }
            if (pathParts.includes('category')) { // Catches /.../category/:id/question/:id
                return `/patient/${patientId}/round/categories`;
            }
            if (pathParts.includes('categories')) {
                return `/patient/${patientId}`;
            }
            if (pathParts.length === 2 && pathParts[0] === 'patient') {
                return '/patients';
            }
        }
        if (location.pathname === '/patients' || location.pathname === '/settings' || location.pathname === '/dashboard') {
            return '/dashboard';
        }
        return -1;
    };

    const backPath = getBackPath();
    const showBackButton = backPath !== -1 && location.pathname !== '/dashboard';

    return (
        <header className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4 sticky top-0 z-10 flex items-center justify-between shrink-0">
            <div className="flex items-center">
                <button
                    onClick={showBackButton ? () => (typeof backPath === 'string' ? navigate(backPath) : navigate(-1)) : onMenuClick}
                    className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition mr-2 lg:hidden"
                >
                    {showBackButton ? <BackArrowIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <div className="hidden lg:block mr-4">
                    {showBackButton && (
                        <button onClick={() => typeof backPath === 'string' ? navigate(backPath) : navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition">
                            <BackArrowIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
            </div>
        </header>
    );
};


const AppLayout: React.FC = () => {
    const [title, setTitle] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const contextValue = useMemo(() => ({ setTitle }), []);
    const { notification, hideNotification } = useContext(NotificationContext)!;

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    return (
        <HeaderContext.Provider value={contextValue}>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex-row">
                {/* Mobile Sidebar */}
                <div className={`fixed inset-0 z-30 transition-opacity bg-black bg-opacity-50 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
                <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:flex lg:shrink-0">
                    <Sidebar />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                    <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8 pb-28 lg:pb-8">
                        <div className="max-w-4xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
            <BottomNav />
            {notification && (
                <Notification message={notification.message} type={notification.type} onClose={hideNotification} />
            )}
        </HeaderContext.Provider>
    );
};

// --- Notification Component ---
const Notification: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    const icon = {
        success: <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
        error: <WarningIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
        info: <InfoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />,
    }[type];

    return (
        <div className={`fixed top-2 right-2 sm:top-5 sm:right-5 z-50 flex items-center p-3 sm:p-4 rounded-lg shadow-lg text-white max-w-xs sm:max-w-sm ${bgColor} animate-notification-in`}>
            {icon}
            <span className="ml-2 sm:ml-3 font-semibold text-sm sm:text-base">{message}</span>
        </div>
    );
};


// --- SCREENS ---

const LoginScreen: React.FC = () => {
    const navigate = useNavigate();
    const userContext = useContext(UserContext);
    const { loadUser } = userContext || { loadUser: async () => {} };
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);

    // ✅ SEGURANÇA: Validação de entrada
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string) => password.length >= 6;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // ✅ SEGURANÇA: Rate limiting simples
        if (isLockedOut) {
            alert('Muitas tentativas de login. Tente novamente em alguns minutos.');
            setLoading(false);
            return;
        }

        // ✅ SEGURANÇA: Validar entrada
        if (!validateEmail(email)) {
            alert('Por favor, insira um email válido');
            setLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            alert('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(), // Remover espaços
            password: password,
        });

        if (error) {
            // ✅ SEGURANÇA: Não expor mensagens de erro específicas
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            if (newAttempts >= 5) {
                setIsLockedOut(true);
                setTimeout(() => {
                    setIsLockedOut(false);
                    setLoginAttempts(0);
                }, 15 * 60 * 1000); // 15 minutos
            }

            alert('Email ou senha incorretos');
            setLoading(false);
        } else {
            setLoginAttempts(0); // Resetar tentativas
            try {
                console.log('✅ [LOGIN SUCCESS] Usuário autenticado');
                
                // 1. Obter dados da sessão autenticada
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    const userId = session.user.id;
                    const userEmail = session.user.email || '';
                    
                    console.log('🔵 [LOGIN] Verificando usuário no banco:', userEmail);
                    
                    // 2. Verificar se usuário existe no banco
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', userId)
                        .maybeSingle();
                    
                    if (!existingUser) {
                        // Se não existe, criar agora
                        const userName = session.user.user_metadata?.name || userEmail.split('@')[0];
                        
                        console.log('🔵 [LOGIN] Usuário não existe no banco, criando...');
                        
                        await supabase.from('users').insert({
                            id: userId,
                            email: userEmail,
                            name: userName,
                            role: 'Médica',
                            access_level: 'geral'
                        });
                        
                        console.log('✅ [LOGIN] Usuário criado no banco');
                    } else {
                        console.log('✅ [LOGIN] Usuário já existe no banco:', existingUser.name);
                    }
                }
                
                // 3. Carregar dados do usuário autenticado
                console.log('🔵 [LOGIN] Carregando dados do usuário...');
                await loadUser();
                console.log('✅ [LOGIN] Dados carregados com sucesso!');
            } catch (err) {
                console.error('❌ [LOGIN] Erro ao processar login:', err);
            }
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-sm w-full m-4">
                <div className="text-center mb-8">
                    <ClipboardIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">Bem-vindo de volta!</h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Faça login para continuar.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || isLockedOut}
                        className={`w-full font-bold py-2 sm:py-3 px-4 rounded-lg transition text-base sm:text-lg flex items-center justify-center gap-2 ${
                            loading || isLockedOut
                                ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Autenticando...</span>
                            </>
                        ) : isLockedOut ? (
                            '⏳ Aguarde antes de tentar novamente'
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const DashboardScreen: React.FC = () => {
    useHeader('Dashboard');
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext)!;
    const [expandedProfessionals, setExpandedProfessionals] = useState<Set<string>>(new Set());
    const [allAlerts, setAllAlerts] = useState<any[]>([]);

    // Estado para armazenar dados do Supabase
    const [dashboardData, setDashboardData] = useState({
        totalAlertas: 0,
        totalNoPrazo: 0,
        totalForaDoPrazo: 0,
        totalConcluidos: 0
    });
    const [loading, setLoading] = useState(true);

    const professionalColorMap: Record<string, { border: string; icon: string; bg: string }> = {
        'Enfermeiro': { border: 'border-blue-400', icon: '👩‍⚕️', bg: 'bg-blue-900/30' },
        'Farmacêutico': { border: 'border-orange-400', icon: '💊', bg: 'bg-orange-900/30' },
        'Fisioterapeuta': { border: 'border-green-400', icon: '🏃', bg: 'bg-green-900/30' },
        'Médico': { border: 'border-red-400', icon: '👨‍⚕️', bg: 'bg-red-900/30' },
        'Médico / Enfermeiro': { border: 'border-purple-400', icon: '👥', bg: 'bg-purple-900/30' },
        'Médico / Fisioterapeuta': { border: 'border-indigo-400', icon: '👥', bg: 'bg-indigo-900/30' },
        'Nutricionista': { border: 'border-amber-400', icon: '🍎', bg: 'bg-amber-900/30' },
        'Odontólogo': { border: 'border-cyan-400', icon: '🦷', bg: 'bg-cyan-900/30' },
        'Psicólogo': { border: 'border-pink-400', icon: '🧠', bg: 'bg-pink-900/30' },
        'Fonoaudiólogo': { border: 'border-fuchsia-400', icon: '🗣️', bg: 'bg-fuchsia-900/30' },
    };

    // Buscar dados do Supabase ao montar o componente
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Buscar dados de ambas as views
                const { data: tasksData } = await supabase
                    .from('tasks_view_horario_br')
                    .select('*');

                const { data: alertasData } = await supabase
                    .from('alertas_paciente_view_completa')
                    .select('*');

                // Combinar dados de ambas as views
                const combined = [...(tasksData || []), ...(alertasData || [])];
                
                console.log('✅ Total de alertas carregados:', combined.length);
                console.log('✅ Tasks:', tasksData?.length || 0);
                console.log('✅ Alertas Paciente:', alertasData?.length || 0);

                setAllAlerts(combined);

                // Calcular estatísticas
                const totalAlertas = combined.length;
                const totalNoPrazo = combined.filter(a => a.live_status === 'no_prazo').length;
                const totalForaDoPrazo = combined.filter(a => a.live_status === 'fora_do_prazo').length;

                setDashboardData({
                    totalAlertas,
                    totalNoPrazo,
                    totalForaDoPrazo,
                    totalConcluidos: 0
                });
            } catch (err) {
                console.error('❌ Erro ao buscar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const summaryData = useMemo(() => {
        return [
            { title: 'Alertas', count: dashboardData.totalAlertas, icon: WarningIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50', status: 'alerta' },
            { title: 'No Prazo', count: dashboardData.totalNoPrazo, icon: ClockIcon, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/50', status: 'no_prazo' },
            { title: 'Fora do Prazo', count: dashboardData.totalForaDoPrazo, icon: AlertIcon, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/50', status: 'fora_do_prazo' },
            { title: 'Concluídos', count: dashboardData.totalConcluidos, icon: CheckCircleIcon, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/50', status: 'concluido' },
        ];
    }, [dashboardData]);

    const toggleProfessional = (professional: string) => {
        const newExpanded = new Set(expandedProfessionals);
        if (newExpanded.has(professional)) {
            newExpanded.delete(professional);
        } else {
            newExpanded.add(professional);
        }
        setExpandedProfessionals(newExpanded);
    };

    const alertsByProfessional = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        
        allAlerts.forEach(alert => {
            // Ambas as views têm coluna 'responsavel'
            const professional = alert.responsavel || 'Não informado';
            if (!grouped[professional]) {
                grouped[professional] = [];
            }
            grouped[professional].push(alert);
        });

        return Object.entries(grouped)
            .map(([professional, alerts]) => ({
                professional,
                count: alerts.length,
                tasks: alerts,
                colors: professionalColorMap[professional] || {
                    border: 'border-gray-400',
                    icon: '👤',
                    bg: 'bg-gray-900/30'
                }
            }))
            .sort((a, b) => b.count - a.count);
    }, [allAlerts]);

    return (
        <div className="space-y-8">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingIndicator 
                        type="spinner"
                        message="Carregando dados do dashboard..."
                        size="lg"
                    />
                </div>
            ) : (
                <>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Resumo do Dia</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {summaryData.map(item => (
                                <div key={item.title} onClick={() => navigate(`/status/${item.status}`)} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center space-y-2">
                                    <div className={`p-3 rounded-full ${item.bgColor}`}>
                                        <item.icon className={`w-8 h-8 ${item.color}`} />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.title}</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">{item.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Alertas por Profissional</h2>
                        <div className="space-y-3">
                            {alertsByProfessional.length > 0 ? (
                                alertsByProfessional.map(item => (
                                    <div
                                        key={item.professional}
                                        className={`border-l-4 ${item.colors.border} ${item.colors.bg} bg-slate-800 dark:bg-slate-800/50 p-4 rounded-lg transition`}
                                    >
                                        <div
                                            className="flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleProfessional(item.professional)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.colors.icon}</span>
                                                <div>
                                                    <h3 className="text-base font-bold text-white">{item.professional}</h3>
                                                    <p className="text-sm text-slate-400">{item.count} {item.count === 1 ? 'alerta' : 'alertas'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full text-sm">
                                                    {item.count}
                                                </div>
                                                <ChevronDownIcon
                                                    className={`w-5 h-5 text-slate-400 transition-transform ${
                                                        expandedProfessionals.has(item.professional) ? 'rotate-180' : ''
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {expandedProfessionals.has(item.professional) && (
                                            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                                                {item.tasks.map(alert => (
                                                    <div key={alert.id_alerta || alert.id} className="bg-slate-700/50 p-4 rounded border-l-2 border-slate-600 text-sm space-y-2">
                                                        <p className="text-slate-200 font-bold">{alert.alertaclinico || alert.description || 'Sem descrição'}</p>
                                                        <div className="space-y-1 text-xs text-slate-400">
                                                            <p>🏥 Leito {alert.bed_number || '?'} - {alert.patient_name || 'Paciente desconhecido'}</p>
                                                            {alert.hora_criacao_formatado && <p>📅 Criado: {alert.hora_criacao_formatado}</p>}
                                                            {alert.prazo_limite_formatado && <p>⏰ Prazo: {alert.prazo_limite_formatado}</p>}
                                                            {alert.prazo_formatado && <p>⌛ Tempo: {alert.prazo_formatado}</p>}
                                                            {alert.live_status && <p>Status: <span className={alert.live_status === 'no_prazo' ? 'text-blue-400' : 'text-red-400'}>{alert.live_status}</span></p>}
                                                        </div>
                                                        {(alert.justificativa || alert.justification) && (
                                                            <div className="mt-3 p-3 bg-yellow-900/30 rounded border-l-2 border-yellow-500">
                                                                <p className="text-yellow-300 text-xs font-semibold">💬 Justificativa:</p>
                                                                <p className="text-slate-300 text-xs mt-1">{alert.justificativa || alert.justification}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-4">✅ Nenhum alerta em andamento!</p>
                            )}
                        </div>
                    </div>
                </>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 pb-4">
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Idealizado por Dra. Lélia Braga / Criado por Noemi Sales
                </p>
            </div>
        </div>
    );
};

const PatientListScreen: React.FC = () => {
    useHeader('Leitos');
    const { patients, questions, checklistAnswers } = useContext(PatientsContext)!;
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Detectar quando os pacientes terminaram de carregar
    useEffect(() => {
        if (patients.length > 0) {
            setIsLoading(false);
        }
    }, [patients]);

    const filteredPatients = useMemo(() => {
        return patients
            .filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.bedNumber.toString().includes(searchTerm)
            )
            .sort((a, b) => a.bedNumber - b.bedNumber);
    }, [patients, searchTerm]);

    const calculateProgress = (patientId: number | string) => {
        if (!questions || questions.length === 0) return 0;

        // Get all unique categories from questions
        const categoryIds = Array.from(new Set(questions.map(q => q.categoryId)));
        if (categoryIds.length === 0) return 0;

        const patientAnswers = checklistAnswers[patientId?.toString()] || {};

        let completedCategories = 0;
        categoryIds.forEach(catId => {
            const questionsForCat = questions.filter(q => q.categoryId === catId);
            if (questionsForCat.length === 0) return;

            const allAnswered = questionsForCat.every(q => patientAnswers[q.id] !== undefined);
            if (allAnswered) completedCategories++;
        });

        return (completedCategories / categoryIds.length) * 100;
    };

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Buscar por nome ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
            />
            
            {/* Indicador de carregamento */}
            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <LoadingIndicator 
                        type="spinner"
                        message="Carregando leitos..."
                        size="md"
                    />
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400">Nenhum paciente encontrado</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPatients.map(patient => {
                    const progress = calculateProgress(patient.id);
                    const statusColors = {
                        'estavel': { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
                        'instavel': { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
                        'em_risco': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' }
                    };
                    const colors = statusColors[patient.status as keyof typeof statusColors] || { border: 'border-slate-300', bg: 'bg-white dark:bg-slate-900', text: 'text-slate-700 dark:text-slate-300' };
                    const statusLabel = patient.status === 'estavel' ? 'Estável' : patient.status === 'instavel' ? 'Instável' : patient.status === 'em_risco' ? 'Em Risco' : 'Sem Status';
                    
                    return (
                        <Link to={`/patient/${patient.id}`} key={patient.id} className={`block bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition border-2 ${colors.border} ${colors.bg}`}>
                            <div className="flex items-center space-x-4">
                                <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg">
                                    {patient.bedNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 wrap-break-word">{patient.name}</p>
                                        {patient.status && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.text} ${colors.bg}`}>
                                                {statusLabel}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Nasc: {new Date(patient.dob).toLocaleDateString('pt-BR')}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                        </Link>
                    );
                })}
                </div>
            )}
        </div>
    );
};

const formatHistoryDate = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    // Defensive parsing
    const dateParts = dateString.split('T')[0].split('-').map(Number);
    if (dateParts.length < 3) return dateString;

    const [year, month, day] = dateParts;
    const eventDate = new Date(year, month - 1, day);
    const displayDate = new Date(year, month - 1, day); // Create a date object for formatting

    if (eventDate.getTime() === today.getTime()) {
        return `Hoje, ${displayDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`;
    }
    if (eventDate.getTime() === yesterday.getTime()) {
        return `Ontem, ${displayDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`;
    }
    return displayDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const PatientHistoryScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients } = useContext(PatientsContext)!;
    const { tasks } = useContext(TasksContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);
    const [diagnostics, setDiagnostics] = React.useState<any[]>([]);
    const [resolvedDiagnostics, setResolvedDiagnostics] = React.useState<any[]>([]);
    const [archivedDiagnostics, setArchivedDiagnostics] = React.useState<any[]>([]);
    const [auditLogData, setAuditLogData] = React.useState<any[]>([]);
    const [diuresisData, setDiuresisData] = React.useState<any[]>([]);
    const [balanceData, setBalanceData] = React.useState<any[]>([]);
    const [alertsData, setAlertsData] = React.useState<any[]>([]);
    const [alertCompletions, setAlertCompletions] = React.useState<any[]>([]);
    const [alertJustifications, setAlertJustifications] = React.useState<any[]>([]);
    const [archivedAlerts, setArchivedAlerts] = React.useState<any[]>([]);
    const [archivedDevices, setArchivedDevices] = React.useState<any[]>([]);
    const [archivedExams, setArchivedExams] = React.useState<any[]>([]);
    const [archivedMedications, setArchivedMedications] = React.useState<any[]>([]);
    const [archivedProcedures, setArchivedProcedures] = React.useState<any[]>([]);
    const [archivedCultures, setArchivedCultures] = React.useState<any[]>([]);
    const [archivedDiets, setArchivedDiets] = React.useState<any[]>([]);
    const [clinicalSituations24h, setClinicalSituations24h] = React.useState<any[]>([]);
    const [aportesHistorico, setAportesHistorico] = React.useState<any[]>([]);
    const [dietsData, setDietsData] = React.useState<any[]>([]);
    const [dataInicio, setDataInicio] = React.useState<string>('');
    const [dataFinal, setDataFinal] = React.useState<string>('');
    const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set());

    const eventCategories = {
        'Dispositivos': 'Dispositivo',
        'Medicações': 'Medicação',
        'Exames': 'Exame',
        'Cirúrgico': 'Cirurgia',
        'Escalas': 'Avaliação de Escala',
        'Diagnósticos': 'Diagnóstico',
        'Culturas': 'Cultura',
        'Diurese': 'Diurese',
        'Balanço Hídrico': 'Balanço Hídrico',
        'Dietas': 'Dieta',
        'Alertas': 'Alerta',
        'Comorbidades': 'Comorbidade',
        'Completações': 'Completação de Alerta',
        'Justificativas': 'Justificativa Adicionada',
        'Arquivamentos': 'Alerta Arquivado',
        'Arquivamentos Dispositivos': 'Dispositivo Arquivado',
        'Arquivamentos Exames': 'Exame Arquivado',
        'Arquivamentos Medicações': 'Medicação Arquivada',
        'Arquivamentos Procedimentos': 'Procedimento Arquivado',
        'Arquivamentos Culturas': 'Cultura Arquivada',
        'Arquivamentos Dietas': 'Dieta Arquivada',
        'Arquivamentos Diagnósticos': 'Diagnóstico Arquivado',
        'Situação Clínica 24h': 'Situação Clínica 24h',
        'Aportes': 'Aportes'
    };

    useHeader(patient ? `Histórico: ${patient.name}` : 'Histórico do Paciente');

    // Buscar diagnósticos do Supabase
    React.useEffect(() => {
        const fetchDiagnostics = async () => {
            if (!patientId) return;
            try {
                console.log('🔍 Buscando diagnósticos para patientId:', patientId);
                
                const { data, error } = await supabase
                    .from('diagnosticos_historico_com_usuario')
                    .select('*')
                    .eq('patient_id', patientId);
                
                console.log('📋 Diagnósticos data:', data);
                console.log('❌ Diagnósticos error:', error);
                
                if (error) {
                    console.error('❌ Erro ao buscar diagnósticos:', error.message);
                    return;
                }
                
                if (data && data.length > 0) {
                    // Separar diagnósticos ATIVOS (não arquivados) e ARQUIVADOS
                    const active = data.filter(d => !d.arquivado);
                    const archived = data.filter(d => d.arquivado === true);
                    
                    console.log('✅ Diagnósticos ATIVOS:', active.length);
                    console.log('🗂️ Diagnósticos ARQUIVADOS:', archived.length);
                    
                    setDiagnostics(active);
                    setArchivedDiagnostics(archived);
                } else {
                    console.log('ℹ️ Nenhum diagnóstico encontrado para este paciente');
                    setDiagnostics([]);
                    setArchivedDiagnostics([]);
                }
            } catch (err) {
                console.error('Erro ao buscar diagnósticos:', err);
            }
        };

        fetchDiagnostics();
    }, [patientId]);

    // Buscar diagnósticos arquivados (ocultados)
    React.useEffect(() => {
        const fetchArchivedDiagnostics = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('diagnosticos_historico_com_usuario')
                    .select('*')
                    .eq('patient_id', patientId)
                    .eq('arquivado', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar diagnósticos arquivados:', error.message);
                    return;
                }
                
                if (data) {
                    console.log('✅ Diagnósticos arquivados encontrados:', data.length);
                    setArchivedDiagnostics(data);
                } else {
                    setArchivedDiagnostics([]);
                }
            } catch (err) {
                console.warn('Erro ao buscar diagnósticos arquivados:', err);
            }
        };

        fetchArchivedDiagnostics();
    }, [patientId]);

    // Buscar log de auditoria (quem deletou/ocultou diagnósticos)
    React.useEffect(() => {
        const fetchAuditLog = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('diagnosticos_audit_log')
                    .select('*')
                    .eq('patient_id', patientId)
                    .eq('acao', 'OCULTADO')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.warn('⚠️ Tabela diagnosticos_audit_log pode não existir:', error.message);
                    return;
                }
                
                if (data) {
                    setAuditLogData(data);
                }
            } catch (err) {
                console.error('Erro ao buscar log de auditoria:', err);
            }
        };

        fetchAuditLog();
    }, [patientId]);

    // Buscar diurese do Supabase
    React.useEffect(() => {
        const fetchDiuresis = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('diurese')
                    .select('*')
                    .eq('patient_id', patientId)
                    .order('data_registro', { ascending: false });
                
                console.log('📊 Diurese data:', data);
                console.log('❌ Diurese error:', error);
                
                if (!error && data) {
                    setDiuresisData(data);
                }
            } catch (err) {
                console.error('Erro ao buscar diurese:', err);
            }
        };

        fetchDiuresis();
    }, [patientId]);

    // Buscar balanço hídrico do Supabase
    React.useEffect(() => {
        const fetchBalance = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('balanco_hidrico')
                    .select('*')
                    .eq('patient_id', patientId)
                    .order('data_registro', { ascending: false });
                
                console.log('💧 Balanço data:', data);
                console.log('❌ Balanço error:', error);
                
                if (!error && data) {
                    setBalanceData(data);
                }
            } catch (err) {
                console.error('Erro ao buscar balanço hídrico:', err);
            }
        };

        fetchBalance();
    }, [patientId]);

    // Buscar dietas do Supabase
    React.useEffect(() => {
        const fetchDiets = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('dietas_pacientes')
                    .select('*')
                    .eq('paciente_id', patientId);
                
                if (!error && data) {
                    setDietsData(data);
                }
            } catch (err) {
                console.error('Erro ao buscar dietas:', err);
            }
        };

        fetchDiets();
    }, [patientId]);

    // Buscar alertas do Supabase
    const [refreshAlerts, setRefreshAlerts] = React.useState(0);

    React.useEffect(() => {
        const fetchAlerts = async () => {
            if (!patientId) return;
            try {
                // Buscar de ambas as views
                const [alertasResult, tasksResult] = await Promise.all([
                    supabase
                        .from('alertas_paciente_view_completa')
                        .select('*')
                        .eq('patient_id', patientId),
                    supabase
                        .from('tasks_view_horario_br')
                        .select('*')
                        .eq('patient_id', patientId)
                ]);
                
                // Combinar dados de ambas as views
                const allAlerts = [
                    ...(alertasResult.data || []).map(a => ({ ...a, source: 'alertas_paciente' })),
                    ...(tasksResult.data || []).map(t => ({ ...t, source: 'tasks' }))
                ];
                
                if (!alertasResult.error && !tasksResult.error) {
                    setAlertsData(allAlerts);
                }
            } catch (err) {
                console.error('Erro ao buscar alertas:', err);
            }
        };

        fetchAlerts();
        
        // Subscribe a mudanças em tempo real
        const unsubscribeAlertas = supabase
            .channel(`public:alertas_paciente:patient_id=eq.${patientId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas_paciente' }, () => {
                fetchAlerts();
            })
            .subscribe();
            
        const unsubscribeTasks = supabase
            .channel(`public:tasks:patient_id=eq.${patientId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
                fetchAlerts();
            })
            .subscribe();
        
        return () => {
            supabase.removeChannel(unsubscribeAlertas);
            supabase.removeChannel(unsubscribeTasks);
        };
    }, [patientId, refreshAlerts]);

    // Buscar completações de alertas do Supabase
    React.useEffect(() => {
        const fetchAlertCompletions = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('alert_completions_with_user')
                    .select('*')
                    .eq('patient_id', patientId);
                    // Nota: patient_id vem do JOIN com tasks na view
                
                if (error) {
                    console.warn('⚠️ View alert_completions_with_user pode não existir:', error.message);
                    return;
                }
                
                if (data) {
                    setAlertCompletions(data);
                }
            } catch (err) {
                console.warn('View alert_completions_with_user não disponível');
            }
        };

        fetchAlertCompletions();
        
        // Subscribe a mudanças em tempo real
        const unsubscribeCompletions = supabase
            .channel('public:alert_completions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_completions' }, () => {
                fetchAlertCompletions();
            })
            .subscribe();
        
        return () => {
            supabase.removeChannel(unsubscribeCompletions);
        };
    }, [patientId]);

    // Buscar justificativas de alertas
    React.useEffect(() => {
        const fetchAlertJustifications = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('monitoramento_geral_justificativas')
                    .select('*')
                    .eq('patient_id', patientId);
                
                if (error) {
                    console.warn('⚠️ View monitoramento_geral_justificativas pode não existir:', error.message);
                    return;
                }
                
                console.log('🟢 Justificativas carregadas:', data);
                
                if (data) {
                    setAlertJustifications(data);
                }
            } catch (err) {
                console.warn('View monitoramento_geral_justificativas não disponível');
            }
        };

        fetchAlertJustifications();
    }, [patientId]);

    // Buscar alertas arquivados
    React.useEffect(() => {
        const fetchArchivedAlerts = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('monitoramento_arquivamento_geral')
                    .select('*')
                    .eq('patient_id', patientId);
                
                if (error) {
                    console.warn('⚠️ View monitoramento_arquivamento_geral pode não existir:', error.message);
                    return;
                }
                
                console.log('🗄️ Alertas arquivados carregados:', data);
                
                if (data) {
                    setArchivedAlerts(data);
                }
            } catch (err) {
                console.warn('View monitoramento_arquivamento_geral não disponível');
            }
        };

        fetchArchivedAlerts();
    }, [patientId]);

    // Buscar dispositivos arquivados
    React.useEffect(() => {
        const fetchArchivedDevices = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('vw_dispositivos_detalhado')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .eq('is_archived', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar dispositivos arquivados:', error.message);
                    return;
                }
                
                console.log('🗄️ Dispositivos arquivados carregados:', data);
                
                if (data) {
                    setArchivedDevices(data);
                }
            } catch (err) {
                console.warn('Erro ao buscar dispositivos arquivados:', err);
            }
        };

        fetchArchivedDevices();
    }, [patientId]);

    // Buscar exames arquivados
    React.useEffect(() => {
        const fetchArchivedExams = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('vw_exames_detalhado')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .eq('is_archived', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar exames arquivados:', error.message);
                    return;
                }
                
                console.log('🗄️ Exames arquivados carregados:', data);
                
                if (data) {
                    setArchivedExams(data);
                }
            } catch (err) {
                console.warn('Erro ao buscar exames arquivados:', err);
            }
        };

        fetchArchivedExams();
    }, [patientId]);

    // Buscar medicações arquivadas
    React.useEffect(() => {
        const fetchArchivedMedications = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('vw_medicacoes_detalhado')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .eq('is_archived', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar medicações arquivadas:', error.message);
                    return;
                }
                
                console.log('🗄️ Medicações arquivadas carregadas:', data);
                
                if (data) {
                    setArchivedMedications(data);
                }
            } catch (err) {
                console.warn('Erro ao buscar medicações arquivadas:', err);
            }
        };

        fetchArchivedMedications();
    }, [patientId]);

    // Buscar procedimentos arquivados
    React.useEffect(() => {
        const fetchArchivedProcedures = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('vw_procedimentos_detalhado')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .eq('is_archived', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar procedimentos arquivados:', error.message);
                    return;
                }
                
                console.log('🗄️ Procedimentos arquivados carregados:', data);
                
                if (data) {
                    setArchivedProcedures(data);
                }
            } catch (err) {
                console.warn('Erro ao buscar procedimentos arquivados:', err);
            }
        };

        fetchArchivedProcedures();
    }, [patientId]);

    // Buscar culturas arquivadas
    React.useEffect(() => {
        const fetchArchivedCultures = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('vw_culturas_detalhado')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .eq('is_archived', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar culturas arquivadas:', error.message);
                    return;
                }
                
                console.log('🗄️ Culturas arquivadas carregadas:', data);
                
                if (data) {
                    setArchivedCultures(data);
                }
            } catch (err) {
                console.warn('Erro ao buscar culturas arquivadas:', err);
            }
        };

        fetchArchivedCultures();
    }, [patientId]);

    // Buscar dietas arquivadas
    React.useEffect(() => {
        const fetchArchivedDiets = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('vw_dietas_detalhado')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .eq('is_archived', true);
                
                if (error) {
                    console.warn('⚠️ Erro ao buscar dietas arquivadas:', error.message);
                    return;
                }
                
                console.log('🗄️ Dietas arquivadas carregadas:', data);
                
                if (data) {
                    setArchivedDiets(data);
                }
            } catch (err) {
                console.warn('Erro ao buscar dietas arquivadas:', err);
            }
        };

        fetchArchivedDiets();
    }, [patientId]);

    // Buscar situações clínicas 24h (ativas + históricas)
    React.useEffect(() => {
        const fetchClinicalSituations24h = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('clinical_situations_24h')
                    .select('*')
                    .eq('patient_id', patientId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('⚠️ Erro ao buscar situação clínica 24h:', error.message);
                    return;
                }

                setClinicalSituations24h(data || []);
            } catch (err) {
                console.warn('Erro ao buscar situação clínica 24h:', err);
            }
        };

        fetchClinicalSituations24h();
    }, [patientId]);

    // Buscar histórico de aportes
    React.useEffect(() => {
        const fetchAportesHistorico = async () => {
            if (!patientId) return;
            try {
                const { data, error } = await supabase
                    .from('aportes_pacientes')
                    .select('*')
                    .eq('paciente_id', patientId)
                    .order('data_referencia', { ascending: false });

                if (error) {
                    console.warn('⚠️ Erro ao buscar aportes:', error.message);
                    return;
                }

                setAportesHistorico(data || []);
            } catch (err) {
                console.warn('Erro ao buscar aportes:', err);
            }
        };

        fetchAportesHistorico();
    }, [patientId]);

    type TimelineEvent = {
        timestamp: string;
        icon: React.FC<{ className?: string; }>;
        description: string;
        hasTime: boolean;
    };

    const patientHistory = useMemo(() => {
        if (!patient) return {};

        const events: TimelineEvent[] = [];

        // Adicionar comorbidades
        if (patient.comorbidade) {
            const comorbidades = patient.comorbidade.split('|').filter((c: string) => c.trim());
            comorbidades.forEach(comorbidade => {
                events.push({
                    timestamp: patient.admissionDate || new Date().toISOString(),
                    icon: HeartPulseIcon,
                    description: `[COMORBIDADE] Comorbidade: ${comorbidade}`,
                    hasTime: false,
                });
            });
        }

        patient.devices.filter(d => !d.isArchived).forEach(device => {
            events.push({
                timestamp: new Date(device.startDate).toISOString(),
                icon: CpuIcon,
                description: `[DISPOSITIVO] Dispositivo Inserido: ${device.name} em ${device.location}.`,
                hasTime: false,
            });
            if (device.removalDate) {
                events.push({
                    timestamp: new Date(device.removalDate).toISOString(),
                    icon: CpuIcon,
                    description: `[DISPOSITIVO] Dispositivo Retirado: ${device.name}.`,
                    hasTime: false,
                });
            }
        });

        patient.medications.filter(m => !m.isArchived).forEach(med => {
            events.push({
                timestamp: new Date(med.startDate).toISOString(),
                icon: PillIcon,
                description: `[MEDICACAO] Início Medicação: ${med.name} (${med.dosage}).`,
                hasTime: false,
            });
            if (med.endDate) {
                events.push({
                    timestamp: new Date(med.endDate).toISOString(),
                    icon: PillIcon,
                    description: `[MEDICACAO] Fim Medicação: ${med.name}.`,
                    hasTime: false,
                });
            }
        });

        patient.exams.filter(e => !e.isArchived).forEach(exam => {
            events.push({
                timestamp: new Date(exam.date).toISOString(),
                icon: FileTextIcon,
                description: `[EXAME] Exame Realizado: ${exam.name}.`,
                hasTime: false,
            });
        });

        patient.surgicalProcedures.filter(p => !p.isArchived).forEach(procedure => {
            events.push({
                timestamp: new Date(procedure.date).toISOString(),
                icon: ScalpelIcon,
                description: `[CIRURGICO] Cirurgia Realizada: ${procedure.name} por Dr(a). ${procedure.surgeon}.${procedure.notes ? ` Notas: ${procedure.notes}` : ''}`,
                hasTime: false,
            });
        });

        const patientAlerts = tasks.filter(task => task.patientId && patient.id && task.patientId.toString() === patient.id.toString() && task.status === 'alerta');
        // Removido: alertas de tasks duplicadas - usar apenas alertsData que vem da view com todos os dados formatados

        patient.scaleScores?.forEach(score => {
            events.push({
                timestamp: score.date,
                icon: BarChartIcon,
                description: `[ESCALA] Avaliação de Escala: ${score.scaleName} - Pontuação: ${score.score} (${score.interpretation}).`,
                hasTime: true,
            });
        });

        // Adicionar diagnósticos ATIVOS (não arquivados)
        console.log('🔵 Processando diagnostics no history:', diagnostics);
        diagnostics.forEach(diagnostic => {
            // Exibe o label vindo da view (que contém JOIN correto com pergunta_opcoes_diagnostico)
            const label = diagnostic.opcao_label || 'Não informado';
            const createdByName = diagnostic.nome_criador || 'Não informado';
            
            let description = `[DIAGNOSTICO] Diagnóstico: ${label}${diagnostic.texto_digitado ? ` - ${diagnostic.texto_digitado}` : ''} (Status: ${diagnostic.status}).\n👤 Criado por: ${createdByName}`;
            
            events.push({
                timestamp: diagnostic.data_criacao || new Date().toISOString(),
                icon: ClipboardIcon,
                description: description,
                hasTime: true,
            });
        });

        // Adicionar diagnósticos ocultados/arquivados
        console.log('🔵 Processando archivedDiagnostics no history:', archivedDiagnostics);
        archivedDiagnostics.forEach(diagnostic => {
            const label = diagnostic.opcao_label || 'Não informado';
            const createdByName = diagnostic.nome_criador || 'Não informado';
            const archivedByName = diagnostic.nome_arquivador || 'Desconhecido';
            
            // Descrição sobre diagnóstico arquivado
            let description = `[DIAGNOSTICO_ARQUIVADO] ⚠️ DIAGNÓSTICO OCULTADO/ARQUIVADO\n📋 Diagnóstico: ${label}${diagnostic.texto_digitado ? ` - ${diagnostic.texto_digitado}` : ''}\n👤 Criado por: ${createdByName}\n🚫 Arquivado por: ${archivedByName}\n📅 Motivo: ${diagnostic.motivo_arquivamento || 'Não informado'}`;
            
            events.push({
                timestamp: diagnostic.data_arquivamento || diagnostic.data_criacao || new Date().toISOString(),
                icon: ClipboardIcon,
                description: description,
                hasTime: true,
            });
        });

        // Adicionar log de auditoria (para rastreamento de quem deletou)
        console.log('🔵 Processando auditLogData no history:', auditLogData);
        auditLogData.forEach(log => {
            const description = `[AUDITORIA] 📋 DIAGNÓSTICO DELETADO REGISTRADO\nDiagnóstico: ${log.diagnostico_label || 'Não informado'}\n👤 Criado por: ${log.criado_por_nome || 'Desconhecido'}\n🚫 DELETADO/OCULTADO POR: ${log.modificado_por_nome || 'Desconhecido'}\nStatus: ${log.diagnostico_status || 'Não informado'}`;
            
            events.push({
                timestamp: log.created_at || new Date().toISOString(),
                icon: ClipboardIcon,
                description: description,
                hasTime: true,
            });
        });

        // Adicionar diurese dos dados do Supabase
        console.log('🔵 Processando diuresisData no history:', diuresisData);
        diuresisData.forEach(diuresis => {
            const result = ((diuresis.volume / diuresis.horas) / diuresis.peso).toFixed(2);
            const eventData = {
                timestamp: diuresis.data_registro || new Date().toISOString(),
                icon: DropletIcon,
                description: `[DIURESE] Diurese: ${result} mL/kg/h (Peso: ${diuresis.peso}kg | Volume: ${diuresis.volume}mL | Período: ${diuresis.horas}h).`,
                hasTime: true,
            };
            console.log('➕ Adicionando evento de diurese:', eventData);
            events.push(eventData);
        });

        // Adicionar balanço hídrico dos dados do Supabase
        console.log('🔵 Processando balanceData no history:', balanceData);
        balanceData.forEach(balance => {
            const result = (balance.volume / (balance.peso * 10)).toFixed(2);
            const eventData = {
                timestamp: balance.data_registro || new Date().toISOString(),
                icon: DropletIcon,
                description: `[BALANÇO] Balanço Hídrico: ${balance.volume > 0 ? '+' : ''}${result}% (Peso: ${balance.peso}kg | Volume: ${balance.volume > 0 ? '+' : ''}${balance.volume}mL).`,
                hasTime: true,
            };
            console.log('➕ Adicionando evento de balanço:', eventData);
            events.push(eventData);
        });

        // Adicionar dietas
        dietsData.filter((d: any) => !d.is_archived).forEach(diet => {
            // Montar descrição com todos os dados, incluindo VET AT e PT AT
            let description = `[DIETA] Dieta Iniciada: ${diet.tipo}`;
            
            if (diet.volume) description += ` | Volume: ${diet.volume}mL`;
            if (diet.vet) description += ` | VET: ${diet.vet}kcal/dia`;
            if (diet.vet_pleno) description += ` | VET Pleno: ${diet.vet_pleno}kcal/dia`;
            if (diet.vet_at) description += ` | VET AT: ${Number(diet.vet_at).toFixed(1)}%`;
            if (diet.pt) description += ` | PT: ${diet.pt}g/dia`;
            if (diet.pt_g_dia) description += ` | PT Plena: ${diet.pt_g_dia}g/dia`;
            if (diet.pt_at) description += ` | PT AT: ${Number(diet.pt_at).toFixed(1)}%`;
            if (diet.th) description += ` | TH: ${diet.th}ml/m²/dia`;
            if (diet.observacao) description += ` | Obs: ${diet.observacao}`;
            
            events.push({
                timestamp: diet.data_inicio || new Date().toISOString(),
                icon: AppleIcon,
                description: description,
                hasTime: false,
            });
            if (diet.data_remocao) {
                events.push({
                    timestamp: diet.data_remocao || new Date().toISOString(),
                    icon: AppleIcon,
                    description: `[DIETA] Dieta Retirada: ${diet.tipo}`,
                    hasTime: false,
                });
            }
        });

        // Adicionar alertas de ambas as tabelas
        alertsData.forEach(alert => {
            // Normalizar nomes de campos entre as duas views
            const desc = alert.alertaclinico || alert.descricao_limpa || alert.description || 'Sem descrição';
            const resp = alert.responsavel || alert.responsible || 'Não informado';
            const prazoLimite = alert.prazo_limite_formatado || alert.prazo_limite_formatado || 'N/A';
            const prazoDuracao = alert.prazo_formatado || alert.prazo_formatado || 'N/A';
            const dataHora = alert.hora_criacao_formatado || alert.hora_criacao_formatado || 'N/A';
            const criadoPor = alert.created_by_name || 'Não informado';
            const justificativa = alert.justificativa || alert.justification || null;
            
            // Usar live_status para mostrar se está no prazo ou fora do prazo
            const liveStatus = alert.live_status || 'Não definido';
            
            // Usar SEMPRE a data de criação (created_at), não a data de vencimento
            const creationDateISO = alert.created_at || alert.hora_criacao || new Date().toISOString();
            
            // Montar descrição com justificativa se existir
            let description = `[ALERTA] 🔔 ${desc}\n👤 Responsável: ${resp}\n📅 Prazo Limite: ${prazoLimite}\n⏳ Prazo: ${prazoDuracao}\n🕐 Criado em: ${dataHora}\n👨‍⚕️ Criado por: ${criadoPor}\n📊 Status: ${liveStatus}`;
            
            if (justificativa) {
                description += `\n\n📝 Justificativa: ${justificativa}`;
            }
            
            events.push({
                timestamp: creationDateISO,
                icon: BellIcon,
                description: description,
                hasTime: true,
            });
        });

        // Adicionar completações de alertas
        alertCompletions.forEach(completion => {
            const sourceLabel = completion.source === 'tasks' ? 'Task' : 'Alerta Clínico';
            const alertDesc = completion.alert_description || completion.description || `ID: ${completion.alert_id}`;
            events.push({
                timestamp: completion.completed_at || completion.created_at || new Date().toISOString(),
                icon: CheckCircleIcon,
                description: `[COMPLETACAO_ALERTA] ✓ Alerta Concluído (${sourceLabel})\n📋 ${alertDesc}\n👤 Concluído por: ${completion.completed_by_name || 'Não informado'}\n📅 Concluído em: ${completion.completed_at ? new Date(completion.completed_at).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar justificativas de alertas
        console.log('🔵 Processando alertJustifications:', alertJustifications);
        alertJustifications.forEach(just => {
            const tipoLabel = just.tipo_origem === 'Alerta' ? '🔔 Alerta' : '📋 Tarefa';
            console.log('➕ Adicionando justificativa:', just);
            events.push({
                timestamp: just.data_justificativa || new Date().toISOString(),
                icon: CheckCircleIcon,
                description: `[JUSTIFICATIVA_ADICIONADA] ✓ Justificativa Adicionada (${tipoLabel})\n📋 ${just.descricao}\n Justificativa: ${just.justificativa}\n👨‍⚕️ Justificado por: ${just.quem_justificou_nome}\n📅 Justificado em: ${just.data_justificativa ? new Date(just.data_justificativa).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar alertas arquivados
        console.log('🗄️ Processando archivedAlerts:', archivedAlerts);
        archivedAlerts.forEach(archived => {
            const tipoLabel = archived.tipo_origem === 'Alerta' ? '🔔 Alerta' : '📋 Tarefa';
            console.log('📦 Adicionando arquivamento:', archived);
            events.push({
                timestamp: archived.data_arquivamento || new Date().toISOString(),
                icon: CheckCircleIcon,
                description: `[ALERTA_ARQUIVADO] 📦 ${tipoLabel} Arquivado\n📋 Descrição: ${archived.descricao_original}\n📝 Motivo do Arquivamento: ${archived.motivo_do_arquivamento}\n👨‍⚕️ Arquivado por: ${archived.quem_arquivou}\n📅 Arquivado em: ${archived.data_arquivamento ? new Date(archived.data_arquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar dispositivos arquivados
        console.log('🗄️ Processando archivedDevices:', archivedDevices);
        archivedDevices.forEach(device => {
            console.log('📦 Adicionando dispositivo arquivado:', device);
            const dataArquivamento = device.created_at; // A data de quando foi arquivado
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: CpuIcon,
                description: `[DISPOSITIVO_ARQUIVADO] 🔌 Dispositivo Arquivado\n📋 Dispositivo: ${device.tipo_dispositivo} - ${device.localizacao}\n📝 Motivo do Arquivamento: ${device.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${device.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar exames arquivados
        console.log('🗄️ Processando archivedExams:', archivedExams);
        archivedExams.forEach(exam => {
            console.log('📦 Adicionando exame arquivado:', exam);
            const dataArquivamento = exam.created_at;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: FileTextIcon,
                description: `[EXAME_ARQUIVADO] 📄 Exame Arquivado\n📋 Exame: ${exam.nome_exame}\n📝 Motivo do Arquivamento: ${exam.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${exam.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar medicações arquivadas
        console.log('🗄️ Processando archivedMedications:', archivedMedications);
        archivedMedications.forEach(medication => {
            console.log('📦 Adicionando medicação arquivada:', medication);
            const dataArquivamento = medication.created_at;
            const dosagem = `${medication.dosagem_valor} ${medication.unidade_medida}`;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: PillIcon,
                description: `[MEDICACAO_ARQUIVADA] 💊 Medicação Arquivada\n📋 Medicação: ${medication.nome_medicacao} - ${dosagem}\n📝 Motivo do Arquivamento: ${medication.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${medication.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar procedimentos arquivados
        console.log('🗄️ Processando archivedProcedures:', archivedProcedures);
        archivedProcedures.forEach(procedure => {
            console.log('📦 Adicionando procedimento arquivado:', procedure);
            const dataArquivamento = procedure.created_at;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: ScalpelIcon,
                description: `[PROCEDIMENTO_ARQUIVADO] ⚒️ Procedimento Cirúrgico Arquivado\n📋 Procedimento: ${procedure.nome_procedimento}\n👨‍⚕️ Cirurgião: ${procedure.nome_cirurgiao || 'Não informado'}\n📝 Motivo do Arquivamento: ${procedure.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${procedure.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar culturas ativas
        patient.cultures?.filter(c => !c.isArchived).forEach(culture => {
            events.push({
                timestamp: culture.collectionDate || new Date().toISOString(),
                icon: BeakerIcon,
                description: `[CULTURA] 🧪 Cultura: ${culture.site || 'Não informado'} - ${culture.microorganism || 'Não identificado'}${culture.observation ? ` | Obs: ${culture.observation}` : ''}`,
                hasTime: false,
            });
        });

        // Adicionar culturas arquivadas
        console.log('🗄️ Processando archivedCultures:', archivedCultures);
        archivedCultures.forEach(culture => {
            console.log('📦 Adicionando cultura arquivada:', culture);
            const dataArquivamento = culture.created_at;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: BeakerIcon,
                description: `[CULTURA_ARQUIVADA] 🧪 Cultura Arquivada\n📋 Local: ${culture.local}\n🦠 Microorganismo: ${culture.microorganismo}\n📝 Motivo do Arquivamento: ${culture.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${culture.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar dietas arquivadas
        console.log('🗄️ Processando archivedDiets:', archivedDiets);
        archivedDiets.forEach(diet => {
            console.log('📦 Adicionando dieta arquivada:', diet);
            const dataArquivamento = diet.created_at;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: AppleIcon,
                description: `[DIETA_ARQUIVADA] 🍽️ Dieta Arquivada\n📋 Tipo: ${diet.tipo}\n${diet.volume ? `💧 Volume: ${diet.volume} ml\n` : ''}${diet.vet ? `⚡ VET: ${diet.vet} kcal/dia\n` : ''}📝 Motivo do Arquivamento: ${diet.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${diet.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Situação clínica das últimas 24h (depois de 24h fica só no histórico)
        clinicalSituations24h.forEach((situation: any) => {
            const visibleUntil = situation.visible_until ? new Date(situation.visible_until) : null;
            const now = new Date();
            const status24h = visibleUntil && visibleUntil > now ? 'Ativa (24h)' : 'Histórico (>24h)';

            events.push({
                timestamp: situation.created_at || new Date().toISOString(),
                icon: ClipboardIcon,
                description: `[SITUACAO_24H] 📝 Situação clínica 24h (${status24h})\n${situation.situacao_texto}`,
                hasTime: true,
            });
        });

        // Aportes
        aportesHistorico.forEach((aporte: any) => {
            const vo = Number(aporte.vo_ml_kg_h || 0);
            const hv = Number(aporte.hv_npt_ml_kg_h || 0);
            const med = Number(aporte.medicacoes_ml_kg_h || 0);
            const tht = Number(aporte.tht_ml_kg_h || 0);

            events.push({
                timestamp: aporte.created_at || `${aporte.data_referencia}T00:00:00`,
                icon: DropletIcon,
                description: `[APORTES] 💧 Aportes (${aporte.data_referencia})\nVO: ${vo.toFixed(2)} ml/kg/h | HV/NPT: ${hv.toFixed(2)} ml/kg/h | MED: ${med.toFixed(2)} ml/kg/h\nTHT: ${tht.toFixed(2)} ml/kg/h`,
                hasTime: true,
            });
        });

        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const groupedEvents = events.reduce((acc, event) => {
            const dateKey = event.timestamp.split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(event);
            return acc;
        }, {} as Record<string, TimelineEvent[]>);

        return groupedEvents;
    }, [patient, tasks, diagnostics, diuresisData, balanceData, dietsData, alertsData, alertCompletions, alertJustifications, archivedAlerts, archivedDevices, archivedExams, archivedMedications, archivedProcedures, archivedCultures, archivedDiets, clinicalSituations24h, aportesHistorico, resolvedDiagnostics]);

    const handleGeneratePdf = () => {
        // ... (PDF generation logic remains the same)
        if (!patient) return;

        // Função auxiliar para verificar se a data está dentro do filtro
        const isDateInRange = (date: string | undefined) => {
            if (!date) return false;
            // Extrair apenas a parte da data (YYYY-MM-DD) ignorando hora/timezone
            const eventDateStr = date.split('T')[0];
            // Comparação de strings de data (YYYY-MM-DD format é comparável lexicograficamente)
            const passesFilter = 
                (!dataInicio || eventDateStr >= dataInicio) && 
                (!dataFinal || eventDateStr <= dataFinal);
            return passesFilter;
        };

        // Função auxiliar para verificar se a categoria está selecionada
        const isCategorySelected = (category: string) => {
            if (selectedCategories.size === 0) return true; // Se nenhuma categoria selecionada, mostrar tudo
            return selectedCategories.has(category);
        };

        const generateDeviceList = () => {
            const filtered = patient.devices.filter(d => 
                isDateInRange(d.startDate) && isCategorySelected('Dispositivos')
            );
            return {
                hasData: filtered.length > 0,
                html: filtered.map(d => `
                    <li>
                        <strong>${d.name} (${d.location})</strong><br>
                        Início: ${formatDateToBRL(d.startDate)}
                        ${d.removalDate ? `<br>Retirada: ${formatDateToBRL(d.removalDate)}` : ''}
                    </li>
                `).join('')
            };
        };

        const generateMedicationList = () => {
            const filtered = patient.medications.filter(m => 
                isDateInRange(m.startDate) && isCategorySelected('Medicações')
            );
            return {
                hasData: filtered.length > 0,
                html: filtered.map(m => `
                    <li>
                        <strong>${m.name} (${m.dosage})</strong><br>
                        Início: ${formatDateToBRL(m.startDate)}
                        ${m.endDate ? `<br>Fim: ${formatDateToBRL(m.endDate)}` : ''}
                    </li>
                `).join('')
            };
        };

        const generateExamList = () => {
            const filtered = patient.exams.filter(e => 
                isDateInRange(e.date) && isCategorySelected('Exames')
            );
            return {
                hasData: filtered.length > 0,
                html: filtered.map(e => `
                    <li>
                        <strong>${e.name}</strong><br>
                        Data: ${formatDateToBRL(e.date)}
                        ${e.observation ? `<br><em>Obs: ${e.observation}</em>` : ''}
                    </li>
                `).join('')
            };
        };

        const generateSurgicalList = () => {
            const filtered = patient.surgicalProcedures.filter(p => 
                isDateInRange(p.date) && isCategorySelected('Cirúrgico')
            );
            return {
                hasData: filtered.length > 0,
                html: filtered.map(p => `
                    <li>
                        <strong>${p.name}</strong> - Dr(a): ${p.surgeon}<br>
                        Data: ${formatDateToBRL(p.date)}
                        ${p.notes ? `<br><em>Obs: ${p.notes}</em>` : ''}
                    </li>
                `).join('')
            };
        };

        const generateDietList = () => {
            const filtered = patient.diets?.filter(d => 
                isDateInRange(d.data_inicio) && isCategorySelected('Dietas')
            ) || [];
            return {
                hasData: filtered.length > 0,
                html: filtered.map(d => `
                    <li>
                        <strong>${d.type}</strong><br>
                        Início: ${formatDateToBRL(d.data_inicio)}
                        ${d.volume ? `<br>Volume: ${d.volume}mL` : ''}
                        ${d.vet ? `<br>VET: ${d.vet}kcal/dia` : ''}
                        ${d.pt ? `<br>Proteína (PT): ${d.pt}g/dia` : ''}
                        ${d.th ? `<br>Taxa Hídrica (TH): ${d.th}ml/m²/dia` : ''}
                        ${d.data_remocao ? `<br>Retirada: ${formatDateToBRL(d.data_remocao)}` : ''}
                        ${d.observacao ? `<br><em>Obs: ${d.observacao}</em>` : ''}
                    </li>
                `).join('')
            };
        };

        const generateScaleScoresList = () => {
            const filtered = patient.scaleScores?.filter(s => 
                isDateInRange(s.date) && isCategorySelected('Escalas')
            ) || [];
            return {
                hasData: filtered.length > 0,
                html: filtered.map(s => `
                    <li>
                        <strong>${s.scaleName}</strong> - Pontuação: ${s.score} (${s.interpretation})<br>
                        Data e Hora: ${formatDateTimeWithHour(s.date)}
                    </li>
                `).join('')
            };
        };

        const generateDiuresisListPDF = () => {
            const filtered = (patient.diurese || []).filter(d => 
                isDateInRange(d.data_registro) && isCategorySelected('Diurese')
            );
            return {
                hasData: filtered.length > 0,
                html: filtered.map(d => `
                    <li>
                        <strong>Diurese: ${d.resultado || 'N/A'} mL/kg/h</strong><br>
                        Peso: ${d.peso}kg | Volume: ${d.volume}mL | Período: ${d.horas}h<br>
                        Data: ${formatDateToBRL(d.data_registro)}
                    </li>
                `).join('')
            };
        };

        const generateBalanceListPDF = () => {
            const filtered = (patient.balanco_hidrico || []).filter(b => 
                isDateInRange(b.data_registro) && isCategorySelected('Balanço Hídrico')
            );
            return {
                hasData: filtered.length > 0,
                html: filtered.map(b => `
                    <li>
                        <strong>Balanço Hídrico: ${b.resultado || 'N/A'}%</strong><br>
                        Peso: ${b.peso}kg | Volume: ${b.volume > 0 ? '+' : ''}${b.volume}mL<br>
                        Data: ${formatDateToBRL(b.data_registro)}
                    </li>
                `).join('')
            };
        };

        const devicesData = generateDeviceList();
        const medicationsData = generateMedicationList();
        const examsData = generateExamList();
        const surgeriesData = generateSurgicalList();
        const dietsData = generateDietList();
        const scalesData = generateScaleScoresList();
        const diuresisData = generateDiuresisListPDF();
        const balanceData = generateBalanceListPDF();

        const generateHistoryList = () => {
            let allEventsHtml = '';
            let totalEvents = 0;

            Object.entries(displayedHistory).forEach(([date, eventsOnDate]) => {
                // Os eventos em displayedHistory já estão filtrados por data e categoria
                // então apenas usar diretamente
                const filtered = (eventsOnDate as TimelineEvent[]);

                if (filtered.length === 0) return;

                totalEvents += filtered.length;
                
                allEventsHtml += `
                    <div class="history-group">
                        <h3>${formatHistoryDate(date)}</h3>
                        ${filtered.map(event => {
                            const eventTime = new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const eventDate = new Date(event.timestamp).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                            const eventDateTime = new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            
                            // Construir evento com todas as informações em linhas
                            let lines = [];
                            
                            // Horário
                            if (event.hasTime) {
                                lines.push(`<strong>Horário: [${eventTime}]</strong>`);
                            }
                            
                            // Descrição/Tipo (converter quebras de linha em <br/>)
                            if (event.description) {
                                const descriptionHtml = event.description.split('\n').join('<br/>');
                                lines.push(descriptionHtml);
                            }
                            
                            // Responsável
                            // if (event.responsible) {
                            //     lines.push(`<strong>Responsável:</strong> ${event.responsible}`);
                            // }
                            
                            // Prazo
                            // if (event.deadline) {
                            //     const deadlineDate = new Date(event.deadline).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                            //     const deadlineTime = new Date(event.deadline).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            //     lines.push(`<strong>Prazo:</strong> ${deadlineDate} ${deadlineTime}`);
                            // }
                            
                            // Tempo (duração)
                            // if (event.timeLabel) {
                            //     lines.push(`<strong>Tempo:</strong> ${event.timeLabel}`);
                            // }
                            
                            // Data/Hora (completa)
                            lines.push(`<strong>Data/Hora:</strong> ${eventDate} ${eventDateTime}`);
                            
                            // Criado por
                            // if (event.createdBy) {
                            //     lines.push(`<strong>Criado por:</strong> ${event.createdBy}`);
                            // }
                            
                            // Status
                            // if (event.status) {
                            //     lines.push(`<strong>Status:</strong> ${event.status}`);
                            // }
                            
                            return `
                            <div class="event-item">
                                ${lines.map(line => `<div class="event-line">${line}</div>`).join('')}
                            </div>
                            `;
                        }).join('')}
                    </div>
                `;
            });

            return {
                hasData: totalEvents > 0,
                html: allEventsHtml
            };
        };

        const historyData = generateHistoryList();

        const htmlContent = `
            <html>
            <head>
                <title>Relatório do Paciente - ${patient.name}</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; color: #333; }
                    h1, h2, h3 { color: #00796b; border-bottom: 2px solid #e0f2f1; padding-bottom: 5px; }
                    h1 { font-size: 24px; }
                    h2 { font-size: 20px; margin-top: 30px; }
                    h3 { font-size: 16px; margin-top: 20px; border-bottom: 2px solid #00796b; padding-bottom: 10px; color: #00796b; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #e0f2f1; }
                    ul { list-style-type: none; padding-left: 0; }
                    li { background-color: #f7f7f7; border: 1px solid #eee; padding: 10px; margin-bottom: 8px; border-radius: 4px; }
                    .history-group { margin-top: 20px; }
                    .history-group h3 { font-size: 16px; color: #00796b; margin-bottom: 15px; border-bottom: 1px solid #e0f2f1; padding-bottom: 8px; }
                    .event-item { margin: 10px 0; padding: 10px; background-color: #fafafa; border-left: 3px solid #00796b; border-radius: 2px; }
                    .event-line { margin: 5px 0; font-size: 13px; line-height: 1.5; }
                </style>
            </head>
            <body>
                <h1>Relatório do Paciente</h1>
                
                <h2>Dados do Paciente</h2>
                <table>
                    <tr><th>Nome</th><td>${patient.name}</td></tr>
                    <tr><th>Leito</th><td>${patient.bedNumber}</td></tr>
                    <tr><th>Nascimento</th><td>${formatDateToBRL(patient.dob)}</td></tr>
                    <tr><th>Nome da Mãe</th><td>${patient.motherName}</td></tr>
                    <tr><th>Diagnóstico</th><td>${patient.ctd}</td></tr>
                </table>

                ${devicesData.hasData ? `
                    <h2>Dispositivos</h2>
                    <ul>${devicesData.html}</ul>
                ` : ''}
                
                ${medicationsData.hasData ? `
                    <h2>Medicações</h2>
                    <ul>${medicationsData.html}</ul>
                ` : ''}

                ${examsData.hasData ? `
                    <h2>Exames</h2>
                    <ul>${examsData.html}</ul>
                ` : ''}
                
                ${surgeriesData.hasData ? `
                    <h2>Cirurgias</h2>
                    <ul>${surgeriesData.html}</ul>
                ` : ''}

                ${dietsData.hasData ? `
                    <h2>Dietas</h2>
                    <ul>${dietsData.html}</ul>
                ` : ''}

                ${diuresisData.hasData ? `
                    <h2>Diurese</h2>
                    <ul>${diuresisData.html}</ul>
                ` : ''}

                ${balanceData.hasData ? `
                    <h2>Balanço Hídrico</h2>
                    <ul>${balanceData.html}</ul>
                ` : ''}

                ${scalesData.hasData ? `
                    <h2>Avaliações de Escalas</h2>
                    <ul>${scalesData.html}</ul>
                ` : ''}

                ${historyData.hasData ? `
                    <h2>Histórico de Eventos</h2>
                    ${historyData.html}
                ` : ''}

            </body>
            </html>
        `;

        const pdfWindow = window.open('', '_blank');
        if (pdfWindow) {
            pdfWindow.document.write(htmlContent);
            pdfWindow.document.close();
            pdfWindow.focus();
            setTimeout(() => {
                pdfWindow.print();
            }, 500);
        } else {
            alert('Por favor, habilite pop-ups para gerar o PDF.');
        }
    };


    if (!patient) {
        return <p>Paciente não encontrado.</p>;
    }

    const getUniqueEventTypes = () => {
        const types = new Set<string>();
        Object.values(patientHistory).forEach((events: any) => {
            (events as TimelineEvent[]).forEach(event => {
                types.add(event.description.split('\n')[0].substring(0, 50)); // Pega tipo do evento
            });
        });
        return Array.from(types).sort();
    };

        const getEventCategory = (description: string): string | null => {
        // Usar os marcadores [TIPO] que foram adicionados às descrições
        const categoryMap: Record<string, string> = {
            '[DISPOSITIVO]': 'Dispositivos',
            '[MEDICACAO]': 'Medicações',
            '[EXAME]': 'Exames',
            '[CIRURGICO]': 'Cirúrgico',
            '[ESCALA]': 'Escalas',
            '[DIAGNOSTICO]': 'Diagnósticos',
            '[CULTURA]': 'Culturas',
            '[DIURESE]': 'Diurese',
            '[BALANÇO]': 'Balanço Hídrico',
            '[ALERTA]': 'Alertas',
            '[COMORBIDADE]': 'Comorbidades',
            '[COMPLETACAO_ALERTA]': 'Completações',
            '[DIETA]': 'Dietas',
            '[JUSTIFICATIVA_ADICIONADA]': 'Justificativas',
            '[ALERTA_ARQUIVADO]': 'Arquivamentos',
            '[DISPOSITIVO_ARQUIVADO]': 'Arquivamentos Dispositivos',
            '[EXAME_ARQUIVADO]': 'Arquivamentos Exames',
            '[MEDICACAO_ARQUIVADA]': 'Arquivamentos Medicações',
            '[PROCEDIMENTO_ARQUIVADO]': 'Arquivamentos Procedimentos',
            '[CULTURA_ARQUIVADA]': 'Arquivamentos Culturas',
            '[DIETA_ARQUIVADA]': 'Arquivamentos Dietas',
            '[DIAGNOSTICO_ARQUIVADO]': 'Arquivamentos Diagnósticos',
            '[SITUACAO_24H]': 'Situação Clínica 24h',
            '[APORTES]': 'Aportes'
        };
        
        for (const [marker, category] of Object.entries(categoryMap)) {
            if (description.includes(marker)) {
                return category;
            }
        }
        return null;
    };

    const filteredHistory = () => {
        const filtered: Record<string, TimelineEvent[]> = {};
        
        Object.entries(patientHistory).forEach(([date, eventsOnDate]) => {
            // Extrair apenas a parte da data (YYYY-MM-DD) ignorando hora/timezone
            const eventDateStr = date.split('T')[0];
            
            // Comparação de strings de data (YYYY-MM-DD format é comparável lexicograficamente)
            const passesDateFilter = 
                (!dataInicio || eventDateStr >= dataInicio) && 
                (!dataFinal || eventDateStr <= dataFinal);
            
            if (passesDateFilter) {
                let filteredEvents = eventsOnDate as TimelineEvent[];
                
                if (selectedCategories.size > 0) {
                    filteredEvents = filteredEvents.filter(event => {
                        const category = getEventCategory(event.description);
                        return category && selectedCategories.has(category);
                    });
                }
                
                if (filteredEvents.length > 0) {
                    filtered[date] = filteredEvents;
                }
            }
        });
        
        return filtered;
    };

    const toggleCategory = (category: string) => {
        const newSet = new Set(selectedCategories);
        if (newSet.has(category)) {
            newSet.delete(category);
        } else {
            newSet.add(category);
        }
        setSelectedCategories(newSet);
    };

    const clearFilters = () => {
        setDataInicio('');
        setDataFinal('');
        setSelectedCategories(new Set());
    };

    const displayedHistory = filteredHistory();

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Filtros</h3>
                
                {/* Data Início e Final */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Inicial</label>
                        <input
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Final</label>
                        <input
                            type="date"
                            value={dataFinal}
                            onChange={(e) => setDataFinal(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                        />
                    </div>
                </div>
                
                {/* Filtro por Categoria */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categorias</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        {Object.keys(eventCategories).map(category => (
                            <label key={category} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.has(category)}
                                    onChange={() => toggleCategory(category)}
                                    className="rounded focus:ring-blue-500"
                                />
                                <span className="truncate">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex gap-2 justify-between flex-wrap">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition text-sm"
                    >
                        Limpar Filtros
                    </button>
                    <button
                        onClick={handleGeneratePdf}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                    >
                        <FileTextIcon className="w-5 h-5" />
                        Gerar PDF
                    </button>
                </div>
            </div>

            {/* Histórico Filtrado */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                {Object.keys(displayedHistory).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(displayedHistory).map(([date, eventsOnDate]) => (
                            <div key={date}>
                                <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">{formatHistoryDate(date)}</h3>
                                <div className="space-y-3">
                                    {(eventsOnDate as TimelineEvent[]).map((event, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 rounded-full mt-1">
                                                <event.icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">{event.description}</p>
                                                {event.hasTime && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Horário: {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                        {Object.keys(patientHistory).length === 0 
                            ? 'Nenhum histórico de eventos para este paciente.' 
                            : 'Nenhum evento encontrado com os filtros selecionados.'}
                    </p>
                )}
            </div>
        </div>
    );
};

// ... (EditPatientInfoModal, PatientDetailScreen remain mostly the same, ensure they render correctly)





const PatientDetailScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients, addRemovalDateToDevice, deleteDeviceFromPatient, addEndDateToMedication, deleteMedicationFromPatient, deleteExamFromPatient, deleteSurgicalProcedureFromPatient, addScaleScoreToPatient, addCultureToPatient, deleteCultureFromPatient, addDietToPatient, updateDietInPatient, deleteDietFromPatient } = useContext(PatientsContext)!;
    const { user } = useContext(UserContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);

    useHeader(patient ? `Leito ${patient.bedNumber}` : 'Paciente não encontrado');

    const [mainTab, setMainTab] = useState<'data' | 'scales'>('data');
    const [dataTab, setDataTab] = useState<'devices' | 'exams' | 'medications' | 'surgical' | 'cultures' | 'diets' | 'aportes' | 'diagnostics'>('devices');
    const [isAddDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [editingDeviceRemovalDate, setEditingDeviceRemovalDate] = useState<Device | null>(null);
    const [archiveDeviceModal, setArchiveDeviceModal] = useState<Device | null>(null);
    const [isAddExamModalOpen, setAddExamModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [archiveExamModal, setArchiveExamModal] = useState<Exam | null>(null);
    const [isAddMedicationModalOpen, setAddMedicationModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
    const [editingMedicationEndDate, setEditingMedicationEndDate] = useState<Medication | null>(null);
    const [archiveMedicationModal, setArchiveMedicationModal] = useState<Medication | null>(null);
    const [isAddSurgicalModalOpen, setAddSurgicalModalOpen] = useState(false);
    const [editingSurgicalProcedure, setEditingSurgicalProcedure] = useState<SurgicalProcedure | null>(null);
    const [archiveSurgicalModal, setArchiveSurgicalModal] = useState<SurgicalProcedure | null>(null);
    const [isAddCultureModalOpen, setAddCultureModalOpen] = useState(false);
    const [editingCulture, setEditingCulture] = useState<Culture | null>(null);
    const [archiveCultureModal, setArchiveCultureModal] = useState<Culture | null>(null);
    const [archiveDietModal, setArchiveDietModal] = useState<Diet | null>(null);
    const [isAddDietModalOpen, setAddDietModalOpen] = useState(false);
    const [editingDiet, setEditingDiet] = useState<Diet | null>(null);
    const [editingDietRemovalDate, setEditingDietRemovalDate] = useState<Diet | null>(null);
    const [isDietRemovalModalOpen, setDietRemovalModalOpen] = useState<number | string | null>(null);
    const [isRemovalModalOpen, setRemovalModalOpen] = useState<number | string | null>(null);
    const [isEndDateModalOpen, setEndDateModalOpen] = useState<number | string | null>(null);
    const [isEditInfoModalOpen, setEditInfoModalOpen] = useState(false);
    const [isCreateAlertModalOpen, setCreateAlertModalOpen] = useState(false);
    const [scaleView, setScaleView] = useState<'list' | 'comfort-b' | 'delirium' | 'glasgow' | 'crs-r' | 'flacc' | 'braden' | 'braden-qd' | 'vni-cnaf' | 'fss' | 'abstinencia' | 'sos-pd' | 'consciousness'>('list');
    const [calculationsRefresh, setCalculationsRefresh] = useState(0);

    const { showNotification } = useContext(NotificationContext)!;

    useEffect(() => {
        // 🔝 Scroll para o topo quando entra na página
        window.scrollTo(0, 0);
    }, [patientId]);

    useEffect(() => {
        if (mainTab !== 'scales') {
            setScaleView('list');
        }
    }, [mainTab]);

    if (!patient) {
        return <p>Paciente não encontrado.</p>;
    }

    const handleSaveScaleScore = (data: { scaleName: string; score: number; interpretation: string; }) => {
        addScaleScoreToPatient(patient.id, {
            ...data,
            date: new Date().toISOString()
        });
        showNotification({ message: `Escala ${data.scaleName} salva no histórico.`, type: 'success' });
    };

    const handleDeleteDevice = (patientId: number | string, deviceId: number | string) => {
        if (window.confirm("Tem certeza que deseja apagar este dispositivo?")) {
            deleteDeviceFromPatient(patientId, deviceId);
            showNotification({ message: 'Dispositivo removido.', type: 'info' });
        }
    };

    const handleDeleteExam = (patientId: number | string, examId: number | string) => {
        if (window.confirm("Tem certeza que deseja arquivar este exame?")) {
            deleteExamFromPatient(patientId, examId);
            showNotification({ message: 'Exame arquivado.', type: 'info' });
        }
    };

    const handleDeleteMedication = (patientId: number | string, medicationId: number | string) => {
        if (window.confirm("Tem certeza que deseja arquivar esta medicação?")) {
            deleteMedicationFromPatient(patientId, medicationId);
            showNotification({ message: 'Medicação arquivada.', type: 'info' });
        }
    };

    const handleDeleteProcedure = (patientId: number | string, procedureId: number | string) => {
        if (window.confirm("Tem certeza que deseja arquivar este procedimento cirúrgico?")) {
            deleteSurgicalProcedureFromPatient(patientId, procedureId);
            showNotification({ message: 'Procedimento cirúrgico arquivado.', type: 'info' });
        }
    };

    const handleDeleteCulture = (patientId: number | string, cultureId: number | string) => {
        if (window.confirm("Tem certeza que deseja arquivar esta cultura?")) {
            deleteCultureFromPatient(patientId, cultureId);
            showNotification({ message: 'Cultura arquivada.', type: 'info' });
        }
    };

    const handleDeleteDiet = (patientId: number | string, dietId: number | string) => {
        if (window.confirm("Tem certeza que deseja arquivar esta dieta?")) {
            deleteDietFromPatient(patientId, dietId, user?.id);  // 🟢 Passar user.id
            showNotification({ message: 'Dieta arquivada.', type: 'info' });
        }
    };

    const formatAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += previousMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        if (years >= 1) {
            return years === 1 ? "1 ano" : `${years} anos`;
        }
        if (months >= 1) {
            return months === 1 ? "1 mês" : `${months} meses`;
        }
        return days === 1 ? "1 dia" : `${days} dias`;
    };

    const calculateDays = (startDate: string) => {
        const normalizedDate = startDate.split('T')[0];
        const parts = normalizedDate.split('-').map(Number);
        const start = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start.getTime() > today.getTime()) {
            return 0;
        }

        const diffTime = today.getTime() - start.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const dataTabs = [
        { id: 'devices', label: 'Dispositivos', icon: CpuIcon },
        { id: 'exams', label: 'Exames', icon: FileTextIcon },
        { id: 'medications', label: 'Medicações', icon: PillIcon },
        { id: 'surgical', label: 'Cirúrgico', icon: ScalpelIcon },
        { id: 'cultures', label: 'Culturas', icon: BeakerIcon },
        { id: 'diets', label: 'Dietas', icon: AppleIcon },
        { id: 'aportes', label: 'Aportes', icon: DropletIcon },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm relative">
                <button
                    onClick={() => setEditInfoModalOpen(true)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-500 transition bg-slate-50 dark:bg-slate-800 rounded-full"
                    aria-label="Editar Informações do Paciente"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 pr-10">{patient.name}</h2>
                <div className="flex flex-col gap-1 text-slate-500 dark:text-slate-400 mt-3">
                    <span className="font-medium">Idade: <span className="font-normal">{formatAge(patient.dob)}</span></span>
                    <span className="font-medium">Mãe: <span className="font-normal">{patient.motherName}</span></span>
                    <span className="font-medium">
                        Data de admissão:{' '}
                        <span className="font-normal">
                            {patient.admissionDate
                                ? `${formatDateToBRL(patient.admissionDate)} (${calculateDays(patient.admissionDate)} ${calculateDays(patient.admissionDate) === 1 ? 'dia' : 'dias'} internado)`
                                : <span className="text-orange-500 italic">Não informado</span>}
                        </span>
                    </span>
                    <span className="font-medium">SC: <span className="font-normal">{patient.sc ? patient.sc : <span className="text-orange-500 italic">Não informado</span>}</span></span>
                    <span className="font-medium">Peso: <span className="font-normal">{patient.peso ? `${patient.peso} kg` : <span className="text-orange-500 italic">Não informado</span>}</span></span>
                </div>
            </div>

            {/* Precautions Card */}
            <Suspense fallback={<LoadingSpinner />}>
                <PrecautionsCard 
                    patientId={patient.id} 
                    precautions={patient.precautions || []} 
                />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
                <ClinicalSituation24hCard
                    patientId={patient.id}
                    userId={user?.id}
                    accessLevel={user?.access_level}
                />
            </Suspense>

            <Link to={`/patient/${patient.id}/history`} className="w-full block text-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-lg transition text-md">
                <div className="flex items-center justify-center gap-2">
                    <BarChartIcon className="w-5 h-5" />
                    Ver Histórico Completo
                </div>
            </Link>

            {/* ... Tabs and Content ... */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                {/* Status Selector */}
                <div className="border-b border-slate-200 dark:border-slate-800 p-4">
                    <StatusComponent patientId={patient.id.toString()} />
                </div>

                {/* Comorbidade */}
                <div className="border-b border-slate-200 dark:border-slate-800 p-4">
                    <ComorbidadeComponent patientId={patient.id.toString()} />
                </div>

                {/* Main Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800">
                    <nav className="flex justify-around">
                        <button
                            onClick={() => setMainTab('data')}
                            className={`flex-1 py-4 px-1 text-center font-bold flex items-center justify-center gap-2 transition-colors duration-200 text-lg ${mainTab === 'data'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <ClipboardIcon className="w-6 h-6" />
                            Dados Clínicos
                        </button>
                        <button
                            onClick={() => setMainTab('scales')}
                            className={`flex-1 py-4 px-1 text-center font-bold flex items-center justify-center gap-2 transition-colors duration-200 text-lg ${mainTab === 'scales'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <BarChartIcon className="w-6 h-6" />
                            Escalas
                        </button>
                    </nav>
                </div>

                {mainTab === 'data' && (
                    <>
                        <SecondaryNavigation
                            tabs={dataTabs}
                            activeTabId={dataTab}
                            onTabChange={(tabId) => setDataTab(tabId as any)}
                        />
                        <div className="p-4 space-y-3">
                            {/* Devices Tab Content */}
                            {dataTab === 'devices' && (
                                <>
                                    {patient.devices.filter(device => !device.isArchived).map(device => (
                                        <div key={device.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <CpuIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{device.name} - {device.location}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(device.startDate)}</p>
                                                        {device.removalDate ? (
                                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Retirada: {formatDateToBRL(device.removalDate)}</p>
                                                        ) : (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(device.startDate)}</p>
                                                        )}
                                                        {device.observacao && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                                                                💬 {device.observacao}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {!device.removalDate && <button onClick={() => setRemovalModalOpen(device.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Retirada</button>}
                                                    <button onClick={() => device.removalDate ? setEditingDeviceRemovalDate(device) : setEditingDevice(device)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar dispositivo">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setArchiveDeviceModal(device)} 
                                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" 
                                                        title="Arquivar dispositivo"
                                                        aria-label="Arquivar dispositivo"
                                                    >
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddDeviceModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Dispositivo</button>
                                </>
                            )}
                            {/* Exams Tab Content */}
                            {dataTab === 'exams' && (
                                <>
                                    {patient.exams.filter(exam => !exam.isArchived).map(exam => (
                                        <div key={exam.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{exam.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(exam.date)}</p>
                                                        {exam.observation && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {exam.observation}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button onClick={() => setEditingExam(exam)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar exame">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setArchiveExamModal(exam)} 
                                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" 
                                                        title="Arquivar exame"
                                                        aria-label="Arquivar exame"
                                                    >
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddExamModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Exame</button>
                                </>
                            )}
                            {/* Medications Tab Content */}
                            {dataTab === 'medications' && (
                                <>
                                    {patient.medications.filter(medication => !medication.isArchived).map(medication => (
                                        <div key={medication.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <PillIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 wrap-break-word">{medication.name} - {medication.dosage}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(medication.startDate)}</p>
                                                        {medication.endDate ? (
                                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Fim: {formatDateToBRL(medication.endDate)}</p>
                                                        ) : (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(medication.startDate)}</p>
                                                        )}
                                                        {medication.observacao && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                                                                💬 {medication.observacao}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {!medication.endDate && <button onClick={() => setEndDateModalOpen(medication.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Fim</button>}
                                                    <button onClick={() => medication.endDate ? setEditingMedicationEndDate(medication) : setEditingMedication(medication)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar medicação">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setArchiveMedicationModal(medication)} 
                                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" 
                                                        title="Arquivar medicação"
                                                        aria-label="Arquivar medicação"
                                                    >
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddMedicationModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Medicação</button>
                                </>
                            )}
                            {/* Surgical Tab Content */}
                            {dataTab === 'surgical' && (
                                <>
                                    {patient.surgicalProcedures.filter(procedure => !procedure.isArchived).map(procedure => (
                                        <div key={procedure.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <ScalpelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{procedure.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(procedure.date)} - Dr(a): {procedure.surgeon}</p>
                                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">Dia Pós-Operatório: +{calculateDays(procedure.date)} dias</p>
                                                        {procedure.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {procedure.notes}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button onClick={() => setEditingSurgicalProcedure(procedure)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar cirurgia">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setArchiveSurgicalModal(procedure)} 
                                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" 
                                                        title="Arquivar procedimento"
                                                        aria-label="Arquivar cirurgia"
                                                    >
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddSurgicalModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Cirurgia</button>
                                </>
                            )}
                            {/* Cultures Tab Content */}
                            {dataTab === 'cultures' && (
                                <>
                                    {patient.cultures.filter(culture => !culture.isArchived).map(culture => (
                                        <div key={culture.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <BeakerIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{culture.site}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Microorganismo: {culture.microorganism}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(culture.collectionDate)}</p>
                                                        {culture.observation && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">Observação: {culture.observation}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button onClick={() => setEditingCulture(culture)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar cultura">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setArchiveCultureModal(culture)} 
                                                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" 
                                                        title="Arquivar cultura"
                                                        aria-label="Arquivar cultura"
                                                    >
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddCultureModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Cultura</button>
                                </>
                            )}

                            {/* Diets Tab Content */}
                            {dataTab === 'diets' && (
                                <>
                                    {patient.diets.filter(diet => !diet.isArchived).map(diet => (
                                        <div key={diet.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <AppleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{diet.type}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(diet.data_inicio)}</p>
                                                        {diet.data_remocao ? (
                                                            <p className="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded mt-1 font-medium">Retirada: {formatDateToBRL(diet.data_remocao)}</p>
                                                        ) : (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(diet.data_inicio)}</p>
                                                        )}
                                                        
                                                        {/* Parâmetros Nutricionais */}
                                                        {diet.volume && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Volume: {diet.volume} ml</p>
                                                        )}
                                                        {diet.vet && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">VET: {diet.vet} kcal/dia</p>
                                                        )}
                                                        {diet.vet_pleno && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">VET Pleno: {diet.vet_pleno} kcal/dia</p>
                                                        )}
                                                        {diet.pt && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Proteína (PT): {diet.pt} g/dia</p>
                                                        )}
                                                        {diet.pt_g_dia && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">PT Plena: {diet.pt_g_dia} g/dia</p>
                                                        )}
                                                        {diet.th && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Taxa Hídrica (TH): {diet.th} ml/m²/dia</p>
                                                        )}
                                                        
                                                        {/* Cálculos Automáticos */}
                                                        {(diet.vet_at || diet.pt_at) && (
                                                            <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                                                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">📊 Cálculos Automáticos</p>
                                                                {diet.vet_at && diet.vet && diet.vet_pleno && (
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">VET AT: {diet.vet_at.toFixed(1)}%</p>
                                                                        <p className="text-xs text-blue-600 dark:text-blue-400">{diet.vet} kcal/dia de {diet.vet_pleno} kcal/dia</p>
                                                                    </div>
                                                                )}
                                                                {diet.pt_at && diet.pt && diet.pt_g_dia && (
                                                                    <div className="space-y-0.5 mt-1">
                                                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">PT AT: {diet.pt_at.toFixed(1)}%</p>
                                                                        <p className="text-xs text-blue-600 dark:text-blue-400">{diet.pt} g/dia de {diet.pt_g_dia} g/dia</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {diet.observacao && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">Observação: {diet.observacao}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {!diet.data_remocao && (
                                                        <button onClick={() => setDietRemovalModalOpen(diet.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Retirada</button>
                                                    )}
                                                    <button onClick={() => diet.data_remocao ? setEditingDietRemovalDate(diet) : setEditingDiet(diet)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label={diet.data_remocao ? "Editar data de retirada" : "Editar dieta"}>
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setArchiveDietModal(diet)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" aria-label="Arquivar dieta">
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddDietModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Dieta</button>
                                </>
                            )}

                            {dataTab === 'aportes' && (
                                <AportesCard
                                    patientId={patient.id}
                                    userId={user?.id}
                                    accessLevel={user?.access_level}
                                />
                            )}
                        </div>
                    </>
                )}

                {mainTab === 'scales' && (
                    <div className="p-4">
                        {scaleView === 'list' && (
                            <div className="space-y-3">
                                {/* List of Scales - (unchanged structure, just collapsed for brevity) */}
                                <div onClick={() => setScaleView('comfort-b')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BarChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala COMFORT-B</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('delirium')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala CAM-ICU Pediátrico</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('glasgow')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Coma de Glasgow</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('crs-r')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Recuperação de Coma (CRS-R)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('flacc')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><PillIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Dor FLACC / FLACC-R</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('braden')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Braden</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('braden-qd')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Braden QD (Ampliada)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('vni-cnaf')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><LungsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala VNI/CNAF Pediatria</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('fss')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><DumbbellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Status Funcional (FSS)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('abstinencia')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Abstinência (Finnegan & WAT-1)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('sos-pd')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala SOS-PD (Delirium/Abstinência)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('consciousness')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Avaliação Consciência (CRS-R/FOUR/JFK)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                        )}
                        {scaleView === 'comfort-b' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><ComfortBCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'delirium' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><CAMICUCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'glasgow' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><GlasgowCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'crs-r' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><CRSRScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
                        {scaleView === 'flacc' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><FLACCCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'braden' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><BradenCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'braden-qd' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><BradenQDScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
                        {scaleView === 'vni-cnaf' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><VNICNAFCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'fss' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><FSSScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
                        {scaleView === 'abstinencia' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><AbstinenciaCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'sos-pd' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><SOSPDCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'consciousness' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><ConsciousnessCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                    </div>
                )}
            </div>

            <Suspense fallback={<LoadingSpinner />}>
                <DiagnosticsSection patientId={patient.id.toString()} />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
                <AlertasSection patientId={patient.id.toString()} />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
                <LatestCalculationsCard patientId={patient.id.toString()} refreshTrigger={calculationsRefresh} />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
                <DiuresisCalc 
                    patientId={patient.id.toString()} 
                    onCalculationSaved={() => setCalculationsRefresh(prev => prev + 1)}
                />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
                <FluidBalanceCalc 
                    patientId={patient.id.toString()}
                    onCalculationSaved={() => setCalculationsRefresh(prev => prev + 1)}
                />
            </Suspense>

            <Suspense fallback={<LoadingSpinner />}>
                <BalancoCumulativoPorPeriodo patientId={patient.id.toString()} />
            </Suspense>

            {user?.access_level === 'adm' ? (
                <Link to={`/patient/${patient.id}/round/categories`} className="w-full block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg transition text-lg">
                    <div className="flex items-center justify-center gap-2">
                        <ClipboardIcon className="w-6 h-6" />
                        Iniciar/Ver Round
                    </div>
                </Link>
            ) : (
                <div title="Você não tem acesso a essa função." className="w-full block text-center bg-slate-400 dark:bg-slate-600 text-white font-bold py-4 px-4 rounded-lg cursor-not-allowed opacity-60 text-lg">
                    <div className="flex items-center justify-center gap-2">
                        <ClipboardIcon className="w-6 h-6" />
                        Iniciar/Ver Round
                    </div>
                </div>
            )}

            <button
                onClick={() => setCreateAlertModalOpen(true)}
                className="w-full mt-3 text-center bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2"
            >
                <WarningIcon className="w-6 h-6" />
                Criar Novo Alerta
            </button>

            <DestinoComponent patientId={patient.id.toString()} />

            {isAddDeviceModalOpen && <AddDeviceModal patientId={patient.id} onClose={() => setAddDeviceModalOpen(false)} />}
            {editingDevice && <EditDeviceModal device={editingDevice} patientId={patient.id} onClose={() => setEditingDevice(null)} />}
            {editingDeviceRemovalDate && <EditDeviceRemovalDateModal device={editingDeviceRemovalDate} patientId={patient.id} onClose={() => setEditingDeviceRemovalDate(null)} />}
            {archiveDeviceModal && (
                <ArchiveDeviceModal 
                    device={archiveDeviceModal} 
                    patientId={patient.id} 
                    onClose={() => setArchiveDeviceModal(null)} 
                    onSuccess={() => window.location.reload()}
                />
            )}
            {isAddExamModalOpen && <AddExamModal patientId={patient.id} onClose={() => setAddExamModalOpen(false)} />}
            {editingExam && <EditExamModal exam={editingExam} patientId={patient.id} onClose={() => setEditingExam(null)} />}
            {archiveExamModal && (
                <ArchiveExamModal 
                    exam={archiveExamModal} 
                    patientId={patient.id} 
                    onClose={() => setArchiveExamModal(null)} 
                    onSuccess={() => window.location.reload()}
                />
            )}
            {isAddMedicationModalOpen && <AddMedicationModal patientId={patient.id} onClose={() => setAddMedicationModalOpen(false)} />}
            {editingMedication && <EditMedicationModal medication={editingMedication} patientId={patient.id} onClose={() => setEditingMedication(null)} />}
            {editingMedicationEndDate && <EditMedicationEndDateModal medication={editingMedicationEndDate} patientId={patient.id} onClose={() => setEditingMedicationEndDate(null)} />}
            {archiveMedicationModal && (
                <ArchiveMedicationModal 
                    medication={archiveMedicationModal} 
                    patientId={patient.id} 
                    onClose={() => setArchiveMedicationModal(null)} 
                    onSuccess={() => window.location.reload()}
                />
            )}
            {isAddSurgicalModalOpen && <AddSurgicalProcedureModal patientId={patient.id} onClose={() => setAddSurgicalModalOpen(false)} />}
            {editingSurgicalProcedure && <EditSurgicalProcedureModal procedure={editingSurgicalProcedure} patientId={patient.id} onClose={() => setEditingSurgicalProcedure(null)} />}
            {archiveSurgicalModal && (
                <ArchiveSurgicalProcedureModal 
                    procedure={archiveSurgicalModal} 
                    patientId={patient.id} 
                    onClose={() => setArchiveSurgicalModal(null)} 
                    onSuccess={() => window.location.reload()}
                />
            )}
            {isAddCultureModalOpen && <AddCultureModal patientId={patient.id} onClose={() => setAddCultureModalOpen(false)} />}
            {editingCulture && <EditCultureModal culture={editingCulture} patientId={patient.id} onClose={() => setEditingCulture(null)} />}
            {archiveCultureModal && (
                <ArchiveCultureModal 
                    culture={archiveCultureModal} 
                    patientId={patient.id} 
                    onClose={() => setArchiveCultureModal(null)} 
                    onSuccess={() => window.location.reload()}
                />
            )}
            {isAddDietModalOpen && <AddDietModal patientId={patient.id} onClose={() => setAddDietModalOpen(false)} />}
            {editingDiet && <EditDietModal diet={editingDiet} patientId={patient.id} onClose={() => setEditingDiet(null)} />}
            {archiveDietModal && (
                <ArchiveDietModal 
                    diet={archiveDietModal} 
                    patientId={patient.id} 
                    onClose={() => setArchiveDietModal(null)} 
                    onSuccess={() => window.location.reload()}
                />
            )}
            {isDietRemovalModalOpen && <AddDietRemovalDateModal dietId={isDietRemovalModalOpen} patientId={patient.id} onClose={() => setDietRemovalModalOpen(null)} />}
            {editingDietRemovalDate && <EditDietRemovalDateModal diet={editingDietRemovalDate} patientId={patient.id} onClose={() => setEditingDietRemovalDate(null)} />}
            {isRemovalModalOpen && <AddRemovalDateModal deviceId={isRemovalModalOpen} patientId={patient.id} onClose={() => setRemovalModalOpen(null)} />}
            {isEndDateModalOpen && <AddEndDateModal medicationId={isEndDateModalOpen} patientId={patient.id} onClose={() => setEndDateModalOpen(null)} />}
            {isEditInfoModalOpen && <EditPatientInfoModal patientId={patient.id} currentMotherName={patient.motherName} currentWeight={patient.peso} currentSC={patient.sc} onClose={() => setEditInfoModalOpen(false)} />}
            {isCreateAlertModalOpen && <CreateAlertModal patientId={patient.id} onClose={() => setCreateAlertModalOpen(false)} />}
        </div>
    );
};

// ... (Modals AddDeviceModal, EditDeviceModal, AddExamModal, EditExamModal, AddMedicationModal, EditMedicationModal, AddSurgicalProcedureModal, EditSurgicalProcedureModal, AddRemovalDateModal, AddEndDateModal - No major logic changes needed, just standard)

// ... [Include all Modal components here as they were in the original file, no changes needed for this task] ...













const RoundCategoryListScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients, questions, checklistAnswers, categories } = useContext(PatientsContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);

    useHeader('Round: Categorias');

    if (!patientId || !patient) return <p>Paciente não encontrado.</p>;

    const completedCategories = useMemo(() => {
        if (!questions.length) return [];
        const answers = checklistAnswers[patientId] || {};
        return categories.filter(cat => {
            const catQuestions = questions.filter(q => q.categoryId === cat.id);
            if (catQuestions.length === 0) return false;
            return catQuestions.every(q => answers[q.id] !== undefined);
        }).map(c => c.id);
    }, [questions, checklistAnswers, patientId, categories]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(category => {
                const isCompleted = completedCategories.includes(category.id);
                return (
                    <Link
                        key={category.id}
                        to={`/patient/${patientId}/round/category/${category.id}`}
                        className={`p-4 rounded-xl shadow-sm text-center font-semibold transition flex flex-col items-center justify-center gap-2 ${isCompleted
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {category.icon && <category.icon className={`w-8 h-8 ${isCompleted ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />}
                        <span className={isCompleted ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>{category.name}</span>
                    </Link>
                )
            })}
        </div>
    );
};

// --- ALERT MODAL COMPONENT ---

const ChecklistScreen: React.FC = () => {
    const { patientId, categoryId, questionIndex } = useParams<{ patientId: string; categoryId: string; questionIndex: string }>();
    const { patients, questions, checklistAnswers, saveChecklistAnswer, categories } = useContext(PatientsContext)!;

    const patient = patients.find(p => p.id.toString() === patientId);
    const category = categories.find(c => c.id.toString() === categoryId);

    const [activeAlertQuestion, setActiveAlertQuestion] = useState<Question | null>(null);

    // Filter questions based on category using questions from context
    const categoryQuestions = useMemo(() => {
        return questions.filter(q => q.categoryId != null && q.categoryId.toString() === categoryId);
    }, [questions, categoryId]);

    const navigate = useNavigate();

    const currentQuestionIndex = useMemo(() => {
        const idx = parseInt(questionIndex || '0', 10);
        if (isNaN(idx) || idx < 0 || idx >= categoryQuestions.length) {
            return 0;
        }
        return idx;
    }, [questionIndex, categoryQuestions]);

    useHeader(category ? `Checklist: ${category.name}` : 'Checklist');

    // Get existing answer from context
    const currentAnswer = patientId && categoryQuestions[currentQuestionIndex]
        ? checklistAnswers[patientId]?.[categoryQuestions[currentQuestionIndex].id]
        : undefined;

    const handleAnswer = async (questionId: number, answer: Answer) => {
        if (patientId && categoryId) {
            await saveChecklistAnswer(patientId, parseInt(categoryId), questionId, answer);
        }
    };

    const handleSave = () => {
        if (!patientId) return;
        navigate(`/patient/${patientId}/round/categories`);
    };

    const handleNext = () => {
        if (currentQuestionIndex < categoryQuestions.length - 1) {
            navigate(`/patient/${patientId}/round/category/${categoryId}/question/${currentQuestionIndex + 1}`);
        } else {
            handleSave();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            navigate(`/patient/${patientId}/round/category/${categoryId}/question/${currentQuestionIndex - 1}`);
        }
    };

    if (!patient || !category || categoryQuestions.length === 0) {
        return <p>Paciente, categoria ou perguntas não encontrados.</p>;
    }

    const currentQuestion = categoryQuestions[currentQuestionIndex];

    return (
        <div className="relative min-h-screen pb-6 px-4 flex items-center justify-center">
            {/* Main Card */}
            <div className="w-full max-w-lg bg-blue-600 dark:bg-blue-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">

                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col items-center text-center space-y-4 sm:space-y-6">
                    <span className="bg-blue-800/50 text-blue-100 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                        {category.name} • {currentQuestionIndex + 1}/{categoryQuestions.length}
                    </span>

                    <h1 className="text-white text-lg sm:text-xl md:text-2xl font-extrabold leading-tight flex items-center justify-center px-2">
                        {currentQuestion.text}
                    </h1>

                    <div className="w-full space-y-3 mt-4">
                        {(['sim', 'não', 'nao_se_aplica'] as Answer[]).map(answer => (
                            <button
                                key={answer}
                                onClick={() => handleAnswer(currentQuestion.id, answer)}
                                className={`w-full py-3.5 rounded-lg font-bold transition shadow-sm border flex items-center justify-center gap-2 text-sm sm:text-base
                                ${currentAnswer === answer
                                        ? 'bg-blue-800 text-white border-white ring-2 ring-blue-400'
                                        : 'bg-blue-500 hover:bg-blue-400 text-white border-blue-400/30'}`}
                            >
                                {currentAnswer === answer && <CheckIcon className="w-5 h-5" />} {answer.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setActiveAlertQuestion(currentQuestion)}
                        className="mt-4 sm:mt-6 flex items-center gap-2 text-red-100 hover:text-white bg-red-900/40 hover:bg-red-600/80 px-4 sm:px-5 py-2.5 rounded-full transition text-xs font-bold border border-red-400/30 tracking-wide"
                    >
                        <AlertIcon className="w-4 h-4" />
                        GERAR ALERTA / INTERVENÇÃO
                    </button>
                </div>

                {/* Footer Navigation */}
                <div className="p-4 sm:p-6 border-t border-blue-500/30 flex justify-between items-center bg-blue-700/20">
                    <button
                        onClick={handlePrevious} disabled={currentQuestionIndex === 0}
                        className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed text-blue-300' : 'bg-blue-800/50 hover:bg-blue-800 text-blue-100 hover:text-white'}`}
                    >
                        <ChevronLeftIcon className="w-4 h-4" /> Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        className={`px-6 sm:px-8 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-lg flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-700`}
                    >
                        {currentQuestionIndex === categoryQuestions.length - 1 ? 'Salvar' : 'Próximo'} <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Alert Modal */}
            {activeAlertQuestion && patientId && (
                <AlertModal
                    question={activeAlertQuestion}
                    onClose={() => setActiveAlertQuestion(null)}
                    patientId={patientId}
                />
            )}
        </div>
    );
};

// ... (CreateAlertScreen, TaskStatusScreen, JustificationModal, SettingsScreen remain mostly same)
const CreateAlertScreen: React.FC = () => {
    const { patientId, categoryId } = useParams<{ patientId: string, categoryId?: string }>();
    const { patients, categories } = useContext(PatientsContext)!;
    const { addPatientAlert } = useContext(TasksContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const navigate = useNavigate();

    const patient = patients.find(p => p.id.toString() === patientId);
    const category = categoryId ? categories.find(c => c.id.toString() === categoryId) : null;

    const [description, setDescription] = useState('');
    const [responsible, setResponsible] = useState('');
    const [deadline, setDeadline] = useState('');

    useHeader(category ? `Alerta: ${category.name}` : 'Criar Alerta');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId || !description || !responsible || !deadline) return;

        addPatientAlert({
            patientId: patientId,
            description,
            responsible,
            timeLabel: deadline,
        });

        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });

        navigate(-1);
    };

    if (!patient) {
        return <p>Paciente não encontrado</p>;
    }


    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl overflow-hidden max-w-md mx-auto shadow-lg relative">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition z-10"
                aria-label="Fechar"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
            <div className="p-6 bg-blue-500 dark:bg-blue-600 text-white text-center">
                <h2 className="text-xl font-bold">{patient.name}</h2>
                {category && <p className="text-blue-100">{category.name}</p>}
            </div>
            <div className="p-6 bg-white dark:bg-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alerta</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Digite o alerta identificado..."
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                        <select value={responsible} onChange={e => setResponsible(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a hora</label>
                        <select value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Selecione...</option>
                            {ALERT_DEADLINES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Criar alerta
                    </button>
                </form>
            </div>
        </div>
    );
};

const TaskStatusScreen: React.FC = () => {
    const { status } = useParams<{ status: TaskStatus }>();
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;

    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [justificationModal, setJustificationModal] = useState<any | null>(null);

    const statusConfig = {
        alerta: { title: 'Alertas', icon: WarningIcon, color: 'yellow' },
        no_prazo: { title: 'No Prazo', icon: ClockIcon, color: 'blue' },
        fora_do_prazo: { title: 'Fora do Prazo', icon: AlertIcon, color: 'red' },
        concluido: { title: 'Concluídos', icon: CheckCircleIcon, color: 'green' },
    };

    const config = statusConfig[status as TaskStatus];
    useHeader(config ? config.title : 'Tarefas');

    // Buscar dados do Supabase
    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // Buscar de ambas as views e também os pacientes
            const [tasksResult, alertsResult, patientsResult] = await Promise.all([
                supabase.from('tasks_view_horario_br').select('*'),
                supabase.from('alertas_paciente_view_completa').select('*'),
                supabase.from('patients').select('id, name, bed_number')
            ]);

            // Criar mapa de pacientes para lookup rápido
            const patientsMap = new Map();
            (patientsResult.data || []).forEach(p => {
                patientsMap.set(p.id, { name: p.name, bed_number: p.bed_number });
            });

            // Combinar resultados e adicionar dados do paciente
            const allAlerts = [
                ...(tasksResult.data || []).map(t => {
                    const patientInfo = t.patient_id ? patientsMap.get(t.patient_id) : null;
                    return {
                        ...t,
                        source: 'tasks',
                        patient_name: patientInfo?.name || t.patient_name,
                        bed_number: patientInfo?.bed_number || null
                    };
                }),
                ...(alertsResult.data || []).map(a => {
                    const patientInfo = a.patient_id ? patientsMap.get(a.patient_id) : null;
                    return {
                        ...a,
                        source: 'alertas',
                        patient_name: patientInfo?.name || a.patient_name,
                        bed_number: patientInfo?.bed_number || null
                    };
                })
            ];

            // Filtrar por live_status baseado no status da rota
            let filtered = allAlerts;
            if (status === 'alerta') {
                // Mostrar apenas alertas ativos (status original = 'alerta' ou 'aberto')
                filtered = allAlerts.filter(alert =>
                    (alert.status === 'alerta' || alert.status === 'aberto' || alert.status === 'Pendente') &&
                    alert.live_status !== 'concluido'
                );
            } else if (status === 'no_prazo') {
                filtered = allAlerts.filter(alert => alert.live_status === 'no_prazo');
            } else if (status === 'fora_do_prazo') {
                filtered = allAlerts.filter(alert => alert.live_status === 'fora_do_prazo');
            } else if (status === 'concluido') {
                filtered = allAlerts.filter(alert => alert.live_status === 'concluido');
            }

            setAlerts(filtered);

            // Debug: Log para verificar se justificativa está presente
            if (filtered.length > 0) {
                console.log('Exemplo de alerta:', filtered[0]);
                console.log('Campos disponíveis:', Object.keys(filtered[0]));
            }
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            showNotification('Erro ao carregar alertas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [status]);

    // Marcar como concluído
    const handleCompleteAlert = async (alert: any) => {
        if (!window.confirm('Tem certeza que deseja marcar como concluído?')) return;

        try {
            const table = alert.source === 'tasks' ? 'tasks' : 'alertas_paciente';
            const { error } = await supabase
                .from(table)
                .update({
                    status: 'concluido',
                    updated_at: new Date().toISOString()
                })
                .eq('id', alert.id_alerta);

            if (error) throw error;

            showNotification('Alerta marcado como concluído', 'success');
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao atualizar alerta:', error);
            showNotification('Erro ao atualizar alerta', 'error');
        }
    };

    // Justificar atraso
    const handleJustifyAlert = async (alert: any, justification: string) => {
        try {
            const table = alert.source === 'tasks' ? 'tasks' : 'alertas_paciente';
            const justificationField = alert.source === 'tasks' ? 'justification' : 'justificativa';
            const justificationByField = alert.source === 'tasks' ? 'justification_by' : 'justificativa_by';
            const justificationAtField = alert.source === 'tasks' ? 'justification_at' : 'justificativa_at';
            
            const { error } = await supabase
                .from(table)
                .update({
                    [justificationField]: justification,
                    [justificationByField]: user?.id || null,
                    [justificationAtField]: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', alert.id_alerta);

            if (error) throw error;

            showNotification('Justificativa salva com sucesso', 'success');
            setJustificationModal(null);
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao salvar justificativa:', error);
            showNotification('Erro ao salvar justificativa', 'error');
        }
    };

    // Ocultar alerta concluído
    const handleHideAlert = async (alert: any) => {
        if (!window.confirm('Tem certeza que deseja ocultar este alerta?')) return;

        try {
            const table = alert.source === 'tasks' ? 'tasks' : 'alertas_paciente';

            // Soft delete - marcar como oculto
            const { error } = await supabase
                .from(table)
                .update({
                    status: 'oculto',
                    updated_at: new Date().toISOString()
                })
                .eq('id', alert.id_alerta);

            if (error) throw error;

            showNotification('Alerta ocultado com sucesso', 'success');
            fetchAlerts();
        } catch (error) {
            console.error('Erro ao ocultar alerta:', error);
            showNotification('Erro ao ocultar alerta', 'error');
        }
    };

    if (!config) return <p>Status inválido.</p>;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Carregando alertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {alerts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm text-center">
                    <p className="text-slate-500 dark:text-slate-400">Nenhum alerta encontrado nesta categoria.</p>
                </div>
            ) : (
                alerts.map((alert: any) => {
                    const formattedDeadline = alert.prazo_limite_formatado || 'Sem prazo';
                    const prazoFormatado = alert.prazo_formatado || '';

                    return (
                        <div key={`${alert.source}-${alert.id_alerta}`} className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border-l-4 border-${config.color}-500`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {/* Nome do Paciente e Leito */}
                                    {alert.patient_name && (
                                        <div className="mb-2">
                                            <Link to={`/patient/${alert.patient_id}`} className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                                {alert.patient_name}
                                            </Link>
                                            <span className="ml-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                                Leito: <strong>{alert.bed_number || 'N/A'}</strong>
                                            </span>
                                        </div>
                                    )}

                                    {/* Descrição do Alerta */}
                                    <p className="font-bold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">🔔 {alert.alertaclinico}</p>

                                    {/* Responsável */}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        👤 Responsável: {alert.responsavel}
                                    </p>

                                    {/* Criado por */}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        👨‍⚕️ Criado por: {alert.created_by_name}
                                    </p>

                                    {/* Prazo */}
                                    {prazoFormatado && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            ⏱️ Tempo: {prazoFormatado}
                                        </p>
                                    )}

                                    {/* Justificativa */}
                                    {alert.justificativa && (
                                        <p className="text-xs italic text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                            <strong>Justificativa:</strong> {alert.justificativa}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Prazo Limite:</p>
                                    <p className={`text-sm font-bold text-${config.color}-600 dark:text-${config.color}-400`}>
                                        {formattedDeadline}
                                    </p>
                                </div>
                            </div>

                            {/* Botões de ação baseados no status */}
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                                {status === 'fora_do_prazo' && (
                                    <>
                                        <button
                                            onClick={() => setJustificationModal(alert)}
                                            className="text-xs bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900 transition"
                                        >
                                            {alert.justificativa ? 'Editar Justificativa' : 'Justificar Atraso'}
                                        </button>
                                        <button
                                            onClick={() => handleCompleteAlert(alert)}
                                            className="text-xs bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 font-semibold px-3 py-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition"
                                        >
                                            Marcar como Concluído
                                        </button>
                                    </>
                                )}

                                {(status === 'alerta' || status === 'no_prazo') && (
                                    <button
                                        onClick={() => handleCompleteAlert(alert)}
                                        className="text-xs bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-300 font-semibold px-3 py-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition"
                                    >
                                        Marcar como Concluído
                                    </button>
                                )}

                                {status === 'concluido' && (
                                    <button
                                        onClick={() => handleHideAlert(alert)}
                                        className="text-xs bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300 font-semibold px-3 py-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition"
                                    >
                                        Ocultar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            {justificationModal && (
                <JustificationModal
                    alert={justificationModal}
                    onClose={() => setJustificationModal(null)}
                    onSave={handleJustifyAlert}
                />
            )}
        </div>
    );
};


const SettingsScreen: React.FC = () => {
    useHeader('Ajustes');
    const { user, updateUser } = useContext(UserContext)!;
    const { theme, toggleTheme } = useContext(ThemeContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [name, setName] = useState(user.name);
    const [title, setTitle] = useState(user.title);
    const [sector, setSector] = useState(user.sector || '');
    const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(user.name || '');
        setTitle(user.title || '');
        setSector(user.sector || '');
        setAvatarPreview(user.avatarUrl || '');
    }, [user.id, user.name, user.title, user.sector, user.avatarUrl]);

    const handleSave = () => {
        const isDataUrl = /^data:image\//i.test(avatarPreview || '');
        const avatarToSave = isDataUrl ? (user.avatarUrl || '') : avatarPreview;

        updateUser({ name, title, avatarUrl: avatarToSave, sector });
        showNotification({ message: 'Perfil salvo com sucesso!', type: 'success' });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const configuredBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;
            const bucketCandidates = [configuredBucket, 'avatars', 'roundfoto'].filter(
                (bucket, index, array): bucket is string => !!bucket && array.indexOf(bucket) === index
            );

            // 1. Preview local imediato para feedback visual
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // 2. Upload para o Supabase Storage (bucket 'roundfoto')
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    throw new Error('Sessão expirada. Faça login novamente para enviar a foto.');
                }

                const fileExt = file.name.split('.').pop();
                // Cria um nome de arquivo único: avatars/timestamp-random.ext
                const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                let selectedBucket: string | null = null;
                let lastUploadError: any = null;

                for (const bucket of bucketCandidates) {
                    const { error: uploadError } = await supabase.storage
                        .from(bucket)
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        });

                    if (!uploadError) {
                        selectedBucket = bucket;
                        break;
                    }

                    lastUploadError = uploadError;
                    const uploadErrorMessage = (uploadError?.message || '').toLowerCase();
                    if (!uploadErrorMessage.includes('bucket not found')) {
                        throw uploadError;
                    }
                }

                if (!selectedBucket) {
                    throw lastUploadError || new Error('Nenhum bucket válido encontrado para upload.');
                }

                // 3. Obter a URL pública
                const { data } = supabase.storage
                    .from(selectedBucket)
                    .getPublicUrl(fileName);

                if (data.publicUrl) {
                    // Append timestamp to avoid caching issues if user reuploads quickly (though filename is unique)
                    setAvatarPreview(data.publicUrl);
                    showNotification({ message: 'Foto enviada com sucesso!', type: 'success' });
                }
            } catch (error: any) {
                console.error("Erro no upload:", error);
                const errorMessage = (error?.message || '').toLowerCase();
                if (errorMessage.includes('bucket not found')) {
                    showNotification({
                        message: 'Nenhum bucket encontrado para upload. Crie o bucket "avatars" ou configure VITE_SUPABASE_STORAGE_BUCKET corretamente.',
                        type: 'error'
                    });
                    return;
                }

                const message =
                    error?.message ||
                    error?.error_description ||
                    error?.details ||
                    'Falha ao enviar foto.';

                showNotification({ message: `Erro ao enviar foto: ${message}`, type: 'error' });
            }
        }
    };

    return (
        <div className="space-y-8 max-w-lg mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Perfil</h2>
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="relative group">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="User avatar" className="w-24 h-24 rounded-full object-cover bg-slate-200" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {(name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button
                                onClick={handleAvatarClick}
                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                                aria-label="Mudar foto de perfil"
                            >
                                <CameraIcon className="w-8 h-8 text-white" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Setor</label>
                        <input
                            type="text"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition">
                        Salvar Perfil
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Aparência</h2>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Modo Escuro</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                    >
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PROVIDERS for Global State ---

const PatientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize with empty array, will fetch on mount
    const [patients, setPatients] = useState<Patient[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [checklistAnswers, setChecklistAnswers] = useState<Record<string, Record<number, Answer>>>({});

    // 🔄 Função para processar e adicionar detalhes dos pacientes quando dados secundários chegarem
    const processPatientDetails = (patientsData: any[], detailsData: any) => {
        const { devicesRes, examsRes, medsRes, surgsRes, scalesRes, culturesRes, dietsRes, precautionsRes, diuresisRes, balanceRes } = detailsData;

        // ✅ NORMALIZAR DADOS - Se houver erro na query, retorna array vazio
        const safeData = (res: any) => (res?.data?.length ? res.data : []);

        const devicesMap = safeData(devicesRes).reduce((acc: any, d: any) => {
            if (!acc[d.paciente_id]) acc[d.paciente_id] = [];
            acc[d.paciente_id].push({
                id: d.id,
                name: d.tipo_dispositivo,
                location: d.localizacao,
                startDate: d.data_insercao,
                removalDate: d.data_remocao,
                isArchived: d.is_archived,
                observacao: d.observacao,
            });
            return acc;
        }, {});

        const examsMap = safeData(examsRes).reduce((acc: any, e: any) => {
            if (!acc[e.paciente_id]) acc[e.paciente_id] = [];
            acc[e.paciente_id].push({
                id: e.id,
                name: e.nome_exame,
                date: e.data_exame,
                result: e.resultado || 'Pendente',
                observation: e.observacao,
            });
            return acc;
        }, {});

        const medsMap = safeData(medsRes).reduce((acc: any, m: any) => {
            if (!acc[m.paciente_id]) acc[m.paciente_id] = [];
            acc[m.paciente_id].push({
                id: m.id,
                name: m.nome_medicacao,
                dosage: `${m.dosagem_valor} ${m.unidade_medida}`,
                startDate: m.data_inicio,
                endDate: m.data_fim,
                isArchived: m.is_archived,
                observacao: m.observacao
            });
            return acc;
        }, {});

        const surgsMap = safeData(surgsRes).reduce((acc: any, s: any) => {
            if (!acc[s.paciente_id]) acc[s.paciente_id] = [];
            acc[s.paciente_id].push({
                id: s.id,
                name: s.nome_procedimento,
                date: s.data_procedimento,
                surgeon: s.nome_cirurgiao,
                notes: s.notas,
                isArchived: s.is_archived
            });
            return acc;
        }, {});

        const scalesMap = safeData(scalesRes).reduce((acc: any, s: any) => {
            if (!acc[s.patient_id]) acc[s.patient_id] = [];
            acc[s.patient_id].push({
                id: s.id,
                scaleName: s.scale_name,
                score: s.score,
                interpretation: s.interpretation,
                date: s.date
            });
            return acc;
        }, {});
        
        console.log('🔍 scalesRes.data:', safeData(scalesRes));
        console.log('📊 scalesMap:', scalesMap);

        const culturesMap = safeData(culturesRes).reduce((acc: any, c: any) => {
            if (!acc[c.paciente_id]) acc[c.paciente_id] = [];
            acc[c.paciente_id].push({
                id: c.id,
                site: c.local,
                microorganism: c.microorganismo,
                collectionDate: c.data_coleta,
                observation: c.observacao || undefined,
                isArchived: c.is_archived
            });
            return acc;
        }, {});

        const dietsMap = safeData(dietsRes).reduce((acc: any, d: any) => {
            if (!acc[d.paciente_id]) acc[d.paciente_id] = [];
            acc[d.paciente_id].push({
                id: d.id,
                type: d.tipo,
                data_inicio: d.data_inicio,
                data_remocao: d.data_remocao || undefined,
                volume: d.volume || undefined,
                vet: d.vet || undefined,
                vet_pleno: d.vet_pleno || undefined,
                vet_at: d.vet_at || undefined,
                pt: d.pt || undefined,
                pt_g_dia: d.pt_g_dia || undefined,
                pt_at: d.pt_at || undefined,
                th: d.th || undefined,
                observacao: d.observacao || undefined,
                isArchived: d.is_archived
            });
            return acc;
        }, {});

        const precautionsMap = safeData(precautionsRes).reduce((acc: any, p: any) => {
            if (!acc[p.patient_id]) acc[p.patient_id] = [];
            acc[p.patient_id].push({
                id: p.id,
                tipo_precaucao: p.tipo_precaucao,
                data_inicio: p.data_inicio,
                data_fim: p.data_fim || undefined,
                isArchived: false
            });
            return acc;
        }, {});

        const diuresisMap = safeData(diuresisRes).reduce((acc: any, d: any) => {
            if (!acc[d.patient_id]) acc[d.patient_id] = [];
            acc[d.patient_id].push({
                id: d.id,
                peso: d.peso,
                volume: d.volume,
                horas: d.horas,
                resultado: d.resultado,
                data_registro: d.data_registro
            });
            return acc;
        }, {});

        const balanceMap = safeData(balanceRes).reduce((acc: any, b: any) => {
            if (!acc[b.patient_id]) acc[b.patient_id] = [];
            acc[b.patient_id].push({
                id: b.id,
                peso: b.peso,
                volume: b.volume,
                resultado: b.resultado,
                data_registro: b.data_registro
            });
            return acc;
        }, {});

        const mappedPatients: Patient[] = patientsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            bedNumber: p.bed_number,
            motherName: p.mother_name || '-',
            dob: p.dob,
            ctd: p.diagnosis || 'Estável',
            peso: p.peso,
            sc: p.sc,
            status: p.status || 'estavel',
            comorbidade: p.comorbidade || undefined,
            admissionDate: p.dt_internacao || undefined,
            devices: devicesMap[p.id] || [],
            exams: examsMap[p.id] || [],
            medications: medsMap[p.id] || [],
            surgicalProcedures: surgsMap[p.id] || [],
            scaleScores: scalesMap[p.id] || [],
            cultures: culturesMap[p.id] || [],
            diets: dietsMap[p.id] || [],
            precautions: precautionsMap[p.id] || [],
            diurese: diuresisMap[p.id] || [],
            balanco_hidrico: balanceMap[p.id] || []
        }));
        
        // Debug: Mostrar escalas de cada paciente
        mappedPatients.forEach(p => {
            if (p.scaleScores.length > 0) {
                console.log(`📊 Paciente ${p.name} tem ${p.scaleScores.length} escalas:`, p.scaleScores);
            }
        });

        setPatients(mappedPatients);
        console.log('✅ Detalhes dos pacientes carregados em', Date.now());
    };

    const fetchPatients = async () => {
        if (!supabase) return;

        const today = getTodayDateString();

        // 🚀 OTIMIZAÇÃO: Carregar APENAS dados essenciais para listar leitos (BLOQUEADOR)
        const [
            patientsRes,
            questionsRes,
            optionsRes,
            categoriesRes,
            answersRes
        ] = await Promise.all([
            supabase.from('patients').select('id, name, bed_number, dob, status, mother_name, diagnosis, peso, dt_internacao, sc'),
            supabase.from('perguntas').select('*').order('ordem', { ascending: true }),
            supabase.from('pergunta_opcoes').select('*').order('ordem', { ascending: true }),
            supabase.from('categorias').select('*').order('ordem', { ascending: true }),
            supabase.from('checklist_answers').select('*').eq('date', today)
        ]);

        // Validar dados essenciais
        if (patientsRes.error) {
            console.error('❌ Error fetching patients:', patientsRes.error);
            return;
        }

        // Mapear pacientes básicos ANTES de carregar dados detalhados
        const basicPatients: Patient[] = (patientsRes.data || []).map((p: any) => ({
            id: p.id,
            name: p.name || 'N/A',
            bedNumber: p.bed_number || 0,
            dob: p.dob || '',
            status: p.status || 'estavel',
            motherName: p.mother_name || '',
            ctd: p.diagnosis || 'Estável',
            admissionDate: p.dt_internacao || undefined,
            peso: p.peso || undefined,
            sc: p.sc || undefined,
            devices: [],
            exams: [],
            medications: [],
            surgicalProcedures: [],
            scaleScores: [],
            cultures: [],
            diets: [],
            precautions: []
        }));

        // ✅ MOSTRAR LEITOS JÁ (NÃO ESPERAR DADOS DETALHADOS)
        setPatients(basicPatients);
        console.log('✅ Leitos carregados rapidamente:', basicPatients.length);

        // 🔄 Carregar dados detalhados EM BACKGROUND (não bloqueia renderização)
        setTimeout(() => {
            Promise.all([
                supabase.from('patients').select('id, name, bed_number, dob, status, mother_name, diagnosis, peso, dt_internacao, sc'),
                supabase.from('dispositivos_pacientes').select('*'),
                supabase.from('exames_pacientes').select('*'),
                supabase.from('medicacoes_pacientes').select('*'),
                supabase.from('procedimentos_pacientes').select('*'),
                supabase.from('scale_scores').select('*'),
                supabase.from('culturas_pacientes').select('*'),
                supabase.from('dietas_pacientes').select('*'),
                supabase.from('precautions').select('*'),
                supabase.from('diurese').select('*'),
                supabase.from('balanco_hidrico').select('*')
            ]).then(([
                patientsFullRes,
                devicesRes,
                examsRes,
                medsRes,
                surgsRes,
                scalesRes,
                culturesRes,
                dietsRes,
                precautionsRes,
                diuresisRes,
                balanceRes
            ]) => {
                // ✅ DEBUG ESCALAS
                console.log('🔥 scalesRes.error:', scalesRes.error);
                console.log('🔥 scalesRes.data length:', scalesRes.data?.length);
                if (scalesRes.error) {
                    console.error('❌ ERRO AO BUSCAR ESCALAS:', scalesRes.error);
                } else if (!scalesRes.data || scalesRes.data.length === 0) {
                    console.warn('⚠️ Nenhuma escala encontrada na tabela scale_scores');
                }
                
                // ✅ VALIDAR ERROS ANTES DE PROCESSAR
                if (patientsFullRes.error || !patientsFullRes.data) {
                    console.error('❌ Erro ao carregar pacientes completos:', patientsFullRes.error);
                    return;
                }

                // Processar e atualizar dados detalhados
                processPatientDetails(patientsFullRes.data, {
                    devicesRes,
                    examsRes,
                    medsRes,
                    surgsRes,
                    scalesRes,
                    culturesRes,
                    dietsRes,
                    precautionsRes,
                    diuresisRes,
                    balanceRes
                });
                console.log('✅ Dados detalhados carregados em background');
            });
        }, 500); // Pequeno delay para não competir com renderização dos leitos

        console.log('📊 Resultado das queries:');
        console.log('  - questionsRes.error:', questionsRes.error);
        console.log('  - questionsRes.data length:', questionsRes.data?.length);
        console.log('  - optionsRes.error:', optionsRes.error);
        console.log('  - optionsRes.data length:', optionsRes.data?.length);
        console.log('  - categoriesRes.error:', categoriesRes.error);
        console.log('  - categoriesRes.data length:', categoriesRes.data?.length);
        if (questionsRes.data && questionsRes.data.length > 0) {
            console.log('  - primeira pergunta:', questionsRes.data[0]);
        }

        // Process Categories from DB
        if (categoriesRes.data && categoriesRes.data.length > 0) {
            const mappedCategories = categoriesRes.data.map((c: any) => ({
                id: c.id,
                name: c.nome,
                // Map icon string to React Component, default to FileTextIcon if not found
                icon: ICON_MAP[c.icone] || FileTextIcon
            }));
            setCategories(mappedCategories);
        } else {
            // Fallback to static constants
            setCategories(STATIC_CATEGORIES);
        }

        // Process Questions and Options
        if (questionsRes.data && questionsRes.data.length > 0 && optionsRes.data) {
            // Criar mapa de opções por pergunta_id
            const optionsMap: Record<number, any[]> = {};
            (optionsRes.data || []).forEach((opt: any) => {
                if (!optionsMap[opt.pergunta_id]) {
                    optionsMap[opt.pergunta_id] = [];
                }
                optionsMap[opt.pergunta_id].push({
                    id: opt.codigo,
                    label: opt.label,
                    hasInput: opt.has_input,
                    inputPlaceholder: opt.input_placeholder,
                    ordem: opt.ordem
                });
            });

            const mappedQuestions = questionsRes.data.map((q: any) => ({
                id: q.id,
                text: q.texto,
                categoryId: q.categoria_id,
                alertOptions: (optionsMap[q.id] || []).sort((a: any, b: any) => a.ordem - b.ordem)
            }));
            setQuestions(mappedQuestions);
            console.log('✅ Perguntas carregadas do Supabase:', mappedQuestions.length);
        } else {
            // Fallback to STATIC_QUESTIONS if database questions table is empty or fetch fails
            console.warn('⚠️ Usando perguntas estáticas - erro ou tabela vazia:', questionsRes.error);
            setQuestions(STATIC_QUESTIONS);
        }

        // Process Answers
        if (answersRes.data) {
            const answersMap: Record<string, Record<number, Answer>> = {};
            answersRes.data.forEach((a: any) => {
                if (a.patient_id) {
                    if (!answersMap[a.patient_id]) answersMap[a.patient_id] = {};
                    answersMap[a.patient_id][a.question_id] = a.answer as Answer;
                }
            });
            setChecklistAnswers(answersMap);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (session?.user) {
                    fetchPatients();
                }
            }

            if (event === 'SIGNED_OUT') {
                setPatients([]);
                setChecklistAnswers({});
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const saveChecklistAnswer = async (patientId: number | string, categoryId: number, questionId: number, answer: Answer) => {
        const today = getTodayDateString();

        // Optimistic Update
        setChecklistAnswers(prev => ({
            ...prev,
            [patientId]: {
                ...(prev[patientId] || {}),
                [questionId]: answer
            }
        }));

        const { error } = await supabase.from('checklist_answers').upsert({
            patient_id: patientId,
            category_id: categoryId,
            question_id: questionId,
            answer: answer,
            date: today
        }, { onConflict: 'patient_id,question_id,date' });

        if (error) {
            console.error("Error saving answer:", error);
        }
    };

    const addDeviceToPatient = async (patientId: number | string, device: Omit<Device, 'id'>, userId?: string) => {
        try {
            console.log('🔍 addDeviceToPatient - userId recebido:', userId);
            const { data, error } = await supabase.from('dispositivos_pacientes').insert([{
                paciente_id: patientId,
                tipo_dispositivo: device.name,
                localizacao: device.location,
                data_insercao: device.startDate,
                observacao: device.observacao || null,
                criado_por_id: userId || null
            }]);
            
            if (error) {
                console.error('❌ Erro ao adicionar dispositivo:', error);
                throw new Error(error.message);
            }
            
            console.log('✅ Dispositivo adicionado:', data);
            await fetchPatients();
            return data;
        } catch (error) {
            console.error('❌ Erro na operação de adicionar dispositivo:', error);
            throw error;
        }
    };

    const addExamToPatient = async (patientId: number | string, exam: Omit<Exam, 'id'>, userId?: string) => {
        console.log('🔍 addExamToPatient - userId recebido:', userId);
        const payload = {
            paciente_id: patientId,
            nome_exame: exam.name,
            data_exame: exam.date,
            observacao: exam.observation,
            criado_por_id: userId || null
        };
        console.log('📦 Payload para Supabase:', payload);
        const { data, error } = await supabase.from('exames_pacientes').insert([payload]);
        
        if (error) {
            console.error('❌ Erro ao inserir exame:', error);
        } else {
            console.log('✅ Exame inserido com sucesso:', data);
        }
        
        if (!error) fetchPatients();
    };

    const addMedicationToPatient = async (patientId: number | string, medication: Omit<Medication, 'id'>, userId?: string) => {
        console.log('🔍 addMedicationToPatient - userId recebido:', userId);
        const parts = medication.dosage.split(' ');
        const valor = parts[0] || '';
        const unidade = parts.slice(1).join(' ') || '';

        const payload = {
            paciente_id: patientId,
            nome_medicacao: medication.name,
            dosagem_valor: valor,
            unidade_medida: unidade,
            data_inicio: medication.startDate,
            observacao: medication.observacao || null,
            criado_por_id: userId || null
        };
        console.log('📦 Payload para Supabase (medicação):', payload);
        
        const { data, error } = await supabase.from('medicacoes_pacientes').insert([payload]);
        
        if (error) {
            console.error('❌ Erro ao inserir medicação:', error);
        } else {
            console.log('✅ Medicação inserida com sucesso:', data);
        }
        
        if (!error) fetchPatients();
    };

    const addSurgicalProcedureToPatient = async (patientId: number | string, procedure: Omit<SurgicalProcedure, 'id'>, userId?: string) => {
        console.log('🔍 addSurgicalProcedureToPatient - userId recebido:', userId);
        
        const payload = {
            paciente_id: patientId,
            nome_procedimento: procedure.name,
            data_procedimento: procedure.date,
            nome_cirurgiao: procedure.surgeon,
            notas: procedure.notes,
            criado_por_id: userId || null
        };
        console.log('📦 Payload para Supabase (procedimento):', payload);
        
        const { data, error } = await supabase.from('procedimentos_pacientes').insert([payload]);
        
        if (error) {
            console.error('❌ Erro ao inserir procedimento:', error);
        } else {
            console.log('✅ Procedimento inserido com sucesso:', data);
        }
        
        if (!error) fetchPatients();
    };

    const addRemovalDateToDevice = async (patientId: number | string, deviceId: number | string, removalDate: string) => {
        try {
            // ✅ CONVERTER DATA (YYYY-MM-DD) PARA TIMESTAMP ISO
            const dateObj = new Date(`${removalDate}T00:00:00Z`);
            const isoTimestamp = dateObj.toISOString();
            
            const { data, error } = await supabase.from('dispositivos_pacientes')
                .update({ data_remocao: isoTimestamp })
                .eq('id', deviceId)
                .select();
            
            if (error) {
                console.error('❌ Erro ao adicionar data de remoção:', error);
                throw error;
            }
            
            console.log('✅ Data de remoção adicionada:', data);
            await fetchPatients();
            return data;
        } catch (error) {
            console.error('❌ Erro na operação de adicionar data de remoção:', error);
            throw error;
        }
    };

    const deleteDeviceFromPatient = async (patientId: number | string, deviceId: number | string) => {
        const { error } = await supabase.from('dispositivos_pacientes')
            .update({ is_archived: true })
            .eq('id', deviceId);

        if (error) {
            console.warn("Soft delete failed (possibly missing column), attempting hard delete:", error);
            const { error: hardDeleteError } = await supabase.from('dispositivos_pacientes')
                .delete()
                .eq('id', deviceId);

            if (!hardDeleteError) {
                fetchPatients();
            } else {
                console.error("Hard delete also failed:", hardDeleteError);
            }
        } else {
            fetchPatients();
        }
    };

    const addEndDateToMedication = async (patientId: number | string, medicationId: number | string, endDate: string) => {
        const { error } = await supabase.from('medicacoes_pacientes')
            .update({ data_fim: endDate })
            .eq('id', medicationId);
        if (!error) fetchPatients();
    };

    const deleteMedicationFromPatient = async (patientId: number | string, medicationId: number | string) => {
        const { error } = await supabase.from('medicacoes_pacientes')
            .update({ is_archived: true })
            .eq('id', medicationId);
        if (!error) fetchPatients();
    };

    const updateExamInPatient = async (patientId: number | string, examData: Exam) => {
        const { error } = await supabase.from('exames_pacientes')
            .update({
                nome_exame: examData.name,
                data_exame: examData.date,
                observacao: examData.observation
            })
            .eq('id', examData.id);
        if (!error) fetchPatients();
    };

    const deleteExamFromPatient = async (patientId: number | string, examId: number | string) => {
        const { error } = await supabase.from('exames_pacientes')
            .update({ is_archived: true })
            .eq('id', examId);
        if (!error) fetchPatients();
    };

    const updateDeviceInPatient = async (patientId: number | string, deviceData: Device) => {
        const { error } = await supabase.from('dispositivos_pacientes')
            .update({
                tipo_dispositivo: deviceData.name,
                localizacao: deviceData.location,
                data_insercao: deviceData.startDate,
                data_remocao: deviceData.removalDate || null,
                observacao: deviceData.observacao || null
            })
            .eq('id', deviceData.id);
        if (!error) fetchPatients();
    };

    const updateMedicationInPatient = async (patientId: number | string, medicationData: Medication) => {
        const parts = medicationData.dosage.split(' ');
        const valor = parts[0] || '';
        const unidade = parts.slice(1).join(' ') || '';

        const { error } = await supabase.from('medicacoes_pacientes')
            .update({
                nome_medicacao: medicationData.name,
                dosagem_valor: valor,
                unidade_medida: unidade,
                data_inicio: medicationData.startDate,
                data_fim: medicationData.endDate || null,
                observacao: medicationData.observacao || null
            })
            .eq('id', medicationData.id);
        if (!error) fetchPatients();
    };

    const updateSurgicalProcedureInPatient = async (patientId: number | string, procedureData: SurgicalProcedure) => {
        const { error } = await supabase.from('procedimentos_pacientes')
            .update({
                nome_procedimento: procedureData.name,
                data_procedimento: procedureData.date,
                nome_cirurgiao: procedureData.surgeon,
                notas: procedureData.notes
            })
            .eq('id', procedureData.id);
        if (!error) fetchPatients();
    };

    const deleteSurgicalProcedureFromPatient = async (patientId: number | string, procedureId: number | string) => {
        const { error } = await supabase.from('procedimentos_pacientes')
            .update({ is_archived: true })
            .eq('id', procedureId);
        if (!error) fetchPatients();
    };

    const addScaleScoreToPatient = async (patientId: number | string, score: Omit<ScaleScore, 'id'>) => {
        const { error } = await supabase.from('scale_scores').insert([{
            patient_id: patientId,
            scale_name: score.scaleName,
            score: score.score,
            interpretation: score.interpretation,
            date: score.date
        }]);

        if (error) console.warn("Scale table error", error);
        if (!error) fetchPatients();
    };

    const addCultureToPatient = async (patientId: number | string, culture: Omit<Culture, 'id'>, userId?: string) => {
        console.log('🔍 addCultureToPatient - userId recebido:', userId);
        
        const payload = {
            paciente_id: patientId,
            local: culture.site,
            microorganismo: culture.microorganism,
            data_coleta: culture.collectionDate,
            observacao: culture.observation || null,
            criado_por_id: userId || null
        };
        console.log('📦 Payload para Supabase (cultura):', payload);
        
        const { data, error } = await supabase.from('culturas_pacientes').insert([payload]);

        if (error) {
            console.error('❌ Erro ao inserir cultura:', error);
        } else {
            console.log('✅ Cultura inserida com sucesso:', data);
        }
        
        if (!error) fetchPatients();
    };

    const deleteCultureFromPatient = async (patientId: number | string, cultureId: number | string) => {
        const { error } = await supabase.from('culturas_pacientes')
            .update({ is_archived: true })
            .eq('id', cultureId);
        if (!error) fetchPatients();
    };

    const updateCultureInPatient = async (patientId: number | string, cultureData: Culture) => {
        const { error } = await supabase.from('culturas_pacientes')
            .update({
                local: cultureData.site,
                microorganismo: cultureData.microorganism,
                data_coleta: cultureData.collectionDate,
                observacao: cultureData.observation || null
            })
            .eq('id', cultureData.id);
        if (!error) fetchPatients();
    };

    const addDietToPatient = async (patientId: number | string, diet: Omit<Diet, 'id'>, userId?: string) => {
        // vet_at e pt_at são calculados automaticamente pelo banco (GENERATED ALWAYS AS)
        console.log('🔍 addDietToPatient - userId recebido:', userId);
        
        const payload = {
            paciente_id: patientId,
            tipo: diet.type,
            data_inicio: diet.data_inicio,
            data_remocao: diet.data_remocao || null,
            volume: diet.volume || null,
            vet: diet.vet || null,
            vet_pleno: diet.vet_pleno || null,
            pt: diet.pt || null,
            pt_g_dia: diet.pt_g_dia || null,
            th: diet.th || null,
            observacao: diet.observacao || null,
            criado_por_id: userId || null  // 🟢 Capturar o ID de quem está criando
        };
        
        console.log('📦 Payload para Supabase (dieta):', payload);
        
        const { error } = await supabase.from('dietas_pacientes').insert([payload]);

        if (error) {
            console.error('❌ Erro ao inserir dieta:', error);
        } else {
            console.log('✅ Dieta inserida com sucesso');
        }
        
        if (!error) fetchPatients();
    };

    const deleteDietFromPatient = async (patientId: number | string, dietId: number | string, userId?: string) => {
        console.log('🔍 deleteDietFromPatient - userId recebido:', userId);
        
        const { error } = await supabase.from('dietas_pacientes')
            .update({ 
                is_archived: true,
                arquivado_por_id: userId || null  // 🟢 Capturar quem está arquivando
            })
            .eq('id', dietId);
        
        if (error) {
            console.error('❌ Erro ao arquivar dieta:', error);
        } else {
            console.log('✅ Dieta arquivada com sucesso');
        }
        
        if (!error) fetchPatients();
    };

    const updateDietInPatient = async (patientId: number | string, dietData: Diet) => {
        // vet_at e pt_at são calculados automaticamente pelo banco (GENERATED ALWAYS AS)
        const { error } = await supabase.from('dietas_pacientes')
            .update({
                tipo: dietData.type,
                data_inicio: dietData.data_inicio,
                data_remocao: dietData.data_remocao || null,
                volume: dietData.volume || null,
                vet: dietData.vet || null,
                vet_pleno: dietData.vet_pleno || null,
                pt: dietData.pt || null,
                pt_g_dia: dietData.pt_g_dia || null,
                th: dietData.th || null,
                observacao: dietData.observacao || null
            })
            .eq('id', dietData.id);
        if (!error) fetchPatients();
    };

    // Precautions Functions
    const addPrecautionToPatient = async (patientId: number | string, precaution: Omit<Precaution, 'id'>) => {
        const { error } = await supabase.from('precautions').insert([{
            patient_id: patientId,
            tipo_precaucao: precaution.tipo_precaucao,
            data_inicio: precaution.data_inicio,
            data_fim: precaution.data_fim || null
        }]);

        if (error) console.warn("Precaution table error", error);
        if (!error) fetchPatients();
    };

    const deletePrecautionFromPatient = async (patientId: number | string, precautionId: number | string) => {
        const { error } = await supabase.from('precautions')
            .delete()
            .eq('id', precautionId);
        if (!error) fetchPatients();
    };

    const updatePrecautionInPatient = async (patientId: number | string, precautionData: Precaution) => {
        const { error } = await supabase.from('precautions')
            .update({
                tipo_precaucao: precautionData.tipo_precaucao,
                data_inicio: precautionData.data_inicio,
                data_fim: precautionData.data_fim || null
            })
            .eq('id', precautionData.id);
        if (!error) fetchPatients();
    };

    const addEndDateToPrecaution = async (patientId: number | string, precautionId: number | string, endDate: string) => {
        const { error } = await supabase.from('precautions')
            .update({ data_fim: endDate })
            .eq('id', precautionId);
        if (!error) fetchPatients();
    };

    const updatePatientDetails = async (patientId: number | string, data: { motherName?: string; ctd?: string; peso?: number; sc?: number }) => {
        try {
            const updateData: any = {};
            if (data.motherName !== undefined) updateData.mother_name = data.motherName;
            if (data.ctd !== undefined) updateData.diagnosis = data.ctd;
            if (data.peso !== undefined) {
                // Garantir que peso é um número
                const pesoNumero = typeof data.peso === 'string' ? parseFloat(data.peso) : data.peso;
                updateData.peso = pesoNumero || null;
                console.log('⚖️ DEBUG PESO:', { original: data.peso, convertido: pesoNumero, final: updateData.peso });
            }
            if (data.sc !== undefined) {
                const scNumero = typeof data.sc === 'string' ? parseFloat(data.sc) : data.sc;
                updateData.sc = scNumero || null;
                console.log('🫁 DEBUG SC:', { original: data.sc, convertido: scNumero, final: updateData.sc });
            }

            console.log('💾 Salvando dados do paciente:', { patientId, updateData });

            const { data: result, error } = await supabase.from('patients')
                .update(updateData)
                .eq('id', patientId)
                .select();

            console.log('📊 Resultado completo:', { resultado: result, erro: error });

            if (error) {
                console.error('❌ Erro ao salvar dados do paciente:', error);
                alert(`Erro ao salvar: ${error.message}`);
                return;
            }

            console.log('✅ Dados do paciente salvos com sucesso!', result);
            alert('✅ Informações atualizadas com sucesso!');
            
            // Pequeno delay para garantir que o banco atualizou
            setTimeout(() => {
                fetchPatients();
            }, 500);
        } catch (err) {
            console.error('❌ Erro ao salvar dados do paciente:', err);
            alert(`Erro ao salvar: ${err}`);
        }
    };

    const value = {
        patients,
        questions,
        checklistAnswers,
        categories,
        addDeviceToPatient,
        addExamToPatient,
        addMedicationToPatient,
        addSurgicalProcedureToPatient,
        addRemovalDateToDevice,
        deleteDeviceFromPatient,
        addEndDateToMedication,
        deleteMedicationFromPatient,
        updateExamInPatient,
        deleteExamFromPatient,
        updateDeviceInPatient,
        updateMedicationInPatient,
        updateSurgicalProcedureInPatient,
        deleteSurgicalProcedureFromPatient,
        addScaleScoreToPatient,
        updatePatientDetails,
        saveChecklistAnswer,
        addCultureToPatient,
        deleteCultureFromPatient,
        updateCultureInPatient,
        addDietToPatient,
        deleteDietFromPatient,
        updateDietInPatient,
        addPrecautionToPatient,
        deletePrecautionFromPatient,
        updatePrecautionInPatient,
        addEndDateToPrecaution,
    };

    return <PatientsContext.Provider value={value as PatientsContextType}>{children}</PatientsContext.Provider>;
};


const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Start with empty array, will fetch on mount
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = async () => {
        if (supabase) {
            // Fetch from 'tasks', 'alertas_paciente', 'alerts', and 'categorias' tables
            const [tasksRes, alertsRes, alertsTableRes, categoriasRes] = await Promise.all([
                supabase.from('tasks').select('*').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err })),
                supabase.from('alertas_paciente').select('*').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err })),
                supabase.from('alerts').select('*').eq('status', 'ativo').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err })), // Only active alerts
                supabase.from('categorias').select('id, nome').then(res => ({ ...res, error: res.error }), err => ({ data: null, error: err }))
            ]);

            // Create a map of categoria_id -> category name for quick lookup
            const categoriasMap = new Map<number, string>();
            if (categoriasRes.data && !categoriasRes.error) {
                categoriasRes.data.forEach((cat: any) => {
                    categoriasMap.set(cat.id, cat.nome);
                });
            }

            let mappedTasks: Task[] = [];

            // Map standard checklist tasks
            if (tasksRes.data && !tasksRes.error) {
                mappedTasks = tasksRes.data.map((t: any) => ({
                    id: t.id,
                    patientId: t.patient_id,
                    categoryId: t.category_id,
                    description: t.description,
                    responsible: t.responsible,
                    deadline: t.deadline,
                    status: t.status,
                    justification: t.justification,
                    patientName: t.patient_name,
                    categoryName: t.category,
                    timeLabel: t.time_label,
                    options: t.options
                }));
            }

            // Map new 'alertas_paciente' tasks
            if (alertsRes.data && !alertsRes.error) {
                const mappedAlerts: Task[] = alertsRes.data.map((a: any) => {
                    // Calculate deadline from hora_selecionada string (e.g. "1 hora")
                    const hours = parseInt(a.hora_selecionada?.split(' ')[0] || '0');
                    const created = new Date(a.created_at);
                    const deadline = new Date(created.getTime() + hours * 60 * 60 * 1000).toISOString();

                    return {
                        id: a.id, // UUID from new table
                        patientId: a.patient_id,
                        categoryId: 0, // General category for these alerts
                        description: a.alerta_descricao,
                        responsible: a.responsavel,
                        deadline: deadline,
                        // Map 'Pendente' to 'alerta' for UI compatibility
                        status: (a.status === 'Pendente' || a.status === 'Aberto') ? 'alerta' : (a.status === 'Concluido' ? 'concluido' : 'alerta'),
                        categoryName: 'Geral',
                        timeLabel: a.hora_selecionada,
                    };
                });
                mappedTasks = [...mappedTasks, ...mappedAlerts];
            }

            // Map 'alerts' table with categoria_id foreign key
            if (alertsTableRes.data && !alertsTableRes.error) {
                const mappedNewAlerts: Task[] = alertsTableRes.data.map((a: any) => {
                    const categoryName = categoriasMap.get(a.categoria_id) || 'Geral';
                    return {
                        id: a.id, // UUID
                        patientId: a.user_id || 0, // Store user_id as patientId for now
                        categoryId: a.categoria_id,
                        description: a.description || '',
                        responsible: a.user_id || 'Sistema',
                        deadline: a.created_at,
                        status: 'alerta',
                        categoryName: categoryName, // Use name from categorias table
                    };
                });
                mappedTasks = [...mappedTasks, ...mappedNewAlerts];
            } else if (alertsTableRes.error) {
                // Log but don't fail if alerts table doesn't exist yet
                console.debug('Alerts table not available or error:', alertsTableRes.error);
            }

            setTasks(mappedTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateTaskJustification = async (taskId: number | string, justification: string, userId?: string) => {
        // Only updating standard tasks for now as ID types might differ (int vs uuid)
        // Ideally check ID type or table source
        const { error } = await supabase.from('tasks')
            .update({ 
                justification, 
                justification_by: userId || null,
                justification_at: new Date().toISOString(),
                status: 'fora_do_prazo' 
            })
            .eq('id', taskId);
        if (!error) fetchTasks();
    };

    const updateTaskStatus = async (taskId: number | string, status: TaskStatus) => {
        // Check if ID is UUID (string) -> updates 'alertas_paciente', else 'tasks'
        // Simple heuristic: if taskId is string and long, it's likely UUID from new table
        const isUuid = typeof taskId === 'string' && taskId.length > 30;

        if (isUuid) {
            const dbStatus = status === 'concluido' ? 'Concluido' : 'Pendente';
            const { error } = await supabase.from('alertas_paciente')
                .update({ status: dbStatus })
                .eq('id', taskId);
            if (!error) fetchTasks();
        } else {
            const { error } = await supabase.from('tasks')
                .update({ status })
                .eq('id', taskId);
            if (!error) fetchTasks();
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'status' | 'justification'>) => {
        const user = await supabase.auth.getUser();
        const userId = user.data?.user?.id;
        
        const { error } = await supabase.from('tasks').insert([{
            patient_id: taskData.patientId,
            category_id: taskData.categoryId,
            description: taskData.description,
            responsible: taskData.responsible,
            deadline: taskData.deadline,
            status: 'alerta',
            patient_name: taskData.patientName,
            category: taskData.categoryName,
            time_label: taskData.timeLabel,
            options: taskData.options,
            created_by: userId
        }]);
        if (!error) fetchTasks();
    };

    const addPatientAlert = async (data: { patientId: string | number; description: string; responsible: string; timeLabel: string }) => {
        const user = await supabase.auth.getUser();
        const userId = user.data?.user?.id;
        
        const { error } = await supabase.from('alertas_paciente').insert([{
            patient_id: data.patientId,
            alerta_descricao: data.description,
            responsavel: data.responsible,
            hora_selecionada: data.timeLabel,
            status: 'Pendente',
            created_at: new Date().toISOString(),
            created_by: userId
        }]);

        if (error) {
            console.error("Error creating patient alert:", error);
            return false;
        } else {
            fetchTasks();
            // Aguarda um pouco para garantir que o banco processou
            setTimeout(() => {
                window.location.reload();
            }, 500);
            return true;
        }
    }

    const value = {
        tasks,
        updateTaskJustification,
        updateTaskStatus,
        addTask,
        addPatientAlert
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = (notification: NotificationState) => {
        setNotification(notification);
    };

    const hideNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [isLoading, setIsLoading] = useState(true);

    const getAvatarUrl = (foto?: string | null) => {
        if (!foto) return '';
        if (/^data:image\//i.test(foto)) return foto;
        if (/^https?:\/\//i.test(foto)) return foto;

        const bucketName = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'avatars';
        const { data } = supabase.storage.from(bucketName).getPublicUrl(foto);
        return data?.publicUrl || '';
    };

    const mapDbUserToAppUser = (data: any): User => ({
        id: data.id,
        name: data.name || '',
        title: data.role || '',
        avatarUrl: getAvatarUrl(data.foto),
        sector: data.sector || '',
        access_level: (data.access_level || 'geral') as 'adm' | 'geral',
    });

    const loadUser = async (sessionOverride?: Session | null) => {
        try {
            console.log('🟡 [LOADUSER] Iniciando carregamento...');
            setIsLoading(true);
            
            // 1. Check for Supabase Auth Session
            let session = sessionOverride;
            let sessionError: any = null;

            if (sessionOverride === undefined) {
                const sessionResult = await supabase.auth.getSession();
                session = sessionResult.data.session;
                sessionError = sessionResult.error;
            }
            
            console.log('🟡 [LOADUSER] Sessão obtida:', session?.user?.id, session?.user?.email);
            
            if (sessionError) {
                const message = String(sessionError?.message || '');
                const isInvalidRefreshToken =
                    /Invalid Refresh Token/i.test(message) || /Refresh Token Not Found/i.test(message);

                if (isInvalidRefreshToken) {
                    console.warn('⚠️ [LOADUSER] Refresh token inválido. Limpando sessão local...');
                    await supabase.auth.signOut({ scope: 'local' });
                    setUser(INITIAL_USER);
                } else {
                    console.error('❌ [LOADUSER] Erro ao obter sessão:', sessionError);
                }
                setIsLoading(false);
                return;
            }
            
            if (session?.user) {
                console.log('🟡 [LOADUSER] Buscando usuário no banco com ID:', session.user.id);
                
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                console.log('🟡 [LOADUSER] Resultado da busca:', { data, error });

                if (data) {
                    console.log('✅ [LOADUSER] Dados encontrados! Nome:', data.name);

                    const dbUser = mapDbUserToAppUser(data);
                    console.log('✅ [LOADUSER] Objeto do usuário criado:', dbUser);
                    setUser(dbUser);
                } else if (error) {
                    console.error('❌ [LOADUSER] Erro ao carregar usuário:', error);
                } else {
                    console.warn('⚠️ [LOADUSER] Nenhum dado retornado (usuário não existe no banco)');

                    const fallbackName =
                        session.user.user_metadata?.name ||
                        session.user.email?.split('@')[0] ||
                        'Usuário';

                    const { data: upsertedUser, error: upsertError } = await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            email: session.user.email,
                            name: fallbackName,
                            role: 'Médica',
                            access_level: 'geral',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'id' })
                        .select('*')
                        .maybeSingle();

                    if (upsertError) {
                        console.error('❌ [LOADUSER] Erro ao auto-criar usuário em public.users:', upsertError);
                        setUser({
                            id: session.user.id,
                            name: fallbackName,
                            title: 'Médica',
                            avatarUrl: '',
                            sector: '',
                            access_level: 'geral'
                        });
                    } else if (upsertedUser) {
                        console.log('✅ [LOADUSER] Usuário auto-criado em public.users');
                        setUser(mapDbUserToAppUser(upsertedUser));
                    }
                }
            } else {
                console.warn('⚠️ [LOADUSER] Nenhuma sessão ativa');
                setUser(INITIAL_USER);
            }
        } catch (error) {
            console.error('❌ [LOADUSER] Erro geral:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log('🟢 [USERPROVIDER] Componente montado, chamando loadUser()');
        loadUser();
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadUser(session);
            }

            if (event === 'SIGNED_OUT') {
                setUser(INITIAL_USER);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateUser = async (userData: Partial<User>) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);

        // ✅ SEGURANÇA: Não armazenar dados sensíveis em localStorage
        // Apenas atualizar no estado React e no Supabase

        // Persist to Supabase if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await supabase.from('users').upsert({
                id: session.user.id,
                name: newUser.name,
                role: newUser.title, // Mapping title to role
                foto: newUser.avatarUrl, // Mapping avatarUrl to foto
                sector: newUser.sector, // Mapping sector
                email: session.user.email,
                updated_at: new Date().toISOString()
            });
        }
    };

    return (
        <UserContext.Provider value={{ user, isLoading, updateUser, loadUser }}>
            {children}
        </UserContext.Provider>
    );
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


// --- MAIN APP ---

const ChecklistRedirector: React.FC = () => {
    const { patientId, categoryId } = useParams();
    useEffect(() => {
        if (patientId && categoryId) {
            window.location.hash = `/patient/${patientId}/round/category/${categoryId}/question/0`;
        }
    }, [patientId, categoryId]);
    return null;
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <NotificationProvider>
                <ThemeProvider>
                    <UserProvider>
                        <PatientsProvider>
                            <TasksProvider>
                                <Routes>
                                    <Route path="/" element={<LoginScreen />} />
                                    <Route path="/" element={<AppLayout />}>
                                        <Route path="dashboard" element={<DashboardScreen />} />
                                        <Route path="patients" element={<PatientListScreen />} />
                                        <Route path="patient/:patientId" element={<PatientDetailScreen />} />
                                        <Route path="patient/:patientId/history" element={<PatientHistoryScreen />} />
                                        <Route path="patient/:patientId/round/categories" element={<RoundCategoryListScreen />} />
                                        <Route path="patient/:patientId/round/category/:categoryId" element={<ChecklistRedirector />} />
                                        <Route path="patient/:patientId/round/category/:categoryId/question/:questionIndex" element={<ChecklistScreen />} />
                                        <Route path="patient/:patientId/round/category/:categoryId/question/:questionIndex/create-alert" element={<CreateAlertScreen />} />
                                        <Route path="patient/:patientId/create-alert" element={<CreateAlertScreen />} />
                                        <Route path="status/:status" element={<TaskStatusScreen />} />
                                        <Route path="history" element={<Suspense fallback={<LoadingSpinner />}><AlertsHistoryScreen useHeader={useHeader} /></Suspense>} />
                                        <Route path="settings" element={<SettingsScreen />} />
                                    </Route>
                                </Routes>
                            </TasksProvider>
                        </PatientsProvider>
                    </UserProvider>
                </ThemeProvider>
            </NotificationProvider>
        </HashRouter>
    );
}

export default App;
