-- THOY Lawncare portal schema (mirrors ari-portal conventions)

-- ============ tables ============
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.site_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value integer not null default 0,
  suffix text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table public.service_photos (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('mowing','cleanup','mulching','edging')),
  image text not null,
  alt text default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  message text,
  status text not null default 'new' check (status in ('new','read','resolved','archived')),
  created_at timestamptz not null default now()
);

-- ============ helper: is the caller an allowlisted employee ============
-- (defined after employees exists; SQL function bodies are validated at creation)
create or replace function public.is_employee()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.employees
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- ============ RLS ============
alter table public.employees        enable row level security;
alter table public.site_stats       enable row level security;
alter table public.site_content     enable row level security;
alter table public.service_photos   enable row level security;
alter table public.contact_messages enable row level security;

-- employees: a signed-in employee may read the allowlist; no client writes
create policy "employees self read" on public.employees
  for select to authenticated using (public.is_employee());

-- site_stats: public read, employee write
create policy "site_stats public read" on public.site_stats
  for select using (true);
create policy "site_stats employee write" on public.site_stats
  for all to authenticated using (public.is_employee()) with check (public.is_employee());

-- site_content: public read, employee write
create policy "site_content public read" on public.site_content
  for select using (true);
create policy "site_content employee write" on public.site_content
  for all to authenticated using (public.is_employee()) with check (public.is_employee());

-- service_photos: public reads published (employees see all), employee write
create policy "service_photos read" on public.service_photos
  for select using (published or public.is_employee());
create policy "service_photos employee write" on public.service_photos
  for all to authenticated using (public.is_employee()) with check (public.is_employee());

-- contact_messages: anyone may submit; only employees may read/update/delete
create policy "contact_messages public insert" on public.contact_messages
  for insert with check (true);
create policy "contact_messages employee read" on public.contact_messages
  for select to authenticated using (public.is_employee());
create policy "contact_messages employee update" on public.contact_messages
  for update to authenticated using (public.is_employee()) with check (public.is_employee());
create policy "contact_messages employee delete" on public.contact_messages
  for delete to authenticated using (public.is_employee());

-- ============ storage bucket for service photos ============
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

create policy "service-photos public read" on storage.objects
  for select using (bucket_id = 'service-photos');
create policy "service-photos employee insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'service-photos' and public.is_employee());
create policy "service-photos employee update" on storage.objects
  for update to authenticated using (bucket_id = 'service-photos' and public.is_employee());
create policy "service-photos employee delete" on storage.objects
  for delete to authenticated using (bucket_id = 'service-photos' and public.is_employee());

-- ================= SEED (current site content) =================
-- Seed current site content so public pages never render empty

insert into public.employees (email, full_name) values
  ('cjfrady5@gmail.com', 'Tommy'),
  ('test@thoylawncare.com', 'Test Account')
on conflict (email) do nothing;

insert into public.site_stats (label, value, suffix, sort_order) values
  ('Lawns cared for',        500, '+', 1),
  ('Years of experience',     10, '+', 2),
  ('Satisfaction guaranteed',100, '%', 3),
  ('Response time',           24, 'h', 4);

insert into public.site_content (key, value) values
  ('hero_title',        'A lawn you''ll love coming'),
  ('hero_title_accent', 'home to.'),
  ('hero_lede',         'THOY Lawncare delivers quality lawn care with attention to detail and service you can count on.'),
  ('about_title',       'We treat your yard'),
  ('about_title_accent','like our own.'),
  ('about_p1',          'THOY Lawncare started with a simple idea: show up on time, do careful work, and leave every lawn looking sharp. We''re a local team that takes pride in the details — clean lines, healthy grass, and tidy beds.'),
  ('about_p2',          'From weekly mowing to seasonal cleanups, mulching, and edging, we handle the work so you can enjoy a yard you''re proud of.'),
  ('contact_phone',     '(555) 123-4567'),
  ('contact_email',     'hello@thoylawncare.com'),
  ('contact_area',      'Serving your neighborhood')
on conflict (key) do nothing;
