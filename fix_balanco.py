import re

# Ler arquivo
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar e remover o bloco antigo da calculadora (que usa id="volumeBalanco" e alert)
# O bloco começa com {user?.access_level === 'adm' ? (<> e termina antes do próximo Link

# Padrão para encontrar a calculadora antiga com alert
old_start = content.find('id="volumeBalanco"')
if old_start == -1:
    print("Bloco antigo NAO encontrado!")
    exit()

print(f"Encontrado id='volumeBalanco' na posição {old_start}")

# Encontrar o início do bloco (linha com Calculadora de Balanço Hídrico)
search_start = content.rfind('{/* Calculadora de Balanço Hídrico */}', 0, old_start)
if search_start == -1:
    # Tenta sem as chaves
    search_start = content.rfind('Calculadora de Balanço Hídrico', 0, old_start)
    
print(f"Início do comentário na posição {search_start}")

# Encontrar o final do bloco (perda de líquido</p></div></div></div>)
search_end = content.find('perda de líquido', old_start)
if search_end != -1:
    # Avançar até fechar as divs
    search_end = content.find('</div>', search_end)
    search_end = content.find('</div>', search_end + 6)
    search_end = content.find('</div>', search_end + 6)
    search_end += 6  # incluir o </div> final

print(f"Fim do bloco na posição {search_end}")

# Encontrar o início real (o {user?.access_level... antes do comentário)
real_start = content.rfind("{user?.access_level === 'adm' ? (", 0, search_start)
# Voltar para pegar o tab
real_start = content.rfind('\n', 0, real_start) + 1

print(f"Início real na posição {real_start}")

# Extrair o bloco antigo
old_block = content[real_start:search_end]
print("\n=== BLOCO ANTIGO A SER REMOVIDO ===")
print(old_block[:500])
print("...")
print(old_block[-200:])

# Novo bloco (versão correta)
new_block = """            {user?.access_level === 'adm' ? (
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
                                <div className={`p-3 rounded-lg text-center ${resultadoBalanco >= 0 ? 'bg-green-100 dark:bg-green-900/40 border-2 border-green-400' : 'bg-red-100 dark:bg-red-900/40 border-2 border-red-400'}`}>
                                    <p className={`text-2xl font-bold ${resultadoBalanco >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                                        {resultadoBalanco >= 0 ? '+' : ''}{resultadoBalanco.toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">do peso corporal</p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button onClick={handleCalcularBalanco} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-3 rounded-lg text-sm">Calcular</button>
                                {resultadoBalanco !== null && (
                                    <button onClick={handleSalvarBalanco} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1">
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
                                        <span className={`font-bold px-2 py-1 rounded ${b.resultado >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'}`}>
                                            {b.resultado >= 0 ? '+' : ''}{b.resultado?.toFixed(2)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}"""

# Substituir
new_content = content[:real_start] + new_block + content[search_end:]

# Salvar
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\n✅ Arquivo atualizado com sucesso!")
