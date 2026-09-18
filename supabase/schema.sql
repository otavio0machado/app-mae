begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  cnpj text,
  created_at timestamptz not null default now()
);
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  cnpj text,
  contract text,
  hourly_rate numeric(12,2) check (hourly_rate >= 0 and hourly_rate <> 'NaN'::numeric),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  work_date date not null,
  description text not null check (length(btrim(description)) > 0),
  hours numeric(10,2) not null check (hours > 0 and hours <> 'NaN'::numeric),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entries_professional_owner_fk foreign key (professional_id, user_id) references public.professionals(id, user_id) on delete cascade
);
create index professionals_user_name_idx on public.professionals (user_id, name);
create index entries_user_date_idx on public.entries (user_id, work_date);
create index entries_user_professional_date_idx on public.entries (user_id, professional_id, work_date);
create index entries_professional_idx on public.entries (professional_id);
create function public.set_entry_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.set_entry_updated_at() from public, anon, authenticated;
create trigger entries_updated_at before update on public.entries for each row execute function public.set_entry_updated_at();
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.entries enable row level security;
create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_insert on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete on public.profiles for delete to authenticated using (id = (select auth.uid()));
create policy professionals_select on public.professionals for select to authenticated using (user_id = (select auth.uid()));
create policy professionals_insert on public.professionals for insert to authenticated with check (user_id = (select auth.uid()));
create policy professionals_update on public.professionals for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy professionals_delete on public.professionals for delete to authenticated using (user_id = (select auth.uid()));
create policy entries_select on public.entries for select to authenticated using (user_id = (select auth.uid()));
create policy entries_insert on public.entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy entries_update on public.entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy entries_delete on public.entries for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.profiles, public.professionals, public.entries from anon;
grant select, insert, update, delete on public.profiles, public.professionals, public.entries to authenticated;
commit;
