import re

# Ler o arquivo
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Padrão para encontrar o bloco antigo da calculadora (com alert e document.getElementById)
# Procura desde "{/* Calculadora de Balanço Hídrico */}" até o Link do round
old_pattern = r'''(\{user\?\.\s*access_level\s*===\s*'adm'\s*\?\s*\(\s*<>\s*\{/\*\s*Calculadora de Balanço Hídrico\s*\*/\}\s*<div[^>]*>.*?Calcular Balanço.*?</div>\s*</div>\s*</div>\s*<Link)'''

# Texto de substituição - apenas o início do bloco admin com a calculadora NOVA
new_text = '''{user?.access_level === 'adm' ? (
                <>
                    {/* Calculadora de Balanço Hídrico */}
                    <div className="w-full bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-400 dark:border-cyan-700 rounded-xl p-4 mb-4">
                        <h3 className="text-base sm:text-lg font-bold text-cyan-800 dark:text-cyan-200 mb-3 flex items-center gap-2">
                            💧 Balanço Hídrico
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1">Volume (mL)</label>
                                    <input
                                        type="number"
                                        value={volumeBalanco}
                                        onChange={(e) => setVolumeBalanco(e.target.value)}
                                        placeholder="Ex: 500"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-cyan-300 dark:border-cyan-600 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        value={pesoBalanco}
                                        onChange={(e) => setPesoBalanco(e.target.value)}
                                        placeholder="Ex: 15"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-cyan-300 dark:border-cyan-600 rounded-lg text-sm text-slate-800 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            
                            {resultadoBalanco !== null && (
                                <div className={`p-3 rounded-lg text-center ${
                                    resultadoBalanco >= 0 
                                        ? 'bg-green-100 dark:bg-green-900/40 border-2 border-green-400' 
                                        : 'bg-red-100 dark:bg-red-900/40 border-2 border-red-400'
                                }`}>
                                    <p className={`text-2xl font-bold ${
                                        resultadoBalanco >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'
                                    }`}>
                                        {resultadoBalanco >= 0 ? '+' : ''}{resultadoBalanco.toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">do peso corporal</p>
                                </div>
                            )}
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCalcularBalanco}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-3 rounded-lg text-sm"
                                >
                                    Calcular
                                </button>
                                {resultadoBalanco !== null && (
                                    <button
                                        onClick={handleSalvarBalanco}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1"
                                    >
                                        <SaveIcon className="w-4 h-4" /> Salvar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {balancosHistorico.length > 0 && (
                        <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-4">
                            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">📊 Últimos Registros</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {balancosHistorico.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm">
                                        <div>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{b.volume}ml / {b.peso}kg</span>
                                            <p className="text-xs text-slate-400">{new Date(b.data_registro).toLocaleString('pt-BR')}</p>
                                        </div>
                                        <span className={`font-bold px-2 py-1 rounded ${
                                            b.resultado >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {b.resultado >= 0 ? '+' : ''}{b.resultado?.toFixed(2)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <Link'''

# Procurar e substituir usando uma abordagem mais simples
# Encontrar o bloco que começa com a calculadora antiga e vai até o Link
start_marker = "{user?.access_level === 'adm' ? (\n                <>\n                    {/* Calculadora de Balanço Hídrico */}\n                    <div className=\"w-full bg-gradient-to-r from-blue-50 to-cyan-50"
end_marker = "                    <Link"

if start_marker in content:
    start_idx = content.find(start_marker)
    # Procurar o primeiro <Link após o start
    search_from = start_idx + len(start_marker)
    end_idx = content.find(end_marker, search_from)
    
    if end_idx > start_idx:
        old_block = content[start_idx:end_idx]
        content = content[:start_idx] + new_text + content[end_idx + len(end_marker):]
        
        # Salvar
        with open('App.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ Calculadora antiga substituída com sucesso!")
    else:
        print("❌ Não encontrou o fim do bloco")
else:
    print("❌ Não encontrou o início do bloco antigo")
    print("Procurando por 'document.getElementById'...")
    if "document.getElementById('volumeBalanco')" in content:
        print("  -> Encontrado document.getElementById!")
    if "alert(`Resultado" in content:
        print("  -> Encontrado alert com Resultado!")
