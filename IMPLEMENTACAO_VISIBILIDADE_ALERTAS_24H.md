# 🕐 IMPLEMENTAÇÃO: Visibilidade de Alertas por 24 Horas

## Objetivo
Permitir que alertas concluídos/resolvidos permaneçam visíveis por **24 horas** após a conclusão, depois desaparecem automaticamente. Mostrando o tempo restante de visibilidade.

---

## 📋 O que foi Implementado

### 1️⃣ **Funções SQL** (`CREATE_VISIBILIDADE_ALERTAS_24H.sql`)

#### `is_alerta_visible(p_status, p_hora_conclusao)`
- **Propósito**: Determinar se um alerta deve ser mostrado
- **Retorna TRUE se**:
  - Alerta ainda NÃO foi concluído (status ≠ 'concluido'/'resolvido')
  - Alerta foi concluído há MENOS de 24 horas
- **Retorna FALSE se**:
  - Alerta foi concluído há 24h ou mais

#### `tempo_restante_visibilidade(p_status, p_hora_conclusao)`
- **Propósito**: Calcular quanto tempo resta para o alerta desaparecer
- **Retorna**:
  - `NULL`: Se alerta não foi concluído
  - `"Xh Ymin"`: Tempo restante em horas e minutos
  - `"Expirado"`: Se o alerta já passou de 24h

### 2️⃣ **Nova View SQL** (`alertas_paciente_visibilidade_24h`)
- Filtra alertas usando a função `is_alerta_visible()`
- Inclui o campo `tempo_visibilidade` para cada alerta
- Garante que apenas alertas visíveis passem para o frontend

### 3️⃣ **Atualização do Frontend** (`AlertsHistoryScreen.tsx`)

#### Mudanças:
- **Query anterior**: Usava `alertas_paciente_view_completa` + filtrava no frontend
- **Query nova**: Usa `alertas_paciente_visibilidade_24h` (já filtrada no banco)

#### Exibição do Tempo:
- Mostra badge com ⏱️ quando alerta está concluído
- Displays: `"Visível por: Xh Ymin"`
- Se expirado: `"Visibilidade expirada"`
- Cores:
  - 🟨 **Ambar**: Alerta visível com tempo restante
  - 🔴 **Vermelho**: Alerta expirado

---

## 🔄 Fluxo de Funcionamento

```
ALERTA CRIADO
    ↓
[Status: Ativo/Pendente]
    ↓
ALERTA CONCLUÍDO
    ↓
[Status: "concluido" ou "resolvido"]
[status_conclusao = NOW()]
    ↓
BANCO VERIFICA is_alerta_visible()
    ↓
├─→ SIM (< 24h) → MOSTRA com tempo decrescente
│                  "Visível por: 18h 45min"
│
└─→ NÃO (≥ 24h) → REMOVE da consulta
                    Alerta desaparece
```

---

## 📊 Estrutura de Dados

### Tabela `alertas_paciente` (campos existentes necessários):
```sql
- id                  (UUID)
- status              (text) → 'concluido', 'resolvido', 'pendente', etc
- status_conclusao    (timestamp) → Hora de conclusão (America/Sao_Paulo)
- created_at          (timestamp)
- patient_id          (UUID)
- alerta_descricao    (text)
- ... outros campos
```

### View `alertas_paciente_visibilidade_24h` (retorna):
```sql
- id_alerta
- patient_name
- bed_number
- status
- alerta_descricao
- tempo_visibilidade (calculado dinamicamente)
- status_conclusao
- ... todos os outros campos da view_completa
```

---

## 🧪 Como Testar

### 1. Verificar o Banco
```sql
-- Ver alertas concluídos visíveis pela próxima 1 hora
SELECT 
    id,
    patient_name,
    status,
    tempo_restante_visibilidade(status, status_conclusao) as tempo
FROM alertas_paciente_visibilidade_24h
WHERE status IN ('concluido', 'resolvido');

-- Testar função direto
SELECT is_alerta_visible('concluido', NOW() - INTERVAL '12 hours');  -- TRUE
SELECT is_alerta_visible('concluido', NOW() - INTERVAL '25 hours');  -- FALSE
SELECT tempo_restante_visibilidade('concluido', NOW() - INTERVAL '12 hours');
```

### 2. No Frontend
1. Marcar alerta como concluído
2. Verificar que aparece com badge de tempo
3. Recarregar página periodicamente para ver tempo diminuir
4. Após 24h, verificar que desaparece

---

## ⚙️ Índices de Performance

Foram criados índices para melhorar a performance:
```sql
CREATE INDEX idx_alertas_status_conclusao 
  ON public.alertas_paciente(status, status_conclusao)
  WHERE status IN ('concluido', 'Concluído', 'resolvido', 'Resolvido');
```

Este índice acelera a filtragem de alertas concluídos.

---

## 🔧 Zona Horária

- **Padrão usado**: `America/Sao_Paulo` (horário de Brasília)
- **Função**: Todas as funções usam `NOW() AT TIME ZONE 'America/Sao_Paulo'`
- **24 horas**: Calculadas como `interval '24 hours'`

---

## 📝 Próximas Melhorias (Opcional)

- [ ] Adicionar refresh automático na tela a cada minuto (para atualizar tempo em tempo real)
- [ ] Notificação silenciosa quando alerta está próximo de expirar
- [ ] Log de audição quando alerta é removido automaticamente
- [ ] Filtro na tabela para mostrar apenas "Expirando em X horas"

---

## ✅ Checklist de Implementação

- [x] Funções SQL criadas
- [x] View SQL criada
- [x] Índices criados
- [x] Frontend atualizado para usar nova view
- [x] Exibição de tempo restante adicionada
- [x] Estilos de badge com cores apropriadas
- [x] Tratamento de status "concluido" e "resolvido"

---

## 📞 Arquivo Referência
- **SQL**: `CREATE_VISIBILIDADE_ALERTAS_24H.sql`
- **React**: `AlertsHistoryScreen.tsx` (linhas com tempo_visibilidade)
