# 🗄️ Sistema de Arquivamento de Dispositivos - Implementação Completa

## 📋 Resumo
Sistema de arquivamento de dispositivos médicos com rastreamento de auditoria, similar ao sistema de alertas.

## ✅ Implementado

### 1️⃣ **CREATE_VIEW_DISPOSITIVOS_DETALHADO.sql**
**Localização:** Arquivo raiz do projeto

**O que faz:**
- Adiciona colunas de auditoria à tabela `dispositivos_pacientes`:
  - `motivo_arquivamento` (text)
  - `criado_por_id` (uuid → users)
  - `arquivado_por_id` (uuid → users)
- Cria view `vw_dispositivos_detalhado` com:
  - Todos os campos da tabela base
  - `nome_criador` - Nome do usuário que criou
  - `nome_arquivador` - Nome do usuário que arquivou
  - `created_at_br` - Data/hora em fuso horário de São Paulo
  - `data_remocao_br` - Data de remoção em fuso horário de São Paulo
- Cria índices para performance
- Configura permissões RLS

**Como executar:**
1. Abrir Supabase SQL Editor
2. Copiar TODO o conteúdo do arquivo
3. Executar
4. Verificar mensagem: "✅ View vw_dispositivos_detalhado criada com sucesso!"

---

### 2️⃣ **ArchiveDeviceModal.tsx**
**Localização:** `components/modals/devices/ArchiveDeviceModal.tsx`

**Características:**
- Modal com tema âmbar (amber) para arquivamento
- Mostra informações do dispositivo (nome, localização, data de inserção)
- Campo de texto obrigatório para motivo
- Validação: botão desabilitado até preencher motivo
- Loading state durante submissão
- Integração com Supabase (UPDATE direto)
- Notificações de sucesso/erro

**Props:**
```typescript
{
  device: Device;          // Dispositivo a ser arquivado
  patientId: number | string;
  onClose: () => void;     // Fecha o modal
  onSuccess: () => void;   // Callback após sucesso (recarrega página)
}
```

**Funcionamento:**
1. Usuário clica no botão X (âmbar) no dispositivo
2. Modal abre mostrando dados do dispositivo
3. Usuário digita motivo do arquivamento
4. Sistema faz UPDATE na tabela:
   - `is_archived = true`
   - `arquivado_por_id = user.id`
   - `motivo_arquivamento = texto digitado`
5. Sucesso: notificação + reload da página
6. Erro: notificação de erro + mantém modal aberto

---

### 3️⃣ **Modificações no App.tsx**

#### **Import do modal (linha ~56)**
```typescript
const ArchiveDeviceModal = lazy(() => import('./components/modals').then(m => ({ default: m.ArchiveDeviceModal })));
```

#### **Estado para controle do modal (linha ~1923)**
```typescript
const [archiveDeviceModal, setArchiveDeviceModal] = useState<Device | null>(null);
```

#### **Botão de arquivar (linha ~2157-2167)**
```typescript
<button 
    onClick={() => setArchiveDeviceModal(device)} 
    className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-full transition" 
    title="Arquivar dispositivo"
    aria-label="Arquivar dispositivo"
>
    <CloseIcon className="w-4 h-4" />
</button>
```

**Comportamento:**
- Botão X aparece SOMENTE em dispositivos com `data_remocao` preenchida
- Cor âmbar (amber-600) ao invés de vermelho
- Hover em fundo âmbar claro
- Ao clicar, abre modal com o dispositivo selecionado

#### **Renderização do modal (linha ~2507-2516)**
```typescript
{archiveDeviceModal && (
    <ArchiveDeviceModal 
        device={archiveDeviceModal} 
        patientId={patient.id} 
        onClose={() => setArchiveDeviceModal(null)} 
        onSuccess={() => window.location.reload()}
    />
)}
```

---

### 4️⃣ **Exports nos arquivos de índice**

#### **components/modals/devices/index.ts**
```typescript
export { ArchiveDeviceModal } from './ArchiveDeviceModal';
```

#### **components/modals/index.ts**
```typescript
export { AddDeviceModal, EditDeviceModal, AddRemovalDateModal, EditDeviceRemovalDateModal, ArchiveDeviceModal } from './devices';
```

---

## 🎨 UI/UX

### **Botão de Arquivar**
- **Cor:** Âmbar (amber-600)
- **Ícone:** X (CloseIcon)
- **Aparece quando:** Dispositivo tem data de remoção
- **Tooltip:** "Arquivar dispositivo"

### **Modal de Arquivamento**
- **Tema:** Âmbar (warning/archive theme)
- **Título:** "Arquivar Dispositivo"
- **Card de informação:** Fundo âmbar claro com dados do dispositivo
- **Campo obrigatório:** Textarea para motivo
- **Botões:**
  - **Cancelar:** Cinza (slate)
  - **Arquivar:** Âmbar, desabilitado até preencher motivo
- **Estados:**
  - Normal
  - Loading (durante submit)
  - Disabled (campos e botões)

---

## 🔍 Lógica de Negócio

### **Quando um dispositivo pode ser arquivado?**
✅ SOMENTE dispositivos com `data_remocao` preenchida

### **Workflow:**
1. Dispositivo é inserido (sem data de remoção)
2. Usuário registra data de retirada
3. Botão X (âmbar) aparece
4. Usuário clica → Modal abre
5. Usuário preenche motivo → Clica "Arquivar"
6. Sistema faz UPDATE (soft delete):
   - `is_archived = true`
   - `arquivado_por_id = user.id`
   - `motivo_arquivamento = texto`
7. Página recarrega
8. Dispositivo desaparece da lista (filtrado por `!is_archived`)

### **Dados salvos:**
- **Quem arquivou:** `arquivado_por_id` (FK para users)
- **Quando arquivou:** Timestamp automático do Supabase
- **Por que arquivou:** `motivo_arquivamento` (texto livre)

---

## 📊 View vw_dispositivos_detalhado

### **Campos retornados:**
```sql
SELECT 
    d.id,
    d.created_at,
    d.tipo_dispositivo,
    d.localizacao,
    d.data_insercao,
    d.data_remocao,
    d.is_archived,
    d.motivo_arquivamento,
    d.observacao,
    d.paciente_id,
    d.criado_por_id,
    d.arquivado_por_id,
    COALESCE(u_criador.name, 'Sistema') AS nome_criador,
    COALESCE(u_arquivador.name, 'Sistema') AS nome_arquivador,
    (d.created_at AT TIME ZONE 'America/Sao_Paulo') AS created_at_br,
    CASE 
        WHEN d.data_remocao IS NOT NULL 
        THEN (d.data_remocao AT TIME ZONE 'America/Sao_Paulo')
        ELSE NULL
    END AS data_remocao_br
FROM dispositivos_pacientes d
LEFT JOIN users u_criador ON d.criado_por_id = u_criador.id
LEFT JOIN users u_arquivador ON d.arquivado_por_id = u_arquivador.id;
```

### **Para usar no frontend:**
```typescript
const { data, error } = await supabase
    .from('vw_dispositivos_detalhado')
    .select('*')
    .eq('paciente_id', patientId)
    .is('is_archived', false);

// Retorna dispositivos NÃO arquivados com nomes de quem criou
```

---

## 🔐 Segurança

### **RLS (Row Level Security):**
- View tem permissões `SELECT` para `authenticated` e `anon`
- Colunas FK (`criado_por_id`, `arquivado_por_id`) referenciam `users(id)`
- Apenas usuários autenticados podem arquivar (validação no modal)

### **Validações:**
1. **No modal:** Verifica `user?.id` antes de submeter
2. **Campo obrigatório:** `motivo_arquivamento` não pode ser vazio
3. **Trim:** Remove espaços em branco do motivo
4. **Button disabled:** Até preencher motivo válido

---

## 🎯 Próximos Passos (Opcional)

### **1. Mostrar dispositivos arquivados no histórico do paciente**
Similar aos alertas arquivados, adicionar em `PatientHistoryScreen`:

```typescript
// Buscar dispositivos arquivados
const { data: archivedDevices } = await supabase
    .from('vw_dispositivos_detalhado')
    .select('*')
    .eq('paciente_id', patient.id)
    .eq('is_archived', true);

// Adicionar ao timeline com [DISPOSITIVO_ARQUIVADO] marker
```

### **2. Relatório de dispositivos arquivados**
Criar view para análise:
```sql
SELECT 
    nome_arquivador,
    COUNT(*) as total_arquivados,
    motivo_arquivamento,
    COUNT(*) as ocorrencias
FROM vw_dispositivos_detalhado
WHERE is_archived = true
GROUP BY nome_arquivador, motivo_arquivamento;
```

### **3. Restaurar dispositivo arquivado**
Adicionar função para "desarquivar":
```typescript
const { error } = await supabase
    .from('dispositivos_pacientes')
    .update({ is_archived: false, motivo_arquivamento: null })
    .eq('id', deviceId);
```

---

## 🧪 Testes

### **Checklist de testes:**
1. ✅ Executar SQL no Supabase
2. ✅ Verificar colunas adicionadas em `dispositivos_pacientes`
3. ✅ Verificar view `vw_dispositivos_detalhado` criada
4. ⬜ Inserir dispositivo sem data de remoção → Botão X não aparece
5. ⬜ Registrar data de remoção → Botão X (âmbar) aparece
6. ⬜ Clicar no X → Modal abre
7. ⬜ Tentar arquivar sem motivo → Botão desabilitado
8. ⬜ Digitar motivo → Botão habilitado
9. ⬜ Clicar "Arquivar" → Loading + Sucesso
10. ⬜ Verificar dispositivo desaparece da lista
11. ⬜ Consultar banco:
    ```sql
    SELECT * FROM dispositivos_pacientes WHERE id = <device_id>;
    -- is_archived = true
    -- arquivado_por_id = <user_id>
    -- motivo_arquivamento = "texto digitado"
    ```
12. ⬜ Consultar view:
    ```sql
    SELECT * FROM vw_dispositivos_detalhado WHERE id = <device_id>;
    -- Deve mostrar nome_arquivador preenchido
    ```

---

## 📚 Arquivos Modificados

### **Criados:**
- `CREATE_VIEW_DISPOSITIVOS_DETALHADO.sql` (raiz)
- `components/modals/devices/ArchiveDeviceModal.tsx`
- `ARQUIVAMENTO_DISPOSITIVOS.md` (este arquivo)

### **Modificados:**
- `App.tsx`:
  - Import do ArchiveDeviceModal (linha ~56)
  - Estado archiveDeviceModal (linha ~1923)
  - Botão de arquivar (linha ~2157-2167)
  - Renderização do modal (linha ~2507-2516)
- `components/modals/devices/index.ts`: Export do ArchiveDeviceModal
- `components/modals/index.ts`: Export do ArchiveDeviceModal

---

## 🎉 Padrão Replicável

Este mesmo padrão pode ser usado para arquivar:
- ✅ Alertas (já implementado)
- ✅ Dispositivos (implementado agora)
- ⬜ Exames
- ⬜ Medicações
- ⬜ Culturas
- ⬜ Dietas
- ⬜ Procedimentos cirúrgicos

**Template de implementação:**
1. Criar SQL com ALTER TABLE + VIEW
2. Criar `Archive[Entity]Modal.tsx` com tema âmbar
3. Adicionar estado `archive[Entity]Modal`
4. Substituir botão delete por botão arquivar (âmbar)
5. Renderizar modal com onSuccess callback
6. Exportar modal nos índices

---

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verificar console do navegador (F12)
2. Verificar logs do Supabase
3. Confirmar que SQL foi executado com sucesso
4. Verificar se usuário está autenticado (`user?.id`)
5. Verificar permissões RLS da tabela

---

**Data de implementação:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 1.0.0
