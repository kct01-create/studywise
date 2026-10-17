-- StudyWise schema. Run in Supabase: SQL Editor -> New query -> Run.
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  subject text not null,
  topics text,
  deadline date not null,
  hours numeric not null check (hours > 0 and hours <= 12),
  summary text,
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index plans_user_id_idx on public.plans (user_id);

-- Row Level Security: every row is visible/editable only by its owner.
alter table public.plans enable row level security;
revoke all on public.plans from anon;           -- signed-out visitors get nothing

create policy "plans_select_own" on public.plans for select to authenticated
  using (user_id = (select auth.uid()));
create policy "plans_insert_own" on public.plans for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "plans_update_own" on public.plans for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "plans_delete_own" on public.plans for delete to authenticated
  using (user_id = (select auth.uid()));
