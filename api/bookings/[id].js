import {requireAdmin,databaseRequest,send,validateChanges,invokeFunction} from '../../lib/supabase.js';
export default async function handler(request,response){
 try{
  const auth=await requireAdmin(request);if(auth.error)return send(response,...auth.error);
  const id=String(request.query.id||'');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return send(response,422,{message:'Mã đơn không hợp lệ.'});
  if(!['GET','PATCH','DELETE'].includes(request.method))return send(response,405,{message:'Phương thức không được hỗ trợ.'});
  let body;
  if(request.method==='PATCH'){body=validateChanges(request.body);if(!body)return send(response,422,{message:'Chỉ được sửa tên, email và số điện thoại hợp lệ.'});}
  if(request.method==='DELETE'&&request.body?.confirm!==true)return send(response,422,{message:'Cần xác nhận xóa đơn.'});
  const result=await databaseRequest('bookings?id=eq.'+encodeURIComponent(id),{method:request.method,body,prefer:'return=representation'});
  if(result.status>=400)return send(response,result.status===409?409:502,{message:result.status===409?'Không thể thay đổi đơn do ràng buộc dữ liệu.':'Không xử lý được đơn. Vui lòng thử lại.'});
  if(!result.data?.length)return send(response,404,{message:'Đơn không còn tồn tại. Hãy làm mới danh sách.'});
  let notification;
  if(request.method!=='GET'){
    const saved=result.data[0];const booking=request.method==='PATCH'?{id:saved.id,buyer_name:saved.buyer_name,buyer_email:saved.buyer_email,buyer_phone:saved.buyer_phone}:{id:saved.id};
    try{await invokeFunction('send-booking-telegram',{event:request.method==='PATCH'?'updated':'deleted',booking});notification={sent:true};}
    catch{notification={sent:false};}
  }
  return send(response,200,request.method==='DELETE'?{deleted:true,notification}:{...result.data[0],...(notification?{notification}:{})});
 }catch{return send(response,500,{message:'Lỗi máy chủ. Vui lòng thử lại.'});}
}
