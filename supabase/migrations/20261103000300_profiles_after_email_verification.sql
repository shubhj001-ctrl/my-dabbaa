drop trigger if exists on_auth_user_created on auth.users;

create function public.handle_verified_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  profile_name text;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

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
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_verified_auth_user() from public, anon, authenticated;

create trigger on_auth_user_verified
after insert or update of email_confirmed_at on auth.users
for each row
when (new.email_confirmed_at is not null)
execute function public.handle_verified_auth_user();

comment on function public.handle_verified_auth_user() is
  'Creates a public profile only after Supabase Auth confirms the email; public registration roles are restricted to customer/provider.';
