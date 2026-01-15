import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext } from '../../../contexts';
import { Culture } from '../../../types';
import { CloseIcon } from '../../icons';

export const EditCultureModal: React.FC<{ culture: Culture; patientId: number | string; onClose: () => void; }> = ({ culture, patientId, onClose }) => {
    const { updateCultureInPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;

    const [site, setSite] = useState(culture.site);
    const [customSite, setCustomSite] = useState('');
    const [microorganism, setMicroorganism] = useState(culture.microorganism);
    const [customMicroorganism, setCustomMicroorganism] = useState('');
    const [collectionDate, setCollectionDate] = useState(culture.collectionDate);
    const [observation, setObservation] = useState(culture.observation || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSite = site === 'Outros' ? customSite : site;
        const finalMicroorganism = microorganism === 'Outros' ? customMicroorganism : microorganism;
        
        if (!finalSite || !finalMicroorganism || !collectionDate) return;
        updateCultureInPatient(patientId, { ...culture, site: finalSite, microorganism: finalMicroorganism, collectionDate, observation: observation || undefined });
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
                        <select
                            value={site}
                            onChange={e => setSite(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        >
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
                            <input
                                type="text"
                                value={customSite}
                                onChange={(e) => setCustomSite(e.target.value)}
                                placeholder="Digite o local da coleta..."
                                className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                required
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Microorganismo</label>
                        <select
                            value={microorganism}
                            onChange={e => setMicroorganism(e.target.value)}
                            className="mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                            required
                        >
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
                            <option value="Stenotrophomonas maltophilia">Stenotrophomonas maltophilia</option>
                            <option value="Burkholderia cepacia complex">Burkholderia cepacia complex</option>
                            <option value="Elizabethkingia meningoseptica">Elizabethkingia meningoseptica</option>
                            <option value="Myroides spp.">Myroides spp.</option>
                            <option value="Ralstonia pickettii">Ralstonia pickettii</option>
                            <option value="Outros">Outros</option>
                        </select>
                        {microorganism === 'Outros' && (
                            <input
                                type="text"
                                value={customMicroorganism}
                                onChange={(e) => setCustomMicroorganism(e.target.value)}
                                placeholder="Digite o microorganismo..."
                                className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                required
                            />
                        )}
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
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Observações <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                        <textarea
                            value={observation}
                            onChange={e => setObservation(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 dark:border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200 resize-none"
                            placeholder="Adicionar observações sobre a cultura..."
                            rows={3}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base">Salvar Alterações</button>
                </form>
            </div>
        </div>
    );
};
