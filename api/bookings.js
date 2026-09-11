import {isAdmin,requireAdmin,currentUser,databaseRequest,invokeFunction,send} from '../lib/supabase.js';

export default async function handler(request,response){
  try{
    const auth=await currentUser(request);
    if(auth.error)return send(response,...auth.error);
    const admin=isAdmin(auth.user);
    if(request.method==='GET'&&request.query?.scope==='admin'){const guard=await requireAdmin(request);if(guard.error)return send(response,...guard.error);}

    if(request.method==='GET'){
      const fields='id,buyer_name,buyer_email,buyer_phone,quantity,total_amount,status,created_at,concert_id,ticket_type_id,unit_price,concert:concerts(title)';
      let path=`bookings?select=${fields}&order=created_at.desc`;
      if(!admin)path+=`&buyer_email=eq.${encodeURIComponent(auth.user.email||'')}`;
      const result=await databaseRequest(path);
      return send(response,result.status,result.data);
    }

    if(request.method==='POST'){
      const source=request.body||{};
      const allowed=['concert_id','ticket_type_id','buyer_name','buyer_phone','quantity','unit_price','total_amount','status'];
      const booking=Object.fromEntries(allowed.filter(key=>source[key]!==undefined).map(key=>[key,source[key]]));
      booking.buyer_email=auth.user.email||'';
      if(allowed.some(key=>booking[key]===undefined)||!['success','failed'].includes(booking.status))return send(response,400,{message:'Booking thiếu thông tin hoặc trạng thái không hợp lệ.'});
      if(!Number.isInteger(booking.quantity)||booking.quantity<1||booking.quantity>6)return send(response,400,{message:'Số lượng vé phải từ 1 đến 6.'});
      if(booking.total_amount!==booking.unit_price*booking.quantity)return send(response,400,{message:'Tổng tiền không hợp lệ.'});
      const result=await databaseRequest('rpc/place_concert_booking',{method:'POST',body:{p_booking:booking}});
      if(result.status>=400)return send(response,result.data?.code==='22023'?409:502,{message:result.data?.code==='22023'?result.data.message:'Không lưu được đơn. Vui lòng thử lại.'});
      if(result.status>=200&&result.status<300&&booking.status==='success'){
        const createdBooking=Array.isArray(result.data)?result.data[0]:result.data;
        try{
          const notification=await invokeFunction('send-booking-telegram',{booking:createdBooking});
          if(createdBooking)createdBooking.notification={sent:notification?.sent===true};
        }catch(error){
          if(createdBooking)createdBooking.notification={sent:false};
          console.error('Không gửi được thông báo đặt vé.');
        }
      }
      return send(response,result.status,result.data);
    }

    return send(response,405,{message:'Phương thức không được hỗ trợ.'});
  }catch(error){
    return send(response,500,{message:'Lỗi máy chủ. Vui lòng thử lại.'});
  }
}
