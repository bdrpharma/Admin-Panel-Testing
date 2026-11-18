# BDR Pharma Admin — Modular Legacy-Compatible Structure

This refactor keeps the original legacy HTML, styles, Supabase queries, mock data, CRUD handlers, filters, charts, and modals. The large inline script has been split into ordered classic JavaScript files so existing `onclick` handlers and shared global state continue to work while you can find each feature quickly.

## Menu structure

1. Dashboard
2. Doctors
3. Users (uses the existing `patients` state and `users` Supabase table)
4. Chemists
5. Medicines
6. Blogs
7. Programs
8. Forms
9. Submissions
10. Notifications
11. Learning Resources
12. FAQ
13. Analytics
14. Zones
15. Guidelines

## Where code lives

- `public/legacy.html` — existing UI markup and styles; imports modules in order.
- `public/js/modules/core/state.js` — Supabase config, global state and mock data.
- `public/js/modules/core/data.js` — login initialization, Supabase loading and data refresh.
- `public/js/modules/layout/navigation.js` — routing, page titles and render dispatch.
- `public/js/modules/shared/ui.js` — shared UI helpers, toast, search, tables and placeholder renderer.
- `public/js/modules/features/doctors.js` — doctor listing, verification, search and filters.
- `public/js/modules/features/users.js` — existing user/patient listing and actions.
- `public/js/modules/features/chemists.js` — chemist management.
- `public/js/modules/features/medicines.js` — medicine management.
- `public/js/modules/features/blogs.js` — blog management.
- `public/js/modules/features/forms.js` — form management.
- `public/js/modules/features/submissions.js` — form submissions.
- `public/js/modules/features/zones.js` — zone overview.
- `public/js/modules/features/analytics.js` — zone analytics charts.
- `public/js/modules/features/programs.js` — Programs menu scaffold.
- `public/js/modules/features/notifications.js` — Notifications page scaffold (separate from the existing bell demo).
- `public/js/modules/features/learning-resources.js` — Learning Resources menu scaffold.
- `public/js/modules/features/faq.js` — FAQ menu scaffold.
- `public/js/modules/features/guidelines.js` — guideline management.
- `public/js/modules/shared/modal-routing.js` — modal utilities and hash routing.

## Important note about new menu items

The original legacy file did not contain complete CRUD/data integrations for Programs, Notifications, Learning Resources, or FAQ. These menu items now have clearly labelled scaffold screens instead of pretending that data exists. The original notification bell demo remains. Implement their database-backed screens after confirming the intended Supabase table names/schema. No new database tables are assumed or created.

## Run

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Supabase project values.
3. Run `npm install` and `npm run dev`.

For security, `.env`, `.git`, and `node_modules` are not included in this ZIP. Never put a Supabase service-role key in browser code.
