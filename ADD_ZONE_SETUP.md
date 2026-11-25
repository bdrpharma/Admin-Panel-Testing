# BDR Admin Panel — Add Zone update

This package preserves the existing Admin Panel files and adds the Add Zone flow. `node_modules` is omitted; run `npm install` if needed.

## Files added/updated
- `public/js/modules/features/zones.js`: Add Zone form and Edge Function call.
- `public/js/modules/core/data.js`: loads actual zone names and maps related records.
- `public/js/modules/layout/navigation.js`: updated Zones subtitle.
- `.vscode/settings.json`: enables Deno for Supabase Functions.
- `supabase/config.toml`: disables gateway JWT verification for this demo endpoint.
- `supabase/functions/create-zone/index.ts`: server-side endpoint.
- `supabase/sql/create_zone_with_pins.sql`: database function SQL.

## Setup
1. Open this project folder in VS Code.
2. In Supabase SQL Editor, run `supabase/sql/create_zone_with_pins.sql`.
3. Install Supabase CLI and sign in: `supabase login`.
4. Link the project: `supabase link --project-ref YOUR_PROJECT_REF`.
5. Set the server secret (never put the service-role key in frontend files):
   `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY`
6. Deploy: `supabase functions deploy create-zone --no-verify-jwt`.
7. Run the Admin Panel and test with a small unused PIN range.

## Important security warning
This endpoint is intentionally configured with `verify_jwt = false` to work with the existing demo-only login. That makes the endpoint publicly callable. The function holds the service-role key server-side, but anyone who discovers the endpoint may invoke zone creation. This is suitable only for a controlled demo/test, not production. Add real server-side admin authentication before production use. Do not expose the service-role key in browser code or commit it.
