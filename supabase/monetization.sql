-- =====================================================================
-- Ouedna — monetization support (run once in the Supabase SQL editor)
-- Safe to re-run. Review before running on production.
-- =====================================================================

-- 1) Extra business fields -------------------------------------------------
alter table public.places add column if not exists whatsapp text;
alter table public.places add column if not exists is_featured boolean not null default false;
alter table public.places add column if not exists featured_until timestamptz;

alter table public.tourism_agencies add column if not exists whatsapp text;
alter table public.tourism_agencies add column if not exists is_featured boolean not null default false;

-- 2) Public can read ACTIVE agencies only ----------------------------------
alter table public.tourism_agencies enable row level security;
drop policy if exists "public read active agencies" on public.tourism_agencies;
create policy "public read active agencies" on public.tourism_agencies
  for select using (status = 'active');
-- NOTE: writes must stay restricted to admins by your existing policies.

-- 3) Click tracking (calls, WhatsApp, directions...) ------------------------
create table if not exists public.contact_clicks (
  id bigserial primary key,
  target_type text not null check (target_type in ('place','agency')),
  target_id text not null,
  action text not null check (action in ('call','whatsapp','website','directions','booking')),
  visitor_key text,
  path text,
  created_at timestamptz not null default now()
);
create index if not exists contact_clicks_target_idx on public.contact_clicks (target_type, target_id, created_at desc);
create index if not exists contact_clicks_visitor_idx on public.contact_clicks (visitor_key, created_at desc);

alter table public.contact_clicks enable row level security;
-- No direct table access for anon; inserts only through the RPC below.

create or replace function public.record_contact_click(
  p_target_type text, p_target_id text, p_action text,
  p_visitor_key text default null, p_path text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_target_type not in ('place','agency')
     or p_action not in ('call','whatsapp','website','directions','booking')
     or p_target_id is null or length(p_target_id) > 40 then
    return;
  end if;
  -- basic flood protection: max 20 clicks / minute per visitor key
  if p_visitor_key is not null and (
       select count(*) from public.contact_clicks
       where visitor_key = left(p_visitor_key, 64) and created_at > now() - interval '1 minute') >= 20 then
    return;
  end if;
  insert into public.contact_clicks (target_type, target_id, action, visitor_key, path)
  values (p_target_type, p_target_id, p_action, left(p_visitor_key, 64), left(p_path, 200));
end $$;
revoke all on function public.record_contact_click(text,text,text,text,text) from public;
grant execute on function public.record_contact_click(text,text,text,text,text) to anon, authenticated;

-- 4) Monthly report for admins (use it to show business owners real results)
create or replace function public.get_contact_click_summary(p_days int default 30)
returns table (target_type text, target_id text, action text, clicks bigint, unique_visitors bigint)
language sql security definer set search_path = public as $$
  select c.target_type, c.target_id, c.action, count(*), count(distinct c.visitor_key)
  from public.contact_clicks c
  where c.created_at > now() - make_interval(days => greatest(1, least(p_days, 365)))
    and exists (select 1 from public.admin_profiles a where a.id = auth.uid() and a.role in ('admin','supervisor'))
  group by 1,2,3 order by 4 desc;
$$;
revoke all on function public.get_contact_click_summary(int) from public;
grant execute on function public.get_contact_click_summary(int) to authenticated;
