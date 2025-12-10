# Script para substituir a calculadora antiga pela nova
$content = [System.IO.File]::ReadAllText("App.tsx")

# Encontrar o texto específico para substituir
$oldPattern = @'
                <>
                    {/* Calculadora de Balanço Hídrico */}
                    <div className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                            <span className="text-xl">⚖️</span> Calculadora de Balanço Hídrico
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Volume do Balanço (mL)</label>
                                    <input
                                        type="number"
                                        id="volumeBalanco"
                                        placeholder="Ex: 500"
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200 font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Peso (kg)</label>
                                    <input
                                        type="number"
                                        id="pesoBalanco"
                                        placeholder="Ex: 15"
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-slate-800 dark:text-slate-200 font-semibold"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const volume = parseFloat((document.getElementById('volumeBalanco') as HTMLInputElement)?.value || '0');
                                    const peso = parseFloat((document.getElementById('pesoBalanco') as HTMLInputElement)?.value || '0');
                                    
                                    if (peso === 0) {
                                        alert('Por favor, insira o peso do paciente');
                                        return;
                                    }
                                    
                                    const resultado = (volume / (peso * 10)) * 100;
                                    const resultadoFormatado = resultado.toFixed(2);
                                    const sinal = resultado >= 0 ? '+' : '';
                                    
                                    alert(`Resultado do Balanço Hídrico:\n\n${sinal}${resultadoFormatado}%\n\nFórmula: (${volume} ÷ (${peso} × 10)) × 100`);
                                }}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base"
                            >
                                Calcular Balanço
                            </button>
                            <div className="bg-white dark:bg-slate-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                                    <span className="font-semibold">Fórmula:</span> Volume ÷ (Peso × 10) × 100
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-1">
                                    Resultado positivo: ganho de líquido | Resultado negativo: perda de líquido
                                </p>
                            </div>
                        </div>
                    </div>
                    
'@

$newBlock = @'
                <>
                    {/* Calculadora de Balanço Hídrico */}
                    <div className="w-full bg-slate-900 dark:bg-slate-900 border-2 border-amber-500 dark:border-amber-600 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                                💧 Balanço Hídrico
                            </h3>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-cyan-400 mb-1">Volume (mL)</label>
                                    <input
                                        type="number"
                                        value={volumeBalanco}
                                        onChange={(e) => setVolumeBalanco(e.target.value)}
                                        placeholder="Ex: 500"
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-cyan-400 mb-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        value={pesoBalanco}
                                        onChange={(e) => setPesoBalanco(e.target.value)}
                                        placeholder="Ex: 15"
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleCalcularBalanco}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-lg text-sm"
                            >
                                Calcular
                            </button>
                            
                            {/* Resultado no estilo de lista como comorbidades */}
                            {resultadoBalanco !== null && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`${resultadoBalanco >= 0 ? 'text-green-400' : 'text-red-400'}`}>✓</span>
                                        <span className="text-slate-200">
                                            Balanço: <strong className={`${resultadoBalanco >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {resultadoBalanco >= 0 ? '+' : ''}{resultadoBalanco.toFixed(2)}%
                                            </strong> do peso corporal
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-cyan-400">✓</span>
                                        <span className="text-sm text-slate-400">
                                            Volume: {volumeBalanco} mL | Peso: {pesoBalanco} kg
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {resultadoBalanco !== null && (
                                <button
                                    onClick={handleSalvarBalanco}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                                >
                                    <SaveIcon className="w-4 h-4" /> Salvar Balanço
                                </button>
                            )}
                        </div>
                    </div>
                    
'@

if ($content.Contains($oldPattern)) {
    $content = $content.Replace($oldPattern, $newBlock)
    [System.IO.File]::WriteAllText("App.tsx", $content, [System.Text.Encoding]::UTF8)
    Write-Host "Arquivo atualizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Padrao antigo nao encontrado!" -ForegroundColor Red
}
