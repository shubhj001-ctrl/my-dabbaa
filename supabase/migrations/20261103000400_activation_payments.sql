alter table public.customer_requests
  add column activated_at timestamptz;

alter table public.customer_requests
  add column contact_sharing_consent boolean not null default false,
  add column contact_sharing_consent_at timestamptz;

alter table public.customer_requests
  add constraint customer_requests_activated_only_after_acceptance
  check (
    activated_at is null
    or (status = 'accepted' and consent_given and contact_sharing_consent)
  );

alter table public.customer_requests
  add constraint customer_requests_contact_consent_timestamp
  check (
    (contact_sharing_consent and contact_sharing_consent_at is not null)
    or (not contact_sharing_consent and contact_sharing_consent_at is null)
  );

create table public.activation_payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.customer_requests(id) on delete restrict,
  kitchen_id uuid not null references public.kitchens(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  provider_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  kitchen_name text not null,
  amount_paise integer not null default 19900,
  currency text not null default 'INR',
  status text not null default 'created',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  activation_applied boolean not null default false,
  order_claim_token uuid,
  order_claimed_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activation_payments_amount_fixed check (amount_paise = 19900),
  constraint activation_payments_currency_fixed check (currency = 'INR'),
  constraint activation_payments_status_valid check (
    status in ('created', 'pending', 'success', 'failed', 'refunded')
  ),
  constraint activation_payments_customer_name_length check (
    char_length(btrim(customer_name)) between 2 and 100
  ),
  constraint activation_payments_kitchen_name_length check (
    char_length(btrim(kitchen_name)) between 2 and 100
  )
);

create unique index activation_payments_one_open_per_pair_uidx
  on public.activation_payments (kitchen_id, customer_id)
  where status in ('created', 'pending');
create index activation_payments_provider_history_idx
  on public.activation_payments (provider_id, created_at desc);
create index activation_payments_customer_history_idx
  on public.activation_payments (customer_id, created_at desc);
create trigger activation_payments_set_updated_at
before update on public.activation_payments
for each row execute function public.set_updated_at();

create table public.kitchen_customers (
  id uuid primary key default gen_random_uuid(),
  kitchen_id uuid not null references public.kitchens(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  request_id uuid not null unique references public.customer_requests(id) on delete restrict,
  activation_payment_id uuid not null unique references public.activation_payments(id) on delete restrict,
  kitchen_name text not null,
  activated_at timestamptz not null default now(),
  constraint kitchen_customers_unique_kitchen_customer unique (kitchen_id, customer_id)
);

create index kitchen_customers_customer_idx
  on public.kitchen_customers (customer_id, activated_at desc);
create index kitchen_customers_kitchen_idx
  on public.kitchen_customers (kitchen_id, activated_at desc);

alter table public.notifications
  drop constraint notifications_type_valid;
alter table public.notifications
  add constraint notifications_type_valid check (
    notification_type in (
      'request_submitted',
      'request_received',
      'request_accepted',
      'request_rejected',
      'request_withdrawn',
      'customer_activated',
      'provider_activation_paid'
    )
  );
create unique index notifications_activation_once_uidx
  on public.notifications (recipient_id, request_id, notification_type)
  where notification_type in ('customer_activated', 'provider_activation_paid');

create function public.submit_customer_request(
  p_kitchen_id uuid,
  p_preferred_meal text,
  p_preferred_start_date date,
  p_message text,
  p_consent_given boolean,
  p_contact_sharing_consent boolean
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

  if p_consent_given is distinct from true
    or p_contact_sharing_consent is distinct from true then
    raise exception 'Consent to the request and contact sharing is required';
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
    message, consent_given, contact_sharing_consent,
    contact_sharing_consent_at, status, customer_name, kitchen_name,
    kitchen_photo_path
  ) values (
    current_user_id, selected_kitchen.id, p_preferred_meal,
    p_preferred_start_date, nullif(btrim(p_message), ''), true, true,
    now(), 'pending', current_customer_name, selected_kitchen.kitchen_name,
    selected_photo_path
  )
  returning id into new_request_id;

  return new_request_id;
end;
$$;

create function public.authorize_customer_contact_sharing(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'customer'
      and p.is_active
  ) then
    raise exception 'An active customer account is required';
  end if;

  update public.customer_requests r
  set contact_sharing_consent = true,
      contact_sharing_consent_at = now()
  where r.id = p_request_id
    and r.customer_id = (select auth.uid())
    and r.status = 'accepted'
    and r.consent_given
    and not r.contact_sharing_consent;

  if not found then
    raise exception 'Accepted request not found or consent already recorded';
  end if;
end;
$$;

create function public.reserve_activation_payment(
  p_request_id uuid,
  p_claim_token uuid
)
returns table (
  payment_id uuid,
  razorpay_order_id text,
  should_create_order boolean,
  payment_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  request_row public.customer_requests%rowtype;
  existing_payment public.activation_payments%rowtype;
begin
  if current_user_id is null or not exists (
    select 1
    from public.profiles p
    where p.id = current_user_id
      and p.role = 'provider'
      and p.is_active
  ) then
    raise exception 'An active provider account is required';
  end if;

  select r.* into request_row
  from public.customer_requests r
  join public.kitchens k on k.id = r.kitchen_id
  where r.id = p_request_id
    and r.status = 'accepted'
    and r.consent_given
    and r.contact_sharing_consent
    and k.owner_id = current_user_id
  for update of r;

  if request_row.id is null then
    raise exception 'An accepted request for a kitchen you own is required';
  end if;

  if exists (
    select 1
    from public.kitchen_customers kc
    where kc.kitchen_id = request_row.kitchen_id
      and kc.customer_id = request_row.customer_id
  ) or request_row.activated_at is not null then
    raise exception 'This customer is already active for the kitchen';
  end if;

  if exists (
    select 1
    from public.activation_payments ap
    where ap.kitchen_id = request_row.kitchen_id
      and ap.customer_id = request_row.customer_id
      and ap.status = 'success'
  ) then
    raise exception 'An activation payment already exists for this customer and kitchen';
  end if;

  select ap.* into existing_payment
  from public.activation_payments ap
  where ap.kitchen_id = request_row.kitchen_id
    and ap.customer_id = request_row.customer_id
    and ap.status in ('created', 'pending')
  for update;

  if existing_payment.id is null then
    begin
      insert into public.activation_payments (
        request_id,
        kitchen_id,
        customer_id,
        provider_id,
        customer_name,
        kitchen_name,
        order_claim_token,
        order_claimed_at
      )
      values (
        request_row.id,
        request_row.kitchen_id,
        request_row.customer_id,
        current_user_id,
        request_row.customer_name,
        request_row.kitchen_name,
        p_claim_token,
        now()
      )
      returning * into existing_payment;
    exception when unique_violation then
      select ap.* into existing_payment
      from public.activation_payments ap
      where ap.kitchen_id = request_row.kitchen_id
        and ap.customer_id = request_row.customer_id
        and ap.status in ('created', 'pending')
      for update;
    end;
  end if;

  if existing_payment.id is null then
    raise exception 'Unable to reserve the activation payment';
  end if;

  if existing_payment.razorpay_order_id is not null then
    return query select
      existing_payment.id,
      existing_payment.razorpay_order_id,
      false,
      existing_payment.status;
    return;
  end if;

  if existing_payment.order_claim_token = p_claim_token then
    return query select
      existing_payment.id,
      null::text,
      true,
      existing_payment.status;
    return;
  end if;

  if existing_payment.order_claimed_at is not null
    and existing_payment.order_claimed_at > now() - interval '2 minutes' then
    return query select
      existing_payment.id,
      null::text,
      false,
      existing_payment.status;
    return;
  end if;

  update public.activation_payments ap
  set request_id = request_row.id,
      provider_id = current_user_id,
      customer_name = request_row.customer_name,
      kitchen_name = request_row.kitchen_name,
      order_claim_token = p_claim_token,
      order_claimed_at = now()
  where ap.id = existing_payment.id
  returning ap.* into existing_payment;

  return query select
    existing_payment.id,
    existing_payment.razorpay_order_id,
    true,
    existing_payment.status;
end;
$$;

create function public.attach_activation_order(
  p_payment_id uuid,
  p_claim_token uuid,
  p_razorpay_order_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;

  if p_razorpay_order_id is null or char_length(p_razorpay_order_id) > 100 then
    raise exception 'Invalid Razorpay order reference';
  end if;

  update public.activation_payments ap
  set razorpay_order_id = p_razorpay_order_id,
      status = 'pending',
      order_claim_token = null,
      order_claimed_at = null
  where ap.id = p_payment_id
    and ap.order_claim_token = p_claim_token
    and ap.razorpay_order_id is null
    and ap.status = 'created';

  return found;
end;
$$;

create function public.confirm_activation_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_amount_paise integer,
  p_currency text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment_row public.activation_payments%rowtype;
  customer_row public.kitchen_customers%rowtype;
  inserted_customer_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;

  select ap.* into payment_row
  from public.activation_payments ap
  where ap.razorpay_order_id = p_razorpay_order_id
  for update;

  if payment_row.id is null then
    return 'unknown_order';
  end if;

  if p_amount_paise <> 19900 or p_currency <> 'INR'
    or payment_row.amount_paise <> p_amount_paise
    or payment_row.currency <> p_currency then
    return 'amount_or_currency_mismatch';
  end if;

  if payment_row.status = 'success' then
    if payment_row.razorpay_payment_id = p_razorpay_payment_id then
      return 'duplicate';
    end if;
    return 'duplicate_order_payment';
  end if;

  if payment_row.status = 'refunded' then
    return 'refunded';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(payment_row.kitchen_id::text || ':' || payment_row.customer_id::text)
  );

  if not exists (
    select 1
    from public.customer_requests r
    join public.kitchens k on k.id = r.kitchen_id
    where r.id = payment_row.request_id
      and r.kitchen_id = payment_row.kitchen_id
      and r.customer_id = payment_row.customer_id
      and r.status = 'accepted'
      and r.consent_given
      and r.contact_sharing_consent
      and k.owner_id = payment_row.provider_id
  ) then
    return 'request_not_eligible';
  end if;

  update public.activation_payments ap
  set status = 'success',
      razorpay_payment_id = p_razorpay_payment_id,
      paid_at = coalesce(ap.paid_at, now()),
      failed_at = null,
      order_claim_token = null,
      order_claimed_at = null
  where ap.id = payment_row.id;

  insert into public.kitchen_customers (
    kitchen_id,
    customer_id,
    request_id,
    activation_payment_id,
    kitchen_name
  )
  values (
    payment_row.kitchen_id,
    payment_row.customer_id,
    payment_row.request_id,
    payment_row.id,
    payment_row.kitchen_name
  )
  on conflict (kitchen_id, customer_id) do nothing
  returning id into inserted_customer_id;

  if inserted_customer_id is null then
    select kc.* into customer_row
    from public.kitchen_customers kc
    where kc.kitchen_id = payment_row.kitchen_id
      and kc.customer_id = payment_row.customer_id;

    update public.activation_payments ap
    set activation_applied = (customer_row.activation_payment_id = ap.id)
    where ap.id = payment_row.id;

    return 'already_active';
  end if;

  update public.activation_payments ap
  set activation_applied = true
  where ap.id = payment_row.id;

  update public.customer_requests r
  set activated_at = coalesce(r.activated_at, now())
  where r.id = payment_row.request_id;

  insert into public.notifications (
    recipient_id, request_id, notification_type, title, body
  )
  values
    (
      payment_row.customer_id,
      payment_row.request_id,
      'customer_activated',
      'You’re in with ' || payment_row.kitchen_name,
      payment_row.kitchen_name || ' activated your customer profile. The provider will configure your food subscription next.'
    ),
    (
      payment_row.provider_id,
      payment_row.request_id,
      'provider_activation_paid',
      'Customer activated',
      payment_row.customer_name || ' is now an activated customer for ' || payment_row.kitchen_name || '.'
    )
  on conflict (recipient_id, request_id, notification_type)
    where notification_type in ('customer_activated', 'provider_activation_paid')
    do nothing;

  return 'activated';
end;
$$;

create function public.fail_activation_payment(
  p_razorpay_order_id text,
  p_amount_paise integer,
  p_currency text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  payment_row public.activation_payments%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Service role required';
  end if;

  select ap.* into payment_row
  from public.activation_payments ap
  where ap.razorpay_order_id = p_razorpay_order_id
  for update;

  if payment_row.id is null then
    return 'unknown_order';
  end if;

  if p_amount_paise <> 19900 or p_currency <> 'INR'
    or payment_row.amount_paise <> p_amount_paise
    or payment_row.currency <> p_currency then
    return 'amount_or_currency_mismatch';
  end if;

  if payment_row.status = 'success' or payment_row.status = 'refunded' then
    return 'already_processed';
  end if;

  update public.activation_payments ap
  set status = 'failed',
      failed_at = now(),
      order_claim_token = null,
      order_claimed_at = null
  where ap.id = payment_row.id;

  return 'failed';
end;
$$;

create function public.get_provider_activated_customers()
returns table (
  kitchen_customer_id uuid,
  kitchen_id uuid,
  request_id uuid,
  kitchen_name text,
  customer_name text,
  customer_email text,
  customer_phone text,
  preferred_meal text,
  preferred_start_date date,
  request_message text,
  activated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    kc.id,
    kc.kitchen_id,
    kc.request_id,
    kc.kitchen_name,
    p.full_name,
    p.email,
    p.phone,
    r.preferred_meal,
    r.preferred_start_date,
    r.message,
    kc.activated_at
  from public.kitchen_customers kc
  join public.kitchens k
    on k.id = kc.kitchen_id and k.owner_id = (select auth.uid())
  join public.profiles p
    on p.id = kc.customer_id
  join public.activation_payments ap
    on ap.id = kc.activation_payment_id
      and ap.status = 'success'
      and ap.activation_applied
  join public.customer_requests r
    on r.id = kc.request_id
  where p.role = 'customer'
    and p.is_active
    and r.consent_given
    and r.status = 'accepted'
    and r.contact_sharing_consent
    and exists (
      select 1
      from public.profiles provider
      where provider.id = (select auth.uid())
        and provider.role = 'provider'
        and provider.is_active
    )
  order by kc.activated_at desc;
$$;

revoke all on function public.reserve_activation_payment(uuid, uuid) from public, anon;
revoke all on function public.submit_customer_request(uuid, text, date, text, boolean, boolean) from public, anon;
revoke all on function public.authorize_customer_contact_sharing(uuid) from public, anon;
revoke all on function public.attach_activation_order(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.confirm_activation_payment(text, text, integer, text) from public, anon, authenticated;
revoke all on function public.fail_activation_payment(text, integer, text) from public, anon, authenticated;
revoke all on function public.get_provider_activated_customers() from public, anon;
grant execute on function public.reserve_activation_payment(uuid, uuid) to authenticated;
grant execute on function public.submit_customer_request(uuid, text, date, text, boolean, boolean) to authenticated;
grant execute on function public.authorize_customer_contact_sharing(uuid) to authenticated;
grant execute on function public.attach_activation_order(uuid, uuid, text) to service_role;
grant execute on function public.confirm_activation_payment(text, text, integer, text) to service_role;
grant execute on function public.fail_activation_payment(text, integer, text) to service_role;
grant execute on function public.get_provider_activated_customers() to authenticated;

alter table public.activation_payments enable row level security;
alter table public.kitchen_customers enable row level security;

revoke all on public.activation_payments, public.kitchen_customers from public, anon, authenticated;
grant select (
  id, request_id, kitchen_id, customer_id, provider_id, customer_name, kitchen_name,
  amount_paise, currency, status, razorpay_order_id, razorpay_payment_id,
  activation_applied, paid_at, failed_at, created_at, updated_at
) on public.activation_payments to authenticated;
grant select (
  id, kitchen_id, customer_id, request_id, activation_payment_id, kitchen_name, activated_at
) on public.kitchen_customers to authenticated;
grant select (activated_at, contact_sharing_consent) on public.customer_requests to authenticated;

create policy "Providers can read their own activation payment history"
  on public.activation_payments for select to authenticated
  using (
    provider_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'provider'
        and p.is_active
    )
  );

create policy "Customers and kitchen owners can read their activations"
  on public.kitchen_customers for select to authenticated
  using (
    customer_id = (select auth.uid())
    or exists (
      select 1
      from public.kitchens k
      where k.id = kitchen_id
        and k.owner_id = (select auth.uid())
    )
  );

create policy "Customers can read their activation timestamp"
  on public.customer_requests for select to authenticated
  using (customer_id = (select auth.uid()));

comment on table public.activation_payments is
  'Provider-paid ₹199 activation fee records. Status is changed only by signed Razorpay webhook processing.';
comment on table public.kitchen_customers is
  'Customer activation membership. A customer can be activated only once per kitchen.';
comment on function public.get_provider_activated_customers() is
  'Returns authorized customer contact fields only to an active provider who owns the activated kitchen.';
