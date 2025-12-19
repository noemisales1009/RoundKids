-- Create alert_completions table to track who completed alerts and when
create table public.alert_completions (
  id serial not null,
  alert_id bigint not null,
  source character varying not null,
  completed_at timestamp without time zone null default now(),
  completed_by uuid null,
  created_at timestamp without time zone null default now(),
  constraint alert_completions_pkey primary key (id),
  constraint unique_alert_completion unique (alert_id, source),
  constraint alert_completions_user_fkey foreign KEY (completed_by) references users (id) on delete set null,
  constraint chk_source check (
    (
      (source)::text = any (
        (
          array[
            'tasks'::character varying,
            'alertas_paciente'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- Create index for faster lookups
create index IF not exists idx_alert_completions_lookup on public.alert_completions using btree (alert_id, source) TABLESPACE pg_default;

-- Create view to show alert completions with user names
create view public.alert_completions_with_user as
select
  ac.id,
  ac.alert_id,
  ac.source,
  ac.completed_at,
  ac.completed_by,
  COALESCE(u.name, 'Sistema'::text) as completed_by_name,
  ac.created_at
from
  alert_completions ac
  left join users u on ac.completed_by = u.id
order by
  ac.created_at desc;

-- Enable RLS on alert_completions
ALTER TABLE public.alert_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view alert completions (public view)
CREATE POLICY "Allow viewing alert completions"
ON public.alert_completions
FOR SELECT
USING (true);

-- RLS Policy: Users can insert their own completions
CREATE POLICY "Allow inserting own completions"
ON public.alert_completions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policy: Users can update their own completions
CREATE POLICY "Allow updating own completions"
ON public.alert_completions
FOR UPDATE
USING (completed_by = auth.uid() OR completed_by IS NULL);

-- RLS Policy: Users can delete their own completions
CREATE POLICY "Allow deleting own completions"
ON public.alert_completions
FOR DELETE
USING (completed_by = auth.uid() OR completed_by IS NULL);
