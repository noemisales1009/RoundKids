# 🚀 Instruções de Implementação - Balanço Hídrico

## Passo 1: Executar o SQL

Execute o arquivo `CREATE_BALANCO_HIDRICO_TABLES.sql` no seu banco de dados Supabase:

```bash
# Opção 1: Via Supabase Console
1. Vá para: https://app.supabase.com
2. Abra o SQL Editor
3. Cole o conteúdo de CREATE_BALANCO_HIDRICO_TABLES.sql
4. Clique em "Run"

# Opção 2: Via psql (terminal)
psql -h seu-host.supabase.co -U postgres -d seu-db -f CREATE_BALANCO_HIDRICO_TABLES.sql
```

## Passo 2: Verificar Criação

Execute estas queries para verificar se tudo foi criado corretamente:

```sql
-- Verificar tabela
SELECT * FROM information_schema.tables 
WHERE table_name = 'balanco_hidrico';

-- Verificar views
SELECT * FROM information_schema.views 
WHERE table_name IN (
  'vw_balanco_diario',
  'vw_resumo_balanco',
  'vw_balanco_historico_com_usuario'
);

-- Verificar índices
SELECT * FROM pg_indexes 
WHERE tablename = 'balanco_hidrico';

-- Verificar RLS
SELECT * FROM pg_policies 
WHERE tablename = 'balanco_hidrico';
```

## Passo 3: Adicionar Componentes ao Projeto

### 3.1 Copiar novo componente
```bash
# O arquivo já está em:
components/BalanceHydricResume.tsx
```

### 3.2 Atualizar imports no App.tsx (se necessário)

```tsx
import BalanceHydricResume from './components/BalanceHydricResume';
```

## Passo 4: Usar nos Componentes

### Exemplo 1: Dashboard do Paciente

```tsx
// Em qualquer componente que exiba dados do paciente
import FluidBalanceCalc from './components/FluidBalanceCalc';
import DiuresisCalc from './components/DiuresisCalc';
import BalanceHydricResume from './components/BalanceHydricResume';

export function PatientPage({ patientId }) {
  const [lastUpdate, setLastUpdate] = useState(0);

  const handleRefresh = () => {
    setLastUpdate(Date.now());
  };

  return (
    <div className="space-y-4 p-4">
      {/* Seção de Entrada de Dados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FluidBalanceCalc 
          patientId={patientId}
          onCalculationSaved={handleRefresh}
        />
        <DiuresisCalc 
          patientId={patientId}
          onCalculationSaved={handleRefresh}
        />
      </div>

      {/* Seção de Resumo e Análise */}
      <BalanceHydricResume patientId={patientId} />
    </div>
  );
}
```

### Exemplo 2: Modal ou Card Específico

```tsx
import BalanceHydricResume from './components/BalanceHydricResume';

export function BalanceHydricModal({ patientId, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Balanço Hídrico</h2>
        <BalanceHydricResume patientId={patientId} />
        <button 
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
```

## Passo 5: Testar a Implementação

### 5.1 Inserir dados de teste

```sql
-- Inserir um registro de teste
INSERT INTO balanco_hidrico (
  patient_id, 
  volume, 
  peso, 
  tipo, 
  descricao
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- UUID do paciente
  500,
  70,
  'Positivo',
  'Soro fisiológico 500mL'
);

-- Verificar os dados
SELECT * FROM vw_resumo_balanco 
WHERE patient_id = '550e8400-e29b-41d4-a716-446655440000';
```

### 5.2 Verificar cálculos

```sql
-- Ver o resultado do cálculo
SELECT 
  id,
  patient_id,
  volume,
  peso,
  tipo,
  resultado,
  data_registro
FROM balanco_hidrico
ORDER BY created_at DESC
LIMIT 10;

-- Ver resumo diário
SELECT * FROM vw_balanco_diario
ORDER BY dia DESC
LIMIT 7;

-- Ver resumo com cumulativo
SELECT * FROM vw_resumo_balanco
ORDER BY dia DESC
LIMIT 7;
```

### 5.3 Testar na Interface

1. Abra a página do paciente
2. Localize o componente `FluidBalanceCalc`
3. Preencha:
   - Peso: 70 kg
   - Volume: 500 mL
   - Tipo: Positivo
4. Clique em "Salvar"
5. Verifique se apareceu em `BalanceHydricResume`

## Passo 6: Validação de RLS

Se você usa Row Level Security, teste:

```sql
-- Como usuário com clinic_id = 1
SELECT * FROM balanco_hidrico;

-- Deve retornar apenas registros de pacientes da clínica 1
-- Se retornar registros de outras clínicas, há problema de RLS
```

## Troubleshooting

### Problema: Tabela já existe

**Erro:** `ERROR: relation "balanco_hidrico" already exists`

**Solução:**
```sql
DROP TABLE IF EXISTS balanco_hidrico CASCADE;
-- Depois execute novamente o SQL
```

### Problema: FK constraint violation

**Erro:** `ERROR: insert or update on table "balanco_hidrico" violates foreign key`

**Solução:**
```sql
-- Verifique se o patient_id existe
SELECT id FROM patients WHERE id = 'seu_uuid';

-- Verifique se o created_by é user válido
SELECT id FROM users WHERE id = 'seu_uuid';
```

### Problema: View retorna vazia

**Causa:** Pode não ter dados registrados ainda

**Solução:**
```sql
-- Inserir dados de teste primeiro
INSERT INTO balanco_hidrico (patient_id, volume, peso, tipo)
VALUES ('seu-uuid', 500, 70, 'Positivo');

-- Depois consultar a view
SELECT * FROM vw_resumo_balanco;
```

### Problema: Componente não carrega dados

**Debug no console React:**
```tsx
// Adicione logs no BalanceHydricResume
const fetchBalanceData = async () => {
  try {
    console.log('Buscando dados para patient_id:', patientId);
    
    const { data, error } = await supabase
      .from('vw_resumo_balanco')
      .select('*')
      .eq('patient_id', patientId);
    
    console.log('Resposta:', { data, error });
    setData(data || []);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## Performance

### Índices Criados
- ✅ `idx_balanco_hidrico_patient_id` - Para filtrar por paciente
- ✅ `idx_balanco_hidrico_data_registro` - Para ordenação por data
- ✅ `idx_balanco_hidrico_patient_data` - Para consultas combinadas

### Monitoramento de Performance

```sql
-- Ver tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('balanco_hidrico')) AS tamanho;

-- Ver índices mais usados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'balanco_hidrico'
ORDER BY idx_scan DESC;
```

## Proximos Passos

- [ ] Adicionar export para PDF/Excel dos dados
- [ ] Criar gráficos de tendência com Chart.js
- [ ] Implementar alertas via email
- [ ] Adicionar comparação com valores de referência por diagnóstico
- [ ] Criar relatório diário automático

---

## 📞 Checklist Final

- [x] SQL executado com sucesso
- [x] Tabelas verificadas
- [x] Views funcionando
- [x] RLS configurado (se aplicável)
- [x] Componentes adicionados ao projeto
- [x] Dados de teste inseridos
- [x] Componentes testados na UI
- [ ] Testes de carga executados
- [ ] Documentação do usuário final criada
- [ ] Deploy em produção
