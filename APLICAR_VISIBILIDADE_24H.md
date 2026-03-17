#!/bin/bash
# ============================================
# APLICAR VISIBILIDADE DE ALERTAS 24H
# ============================================
# 
# Este script automatiza a aplicação das mudanças
# para o sistema de visibilidade de alertas por 24 horas

echo "🕐 Iniciando configuração de visibilidade de alertas..."
echo ""

# 1️⃣ INFORMAR ESTRUTURA
echo "📋 ARQUIVOS CRIADOS/ATUALIZADOS:"
echo "  ✅ CREATE_VISIBILIDADE_ALERTAS_24H.sql"
echo "     └─ Funções: is_alerta_visible() + tempo_restante_visibilidade()"
echo "     └─ View: alertas_paciente_visibilidade_24h"
echo "     └─ Índice: idx_alertas_status_conclusao"
echo ""
echo "  ✅ AlertsHistoryScreen.tsx"
echo "     └─ Query atualizada para usar nova view"
echo "     └─ Renderização do tempo restante adicionada"
echo ""
echo "  ✅ IMPLEMENTACAO_VISIBILIDADE_ALERTAS_24H.md"
echo "     └─ Documentação técnica completa"
echo ""
echo "  ✅ TESTE_VISIBILIDADE_ALERTAS_24H.sql"
echo "     └─ Scripts de teste e validação"
echo ""

# 2️⃣ PRÓXIMOS PASSOS
echo "🚀 PRÓXIMOS PASSOS:"
echo ""
echo "ETAPA 1: APLICAR NO BANCO DE DADOS"
echo "  1. Abra o Supabase/PostgreSQL"
echo "  2. Execute: CREATE_VISIBILIDADE_ALERTAS_24H.sql"
echo "  3. Copie todo o conteúdo do arquivo"
echo "  4. Cole na aba SQL do Supabase e execute"
echo ""

echo "ETAPA 2: VALIDAR NO BANCO"
echo "  1. Execute: TESTE_VISIBILIDADE_ALERTAS_24H.sql"
echo "  2. Verifique se os testes retornam resultados esperados"
echo "  3. Exemplo:"
echo "     - is_alerta_visible('pendente', NULL) → TRUE"
echo "     - is_alerta_visible('concluido', NOW()-12h) → TRUE"
echo "     - is_alerta_visible('concluido', NOW()-25h) → FALSE"
echo ""

echo "ETAPA 3: APLICAR NO FRONTEND"
echo "  1. O arquivo AlertsHistoryScreen.tsx foi atualizado"
echo "  2. Faça git pull ou copie as mudanças"
echo "  3. A aplicação agora usa:"
echo "     - View: alertas_paciente_visibilidade_24h"
echo "     - Campo: tempo_visibilidade (calculado no banco)"
echo ""

echo "ETAPA 4: TESTAR NO FRONTEND"
echo "  1. Recarregue a aplicação"
echo "  2. Vá para Histórico de Alertas"
echo "  3. Marque um alerta como CONCLUÍDO"
echo "  4. Deverá aparecer com badge: '⏱️ Visível por: 23h 45min'"
echo "  5. Recarregue periodicamente - o tempo deve diminuir"
echo "  6. Após 24h, o alerta deverá desaparecer"
echo ""

# 3️⃣ INFORMAÇÕES TÉCNICAS
echo "ℹ️  INFORMAÇÕES TÉCNICAS:"
echo "  Zona Horária: America/Sao_Paulo"
echo "  Intervalo: 24 horas = interval '24 hours'"
echo "  Status considerados 'concluídos':"
echo "    - 'concluido'"
echo "    - 'Concluído'"
echo "    - 'resolvido'"
echo "    - 'Resolvido'"
echo ""

# 4️⃣ COMPORTAMENTO
echo "🎯 COMPORTAMENTO:"
echo "  ✅ Alerta NÃO concluído → Sempre visível"
echo "  ✅ Alerta concluído há < 24h → Visível + tempo decrescente"
echo "  ❌ Alerta concluído há ≥ 24h → Removido da lista"
echo ""

echo "✨ Configuração explicada!"
echo "📚 Para mais detalhes, veja: IMPLEMENTACAO_VISIBILIDADE_ALERTAS_24H.md"
