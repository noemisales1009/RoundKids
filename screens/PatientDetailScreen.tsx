
import React, { useState, useContext, useEffect, lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Device, Exam, Medication, SurgicalProcedure, Culture, Diet } from '../types';
import { formatDateToBRL } from '../constants';
import { BackArrowIcon, WarningIcon, PencilIcon, ClipboardIcon, FileTextIcon, CpuIcon, PillIcon, BarChartIcon, AppleIcon, DropletIcon, BrainIcon, ShieldIcon, BeakerIcon, LungsIcon, DumbbellIcon, CloseIcon, ScalpelIcon, ChevronRightIcon, CalculatorIcon } from '../components/icons';
import { PatientDetailSkeleton } from '../components/SkeletonLoader';
import { ArchiveModal } from '../components/modals/ArchiveModal';
import { SecondaryNavigation } from '../components/SecondaryNavigation';
import {
    PatientsContext,
    NotificationContext,
    UserContext,
} from '../contexts';
import { useHeader } from '../hooks/useHeader';

// --- LOADING COMPONENT ---
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

// Lazy load components pesados
const ComfortBScale = lazy(() => import('../components/ComfortBScale').then(m => ({ default: m.ComfortBScale })));
const DeliriumScale = lazy(() => import('../components/DeliriumScale').then(m => ({ default: m.DeliriumScale })));
const GlasgowScale = lazy(() => import('../components/GlasgowScale').then(m => ({ default: m.GlasgowScale })));
const CRSRScale = lazy(() => import('../components/CRSRScale').then(m => ({ default: m.CRSRScale })));
const FLACCScale = lazy(() => import('../components/FLACCScale').then(m => ({ default: m.FLACCScale })));
const BradenScale = lazy(() => import('../components/BradenScale').then(m => ({ default: m.BradenScale })));
const BradenQDScale = lazy(() => import('../components/BradenQDScale').then(m => ({ default: m.BradenQDScale })));
const VniCnafScale = lazy(() => import('../components/VniCnafScale').then(m => ({ default: m.VniCnafScale })));
const FSSScale = lazy(() => import('../components/FSSScale').then(m => ({ default: m.FSSScale })));
const BradenCalculator = lazy(() => import('../components/BradenCalculator').then(m => ({ default: m.BradenCalculator })));
const FLACCCalculator = lazy(() => import('../components/FLACCCalculator').then(m => ({ default: m.FLACCCalculator })));
const ComfortBCalculator = lazy(() => import('../components/ComfortBCalculator'));
const GlasgowCalculator = lazy(() => import('../components/GlasgowCalculator'));
const AbstinenciaCalculator = lazy(() => import('../components/AbstinenciaCalculator'));
const CAMICUCalculator = lazy(() => import('../components/CAMICUCalculator'));
const SOSPDCalculator = lazy(() => import('../components/SOSPDCalculator'));
const ConsciousnessCalculator = lazy(() => import('../components/ConsciousnessCalculator'));
const VNICNAFCalculator = lazy(() => import('../components/VNICNAFCalculator'));
const RespiratoryCalculator = lazy(() => import('../components/RespiratoryCalculator').then(m => ({ default: m.RespiratoryCalculator })));
const PhoenixSepsisCalculator = lazy(() => import('../components/PhoenixSepsisCalculator'));
const NPTCalculator = lazy(() => import('../npt/NPTWrapper'));
const DiagnosticsSection = lazy(() => import('../components/DiagnosticsSection').then(m => ({ default: m.DiagnosticsSection })));
const AlertasSection = lazy(() => import('../components/AlertasSection').then(m => ({ default: m.AlertasSection })));
const CompletedAlertsSection = lazy(() => import('../components/CompletedAlertsSection').then(m => ({ default: m.CompletedAlertsSection })));
const DiuresisCalc = lazy(() => import('../components/DiuresisCalc'));
const DiuresisHistory = lazy(() => import('../components/DiuresisHistory'));
const FluidBalanceCalc = lazy(() => import('../components/FluidBalanceCalc'));
const FluidBalanceHistory = lazy(() => import('../components/FluidBalanceHistory'));
const LatestCalculationsCard = lazy(() => import('../components/LatestCalculationsCard'));
const StatusComponent = lazy(() => import('../components/StatusComponent'));
const ComorbidadeComponent = lazy(() => import('../components/ComorbidadeComponent'));
const DestinoComponent = lazy(() => import('../components/DestinoComponent'));
const ClinicalSituation24hCard = lazy(() => import('../components/ClinicalSituation24hCard').then(m => ({ default: m.ClinicalSituation24hCard })));
const AportesCard = lazy(() => import('../components/AportesCard').then(m => ({ default: m.AportesCard })));
const PrecautionsCard = lazy(() => import('../components/PrecautionsCard').then(m => ({ default: m.PrecautionsCard })));

// Lazy load modals
const EditPatientInfoModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditPatientInfoModal })));
const CreateAlertModal = lazy(() => import('../components/modals').then(m => ({ default: m.CreateAlertModal })));
const AddCultureModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddCultureModal })));
const EditCultureModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditCultureModal })));
const AddDietModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddDietModal })));
const EditDietModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditDietModal })));
const AddDietRemovalDateModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddDietRemovalDateModal })));
const EditDietRemovalDateModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditDietRemovalDateModal })));
const AddDeviceModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddDeviceModal })));
const EditDeviceModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditDeviceModal })));
const AddRemovalDateModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddRemovalDateModal })));
const EditDeviceRemovalDateModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditDeviceRemovalDateModal })));
const AddExamModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddExamModal })));
const EditExamModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditExamModal })));
const AddMedicationModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddMedicationModal })));
const EditMedicationModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditMedicationModal })));
const AddEndDateModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddEndDateModal })));
const EditMedicationEndDateModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditMedicationEndDateModal })));
const AddSurgicalProcedureModal = lazy(() => import('../components/modals').then(m => ({ default: m.AddSurgicalProcedureModal })));
const EditSurgicalProcedureModal = lazy(() => import('../components/modals').then(m => ({ default: m.EditSurgicalProcedureModal })));


const PatientDetailScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients, addRemovalDateToDevice, deleteDeviceFromPatient, addEndDateToMedication, deleteMedicationFromPatient, deleteExamFromPatient, deleteSurgicalProcedureFromPatient, addScaleScoreToPatient, addCultureToPatient, deleteCultureFromPatient, addDietToPatient, updateDietInPatient, deleteDietFromPatient } = useContext(PatientsContext)!;
    const { user } = useContext(UserContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);

    useHeader(patient ? `Leito ${patient.bedNumber}` : 'Paciente não encontrado');

    const [mainTab, setMainTab] = useState<'data' | 'npt' | 'scales'>('data');
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
    const [scaleView, setScaleView] = useState<'list' | 'comfort-b' | 'delirium' | 'glasgow' | 'crs-r' | 'flacc' | 'braden' | 'braden-qd' | 'vni-cnaf' | 'fss' | 'abstinencia' | 'sos-pd' | 'consciousness' | 'respiratory' | 'phoenix-sepsis'>('list');
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

    // ✅ FIX: Detectar se dados detalhados ainda estão carregando
    // Quando todos os arrays estão vazios, provavelmente estamos no loading inicial
    const isDetailLoading = patient.devices.length === 0 && patient.medications.length === 0 &&
        patient.exams.length === 0 && patient.surgicalProcedures.length === 0 &&
        (patient.scaleScores?.length || 0) === 0 && patient.cultures.length === 0 && patient.diets.length === 0;

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

            {/* Status do Paciente */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 mb-4">
                <Suspense fallback={<LoadingSpinner />}>
                    <StatusComponent patientId={patient.id.toString()} />
                </Suspense>
            </div>

            {/* Comorbidade */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-4 mb-4">
                <Suspense fallback={<LoadingSpinner />}>
                    <ComorbidadeComponent patientId={patient.id.toString()} />
                </Suspense>
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
                            onClick={() => setMainTab('npt')}
                            className={`flex-1 py-4 px-1 text-center font-bold flex items-center justify-center gap-2 transition-colors duration-200 text-lg ${mainTab === 'npt'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <BeakerIcon className="w-6 h-6" />
                            Calculadora NPT
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
                                    {isDetailLoading && <PatientDetailSkeleton />}
                                    {!isDetailLoading && patient.devices.filter(d => !d.isArchived).length === 0 && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum dispositivo cadastrado.</p>
                                    )}
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
                                    {isDetailLoading && <PatientDetailSkeleton />}
                                    {!isDetailLoading && patient.exams.filter(e => !e.isArchived).length === 0 && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum exame cadastrado.</p>
                                    )}
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
                                    {isDetailLoading && <PatientDetailSkeleton />}
                                    {!isDetailLoading && patient.medications.filter(m => !m.isArchived).length === 0 && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma medicação cadastrada.</p>
                                    )}
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
                                    <button onClick={() => {
                                        setAddMedicationModalOpen(true);
                                    }} className="w-full mt-2 text-center bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold py-2.5 rounded-lg transition">Cadastrar Medicação</button>
                                </>
                            )}
                            {/* Surgical Tab Content */}
                            {dataTab === 'surgical' && (
                                <>
                                    {isDetailLoading && <PatientDetailSkeleton />}
                                    {!isDetailLoading && patient.surgicalProcedures.filter(p => !p.isArchived).length === 0 && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum procedimento cadastrado.</p>
                                    )}
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
                                    {isDetailLoading && <PatientDetailSkeleton />}
                                    {!isDetailLoading && patient.cultures.filter(c => !c.isArchived).length === 0 && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma cultura cadastrada.</p>
                                    )}
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
                                    {isDetailLoading && <PatientDetailSkeleton />}
                                    {!isDetailLoading && patient.diets.filter(d => !d.isArchived).length === 0 && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma dieta cadastrada.</p>
                                    )}
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

                {mainTab === 'npt' && patient && (
                    <div className="p-4">
                        <Suspense fallback={<LoadingSpinner />}>
                            <NPTCalculator
                                initialPatient={{
                                    id: patient.id.toString(),
                                    name: patient.name,
                                    dob: patient.dob,
                                    peso: patient.peso ?? null,
                                }}
                            />
                        </Suspense>
                    </div>
                )}

                {mainTab === 'scales' && (
                    <div className="p-4">
                        {scaleView === 'list' && (
                            <div className="space-y-3">
                                {/* List of Scales - (unchanged structure, just collapsed for brevity) */}
                                <button onClick={() => setScaleView('comfort-b')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala COMFORT-B">
                                    <div className="flex items-center gap-3"><BarChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala COMFORT-B</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('delirium')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala CAM-ICU Pediátrico">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala CAM-ICU Pediátrico</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('glasgow')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala de Coma de Glasgow">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Coma de Glasgow</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('crs-r')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala CRS-R">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Recuperação de Coma (CRS-R)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('flacc')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala FLACC">
                                    <div className="flex items-center gap-3"><PillIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Dor FLACC / FLACC-R</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('braden')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala de Braden">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Braden</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('braden-qd')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala de Braden QD">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Braden QD (Ampliada)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('vni-cnaf')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala VNI/CNAF">
                                    <div className="flex items-center gap-3"><LungsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala VNI/CNAF Pediatria</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('respiratory')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Cálculo Respiratório">
                                    <div className="flex items-center gap-3"><LungsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Cálculo Respiratório</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('fss')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala FSS">
                                    <div className="flex items-center gap-3"><DumbbellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Status Funcional (FSS)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('abstinencia')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala de Abstinência">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala de Abstinência (Finnegan & WAT-1)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('sos-pd')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala SOS-PD">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala SOS-PD (Delirium/Abstinência)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('consciousness')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Avaliação de Consciência">
                                    <div className="flex items-center gap-3"><BrainIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Avaliação Consciência (CRS-R/FOUR/JFK)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                                <button onClick={() => setScaleView('phoenix-sepsis')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Critérios de Sepse de Phoenix">
                                    <div className="flex items-center gap-3"><ShieldIcon className="w-5 h-5 text-red-600 dark:text-red-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Critérios de Sepse de Phoenix (2024)</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
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
                        {scaleView === 'respiratory' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><RespiratoryCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'phoenix-sepsis' && (<div className='bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><PhoenixSepsisCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
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
                <CompletedAlertsSection patientId={patient.id.toString()} />
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
                <ArchiveModal
                    title="Arquivar Dispositivo"
                    tableName="dispositivos_pacientes"
                    itemId={archiveDeviceModal.id}
                    itemDescription={`${archiveDeviceModal.name} - ${archiveDeviceModal.location}`}
                    itemDate={archiveDeviceModal.startDate}
                    itemDateLabel="Inserido em"
                    onClose={() => setArchiveDeviceModal(null)}
                    onSuccess={() => { setArchiveDeviceModal(null); window.location.reload(); }}
                />
            )}
            {isAddExamModalOpen && <AddExamModal patientId={patient.id} onClose={() => setAddExamModalOpen(false)} />}
            {editingExam && <EditExamModal exam={editingExam} patientId={patient.id} onClose={() => setEditingExam(null)} />}
            {archiveExamModal && (
                <ArchiveModal
                    title="Arquivar Exame"
                    tableName="exames_pacientes"
                    itemId={archiveExamModal.id}
                    itemDescription={archiveExamModal.name}
                    itemDate={archiveExamModal.date}
                    onClose={() => setArchiveExamModal(null)}
                    onSuccess={() => { setArchiveExamModal(null); window.location.reload(); }}
                />
            )}
            {isAddMedicationModalOpen && (
                <>
                    {console.log('🎯 Renderizando AddMedicationModal com patientId:', patient.id)}
                    <AddMedicationModal patientId={patient.id} onClose={() => {
                        setAddMedicationModalOpen(false);
                    }} />
                </>
            )}
            {editingMedication && <EditMedicationModal medication={editingMedication} patientId={patient.id} onClose={() => setEditingMedication(null)} />}
            {editingMedicationEndDate && <EditMedicationEndDateModal medication={editingMedicationEndDate} patientId={patient.id} onClose={() => setEditingMedicationEndDate(null)} />}
            {archiveMedicationModal && (
                <ArchiveModal
                    title="Arquivar Medicação"
                    tableName="medicacoes_pacientes"
                    itemId={archiveMedicationModal.id}
                    itemDescription={`${archiveMedicationModal.name} - ${archiveMedicationModal.dosage}`}
                    itemDate={archiveMedicationModal.startDate}
                    itemDateLabel="Início"
                    extraInfo={archiveMedicationModal.endDate ? `Fim: ${new Date(archiveMedicationModal.endDate).toLocaleDateString('pt-BR')}` : undefined}
                    onClose={() => setArchiveMedicationModal(null)}
                    onSuccess={() => { setArchiveMedicationModal(null); window.location.reload(); }}
                />
            )}
            {isAddSurgicalModalOpen && <AddSurgicalProcedureModal patientId={patient.id} onClose={() => setAddSurgicalModalOpen(false)} />}
            {editingSurgicalProcedure && <EditSurgicalProcedureModal procedure={editingSurgicalProcedure} patientId={patient.id} onClose={() => setEditingSurgicalProcedure(null)} />}
            {archiveSurgicalModal && (
                <ArchiveModal
                    title="Arquivar Procedimento"
                    tableName="procedimentos_pacientes"
                    itemId={archiveSurgicalModal.id}
                    itemDescription={archiveSurgicalModal.name}
                    itemDate={archiveSurgicalModal.date}
                    extraInfo={archiveSurgicalModal.surgeon ? `Cirurgião: ${archiveSurgicalModal.surgeon}` : undefined}
                    onClose={() => setArchiveSurgicalModal(null)}
                    onSuccess={() => { setArchiveSurgicalModal(null); window.location.reload(); }}
                />
            )}
            {isAddCultureModalOpen && <AddCultureModal patientId={patient.id} onClose={() => setAddCultureModalOpen(false)} />}
            {editingCulture && <EditCultureModal culture={editingCulture} patientId={patient.id} onClose={() => setEditingCulture(null)} />}
            {archiveCultureModal && (
                <ArchiveModal
                    title="Arquivar Cultura"
                    tableName="culturas_pacientes"
                    itemId={archiveCultureModal.id}
                    itemDescription={`${archiveCultureModal.site} - ${archiveCultureModal.microorganism}`}
                    itemDate={archiveCultureModal.collectionDate}
                    itemDateLabel="Data de coleta"
                    onClose={() => setArchiveCultureModal(null)}
                    onSuccess={() => { setArchiveCultureModal(null); window.location.reload(); }}
                />
            )}
            {isAddDietModalOpen && <AddDietModal patientId={patient.id} onClose={() => setAddDietModalOpen(false)} />}
            {editingDiet && <EditDietModal diet={editingDiet} patientId={patient.id} onClose={() => setEditingDiet(null)} />}
            {archiveDietModal && (
                <ArchiveModal
                    title="Arquivar Dieta"
                    tableName="dietas_pacientes"
                    itemId={archiveDietModal.id}
                    itemDescription={archiveDietModal.type}
                    itemDate={archiveDietModal.data_inicio}
                    itemDateLabel="Início"
                    onClose={() => setArchiveDietModal(null)}
                    onSuccess={() => { setArchiveDietModal(null); window.location.reload(); }}
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

export { PatientDetailScreen };
