# Project Guidelines

## Product scope

My Dabbaa is a hyperlocal marketplace connecting customers with independent tiffin providers in Chandigarh, India. The product has three roles: customer, provider, and administrator.

Stage 0 established the UI scaffold. Stage 1 adds Supabase Auth, server-side authorization, and the private `profiles` table foundation. Stage 2 adds provider kitchen applications, admin approval, informational plans and menus, and public discovery of approved listings. Payment processing, transactional email, customer requests, subscriptions, communities, and reviews remain deferred.

## Business rules

- Customer registration is free.
- Provider registration is free, and kitchen registration and public listings remain free.
- Public registration can create customer or provider accounts only. Admin accounts are provisioned through a controlled, privileged setup process.
- Roles are assigned by the Auth-user database trigger from the validated customer/provider registration choice. Unknown role metadata, including `admin`, creates a customer profile.
- A user's role, active status, and email cannot be changed through profile self-service. Only full name, phone, and avatar URL are self-editable.
- Customers may contact providers by phone and submit a request to join a provider's service.
- Before a provider activation is complete, providers may see only the customer's name and request details the customer has authorized.
- A provider accepts a request before paying the one-time ₹199 activation fee.
- A successful activation unlocks only the full customer profile details that the customer authorized.
- The activation fee applies once per unique customer-and-kitchen pair. A repeat activation for the same pair must be idempotent and must not create another fee.
- The activation payment is paid by the provider; customers do not pay this platform fee.
- Providers arrange food subscriptions and collect subscription payments directly from customers. Food subscription payments are not processed by Dabbaa.
- Providers manage their own delivery.
- A customer may join a kitchen's private community after activation with that kitchen.

## Architecture decisions

### Application structure

- Use Next.js App Router with strict TypeScript and server components by default.
- Keep customer routes under `src/app/(customer)` so the grouping does not add a URL segment. Provider and administrator routes have independent layouts under `src/app/provider` and `src/app/admin`.
- Public discovery routes (`/explore` and `/kitchens/[id]`) remain public. Customer account pages use a nested protected route group; provider and admin layouts perform server-side role checks.
- Reuse role-aware presentation in `src/components/layout`; keep product/domain logic out of components and place future service logic in `src/services`.
- Store shared navigation and route configuration in `src/config`, shared types in `src/types`, reusable UI primitives in `src/components/ui`, and hooks in `src/hooks`.
- Use Tailwind CSS v4 and shadcn/ui primitives. Global semantic colors, typography, radius, and surfaces are defined in `src/app/globals.css`.

### Validation and data access

- Validate all untrusted input with Zod on the server before sensitive operations. Client validation may improve feedback but is not a security boundary.
- Supabase browser and server clients have separate modules in `src/lib/supabase`. They use the public project URL and anon key; the service-role key must remain server-only and should only be introduced behind narrowly scoped server operations if required.
- Supabase SSR session cookies are refreshed in `src/proxy.ts`; server layouts and server actions verify the user and role independently. Never rely on UI visibility or Proxy alone for authorization.
- Admin authorization requires both a provisioned admin profile and the signed `app_metadata.role=admin` claim. Never use user-editable `user_metadata` as an authorization source.
- The `profiles` table has RLS enabled. A user can select only their own profile and update only full name, phone, and avatar URL. Admin reads are limited to JWTs carrying the trusted app-metadata role claim. Profile inserts/deletes and role updates are not granted to normal users.
- Passwords are managed only by Supabase Auth. Auth errors returned to public forms are generic, and duplicate registration and password-reset responses avoid account enumeration.
- Plan RLS policies around least privilege: public discovery data is distinct from customer profile data, request details, provider-only data, and administrator operations.
- Protect customer profile access with explicit customer authorization and a verified successful activation for the matching provider/customer pair. Keep the unique pair invariant enforced by database constraints and idempotent server-side payment handling when implemented.
- Supabase Storage buckets and object policies must be explicitly classified as public or private before use. Realtime subscriptions must rely on the same authorization boundaries as reads.
- The checked-in `.env.example` contains placeholders only. Never expose service-role, Razorpay secret, or Resend credentials through `NEXT_PUBLIC_*`.

### Integrations deferred to later stages

- Razorpay is reserved for provider activation payments only. Verify payment results server-side; never trust a client-side success callback as proof of payment.
- Resend is reserved for transactional email.
- Stage 2 database objects are defined in `supabase/migrations/20261103000100_kitchen_marketplace.sql`. Apply it after the Stage 1 profile migration.
- Stage 2 creates a private `kitchen-images` Storage bucket with a 4 MiB per-image limit and JPG, PNG, and WebP allow-list. Uploads are verified by the application route and Storage policies restrict writes to the kitchen owner. Public/administrator previews use signed URLs only after row-level authorization.
- Kitchen listings remain hidden until an administrator approves them. Provider edits return the listing to draft; the provider must resubmit before it can be publicly listed again.
- Subscription plans are informational. Customers contact kitchens and arrange food payments and delivery directly; the platform must not process those payments.
- Supabase Realtime is not required for this stage. Future migrations, Storage buckets, and subscriptions must retain least-privilege RLS.
- Food subscription payments and provider delivery operations stay outside the platform.
- Deploy the Next.js application to Vercel after production environment variables and Supabase policies are configured.

## Stage 2 marketplace setup

1. Keep `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` configured in local `.env.local` and Vercel. No service-role key is used by Stage 2.
2. Set `SUPABASE_SERVICE_ROLE_KEY` in local `.env.local` and Vercel server environment variables. This key is used only by the authenticated, signature-validating image upload route; never expose it with a `NEXT_PUBLIC_` prefix.
3. Apply `supabase/migrations/20261103000100_kitchen_marketplace.sql` after `20261102225200_profiles_auth_foundation.sql`, using the Supabase SQL Editor or `npx supabase db push`.
4. The migration creates the private `kitchen-images` bucket, 4 MiB limit, allowed image MIME types, and Storage RLS policies. Direct browser uploads are denied. The trusted route verifies file signatures and kitchen ownership before uploading with the server-only key. No manual public-bucket setup is needed.
5. Verify the migration completed, then sign in with an active provider account to register a kitchen. New applications remain private until an authorized administrator approves them at `/admin/kitchens`.
6. Add the deployed and local origins to Supabase Auth redirect URLs as described in Stage 1. Marketplace reads and normal mutations use the public anon key and rely on RLS. The service-role key is limited to the validated upload route.

### UX and accessibility

- Use the My Dabbaa visual system: warm white `#FFFDF5`, deep aubergine `#24112F`, electric lime `#C6FF3D`, tomato `#FF5948`, butter `#FFE27A`, and lavender `#C9B8FF`.
- Use bold system display typography, expressive food-first compositions, restrained sticker-like accents, generous spacing, and refined rounded cards. Avoid generic delivery-app or SaaS layouts.
- Keep layouts responsive from mobile upward. Navigation must remain reachable on narrow viewports.
- Use semantic headings, visible keyboard focus, accessible labels for icon-only controls, graceful image fallbacks, and respect reduced-motion preferences.
- Mark all illustrative kitchens, reviews, customer details, and dashboard figures as demo content. Do not present mock data as live marketplace data.
- Avoid exposing personal details in public listings or provider screens before the customer has authorized access.

## Project map

```text
src/
  app/          App Router pages and role layouts
  components/   Shared layout and UI components
  config/       Navigation and application configuration
  hooks/        Reusable React hooks
  lib/          Framework, environment, and Supabase client helpers
  services/     Future business and integration services
  types/        Shared TypeScript types
supabase/
  functions/    Reserved for future Edge Functions
  migrations/   Reserved for future SQL migrations
public/         Static assets
```

## Stage 1 Supabase setup

1. Create a Supabase project and copy its project URL and publishable/anon key into `.env.local` together with `NEXT_PUBLIC_SITE_URL`.
2. Apply `supabase/migrations/20261102225200_profiles_auth_foundation.sql` using the Supabase SQL Editor, or initialize/link the Supabase CLI and run `npx supabase db push`.
3. In Supabase Auth, enable email/password sign-in, set the minimum password length to 12, and decide whether email confirmation is required.
4. Set the Auth Site URL to the local or production app origin. Add `/auth/callback` to the allowed redirect URLs for local and production environments.
5. Configure a production SMTP provider and review the confirmation and recovery email templates. Their links must retain the application's `/auth/callback` redirect.
6. Create/invite the Auth user through a trusted admin process with `full_name` and `phone` user metadata, then provision the role using the Supabase SQL Editor as a project administrator. Never grant that role through `/register`.

For controlled admin provisioning, replace the UUID with the invited Auth user's ID and run this as a trusted database administrator:

```sql
begin;

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'AUTH_USER_UUID';

update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';

commit;
```

Verify that both updates affected one row, then have the admin sign in again so the refreshed JWT contains the signed app-metadata claim.

The role claim is part of the signed `app_metadata` JWT and may require the administrator to sign in again after provisioning. Never use the service-role key in the application browser bundle.
