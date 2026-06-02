import React, { useEffect, lazy, Suspense, useState, useRef } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminRoute } from './components/AdminRoute';
import { AppLayout } from './components/AppLayout';
import { NetworkBanner } from './components/NetworkBanner';
import { NetworkProvider } from './contexts/NetworkContext';
import { useHeader } from './hooks/useHeader';
import { PreviewContext } from './contexts';

// Providers
import {
    NotificationProvider,
    ThemeProvider,
    UserProvider,
    PatientsProvider,
    TasksProvider,
} from './providers';

// Screens (direct imports for critical screens)
import {
    LoginScreen,
    SettingsScreen,
    DashboardScreen,
    PatientListScreen,
    PatientHistoryScreen,
    PatientDetailScreen,
    RoundCategoryListScreen,
    ChecklistScreen,
    CreateAlertScreen,
    TaskStatusScreen,
    EvolucaoDiariaScreen,
} from './screens';

// Lazy-loaded screens
const AlertsHistoryScreen = lazy(() => import('./AlertsHistoryScreen').then(m => ({ default: m.AlertsHistoryScreen })));
const ArchivedPatientsScreen = lazy(() => import('./ArchivedPatientsScreen').then(m => ({ default: m.ArchivedPatientsScreen })));

// --- LOADING COMPONENT ---
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

// --- CHECKLIST REDIRECTOR ---
const ChecklistRedirector: React.FC = () => {
    const { patientId, categoryId } = useParams();
    useEffect(() => {
        if (patientId && categoryId) {
            window.location.hash = `/patient/${patientId}/round/category/${categoryId}/question/0`;
        }
    }, [patientId, categoryId]);
    return null;
};

// --- PREVIEW MODAL GLOBAL ---
const PreviewModal: React.FC = () => {
    const ctx = React.useContext(PreviewContext)!;
    const [copied, setCopied] = useState(false);

    if (!ctx.showPreview) return null;

    const { previewText, previewMinimized, setPreviewMinimized, setShowPreview, patientName, downloadWordRef, rebuildRef, setPreviewText } = ctx;

    const handleClose = () => { setShowPreview(false); setPreviewMinimized(false); };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(previewText);
        } catch {
            // fallback para contextos sem HTTPS
            const ta = document.createElement('textarea');
            ta.value = previewText;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (previewMinimized) {
        return (
            <div className="fixed bottom-0 right-4 z-50 w-72 bg-slate-800 rounded-t-xl shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-white truncate">Evolução — {patientName}</span>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                        <button onClick={() => setPreviewMinimized(false)} title="Restaurar" className="text-slate-300 hover:text-white transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button onClick={handleClose} title="Fechar" className="text-slate-300 hover:text-red-400 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: '90vh' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Visualizar Evolução</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPreviewMinimized(true)} title="Minimizar" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{previewText}</pre>
                </div>
                <div className="flex gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
                    {rebuildRef.current && (
                        <button
                            onClick={() => { const t = rebuildRef.current!(); setPreviewText(t); }}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                            Atualizar
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-semibold transition ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'}`}
                    >
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button
                        onClick={() => {
                            const blob = new Blob([previewText], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `evolucao_${patientName.replace(/\s+/g, '_')}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition"
                    >
                        Baixar TXT
                    </button>
                    {downloadWordRef.current && (
                        <button
                            onClick={() => { handleClose(); downloadWordRef.current?.(); }}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                        >
                            Baixar Word
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
const App: React.FC = () => {
    const [showPreview, setShowPreview] = useState(false);
    const [previewText, setPreviewText] = useState('');
    const [previewMinimized, setPreviewMinimized] = useState(false);
    const [patientName, setPatientName] = useState('');
    const downloadWordRef = useRef<(() => void) | null>(null);
    const rebuildRef = useRef<(() => string) | null>(null);

    return (
        <PreviewContext.Provider value={{ showPreview, setShowPreview, previewText, setPreviewText, previewMinimized, setPreviewMinimized, patientName, setPatientName, downloadWordRef, rebuildRef }}>
        <NetworkProvider>
            <HashRouter>
                <NotificationProvider>
                    <ThemeProvider>
                        <UserProvider>
                            <PatientsProvider>
                                <TasksProvider>
                                    <NetworkBanner />
                                    <ErrorBoundary>
                                    <Routes>
                                        <Route path="/" element={<LoginScreen />} />
                                        <Route path="/" element={<AppLayout />}>
                                            <Route path="dashboard" element={<ErrorBoundary><DashboardScreen /></ErrorBoundary>} />
                                            <Route path="patients" element={<ErrorBoundary><PatientListScreen /></ErrorBoundary>} />
                                            <Route path="patient/:patientId" element={<ErrorBoundary><PatientDetailScreen /></ErrorBoundary>} />
                                            <Route path="patient/:patientId/history" element={<ErrorBoundary><PatientHistoryScreen /></ErrorBoundary>} />
                                            <Route path="patient/:patientId/round/categories" element={<ErrorBoundary><RoundCategoryListScreen /></ErrorBoundary>} />
                                            <Route path="patient/:patientId/round/category/:categoryId" element={<ChecklistRedirector />} />
                                            <Route path="patient/:patientId/round/category/:categoryId/question/:questionIndex" element={<ErrorBoundary><ChecklistScreen /></ErrorBoundary>} />
                                            <Route path="patient/:patientId/round/category/:categoryId/question/:questionIndex/create-alert" element={<ErrorBoundary><CreateAlertScreen /></ErrorBoundary>} />
                                            <Route path="patient/:patientId/create-alert" element={<ErrorBoundary><CreateAlertScreen /></ErrorBoundary>} />
                                            <Route path="status/:status" element={<ErrorBoundary><TaskStatusScreen /></ErrorBoundary>} />
                                            <Route path="history" element={<ErrorBoundary><Suspense fallback={<LoadingSpinner />}><AlertsHistoryScreen useHeader={useHeader} /></Suspense></ErrorBoundary>} />
                                            <Route path="archived" element={<ErrorBoundary><AdminRoute><Suspense fallback={<LoadingSpinner />}><ArchivedPatientsScreen /></Suspense></AdminRoute></ErrorBoundary>} />
                                            <Route path="evolucao-diaria" element={<ErrorBoundary><EvolucaoDiariaScreen /></ErrorBoundary>} />
                                            <Route path="settings" element={<ErrorBoundary><SettingsScreen /></ErrorBoundary>} />
                                        </Route>
                                    </Routes>
                                    </ErrorBoundary>
                                </TasksProvider>
                            </PatientsProvider>
                        </UserProvider>
                    </ThemeProvider>
                </NotificationProvider>
            </HashRouter>
            <PreviewModal />
        </NetworkProvider>
        </PreviewContext.Provider>
    );
}

export default App;
