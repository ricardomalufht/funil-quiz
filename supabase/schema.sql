-- Run this in the Supabase SQL Editor to create the leads table

create table if not exists quiz_leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  quiz_id          text not null,  -- lucro | faturamento | dominio | organizacao
  name             text not null,
  email            text,
  whatsapp         text,
  score            integer not null,
  dimension_scores jsonb not null
);

-- Enable Row Level Security
alter table quiz_leads enable row level security;

-- Allow anonymous inserts (the quiz is public)
create policy "Allow anonymous inserts"
  on quiz_leads
  for insert
  to anon
  with check (true);

-- Only authenticated users (you) can read leads
create policy "Allow authenticated reads"
  on quiz_leads
  for select
  to authenticated
  using (true);
