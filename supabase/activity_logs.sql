create table if not exists public.activity_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  level text not null check (level in ('info', 'warning', 'error')),
  source text not null,
  actor text not null,
  method text not null,
  endpoint text not null,
  status integer not null,
  message text not null,
  trace_id text not null unique
);

create index if not exists activity_logs_timestamp_idx
  on public.activity_logs (timestamp desc);

create index if not exists activity_logs_source_idx
  on public.activity_logs (source);

create index if not exists activity_logs_endpoint_idx
  on public.activity_logs (endpoint);
