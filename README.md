# Kardom

Jewish cycle and marketplace. Hebrew is the default locale and right-to-left at `/`. English is left-to-right at `/en`.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sign-in (email, phone, or Apple) uses those public Supabase values. Schema lives in `supabase/migrations`.
