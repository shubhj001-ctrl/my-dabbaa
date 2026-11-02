# My Dabbaa

A production-oriented foundation for a hyperlocal tiffin marketplace in Chandigarh. Stages 1–4 establish Supabase Auth, guarded role routes, kitchen registration and approval, provider plans and menus, public approved-kitchen discovery, customer requests, in-app notifications, and provider activation payments. Transactional email beyond Auth, food subscriptions, communities, and reviews remain deferred.

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

`.env.example` contains placeholders only. The app requires the public Supabase URL/key and canonical site URL for Auth redirects. `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are server-only Vercel environment variables and must never be exposed to browser code. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the public Checkout key ID. Signup email OTPs are sent by the `send-auth-email` Edge Function through EmailJS; configure its `EMAILJS_*`, `APP_SITE_URL`, and `SEND_EMAIL_HOOK_SECRETS` values as Supabase function secrets, not browser variables. Never commit `.env.local` or expose service-role, Razorpay secret, EmailJS private, or Resend credentials.

## Stage 3 request workflow

Apply `supabase/migrations/20261103000200_customer_requests.sql` after the Stage 2 marketplace migration. Authenticated customers submit and withdraw pending enquiries from kitchen profiles and `/requests`; providers review, accept, or reject enquiries at `/provider/requests`. Customer/provider notifications are written by database triggers and appear on those request pages.

## Supabase Auth email via EmailJS

The Supabase Auth Send Email Hook in `supabase/functions/send-auth-email` calls EmailJS from a server-side Edge Function; EmailJS keys and the Supabase webhook signing secret are never used in browser code. Deploy the function, configure its secrets with the Supabase CLI, then enable it under **Authentication → Hooks → Send Email** using the deployed function URL and matching webhook secret. For signup, the EmailJS template sends the `{{otp_code}}` value for entry on the registration screen. Include `{{confirmation_url}}` for password-recovery and other link-based Auth messages. The confirmation route verifies the Supabase `token_hash` and routes password recovery to `/reset-password`. See the setup details in `PROJECT_GUIDELINES.md`.

Apply `supabase/migrations/20261103000300_profiles_after_email_verification.sql` after the profile foundation migration. It creates the public profile only after Supabase confirms the email OTP; unconfirmed Auth signups do not yet have a `profiles` row.

## Stage 4 provider activation payments

Apply `supabase/migrations/20261103000400_activation_payments.sql` after Stage 3. It adds provider-only payment history, the unique kitchen/customer activation record, restricted customer-contact access, and an atomic activation function. The application uses Razorpay in test mode during development.

Set these Vercel environment variables:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay test key ID; safe for Checkout.
- `RAZORPAY_KEY_SECRET` — Razorpay test API secret; server-only.
- `RAZORPAY_WEBHOOK_SECRET` — a dedicated secret configured on the Razorpay webhook; server-only.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, required for the signed webhook to invoke its narrowly scoped database functions.

Configure the Razorpay test-mode webhook URL as `https://<your-deployment-host>/api/webhooks/razorpay` and subscribe to `payment.captured` and `payment.failed`. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`, redeploy, then test only with Razorpay test credentials. Order creation is server-side for exactly `19900` paise / `INR`. Checkout callbacks do not activate customers; only the HMAC-verified captured-payment webhook can trigger the database transaction that records the activation, unlocks authorized contact details, and creates notifications.

`/provider/payments` lists real activation-payment records and `/provider/customers` reveals consented contact details only for customers activated at a kitchen owned by the signed-in provider. Food subscriptions, their payment, and delivery remain outside the platform. Live webhook delivery and end-to-end Razorpay testing require configured Supabase/Vercel/Razorpay accounts and are not verified by a local build.

The customer request consent explicitly covers sharing the customer's full name, email, and phone with the selected kitchen only after verified activation. Requests created before this Stage 4 consent were recorded are not eligible for payment until the customer explicitly opts in on `/requests`.

### Test-mode acceptance checklist

- Accept a request and confirm the provider alone can create an order for exactly `19900` / `INR`.
- Complete payment in Razorpay test mode and confirm that the customer is activated only after `payment.captured` reaches the verified webhook.
- Replay the same captured webhook and confirm there is still one `kitchen_customers` row and one activation notification per recipient.
- Send a `payment.failed` event or close Checkout and confirm no activation or contact details are unlocked; after a failed event, retry creates a fresh order.
- Try tampered signatures, wrong amounts/currencies, unauthenticated calls, customer-initiated payment calls, and a provider using another kitchen's request; each must be rejected or ignored without activation.
- Confirm repeat activation for the same customer/kitchen is blocked, while the same customer can be activated for a different kitchen.
- Confirm `/provider/payments` contains only real records owned by that provider, and `/provider/customers` returns profile contacts only after consent and verified activation.
- Confirm food subscriptions remain unchanged and no customer food charge is created.
