# Ouedna + Eloued-main merge

This version keeps the original Ouedna Next.js application as the base and applies the Eloued-main visual direction to the public home page.

## Database safety
- The original Supabase project/config remains in `lib/supabase/config.js`.
- The homepage reads the existing `places` table only.
- No `supabase/schema.sql` from `Eloued-main` was executed or copied into the active migrations.
- No database tables, rows, RLS policies, storage buckets, or Auth users are changed by this merge.
- Existing admin, explore, map, itinerary, archive, community, favorites and authentication routes remain in the original project.

## Important
`Eloued-main/supabase/schema.sql` is intentionally NOT applied because it describes a different schema and contains broad public write policies. If new database tables are needed later, they should be added as a reviewed migration against the existing production schema.

## Source
Visual/UX direction: `Eloued-main` supplied by the user.
Data source: original `ouedna-web-main` Supabase connection and `places` table.
