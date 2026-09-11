-- Booking access goes through authenticated server APIs only.
begin;
alter table public.bookings enable row level security;
revoke all privileges on table public.bookings from anon, authenticated;
commit;
