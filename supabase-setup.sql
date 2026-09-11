-- Chạy một lần trong Supabase Dashboard > SQL Editor.
create table if not exists public.concerts (id uuid primary key, title text not null, date timestamptz not null, venue text not null, image text, created_at timestamptz not null default now());

create table if not exists public.ticket_types (id uuid primary key, concert_id uuid not null references public.concerts(id), name text not null, price numeric not null check (price >= 0), status text not null check (status in ('available', 'sold_out')), max_quantity integer check (max_quantity > 0), created_at timestamptz not null default now());

create table if not exists public.bookings (id uuid primary key default gen_random_uuid(), concert_id uuid not null references public.concerts(id), ticket_type_id uuid not null references public.ticket_types(id), buyer_name text not null, buyer_email text not null, buyer_phone text not null, quantity integer not null check (quantity between 1 and 6), unit_price numeric not null check (unit_price >= 0), total_amount numeric not null check (total_amount = unit_price * quantity), status text not null check (status in ('pending', 'success', 'failed')), created_at timestamptz not null default now());

insert into public.concerts (id, title, date, venue) values ('00000000-0000-4000-8000-000000000001', 'Chạm vào thanh âm', '2026-10-24 19:30:00+07', 'The Global City, TP.HCM') on conflict (id) do nothing;

insert into public.ticket_types (id, concert_id, name, price, status, max_quantity) values
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Standard', 890000, 'available', 6),
('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'VIP', 1590000, 'available', 6),
('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Premium', 2290000, 'available', 6)
on conflict (id) do nothing;

alter table public.concerts enable row level security;
alter table public.ticket_types enable row level security;
alter table public.bookings enable row level security;

-- Quyền booking được cấu hình an toàn trong auth-and-admin-setup.sql.
-- Chạy file đó sau khi tạo tài khoản admin.
