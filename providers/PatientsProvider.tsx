import React, { useState, useEffect } from 'react';
import { PatientsContext } from '../contexts';
import { Patient, Question, Category, Answer, Device, Exam, Medication, SurgicalProcedure, ScaleScore, Culture, Diet, Precaution, PatientsContextType } from '../types';
import { CATEGORIES as STATIC_CATEGORIES, QUESTIONS as STATIC_QUESTIONS, ICON_MAP } from '../constants';
import { FileTextIcon } from '../components/icons';
import { supabase } from '../supabaseClient';
import { sanitizeText, sanitizeTextOrNull } from '../lib/sanitize';

// --- HELPER FOR DATES ---
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const PatientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

        if (medsRes?.data && medsRes.data.length > 0) {
        }

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
            // ✅ CORRIGIDO: Se unidade_medida é NULL, usar apenas dosagem_valor
            const dosage = m.unidade_medida
                ? `${m.dosagem_valor} ${m.unidade_medida}`
                : m.dosagem_valor;
            acc[m.paciente_id].push({
                id: m.id,
                name: m.nome_medicacao,
                dosage: dosage,
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
                data_fim_sugerida: p.data_fim_sugerida || undefined,
                doenca_id: p.doenca_id || undefined,
                doenca_nome: p.doenca_nome || undefined,
                observacao: p.observacao || undefined,
                isArchived: !!p.archived_at,
                motivo_arquivamento: p.motivo_arquivamento || undefined,
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

        const mappedPatients: Patient[] = patientsData.map((p: any) => {
            const pacienteMeds = medsMap[p.id] || [];
            if (pacienteMeds.length > 0) {
            }

            return {
                id: p.id,
                name: p.name,
                bedNumber: p.bed_number,
                motherName: p.mother_name || '-',
                dob: p.dob,
                ctd: p.diagnosis || 'Estável',
                peso: p.peso,
                sc: p.sc,
                status: p.status || 'estavel',
                localTransferencia: p.local_transferencia || undefined,
                comorbidade: p.comorbidade || undefined,
                admissionDate: p.dt_internacao || undefined,
                devices: devicesMap[p.id] || [],
                exams: examsMap[p.id] || [],
                medications: pacienteMeds,
                surgicalProcedures: surgsMap[p.id] || [],
                scaleScores: scalesMap[p.id] || [],
                cultures: culturesMap[p.id] || [],
                diets: dietsMap[p.id] || [],
                precautions: precautionsMap[p.id] || [],
                diurese: diuresisMap[p.id] || [],
                balanco_hidrico: balanceMap[p.id] || []
            };
        });

        // Debug: Mostrar medicações carregadas
        let medicacoesPorPaciente = 0;
        mappedPatients.forEach(p => {
            if (p.medications.length > 0) {
                medicacoesPorPaciente += p.medications.length;
            }
        });

        setPatients(mappedPatients);
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
            supabase.from('patients').select('id, name, bed_number, dob, status, mother_name, diagnosis, peso, dt_internacao, sc, local_transferencia, comorbidade').is('archived_at', null),
            supabase.from('perguntas').select('*').order('ordem', { ascending: true }),
            supabase.from('pergunta_opcoes').select('*').order('ordem', { ascending: true }),
            supabase.from('categorias').select('*').order('ordem', { ascending: true }),
            supabase.from('checklist_answers').select('*').eq('date', today)
        ]);

        // Validar dados essenciais
        if (patientsRes.error) {
            console.error('Error fetching patients:', patientsRes.error);
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

        // 🔄 Carregar dados detalhados EM BACKGROUND (não bloqueia renderização)
        // Filtra apenas dados de pacientes ativos para evitar carregar dados desnecessários
        const activePatientIds = basicPatients.map(p => p.id);
        setTimeout(() => {
            Promise.all([
                supabase.from('patients').select('id, name, bed_number, dob, status, mother_name, diagnosis, peso, dt_internacao, sc, local_transferencia, comorbidade').is('archived_at', null),
                supabase.from('dispositivos_pacientes').select('*').in('paciente_id', activePatientIds).or('is_archived.is.null,is_archived.eq.false'),
                supabase.from('exames_pacientes').select('*').in('paciente_id', activePatientIds).or('is_archived.is.null,is_archived.eq.false'),
                supabase.from('medicacoes_pacientes').select('*').in('paciente_id', activePatientIds).or('is_archived.is.null,is_archived.eq.false'),
                supabase.from('procedimentos_pacientes').select('*').in('paciente_id', activePatientIds).or('is_archived.is.null,is_archived.eq.false'),
                supabase.from('scale_scores').select('*').in('patient_id', activePatientIds),
                supabase.from('culturas_pacientes').select('*').in('paciente_id', activePatientIds).or('is_archived.is.null,is_archived.eq.false'),
                supabase.from('dietas_pacientes').select('*').in('paciente_id', activePatientIds).or('is_archived.is.null,is_archived.eq.false'),
                supabase.from('precautions_com_calculo').select('*').in('patient_id', activePatientIds).is('archived_at', null),
                supabase.from('diurese').select('*').in('patient_id', activePatientIds).order('data_registro', { ascending: false }).limit(100),
                supabase.from('balanco_hidrico').select('*').in('patient_id', activePatientIds).order('data_registro', { ascending: false }).limit(100)
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
                if (scalesRes.error) {
                    console.error('ERRO AO BUSCAR ESCALAS:', scalesRes.error);
                } else if (!scalesRes.data || scalesRes.data.length === 0) {
                }

                // ✅ VALIDAR ERROS ANTES DE PROCESSAR
                if (patientsFullRes.error || !patientsFullRes.data) {
                    console.error('Erro ao carregar pacientes completos:', patientsFullRes.error);
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
            }).catch(error => {
                console.error('Erro ao carregar dados detalhados:', error);
            });
        }, 500); // Pequeno delay para não competir com renderização dos leitos

        if (questionsRes.data && questionsRes.data.length > 0) {
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
            const { data, error } = await supabase.from('dispositivos_pacientes').insert([{
                paciente_id: patientId,
                tipo_dispositivo: sanitizeText(device.name),
                localizacao: sanitizeText(device.location),
                data_insercao: device.startDate,
                observacao: sanitizeTextOrNull(device.observacao),
                criado_por_id: userId || null
            }]);

            if (error) {
                console.error('Erro ao adicionar dispositivo:', error);
                throw new Error(error.message);
            }

            await fetchPatients();
            return data;
        } catch (error) {
            console.error('Erro na operação de adicionar dispositivo:', error);
            throw error;
        }
    };

    const addExamToPatient = async (patientId: number | string, exam: Omit<Exam, 'id'>, userId?: string) => {
        const payload = {
            paciente_id: patientId,
            nome_exame: sanitizeText(exam.name),
            data_exame: exam.date,
            observacao: sanitizeTextOrNull(exam.observation),
            criado_por_id: userId || null
        };
        const { data, error } = await supabase.from('exames_pacientes').insert([payload]);

        if (error) {
            console.error('Erro ao inserir exame:', error);
        } else {
        }

        if (!error) fetchPatients();
    };

    const addMedicationToPatient = async (patientId: number | string, medication: any, userId?: string) => {

        // Novo formato com dosageValue e unidade já separados
        const valor = medication.dosageValue || '';
        const unidade = medication.unidade || null;

        const payload = {
            paciente_id: patientId,
            nome_medicacao: sanitizeText(medication.name),
            dosagem_valor: sanitizeText(valor),
            unidade_medida: sanitizeTextOrNull(unidade),
            data_inicio: medication.startDate,
            observacao: sanitizeTextOrNull(medication.observacao),
            criado_por_id: userId || null
        };


        const { data, error } = await supabase.from('medicacoes_pacientes').insert([payload]);


        if (error) {
            console.error('Erro ao inserir medicação:', error);
            console.error('Código do erro:', error.code);
            console.error('Mensagem completa:', error.message);
            console.error('Detalhes:', error.details);
        } else {

            // ✅ ATUALIZAR IMEDIATAMENTE sem aguardar completamente
            // Buscar apenas medicações desse paciente
            const { data: novasMeds, error: erroMeds } = await supabase
                .from('medicacoes_pacientes')
                .select('*')
                .eq('paciente_id', patientId);

            if (!erroMeds && novasMeds) {

                // Atualizar o state dos pacientes com as novas medicações
                setPatients(prev => prev.map(p => {
                    if (p.id === patientId) {
                        // Processar as medicações novas
                        const medsProcessadas = (novasMeds || []).map((m: any) => ({
                            id: m.id,
                            name: m.nome_medicacao,
                            dosage: m.unidade_medida
                                ? `${m.dosagem_valor} ${m.unidade_medida}`
                                : m.dosagem_valor,
                            startDate: m.data_inicio,
                            endDate: m.data_fim,
                            isArchived: m.is_archived,
                            observacao: m.observacao
                        }));

                        console.log('📝 Retornando paciente atualizado:', {
                            ...p,
                            medications: medsProcessadas
                        });

                        return {
                            ...p,
                            medications: medsProcessadas
                        };
                    }
                    return p;
                }));
            }
        }

        // ✅ FIX: Removido setTimeout + fetchPatients() que causava race condition
        // A atualização otimista acima já mostra os dados corretos na UI
    };

    const addSurgicalProcedureToPatient = async (patientId: number | string, procedure: Omit<SurgicalProcedure, 'id'>, userId?: string) => {

        const payload = {
            paciente_id: patientId,
            nome_procedimento: sanitizeText(procedure.name),
            data_procedimento: procedure.date,
            nome_cirurgiao: sanitizeText(procedure.surgeon),
            notas: sanitizeTextOrNull(procedure.notes),
            criado_por_id: userId || null
        };

        const { data, error } = await supabase.from('procedimentos_pacientes').insert([payload]);

        if (error) {
            console.error('Erro ao inserir procedimento:', error);
        } else {
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
                console.error('Erro ao adicionar data de remoção:', error);
                throw error;
            }

            await fetchPatients();
            return data;
        } catch (error) {
            console.error('Erro na operação de adicionar data de remoção:', error);
            throw error;
        }
    };

    const deleteDeviceFromPatient = async (patientId: number | string, deviceId: number | string) => {
        const { error } = await supabase.from('dispositivos_pacientes')
            .update({ is_archived: true })
            .eq('id', deviceId);

        if (error) {
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
                nome_exame: sanitizeText(examData.name),
                data_exame: examData.date,
                observacao: sanitizeTextOrNull(examData.observation)
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
                tipo_dispositivo: sanitizeText(deviceData.name),
                localizacao: sanitizeText(deviceData.location),
                data_insercao: deviceData.startDate,
                data_remocao: deviceData.removalDate || null,
                observacao: sanitizeTextOrNull(deviceData.observacao)
            })
            .eq('id', deviceData.id);
        if (!error) fetchPatients();
    };

    const updateMedicationInPatient = async (patientId: number | string, medicationData: Medication) => {
        const parts = (medicationData.dosage ?? '').split(' ');
        const valor = parts[0] || '';
        const unidade = parts.slice(1).join(' ') || '';

        const { error } = await supabase.from('medicacoes_pacientes')
            .update({
                nome_medicacao: sanitizeText(medicationData.name),
                dosagem_valor: sanitizeText(valor),
                unidade_medida: sanitizeText(unidade),
                data_inicio: medicationData.startDate,
                data_fim: medicationData.endDate || null,
                observacao: sanitizeTextOrNull(medicationData.observacao)
            })
            .eq('id', medicationData.id);
        if (!error) fetchPatients();
    };

    const updateSurgicalProcedureInPatient = async (patientId: number | string, procedureData: SurgicalProcedure) => {
        const { error } = await supabase.from('procedimentos_pacientes')
            .update({
                nome_procedimento: sanitizeText(procedureData.name),
                data_procedimento: procedureData.date,
                nome_cirurgiao: sanitizeText(procedureData.surgeon),
                notas: sanitizeTextOrNull(procedureData.notes)
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

        const payload = {
            paciente_id: patientId,
            local: sanitizeText(culture.site),
            microorganismo: sanitizeText(culture.microorganism),
            data_coleta: culture.collectionDate,
            observacao: sanitizeTextOrNull(culture.observation),
            criado_por_id: userId || null
        };

        const { data, error } = await supabase.from('culturas_pacientes').insert([payload]);

        if (error) {
            console.error('Erro ao inserir cultura:', error);
        } else {
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
                local: sanitizeText(cultureData.site),
                microorganismo: sanitizeText(cultureData.microorganism),
                data_coleta: cultureData.collectionDate,
                observacao: sanitizeTextOrNull(cultureData.observation)
            })
            .eq('id', cultureData.id);
        if (!error) fetchPatients();
    };

    const addDietToPatient = async (patientId: number | string, diet: Omit<Diet, 'id'>, userId?: string) => {
        // vet_at e pt_at são calculados automaticamente pelo banco (GENERATED ALWAYS AS)

        const payload = {
            paciente_id: patientId,
            tipo: sanitizeText(diet.type),
            data_inicio: diet.data_inicio,
            data_remocao: diet.data_remocao || null,
            volume: diet.volume || null,
            vet: diet.vet || null,
            vet_pleno: diet.vet_pleno || null,
            pt: diet.pt || null,
            pt_g_dia: diet.pt_g_dia || null,
            th: diet.th || null,
            observacao: sanitizeTextOrNull(diet.observacao),
            criado_por_id: userId || null
        };


        const { error } = await supabase.from('dietas_pacientes').insert([payload]);

        if (error) {
            console.error('Erro ao inserir dieta:', error);
        } else {
        }

        if (!error) fetchPatients();
    };

    const deleteDietFromPatient = async (patientId: number | string, dietId: number | string, userId?: string) => {

        const { error } = await supabase.from('dietas_pacientes')
            .update({
                is_archived: true,
                arquivado_por_id: userId || null  // 🟢 Capturar quem está arquivando
            })
            .eq('id', dietId);

        if (error) {
            console.error('Erro ao arquivar dieta:', error);
        } else {
        }

        if (!error) fetchPatients();
    };

    const updateDietInPatient = async (patientId: number | string, dietData: Diet) => {
        // vet_at e pt_at são calculados automaticamente pelo banco (GENERATED ALWAYS AS)
        const { error } = await supabase.from('dietas_pacientes')
            .update({
                tipo: sanitizeText(dietData.type),
                data_inicio: dietData.data_inicio,
                data_remocao: dietData.data_remocao || null,
                volume: dietData.volume || null,
                vet: dietData.vet || null,
                vet_pleno: dietData.vet_pleno || null,
                pt: dietData.pt || null,
                pt_g_dia: dietData.pt_g_dia || null,
                th: dietData.th || null,
                observacao: sanitizeTextOrNull(dietData.observacao)
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
            data_fim: precaution.data_fim || null,
            doenca_id: precaution.doenca_id ?? null,
            observacao: precaution.observacao ?? null,
            data_fim_sugerida: precaution.data_fim_sugerida ?? null
        }]);

        if (error) console.warn("Precaution table error", error);
        if (!error) fetchPatients();
    };

    const deletePrecautionFromPatient = async (patientId: number | string, precautionId: number | string, motivo?: string) => {
        const { error } = await supabase.from('precautions')
            .update({
                archived_at: new Date().toISOString(),
                motivo_arquivamento: motivo ?? null,
            })
            .eq('id', precautionId);
        if (!error) fetchPatients();
    };

    const updatePrecautionInPatient = async (patientId: number | string, precautionData: Precaution) => {
        const { error } = await supabase.from('precautions')
            .update({
                tipo_precaucao: precautionData.tipo_precaucao,
                data_inicio: precautionData.data_inicio,
                data_fim: precautionData.data_fim || null,
                doenca_id: precautionData.doenca_id ?? null,
                observacao: precautionData.observacao ?? null,
                data_fim_sugerida: precautionData.data_fim_sugerida ?? null
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
            }
            if (data.sc !== undefined) {
                const scNumero = typeof data.sc === 'string' ? parseFloat(data.sc) : data.sc;
                updateData.sc = scNumero || null;
            }


            const { data: result, error } = await supabase.from('patients')
                .update(updateData)
                .eq('id', patientId)
                .select();


            if (error) {
                console.error('Erro ao salvar dados do paciente:', error);
                alert(`Erro ao salvar: ${error.message}`);
                return;
            }

            alert('✅ Informações atualizadas com sucesso!');

            // ✅ FIX: Atualizar localmente em vez de refetch completo
            setPatients(prev => prev.map(p => {
                if (p.id.toString() === patientId.toString()) {
                    return {
                        ...p,
                        motherName: data.motherName ?? p.motherName,
                        ctd: data.ctd ?? p.ctd,
                        peso: data.peso ?? p.peso,
                        sc: data.sc ?? p.sc,
                    };
                }
                return p;
            }));
        } catch (err) {
            console.error('Erro ao salvar dados do paciente:', err);
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
