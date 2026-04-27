
import React, { useState, useContext, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Device, Exam, Medication, SurgicalProcedure, Culture, Diet } from '../types';
import { formatDateToBRL } from '../constants';
import { BackArrowIcon, WarningIcon, PencilIcon, ClipboardIcon, FileTextIcon, CpuIcon, PillIcon, BarChartIcon, AppleIcon, DropletIcon, BrainIcon, ShieldIcon, BeakerIcon, LungsIcon, DumbbellIcon, CloseIcon, ScalpelIcon, ChevronRightIcon, CalculatorIcon, ChevronDownIcon, CameraIcon } from '../components/icons';
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
const AvaliacaoRespiratoriaScale = lazy(() => import('../components/AvaliacaoRespiratoriaScale').then(m => ({ default: m.AvaliacaoRespiratoriaScale })));
const PhoenixSepsisCalculator = lazy(() => import('../components/PhoenixSepsisCalculator'));
const KDIGOScale = lazy(() => import('../components/KDIGOScale').then(m => ({ default: m.KDIGOScale })));
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
const ParecerCard = lazy(() => import('../components/ParecerCard').then(m => ({ default: m.ParecerCard })));
const ExameImagemCard = lazy(() => import('../components/ExameImagemCard').then(m => ({ default: m.ExameImagemCard })));
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

    const [mainTab, setMainTab] = useState<'npt' | 'scales' | null>(null);
    const [openCategoryModal, setOpenCategoryModal] = useState<'devices' | 'exams' | 'medications' | 'surgical' | 'cultures' | 'diets' | 'aportes' | 'scales' | 'pareceres' | 'examesImagem' | null>(null);
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
    const [scaleView, setScaleView] = useState<'list' | 'comfort-b' | 'delirium' | 'glasgow' | 'crs-r' | 'flacc' | 'braden' | 'braden-qd' | 'vni-cnaf' | 'fss' | 'abstinencia' | 'sos-pd' | 'consciousness' | 'respiratory' | 'phoenix-sepsis' | 'avaliacao-respiratoria' | 'kdigo'>('list');
    const [calculationsRefresh, setCalculationsRefresh] = useState(0);
    const scalesSectionRef = useRef<HTMLDivElement>(null);

    const { showNotification } = useContext(NotificationContext)!;

    useEffect(() => {
        // Scroll para o topo quando entra na página
        window.scrollTo(0, 0);
    }, [patientId]);

    useEffect(() => {
        if (mainTab !== 'scales') {
            setScaleView('list');
        }
    }, [mainTab]);

    // Scroll para a seção das escalas quando uma escala for aberta (não pro topo absoluto da página)
    useEffect(() => {
        if (scalesSectionRef.current) {
            scalesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [scaleView]);

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


    return (
        <div className="space-y-6">
            {/* Card do Paciente */}
            <div className="rounded-2xl shadow-lg overflow-hidden border border-blue-500/20 dark:border-blue-400/20">
                {/* Barra de gradiente no topo */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 relative">
                    <button
                        onClick={() => setEditInfoModalOpen(true)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-500 transition bg-slate-100 dark:bg-slate-800 rounded-full"
                        aria-label="Editar Informações do Paciente"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* Nome + leito */}
                    <div className="flex items-center gap-3 pr-10 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                            <span className="text-white font-bold text-lg">{patient.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-tight">{patient.name}</h2>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Leito {patient.bedNumber}</span>
                        </div>
                    </div>

                    {/* Grid de informações */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Idade</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">{formatAge(patient.dob)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Mãe</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">{patient.motherName || '-'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Peso</p>
                            <p className={`text-sm font-semibold break-words ${patient.peso ? 'text-slate-700 dark:text-slate-200' : 'text-orange-500 italic'}`}>
                                {patient.peso ? `${patient.peso} kg` : 'Não informado'}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">SC</p>
                            <p className={`text-sm font-semibold break-words ${patient.sc ? 'text-slate-700 dark:text-slate-200' : 'text-orange-500 italic'}`}>
                                {patient.sc ? `${patient.sc} m²` : 'Não informado'}
                            </p>
                        </div>
                        <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Internação</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">
                                {patient.admissionDate
                                    ? <>{formatDateToBRL(patient.admissionDate)} <span className="text-blue-500 dark:text-blue-400 font-bold">· {calculateDays(patient.admissionDate)} {calculateDays(patient.admissionDate) === 1 ? 'dia' : 'dias'}</span></>
                                    : <span className="text-orange-500 italic font-normal">Não informado</span>}
                            </p>
                        </div>
                    </div>
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

            {/* Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {([
                    { id: 'medications' as const, label: 'Medicações', icon: PillIcon, count: patient.medications.filter(m => !m.isArchived).length, gradient: 'from-blue-500 to-blue-700' },
                    { id: 'devices' as const, label: 'Dispositivos', icon: CpuIcon, count: patient.devices.filter(d => !d.isArchived).length, gradient: 'from-green-500 to-emerald-700' },
                    { id: 'cultures' as const, label: 'Culturas', icon: BeakerIcon, count: patient.cultures.filter(c => !c.isArchived).length, gradient: 'from-purple-500 to-violet-700' },
                    { id: 'surgical' as const, label: 'Cirúrgico', icon: ScalpelIcon, count: patient.surgicalProcedures.filter(p => !p.isArchived).length, gradient: 'from-orange-500 to-red-600' },
                    { id: 'exams' as const, label: 'Exames', icon: FileTextIcon, count: patient.exams.filter(e => !e.isArchived).length, gradient: 'from-teal-400 to-cyan-600' },
                    { id: 'diets' as const, label: 'Dietas', icon: AppleIcon, count: patient.diets.filter(d => !d.isArchived).length, gradient: 'from-amber-400 to-orange-500' },
                    { id: 'aportes' as const, label: 'Aportes', icon: DropletIcon, count: null, gradient: 'from-sky-400 to-blue-500' },
                    { id: 'scales' as const, label: 'Escalas', icon: BarChartIcon, count: patient.scaleScores?.length ?? 0, gradient: 'from-indigo-500 to-purple-600' },
                    { id: 'pareceres' as const, label: 'Pareceres', icon: ClipboardIcon, count: null, gradient: 'from-pink-500 to-rose-600' },
                    { id: 'examesImagem' as const, label: 'Imagem', icon: CameraIcon, count: null, gradient: 'from-violet-600 to-fuchsia-600' },
                ] as const).map(({ id, label, icon: Icon, count, gradient }) => (
                    <button
                        key={id}
                        onClick={() => setOpenCategoryModal(id)}
                        className={`relative bg-gradient-to-br ${gradient} rounded-xl p-4 text-white text-left shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200`}
                    >
                        {count !== null && count > 0 && (
                            <span className="absolute top-2 right-2 bg-white/30 backdrop-blur-sm text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                {count}
                            </span>
                        )}
                        <Icon className="w-7 h-7 mb-2 opacity-90" />
                        <p className="font-bold text-sm leading-tight">{label}</p>
                    </button>
                ))}
            </div>

            {/* NPT + Escalas */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <div className={mainTab ? 'border-b border-slate-200 dark:border-slate-800' : ''}>
                    <nav className="flex justify-around">
                        <button
                            onClick={() => setMainTab(mainTab === 'npt' ? null : 'npt')}
                            className={`flex-1 py-4 px-1 text-center font-bold flex items-center justify-center gap-2 transition-colors duration-200 text-lg ${mainTab === 'npt' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <BeakerIcon className="w-6 h-6" />
                            Calculadora NPT
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${mainTab === 'npt' ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                            onClick={() => setMainTab(mainTab === 'scales' ? null : 'scales')}
                            className={`flex-1 py-4 px-1 text-center font-bold flex items-center justify-center gap-2 transition-colors duration-200 text-lg ${mainTab === 'scales' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <BarChartIcon className="w-6 h-6" />
                            Escalas
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${mainTab === 'scales' ? 'rotate-180' : ''}`} />
                        </button>
                    </nav>
                </div>

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
                    <div ref={scalesSectionRef} className="p-4 scroll-mt-4">
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
                                <button onClick={() => setScaleView('avaliacao-respiratoria')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala para Avaliação Respiratória">
                                    <div className="flex items-center gap-3"><LungsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">Escala para Avaliação Respiratória</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
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
                                <button onClick={() => setScaleView('kdigo')} className="w-full text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Abrir Escala KDIGO – Lesão Renal Aguda">
                                    <div className="flex items-center gap-3"><DropletIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /><div><p className="font-bold text-slate-800 dark:text-slate-200">KDIGO – Lesão Renal Aguda</p></div></div><ChevronRightIcon className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        )}
                        {scaleView === 'comfort-b' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><ComfortBCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'delirium' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><CAMICUCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'glasgow' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><GlasgowCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'crs-r' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><CRSRScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
                        {scaleView === 'flacc' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><FLACCCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'braden' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><BradenCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'braden-qd' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><BradenQDScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
                        {scaleView === 'vni-cnaf' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><VNICNAFCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'fss' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><FSSScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
                        {scaleView === 'abstinencia' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><AbstinenciaCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'sos-pd' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><SOSPDCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'consciousness' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><ConsciousnessCalculator patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'respiratory' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><RespiratoryCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'phoenix-sepsis' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><PhoenixSepsisCalculator patientId={patient.id.toString()} onClose={() => setScaleView('list')} /></Suspense></div></div>)}
                        {scaleView === 'avaliacao-respiratoria' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><AvaliacaoRespiratoriaScale patientId={patient.id.toString()} /></Suspense></div></div>)}
                        {scaleView === 'kdigo' && (<div className='bg-white dark:bg-slate-800 rounded-xl overflow-hidden -m-4'><button onClick={() => setScaleView('list')} className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 font-semibold mb-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"><BackArrowIcon className="w-4 h-4" />Voltar para Escalas</button><div className="p-4 pt-0"><Suspense fallback={<LoadingSpinner />}><KDIGOScale onSaveScore={handleSaveScaleScore} /></Suspense></div></div>)}
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

            {/* Category Modal */}
            {openCategoryModal && (() => {
                const modalConfig: Record<string, { label: string; icon: React.FC<{ className?: string }>; gradient: string }> = {
                    medications: { label: 'Medicações', icon: PillIcon, gradient: 'from-blue-500 to-blue-700' },
                    devices: { label: 'Dispositivos', icon: CpuIcon, gradient: 'from-green-500 to-emerald-700' },
                    cultures: { label: 'Culturas', icon: BeakerIcon, gradient: 'from-purple-500 to-violet-700' },
                    surgical: { label: 'Cirúrgico', icon: ScalpelIcon, gradient: 'from-orange-500 to-red-600' },
                    exams: { label: 'Exames', icon: FileTextIcon, gradient: 'from-teal-400 to-cyan-600' },
                    diets: { label: 'Dietas', icon: AppleIcon, gradient: 'from-amber-400 to-orange-500' },
                    aportes: { label: 'Aportes', icon: DropletIcon, gradient: 'from-sky-400 to-blue-500' },
                    scales: { label: 'Escalas', icon: BarChartIcon, gradient: 'from-indigo-500 to-purple-600' },
                    pareceres: { label: 'Pareceres', icon: ClipboardIcon, gradient: 'from-pink-500 to-rose-600' },
                    examesImagem: { label: 'Imagem', icon: CameraIcon, gradient: 'from-violet-600 to-fuchsia-600' },
                };
                const config = modalConfig[openCategoryModal];
                const ModalIcon = config.icon;
                return (
                    <div className="fixed inset-0 z-[25] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpenCategoryModal(null)}>
                        <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className={`bg-gradient-to-r ${config.gradient} px-4 py-4 flex items-center justify-between shrink-0`}>
                                <div className="flex items-center gap-3">
                                    <ModalIcon className="w-6 h-6 text-white" />
                                    <h2 className="text-lg font-bold text-white">{config.label}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {openCategoryModal === 'devices' && <button onClick={() => { setOpenCategoryModal(null); setAddDeviceModalOpen(true); }} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">+ Cadastrar</button>}
                                    {openCategoryModal === 'exams' && <button onClick={() => { setOpenCategoryModal(null); setAddExamModalOpen(true); }} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">+ Cadastrar</button>}
                                    {openCategoryModal === 'medications' && <button onClick={() => { setOpenCategoryModal(null); setAddMedicationModalOpen(true); }} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">+ Cadastrar</button>}
                                    {openCategoryModal === 'surgical' && <button onClick={() => { setOpenCategoryModal(null); setAddSurgicalModalOpen(true); }} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">+ Cadastrar</button>}
                                    {openCategoryModal === 'cultures' && <button onClick={() => { setOpenCategoryModal(null); setAddCultureModalOpen(true); }} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">+ Cadastrar</button>}
                                    {openCategoryModal === 'diets' && <button onClick={() => { setOpenCategoryModal(null); setAddDietModalOpen(true); }} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">+ Cadastrar</button>}
                                    <button onClick={() => setOpenCategoryModal(null)} className="text-white/80 hover:text-white transition p-1">
                                        <CloseIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {openCategoryModal === 'devices' && (<>
                                    {patient.devices.filter(d => !d.isArchived).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum dispositivo cadastrado.</p>}
                                    {patient.devices.filter(d => !d.isArchived).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(device => (
                                        <div key={device.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <CpuIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{device.name} - {device.location}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(device.startDate)}</p>
                                                        {device.removalDate ? <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Retirada: {formatDateToBRL(device.removalDate)}</p> : <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(device.startDate)}</p>}
                                                        {device.observacao && <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">💬 {device.observacao}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {!device.removalDate && <button onClick={() => setRemovalModalOpen(device.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Retirada</button>}
                                                    <button onClick={() => device.removalDate ? setEditingDeviceRemovalDate(device) : setEditingDevice(device)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setArchiveDeviceModal(device)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"><CloseIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                                {openCategoryModal === 'exams' && (<>
                                    {patient.exams.filter(e => !e.isArchived).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum exame cadastrado.</p>}
                                    {patient.exams.filter(e => !e.isArchived).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exam => (
                                        <div key={exam.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <FileTextIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{exam.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(exam.date)}</p>
                                                        {exam.sistema && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">{exam.sistema}</span>}
                                                        {exam.observation && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {exam.observation}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button onClick={() => setEditingExam(exam)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setArchiveExamModal(exam)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"><CloseIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                                {openCategoryModal === 'medications' && (<>
                                    {patient.medications.filter(m => !m.isArchived).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma medicação cadastrada.</p>}
                                    {patient.medications.filter(m => !m.isArchived).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(medication => (
                                        <div key={medication.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <PillIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 wrap-break-word">{medication.name} - {medication.dosage}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(medication.startDate)}</p>
                                                        {medication.endDate ? <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-md inline-block mt-1">Fim: {formatDateToBRL(medication.endDate)}</p> : <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(medication.startDate)}</p>}
                                                        {medication.sistema && <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{medication.sistema}</span>}
                                                        {medication.observacao && <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">💬 {medication.observacao}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {!medication.endDate && <button onClick={() => setEndDateModalOpen(medication.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Fim</button>}
                                                    <button onClick={() => medication.endDate ? setEditingMedicationEndDate(medication) : setEditingMedication(medication)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setArchiveMedicationModal(medication)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"><CloseIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                                {openCategoryModal === 'surgical' && (<>
                                    {patient.surgicalProcedures.filter(p => !p.isArchived).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhum procedimento cadastrado.</p>}
                                    {patient.surgicalProcedures.filter(p => !p.isArchived).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(procedure => (
                                        <div key={procedure.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <ScalpelIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{procedure.name}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(procedure.date)} - Dr(a): {procedure.surgeon}</p>
                                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">Dia Pós-Operatório: +{calculateDays(procedure.date)} dias</p>
                                                        {procedure.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Obs: {procedure.notes}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button onClick={() => setEditingSurgicalProcedure(procedure)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setArchiveSurgicalModal(procedure)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"><CloseIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                                {openCategoryModal === 'cultures' && (<>
                                    {patient.cultures.filter(c => !c.isArchived).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma cultura cadastrada.</p>}
                                    {patient.cultures.filter(c => !c.isArchived).sort((a, b) => new Date(b.collectionDate).getTime() - new Date(a.collectionDate).getTime()).map(culture => (
                                        <div key={culture.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <BeakerIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{culture.site}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Microorganismo: {culture.microorganism}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Data: {formatDateToBRL(culture.collectionDate)}</p>
                                                        {culture.observation && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">Observação: {culture.observation}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <button onClick={() => setEditingCulture(culture)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setArchiveCultureModal(culture)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"><CloseIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                                {openCategoryModal === 'diets' && (<>
                                    {patient.diets.filter(d => !d.isArchived).length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma dieta cadastrada.</p>}
                                    {patient.diets.filter(d => !d.isArchived).sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()).map(diet => (
                                        <div key={diet.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-3">
                                                    <AppleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{diet.type}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">Início: {formatDateToBRL(diet.data_inicio)}</p>
                                                        {diet.data_remocao ? <p className="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded mt-1 font-medium">Retirada: {formatDateToBRL(diet.data_remocao)}</p> : <p className="text-sm text-slate-500 dark:text-slate-400">Dias: {calculateDays(diet.data_inicio)}</p>}
                                                        {diet.volume && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Volume: {diet.volume} ml</p>}
                                                        {diet.vet && <p className="text-sm text-slate-500 dark:text-slate-400">VET: {diet.vet} kcal/dia</p>}
                                                        {diet.vet_pleno && <p className="text-sm text-slate-500 dark:text-slate-400">VET Pleno: {diet.vet_pleno} kcal/dia</p>}
                                                        {diet.pt && <p className="text-sm text-slate-500 dark:text-slate-400">Proteína (PT): {diet.pt} g/dia</p>}
                                                        {diet.pt_g_dia && <p className="text-sm text-slate-500 dark:text-slate-400">PT Plena: {diet.pt_g_dia} g/dia</p>}
                                                        {diet.th && <p className="text-sm text-slate-500 dark:text-slate-400">Taxa Hídrica (TH): {diet.th} ml/m²/dia</p>}
                                                        {(diet.vet_at || diet.pt_at) && (
                                                            <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                                                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">📊 Cálculos Automáticos</p>
                                                                {diet.vet_at && diet.vet && diet.vet_pleno && <><p className="text-sm font-bold text-blue-900 dark:text-blue-200">VET AT: {diet.vet_at.toFixed(1)}%</p><p className="text-xs text-blue-600 dark:text-blue-400">{diet.vet} kcal/dia de {diet.vet_pleno} kcal/dia</p></>}
                                                                {diet.pt_at && diet.pt && diet.pt_g_dia && <><p className="text-sm font-bold text-blue-900 dark:text-blue-200 mt-1">PT AT: {diet.pt_at.toFixed(1)}%</p><p className="text-xs text-blue-600 dark:text-blue-400">{diet.pt} g/dia de {diet.pt_g_dia} g/dia</p></>}
                                                            </div>
                                                        )}
                                                        {diet.observacao && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">Observação: {diet.observacao}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    {!diet.data_remocao && <button onClick={() => setDietRemovalModalOpen(diet.id)} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Registrar Retirada</button>}
                                                    <button onClick={() => diet.data_remocao ? setEditingDietRemovalDate(diet) : setEditingDiet(diet)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition"><PencilIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setArchiveDietModal(diet)} className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition"><CloseIcon className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                                {openCategoryModal === 'aportes' && <AportesCard patientId={patient.id} />}
                                {openCategoryModal === 'pareceres' && (
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <ParecerCard patientId={patient.id} />
                                    </Suspense>
                                )}
                                {openCategoryModal === 'examesImagem' && (
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <ExameImagemCard patientId={patient.id} />
                                    </Suspense>
                                )}
                                {openCategoryModal === 'scales' && (<>
                                    {(!patient.scaleScores || patient.scaleScores.length === 0) && (
                                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma escala registrada.</p>
                                    )}
                                    {(patient.scaleScores ?? []).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(score => (
                                        <div key={score.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <BarChartIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{score.scaleName}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                                                        Pontuação: <span className="font-semibold">{score.score}</span>
                                                        {score.interpretation && <span className="ml-2 text-slate-500 dark:text-slate-400">({score.interpretation})</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        {new Date(score.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>)}
                            </div>
                        </div>
                    </div>
                );
            })()}

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
