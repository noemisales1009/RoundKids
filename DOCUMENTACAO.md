# 📋 Documentação Completa - Round Aplicativo

## 📑 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Componentes Principais](#componentes-principais)
6. [Contextos e Estados](#contextos-e-estados)
7. [Banco de Dados](#banco-de-dados)
8. [Autenticação](#autenticação)
9. [Funcionalidades](#funcionalidades)
10. [Guia de Instalação](#guia-de-instalação)
11. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
12. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

**Round Aplicativo** é uma aplicação web responsiva desenvolvida para gerenciar rounds hospitalares, alertas clínicos, pacientes e tarefas relacionadas a cuidados de saúde. A aplicação foi construída com foco em experiência do usuário, segurança e escalabilidade.

### Objetivos Principais
- ✅ Gerenciar informações de pacientes hospitalizados
- ✅ Rastrear alertas clínicos e tarefas
- ✅ Organizar dados médicos (exames, medicações, culturas, etc.)
- ✅ Controlar acesso baseado em funções (Role-Based Access Control)
- ✅ Gerar relatórios e PDFs
- ✅ Suportar múltiplos dispositivos (responsividade)

---

## 🏗️ Arquitetura

### Padrão de Arquitetura
- **Frontend**: React com Context API para gerenciamento de estado
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Linguagem**: TypeScript

### Diagrama de Fluxo
```
┌─────────────────────────────────────────────────────────────┐
│                    ROUND APLICATIVO                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │  React App   │◄────────┤ Context API  │                 │
│  │  (UI Layer)  │         │  (State Mgmt)│                 │
│  └──────────────┘         └──────────────┘                 │
│         │                                                    │
│         │ (API Calls)                                        │
│         ▼                                                    │
│  ┌─────────────────────────────────────────┐               │
│  │   Supabase Client (supabaseClient.ts)   │               │
│  │   - Authentication                      │               │
│  │   - Database (PostgreSQL)               │               │
│  │   - Storage (Images/Files)              │               │
│  └─────────────────────────────────────────┘               │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────┐               │
│  │      Supabase Backend (Cloud)           │               │
│  │   - PostgreSQL Database                 │               │
│  │   - JWT Authentication                  │               │
│  │   - Storage Bucket (roundfoto)          │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Stack Tecnológico

### Frontend
- **React 19.2.0** - UI Framework
- **TypeScript 5.x** - Type Safety
- **Vite 6.4.1** - Build Tool
- **Tailwind CSS 3.x** - Styling
- **React Router v6** - Navigation
- **Supabase JS Client 2.x** - Backend Integration

### Backend
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL Database
  - JWT Authentication
  - Row Level Security (RLS)
  - Storage Bucket

### DevTools
- **npm** - Package Manager
- **.env.local** - Environment Variables (não versionado)
- **TypeScript Compiler** - Type Checking

### Dependências Principais
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-router-dom": "^6.x",
    "@supabase/supabase-js": "^2.x",
    "tailwindcss": "^3.x"
  }
}
```

---

## 📂 Estrutura de Pastas

```
Round-aplicativo/
├── src/
│   ├── App.tsx                      # Componente principal, rotas e telas
│   ├── index.tsx                    # Ponto de entrada da aplicação
│   ├── index.html                   # HTML template
│   ├── types.ts                     # Definições de tipos TypeScript
│   ├── constants.ts                 # Constantes, dados iniciais e utilitários
│   ├── contexts.ts                  # Contextos de estado (Context API)
│   ├── supabaseClient.ts            # Inicialização Supabase
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── icons.tsx               # Ícones SVG personalizados
│   │   ├── SecondaryNavigation.tsx  # Navegação horizontal (sub-abas)
│   │   ├── BradenScale.tsx          # Escala de avaliação Braden
│   │   ├── BradenQDScale.tsx        # Escala Braden QD
│   │   ├── ComfortBScale.tsx        # Escala Comfort B
│   │   ├── CRSRScale.tsx            # Escala CRSR
│   │   ├── DeliriumScale.tsx        # Escala de Delirium
│   │   ├── FLACCScale.tsx           # Escala FLACC
│   │   ├── FSSScale.tsx             # Escala FSS
│   │   ├── GlasgowScale.tsx         # Escala Glasgow
│   │   └── VniCnafScale.tsx         # Escala VNI/CNAF
│   ├── AlertsHistoryScreen.tsx      # Tela de histórico de alertas
│   ├── vite.config.ts               # Configuração Vite
│   └── tsconfig.json                # Configuração TypeScript
├── dist/                            # Build output (gerado)
├── .env.local                       # Variáveis de ambiente (não versionado)
├── .gitignore                       # Arquivo ignorado pelo git
├── package.json                     # Dependências e scripts
├── README.md                        # Instrções básicas
├── SECURITY_AUDIT.md                # Análise de segurança
├── RESPONSIVENESS_AUDIT.md          # Análise de responsividade
└── DOCUMENTACAO.md                  # Esta documentação
```

---

## 🧩 Componentes Principais

### App.tsx (3682 linhas)
Componente raiz da aplicação contendo:

#### Telas Principais
1. **LoginScreen** - Autenticação com validação
2. **DashboardScreen** - Resumo de pacientes, alertas e tarefas
3. **PatientListScreen** - Lista responsiva de pacientes
4. **PatientDetailScreen** - Detalhes completos do paciente
5. **ExamsScreen** - Gerenciar exames do paciente
6. **MedicationsScreen** - Gerenciar medicações
7. **SurgicalProceduresScreen** - Histórico cirúrgico
8. **CulturesScreen** - Culturas bacterianas
9. **DevicesScreen** - Dispositivos médicos
10. **TaskStatusScreen** - Tarefas por status
11. **SettingsScreen** - Configurações e perfil do usuário
12. **ScaleScoresScreen** - Escores de avaliação

#### Modais
- `EditPatientInfoModal` - Editar dados do paciente
- `CreateAlertModal` - Criar novo alerta
- `AddCultureModal` - Adicionar cultura
- `EditCultureModal` - Editar cultura
- `JustificationModal` - Justificar atraso em tarefas

#### Componentes de Layout
- `Header` - Cabeçalho com navegação
- `Sidebar` - Menu lateral com ícones
- `AppLayout` - Layout principal
- `NotificationComponent` - Notificações toast

### AlertsHistoryScreen.tsx (281 linhas)
Tela dedicada para visualizar histórico completo de alertas com:
- Filtros por data, status e paciente
- Exportação para PDF
- Lista de alertas com informações detalhadas

### Components/SecondaryNavigation.tsx
Navegação horizontal (sub-abas) com scroll horizontal responsivo para:
- Tabs dentro de telas específicas
- Suporte a múltiplas abas
- Indicador visual da aba ativa

### Escalas de Avaliação
Componentes para diferentes escalas clínicas:
- **BradenScale** - Prevenção de úlceras por pressão
- **GlasgowScale** - Nível de consciência
- **FLACCScale** - Avaliação de dor em crianças
- **ComfortBScale** - Avaliação de conforto
- **CRSRScale** - Avaliação de resposta
- **FSSScale** - Avaliação funcional
- **DeliriumScale** - Avaliação de delirium
- **VniCnafScale** - Avaliação VNI/CNAF
- **BradenQDScale** - Variante Braden QD

---

## 🌐 Contextos e Estados

Gerenciamento de estado centralizado via Context API:

### 1. **UserContext**
```typescript
{
  user: User;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (updates) => Promise<void>;
}
```
**Dados do usuário**: id, name, title, email, foto, sector, access_level

### 2. **PatientsContext**
```typescript
{
  patients: Patient[];
  categories: Category[];
  addPatient: (patient) => void;
  updatePatientDetails: (id, updates) => void;
  addCultureToPatient: (patientId, culture) => void;
  addExamToPatient: (patientId, exam) => void;
  addMedicationToPatient: (patientId, med) => void;
  // ... mais métodos
}
```
**Gerencia**: Pacientes, exames, medicações, culturas, dispositivos, cirurgias

### 3. **TasksContext**
```typescript
{
  tasks: Task[];
  alertChartData: AlertChartData[];
  fetchTasks: () => Promise<void>;
  addPatientAlert: (alert) => void;
  updateTaskStatus: (id, status) => void;
}
```
**Gerencia**: Tarefas, alertas, contagem por categoria

### 4. **NotificationContext**
```typescript
{
  notification: NotificationState;
  showNotification: (message, type) => void;
  hideNotification: () => void;
}
```
**Tipos**: 'success', 'error', 'info'

### 5. **ThemeContext**
```typescript
{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### 6. **HeaderContext**
```typescript
{
  setTitle: (title: string) => void;
}
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### users
```sql
id (UUID, PK)
email (TEXT, UNIQUE)
name (TEXT)
title (TEXT)
sector (TEXT)
access_level (TEXT) -- 'adm' | 'geral'
foto (TEXT)
updated_at (TIMESTAMP)
```

#### patients
```sql
id (INTEGER, PK)
name (TEXT)
bed_number (INTEGER)
mother_name (TEXT)
diagnosis (TEXT)
is_archived (BOOLEAN) -- Soft-delete
```

#### alerts (relacionada a alertas_paciente)
```sql
id (UUID, PK)
user_id (UUID, FK → users)
categoria_id (INTEGER, FK → categorias)
description (TEXT)
priority (TEXT)
status (TEXT)
created_at (TIMESTAMP)
```

#### categorias
```sql
id (INTEGER, PK)
nome (TEXT)
icone (TEXT)
ordem (INTEGER)
```

#### tasks
```sql
id (INTEGER, PK)
patient_id (INTEGER, FK)
task_name (TEXT)
status (TEXT)
prazo_limite (TIMESTAMP)
is_archived (BOOLEAN)
```

#### exames_pacientes, medicacoes_pacientes, culturas_pacientes
- Tabelas associativas com dados específicos de cada tipo

### Padrões de Design
- **Soft Delete**: Campo `is_archived` em vez de excluir dados
- **Foreign Keys**: Relacionamentos mantidos com FK
- **Timestamps**: `created_at`, `updated_at` para auditoria
- **Row Level Security (RLS)**: Controle de acesso por usuário

---

## 🔐 Autenticação

### Fluxo de Autenticação

```
1. Usuário insere email/senha na LoginScreen
2. Validação:
   - Email válido (validateEmail)
   - Senha válida (validatePassword)
   - Rate limiting (5 tentativas, 15 min lockout)
3. Supabase autenticação (JWT)
4. Se sucesso:
   - Salva sessão Supabase
   - Carrega dados do usuário (UserContext.loadUser)
   - Redireciona para Dashboard
5. Se erro:
   - Mostra notificação de erro
   - Incrementa contador de tentativas
```

### Segurança
✅ **Credenciais Supabase em .env.local** (não hardcoded)
✅ **Validação de entrada** em email e senha
✅ **Rate limiting** contra brute force
✅ **JWT tokens** gerenciados pelo Supabase
✅ **Sem localStorage** de dados sensíveis

---

## 🎨 Funcionalidades

### 1. Gerenciamento de Pacientes
- ✅ Visualizar lista de pacientes
- ✅ Ver detalhes completos do paciente
- ✅ Editar informações (mãe, diagnóstico)
- ✅ Adicionar/editar exames
- ✅ Adicionar/editar medicações
- ✅ Adicionar/editar culturas bacterianas
- ✅ Adicionar/editar dispositivos médicos
- ✅ Registrar procedimentos cirúrgicos

### 2. Sistema de Alertas
- ✅ Criar alertas clínicos
- ✅ Categorizar alertas (14 categorias)
- ✅ Visualizar alertas por status:
  - Alerta (ativo)
  - No prazo
  - Fora do prazo
  - Concluído
- ✅ Justificar atrasos
- ✅ Filtrar por paciente, data, status
- ✅ Gerar PDF com histórico

### 3. Tarefas e Rounds
- ✅ Visualizar tarefas por status
- ✅ Marcar tarefas como concluídas
- ✅ Dashboard com resumo de tarefas
- ✅ Contagem de alertas por categoria

### 4. Escalas de Avaliação Clínica
- ✅ Braden Scale (prevenção de úlceras)
- ✅ Glasgow Scale (nível de consciência)
- ✅ FLACC Scale (avaliação de dor)
- ✅ Comfort B Scale
- ✅ CRSR Scale
- ✅ FSS Scale
- ✅ Delirium Scale
- ✅ VNI/CNAF Scale
- ✅ Braden QD Scale

### 5. Configurações do Usuário
- ✅ Editar perfil (nome, título, setor)
- ✅ Upload de foto (armazenado no Supabase Storage)
- ✅ Alternar tema (claro/escuro)
- ✅ Fazer logout

### 6. Acesso Baseado em Funções (RBAC)
- ✅ Dois níveis: `adm` (administrador) e `geral` (usuário)
- ✅ Botão "Iniciar/Ver Round" restrito a `adm`
- ✅ Controle de acesso em telas específicas

### 7. Responsividade
- ✅ Mobile-first design (320px+)
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px)
- ✅ Modais responsivas
- ✅ Notificações posicionadas corretamente
- ✅ Ícones escaláveis
- ✅ Typography adaptativa

---

## 🚀 Guia de Instalação

### Pré-requisitos
- Node.js 18+ 
- npm 9+
- Conta Supabase (gratuita em https://supabase.com)

### Passos de Instalação

#### 1. Clonar Repositório
```bash
git clone https://github.com/noemisales1009/Round-aplicativo.git
cd Round-aplicativo
```

#### 2. Instalar Dependências
```bash
npm install
```

#### 3. Configurar Variáveis de Ambiente
Criar arquivo `.env.local` na raiz:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu_chave_anonima_aqui
```

⚠️ **Importante**: `.env.local` não é versionado (está em `.gitignore`)

#### 4. Criar Banco de Dados Supabase
Execute os scripts SQL fornecidos:
```sql
-- Criar tabelas
-- Configurar RLS (Row Level Security)
-- Inserir dados iniciais
```

#### 5. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
Aplicação disponível em `http://localhost:5173`

#### 6. Build para Produção
```bash
npm run build
```

---

## 👨‍💻 Guia de Desenvolvimento

### Estrutura de Desenvolvimento

#### Adicionar Uma Nova Tela
1. Criar componente em `App.tsx`
2. Definir tipos em `types.ts`
3. Adicionar rota em `App.tsx`
4. Usar `useHeader()` para título

```typescript
const NovaTelaScreen: React.FC = () => {
    useHeader('Título da Tela');
    const { user } = useContext(UserContext)!;
    
    return (
        <div className="space-y-6">
            {/* Conteúdo */}
        </div>
    );
};
```

#### Adicionar Um Novo Contexto
1. Definir tipo em `types.ts`
2. Criar provider em `contexts.ts`
3. Usar em `App.tsx`

```typescript
// types.ts
export interface NovoContextType {
    dados: any[];
    funcao: () => void;
}

// contexts.ts
export const NovoContext = createContext<NovoContextType | undefined>(undefined);

// App.tsx
<NovoProvider>
    {/* app */}
</NovoProvider>
```

#### Adicionar Uma Nova Funcionalidade
1. **Type Safety**: Definir tipos em `types.ts`
2. **State Management**: Usar contextos ou estado local
3. **UI**: Criar componente/tela
4. **Backend**: Implementar funções Supabase em `App.tsx`
5. **Testing**: Testar em múltiplos dispositivos

### Padrões de Código

#### Padrão de Componente Modal
```typescript
const MinhaModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                {/* Conteúdo */}
            </div>
        </div>
    );
};
```

#### Padrão de Input Responsivo
```typescript
<input
    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm sm:text-base text-slate-800 dark:text-slate-200"
/>
```

#### Padrão de Notificação
```typescript
const { showNotification } = useContext(NotificationContext)!;
showNotification({ message: 'Sucesso!', type: 'success' });
```

### Debugging
- **Console**: `console.log()` para debug
- **DevTools**: React DevTools para inspecionar contextos
- **Supabase Studio**: Verificar dados em https://app.supabase.com

---

## ✅ Boas Práticas

### Código
- ✅ Sempre usar TypeScript (sem `any`)
- ✅ Validar entrada do usuário
- ✅ Usar Context API para estado global
- ✅ Manter componentes pequenos e reutilizáveis
- ✅ Adicionar comentários em lógica complexa

### Responsividade
- ✅ Mobile-first approach
- ✅ Testar em: 320px, 375px, 640px, 768px, 1024px
- ✅ Usar Tailwind breakpoints (sm, md, lg)
- ✅ Ícones: `w-5 h-5 sm:w-6 sm:h-6`
- ✅ Typography: `text-sm sm:text-base`

### Segurança
- ✅ Nunca hardcodificar credenciais
- ✅ Usar `.env.local` para secrets
- ✅ Validar entrada no cliente e servidor
- ✅ Implementar rate limiting
- ✅ Usar HTTPS em produção
- ✅ Configurar CORS corretamente

### Performance
- ✅ Lazy load componentes quando possível
- ✅ Otimizar bundle size
- ✅ Usar memoização para componentes pesados
- ✅ Evitar re-renders desnecessários

### Git/Versionamento
- ✅ Commits descritivos
- ✅ Não commitar `.env.local`
- ✅ Branches para features
- ✅ PRs com testes antes de merge

---

## 📊 Métricas de Qualidade

### Build
- ✅ Bundle Size: 654.60 kB (163.21 kB gzip)
- ✅ Módulos: 137 transformados
- ✅ Erros TypeScript: 0
- ✅ Tempo de build: ~3.7s

### Responsividade
- ✅ Score: 8/10 (melhorado de 7/10)
- ✅ Modais: Totalmente mobile-friendly
- ✅ Notificações: Posicionadas corretamente
- ✅ Ícones: Escaláveis em todos breakpoints
- ✅ Typography: Adaptativa

### Segurança
- ✅ Credenciais: Em .env.local
- ✅ Validação: Email e senha
- ✅ Rate Limiting: 5 tentativas, 15min lockout
- ✅ localStorage: Sem dados sensíveis
- ✅ RBAC: Access_level implementado

---

## 📞 Suporte

### Documentos Importantes
- 📄 **README.md** - Instruções básicas
- 📄 **SECURITY_AUDIT.md** - Análise de segurança
- 📄 **RESPONSIVENESS_AUDIT.md** - Análise de responsividade
- 📄 **DOCUMENTACAO.md** - Esta documentação

### Recursos Externos
- 🔗 [Supabase Docs](https://supabase.com/docs)
- 🔗 [React Docs](https://react.dev)
- 🔗 [Tailwind CSS](https://tailwindcss.com)
- 🔗 [Vite Docs](https://vitejs.dev)
- 🔗 [TypeScript Docs](https://www.typescriptlang.org/docs)

---

**Última atualização**: 4 de dezembro de 2025  
**Versão**: 2.0  
**Mantido por**: Equipe Round
