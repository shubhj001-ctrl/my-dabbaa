create type public.kitchen_approval_status as enum (
  'draft',
  'pending',
  'approved',
  'rejected',
  'suspended'
);

create type public.kitchen_food_type as enum (
  'vegetarian',
  'non_vegetarian',
  'both'
);

create type public.kitchen_preparation_type as enum (
  'homemade',
  'cloud_kitchen',
  'tiffin_service'
);

create type public.kitchen_photo_type as enum ('kitchen', 'food');
create type public.kitchen_meal_type as enum ('breakfast', 'lunch', 'dinner');

create table public.kitchens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  kitchen_name text not null,
  contact_name text not null,
  slug text not null unique,
  description text not null,
  contact_phone text not null,
  contact_email text not null,
  address text not null,
  city text not null default 'Chandigarh',
  sector text not null,
  pincode text not null,
  cuisine_types text[] not null,
  food_type public.kitchen_food_type not null,
  preparation_type public.kitchen_preparation_type not null,
  meal_categories public.kitchen_meal_type[] not null,
  avg_daily_capacity integer not null,
  operating_days text[] not null,
  opening_time time not null,
  closing_time time not null,
  approval_status public.kitchen_approval_status not null default 'draft',
  rejection_reason text,
  is_listed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kitchens_name_length check (char_length(btrim(kitchen_name)) between 2 and 100),
  constraint kitchens_contact_name_length check (char_length(btrim(contact_name)) between 2 and 100),
  constraint kitchens_description_length check (char_length(btrim(description)) between 30 and 2000),
  constraint kitchens_address_length check (char_length(btrim(address)) between 5 and 300),
  constraint kitchens_city_chandigarh check (city = 'Chandigarh'),
  constraint kitchens_sector_valid check (sector ~ '^Sector (8|15|17|22|34|35|43|44|46|47|48|49|50|51|52|61|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81)$'),
  constraint kitchens_pincode_valid check (pincode ~ '^[0-9]{6}$'),
  constraint kitchens_cuisines_count check (cardinality(cuisine_types) between 1 and 8),
  constraint kitchens_cuisines_allowed check (cuisine_types <@ array[
    'North Indian', 'Punjabi', 'Gujarati', 'South Indian',
    'Continental', 'Chinese', 'Healthy', 'Other'
  ]::text[]),
  constraint kitchens_meals_count check (cardinality(meal_categories) between 1 and 3),
  constraint kitchens_days_count check (cardinality(operating_days) between 1 and 7),
  constraint kitchens_days_allowed check (operating_days <@ array[
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]::text[]),
  constraint kitchens_capacity_positive check (avg_daily_capacity between 1 and 10000),
  constraint kitchens_contact_phone_valid check (contact_phone ~ '^(\+91)?[6-9][0-9]{9}$'),
  constraint kitchens_contact_email_valid check (contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'),
  constraint kitchens_hours_order check (closing_time > opening_time),
  constraint kitchens_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index kitchens_public_listing_idx
  on public.kitchens (sector, created_at desc)
  where approval_status = 'approved' and is_listed;
create index kitchens_owner_idx on public.kitchens (owner_id, created_at desc);
create index kitchens_meal_categories_idx on public.kitchens using gin (meal_categories);
create index kitchens_cuisine_types_idx on public.kitchens using gin (cuisine_types);

create table public.kitchen_service_areas (
  id uuid primary key default gen_random_uuid(),
  kitchen_id uuid not null references public.kitchens(id) on delete cascade,
  sector text not null,
  pincode text not null,
  locality text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint kitchen_service_areas_sector_valid check (sector ~ '^Sector (8|15|17|22|34|35|43|44|46|47|48|49|50|51|52|61|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81)$'),
  constraint kitchen_service_areas_pincode_valid check (pincode ~ '^[0-9]{6}$'),
  constraint kitchen_service_areas_locality_length check (locality is null or char_length(locality) <= 100),
  constraint kitchen_service_areas_unique_sector unique (kitchen_id, sector)
);

create index kitchen_service_areas_active_idx
  on public.kitchen_service_areas (sector, kitchen_id)
  where is_active;

create table public.kitchen_photos (
  id uuid primary key default gen_random_uuid(),
  kitchen_id uuid not null references public.kitchens(id) on delete cascade,
  image_url text not null,
  storage_path text not null unique,
  image_type public.kitchen_photo_type not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint kitchen_photos_url_length check (char_length(image_url) <= 2048),
  constraint kitchen_photos_order check (display_order between 0 and 30)
);

create index kitchen_photos_display_idx
  on public.kitchen_photos (kitchen_id, display_order, created_at);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  kitchen_id uuid not null references public.kitchens(id) on delete cascade,
  plan_name text not null,
  description text not null,
  meal_type public.kitchen_meal_type not null,
  price numeric(10, 2) not null,
  duration_days integer not null,
  meals_per_week integer not null,
  is_vegetarian boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_plans_name_length check (char_length(btrim(plan_name)) between 2 and 80),
  constraint subscription_plans_description_length check (char_length(btrim(description)) between 10 and 500),
  constraint subscription_plans_price_positive check (price > 0),
  constraint subscription_plans_duration_valid check (duration_days between 1 and 365),
  constraint subscription_plans_meals_valid check (meals_per_week between 1 and 21)
);

create index subscription_plans_public_idx
  on public.subscription_plans (kitchen_id, price)
  where is_active;

create table public.menu_posts (
  id uuid primary key default gen_random_uuid(),
  kitchen_id uuid not null references public.kitchens(id) on delete cascade,
  menu_date date not null,
  meal_type public.kitchen_meal_type not null,
  title text not null,
  description text not null,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_posts_title_length check (char_length(btrim(title)) between 2 and 100),
  constraint menu_posts_description_length check (char_length(btrim(description)) between 10 and 2000),
  constraint menu_posts_image_url_length check (image_url is null or char_length(image_url) <= 2048),
  constraint menu_posts_one_per_meal unique (kitchen_id, menu_date, meal_type)
);

create index menu_posts_public_idx
  on public.menu_posts (kitchen_id, menu_date desc, meal_type)
  where is_published;

create function public.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
        and p.is_active
    ),
    false
  );
$$;

create function public.is_active_provider()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'provider'
      and p.is_active
  );
$$;

create function public.enforce_kitchen_approval_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_marketplace_admin() then
    if tg_op = 'INSERT' then
      new.approval_status := 'draft';
      new.rejection_reason := null;
      new.is_listed := false;
    else
      new.owner_id := old.owner_id;
      if pg_catalog.current_setting('mydabbaa.kitchen_submit', true) = 'true'
        and new.approval_status = 'pending'
        and old.approval_status in ('draft', 'rejected', 'pending', 'approved') then
        new.rejection_reason := null;
        new.is_listed := false;
      elsif row(
        new.kitchen_name, new.contact_name, new.description, new.contact_phone,
        new.contact_email, new.address, new.city, new.sector, new.pincode,
        new.cuisine_types, new.food_type, new.preparation_type,
        new.meal_categories, new.avg_daily_capacity, new.operating_days,
        new.opening_time, new.closing_time
      ) is distinct from row(
        old.kitchen_name, old.contact_name, old.description, old.contact_phone,
        old.contact_email, old.address, old.city, old.sector, old.pincode,
        old.cuisine_types, old.food_type, old.preparation_type,
        old.meal_categories, old.avg_daily_capacity, old.operating_days,
        old.opening_time, old.closing_time
      ) then
        new.approval_status := 'draft';
        new.rejection_reason := null;
        new.is_listed := false;
      else
        new.approval_status := old.approval_status;
        new.rejection_reason := old.rejection_reason;
        new.is_listed := old.is_listed;
      end if;
    end if;
  end if;

  return new;
end;
$$;

create function public.submit_kitchen_application(p_kitchen_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_owner uuid;
begin
  select k.owner_id into application_owner
  from public.kitchens k
  where k.id = p_kitchen_id;

  if application_owner is null or application_owner <> (select auth.uid()) then
    raise exception 'Kitchen not found';
  end if;

  if not public.is_active_provider() then
    raise exception 'Active provider access required';
  end if;

  if not exists (
    select 1 from public.kitchen_photos p where p.kitchen_id = p_kitchen_id
  ) then
    raise exception 'Add at least one kitchen photo before submitting';
  end if;

  if not exists (
    select 1 from public.kitchen_service_areas a
    where a.kitchen_id = p_kitchen_id and a.is_active
  ) then
    raise exception 'Add at least one service area before submitting';
  end if;

  perform pg_catalog.set_config('mydabbaa.kitchen_submit', 'true', true);

  update public.kitchens
  set approval_status = 'pending',
      rejection_reason = null,
      is_listed = false
  where id = p_kitchen_id
    and approval_status in ('draft', 'rejected', 'pending', 'approved');

  perform pg_catalog.set_config('mydabbaa.kitchen_submit', 'false', true);

  if not found then
    raise exception 'This kitchen cannot be submitted in its current state';
  end if;
end;
$$;

create trigger kitchens_enforce_approval_fields
before insert or update on public.kitchens
for each row execute function public.enforce_kitchen_approval_fields();

create trigger kitchens_set_updated_at
before update on public.kitchens
for each row execute function public.set_updated_at();

create trigger subscription_plans_set_updated_at
before update on public.subscription_plans
for each row execute function public.set_updated_at();

create trigger menu_posts_set_updated_at
before update on public.menu_posts
for each row execute function public.set_updated_at();

create function public.review_kitchen(
  p_kitchen_id uuid,
  p_decision public.kitchen_approval_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_marketplace_admin() then
    raise exception 'Administrator access required';
  end if;

  if p_decision not in ('approved', 'rejected', 'suspended') then
    raise exception 'Invalid review decision';
  end if;

  if p_decision = 'rejected' and char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'A rejection reason of at least 10 characters is required';
  end if;

  update public.kitchens
  set approval_status = p_decision,
      rejection_reason = case when p_decision = 'rejected' then btrim(p_reason) else null end,
      is_listed = p_decision = 'approved'
  where id = p_kitchen_id;

  if not found then
    raise exception 'Kitchen not found';
  end if;
end;
$$;

revoke all on function public.is_marketplace_admin() from public, anon;
revoke all on function public.is_active_provider() from public, anon;
revoke all on function public.enforce_kitchen_approval_fields() from public, anon, authenticated;
revoke all on function public.review_kitchen(uuid, public.kitchen_approval_status, text) from public, anon;
revoke all on function public.submit_kitchen_application(uuid) from public, anon;
grant execute on function public.is_marketplace_admin() to authenticated;
grant execute on function public.is_active_provider() to authenticated;
grant execute on function public.review_kitchen(uuid, public.kitchen_approval_status, text) to authenticated;
grant execute on function public.submit_kitchen_application(uuid) to authenticated;
grant usage on type public.kitchen_approval_status, public.kitchen_food_type,
  public.kitchen_preparation_type, public.kitchen_photo_type, public.kitchen_meal_type
  to anon, authenticated;

drop policy if exists "Trusted admins can read profiles" on public.profiles;
create policy "Trusted admins can read profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_marketplace_admin());

alter table public.kitchens enable row level security;
alter table public.kitchen_service_areas enable row level security;
alter table public.kitchen_photos enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.menu_posts enable row level security;

revoke all on public.kitchens, public.kitchen_service_areas, public.kitchen_photos,
  public.subscription_plans, public.menu_posts from anon, authenticated;

grant select on public.kitchens, public.kitchen_service_areas, public.kitchen_photos,
  public.subscription_plans, public.menu_posts to anon, authenticated;
grant insert (
  owner_id, kitchen_name, contact_name, slug, description, contact_phone,
  contact_email, address, city, sector, pincode, cuisine_types, food_type,
  preparation_type, meal_categories, avg_daily_capacity, operating_days,
  opening_time, closing_time
) on public.kitchens to authenticated;
grant update (
  kitchen_name, contact_name, slug, description, contact_phone, contact_email,
  address, city, sector, pincode, cuisine_types, food_type, preparation_type,
  meal_categories, avg_daily_capacity, operating_days, opening_time, closing_time
) on public.kitchens to authenticated;
grant insert, update, delete on public.kitchen_service_areas,
  public.kitchen_photos, public.subscription_plans, public.menu_posts to authenticated;

create policy "Public can read approved listed kitchens"
  on public.kitchens for select to anon, authenticated
  using (approval_status = 'approved' and is_listed);
create policy "Owners can read their kitchens"
  on public.kitchens for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Admins can read all kitchens"
  on public.kitchens for select to authenticated
  using (public.is_marketplace_admin());
create policy "Active providers can create kitchens"
  on public.kitchens for insert to authenticated
  with check (public.is_active_provider() and owner_id = (select auth.uid()));
create policy "Owners can update their kitchens"
  on public.kitchens for update to authenticated
  using (public.is_active_provider() and owner_id = (select auth.uid()))
  with check (public.is_active_provider() and owner_id = (select auth.uid()));
create policy "Admins can update all kitchens"
  on public.kitchens for update to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

create policy "Public can read service areas for approved listed kitchens"
  on public.kitchen_service_areas for select to anon, authenticated
  using (
    is_active and exists (
      select 1 from public.kitchens k
      where k.id = kitchen_id and k.approval_status = 'approved' and k.is_listed
    )
  );
create policy "Owners and admins can read all service areas"
  on public.kitchen_service_areas for select to authenticated
  using (
    exists (
      select 1 from public.kitchens k
      where k.id = kitchen_id
        and (k.owner_id = (select auth.uid()) or public.is_marketplace_admin())
    )
  );
create policy "Owners can manage service areas"
  on public.kitchen_service_areas for all to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ))
  with check (public.is_active_provider() and exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ));

create policy "Public can read photos for approved listed kitchens"
  on public.kitchen_photos for select to anon, authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.approval_status = 'approved' and k.is_listed
  ));
create policy "Owners and admins can read all kitchen photos"
  on public.kitchen_photos for select to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id
      and (k.owner_id = (select auth.uid()) or public.is_marketplace_admin())
  ));
create policy "Owners can manage kitchen photos"
  on public.kitchen_photos for all to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ))
  with check (public.is_active_provider() and exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ));

create policy "Public can read active plans for approved listed kitchens"
  on public.subscription_plans for select to anon, authenticated
  using (
    is_active and exists (
      select 1 from public.kitchens k
      where k.id = kitchen_id and k.approval_status = 'approved' and k.is_listed
    )
  );
create policy "Owners and admins can read all plans"
  on public.subscription_plans for select to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id
      and (k.owner_id = (select auth.uid()) or public.is_marketplace_admin())
  ));
create policy "Owners can manage plans"
  on public.subscription_plans for all to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ))
  with check (public.is_active_provider() and exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ));

create policy "Public can read published menus for approved listed kitchens"
  on public.menu_posts for select to anon, authenticated
  using (
    is_published and exists (
      select 1 from public.kitchens k
      where k.id = kitchen_id and k.approval_status = 'approved' and k.is_listed
    )
  );
create policy "Owners and admins can read all menus"
  on public.menu_posts for select to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id
      and (k.owner_id = (select auth.uid()) or public.is_marketplace_admin())
  ));
create policy "Owners can manage menus"
  on public.menu_posts for all to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ))
  with check (public.is_active_provider() and exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kitchen-images',
  'kitchen-images',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = 4194304,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "Visitors can read photos for approved listed kitchens"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'kitchen-images'
    and exists (
      select 1 from public.kitchens k
      where k.id::text = (storage.foldername(name))[1]
        and k.approval_status = 'approved'
        and k.is_listed
    )
  );
create policy "Owners and admins can read kitchen image objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'kitchen-images'
    and (
      public.is_marketplace_admin()
      or exists (
        select 1 from public.kitchens k
        where k.id::text = (storage.foldername(name))[1]
          and k.owner_id = (select auth.uid())
      )
    )
  );
create policy "Owners can update kitchen image objects"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'kitchen-images'
    and exists (
      select 1 from public.kitchens k
      where k.id::text = (storage.foldername(name))[1]
        and k.owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'kitchen-images'
    and exists (
      select 1 from public.kitchens k
      where k.id::text = (storage.foldername(name))[1]
        and k.owner_id = (select auth.uid())
    )
  );
create policy "Owners can delete kitchen image objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'kitchen-images'
    and exists (
      select 1 from public.kitchens k
      where k.id::text = (storage.foldername(name))[1]
        and k.owner_id = (select auth.uid())
    )
  );
