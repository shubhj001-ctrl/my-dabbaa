# My Dabbaa

A production-oriented foundation for a hyperlocal tiffin marketplace in Chandigarh. Stages 1–3 establish Supabase Auth, guarded role routes, kitchen registration and approval, provider plans and menus, public approved-kitchen discovery, customer requests with provider decisions, and in-app notifications. Activation payments and transactional email are deferred.

## Run locally

1. Install Node.js LTS and npm.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
4. Apply all database migrations in timestamp order, configure Supabase Auth redirect URLs, and add the server-only Storage upload key (see [PROJECT_GUIDELINES.md](./PROJECT_GUIDELINES.md)).
5. Start the development server with `npm run dev`.
6. Visit [http://localhost:3000](http://localhost:3000) for the public marketplace homepage. Log in to open a role-guarded dashboard.

Useful commands:

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Application routes

- Authentication: `/register`, `/login`, `/forgot-password`, `/reset-password`
- Customer: `/home`, `/explore`, `/kitchens/[id]`, `/requests`, `/subscriptions`, `/communities`, `/profile`
- Provider: `/provider/dashboard`, `/provider/kitchen`, `/provider/plans`, `/provider/menus`, `/provider/requests`, `/provider/customers`, `/provider/subscriptions`, `/provider/community`, `/provider/payments`
- Administrator: `/admin/dashboard`, `/admin/kitchens`, `/admin/customers`, `/admin/providers`, `/admin/payments`, `/admin/reviews`, `/admin/reports`

The customer area uses route groups so URLs remain short. `/explore` and kitchen details are public; account pages, provider routes, and admin routes are guarded on the server. Admin accounts must be provisioned by a trusted administrator and require a signed `app_metadata.role=admin` claim in addition to the admin profile.

The homepage and discovery pages use approved/listed Supabase kitchens when configured. In local development only, unconfigured Supabase uses clearly labelled fictional kitchen fixtures from `src/data/mock-data`; production never substitutes those fixtures for real listings. Customer dashboard previews and testimonials remain illustrative demo content. The homepage tiffin-box story uses CSS scroll-driven animations with static and reduced-motion fallbacks.

## Stack and security

Next.js App Router, strict TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), Supabase Auth/PostgreSQL/Storage through `@supabase/ssr`, and Zod. User passwords are handled only by Supabase Auth. Kitchen images are stored in a private bucket and served with short-lived signed URLs after RLS authorization. Admin review operations verify both the signed admin JWT claim and active admin profile server-side. See [PROJECT_GUIDELINES.md](./PROJECT_GUIDELINES.md) for setup and role provisioning.

## Environment safety

`.env.example` contains placeholders only. The app requires the public Supabase URL/key and canonical site URL for Auth redirects. Stage 2's validated image endpoint also requires `SUPABASE_SERVICE_ROLE_KEY` as a server-only environment variable; it must never be exposed to browser code. Signup email OTPs are sent by the `send-auth-email` Edge Function through EmailJS; configure its `EMAILJS_*`, `APP_SITE_URL`, and `SEND_EMAIL_HOOK_SECRETS` values as Supabase function secrets, not browser or Vercel variables. Stage 3 request notifications are in-app only. Never commit `.env.local` or expose any service-role, Razorpay, EmailJS private, or Resend secret.

## Stage 3 request workflow

Apply `supabase/migrations/20261103000200_customer_requests.sql` after the Stage 2 marketplace migration. Authenticated customers submit and withdraw pending enquiries from kitchen profiles and `/requests`; providers review, accept, or reject enquiries at `/provider/requests`. Customer/provider notifications are written by database triggers and appear on those request pages. An accepted enquiry remains awaiting the later activation stage: this app does not collect payment or reveal customer phone/email.

## Supabase Auth email via EmailJS

The Supabase Auth Send Email Hook in `supabase/functions/send-auth-email` calls EmailJS from a server-side Edge Function; EmailJS keys and the Supabase webhook signing secret are never used in browser code. Deploy the function, configure its secrets with the Supabase CLI, then enable it under **Authentication → Hooks → Send Email** using the deployed function URL and matching webhook secret. For signup, the EmailJS template sends the `{{otp_code}}` value for entry on the registration screen. Include `{{confirmation_url}}` for password-recovery and other link-based Auth messages. The confirmation route verifies the Supabase `token_hash` and routes password recovery to `/reset-password`. See the setup details in `PROJECT_GUIDELINES.md`.

Apply `supabase/migrations/20261103000300_profiles_after_email_verification.sql` after the profile foundation migration. It creates the public profile only after Supabase confirms the email OTP; unconfirmed Auth signups do not yet have a `profiles` row.
