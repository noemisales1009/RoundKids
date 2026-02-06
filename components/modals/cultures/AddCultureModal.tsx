import React, { useState, useContext } from 'react';
import { PatientsContext, NotificationContext, UserContext } from '../../../contexts';
import { CloseIcon } from '../../icons';
import { getTodayDateString } from '../../../constants';

export const AddCultureModal: React.FC<{ patientId: number | string; onClose: () => void }> = ({ patientId, onClose }) => {
    const { addCultureToPatient } = useContext(PatientsContext)!;
    const { showNotification } = useContext(NotificationContext)!;
    const { user } = useContext(UserContext)!;
    const [site, setSite] = useState('');
    const [customSite, setCustomSite] = useState('');
    const [microorganism, setMicroorganism] = useState('');
    const [customMicroorganism, setCustomMicroorganism] = useState('');
    const [collectionDate, setCollectionDate] = useState(getTodayDateString());
    const [observation, setObservation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSite = site === 'Outros' ? customSite : site;
        const finalMicroorganism = microorganism === 'Outros' ? customMicroorganism : microorganism;
        
        if (!finalSite || !finalMicroorganism || !collectionDate) return;
        
        if (!user?.id) {
            console.error('⚠️ User não está autenticado!');
            showNotification({ message: 'Erro: Usuário não autenticado', type: 'error' });
            return;
        }
        
        console.log('👤 User ID no AddCultureModal:', user.id);
        addCultureToPatient(patientId, { site: finalSite, microorganism: finalMicroorganism, collectionDate, observation: observation || undefined }, user.id);
        showNotification({ message: 'Cultura cadastrada com sucesso!', type: 'success' });
        onClose();
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
                            <select
                                value={site}
                                onChange={(e) => setSite(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
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
                                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Microorganismo</label>
                            <select
                                value={microorganism}
                                onChange={(e) => setMicroorganism(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
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
                                <option value="H. influenzae">H. influenzae</option>
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
                                    className="mt-2 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
                                    required
                                />
                            )}
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
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span></label>
                            <textarea
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200 resize-none"
                                placeholder="Adicionar observações sobre a cultura..."
                                rows={3}
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
