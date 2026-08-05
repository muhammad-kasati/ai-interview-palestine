-- Migration 010: Palestinian Companies & Company-Specific Interview Questions

-- Palestinian Companies table
create table if not exists public.palestinian_companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_ar     text,
  city        text not null default 'Ramallah',
  size        text default 'medium',   -- startup / small / medium / large
  website     text,
  logo_url    text,
  description text,
  specializations text[] default '{}',
  created_at  timestamptz not null default now()
);

-- RLS: public read
alter table public.palestinian_companies enable row level security;
create policy "Anyone can view companies"
  on public.palestinian_companies for select using (true);

-- Company-specific interview questions table
create table if not exists public.company_questions (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.palestinian_companies(id) on delete cascade,
  position    text not null,  -- e.g. 'frontend', 'backend', 'fullstack'
  question    text not null,
  difficulty  text not null default 'medium',  -- easy / medium / hard
  category    text not null default 'technical',
  tags        text[] default '{}',
  created_at  timestamptz not null default now()
);

-- Index for fast company + position lookup
create index if not exists company_questions_company_position_idx
  on public.company_questions (company_id, position);

-- RLS: public read
alter table public.company_questions enable row level security;
create policy "Anyone can view company questions"
  on public.company_questions for select using (true);

-- Seed: Insert top Palestinian tech companies
insert into public.palestinian_companies (name, name_ar, city, size, specializations, description) values
  ('Exalt Technologies',   'إكسالت تكنولوجيز',   'Ramallah', 'large',   ARRAY['React','Node.js','Java','AWS','DevOps'],           'Leading software outsourcing company in Palestine, working with Fortune 500 clients globally.'),
  ('Asal Technologies',    'أصال تكنولوجيز',     'Ramallah', 'large',   ARRAY['Python','Django','React','PostgreSQL','Docker'],     'Top Palestinian software house specializing in enterprise solutions and digital transformation.'),
  ('Bisan Systems',        'بيسان سيستمز',       'Ramallah', 'medium',  ARRAY['Java','Spring Boot','PostgreSQL','Docker'],           'Enterprise ERP and HR software provider across the Arab world.'),
  ('PalTech',              'بال تك',              'Gaza',     'medium',  ARRAY['React Native','Flutter','Firebase','Node.js'],       'Mobile-first tech company focusing on apps for the Palestinian and MENA market.'),
  ('Jawwal',               'جوال',                'Gaza',     'large',   ARRAY['Telecommunications','Java','Oracle','Linux','AWS'],   'Largest Palestinian telecommunications operator.'),
  ('Makeen',               'مكين',                'Ramallah', 'medium',  ARRAY['React','TypeScript','Python','PostgreSQL'],           'Digital innovation company building solutions for NGOs and government.'),
  ('TechPal',              'تك بال',              'Nablus',   'small',   ARRAY['Vue.js','Laravel','MySQL','DevOps'],                  'Agile startup delivering web and mobile applications for regional clients.'),
  ('SKY Information Systems', 'سكاي',             'Ramallah', 'medium',  ARRAY['Python','Machine Learning','Data Science','AWS'],    'Data analytics and AI consulting firm serving the public sector.'),
  ('PSRC',                 'المركز الفلسطيني',    'Ramallah', 'large',   ARRAY['Research','Data','Python','Statistics'],             'Palestinian Standards and Research Council focused on quality and technology standards.')
on conflict do nothing;
