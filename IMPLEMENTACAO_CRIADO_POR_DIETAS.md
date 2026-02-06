## 🎯 Implementação: Rastreamento de Criador de Dietas

### ✅ O que foi implementado

#### 1. **Tabela SQL Corrigida** (`CREATE_DIETAS_PACIENTES_WITH_CREATORS.sql`)
A tabela `dietas_pacientes` agora possui:
- ✅ `criado_por_id uuid` - Identifica quem criou a dieta
- ✅ `arquivado_por_id uuid` - Identifica quem arquivou a dieta  
- ✅ `motivo_arquivamento text` - Registra por que foi arquivada
- ✅ Cálculos automáticos de `vet_at` e `pt_at` (GENERATED ALWAYS AS)
- ✅ Foreign keys para a tabela `users` com `ON DELETE SET NULL`

---

#### 2. **Backend: Funções Atualizadas** (App.tsx)

##### `addDietToPatient(patientId, diet, userId?)`
```typescript
const addDietToPatient = async (patientId: number | string, diet: Omit<Diet, 'id'>, userId?: string) => {
    // ... validações ...
    const payload = {
        // ... outros campos ...
        criado_por_id: userId || null  // 🟢 Captura automaticamente
    };
    // ... insert no Supabase ...
};
```

**O que muda:**
- ✅ Agora aceita parâmetro `userId`
- ✅ Salva `criado_por_id` na tabela automaticamente
- ✅ Logs de debug para rastreamento

---

##### `deleteDietFromPatient(patientId, dietId, userId?)`
```typescript
const deleteDietFromPatient = async (patientId: number | string, dietId: number | string, userId?: string) => {
    const { error } = await supabase.from('dietas_pacientes')
        .update({ 
            is_archived: true,
            arquivado_por_id: userId || null  // 🟢 Registra quem arquivou
        })
        .eq('id', dietId);
};
```

**O que muda:**
- ✅ Agora aceita parâmetro `userId`
- ✅ Salva `arquivado_por_id` na tabela automaticamente
- ✅ Soft delete com rastreamento

---

#### 3. **Frontend: Modal Atualizado** (AddDietModal.tsx)

```typescript
export const AddDietModal: React.FC<{ patientId: number | string; onClose: () => void }> = ({ patientId, onClose }) => {
    const { addDietToPatient } = useContext(PatientsContext)!;
    const { user } = useContext(UserContext)!;  // 🟢 Captura usuário autenticado
    
    const handleSubmit = (e: React.FormEvent) => {
        // ...
        addDietToPatient(patientId, {
            // ... dados da dieta ...
        }, user?.id);  // 🟢 Passa o ID do usuário
    };
};
```

**O que muda:**
- ✅ Importa `UserContext`
- ✅ Extrai `user` do contexto
- ✅ Passa `user?.id` para a função `addDietToPatient`

---

#### 4. **Handler de Exclusão** (App.tsx - PatientDetailScreen)

```typescript
const handleDeleteDiet = (patientId: number | string, dietId: number | string) => {
    if (window.confirm("Tem certeza que deseja arquivar esta dieta?")) {
        deleteDietFromPatient(patientId, dietId, user?.id);  // 🟢 Passa user.id
        showNotification({ message: 'Dieta arquivada.', type: 'info' });
    }
};
```

**O que muda:**
- ✅ Agora passa `user?.id` para rastreamento

---

### 🚀 Como usar

#### 1. **Executar o SQL no Supabase**

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Cole o conteúdo de `CREATE_DIETAS_PACIENTES_WITH_CREATORS.sql`
4. Clique em **Run**

```sql
-- Copie e execute o arquivo CREATE_DIETAS_PACIENTES_WITH_CREATORS.sql
```

---

#### 2. **Testar a Funcionalidade**

1. **Cadastrar uma dieta:**
   - Abra um paciente
   - Clique em "Cadastrar Dieta"
   - Preencha os dados
   - Clique em "Cadastrar"
   - ✅ O `criado_por_id` será salvo automaticamente

2. **Verificar no Supabase:**
   ```sql
   SELECT id, tipo, criado_por_id, created_at 
   FROM dietas_pacientes 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. **Arquivar uma dieta:**
   - Abra um paciente
   - Localize uma dieta existente
   - Clique no ícone de "X" (Arquivar)
   - Informe o motivo
   - Clique em "Arquivar"
   - ✅ O `arquivado_por_id` e `motivo_arquivamento` serão salvos

4. **Verificar quem fez cada ação:**
   ```sql
   SELECT 
       d.id,
       d.tipo,
       d.data_inicio,
       u_criador.name AS criado_por,
       u_arquivador.name AS arquivado_por,
       d.motivo_arquivamento
   FROM dietas_pacientes d
   LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
   LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id
   ORDER BY d.created_at DESC;
   ```

---

### 📊 Estrutura da Tabela

```sql
CREATE TABLE dietas_pacientes (
    id                      UUID PRIMARY KEY
    paciente_id             UUID NOT NULL (FK → patients)
    tipo                    VARCHAR(50)
    data_inicio             DATE
    volume                  NUMERIC(10,2)
    vet                     NUMERIC(10,2)
    vet_pleno               NUMERIC(10,2)
    vet_at                  NUMERIC(10,2) -- GERADO AUTOMATICAMENTE
    pt                      NUMERIC(10,2)
    pt_g_dia                NUMERIC(10,2)
    pt_at                   NUMERIC(10,2) -- GERADO AUTOMATICAMENTE
    th                      NUMERIC(10,2)
    is_archived             BOOLEAN DEFAULT false
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    data_remocao            TIMESTAMP NULL
    observacao              TEXT
    motivo_arquivamento     TEXT
    criado_por_id           UUID (FK → users) -- 🟢 NOVO
    arquivado_por_id        UUID (FK → users) -- 🟢 NOVO
)
```

---

### 🔍 Logs de Debug

Ao salvar uma dieta, você verá no console:
```
🔍 addDietToPatient - userId recebido: 12345678-1234-1234-1234-123456789012
📦 Payload para Supabase (dieta): { ... criado_por_id: '12345678-...' ... }
✅ Dieta inserida com sucesso
```

Ao arquivar uma dieta, você verá:
```
🔍 deleteDietFromPatient - userId recebido: 12345678-1234-1234-1234-123456789012
✅ Dieta arquivada com sucesso
```

---

### 📝 Próximos Passos (Opcionais)

1. **Criar View para ver histórico com nomes dos usuários:**
   ```sql
   CREATE VIEW vw_dietas_com_usuarios AS
   SELECT 
       d.*,
       u_criador.name AS criado_por_name,
       u_arquivador.name AS arquivado_por_name
   FROM dietas_pacientes d
   LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
   LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id;
   ```

2. **Adicionar coluna de data de arquivamento (caso não exista):**
   ```sql
   ALTER TABLE dietas_pacientes 
   ADD COLUMN IF NOT EXISTS data_arquivamento TIMESTAMP;
   ```

3. **Atualizar trigger para registrar data de arquivamento:**
   ```sql
   -- Trigger para salvar data_arquivamento automaticamente
   CREATE OR REPLACE FUNCTION atualizar_data_arquivamento()
   RETURNS TRIGGER AS $$
   BEGIN
       IF NEW.is_archived = true AND OLD.is_archived = false THEN
           NEW.data_arquivamento = CURRENT_TIMESTAMP;
       END IF;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_data_arquivamento
   BEFORE UPDATE ON dietas_pacientes
   FOR EACH ROW
   EXECUTE FUNCTION atualizar_data_arquivamento();
   ```

---

### ✨ Resumo das Mudanças

| Componente | Antes | Depois |
|---|---|---|
| **Tabela SQL** | Sem rastreamento de criador | ✅ `criado_por_id` e `arquivado_por_id` |
| **addDietToPatient()** | Sem captura de user | ✅ Captura e salva `criado_por_id` |
| **deleteDietFromPatient()** | Sem rastreamento | ✅ Salva `arquivado_por_id` |
| **AddDietModal** | Sem UserContext | ✅ Integrado com UserContext |
| **handleDeleteDiet()** | Sem rastreamento | ✅ Passa `user?.id` |

---

### 🎓 Resultado Final

Agora, ao clicar em "Cadastrar Dieta":
1. ✅ O sistema identifica automaticamente quem está cadastrando
2. ✅ Salva o UUID do usuário em `criado_por_id`
3. ✅ Você pode auditar quem criou cada dieta

E ao arquivar uma dieta:
1. ✅ O sistema identifica quem está arquivando
2. ✅ Salva o UUID em `arquivado_por_id`
3. ✅ Salva o motivo em `motivo_arquivamento`
4. ✅ Você pode auditar todo o histórico de changes

---

**Status:** ✅ Implementação concluída com sucesso!
