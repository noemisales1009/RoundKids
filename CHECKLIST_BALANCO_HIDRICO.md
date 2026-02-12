# ✅ CHECKLIST PRÁTICO - Implementação Balanço Hídrico

## 🎯 Objetivo
Implementar sistema completo de Balanço Hídrico em 3 passos: SQL → Testes → React

---

## 📋 PASSO 1: BANCO DE DADOS (⏱️ 5 minutos)

- [ ] **1.1 - Preparar Arquivo SQL**
  ```
  Arquivo: CREATE_BALANCO_HIDRICO_TABLES.sql
  Local: c:/Users/noemi.sales/Documents/RoundiKids/RoundKids/
  Status: ✓ Criado
  ```

- [ ] **1.2 - Acessar Supabase**
  ```
  1. Abra: https://app.supabase.com
  2. Faça login
  3. Abra o projeto RoundKids
  ```

- [ ] **1.3 - Ir para SQL Editor**
  ```
  1. Menu esquerdo → SQL Editor
  2. Clique em "New Query"
  3. Copie todo conteúdo de CREATE_BALANCO_HIDRICO_TABLES.sql
  4. Cole no editor
  ```

- [ ] **1.4 - Executar SQL**
  ```
  1. Clique no botão "Run" (ou Ctrl+Enter)
  2. Aguarde alguns segundos
  3. Verifique se há erros
  ```

- [ ] **1.5 - Validar Execução**
  ```sql
  Copie e execute estas 3 queries para validar:
  
  -- Query 1: Ver quantos registros
  SELECT COUNT(*) FROM balanco_hidrico;
  
  -- Query 2: Ver estrutura
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'balanco_hidrico';
  
  -- Query 3: Ver views
  SELECT table_name FROM information_schema.views 
  WHERE table_name LIKE 'vw_balanco%';
  ```

**Resultado Esperado:**
```
✓ Query 1: 0 (nenhum registro ainda)
✓ Query 2: 9 colunas (id, patient_id, volume, peso, tipo, resultado, etc)
✓ Query 3: 3 views (vw_balanco_diario, vw_resumo_balanco, vw_balanco_historico_com_usuario)
```

**Se tudo OK:** ✅ **PRÓXIMO PASSO**  
**Se erro:** ⚠️ Veja "Troubleshooting" ao final

---

## 🧪 PASSO 2: TESTES (⏱️ 5 minutos)

- [ ] **2.1 - Abrir Arquivo de Testes**
  ```
  Arquivo: TESTES_BALANCO_HIDRICO.sql
  Local: c:/Users/noemi.sales/Documents/RoundiKids/RoundKids/
  Status: ✓ Criado
  ```

- [ ] **2.2 - Copiar Testes para Supabase**
  ```
  1. No Supabase SQL Editor, clique "New Query" (ou clear atual)
  2. Copie conteúdo de TESTES_BALANCO_HIDRICO.sql
  3. Cole no editor
  ```

- [ ] **2.3 - Executar Seção 1 - TESTES DE ESTRUTURA**
  ```sql
  -- Execute a seção "1. TESTES DE ESTRUTURA" (linhas 1-50)
  -- Verifique cada resultado
  ```

  **Esperado:**
  ```
  ✓ Tabela existe
  ✓ Todas as colunas criadas
  ✓ Constraints OK
  ✓ Índices criados
  ✓ Views criadas
  ✓ RLS habilitado
  ✓ Policies criadas
  ```

- [ ] **2.4 - Executar Seção 2 - INSERIR DADOS DE TESTE**
  ```sql
  -- Execute a seção "2. INSERIR DADOS DE TESTE"
  -- Copie os UUIDs corretos:
  
  -- Encontre um patient_id válido:
  SELECT id FROM patients LIMIT 1;
  
  -- Encontre um user_id válido:
  SELECT id FROM users LIMIT 1;
  
  -- Depois adapte o INSERT e execute
  ```

  **Esperado:**
  ```
  ✓ 4 registros inseridos sem erro
  ✓ Mensagem: "INSERT 0 4"
  ```

- [ ] **2.5 - Executar Seção 3 - TESTES DE VIEWS**
  ```sql
  -- Execute a seção "3. TESTES DE VIEWS"
  -- Deve mostrar dados dos registros criados
  ```

  **Esperado:**
  ```
  ✓ vw_balanco_diario: 2 linhas (2 dias)
  ✓ vw_resumo_balanco: 2 linhas com classificação
  ✓ vw_balanco_historico_com_usuario: 4 linhas
  ```

- [ ] **2.6 - Executar Seção 4 - TESTES DE CÁLCULOS**
  ```sql
  -- Execute a seção "4. TESTES DE CÁLCULOS"
  -- Valida se a fórmula está correta
  ```

  **Esperado:**
  ```
  ✓ Todos os cálculos com status "✓ OK"
  ✓ Nenhum "✗ ERRO DE CÁLCULO"
  ```

**Se tudo OK:** ✅ **PRÓXIMO PASSO**  
**Se erro:** ⚠️ Execute seção "10. RESUMO FINAL" para debug

---

## 💻 PASSO 3: COMPONENTE REACT (⏱️ 15 minutos)

### 3.1 - Verificar Componente Criado

- [ ] **3.1.1 - Confirmar arquivo existe**
  ```
  Local: components/BalanceHydricResume.tsx
  Tamanho: ~350 linhas
  Status: ✓ Criado
  ```

- [ ] **3.1.2 - Revisar conteúdo do arquivo**
  ```
  Abra component/BalanceHydricResume.tsx
  Verifique se tem:
  ✓ Import React e Supabase
  ✓ Interface com patientId prop
  ✓ useEffect para buscar dados
  ✓ Renderização com Tailwind CSS
  ✓ Tratamento de loading
  ✓ Exibição de alertas
  ```

### 3.2 - Adicionar ao App

- [ ] **3.2.1 - Localizar componente principal do paciente**
  ```
  Arquivo onde você quer adicionar:
  Exemplos:
    - App.tsx (se tem dashboard)
    - PatientPage.tsx
    - PatientDashboard.tsx
    - DiagnosticsSection.tsx
  
  Procure por uma linha assim:
  <FluidBalanceCalc patientId={patientId} />
  ```

- [ ] **3.2.2 - Adicionar Import**
  ```tsx
  // No topo do arquivo, adicione:
  import BalanceHydricResume from './components/BalanceHydricResume';
  ```

- [ ] **3.2.3 - Adicionar Componente ao JSX**
  ```tsx
  // Onde você vê FluidBalanceCalc, adicione abaixo:
  
  <div className="my-4">
    <BalanceHydricResume patientId={patientId} />
  </div>
  
  // Exemplo completo:
  {/* Seção de Balanço Hídrico */}
  <FluidBalanceCalc patientId={patientId} />
  
  {/* 👇 ADICIONE ISTO: */}
  <BalanceHydricResume patientId={patientId} />
  ```

- [ ] **3.2.4 - Salvar arquivo**
  ```
  Ctrl+S
  ```

- [ ] **3.2.5 - Verificar erros de TypeScript**
  ```
  Abra terminal VS Code
  Veja se há erros vermelhos (deve ter 0)
  
  Se houver erro de import:
  ✓ Verifique caminho do arquivo
  ✓ Certifique-se que arquivo .tsx existe
  ✓ Verifique extensão (.tsx e não .ts)
  ```

### 3.3 - Testar na Navegador

- [ ] **3.3.1 - Abrir página do paciente**
  ```
  1. Inicie o servidor: npm run dev
  2. Abra http://localhost:5173 (ou sua porta)
  3. Navegue para um paciente
  ```

- [ ] **3.3.2 - Procurar componente na página**
  ```
  Procure por:
  ✓ Ícone de gota (💧) ou "Balanço Hídrico"
  ✓ Card expandível com informações
  ✓ Se vazio: "Nenhum cálculo registrado"
  ```

- [ ] **3.3.3 - Inserir dados de teste**
  ```
  1. Se outro componente FluidBalanceCalc existe:
     - Clique para expandir
     - Preencha:
       • Peso: 70 kg
       • Volume: 500 mL
       • Tipo: Positivo
     - Clique "Salvar"
     
  2. Aguarde 2-3 segundos
  3. Veja se BalanceHydricResume atualiza
  ```

- [ ] **3.3.4 - Expandir BalanceHydricResume**
  ```
  1. Clique no card BalanceHydricResume
  2. Deve expandir mostrando:
     ✓ "Dados de Hoje"
     ✓ "Dia Anterior" (se houver dado anterior)
     ✓ "Balanço Hídrico Cumulativo"
     ✓ "Histórico (últimos 7 dias)"
  ```

- [ ] **3.3.5 - Verificar cálculos corretos**
  ```
  Valores inseridos: 500 mL entrada, 70 kg
  Esperado: 500 ÷ (70 × 10) = 0.71
  
  Veja no componente se mostrar:
  ✓ BH do Dia: +500 mL
  ✓ Status: Superávit (se > 0)
  ```

- [ ] **3.3.6 - Abrir DevTools para verificar erros**
  ```
  F12 → Aba "Console"
  Verifique se há erros vermelhos
  
  Se aparecer erro:
  - Anote a mensagem
  - Procure nos Troubleshooting
  - Se necessário, execute TESTES_BALANCO_HIDRICO.sql de novo
  ```

**Se tudo OK:** ✅ **TUDO PRONTO!**  
**Se erro:** ⚠️ Veja seção "Troubleshooting"

---

## 🐛 TROUBLESHOOTING

### ❌ Erro na Execução do SQL

**"ERROR: relation balanco_hidrico already exists"**
```sql
-- Solução:
DROP TABLE IF EXISTS balanco_hidrico CASCADE;
-- Depois execute CREATE_BALANCO_HIDRICO_TABLES.sql novamente
```

**"ERROR: foreign key constraint failed"**
```
-- Causa: patient_id ou user_id não existem
-- Solução:
SELECT COUNT(*) FROM patients;      -- Deve ser > 0
SELECT COUNT(*) FROM users;         -- Deve ser > 0
-- Se ambos são 0, crie dados de teste primeiro
```

---

### ❌ Erro ao Adicionar Componente React

**"Cannot find module ./components/BalanceHydricResume"**
```
-- Verificar:
1. Caminho do arquivo está correto? (case-sensitive no Linux!)
2. Extensão é .tsx? (não .ts)
3. Arquivo realmente existe?
```

**"Property 'patientId' is missing"**
```tsx
-- Solução: Adicionar prop
<BalanceHydricResume patientId={patientId} />
//                   ^^^^^^^ obrigatório
```

---

### ❌ Componente não mostra dados

**"Nenhum cálculo registrado ainda"**
```
-- Significa: OK! Banco vazio
-- Solução: Insira dados via FluidBalanceCalc
1. Clique em FluidBalanceCalc
2. Preencha os dados
3. Clique "Salvar"
4. BalanceHydricResume deve atualizar
```

**Componente mostra loading infinito**
```
-- Cause: Query não volta dados
-- Debug:
1. Abra DevTools (F12)
2. Console → veja se há erro
3. Execute no Supabase:
   SELECT * FROM vw_resumo_balanco LIMIT 1;
4. Se vazio, insira dados de teste
```

---

### ⚠️ Avisos (Não são erros)

**"TypeScript warning: unused variable"**
→ Ignora, é normal

**"React warning: useEffect missing dependency"**
→ Ignora, está configurado corretamente

**"Console: Component rendered but not visible"**
→ Normal se nenhum dado foi registrado

---

## 📊 CHECKLIST FINAL

```
PARTE 1 - BANCO DE DADOS
  ✅ SQL executado sem erros
  ✅ Queries de validação rodaram OK
  ✅ 3 Views criadas
  ✅ 3 Índices criados
  ✅ RLS ativo

PARTE 2 - TESTES
  ✅ Estrutura verificada
  ✅ Dados de teste inseridos
  ✅ Views retornam dados
  ✅ Cálculos estão corretos
  ✅ Performance OK

PARTE 3 - REACT
  ✅ Arquivo BalanceHydricResume.tsx existe
  ✅ Import adicionado ao componente
  ✅ Componente renderiza na página
  ✅ Dados aparecem correto
  ✅ Sem erros no console DevTools

GLOBAL
  ✅ Documentação lida
  ✅ Equipe treinada (opcional)
  ✅ Prontos para produção
```

---

## 🚀 PRÓXIMOS PASSOS

Após completar tudo:

- [ ] **Adicionar ao Menu** (opcional)
  Se quiser um menu específico para Balanço Hídrico

- [ ] **Criar Relatórios** (opcional)
  Exportar para PDF/Excel

- [ ] **Alertas por Email** (opcional)
  Notificar quando BH > ±500mL

- [ ] **Treinamento** (optional)
  Treinar equipe de saúde

- [ ] **Deploy** (production)
  Enviar para ambiente de produção

---

## 📞 SUPORTE DURANTE IMPLEMENTAÇÃO

| Problema | Solução Rápida | Arquivo |
|----------|---|---|
| Erro SQL | Execute TESTES_BALANCO_HIDRICO.sql | SQL Testes |
| Entender fluxo | Leia RESUMO_IMPLEMENTACAO_BALANCO_HIDRICO.md | Resumo |
| Conceitos médicos | Leia GUIA_COMPLETO_BALANCO_HIDRICO.md | Guia |
| Detalhes técnicos | Leia INSTRUCOES_IMPLEMENTACAO_BALANCO_HIDRICO.md | Instruções |
| Tudo junto | Procure em INDICE_BALANCO_HIDRICO.md | Índice |

---

## ⏱️ TEMPO TOTAL ESTIMADO

```
Passo 1 (SQL):          5 minutos ✓
Passo 2 (Testes):       5 minutos ✓
Passo 3 (React):       15 minutos ✓
─────────────────────────────────
TOTAL:                 25 minutos ✓

Com leitura de docs:   +20 minutos
Com troubleshooting:   +10 minutos (se necessário)

TEMPO MÁXIMO: 1 hora
```

---

## ✅ VOCÊ COMPLETOU TUDO?

Se respondeu SIM a todos os itens acima:

🎉 **PARABÉNS! Sistema de Balanço Hídrico está pronto!**

Próximo passo: Use com pacientes em produção

Dúvidas? Consulte: `INDICE_BALANCO_HIDRICO.md`

---

**Versão:** 1.0  
**Criado:** 11 de Fevereiro de 2026  
**Status:** ✅ Pronto para Uso
