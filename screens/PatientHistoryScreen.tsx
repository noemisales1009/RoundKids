import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PatientsContext, TasksContext } from '../contexts';
import { useHeader } from '../hooks/useHeader';
import { supabase } from '../supabaseClient';
import { formatDateToBRL, formatDateTimeWithHour } from '../constants';
import {
    HeartPulseIcon,
    CpuIcon,
    PillIcon,
    FileTextIcon,
    ScalpelIcon,
    BarChartIcon,
    ClipboardIcon,
    DropletIcon,
    BellIcon,
    CheckCircleIcon,
    AppleIcon,
    BeakerIcon
} from '../components/icons';

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

                const { data, error } = await supabase
                    .from('diagnosticos_historico_com_usuario')
                    .select('*')
                    .eq('patient_id', patientId);


                if (error) {
                    console.error('Erro ao buscar diagnósticos:', error.message);
                    return;
                }

                if (data && data.length > 0) {
                    // Separar diagnósticos ATIVOS (não arquivados) e ARQUIVADOS
                    const active = data.filter(d => !d.arquivado);
                    const archived = data.filter(d => d.arquivado === true);


                    setDiagnostics(active);
                    setArchivedDiagnostics(archived);
                } else {
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
                    return;
                }

                if (data) {
                    setArchivedDiagnostics(data);
                } else {
                    setArchivedDiagnostics([]);
                }
            } catch (err) {
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

                // Filtrar no frontend para remover status que contenham palavras-chave
                const alertasFiltered = (alertasResult.data || []).filter(
                    a => !a.status?.includes('resolvido') && !a.status?.includes('arquivado')
                );
                const tasksFiltered = (tasksResult.data || []).filter(
                    t => !t.status?.includes('concluído') && !t.status?.includes('arquivado')
                );

                // Combinar resultados filtrados
                const allAlerts = [
                    ...alertasFiltered.map(a => ({ ...a, source: 'alertas_paciente' })),
                    ...tasksFiltered.map(t => ({ ...t, source: 'tasks' }))
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
                    return;
                }

                if (data) {
                    setAlertCompletions(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setAlertJustifications(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedAlerts(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedDevices(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedExams(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedMedications(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedProcedures(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedCultures(data);
                }
            } catch (err) {
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
                    return;
                }


                if (data) {
                    setArchivedDiets(data);
                }
            } catch (err) {
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
                    return;
                }

                setClinicalSituations24h(data || []);
            } catch (err) {
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
                    return;
                }

                setAportesHistorico(data || []);
            } catch (err) {
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
        diuresisData.forEach(diuresis => {
            const result = ((diuresis.volume / diuresis.horas) / diuresis.peso).toFixed(2);
            const eventData = {
                timestamp: diuresis.data_registro || new Date().toISOString(),
                icon: DropletIcon,
                description: `[DIURESE] Diurese: ${result} mL/kg/h (Peso: ${diuresis.peso}kg | Volume: ${diuresis.volume}mL | Período: ${diuresis.horas}h).`,
                hasTime: true,
            };
            events.push(eventData);
        });

        // Adicionar balanço hídrico dos dados do Supabase
        balanceData.forEach(balance => {
            const result = (balance.volume / (balance.peso * 10)).toFixed(2);
            const eventData = {
                timestamp: balance.data_registro || new Date().toISOString(),
                icon: DropletIcon,
                description: `[BALANÇO] Balanço Hídrico: ${balance.volume > 0 ? '+' : ''}${result}% (Peso: ${balance.peso}kg | Volume: ${balance.volume > 0 ? '+' : ''}${balance.volume}mL).`,
                hasTime: true,
            };
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
        alertJustifications.forEach(just => {
            const tipoLabel = just.tipo_origem === 'Alerta' ? '🔔 Alerta' : '📋 Tarefa';
            events.push({
                timestamp: just.data_justificativa || new Date().toISOString(),
                icon: CheckCircleIcon,
                description: `[JUSTIFICATIVA_ADICIONADA] ✓ Justificativa Adicionada (${tipoLabel})\n📋 ${just.descricao}\n Justificativa: ${just.justificativa}\n👨‍⚕️ Justificado por: ${just.quem_justificou_nome}\n📅 Justificado em: ${just.data_justificativa ? new Date(just.data_justificativa).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar alertas arquivados
        archivedAlerts.forEach(archived => {
            const tipoLabel = archived.tipo_origem === 'Alerta' ? '🔔 Alerta' : '📋 Tarefa';
            events.push({
                timestamp: archived.data_arquivamento || new Date().toISOString(),
                icon: CheckCircleIcon,
                description: `[ALERTA_ARQUIVADO] 📦 ${tipoLabel} Arquivado\n📋 Descrição: ${archived.descricao_original}\n📝 Motivo do Arquivamento: ${archived.motivo_do_arquivamento}\n👨‍⚕️ Arquivado por: ${archived.quem_arquivou}\n📅 Arquivado em: ${archived.data_arquivamento ? new Date(archived.data_arquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar dispositivos arquivados
        archivedDevices.forEach(device => {
            const dataArquivamento = device.created_at; // A data de quando foi arquivado
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: CpuIcon,
                description: `[DISPOSITIVO_ARQUIVADO] 🔌 Dispositivo Arquivado\n📋 Dispositivo: ${device.tipo_dispositivo} - ${device.localizacao}\n📝 Motivo do Arquivamento: ${device.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${device.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar exames arquivados
        archivedExams.forEach(exam => {
            const dataArquivamento = exam.created_at;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: FileTextIcon,
                description: `[EXAME_ARQUIVADO] 📄 Exame Arquivado\n📋 Exame: ${exam.nome_exame}\n📝 Motivo do Arquivamento: ${exam.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${exam.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar medicações arquivadas
        archivedMedications.forEach(medication => {
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
        archivedProcedures.forEach(procedure => {
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
        archivedCultures.forEach(culture => {
            const dataArquivamento = culture.created_at;
            events.push({
                timestamp: dataArquivamento || new Date().toISOString(),
                icon: BeakerIcon,
                description: `[CULTURA_ARQUIVADA] 🧪 Cultura Arquivada\n📋 Local: ${culture.local}\n🦠 Microorganismo: ${culture.microorganismo}\n📝 Motivo do Arquivamento: ${culture.motivo_arquivamento || 'Não informado'}\n👨‍⚕️ Arquivado por: ${culture.nome_arquivador || 'Sistema'}\n📅 Arquivado em: ${dataArquivamento ? new Date(dataArquivamento).toLocaleString('pt-BR') : 'N/A'}`,
                hasTime: true,
            });
        });

        // Adicionar dietas arquivadas
        archivedDiets.forEach(diet => {
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

export { PatientHistoryScreen };
