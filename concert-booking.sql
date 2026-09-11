create or replace function public.place_concert_booking(p_booking jsonb)
returns setof public.bookings language plpgsql security invoker set search_path=public,pg_temp as $$
declare current_price numeric; current_status text;
begin
  select t.price,t.status into current_price,current_status from public.concerts c
    join public.ticket_types t on t.concert_id=c.id
    where c.id=(p_booking->>'concert_id')::uuid and t.id=(p_booking->>'ticket_type_id')::uuid
      and c.deleted_at is null and not t.archived for share of c,t;
  if not found or current_status <> 'available' then
    raise exception 'Concert hoặc hạng vé không còn mở bán. Vui lòng chọn lại.' using errcode='22023';
  end if;
  if current_price <> (p_booking->>'unit_price')::numeric then
    raise exception 'Giá vé đã thay đổi. Vui lòng chọn lại hạng vé.' using errcode='22023';
  end if;
  return query insert into public.bookings(concert_id,ticket_type_id,buyer_name,buyer_email,buyer_phone,quantity,unit_price,total_amount,status)
    values((p_booking->>'concert_id')::uuid,(p_booking->>'ticket_type_id')::uuid,p_booking->>'buyer_name',p_booking->>'buyer_email',p_booking->>'buyer_phone',(p_booking->>'quantity')::integer,current_price,current_price*(p_booking->>'quantity')::integer,p_booking->>'status') returning *;
end $$;
revoke all on function public.place_concert_booking(jsonb) from public,anon,authenticated;
grant execute on function public.place_concert_booking(jsonb) to service_role;
