alter table public.concerts add column if not exists deleted_at timestamptz;
alter table public.ticket_types add column if not exists archived boolean not null default false;

create or replace function public.manage_concert(p_id uuid, p_payload jsonb, p_delete boolean default false)
returns jsonb language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  v_concert_id uuid := p_id;
  item jsonb;
  ticket_id uuid;
  seen uuid[] := '{}';
begin
  if p_id is not null then
    perform 1 from public.concerts where id=p_id and deleted_at is null for update;
    if not found then raise exception 'Concert không còn tồn tại.' using errcode='P0002'; end if;
  end if;
  if p_delete then
    if p_id is null then raise exception 'Thiếu mã concert.' using errcode='22023'; end if;
    update public.concerts set deleted_at=now() where id=p_id;
    update public.ticket_types set archived=true where ticket_types.concert_id=p_id;
    return jsonb_build_object('deleted',true);
  end if;
  if jsonb_typeof(p_payload->'tickets') is distinct from 'array' then
    raise exception 'Cần nhập ít nhất một hạng vé.' using errcode='22023';
  end if;
  if jsonb_array_length(p_payload->'tickets') not between 1 and 20
     or length(btrim(p_payload->>'title')) not between 1 and 160
     or length(btrim(p_payload->>'venue')) not between 1 and 240 then
    raise exception 'Thông tin concert không hợp lệ.' using errcode='22023';
  end if;
  if v_concert_id is null then
    v_concert_id := gen_random_uuid();
    insert into public.concerts(id,title,date,venue) values(v_concert_id,btrim(p_payload->>'title'),(p_payload->>'date')::timestamptz,btrim(p_payload->>'venue'));
  else
    update public.concerts set title=btrim(p_payload->>'title'),date=(p_payload->>'date')::timestamptz,venue=btrim(p_payload->>'venue') where id=v_concert_id;
  end if;
  for item in select value from jsonb_array_elements(p_payload->'tickets') loop
    if length(btrim(item->>'name')) not between 1 and 80 or jsonb_typeof(item->'price') is distinct from 'number'
       or (item->>'price')::numeric not between 0 and 1000000000
       or trunc((item->>'price')::numeric) <> (item->>'price')::numeric
       or coalesce(item->>'status','') not in ('available','sold_out') then
      raise exception 'Hạng vé hoặc giá vé không hợp lệ.' using errcode='22023';
    end if;
    if item->>'id' is not null then
      ticket_id := (item->>'id')::uuid;
      if ticket_id=any(seen) then raise exception 'Hạng vé bị trùng.' using errcode='22023'; end if;
      update public.ticket_types set name=btrim(item->>'name'),price=(item->>'price')::numeric,status=item->>'status',archived=false
        where id=ticket_id and ticket_types.concert_id=v_concert_id and not archived;
      if not found then raise exception 'Hạng vé không thuộc concert này.' using errcode='22023'; end if;
    else
      ticket_id := gen_random_uuid();
      insert into public.ticket_types(id,concert_id,name,price,status,max_quantity)
        values(ticket_id,v_concert_id,btrim(item->>'name'),(item->>'price')::numeric,item->>'status',6);
    end if;
    seen := array_append(seen,ticket_id);
  end loop;
  update public.ticket_types set archived=true where ticket_types.concert_id=v_concert_id and not(id=any(seen));
  return jsonb_build_object('id',v_concert_id);
end $$;
revoke all on function public.manage_concert(uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.manage_concert(uuid,jsonb,boolean) to service_role;
