create view public.tasks_view_horario_br as
with
  base as (
    select
      t.id,
      t.patient_id,
      t.category_id,
      t.description,
      t.responsible,
      t.deadline,
      t.status,
      t.justification,
      t.created_at,
      t.updated_at,
      t.created_by,
      case
        when t.status = 'alerta'::text then EXTRACT(
          epoch
          from
            t.deadline - t.created_at
        ) / 60::numeric
        else 120::numeric
      end as prazo_minutos_efetivo
    from
      tasks t
  ),
  calc as (
    select
      b.id,
      b.patient_id,
      b.category_id,
      b.description,
      b.responsible,
      b.deadline,
      b.status,
      b.justification,
      b.created_at,
      b.updated_at,
      b.prazo_minutos_efetivo,
      COALESCE(u.name, 'Não informado'::text) as created_by_name,
      (
        b.created_at AT TIME ZONE 'America/Sao_Paulo'::text
      ) as hora_criacao_br,
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) as prazo_limite_br,
      case
        when b.status = any (array['concluido'::text, 'Concluído'::text]) then (
          b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text
        )
        else null::timestamp without time zone
      end as hora_conclusao_br,
      to_char(
        (
          b.created_at AT TIME ZONE 'America/Sao_Paulo'::text
        ),
        'HH24:MI'::text
      ) as hora_criacao_hhmm,
      to_char(
        (
          b.created_at AT TIME ZONE 'America/Sao_Paulo'::text
        ),
        'DD/MM/YYYY HH24:MI'::text
      ) as hora_criacao_formatado,
      to_char(
        (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text),
        'HH24:MI'::text
      ) as prazo_limite_hhmm,
      case
        when b.status = any (array['concluido'::text, 'Concluído'::text]) then to_char(
          (
            b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text
          ),
          'HH24:MI'::text
        )
        else null::text
      end as hora_conclusao_hhmm,
      to_char(
        (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text),
        'DD/MM/YYYY HH24:MI'::text
      ) as prazo_limite_formatado,
      case
        when b.status = any (array['concluido'::text, 'Concluído'::text]) then 'concluido'::text
        when b.deadline < now() then 'fora_do_prazo'::text
        else 'no_prazo'::text
      end as live_status,
      case
        when b.prazo_minutos_efetivo is null then null::text
        else (
          with
            iv as (
              select
                justify_interval(
                  make_interval(mins => b.prazo_minutos_efetivo::integer)
                ) as iv
            )
          select
            TRIM(
              both ' '::text
              from
                concat_ws(
                  ' '::text,
                  case
                    when EXTRACT(
                      hour
                      from
                        iv.iv
                    )::integer <> 0 then (
                      EXTRACT(
                        hour
                        from
                          iv.iv
                      )::integer || ' hora'::text
                    ) || case
                      when EXTRACT(
                        hour
                        from
                          iv.iv
                      ) = 1::numeric then ''::text
                      else 's'::text
                    end
                    else null::text
                  end,
                  case
                    when EXTRACT(
                      minute
                      from
                        iv.iv
                    )::integer <> 0 then EXTRACT(
                      minute
                      from
                        iv.iv
                    )::integer || ' min'::text
                    else null::text
                  end
                )
            ) as btrim
          from
            iv
        )
      end as prazo_formatado
    from
      base b
      left join users u on b.created_by = u.id
  ),
  limpeza_de_prefixos as (
    select
      c.id,
      c.patient_id,
      c.category_id,
      c.description,
      c.responsible,
      c.deadline,
      c.status,
      c.justification,
      c.created_at,
      c.updated_at,
      c.created_by_name,
      c.prazo_minutos_efetivo,
      c.hora_criacao_br,
      c.prazo_limite_br,
      c.hora_conclusao_br,
      c.hora_criacao_hhmm,
      c.hora_criacao_formatado,
      c.prazo_limite_hhmm,
      c.hora_conclusao_hhmm,
      c.prazo_limite_formatado,
      c.live_status,
      c.prazo_formatado,
      TRIM(
        both
        from
          replace(
            replace(
              TRIM(
                both
                from
                  case
                    when c.description ~~ '%-%'::text then "substring" (
                      c.description,
                      POSITION(('-'::text) in (c.description)) + 1
                    )
                    else c.description
                  end
              ),
              '°'::text,
              ''::text
            ),
            '-'::text,
            ''::text
          )
      ) as descricao_limpa
    from
      calc c
  )
select
  id as id_alerta,
  patient_id,
  category_id,
  case
    when descricao_limpa ~~* '%AVALIAR BH%'::text then 1
    when descricao_limpa ~~* '%CONTROLE RIGOROSO DE PANI%'::text then 2
    when descricao_limpa ~~* '%OUTRAS::%'::text then 3
    else 4
  end as ordem_prioridade,
  descricao_limpa as alertaclinico,
  responsible as responsavel,
  status,
  justification as justificativa,
  created_at,
  updated_at,
  deadline,
  hora_criacao_br,
  hora_criacao_formatado,
  prazo_limite_br,
  hora_conclusao_br,
  hora_criacao_hhmm,
  prazo_limite_hhmm,
  hora_conclusao_hhmm,
  prazo_limite_formatado,
  prazo_minutos_efetivo,
  prazo_formatado,
  live_status,
  created_by_name
from
  limpeza_de_prefixos;