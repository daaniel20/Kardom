-- Kardom phase 2: profiles, daily facts, affiliate products, and
-- second-hand items. Second-hand has schema and RLS only; the feature
-- stays disabled for the MVP (no app UI).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  avatar_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.avatar_preference is
  'Chosen later from the profile screen. Examples: boy, man, woman.';

create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id or new.auth_id is distinct from old.auth_id then
    raise exception 'profile id and auth_id cannot change';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_identity
  before update on public.profiles
  for each row
  execute function public.protect_profile_identity();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = auth_id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- A profile row is created when a user signs up. security definer lets the
-- trigger insert despite the absence of an insert policy.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text;
begin
  if jsonb_typeof(new.raw_user_meta_data -> 'display_name') = 'string' then
    display_name = nullif(new.raw_user_meta_data ->> 'display_name', '');
  end if;

  if display_name is null
    and jsonb_typeof(new.raw_user_meta_data -> 'full_name') = 'string'
  then
    display_name = nullif(new.raw_user_meta_data ->> 'full_name', '');
  end if;

  if display_name is null and new.email is not null then
    display_name = nullif(split_part(new.email, '@', 1), '');
  end if;

  if display_name is null then
    display_name = nullif(new.phone, '');
  end if;

  insert into public.profiles (auth_id, display_name)
  values (new.id, display_name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create table public.daily_facts (
  id uuid primary key default gen_random_uuid(),
  hebrew_month smallint not null check (hebrew_month between 1 and 13),
  hebrew_day smallint not null check (hebrew_day between 1 and 30),
  fact_text text not null check (char_length(btrim(fact_text)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.daily_facts.hebrew_month is
  'Hebrew month number: 1 Tishrei through 12 Elul, 13 Adar II.';

create index daily_facts_hebrew_date_idx
  on public.daily_facts (hebrew_month, hebrew_day);

create trigger daily_facts_set_updated_at
  before update on public.daily_facts
  for each row
  execute function public.set_updated_at();

alter table public.daily_facts enable row level security;

create policy daily_facts_public_read
  on public.daily_facts
  for select
  to anon, authenticated
  using (true);

create table public.affiliate_products (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) > 0),
  description text,
  category_tag text,
  tags text[] not null default '{}',
  external_link text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliate_products_category_tag_idx
  on public.affiliate_products (category_tag);

create index affiliate_products_tags_idx
  on public.affiliate_products using gin (tags);

create trigger affiliate_products_set_updated_at
  before update on public.affiliate_products
  for each row
  execute function public.set_updated_at();

alter table public.affiliate_products enable row level security;

create policy affiliate_products_public_read
  on public.affiliate_products
  for select
  to anon, authenticated
  using (true);

create table public.second_hand_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0),
  price numeric(12, 2) not null check (price >= 0),
  category_tag text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.second_hand_items is
  'Schema and RLS only. The second-hand market stays disabled for the MVP.';

comment on column public.second_hand_items.user_id is
  'Owning profile id. Match it to profiles.auth_id = auth.uid() in RLS.';

create index second_hand_items_user_id_idx
  on public.second_hand_items (user_id);

create trigger second_hand_items_set_updated_at
  before update on public.second_hand_items
  for each row
  execute function public.set_updated_at();

alter table public.second_hand_items enable row level security;

create policy second_hand_select_own
  on public.second_hand_items
  for select
  to authenticated
  using (
    user_id in (
      select profiles.id
      from public.profiles
      where profiles.auth_id = auth.uid()
    )
  );

create policy second_hand_insert_own
  on public.second_hand_items
  for insert
  to authenticated
  with check (
    user_id in (
      select profiles.id
      from public.profiles
      where profiles.auth_id = auth.uid()
    )
  );

create policy second_hand_update_own
  on public.second_hand_items
  for update
  to authenticated
  using (
    user_id in (
      select profiles.id
      from public.profiles
      where profiles.auth_id = auth.uid()
    )
  )
  with check (
    user_id in (
      select profiles.id
      from public.profiles
      where profiles.auth_id = auth.uid()
    )
  );

create policy second_hand_delete_own
  on public.second_hand_items
  for delete
  to authenticated
  using (
    user_id in (
      select profiles.id
      from public.profiles
      where profiles.auth_id = auth.uid()
    )
  );

revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to authenticated;

revoke all on table public.daily_facts from anon, authenticated;
grant select on table public.daily_facts to anon, authenticated;

revoke all on table public.affiliate_products from anon, authenticated;
grant select on table public.affiliate_products to anon, authenticated;

revoke all on table public.second_hand_items from anon, authenticated;
grant select, insert, update, delete on table public.second_hand_items to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.protect_profile_identity() from public, anon, authenticated;
