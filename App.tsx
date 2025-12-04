
import React, { useState, useMemo, useContext, useEffect, createContext, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useParams, useLocation, Outlet, NavLink, Navigate } from 'react-router-dom';
import { Patient, Category, Question, ChecklistAnswer, Answer, Device, Exam, Medication, Task, TaskStatus, PatientsContextType, TasksContextType, NotificationState, NotificationContextType, User, UserContextType, Theme, ThemeContextType, SurgicalProcedure, ScaleScore, Culture } from './types';
import { PATIENTS as initialPatients, CATEGORIES as STATIC_CATEGORIES, QUESTIONS as STATIC_QUESTIONS, TASKS as initialTasks, DEVICE_TYPES, DEVICE_LOCATIONS, EXAM_STATUSES, RESPONSIBLES, ALERT_DEADLINES, INITIAL_USER, MEDICATION_DOSAGE_UNITS, ALERT_CATEGORIES, ICON_MAP, formatDateToBRL, formatDateTimeWithHour, calculateDaysSinceDate } from './constants';
import { BackArrowIcon, PlusIcon, WarningIcon, ClockIcon, AlertIcon, CheckCircleIcon, BedIcon, UserIcon, PencilIcon, BellIcon, InfoIcon, EyeOffIcon, ClipboardIcon, FileTextIcon, LogOutIcon, ChevronRightIcon, MenuIcon, DashboardIcon, CpuIcon, PillIcon, BarChartIcon, AppleIcon, DropletIcon, HeartPulseIcon, BeakerIcon, LiverIcon, LungsIcon, DumbbellIcon, BrainIcon, ShieldIcon, UsersIcon, HomeIcon, CloseIcon, SettingsIcon, CameraIcon, ScalpelIcon, SaveIcon, CheckSquareIcon, SquareIcon, ChevronDownIcon, CheckIcon, ChevronLeftIcon } from './components/icons';
import { ComfortBScale } from './components/ComfortBScale';
import { DeliriumScale } from './components/DeliriumScale';
import DeliriumPediatricoScale from './components/DeliriumPediatricoScale';
import { GlasgowScale } from './components/GlasgowScale';
import { CRSRScale } from './components/CRSRScale';
import { FLACCScale } from './components/FLACCScale';
import { BradenScale } from './components/BradenScale';
import { BradenQDScale } from './components/BradenQDScale';
import BradenRiscoLesaoScale from './components/BradenRiscoLesaoScale';
import { VniCnafScale } from './components/VniCnafScale';
import { FSSScale } from './components/FSSScale';
import { SecondaryNavigation } from './components/SecondaryNavigation';
import { supabase } from './supabaseClient';
import { AlertsHistoryScreen } from './AlertsHistoryScreen';
import {
    TasksContext,
    PatientsContext,
    NotificationContext,
    UserContext,
    ThemeContext,
    HeaderContext
} from './contexts';

// --- HELPER FOR DATES ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- LAYOUT & NAVIGATION ---

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext)!;
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
                <div className="flex items-center space-x-3 mb-4">
                    <img src={user.avatarUrl} alt="User avatar" className="w-12 h-12 rounded-full object-cover bg-slate-200" />
                    <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.title}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300 transition"
                >
                    <LogOutIcon className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
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

        if (location.pathname === '/history') {
            return '/dashboard';
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
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 sticky top-0 z-10 flex items-center shrink-0">
            <button
                onClick={showBackButton ? () => (typeof backPath === 'string' ? navigate(backPath) : navigate(-1)) : onMenuClick}
                className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition mr-2 lg:hidden"
            >
                {showBackButton ? <BackArrowIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <div className="hidden lg:block mr-4">
                {showBackButton && (
                    <button onClick={() => typeof backPath === 'string' ? navigate(backPath) : navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition">
                        <BackArrowIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 truncate">{title}</h1>
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
            <div className="flex h-screen bg-slate-5 dark:bg-slate-950">
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
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <div className="max-w-4xl mx-auto">
                            <Outlet />
                        </div>
                        {/* Footer with Credits */}
                        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                Idealizado por Dra. Lélia Braga / Criado por Noemi Sales
                            </p>
                        </div>
                    </main>
                </div>
            </div>
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
        success: <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />,
        error: <WarningIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />,
        info: <InfoIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />,
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
                        disabled={loading}
                        className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition text-base sm:text-lg flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const DashboardScreen: React.FC = () => {
    useHeader('Dashboard');
    const navigate = useNavigate();
    const { tasks } = useContext(TasksContext)!;
    const { categories } = useContext(PatientsContext)!;

    // Estado para armazenar dados do Supabase
    const [dashboardData, setDashboardData] = useState({
        totalAlertas: 0,
        totalNoPrazo: 0,
        totalForaDoPrazo: 0,
        totalConcluidos: 0
    });
    const [loading, setLoading] = useState(true);

    // Buscar dados do Supabase ao montar o componente
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('dashboard_summary')
                    .select('*')
                    .single();

                if (error) {
                    console.error('Erro ao buscar dados do dashboard:', error);
                } else if (data) {
                    setDashboardData({
                        totalAlertas: data.totalAlertas || 0,
                        totalNoPrazo: data.totalNoPrazo || 0,
                        totalForaDoPrazo: data.totalForaDoPrazo || 0,
                        totalConcluidos: data.totalConcluidos || 0
                    });
                }
            } catch (err) {
                console.error('Erro ao buscar dados do dashboard:', err);
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

    const alertChartData = useMemo(() => {
        // Count alerts by categoryName (from tasks with 'alerta' status)
        const counts: Record<string, number> = {};
        
        tasks
            .filter(t => t.status === 'alerta')
            .forEach(task => {
                const categoryName = task.categoryName || 'Geral';
                counts[categoryName] = (counts[categoryName] || 0) + 1;
            });

        // Debug log
        console.log('Alert Chart Data - Tasks with alerta status:', tasks.filter(t => t.status === 'alerta').length);
        console.log('Alert Chart Data - Counts by category:', counts);

        // Convert to sorted array, filtering out zero counts
        const entries = Object.entries(counts).filter(([, count]) => count > 0);
        const sorted = (entries as [string, number][]).sort(([, countA], [, countB]) => countB - countA);
        const maxCount = Math.max(...sorted.map(([, count]) => count), 0);

        return sorted.map(([name, count]) => ({
            name,
            count,
            percentage: maxCount > 0 ? (count / maxCount) * 100 : 0,
        }));
    }, [tasks]);

    return (
        <div className="space-y-8">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Carregando dados do dashboard...</p>
                    </div>
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
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Alertas por Categoria</h2>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                            {alertChartData.length > 0 ? (
                                <div className="space-y-4">
                                    {alertChartData.map(item => (
                                        <div key={item.name}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.count}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum alerta hoje.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const PatientListScreen: React.FC = () => {
    useHeader('Leitos');
    const { patients, questions, checklistAnswers } = useContext(PatientsContext)!;
    const [searchTerm, setSearchTerm] = useState('');

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
            <div className="space-y-3">
                {filteredPatients.map(patient => {
                    const progress = calculateProgress(patient.id);
                    return (
                        <Link to={`/patient/${patient.id}`} key={patient.id} className="block bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 text-blue-600 dark:text-blue-300 rounded-full font-bold text-lg">
                                    {patient.bedNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 break-words">{patient.name}</p>
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

    useHeader(patient ? `Histórico: ${patient.name}` : 'Histórico do Paciente');

    type TimelineEvent = {
        timestamp: string;
        icon: React.FC<{ className?: string; }>;
        description: string;
        hasTime: boolean;
    };

    const patientHistory = useMemo(() => {
        if (!patient) return {};

        const events: TimelineEvent[] = [];

        patient.devices.forEach(device => {
            events.push({
                timestamp: new Date(device.startDate).toISOString(),
                icon: CpuIcon,
                description: `Dispositivo Inserido: ${device.name} em ${device.location}.`,
                hasTime: false,
            });
            if (device.removalDate) {
                events.push({
                    timestamp: new Date(device.removalDate).toISOString(),
                    icon: CpuIcon,
                    description: `Dispositivo Retirado: ${device.name}.`,
                    hasTime: false,
                });
            }
        });

        patient.medications.forEach(med => {
            events.push({
                timestamp: new Date(med.startDate).toISOString(),
                icon: PillIcon,
                description: `Início Medicação: ${med.name} (${med.dosage}).`,
                hasTime: false,
            });
            if (med.endDate) {
                events.push({
                    timestamp: new Date(med.endDate).toISOString(),
                    icon: PillIcon,
                    description: `Fim Medicação: ${med.name}.`,
                    hasTime: false,
                });
            }
        });

        patient.exams.forEach(exam => {
            events.push({
                timestamp: new Date(exam.date).toISOString(),
                icon: FileTextIcon,
                description: `Exame Realizado: ${exam.name}.`,
                hasTime: false,
            });
        });

        patient.surgicalProcedures.forEach(procedure => {
            events.push({
                timestamp: new Date(procedure.date).toISOString(),
                icon: ScalpelIcon,
                description: `Cirurgia Realizada: ${procedure.name} por Dr(a). ${procedure.surgeon}.${procedure.notes ? ` Notas: ${procedure.notes}` : ''}`,
                hasTime: false,
            });
        });

        const patientAlerts = tasks.filter(task => task.patientId && patient.id && task.patientId.toString() === patient.id.toString() && task.status === 'alerta');
        patientAlerts.forEach(alert => {
            events.push({
                timestamp: alert.deadline,
                icon: BellIcon,
                description: `Alerta Criado: ${alert.description}.`,
                hasTime: true,
            });
        });

        patient.scaleScores?.forEach(score => {
            events.push({
                timestamp: score.date,
                icon: BarChartIcon,
                description: `Avaliação de Escala: ${score.scaleName} - Pontuação: ${score.score} (${score.interpretation}).`,
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
    }, [patient, tasks]);

    const handleGeneratePdf = () => {
        // ... (PDF generation logic remains the same)
        if (!patient) return;

        const generateDeviceList = () => patient.devices.map(d => `
            <li>
                <strong>${d.name} (${d.location})</strong><br>
                Início: ${formatDateToBRL(d.startDate)}
                ${d.removalDate ? `<br>Retirada: ${formatDateToBRL(d.removalDate)}` : ''}
            </li>
        `).join('');

        const generateMedicationList = () => patient.medications.map(m => `
            <li>
                <strong>${m.name} (${m.dosage})</strong><br>
                Início: ${formatDateToBRL(m.startDate)}
                ${m.endDate ? `<br>Fim: ${formatDateToBRL(m.endDate)}` : ''}
            </li>
        `).join('');

        const generateExamList = () => patient.exams.map(e => `
            <li>
                <strong>${e.name}</strong><br>
                Data: ${formatDateToBRL(e.date)}
                ${e.observation ? `<br><em>Obs: ${e.observation}</em>` : ''}
            </li>
        `).join('');

        const generateSurgicalList = () => patient.surgicalProcedures.map(p => `
            <li>
                <strong>${p.name}</strong> - Dr(a): ${p.surgeon}<br>
                Data: ${formatDateToBRL(p.date)}
                ${p.notes ? `<br><em>Obs: ${p.notes}</em>` : ''}
            </li>
        `).join('');

        const generateScaleScoresList = () => patient.scaleScores?.map(s => `
            <li>
                <strong>${s.scaleName}</strong> - Pontuação: ${s.score} (${s.interpretation})<br>
                Data e Hora: ${formatDateTimeWithHour(s.date)}
            </li>
        `).join('') || '<li>Nenhuma avaliação registrada.</li>';

        const generateHistoryList = () => Object.entries(patientHistory).map(([date, eventsOnDate]) => `
            <div class="history-group">
                <h3>${formatHistoryDate(date)}</h3>
                <ul>
                    ${(eventsOnDate as TimelineEvent[]).map(event => `
                        <li>
                            ${event.hasTime ? `Horário: [${new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}] ` : ''}
                            ${event.description}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        const htmlContent = `
            <html>
            <head>
                <title>Relatório do Paciente - ${patient.name}</title>
                <style>
                    body { font-family: sans-serif; margin: 20px; color: #333; }
                    h1, h2, h3 { color: #00796b; border-bottom: 2px solid #e0f2f1; padding-bottom: 5px; }
                    h1 { font-size: 24px; }
                    h2 { font-size: 20px; margin-top: 30px; }
                    h3 { font-size: 16px; margin-top: 20px; border-bottom: 1px solid #e0f2f1; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background-color: #e0f2f1; }
                    ul { list-style-type: none; padding-left: 0; }
                    li { background-color: #f7f7f7; border: 1px solid #eee; padding: 10px; margin-bottom: 8px; border-radius: 4px; }
                    .history-group ul { padding-left: 20px; }
                    .history-group li { background-color: transparent; border: none; padding: 5px 0; margin-bottom: 0; border-bottom: 1px dotted #ccc; }
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

                <h2>Dispositivos</h2>
                <ul>${generateDeviceList()}</ul>
                
                <h2>Medicações</h2>
                <ul>${generateMedicationList()}</ul>

                <h2>Exames</h2>
                <ul>${generateExamList()}</ul>
                
                <h2>Cirurgias</h2>
                <ul>${generateSurgicalList()}</ul>

                <h2>Avaliações de Escalas</h2>
                <ul>${generateScaleScoresList()}</ul>

                <h2>Histórico de Eventos</h2>
                ${generateHistoryList()}

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

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleGeneratePdf}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    <FileTextIcon className="w-5 h-5" />
                    Gerar PDF
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
                {Object.keys(patientHistory).length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(patientHistory).map(([date, eventsOnDate]) => (
                            <div key={date}>
                                <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">{formatHistoryDate(date)}</h3>
                                <div className="space-y-3">
                                    {(eventsOnDate as TimelineEvent[]).map((event, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/80 rounded-full mt-1">
                                                <event.icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-slate-800 dark:text-slate-200 text-sm">{event.description}</p>
                                                {event.hasTime && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Horário: {new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum histórico de eventos para este paciente.</p>
                )}
            </div>
        </div>
    );
};

// ... (EditPatientInfoModal, PatientDetailScreen remain mostly the same, ensure they render correctly)
const EditPatientInfoModal: React.FC<{ patientId: number | string, currentMotherName: string, currentDiagnosis: string, onClose: () => void }> = ({ patientId, currentMotherName, currentDiagnosis, onClose }) => {
    const { updatePatientDetails } = useContext(PatientsContext)!;
    const [motherName, setMotherName] = useState(currentMotherName);
    const [diagnosis, setDiagnosis] = useState(currentDiagnosis);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePatientDetails(patientId, { motherName, ctd: diagnosis });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Editar Informações</h2>
                    <button onClick={onClose}><CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Mãe</label>
                        <input
                            type="text"
                            value={motherName}
                            onChange={e => setMotherName(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Diagnóstico</label>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateAlertModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addPatientAlert } = useContext(TasksContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [description, setDescription] = useState('');
    const [responsible, setResponsible] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !responsible || !deadline) return;

        // Using the dedicated addPatientAlert function which saves to the 'alertas_paciente' table
        addPatientAlert({
            patientId: patientId,
            description,
            responsible,
            timeLabel: deadline,
        });

        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="bg-red-600 p-3 sm:p-4 flex justify-between items-center sticky top-0">
                    <div className="flex items-center gap-2 text-white">
                        <AlertIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <h2 className="text-base sm:text-lg font-bold">Criar Alerta</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-red-700/50 p-1 rounded-full">
                        <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alerta</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Digite o alerta identificado..."
                                required
                                className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
                            <div className="relative">
                                <select value={responsible} onChange={e => setResponsible(e.target.value)} required className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="" disabled>Selecione...</option>
                                    {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione a hora</label>
                            <div className="relative">
                                <select value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 appearance-none">
                                    <option value="" disabled>Selecione...</option>
                                    {ALERT_DEADLINES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition text-base sm:text-lg flex items-center justify-center gap-2 mt-2"
                        >
                            <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            Salvar Alerta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const AddCultureModal: React.FC<{ patientId: number | string; onClose: () => void }> = ({ patientId, onClose }) => {
    const { addCultureToPatient } = useContext(PatientsContext)!;
    const [site, setSite] = useState('');
    const [microorganism, setMicroorganism] = useState('');
    const [collectionDate, setCollectionDate] = useState(getTodayDateString());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (site && microorganism && collectionDate) {
            addCultureToPatient(patientId, { site, microorganism, collectionDate });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
                    <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200">Cadastrar Cultura</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                <div className="p-4 sm:p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Local</label>
                            <input
                                type="text"
                                value={site}
                                onChange={(e) => setSite(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                placeholder="Ex: Hemocultura"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Microorganismo</label>
                            <input
                                type="text"
                                value={microorganism}
                                onChange={(e) => setMicroorganism(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                placeholder="Ex: Staphylococcus aureus"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                            <input
                                type="date"
                                value={collectionDate}
                                onChange={(e) => setCollectionDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 rounded-lg transition mt-2 text-sm sm:text-base"
                        >
                            Cadastrar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const EditCultureModal: React.FC<{ culture: Culture; patientId: number | string; onClose: () => void; }> = ({ culture, patientId, onClose }) => {
    const { updateCultureInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [site, setSite] = useState(culture.site);
    const [microorganism, setMicroorganism] = useState(culture.microorganism);
    const [collectionDate, setCollectionDate] = useState(culture.collectionDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!site || !microorganism || !collectionDate) return;
        updateCultureInPatient(patientId, { ...culture, site, microorganism, collectionDate });
        showNotification({ message: 'Cultura atualizada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Editar Cultura</h2>
                    <button onClick={onClose}><CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Local</label>
                        <input
                            type="text"
                            placeholder="Ex: Hemocultura"
                            value={site}
                            onChange={e => setSite(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Microorganismo</label>
                        <input
                            type="text"
                            placeholder="Ex: Staphylococcus aureus"
                            value={microorganism}
                            onChange={e => setMicroorganism(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input
                            type="date"
                            value={collectionDate}
                            onChange={e => setCollectionDate(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};

const PatientDetailScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients, addRemovalDateToDevice, deleteDeviceFromPatient, addEndDateToMedication, deleteMedicationFromPatient, deleteExamFromPatient, deleteSurgicalProcedureFromPatient, addScaleScoreToPatient, addCultureToPatient, deleteCultureFromPatient } = useContext(PatientsContext)!;
    const { user } = useContext(UserContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);

    useHeader(patient ? `Leito ${patient.bedNumber}` : 'Paciente não encontrado');

    const [mainTab, setMainTab] = useState<'data' | 'scales'>('data');
    const [dataTab, setDataTab] = useState<'devices' | 'exams' | 'medications' | 'surgical' | 'cultures'>('devices');
    const [isAddDeviceModalOpen, setAddDeviceModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [isAddExamModalOpen, setAddExamModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [isAddMedicationModalOpen, setAddMedicationModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
    const [isAddSurgicalModalOpen, setAddSurgicalModalOpen] = useState(false);
    const [editingSurgicalProcedure, setEditingSurgicalProcedure] = useState<SurgicalProcedure | null>(null);
    const [isAddCultureModalOpen, setAddCultureModalOpen] = useState(false);
    const [editingCulture, setEditingCulture] = useState<Culture | null>(null);
    const [isRemovalModalOpen, setRemovalModalOpen] = useState<number | string | null>(null);
    const [isEndDateModalOpen, setEndDateModalOpen] = useState<number | string | null>(null);
    const [isEditInfoModalOpen, setEditInfoModalOpen] = useState(false);
    const [isCreateAlertModalOpen, setCreateAlertModalOpen] = useState(false);
    const [scaleView, setScaleView] = useState<'list' | 'comfort-b' | 'delirium' | 'delirium-pediatrico' | 'glasgow' | 'crs-r' | 'flacc' | 'braden' | 'braden-qd' | 'braden-risco-lesao' | 'vni-cnaf' | 'fss'>('list');

    const { showNotification } = useContext(NotificationContext)!;

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
        if (window.confirm("Tem certeza que deseja arquivar este dispositivo?")) {
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
        const parts = startDate.split('-').map(Number);
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
                    <span className="font-medium">Diagnóstico: <span className="font-normal">{patient.ctd}</span></span>
                </div>
            </div>

            <Link to={`/patient/${patient.id}/history`} className="w-full block text-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-lg transition text-md">
                <div className="flex items-center justify-center gap-2">
                    <BarChartIcon className="w-5 h-5" />
                    Ver Histórico Completo
                </div>
            </Link>

            {/* ... Tabs and Content ... */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm">
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
                                                    <CpuIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{device.name} - {device.location}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(device.startDate)}</p>
                                                        {device.removalDate ? (
                                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Retirada: {formatDateToBRL(device.removalDate)}</p>
                                                        ) : (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(device.startDate)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                    {!device.removalDate ? (
                                                        <button onClick={() => setRemovalModalOpen(device.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Retirada</button>
                                                    ) : (
                                                        <button onClick={() => handleDeleteDevice(patient.id, device.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Arquivar dispositivo">
                                                            <CloseIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => setEditingDevice(device)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar dispositivo">
                                                        <PencilIcon className="w-4 h-4" />
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
                                                    <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{exam.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(exam.date)}</p>
                                                        {exam.observation && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {exam.observation}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                    <button onClick={() => setEditingExam(exam)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar exame">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteExam(patient.id, exam.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Arquivar exame">
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
                                                    <PillIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 break-words">{medication.name} - {medication.dosage}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(medication.startDate)}</p>
                                                        {medication.endDate ? (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Fim: {formatDateToBRL(medication.endDate)}</p>
                                                        ) : (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(medication.startDate)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                    {!medication.endDate && <button onClick={() => setEndDateModalOpen(medication.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Fim</button>}
                                                    <button onClick={() => setEditingMedication(medication)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar medicação">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteMedication(patient.id, medication.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Excluir medicação">
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
                                                    <ScalpelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{procedure.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(procedure.date)} - Dr(a): {procedure.surgeon}</p>
                                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">Dia Pós-Operatório: +{calculateDays(procedure.date)} dias</p>
                                                        {procedure.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {procedure.notes}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                    <button onClick={() => setEditingSurgicalProcedure(procedure)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar cirurgia">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProcedure(patient.id, procedure.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Arquivar cirurgia">
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
                                                    <BeakerIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{culture.site}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Microorganismo: {culture.microorganism}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(culture.collectionDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                    <button onClick={() => setEditingCulture(culture)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition" aria-label="Editar cultura">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCulture(patient.id, culture.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition" aria-label="Arquivar cultura">
                                                        <CloseIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setAddCultureModalOpen(true)} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Cultura</button>
                                </>
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
                                <div onClick={() => setScaleView('delirium-pediatrico')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Delirium Pediátrico</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
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
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Braden (Adulto)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('braden-qd')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Braden QD (Ampliada)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('braden-risco-lesao')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Risco de Lesão por Pressão</p><p className="text-xs text-slate-500 dark:text-slate-400">Braden • Braden Q • Braden Q Ampliada</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('vni-cnaf')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><LungsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala VNI/CNAF Pediatria</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div onClick={() => setScaleView('fss')} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <div className="flex items-center gap-3"><DumbbellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Status Funcional (FSS)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </div>
                            </div>
                        )}
                        {scaleView === 'comfort-b' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><ComfortBScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'delirium' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><DeliriumScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'delirium-pediatrico' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><DeliriumPediatricoScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'glasgow' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><GlasgowScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'crs-r' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><CRSRScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'flacc' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><FLACCScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'braden' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><BradenScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'braden-qd' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><BradenQDScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'braden-risco-lesao' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><BradenRiscoLesaoScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'vni-cnaf' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><VniCnafScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                        {scaleView === 'fss' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><FSSScale onSaveScore={handleSaveScaleScore} /></div></div>)}
                    </div>
                )}
            </div>

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
                className="w-full mt-3 block text-center bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-lg transition text-lg flex items-center justify-center gap-2"
            >
                <WarningIcon className="w-6 h-6" />
                Criar Novo Alerta
            </button>

            {isAddDeviceModalOpen && <AddDeviceModal patientId={patient.id} onClose={() => setAddDeviceModalOpen(false)} />}
            {editingDevice && <EditDeviceModal device={editingDevice} patientId={patient.id} onClose={() => setEditingDevice(null)} />}
            {isAddExamModalOpen && <AddExamModal patientId={patient.id} onClose={() => setAddExamModalOpen(false)} />}
            {editingExam && <EditExamModal exam={editingExam} patientId={patient.id} onClose={() => setEditingExam(null)} />}
            {isAddMedicationModalOpen && <AddMedicationModal patientId={patient.id} onClose={() => setAddMedicationModalOpen(false)} />}
            {editingMedication && <EditMedicationModal medication={editingMedication} patientId={patient.id} onClose={() => setEditingMedication(null)} />}
            {isAddSurgicalModalOpen && <AddSurgicalProcedureModal patientId={patient.id} onClose={() => setAddSurgicalModalOpen(false)} />}
            {editingSurgicalProcedure && <EditSurgicalProcedureModal procedure={editingSurgicalProcedure} patientId={patient.id} onClose={() => setEditingSurgicalProcedure(null)} />}
            {isAddCultureModalOpen && <AddCultureModal patientId={patient.id} onClose={() => setAddCultureModalOpen(false)} />}
            {editingCulture && <EditCultureModal culture={editingCulture} patientId={patient.id} onClose={() => setEditingCulture(null)} />}
            {isRemovalModalOpen && <AddRemovalDateModal deviceId={isRemovalModalOpen} patientId={patient.id} onClose={() => setRemovalModalOpen(null)} />}
            {isEndDateModalOpen && <AddEndDateModal medicationId={isEndDateModalOpen} patientId={patient.id} onClose={() => setEndDateModalOpen(null)} />}
            {isEditInfoModalOpen && <EditPatientInfoModal patientId={patient.id} currentMotherName={patient.motherName} currentDiagnosis={patient.ctd} onClose={() => setEditInfoModalOpen(false)} />}
            {isCreateAlertModalOpen && <CreateAlertModal patientId={patient.id} onClose={() => setCreateAlertModalOpen(false)} />}
        </div>
    );
};

// ... (Modals AddDeviceModal, EditDeviceModal, AddExamModal, EditExamModal, AddMedicationModal, EditMedicationModal, AddSurgicalProcedureModal, EditSurgicalProcedureModal, AddRemovalDateModal, AddEndDateModal - No major logic changes needed, just standard)

// ... [Include all Modal components here as they were in the original file, no changes needed for this task] ...
const AddDeviceModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addDeviceToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [removalDate, setRemovalDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !location || !startDate) return;
        addDeviceToPatient(patientId, { name: type, location, startDate, removalDate: removalDate || undefined });
        showNotification({ message: 'Dispositivo cadastrado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Dispositivo</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Select...</option>
                            {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Local</label>
                        <select value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Select...</option>
                            {DEVICE_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia da inserção</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Remoção (Opcional)</label>
                        <input type="date" value={removalDate} onChange={e => setRemovalDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

const EditDeviceModal: React.FC<{ device: Device; patientId: number | string; onClose: () => void; }> = ({ device, patientId, onClose }) => {
    const { updateDeviceInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [type, setType] = useState(device.name);
    const [location, setLocation] = useState(device.location);
    const [startDate, setStartDate] = useState(device.startDate);
    const [removalDate, setRemovalDate] = useState(device.removalDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !location || !startDate) return;
        updateDeviceInPatient(patientId, { ...device, name: type, location, startDate, removalDate: removalDate || undefined });
        showNotification({ message: 'Dispositivo atualizado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Dispositivo</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Select...</option>
                            {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Local</label>
                        <select value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200">
                            <option value="" disabled>Select...</option>
                            {DEVICE_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dia da inserção</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Remoção (Opcional)</label>
                        <input type="date" value={removalDate} onChange={e => setRemovalDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};

const AddExamModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addExamToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [observation, setObservation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;
        addExamToPatient(patientId, { name, date, result: 'Pendente', observation });
        showNotification({ message: 'Exame cadastrado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Exame</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Exame</label>
                        <input type="text" placeholder="Ex: Hemograma" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação (Opcional)</label>
                        <textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Digite aqui..." className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" rows={3}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

const EditExamModal: React.FC<{ exam: Exam; patientId: number | string; onClose: () => void; }> = ({ exam, patientId, onClose }) => {
    const { updateExamInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [name, setName] = useState(exam.name);
    const [date, setDate] = useState(exam.date);
    const [observation, setObservation] = useState(exam.observation || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date) return;
        updateExamInPatient(patientId, { ...exam, name, date, observation });
        showNotification({ message: 'Exame atualizado com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Exame</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Exame</label>
                        <input type="text" placeholder="Ex: Hemograma" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação (Opcional)</label>
                        <textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Digite aqui..." className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" rows={3}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};

const AddMedicationModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addMedicationToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [name, setName] = useState('');
    const [dosageValue, setDosageValue] = useState('');
    const [dosageUnit, setDosageUnit] = useState(MEDICATION_DOSAGE_UNITS[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !dosageValue || !dosageUnit || !startDate) return;
        const dosage = `${dosageValue} ${dosageUnit}`;
        addMedicationToPatient(patientId, { name, dosage, startDate });
        showNotification({ message: 'Medicação cadastrada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Medicação</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medicamento</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dosagem</label>
                        <div className="flex items-center mt-1 gap-2">
                            <input
                                type="text"
                                value={dosageValue}
                                onChange={e => setDosageValue(e.target.value)}
                                placeholder="Valor"
                                className="block w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            />
                            <select
                                value={dosageUnit}
                                onChange={e => setDosageUnit(e.target.value)}
                                className="block w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            >
                                {MEDICATION_DOSAGE_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

const EditMedicationModal: React.FC<{ medication: Medication; patientId: number | string; onClose: () => void; }> = ({ medication, patientId, onClose }) => {
    const { updateMedicationInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [name, setName] = useState(medication.name);
    const [startDate, setStartDate] = useState(medication.startDate);

    const [initialValue, initialUnit] = useMemo(() => {
        const dosageString = medication.dosage || '';
        const foundUnit = MEDICATION_DOSAGE_UNITS.find(u => dosageString.endsWith(u));
        if (foundUnit) {
            const value = dosageString.substring(0, dosageString.length - foundUnit.length).trim();
            return [value, foundUnit];
        }
        return [dosageString, '']; // Fallback for old format
    }, [medication.dosage]);

    const [dosageValue, setDosageValue] = useState(initialValue);
    const [dosageUnit, setDosageUnit] = useState(initialUnit);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !dosageValue || !dosageUnit || !startDate) return;
        const dosage = `${dosageValue} ${dosageUnit}`;
        updateMedicationInPatient(patientId, { ...medication, name, dosage, startDate });
        showNotification({ message: 'Medicação atualizada com sucesso!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Medicação</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medicamento</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dosagem</label>
                        <div className="flex items-center mt-1 gap-2">
                            <input
                                type="text"
                                value={dosageValue}
                                onChange={e => setDosageValue(e.target.value)}
                                placeholder="Valor"
                                className="block w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            />
                            <select
                                value={dosageUnit}
                                onChange={e => setDosageUnit(e.target.value)}
                                className="block w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200"
                            >
                                <option value="" disabled>Selecione unidade...</option>
                                {MEDICATION_DOSAGE_UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};

const AddSurgicalProcedureModal: React.FC<{ patientId: number | string; onClose: () => void; }> = ({ patientId, onClose }) => {
    const { addSurgicalProcedureToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [surgeon, setSurgeon] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date || !surgeon) return;
        addSurgicalProcedureToPatient(patientId, { name, date, surgeon, notes });
        showNotification({ message: 'Procedimento cirúrgico cadastrado!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Cadastrar Cirurgia</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedimento</label>
                        <input type="text" placeholder="Ex: Apendicectomia" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cirurgião</label>
                        <input type="text" placeholder="Dr(a). Sobrenome" value={surgeon} onChange={e => setSurgeon(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação (Opcional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Digite aqui..." className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" rows={3}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

const EditSurgicalProcedureModal: React.FC<{ procedure: SurgicalProcedure; patientId: number | string; onClose: () => void; }> = ({ procedure, patientId, onClose }) => {
    const { updateSurgicalProcedureInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const [name, setName] = useState(procedure.name);
    const [date, setDate] = useState(procedure.date);
    const [surgeon, setSurgeon] = useState(procedure.surgeon);
    const [notes, setNotes] = useState(procedure.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date || !surgeon) return;
        updateSurgicalProcedureInPatient(patientId, { ...procedure, name, date, surgeon, notes });
        showNotification({ message: 'Procedimento cirúrgico atualizado!', type: 'success' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Editar Cirurgia</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Procedimento</label>
                        <input type="text" placeholder="Ex: Apendicectomia" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cirurgião</label>
                        <input type="text" placeholder="Dr(a). Sobrenome" value={surgeon} onChange={e => setSurgeon(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observação (Opcional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Digite aqui..." className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200" rows={3}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};

const AddRemovalDateModal: React.FC<{ deviceId: number | string, patientId: number | string, onClose: () => void }> = ({ deviceId, patientId, onClose }) => {
    const { addRemovalDateToDevice } = useContext(PatientsContext)!;
    const [removalDate, setRemovalDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addRemovalDateToDevice(patientId, deviceId, removalDate);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Registrar Data de Retirada</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data da Retirada</label>
                        <input type="date" value={removalDate} onChange={e => setRemovalDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const AddEndDateModal: React.FC<{ medicationId: number | string, patientId: number | string, onClose: () => void }> = ({ medicationId, patientId, onClose }) => {
    const { addEndDateToMedication } = useContext(PatientsContext)!;
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addEndDateToMedication(patientId, medicationId, endDate);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-sm m-4">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Registrar Data de Fim</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Fim</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
const AlertModal: React.FC<{ question: Question, onClose: () => void, patientId: string }> = ({ question, onClose, patientId }) => {
    const { addTask } = useContext(TasksContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { patients, categories } = useContext(PatientsContext)!;

    const patient = patients.find(p => p.id.toString() === patientId);
    const category = categories.find(c => c.id === question.categoryId);

    const [formData, setFormData] = useState<Record<string, { selected: boolean, value: string }>>({});
    const [responsible, setResponsible] = useState('');
    const [time, setTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Lógica do Checkbox
    const handleCheckbox = (id: string, checked: boolean) => {
        setFormData(prev => {
            const copy = { ...prev };
            if (checked) copy[id] = { selected: true, value: '' };
            else delete copy[id];
            return copy;
        });
    };

    // Lógica do Texto dentro do Checkbox
    const handleInput = (id: string, text: string) => {
        setFormData(prev => ({ ...prev, [id]: { ...prev[id], value: text } }));
    };

    const handleSave = async () => {
        if (!responsible || !time) return alert('Por favor, selecione Responsável e Hora!');

        setIsLoading(true);

        // Montar o texto descritivo
        let descriptionText = `ALERTA: ${question.text}\n`;
        // descriptionText += `HORÁRIO: ${time}\n`; // Now stored in timeLabel
        // descriptionText += `RESPONSÁVEL: ${responsible}\n--------------------------\n`; // Stored in separate fields

        let hasData = false;
        question.alertOptions?.forEach(opt => {
            const data = formData[opt.id];
            if (data && data.selected) {
                const detail = opt.hasInput && data.value ? `: ${data.value}` : '';
                descriptionText += `- ${opt.label}${detail}\n`;
                hasData = true;
            }
        });

        if (!hasData) {
            setIsLoading(false);
            return alert('Selecione pelo menos uma opção.');
        }

        // Calculate deadline
        const deadlineHours = parseInt(time.split(' ')[0]);
        const deadlineDate = new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString();

        addTask({
            patientId: patientId,
            categoryId: question.categoryId,
            description: descriptionText,
            responsible: responsible,
            deadline: deadlineDate,
            patientName: patient?.name,
            categoryName: category?.name,
            timeLabel: time,
            options: formData
        });

        showNotification({ message: 'Alerta criado com sucesso!', type: 'success' });

        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-800 dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl border border-blue-500/30 flex flex-col max-h-[95vh]">

                {/* Cabeçalho */}
                <div className="bg-blue-600 p-4 rounded-t-xl flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <AlertIcon className="text-white w-6 h-6" />
                        <h2 className="text-white font-bold text-lg">Alerta / Intervenção</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white bg-blue-700/50 p-1.5 rounded-full hover:bg-blue-700 transition">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo com Scroll */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                    <div className="border-b border-gray-700 pb-2">
                        <h3 className="text-blue-300 font-bold text-sm uppercase tracking-wide">
                            {question.text}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">Selecione as intercorrências:</p>
                    </div>

                    <div className="space-y-3">
                        {question.alertOptions?.map(opt => {
                            const isChecked = !!formData[opt.id];
                            return (
                                <div key={opt.id} className="flex flex-col gap-2">
                                    <div
                                        onClick={() => handleCheckbox(opt.id, !isChecked)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${isChecked ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-900 border-gray-700 hover:border-gray-500'}`}
                                    >
                                        <div className={isChecked ? 'text-blue-400' : 'text-gray-500'}>
                                            {isChecked ? <CheckSquareIcon className="w-5 h-5" /> : <SquareIcon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-sm ${isChecked ? 'text-white font-medium' : 'text-gray-300'}`}>{opt.label}</span>
                                    </div>
                                    {isChecked && opt.hasInput && (
                                        <div className="ml-9 animate-in slide-in-from-top-2 duration-200">
                                            <input
                                                type="text"
                                                placeholder={opt.inputPlaceholder}
                                                value={formData[opt.id]?.value || ''}
                                                onChange={(e) => handleInput(opt.id, e.target.value)}
                                                className="w-full bg-slate-900 border border-blue-500/50 rounded p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t border-gray-700 space-y-4 bg-slate-800 dark:bg-slate-900">
                        {/* Responsável */}
                        <div>
                            <label className="text-white font-semibold text-sm mb-1 block">Responsável</label>
                            <div className="relative">
                                <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className="w-full bg-slate-700 border border-gray-600 text-white text-sm rounded-lg p-3 appearance-none focus:outline-none">
                                    <option value="">Selecione...</option>
                                    {RESPONSIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>
                        {/* Hora */}
                        <div>
                            <label className="text-white font-semibold text-sm mb-1 block">Selecione a hora</label>
                            <div className="relative">
                                <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-700 border border-gray-600 text-white text-sm rounded-lg p-3 appearance-none focus:outline-none">
                                    <option value="">Selecione...</option>
                                    {ALERT_DEADLINES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400 pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold shadow-lg transition">
                            {isLoading ? 'Salvando...' : <><SaveIcon className="w-5 h-5" /> Criar Alerta</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        <div className="relative pb-24">
            {/* Main Card */}
            <div className="w-full max-w-lg mx-auto bg-blue-600 dark:bg-blue-700 rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-[550px] animate-in slide-in-from-right-4 duration-300">

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col items-center text-center space-y-6">
                    <span className="bg-blue-800/50 text-blue-100 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                        {category.name} • {currentQuestionIndex + 1}/{categoryQuestions.length}
                    </span>

                    <h1 className="text-white text-xl md:text-2xl font-extrabold leading-tight min-h-[80px] flex items-center justify-center">
                        {currentQuestion.text}
                    </h1>

                    <div className="w-full space-y-3 mt-4">
                        {(['sim', 'não', 'nao_se_aplica'] as Answer[]).map(answer => (
                            <button
                                key={answer}
                                onClick={() => handleAnswer(currentQuestion.id, answer)}
                                className={`w-full py-3.5 rounded-lg font-bold transition shadow-sm border flex items-center justify-center gap-2
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
                        className="mt-6 flex items-center gap-2 text-red-100 hover:text-white bg-red-900/40 hover:bg-red-600/80 px-5 py-2.5 rounded-full transition text-xs font-bold border border-red-400/30 tracking-wide"
                    >
                        <AlertIcon className="w-4 h-4" />
                        GERAR ALERTA / INTERVENÇÃO
                    </button>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-blue-500/30 flex justify-between items-center bg-blue-700/20">
                    <button
                        onClick={handlePrevious} disabled={currentQuestionIndex === 0}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed text-blue-300' : 'bg-blue-800/50 hover:bg-blue-800 text-blue-100 hover:text-white'}`}
                    >
                        <ChevronLeftIcon className="w-4 h-4" /> Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition shadow-lg flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-700`}
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
            const { error } = await supabase
                .from(table)
                .update({
                    justificativa: justification,
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
                                    <p className="font-bold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{alert.alertaclinico}</p>

                                    {/* Responsável */}
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Responsável: {alert.responsavel}
                                    </p>

                                    {/* Prazo */}
                                    {prazoFormatado && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            Prazo: {prazoFormatado}
                                        </p>
                                    )}

                                    {/* Justificativa */}
                                    {alert.justificativa && (
                                        <p className="text-xs italic text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                            <strong>Justificativa:</strong> {alert.justificativa}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
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

const JustificationModal: React.FC<{ alert: any, onClose: () => void, onSave: (alert: any, justification: string) => void }> = ({ alert, onClose, onSave }) => {
    const [justification, setJustification] = useState(alert.justificativa || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Justificar Atraso</h2>
                    <button onClick={onClose}><CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Alerta: <strong>{alert.alertaclinico}</strong>
                </p>
                <textarea
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    placeholder="Digite a justificativa para o atraso..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200 min-h-[100px]"
                />
                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm sm:text-base">Cancelar</button>
                    <button onClick={() => onSave(alert, justification)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base">Salvar</button>
                </div>
            </div>
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

    const handleSave = () => {
        updateUser({ name, title, avatarUrl: avatarPreview, sector });
        showNotification({ message: 'Perfil salvo com sucesso!', type: 'success' });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 1. Preview local imediato para feedback visual
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // 2. Upload para o Supabase Storage (bucket 'roundfoto')
            try {
                const fileExt = file.name.split('.').pop();
                // Cria um nome de arquivo único: avatars/timestamp-random.ext
                const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('roundfoto')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw uploadError;
                }

                // 3. Obter a URL pública
                const { data } = supabase.storage
                    .from('roundfoto')
                    .getPublicUrl(fileName);

                if (data.publicUrl) {
                    // Append timestamp to avoid caching issues if user reuploads quickly (though filename is unique)
                    setAvatarPreview(data.publicUrl);
                    showNotification({ message: 'Foto enviada com sucesso!', type: 'success' });
                }
            } catch (error: any) {
                console.error("Erro no upload:", error);
                showNotification({ message: 'Erro ao enviar foto. Verifique se o bucket "roundfoto" é PÚBLICO no painel do Supabase.', type: 'error' });
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
                            <img src={avatarPreview} alt="User avatar" className="w-24 h-24 rounded-full object-cover bg-slate-200" />
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

    const fetchPatients = async () => {
        if (!supabase) return;

        const today = getTodayDateString();

        // Fetch all related data tables in parallel
        const [
            patientsRes,
            devicesRes,
            examsRes,
            medsRes,
            surgsRes,
            scalesRes,
            questionsRes,
            categoriesRes,
            answersRes,
            culturesRes
        ] = await Promise.all([
            supabase.from('patients').select('*'),
            supabase.from('dispositivos_pacientes').select('*'),
            supabase.from('exames_pacientes').select('*'),
            supabase.from('medicacoes_pacientes').select('*'),
            supabase.from('procedimentos_pacientes').select('*'),
            supabase.from('scale_scores').select('*'),
            supabase.from('perguntas').select('*, pergunta_opcoes(*)').order('ordem', { ascending: true }),
            supabase.from('categorias').select('*').order('ordem', { ascending: true }),
            supabase.from('checklist_answers').select('*').eq('date', today),
            supabase.from('culturas_pacientes').select('*')
        ]);

        if (patientsRes.error) {
            console.error('Error fetching patients:', patientsRes.error);
            return;
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
        if (questionsRes.data && questionsRes.data.length > 0) {
            const mappedQuestions = questionsRes.data.map((q: any) => ({
                id: q.id,
                text: q.texto,
                categoryId: q.categoria_id,
                alertOptions: q.pergunta_opcoes ? q.pergunta_opcoes.map((opt: any) => ({
                    id: opt.codigo,
                    label: opt.label,
                    hasInput: opt.has_input,
                    inputPlaceholder: opt.input_placeholder
                })).sort((a: any, b: any) => a.ordem - b.ordem) : []
            }));
            setQuestions(mappedQuestions);
        } else {
            // Fallback to STATIC_QUESTIONS if database questions table is empty or fetch fails
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

        const devicesMap = (devicesRes.data || []).reduce((acc: any, d: any) => {
            if (!acc[d.paciente_id]) acc[d.paciente_id] = [];
            acc[d.paciente_id].push({
                id: d.id,
                name: d.tipo_dispositivo,
                location: d.localizacao,
                startDate: d.data_insercao,
                removalDate: d.data_remocao,
                isArchived: d.is_archived,
            });
            return acc;
        }, {});

        const examsMap = (examsRes.data || []).reduce((acc: any, e: any) => {
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

        const medsMap = (medsRes.data || []).reduce((acc: any, m: any) => {
            if (!acc[m.paciente_id]) acc[m.paciente_id] = [];
            acc[m.paciente_id].push({
                id: m.id,
                name: m.nome_medicacao,
                dosage: `${m.dosagem_valor} ${m.unidade_medida}`,
                startDate: m.data_inicio,
                isArchived: m.is_archived
            });
            return acc;
        }, {});

        const surgsMap = (surgsRes.data || []).reduce((acc: any, s: any) => {
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

        const scalesMap = (scalesRes.data || []).reduce((acc: any, s: any) => {
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


        const culturesMap = (culturesRes.data || []).reduce((acc: any, c: any) => {
            if (!acc[c.paciente_id]) acc[c.paciente_id] = [];
            acc[c.paciente_id].push({
                id: c.id,
                site: c.local,
                microorganism: c.microorganismo,
                collectionDate: c.data_coleta,
                isArchived: c.is_archived
            });
            return acc;
        }, {});

        const mappedPatients: Patient[] = patientsRes.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            bedNumber: p.bed_number,
            motherName: p.mother_name || '-',
            dob: p.dob,
            ctd: p.diagnosis || p.ctd || 'Estável',
            devices: devicesMap[p.id] || [],
            exams: examsMap[p.id] || [],
            medications: medsMap[p.id] || [],
            surgicalProcedures: surgsMap[p.id] || [],
            scaleScores: scalesMap[p.id] || [],
            cultures: culturesMap[p.id] || []
        }));

        setPatients(mappedPatients);
    };

    useEffect(() => {
        fetchPatients();
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

    const addDeviceToPatient = async (patientId: number | string, device: Omit<Device, 'id'>) => {
        const { error } = await supabase.from('dispositivos_pacientes').insert([{
            paciente_id: patientId,
            tipo_dispositivo: device.name,
            localizacao: device.location,
            data_insercao: device.startDate
        }]);
        if (!error) fetchPatients();
    };

    const addExamToPatient = async (patientId: number | string, exam: Omit<Exam, 'id'>) => {
        const { error } = await supabase.from('exames_pacientes').insert([{
            paciente_id: patientId,
            nome_exame: exam.name,
            data_exame: exam.date,
            observacao: exam.observation
        }]);
        if (!error) fetchPatients();
    };

    const addMedicationToPatient = async (patientId: number | string, medication: Omit<Medication, 'id'>) => {
        const parts = medication.dosage.split(' ');
        const valor = parts[0] || '';
        const unidade = parts.slice(1).join(' ') || '';

        const { error } = await supabase.from('medicacoes_pacientes').insert([{
            paciente_id: patientId,
            nome_medicacao: medication.name,
            dosagem_valor: valor,
            unidade_medida: unidade,
            data_inicio: medication.startDate
        }]);
        if (!error) fetchPatients();
    };

    const addSurgicalProcedureToPatient = async (patientId: number | string, procedure: Omit<SurgicalProcedure, 'id'>) => {
        const { error } = await supabase.from('procedimentos_pacientes').insert([{
            paciente_id: patientId,
            nome_procedimento: procedure.name,
            data_procedimento: procedure.date,
            nome_cirurgiao: procedure.surgeon,
            notas: procedure.notes
        }]);
        if (!error) fetchPatients();
    };

    const addRemovalDateToDevice = async (patientId: number | string, deviceId: number | string, removalDate: string) => {
        const { error } = await supabase.from('dispositivos_pacientes')
            .update({ data_remocao: removalDate })
            .eq('id', deviceId);
        if (!error) fetchPatients();
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
                data_insercao: deviceData.startDate
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
                data_inicio: medicationData.startDate
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

    const addCultureToPatient = async (patientId: number | string, culture: Omit<Culture, 'id'>) => {
        const { error } = await supabase.from('culturas_pacientes').insert([{
            paciente_id: patientId,
            local: culture.site,
            microorganismo: culture.microorganism,
            data_coleta: culture.collectionDate
        }]);

        if (error) console.warn("Culture table error", error);
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
                data_coleta: cultureData.collectionDate
            })
            .eq('id', cultureData.id);
        if (!error) fetchPatients();
    };

    const updatePatientDetails = async (patientId: number | string, data: { motherName?: string; ctd?: string }) => {
        const updateData: any = {};
        if (data.motherName !== undefined) updateData.mother_name = data.motherName;
        if (data.ctd !== undefined) updateData.diagnosis = data.ctd;

        const { error } = await supabase.from('patients')
            .update(updateData)
            .eq('id', patientId);

        if (!error) fetchPatients();
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

    const updateTaskJustification = async (taskId: number | string, justification: string) => {
        // Only updating standard tasks for now as ID types might differ (int vs uuid)
        // Ideally check ID type or table source
        const { error } = await supabase.from('tasks')
            .update({ justification, status: 'fora_do_prazo' })
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
            options: taskData.options
        }]);
        if (!error) fetchTasks();
    };

    const addPatientAlert = async (data: { patientId: string | number; description: string; responsible: string; timeLabel: string }) => {
        const { error } = await supabase.from('alertas_paciente').insert([{
            patient_id: data.patientId,
            alerta_descricao: data.description,
            responsavel: data.responsible,
            hora_selecionada: data.timeLabel,
            status: 'Pendente'
        }]);

        if (error) {
            console.error("Error creating patient alert:", error);
        } else {
            fetchTasks();
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

    useEffect(() => {
        const loadUser = async () => {
            try {
                // 1. Check for Supabase Auth Session
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (data) {
                        // Update state from DB
                        const dbUser = {
                            id: data.id, // Store user ID
                            name: data.name || 'Usuário',
                            title: data.role || '', // Mapping DB 'role' to App 'title'
                            avatarUrl: data.foto || `https://i.pravatar.cc/150?u=${data.email}`, // Mapping DB 'foto' to App 'avatarUrl'
                            sector: data.sector || '', // Mapping DB 'sector'
                            access_level: (data.access_level || 'geral') as 'adm' | 'geral', // Mapping DB 'access_level'
                        };
                        setUser(dbUser);
                        // ✅ SEGURANÇA: Não armazenar dados sensíveis em localStorage
                        // Supabase gerencia a sessão em cookies HttpOnly automaticamente
                    } else if (error) {
                        console.error('Erro ao carregar usuário:', error);
                        // Clear localStorage on error to prevent stale data
                        localStorage.removeItem('round_juju_user');
                    }
                } else {
                    // No session available - user is logged out
                    // Don't load stale user data from localStorage
                    console.log('Nenhuma sessão ativa');
                }
            } catch (err) {
                console.error('Erro ao carregar usuário:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
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
        <UserContext.Provider value={{ user, updateUser, isLoading }}>
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
                                        <Route path="history" element={<AlertsHistoryScreen useHeader={useHeader} />} />
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
