# Supabase setup

The frontend cannot create database tables with the publishable key. Apply
the migrations to the same Supabase project used by `VITE_SUPABASE_URL`.

## Dashboard method

1. Open the Supabase project.
2. Open **SQL Editor** and create a new query.
3. Run `migrations/003_create_attendance_tables.sql`.
4. Create another query and run `migrations/004_secure_attendance_check_in.sql`.
5. Refresh the FestForge attendance page.

Run the files in numerical order. Migration `004` secures the QR token and
adds the server-side `mark_event_attendance` function used by student check-in.
