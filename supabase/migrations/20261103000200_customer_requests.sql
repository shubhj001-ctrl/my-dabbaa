create table public.customer_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  kitchen_id uuid not null references public.kitchens(id) on delete cascade,
  preferred_meal text not null,
  preferred_start_date date not null,
  message text,
  consent_given boolean not null default false,
  status text not null default 'pending',
  accepted_at timestamptz,
  rejected_at timestamptz,
  withdrawn_at timestamptz,
  customer_name text not null,
  kitchen_name text not null,
  kitchen_photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_requests_meal_valid check (
    preferred_meal in ('breakfast', 'lunch', 'dinner', 'multiple')
  ),
  constraint customer_requests_message_length check (
    message is null or char_length(message) <= 1000
  ),
  constraint customer_requests_consent_required check (consent_given),
  constraint customer_requests_status_valid check (
    status in ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')
  ),
  constraint customer_requests_accepted_timestamp check (
    status <> 'accepted' or accepted_at is not null
  ),
  constraint customer_requests_rejected_timestamp check (
    status <> 'rejected' or rejected_at is not null
  ),
  constraint customer_requests_withdrawn_timestamp check (
    status <> 'withdrawn' or withdrawn_at is not null
  ),
  constraint customer_requests_customer_name_length check (
    char_length(btrim(customer_name)) between 2 and 100
  ),
  constraint customer_requests_kitchen_name_length check (
    char_length(btrim(kitchen_name)) between 2 and 100
  )
);

create index customer_requests_customer_idx
  on public.customer_requests (customer_id, created_at desc);
create index customer_requests_kitchen_idx
  on public.customer_requests (kitchen_id, created_at desc);
create index customer_requests_status_idx
  on public.customer_requests (status, created_at desc);
create unique index customer_requests_one_active_per_kitchen_uidx
  on public.customer_requests (customer_id, kitchen_id)
  where status in ('pending', 'accepted');

create trigger customer_requests_set_updated_at
before update on public.customer_requests
for each row execute function public.set_updated_at();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid references public.customer_requests(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_valid check (
    notification_type in (
      'request_submitted',
      'request_received',
      'request_accepted',
      'request_rejected',
      'request_withdrawn'
    )
  ),
  constraint notifications_title_length check (
    char_length(btrim(title)) between 1 and 120
  ),
  constraint notifications_body_length check (
    char_length(btrim(body)) between 1 and 500
  )
);

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create function public.notify_customer_request_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  kitchen_owner_id uuid;
begin
  if tg_op = 'INSERT' then
    select k.owner_id into kitchen_owner_id
    from public.kitchens k
    where k.id = new.kitchen_id;

    insert into public.notifications (
      recipient_id, request_id, notification_type, title, body
    ) values
      (
        new.customer_id, new.id, 'request_submitted',
        'Request sent', 'Your request to ' || new.kitchen_name || ' is on its way.'
      ),
      (
        kitchen_owner_id, new.id, 'request_received',
        'New food request', new.customer_name || ' is interested in ' || new.kitchen_name || '.'
      );
  elsif new.status is distinct from old.status then
    if new.status = 'accepted' then
      insert into public.notifications (
        recipient_id, request_id, notification_type, title, body
      ) values (
        new.customer_id, new.id, 'request_accepted',
        'Your kitchen said yes!', new.kitchen_name || ' accepted your request. Activation is the next step.'
      );
    elsif new.status = 'rejected' then
      insert into public.notifications (
        recipient_id, request_id, notification_type, title, body
      ) values (
        new.customer_id, new.id, 'request_rejected',
        'An update from ' || new.kitchen_name,
        new.kitchen_name || ' can’t take on this request right now. You can explore other kitchens.'
      );
    elsif new.status = 'withdrawn' then
      select k.owner_id into kitchen_owner_id
      from public.kitchens k
      where k.id = new.kitchen_id;

      insert into public.notifications (
        recipient_id, request_id, notification_type, title, body
      ) values (
        kitchen_owner_id, new.id, 'request_withdrawn',
        'A request was withdrawn', new.customer_name || ' withdrew their request.'
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger customer_requests_notify_changes
after insert or update of status on public.customer_requests
for each row execute function public.notify_customer_request_changes();

create function public.submit_customer_request(
  p_kitchen_id uuid,
  p_preferred_meal text,
  p_preferred_start_date date,
  p_message text,
  p_consent_given boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_customer_name text;
  selected_kitchen public.kitchens%rowtype;
  selected_photo_path text;
  new_request_id uuid;
begin
  if current_user_id is null or not exists (
    select 1 from public.profiles p
    where p.id = current_user_id and p.role = 'customer' and p.is_active
  ) then
    raise exception 'An active customer account is required';
  end if;

  if p_preferred_meal is null
    or p_preferred_meal not in ('breakfast', 'lunch', 'dinner', 'multiple') then
    raise exception 'Choose a valid meal preference';
  end if;

  if p_preferred_start_date is null or p_preferred_start_date < current_date then
    raise exception 'Choose today or a future start date';
  end if;

  if p_consent_given is distinct from true then
    raise exception 'Consent is required before sending a request';
  end if;

  if char_length(btrim(coalesce(p_message, ''))) > 1000 then
    raise exception 'The message must be 1000 characters or fewer';
  end if;

  select p.full_name into current_customer_name
  from public.profiles p
  where p.id = current_user_id;

  select k.* into selected_kitchen
  from public.kitchens k
  where k.id = p_kitchen_id
    and k.approval_status = 'approved'
    and k.is_listed;

  if selected_kitchen.id is null then
    raise exception 'This kitchen is not accepting requests';
  end if;

  select p.storage_path into selected_photo_path
  from public.kitchen_photos p
  where p.kitchen_id = selected_kitchen.id
  order by p.display_order, p.created_at
  limit 1;

  insert into public.customer_requests (
    customer_id, kitchen_id, preferred_meal, preferred_start_date,
    message, consent_given, status, customer_name, kitchen_name,
    kitchen_photo_path
  ) values (
    current_user_id, selected_kitchen.id, p_preferred_meal,
    p_preferred_start_date, nullif(btrim(p_message), ''), true, 'pending',
    current_customer_name, selected_kitchen.kitchen_name, selected_photo_path
  )
  returning id into new_request_id;

  return new_request_id;
end;
$$;

create function public.withdraw_customer_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'customer'
      and p.is_active
  ) then
    raise exception 'An active customer account is required';
  end if;

  update public.customer_requests
  set status = 'withdrawn',
      withdrawn_at = now()
  where id = p_request_id
    and customer_id = (select auth.uid())
    and status = 'pending';

  if not found then
    raise exception 'Pending request not found';
  end if;
end;
$$;

create function public.respond_to_customer_request(
  p_request_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_decision is null or p_decision not in ('accepted', 'rejected') then
    raise exception 'Choose accept or reject';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'provider'
      and p.is_active
  ) then
    raise exception 'An active provider account is required';
  end if;

  update public.customer_requests r
  set status = p_decision,
      accepted_at = case when p_decision = 'accepted' then now() else null end,
      rejected_at = case when p_decision = 'rejected' then now() else null end
  where r.id = p_request_id
    and r.status = 'pending'
    and exists (
      select 1 from public.kitchens k
      where k.id = r.kitchen_id and k.owner_id = (select auth.uid())
    );

  if not found then
    raise exception 'Pending request not found for a kitchen you own';
  end if;
end;
$$;

revoke all on function public.notify_customer_request_changes() from public, anon, authenticated;
revoke all on function public.submit_customer_request(uuid, text, date, text, boolean) from public, anon;
revoke all on function public.withdraw_customer_request(uuid) from public, anon;
revoke all on function public.respond_to_customer_request(uuid, text) from public, anon;
grant execute on function public.submit_customer_request(uuid, text, date, text, boolean) to authenticated;
grant execute on function public.withdraw_customer_request(uuid) to authenticated;
grant execute on function public.respond_to_customer_request(uuid, text) to authenticated;

alter table public.customer_requests enable row level security;
alter table public.notifications enable row level security;

revoke all on public.customer_requests, public.notifications from public, anon, authenticated;
grant select (
  id, preferred_meal, preferred_start_date, message, consent_given, status,
  accepted_at, rejected_at, withdrawn_at, customer_name, kitchen_name,
  kitchen_photo_path, created_at, updated_at
) on public.customer_requests to authenticated;
grant select (
  id, request_id, notification_type, title, body, read_at, created_at
) on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "Customers can read their own requests"
  on public.customer_requests for select to authenticated
  using (customer_id = (select auth.uid()));

create policy "Kitchen owners can read their incoming requests"
  on public.customer_requests for select to authenticated
  using (exists (
    select 1 from public.kitchens k
    where k.id = kitchen_id and k.owner_id = (select auth.uid())
  ));

create policy "Trusted admins can read all customer requests"
  on public.customer_requests for select to authenticated
  using (public.is_marketplace_admin());

create policy "Recipients can read their notifications"
  on public.notifications for select to authenticated
  using (recipient_id = (select auth.uid()));

create policy "Recipients can mark notifications as read"
  on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

comment on table public.customer_requests is
  'Customer enquiries only. Provider acceptance does not activate a customer or reveal contact details.';
comment on column public.customer_requests.customer_name is
  'Name snapshot populated by the trusted submission RPC; contact phone and email are never copied here.';
comment on table public.notifications is
  'In-app request notifications; notification rows are created only by trusted database triggers.';
