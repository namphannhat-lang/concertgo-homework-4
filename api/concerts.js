import {requireAdmin,databaseRequest,send} from '../lib/supabase.js';
export const uuidPattern=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
export function validateConcert(source){
  if(!source||typeof source!=='object'||Array.isArray(source)||Object.keys(source).some(k=>!['title','date','venue','tickets'].includes(k)))return null;
  if(['title','date','venue'].some(k=>typeof source[k]!=='string'))return null;
  const title=source.title.trim(),venue=source.venue.trim(),date=source.date;
  if(!title||title.length>160||!venue||venue.length>240||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+07:00$/.test(date))return null;
  const parsed=new Date(date);
  if(!Number.isFinite(parsed.getTime())||date.slice(0,4)<'2020'||date.slice(0,4)>'2100')return null;
  if(new Date(parsed.getTime()+7*3600000).toISOString().slice(0,19)!==date.slice(0,19))return null;
  if(!Array.isArray(source.tickets)||!source.tickets.length||source.tickets.length>20)return null;
  const ids=new Set(),names=new Set(),tickets=[];
  for(const item of source.tickets){
    if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(k=>!['id','name','price','status'].includes(k)))return null;
    if(typeof item.name!=='string'||!item.name.trim()||item.name.trim().length>80||!Number.isSafeInteger(item.price)||item.price<0||item.price>1000000000||!['available','sold_out'].includes(item.status))return null;
    const name=item.name.trim();if(names.has(name.toLowerCase()))return null;names.add(name.toLowerCase());
    const ticket={name,price:item.price,status:item.status};
    if(item.id!==undefined){if(typeof item.id!=='string'||!uuidPattern.test(item.id)||ids.has(item.id.toLowerCase()))return null;ids.add(item.id.toLowerCase());ticket.id=item.id;}
    tickets.push(ticket);
  }
  return {title,date,venue,tickets};
}
export default async function handler(request,response){
  try{
    const id=request.query?.id;
    if(request.method==='GET'&&!id){
      const result=await databaseRequest('concerts?select=id,title,date,venue,ticket_types(id,name,price,status)&deleted_at=is.null&ticket_types.archived=eq.false&order=created_at.asc,id.asc');
      return result.status>=400?send(response,502,{message:'Không tải được danh sách concert.'}):send(response,200,result.data);
    }
    if(!(request.method==='POST'&&!id)&&!(['PATCH','DELETE'].includes(request.method)&&id))return send(response,405,{message:'Phương thức không được hỗ trợ.'});
    const auth=await requireAdmin(request);
    if(auth.error)return send(response,auth.error[0],{message:auth.error[1]});
    if(id&&(typeof id!=='string'||!uuidPattern.test(id)))return send(response,422,{message:'Mã concert không hợp lệ.'});
    const deleting=request.method==='DELETE';
    const payload=deleting?null:validateConcert(request.body);
    if(deleting?request.body?.confirm!==true:!payload)return send(response,422,{message:deleting?'Cần xác nhận xóa concert.':'Kiểm tra tên, ngày giờ, địa điểm, hạng vé và giá vé.'});
    if(!id&&payload.tickets.some(t=>t.id))return send(response,422,{message:'Hạng vé mới không được có mã có sẵn.'});
    const result=await databaseRequest('rpc/manage_concert',{method:'POST',body:{p_id:id||null,p_payload:payload,p_delete:deleting}});
    if(result.status>=400){
      const code=result.data?.code;
      return send(response,code==='P0002'?404:code==='22023'?422:502,{message:code==='P0002'?'Concert không còn tồn tại.':code==='22023'?'Hạng vé không hợp lệ hoặc không thuộc concert này.':'Không lưu được concert. Vui lòng thử lại.'});
    }
    return send(response,request.method==='POST'?201:200,result.data);
  }catch{return send(response,500,{message:'Lỗi máy chủ. Vui lòng thử lại.'});}
}
