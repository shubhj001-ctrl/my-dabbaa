# My Dabbaa

A production-oriented foundation for a hyperlocal tiffin marketplace in Chandigarh. Stage 1 adds Supabase Auth, guarded role routes, and the initial private profile migration. Marketplace operations, payments, and transactional email are not implemented yet.

## Run locally

1. Install Node.js LTS and npm.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`.
4. Apply the profile migration and configure Supabase Auth redirect URLs (see [PROJECT_GUIDELINES.md](./PROJECT_GUIDELINES.md)).
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

The public homepage, discovery listings, kitchen profiles, and dashboard previews use illustrative sample data from `src/data/mock-data`. Sample kitchens, customer dashboards, provider metrics, activity and testimonials are not live listings or real people. Replace these fixtures with authorized Supabase queries when the corresponding marketplace features are implemented.

## Stack and security

Next.js App Router, strict TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), Supabase Auth/PostgreSQL through `@supabase/ssr`, and Zod. User passwords are handled only by Supabase Auth. The profiles table enables RLS, permits only self-profile reads/limited self-updates, and uses a trusted signed claim for admin profile reads. See [PROJECT_GUIDELINES.md](./PROJECT_GUIDELINES.md) for setup and role provisioning.

## Environment safety

`.env.example` contains placeholders only. The app requires the public Supabase URL/key and the canonical site URL for auth email redirects. Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `RESEND_API_KEY` to browser code. A service-role key is not required by this stage.
