create policy "Trusted admins can read activation payments"
  on public.activation_payments
  for select
  to authenticated
  using (public.is_marketplace_admin());

create function public.get_admin_dashboard_metrics()
returns table (
  provider_count bigint,
  customer_count bigint,
  listed_kitchen_count bigint,
  pending_kitchen_count bigint,
  request_count bigint,
  pending_request_count bigint,
  verified_activation_count bigint,
  verified_activation_revenue_paise bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_marketplace_admin() then
    raise exception 'An active administrator account is required';
  end if;

  return query
  select
    (select count(*) from public.profiles p where p.role = 'provider'),
    (select count(*) from public.profiles p where p.role = 'customer'),
    (select count(*) from public.kitchens k where k.is_listed and k.approval_status = 'approved'),
    (select count(*) from public.kitchens k where k.approval_status = 'pending'),
    (select count(*) from public.customer_requests),
    (select count(*) from public.customer_requests r where r.status = 'pending'),
    (select count(*) from public.activation_payments ap where ap.status = 'success' and ap.activation_applied),
    (select coalesce(sum(ap.amount_paise), 0)::bigint from public.activation_payments ap where ap.status = 'success' and ap.activation_applied);
end;
$$;

revoke all on function public.get_admin_dashboard_metrics() from public, anon;
grant execute on function public.get_admin_dashboard_metrics() to authenticated;
