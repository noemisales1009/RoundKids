import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/AppLayout';
import { NetworkBanner } from './components/NetworkBanner';
import { NetworkProvider } from './contexts/NetworkContext';
import { useHeader } from './hooks/useHeader';

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

// --- MAIN APP ---
const App: React.FC = () => {
    return (
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
                                            <Route path="archived" element={<ErrorBoundary><Suspense fallback={<LoadingSpinner />}><ArchivedPatientsScreen /></Suspense></ErrorBoundary>} />
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
        </NetworkProvider>
    );
}

export default App;
