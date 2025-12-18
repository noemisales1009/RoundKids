# 🧠 Escala de Coma de Glasgow - Guia Completo

## 📋 Resumo das Mudanças

A Escala de Coma de Glasgow foi **completamente refatorada** para funcionar perfeitamente no seu aplicativo com:

✅ **3 Faixas Etárias** - Adulto/Criança (≥5 anos), Pediátrica (≤4 anos), Lactente (<1 ano)
✅ **Tema Escuro/Claro** - Sincronizado com o contexto global do app
✅ **Design Responsivo** - Otimizado para mobile e desktop
✅ **Salvamento em Banco de Dados** - Integrado com `scale_scores` via callback
✅ **Histórico Persistente** - Aparece na aba de escalas

---

## 🎯 Como Funciona

### 1. **Menu Principal (Intro)**
- Selecione a faixa etária do paciente
- Mostra tabela de interpretação rápida
- Cores diferentes para cada faixa: amarelo (adulto), verde (criança), azul (lactente)

### 2. **Formulário (Form)**
- 3 questões: Abertura Ocular, Resposta Verbal, Resposta Motora
- Dropdown com opções específicas para cada idade
- Progresso visual com barra de preenchimento
- Score atualizado em tempo real (0-15)

### 3. **Resultado (Resultado)**
- Círculo grande mostrando a pontuação total
- Classificação: Leve (13-15), Moderado (9-12), Grave (≤8)
- Detalhamento por componente
- Botão para salvar no histórico

---

## 📊 Estrutura de Dados

### Componentes da Escala

```typescript
// OCULAR (O) - 4 pontos
1. Nenhuma
2. À dor
3. Ao som
4. Espontânea

// VERBAL (V) - 5 pontos
// Varia por idade:
// Adulto: Nenhuma → Confuso → Orientado
// Criança: Sem vocalização → Choro consolável → Balbucia adequadamente
// Lactente: Ausência sons → Choro consolável → Sons normais

// MOTORA (M) - 6 pontos
1. Nenhuma
2. Extensão anormal (Descerebração)
3. Flexão anormal (Decorticação)
4. Retirada inespecífica
5. Localiza dor (ou retirada ao toque/dor conforme idade)
6. Obedece comandos (ou movimentos espontâneos)
```

### Interpretação de Scores

| Pontuação | Classificação | Status |
|-----------|---------------|--------|
| 13-15     | Leve          | ✅ Consciência preservada, monitoramento |
| 9-12      | Moderado      | ⚠️ Rebaixamento moderado, atenção necessária |
| ≤8        | Grave         | 🚨 Coma grave, via aérea definitiva indicada |

---

## 🎨 Tema e Responsividade

### Classe CSS Adaptativa

```tsx
// Exemplo de como as cores mudam por faixa etária:
const colorConfig = {
  yellow: { bg: 'bg-yellow-600 dark:bg-yellow-700', ... },  // Adulto
  green:  { bg: 'bg-green-600 dark:bg-green-700', ... },    // Criança
  blue:   { bg: 'bg-blue-600 dark:bg-blue-700', ... },      // Lactente
};
```

### Breakpoints Responsivos

```tsx
// Exemplos de responsive design aplicados:
<h2 className="text-lg sm:text-xl font-bold" />      // 14px mobile, 20px desktop
<p className="text-xs sm:text-sm" />                  // 12px mobile, 14px desktop
<button className="py-3 sm:py-4 px-4 sm:px-6" />    // Padding adaptativo
```

### Dark Mode Automático

A escala detecta automaticamente o tema ativo via `ThemeContext`:

```tsx
const { isDark } = useContext(ThemeContext)!;

// Aplicado em todos os elementos:
className={`${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
```

---

## 💾 Integração com Banco de Dados

### Fluxo de Salvamento

```
Usuário clica "Salvar Avaliação"
       ↓
saveAssessment() é chamado
       ↓
onSaveScore callback é acionado com:
  {
    scaleName: "Glasgow - ECG Adulto/Criança",
    score: 14,
    interpretation: "Leve",
    date: "2025-12-07T14:30:00.000Z"
  }
       ↓
App.tsx → handleSaveScaleScore()
       ↓
addScaleScoreToPatient() → INSERT em scale_scores
       ↓
fetchPatients() → Atualiza patient.scaleScores
       ↓
Aparece no histórico da aba "Escalas"
```

### Tabela scale_scores

```sql
CREATE TABLE public.scale_scores (
  id BIGINT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  patient_id UUID NOT NULL,
  scale_name TEXT,           -- "Glasgow - ECG Adulto/Criança"
  score INT,                 -- 0-15
  interpretation TEXT,       -- "Leve", "Moderado", "Grave"
  date TIMESTAMP DEFAULT now()
);
```

---

## 🔄 Ciclo de Telas

```
intro (Menu principal)
  ↓
  [Seleciona faixa etária]
  ↓
form (Responde 3 perguntas)
  ↓
  [Clica "Finalizar e Ver Escore"]
  ↓
resultado (Mostra score e opções)
  ↓
  [Clica "Salvar"] → Envia para banco de dados
  ↓
[Volta automaticamente para intro após 1.5s]
```

---

## 📱 Estados da Escala

```typescript
// Estados principais:
const [tela, setTela] = useState<'intro' | 'form' | 'resultado'>('intro');
const [faixaEtaria, setFaixaEtaria] = useState<'adulto' | 'crianca' | 'lactente' | null>(null);
const [respostas, setRespostas] = useState<{ [key: string]: number | string }>({});
const [isSaving, setIsSaving] = useState(false);
const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
```

---

## ✨ Recursos Especiais

### 1. Indicador Visual de Conclusão
- Botão "Finalizar" fica **desabilitado** até responder todas as 3 perguntas
- Barra de progresso mostra quantas foram respondidas

### 2. Auto-scroll entre Perguntas
- Após responder uma pergunta, a próxima é destacada
- Scroll suave até o próximo campo

### 3. Cálculo Dinâmico de Score
- Score atualizado a cada seleção
- Interpretação muda em tempo real na header

### 4. Feedback Visual
- ✅ Ícone de check ao lado de cada pergunta respondida
- Cores mudam: seleção resalta a pergunta
- Animação ao salvar (spinner + mensagem de sucesso)

---

## 🚀 Como Usar

### No App.tsx

A escala já está importada e integrada:

```tsx
import { GlasgowScale } from './components/GlasgowScale';

// No render:
{scaleView === 'glasgow' && (
  <div className='bg-slate-800 rounded-xl overflow-hidden -m-4'>
    <button onClick={() => setScaleView('list')} className="...">
      ← Voltar para Escalas
    </button>
    <div className="p-4 pt-0">
      <GlasgowScale onSaveScore={handleSaveScaleScore} />
    </div>
  </div>
)}
```

### No Menu de Escalas

```tsx
<div onClick={() => setScaleView('glasgow')} className="...">
  <div className="flex items-center gap-3">
    <BrainIcon className="w-5 h-5" />
    <div>
      <p className="font-bold">Escala de Coma de Glasgow</p>
    </div>
  </div>
</div>
```

---

## 🧪 Testando a Escala

1. **Ir até um paciente** → Aba "Escalas"
2. **Clicar em "Escala de Coma de Glasgow"**
3. **Selecionar faixa etária** (ex: Adulto)
4. **Responder as 3 perguntas**
5. **Clicar "Finalizar e Ver Escore"**
6. **Clicar "Salvar Avaliação"**
7. **Voltar** → Ver no histórico (topo da aba escalas)

---

## 📝 Notas Importantes

- A escala é **totalmente funcional** com tema escuro/claro
- Salvamento é **assíncrono** com feedback visual
- Histórico é **persistente** em `scale_scores`
- Cada faixa etária tem **perguntas específicas** corretas para a idade
- Responsividade testada para mobile e desktop

---

## 🐛 Troubleshooting

### Escala não aparece no menu?
- Verifique se `GlasgowScale` está importado em App.tsx
- Confirme se `scaleView === 'glasgow'` está renderizando

### Score não salva?
- Verifique se `onSaveScore` está sendo passado como prop
- Confirme se `handleSaveScaleScore` existe em App.tsx
- Verifique logs do navegador (F12)

### Histórico não aparece?
- Verifique se `patient.scaleScores` está populado
- Confirme se a query em `fetchPatients()` traz `scale_scores`

---

Commit: `6b9416f` - refactor: complete Glasgow Coma Scale with 3 age groups, theme support and database integration
