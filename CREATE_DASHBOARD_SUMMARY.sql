create view public.dashboard_summary as
with
  todos_registros as (
    select
      tasks_view_horario_br.status,
      tasks_view_horario_br.live_status
    from
      tasks_view_horario_br
    union all
    select
      alertas_paciente_view_completa.status,
      alertas_paciente_view_completa.live_status
    from
      alertas_paciente_view_completa
  )
select
  count(*) filter (
    where
      live_status is null
      or lower(live_status) <> 'concluido'::text
  ) as "totalAlertas",
  count(*) filter (
    where
      lower(live_status) = 'no_prazo'::text
  ) as "totalNoPrazo",
  count(*) filter (
    where
      lower(live_status) = 'fora_do_prazo'::text
  ) as "totalForaDoPrazo",
  count(*) filter (
    where
      lower(live_status) = 'concluido'::text
      or lower(status) ~~ '%conclu%'::text
  ) as "totalConcluidos"
from
  todos_registros;
