INSTRUÇÕES PARA CORRIGIR A EXIBIÇÃO DO NOME DO CRIADOR
=====================================================

PASSO 1: Acessar Supabase
- Vá para seu projeto no Supabase
- Clique em "SQL Editor" no menu esquerdo
- Clique em "New query"

PASSO 2: Copiar e colar o SQL
- Abra o arquivo: SQL_UPDATE_VIEWS_ADD_CREATOR_NAMES.sql
- Copie TODO o conteúdo
- Cole no SQL Editor do Supabase

PASSO 3: Executar o SQL
- Clique em "Run" (ou Ctrl+Enter)
- Verifique se não há erros

PASSO 4: Verificar no aplicativo
- Volte ao app e limpe o cache (F5 ou Ctrl+Shift+R)
- Crie um novo alerta ou tarefa
- Deve aparecer "Por: [Seu Nome]" em vez de "Por: Sistema"

O QUE FOI CORRIGIDO:
====================

✅ tasks_view_horario_br
   - Adicionado LEFT JOIN com public.users
   - Campo created_by_name agora retorna o nome do criador
   - Campo live_status para cálculo de prazos

✅ alertas_paciente_view_completa  
   - Adicionado LEFT JOIN com public.users
   - Campo created_by_name agora retorna o nome do criador
   - Campo live_status para filtros corretos

✅ alert_completions_with_user (nova view)
   - Mostra quem completou o alerta
   - Campo completed_by_name para exibir nome

CÓDIGO NO APP JÁ ESTÁ PRONTO:
============================
- Linha 807 em App.tsx: const createdByName = alert.created_by_name || alert.responsible || 'Sistema';
- Type Task em types.ts já tem: created_by_name?: string;
- Functions addTask() e addPatientAlert() já salvam created_by com o UUID do usuário

SÓ FALTA: Executar o SQL no Supabase para as views incluírem o campo!
