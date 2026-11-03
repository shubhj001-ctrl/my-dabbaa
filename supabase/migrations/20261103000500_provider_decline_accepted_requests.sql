create function public.decline_accepted_customer_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.customer_requests%rowtype;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
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
    and r.activated_at is null
    and k.owner_id = (select auth.uid())
  for update of r;

  if request_row.id is null then
    raise exception 'An unactivated accepted request for a kitchen you own is required';
  end if;

  if exists (
    select 1
    from public.activation_payments ap
    where ap.request_id = request_row.id
      and ap.status in ('created', 'pending', 'success')
  ) then
    raise exception 'An activation payment is in progress or already completed';
  end if;

  update public.customer_requests r
  set status = 'rejected',
      accepted_at = null,
      rejected_at = now()
  where r.id = request_row.id;
end;
$$;

revoke all on function public.decline_accepted_customer_request(uuid) from public, anon;
grant execute on function public.decline_accepted_customer_request(uuid) to authenticated;
