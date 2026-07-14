import React, { useState, useContext, useEffect } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { Culture } from '../../../types';
import { CloseIcon, ChevronDownIcon } from '../../icons';
import { ALERT_SYSTEMS } from '../../../constants';
import { supabase } from '../../../supabaseClient';

interface DiagnosticoAtivo {
    id: number;
    label: string;
    created_at: string;
    data_inicio?: string | null;
    sistema?: string;
}

export const EditCultureModal: React.FC<{ culture: Culture; patientId: number | string; onClose: () => void; }> = ({ culture, patientId, onClose }) => {
    const { updateCultureInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [site, setSite] = useState(culture.site);
    const [customSite, setCustomSite] = useState('');
    const [microorganism, setMicroorganism] = useState(culture.microorganism);
    const [customMicroorganism, setCustomMicroorganism] = useState('');
    const [collectionDate, setCollectionDate] = useState(culture.collectionDate);
    const [sistema, setSistema] = useState(
        culture.sistema && !ALERT_SYSTEMS.includes(culture.sistema) ? 'Outros' : (culture.sistema || '')
    );
    const [sistemaOutros, setSistemaOutros] = useState(
        culture.sistema && !ALERT_SYSTEMS.includes(culture.sistema) ? culture.sistema : ''
    );
    const [diagnosticosAtivos, setDiagnosticosAtivos] = useState<DiagnosticoAtivo[]>([]);
    const [selectedDiagnosticoId, setSelectedDiagnosticoId] = useState<number | ''>(culture.diagnosticoId ?? '');

    useEffect(() => {
        const fetchDiagnosticos = async () => {
            const { data: diagData, error } = await supabase
                .from('paciente_diagnosticos')
                .select('id, opcao_id, opcao_label, texto_digitado, created_at, data_inicio, sistema')
                .eq('patient_id', patientId)
                .eq('arquivado', false)
                .eq('status', 'nao_resolvido');

            if (error || !diagData || diagData.length === 0) return;

            const opcaoIds = diagData.map((d: any) => d.opcao_id);
            const { data: optData } = await supabase
                .from('pergunta_opcoes_diagnostico')
                .select('id, parent_id, label')
                .in('id', opcaoIds);

            if (!optData) return;

            const parentIds = optData.filter((o: any) => o.parent_id !== null).map((o: any) => o.parent_id);
            const parentMap = new Map<number, string>();
            if (parentIds.length > 0) {
                const { data: parentData } = await supabase
                    .from('pergunta_opcoes_diagnostico')
                    .select('id, label')
                    .in('id', parentIds);
                (parentData || []).forEach((p: any) => parentMap.set(p.id, p.label));
            }

            const optMap = new Map((optData as any[]).map((o: any) => [o.id, o]));
            const paiComFilho = new Set<number>();
            diagData.forEach((d: any) => {
                const opt = optMap.get(d.opcao_id) as any;
                if (opt?.parent_id !== null && opt?.parent_id !== undefined) paiComFilho.add(opt.parent_id);
            });

            const labelsVistos = new Set<string>();
            const unicos: DiagnosticoAtivo[] = [];

            for (const d of diagData as any[]) {
                const opt = optMap.get(d.opcao_id) as any;
                if (!opt) continue;

                let label: string;
                if (opt.parent_id !== null && opt.parent_id !== undefined) {
                    const labelPai = parentMap.get(opt.parent_id) || '';
                    const textoPart = d.texto_digitado ? `: ${d.texto_digitado}` : '';
                    label = `${labelPai} ${opt.label}${textoPart}`.trim();
                } else {
                    if (paiComFilho.has(opt.id)) continue;
                    label = d.texto_digitado
                        ? (d.opcao_label?.startsWith('Outr') ? d.texto_digitado : `${d.opcao_label} ${d.texto_digitado}`.trim())
                        : d.opcao_label;
                }

                if (!labelsVistos.has(label)) {
                    labelsVistos.add(label);
                    unicos.push({ id: d.id, label, created_at: d.created_at, data_inicio: d.data_inicio || null, sistema: d.sistema || undefined });
                }
            }

            setDiagnosticosAtivos(unicos);
        };
        fetchDiagnosticos();
    }, [patientId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSite = site === 'Outros' ? customSite : site;
        const finalMicroorganism = microorganism === 'Outros' ? customMicroorganism : microorganism;

        if (!finalSite || !finalMicroorganism || !collectionDate) return;

        const diagSelecionado = selectedDiagnosticoId !== ''
            ? diagnosticosAtivos.find(d => d.id === selectedDiagnosticoId)
            : undefined;

        updateCultureInPatient(patientId, {
            ...culture,
            site: finalSite,
            microorganism: finalMicroorganism,
            collectionDate,
            sistema: (sistema === 'Outros' ? sistemaOutros.trim() : sistema) || undefined,
            diagnosticoId: diagSelecionado?.id,
            diagnosticoLabel: diagSelecionado?.label,
            diagnosticoDataInicio: (diagSelecionado?.data_inicio
                || diagSelecionado?.created_at?.split('T')[0]
                || culture.diagnosticoDataInicio),
        });
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
                        <select value={site} onChange={e => setSite(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200" required>
                            <option value="">Selecione o local...</option>
                            <option value="Swab nasal">Swab nasal</option>
                            <option value="Swab orofaríngeo">Swab orofaríngeo</option>
                            <option value="Swab retal">Swab retal</option>
                            <option value="Secreção traqueal">Secreção traqueal</option>
                            <option value="Broncoaspirado">Broncoaspirado</option>
                            <option value="Lavado broncoalveolar (LBA)">Lavado broncoalveolar (LBA)</option>
                            <option value="Urocultura (jato médio)">Urocultura (jato médio)</option>
                            <option value="Urocultura por sonda">Urocultura por sonda</option>
                            <option value="Ponta de cateter">Ponta de cateter</option>
                            <option value="Cateter venoso central (CVC)">Cateter venoso central (CVC)</option>
                            <option value="Cateter arterial">Cateter arterial</option>
                            <option value="Punção de líquor (LCR)">Punção de líquor (LCR)</option>
                            <option value="Punção de abscesso">Punção de abscesso</option>
                            <option value="Secreção de ferida operatória">Secreção de ferida operatória</option>
                            <option value="Secreção de dreno cirúrgico">Secreção de dreno cirúrgico</option>
                            <option value="Hemocultura periférica">Hemocultura periférica</option>
                            <option value="Hemocultura de cateter">Hemocultura de cateter</option>
                            <option value="Escarro (quando aplicável)">Escarro (quando aplicável)</option>
                            <option value="Fezes para cultura">Fezes para cultura</option>
                            <option value="Material de pele/lesão cutânea">Material de pele/lesão cutânea</option>
                            <option value="Secreção ocular">Secreção ocular</option>
                            <option value="Secreção ótica">Secreção ótica</option>
                            <option value="Outros">Outros</option>
                        </select>
                        {site === 'Outros' && (
                            <input type="text" value={customSite} onChange={(e) => setCustomSite(e.target.value)} placeholder="Digite o local da coleta..." className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200" required />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Microorganismo</label>
                        <select value={microorganism} onChange={e => setMicroorganism(e.target.value)} className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200" required>
                            <option value="">Selecione o microorganismo...</option>
                            <option value="Klebsiella pneumoniae">Klebsiella pneumoniae</option>
                            <option value="Escherichia coli">Escherichia coli</option>
                            <option value="Pseudomonas aeruginosa">Pseudomonas aeruginosa</option>
                            <option value="Acinetobacter baumannii">Acinetobacter baumannii</option>
                            <option value="Enterobacter cloacae complex">Enterobacter cloacae complex</option>
                            <option value="Serratia marcescens">Serratia marcescens</option>
                            <option value="Proteus mirabilis">Proteus mirabilis</option>
                            <option value="Proteus vulgaris">Proteus vulgaris</option>
                            <option value="Staphylococcus aureus">Staphylococcus aureus</option>
                            <option value="Staphylococcus epidermidis">Staphylococcus epidermidis</option>
                            <option value="Enterococcus faecalis">Enterococcus faecalis</option>
                            <option value="Enterococcus faecium">Enterococcus faecium</option>
                            <option value="Streptococcus pneumoniae">Streptococcus pneumoniae</option>
                            <option value="H. influenzae">H. influenzae</option>
                            <option value="Stenotrophomonas maltophilia">Stenotrophomonas maltophilia</option>
                            <option value="Burkholderia cepacia complex">Burkholderia cepacia complex</option>
                            <option value="Elizabethkingia meningoseptica">Elizabethkingia meningoseptica</option>
                            <option value="Myroides spp.">Myroides spp.</option>
                            <option value="Ralstonia pickettii">Ralstonia pickettii</option>
                            <option value="Outros">Outros</option>
                        </select>
                        {microorganism === 'Outros' && (
                            <input type="text" value={customMicroorganism} onChange={(e) => setCustomMicroorganism(e.target.value)} placeholder="Digite o microorganismo..." className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200" required />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Data</label>
                        <input type="date" value={collectionDate} onChange={e => setCollectionDate(e.target.value)} className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200" required />
                    </div>
                    {diagnosticosAtivos.length > 0 && (
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Diagnóstico relacionado <span className="text-slate-400 font-normal">(opcional)</span>
                            </label>
                            <div className="border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                                <div onClick={() => { setSelectedDiagnosticoId(''); setSistema(''); setSistemaOutros(''); }} className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm ${selectedDiagnosticoId === '' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${selectedDiagnosticoId === '' ? 'border-blue-500 bg-blue-500' : 'border-slate-400'}`} />
                                    Nenhum
                                </div>
                                {diagnosticosAtivos.map(d => (
                                    <div key={d.id} onClick={() => { setSelectedDiagnosticoId(d.id); if (d.sistema) { if (ALERT_SYSTEMS.includes(d.sistema)) { setSistema(d.sistema); setSistemaOutros(''); } else { setSistema('Outros'); setSistemaOutros(d.sistema); } } }} className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm border-t border-slate-200 dark:border-slate-700 ${selectedDiagnosticoId === d.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                        <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${selectedDiagnosticoId === d.id ? 'border-blue-500 bg-blue-500' : 'border-slate-400'}`} />
                                        <span>
                                            {d.label}
                                            {d.created_at && (
                                                <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                    {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(d.created_at))}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Sistema <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                        <div className="relative mt-1">
                            <select value={sistema} onChange={e => setSistema(e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200 appearance-none">
                                <option value="">Selecione...</option>
                                {ALERT_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-3 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>
                        {sistema === 'Outros' && (
                            <input type="text" value={sistemaOutros} onChange={e => setSistemaOutros(e.target.value)} placeholder="Especifique o sistema..." className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-200" />
                        )}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};
