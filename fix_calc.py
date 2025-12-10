import re

# Ler o arquivo
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar o bloco antigo
# Começa com "<>" seguido de "{/* Calculadora de Balanço Hídrico */}"
# Termina com "</div>\n\n" seguido de "<Link to="

old_pattern = r'(\s*<>\s*\{/\* Calculadora de Balanço Hídrico \*/\}.*?</div>\s*</div>\s*</div>\s*\n\s*\n)(\s*<Link to=)'

# Novo bloco
new_block = '''                <>
                    {/* Calculadora de Balanço Hídrico */}
                    <div className="w-full bg-slate-900 border-2 border-amber-500 rounded-xl p-4 mb-4">
                        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-3">
                            💧 Balanço Hídrico
                        </h3>
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
                            {resultadoBalanco !== null && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={resultadoBalanco >= 0 ? "text-green-400" : "text-red-400"}>✓</span>
                                        <span className="text-slate-200">
                                            Balanço: <strong className={resultadoBalanco >= 0 ? "text-green-400" : "text-red-400"}>
                                                {resultadoBalanco >= 0 ? "+" : ""}{resultadoBalanco.toFixed(2)}%
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

'''

# Fazer a substituição
new_content = re.sub(old_pattern, new_block + r'\2', content, flags=re.DOTALL)

if new_content == content:
    print("Padrão não encontrado! Tentando abordagem alternativa...")
    
    # Abordagem por índice
    start_marker = "Calculadora de Balanço Hídrico"
    start_idx = content.find(start_marker)
    
    if start_idx == -1:
        print("Marcador de início não encontrado!")
        exit(1)
    
    # Voltar para encontrar o "<>" anterior
    real_start = content.rfind("<>", 0, start_idx)
    # Ajustar para pegar o início da linha
    real_start = content.rfind("\n", 0, real_start) + 1
    
    # Encontrar o fim (antes do <Link)
    link_marker = '<Link to={`/patient/${patient.id}/round/categories`}'
    link_idx = content.find(link_marker, start_idx)
    
    if link_idx == -1:
        print("Marcador de fim não encontrado!")
        exit(1)
    
    # Voltar para a linha anterior
    end_idx = content.rfind("\n", 0, link_idx) + 1
    
    print(f"Start: {real_start}, End: {end_idx}")
    print(f"Bloco antigo tem {end_idx - real_start} caracteres")
    
    # Substituir
    new_content = content[:real_start] + new_block + content[end_idx:]

# Verificar se a substituição funcionou
if "handleCalcularBalanco" in new_content and "alert(`Resultado" not in new_content:
    with open('App.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Arquivo atualizado com sucesso!")
else:
    print("Erro na substituição - o alert ainda existe ou handleCalcularBalanco não foi adicionado")
