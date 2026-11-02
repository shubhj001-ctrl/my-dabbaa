create type public.app_role as enum ('customer', 'provider', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  role public.app_role not null default 'customer',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (
    char_length(btrim(full_name)) between 2 and 100
  ),
  constraint profiles_email_not_blank check (btrim(email) <> ''),
  constraint profiles_phone_not_blank check (btrim(phone) <> '')
);

create index profiles_role_active_idx
  on public.profiles (role)
  where is_active;

create unique index profiles_email_lower_uidx
  on public.profiles (lower(email));

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  profile_name text;
begin
  requested_role := new.raw_user_meta_data ->> 'role';
  profile_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');

  if profile_name is null then
    profile_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
  end if;

  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(profile_name, 'New member'),
    new.email,
    nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''),
    case
      when requested_role = 'provider' then 'provider'::public.app_role
      else 'customer'::public.app_role
    end
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_profile_email();

create function public.is_trusted_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.sync_profile_email() from public, anon, authenticated;
revoke all on function public.is_trusted_admin() from public, anon;
grant execute on function public.is_trusted_admin() to authenticated;

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant usage on type public.app_role to authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone, avatar_url)
  on table public.profiles
  to authenticated;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Trusted admins can read profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_trusted_admin());

create policy "Users can update permitted fields on their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

comment on table public.profiles is
  'Private account profiles. Public registration can create customer or provider roles only.';

comment on function public.handle_new_auth_user() is
  'Creates a profile for an Auth user. Unrecognized or admin user metadata is always assigned customer.';

comment on function public.is_trusted_admin() is
  'Reads the signed app_metadata role claim; user-editable user_metadata is never used for authorization.';
