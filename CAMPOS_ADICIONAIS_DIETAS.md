/* CAMPOS ADICIONAIS PARA ADICIONAR NOS MODALS AddDietModal e EditDietModal */

/* Após o campo VET, adicione: */
<div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        VET Pleno [kcal/dia] <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span>
    </label>
    <input
        type="text"
        value={vetPleno}
        onChange={(e) => setVetPleno(e.target.value)}
        placeholder="Ex: 2000"
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
    />
</div>

/* Após o campo PT [g/dia], adicione: */
<div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        PT (g/dia) <span className="text-slate-500 dark:text-slate-400 font-normal">(opcional)</span>
    </label>
    <input
        type="text"
        value={ptGDia}
        onChange={(e) => setPtGDia(e.target.value)}
        placeholder="Ex: 65"
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200"
    />
</div>

/* IMPORTANTE: 
- No AddDietModal (linha ~2092) adicione após o campo VET
- No EditDietModal (procurar por "EditDietModal") adicione após o campo VET também
*/
