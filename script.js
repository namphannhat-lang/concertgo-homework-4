const IS_FILE_PAGE=window.location.protocol==='file:';
const IS_LOCAL_PAGE=['localhost','127.0.0.1'].includes(window.location.hostname);
const API_BASE=IS_FILE_PAGE?'http://localhost:3001':IS_LOCAL_PAGE&&window.location.port!=='3001'?'http://localhost:3001':'';
let supabaseClient;
const APP_REDIRECT_URL=IS_FILE_PAGE?'http://localhost:3001/index.html':`${window.location.origin}${window.location.pathname}`;
const CONCERT_ID='00000000-0000-4000-8000-000000000001';
let tickets=[{id:'00000000-0000-4000-8000-000000000101',name:'Standard',price:890000,status:'available',note:'Khu đứng · Gần sân khấu'},{id:'00000000-0000-4000-8000-000000000102',name:'VIP',price:1590000,status:'available',note:'Khu riêng · Lối vào ưu tiên'},{id:'00000000-0000-4000-8000-000000000103',name:'Premium',price:2290000,status:'available',note:'Gần nghệ sĩ · Quà giới hạn'}];
let selectedConcert={id:CONCERT_ID,title:'Chạm vào thanh âm',date:'2026-10-24T19:30:00+07:00',venue:'The Global City, TP.HCM'};
const state={ticket:null,quantity:1,buyer:{name:'',email:'',phone:''},processing:false,session:null,isAdmin:false,authMode:'login'};
const money=new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'});
const byId=id=>document.getElementById(id);
let checkoutPending=false;
function requestCheckoutLogin(){
  checkoutPending=Boolean(state.ticket);
  setAuthMode('login');
  show('authScreen');
  byId('authMessage').textContent='Bạn cần đăng nhập để tiếp tục đặt vé. Hạng vé, số lượng và thông tin đang nhập được giữ lại trong trang này.';
}
function resumeAfterLogin(){
  if(checkoutPending&&state.ticket){
    checkoutPending=false;
    byId('detailsSummary').innerHTML=summary();
    show('detailsScreen');
  }else show('discoverScreen');
}
function show(id){
  if(['detailsScreen','reviewScreen'].includes(id)){
    if(!state.ticket){show('ticketsScreen');return;}
    if(!state.session){requestCheckoutLogin();return;}
  }
document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===id));window.scrollTo({top:0,behavior:'smooth'});}
function total(){return state.ticket?state.ticket.price*state.quantity:0;}
function renderTickets(){byId('ticketList').innerHTML=tickets.map(t=>`<button class="ticket ${state.ticket?.id===t.id?'selected':''}" data-ticket="${t.id}" ${t.status==='sold_out'?'disabled':''} aria-pressed="${state.ticket?.id===t.id}"><span class="ticket-top"><strong>${escapeHtml(t.name)}</strong><b>${t.status==='sold_out'?'Hết vé':state.ticket?.id===t.id?'✓ Đã chọn':'Còn vé'}</b></span><span class="note">${escapeHtml(t.note||'')}</span><span class="price">${money.format(t.price)}</span></button>`).join('');document.querySelectorAll('[data-ticket]').forEach(button=>button.addEventListener('click',()=>{state.ticket=tickets.find(t=>t.id===button.dataset.ticket);state.quantity=1;renderTickets();renderSelection();}));}
function renderSelection(){byId('quantity').textContent=state.ticket?state.quantity:'—';byId('total').textContent=state.ticket?money.format(total()):'Chưa chọn vé';byId('minus').disabled=!state.ticket||state.quantity<=1;byId('plus').disabled=!state.ticket||state.quantity>=6;byId('continueButton').disabled=!state.ticket;}
function summary(){return `<aside class="summary"><div class="art"></div><p class="eyebrow">ĐƠN ĐẶT VÉ</p><h3>${escapeHtml(selectedConcert.title)}</h3><dl><div><dt>Thời gian</dt><dd>${escapeHtml(concertDate(selectedConcert.date))}</dd></div><div><dt>Địa điểm</dt><dd>${escapeHtml(selectedConcert.venue)}</dd></div><div><dt>Hạng vé</dt><dd>${escapeHtml(state.ticket.name)} × ${state.quantity}</dd></div></dl><div class="sum"><span>Tổng cộng</span><strong>${money.format(total())}</strong></div></aside>`;}
function validate(){const errors={};if(!state.buyer.name.trim())errors.name='Vui lòng nhập họ và tên.';if(!/^\S+@\S+\.\S+$/.test(state.buyer.email))errors.email='Email chưa đúng định dạng.';if(!/^[0-9]{9,11}$/.test(state.buyer.phone.replace(/\s/g,'')))errors.phone='Số điện thoại cần có 9–11 chữ số.';['name','email','phone'].forEach(k=>byId(`${k}Error`).textContent=errors[k]||'');return !Object.keys(errors).length;}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function bookingCode(id){return id?'CG-'+String(id).toUpperCase():'';}
function statusLabel(status){return status==='success'?'Thành công':status==='failed'?'Thất bại':'Đang xử lý';}
function setAuthMode(mode){state.authMode=mode;const login=mode==='login';byId('authTitle').textContent=login?'Đăng nhập':'Đăng ký';byId('authSubmit').textContent=login?'Đăng nhập':'Tạo tài khoản';byId('loginTab').classList.toggle('active',login);byId('registerTab').classList.toggle('active',!login);byId('authPassword').autocomplete=login?'current-password':'new-password';byId('authMessage').textContent='';}
let authRevision=0;
function applyAuthState(session){const revision=++authRevision;if(state.session?.user?.id!==session?.user?.id){byId('bookingList').replaceChildren();document.querySelectorAll('dialog[open]').forEach(d=>d.close());}state.session=session;state.isAdmin=false;updateConcertAccess();byId('authUser').textContent=session?(state.isAdmin?`Admin · ${session.user.email}`:session.user.email):'';byId('authButton').textContent=session?'Đăng xuất':'Đăng nhập';byId('bookingsButton').textContent=state.isAdmin?'Quản lý đặt vé':'Vé đã đặt';byId('bookingEyebrow').textContent=state.isAdmin?'QUẢN TRỊ':'VÉ CỦA TÔI';byId('bookingsTitle').textContent=state.isAdmin?'Danh sách người đặt vé':'Vé đã đặt của tôi';byId('buyerEmail').readOnly=Boolean(session);if(session){byId('buyerEmail').value=session.user.email;setTimeout(()=>{if(revision===authRevision)verifyPermissions(revision);},0);}else{byId('buyerEmail').value='';if(document.querySelector('#detailsScreen.active, #reviewScreen.active'))requestCheckoutLogin();}}
async function verifyPermissions(revision){byId('bookingFeedback').textContent='Đang xác minh quyền truy cập…';try{const access=await apiRequest('/api/me');if(revision!==authRevision)return;state.isAdmin=access.isAdmin===true;updateConcertAccess();byId('authUser').textContent=(state.isAdmin?'Admin · ':'')+access.email;byId('bookingsButton').textContent=state.isAdmin?'Quản lý đặt vé':'Vé đã đặt';byId('bookingEyebrow').textContent=state.isAdmin?'QUẢN TRỊ':'VÉ CỦA TÔI';byId('bookingsTitle').textContent=state.isAdmin?'Tất cả đơn đặt vé':'Vé đã đặt của tôi';byId('bookingFeedback').textContent=state.isAdmin?'Bạn có quyền xem, sửa thông tin và xóa đơn của tất cả tài khoản.':'';if(byId('bookingsScreen').classList.contains('active'))loadBookings();}catch(error){if(revision!==authRevision)return;byId('bookingFeedback').textContent='Không xác minh được quyền: '+error.message;byId('authUser').textContent='Chưa xác minh được quyền';}}
async function handleAuthSubmit(event){
  event.preventDefault();
  const emailInput=byId('authEmail');
  const email=emailInput.value.trim();
  const password=byId('authPassword').value;
  const button=byId('authSubmit');
  const registering=state.authMode==='register';
  const duplicateMessage='Đăng ký thất bại: Email này đã được sử dụng. Vui lòng nhập email khác và đăng ký lại.';
  if(!supabaseClient){
    byId('authMessage').textContent='Chưa kết nối được máy chủ. Hãy chạy start-website.bat rồi mở http://localhost:3001/index.html.';
    return;
  }
  if(button.disabled)return;
  button.disabled=true;
  byId('authMessage').textContent=registering?'Đang tạo tài khoản…':'Đang đăng nhập…';
  try{
    let authenticatedSession;
    if(registering){
      const {data,error}=await supabaseClient.auth.signUp({email,password,options:{emailRedirectTo:APP_REDIRECT_URL}});
      if(error)throw error;
      // Supabase can mask an existing confirmed user with an empty identities array.
      if(!data?.session&&Array.isArray(data?.user?.identities)&&data.user.identities.length===0){
        byId('authMessage').textContent=duplicateMessage;
        emailInput.focus();
        emailInput.select();
        return;
      }
      if(!data?.session){
        byId('authMessage').textContent='Hãy kiểm tra email để xác nhận tài khoản trước khi đăng nhập.';
        return;
      }
      authenticatedSession=data.session;
    }else{
      const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error)throw error;
      authenticatedSession=data?.session;
    }
    if(!authenticatedSession)throw new Error('Chưa có phiên đăng nhập. Vui lòng đăng nhập lại.');
    applyAuthState(authenticatedSession);
    byId('authForm').reset();
    resumeAfterLogin();
  }catch(error){
    const duplicate=registering&&(
      ['user_already_exists','email_exists'].includes(error.code)||
      /^(user already registered|email already (?:exists|registered))\.?$/i.test(error.message||'')
    );
    byId('authMessage').textContent=duplicate?duplicateMessage:`Không thành công: ${error.message}`;
    if(duplicate){emailInput.focus();emailInput.select();}
  }finally{
    button.disabled=false;
    button.textContent=state.authMode==='login'?'Đăng nhập':'Tạo tài khoản';
  }
}
let sessionRefreshPromise=null;
async function apiRequest(path,method='GET',data,retried=false){if(!state.session)throw Object.assign(new Error('Bạn cần đăng nhập.'),{status:401});let response;try{response=await fetch(`${API_BASE}${path}`,{method,headers:{Authorization:`Bearer ${state.session.access_token}`,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});}catch(error){throw new Error('Không kết nối được máy chủ lưu dữ liệu ở cổng 3001. Hãy mở start-website.bat và giữ cửa sổ đó hoạt động.');}if(response.status===401&&!retried&&supabaseClient){if(!sessionRefreshPromise)sessionRefreshPromise=supabaseClient.auth.refreshSession().finally(()=>{sessionRefreshPromise=null;});const refreshed=await sessionRefreshPromise;if(refreshed.error){
  const invalid=['refresh_token_not_found','refresh_token_already_used','session_not_found','session_expired'].includes(refreshed.error.code);
  throw Object.assign(new Error(invalid?'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.':'Tạm thời không làm mới được đăng nhập. Vui lòng thử lại.'),{status:invalid?401:503});
}
if(!refreshed.data?.session){throw Object.assign(new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'),{status:401});}state.session=refreshed.data.session;return apiRequest(path,method,data,true);}const text=await response.text();let result={};if(text){try{result=JSON.parse(text);}catch{result={message:text};}}if(!response.ok)throw Object.assign(new Error(result.message||`Máy chủ trả về lỗi HTTP ${response.status}.`),{status:response.status});return result;}
async function supabaseChange(id,method,data){if(!state.isAdmin)throw new Error('Chỉ admin được thực hiện thao tác này.');return apiRequest(`/api/bookings/${encodeURIComponent(id)}`,method,data);}
async function editBooking(item){
 const dialog=byId('bookingDialog');const form=byId('adminForm');byId('adminMessage').textContent='';
 byId('adminDetail').textContent='Mã đặt vé: '+bookingCode(item.id)+' · '+item.quantity+' vé · '+money.format(item.total_amount)+' · '+statusLabel(item.status);
 form.elements.buyer_name.value=item.buyer_name;form.elements.buyer_email.value=item.buyer_email;form.elements.buyer_phone.value=item.buyer_phone;
 form.onsubmit=async event=>{event.preventDefault();const button=byId('adminSave');button.disabled=true;try{const result=await supabaseChange(item.id,'PATCH',Object.fromEntries(new FormData(form)));dialog.close();await loadBookings();byId('bookingFeedback').textContent='Đã cập nhật thông tin đặt vé. '+(result.notification?.sent?'Đã gửi thông báo Telegram.':'Chưa gửi được thông báo Telegram.');}catch(error){byId('adminMessage').textContent=error.message;}finally{button.disabled=false;}};
 dialog.showModal();
}
async function deleteBooking(item){
 const dialog=byId('deleteDialog');byId('deleteMessage').textContent='';byId('deleteDetail').textContent=item.buyer_name+' · '+item.quantity+' vé · '+money.format(item.total_amount);
 byId('confirmDelete').onclick=async()=>{const button=byId('confirmDelete');button.disabled=true;try{const result=await supabaseChange(item.id,'DELETE',{confirm:true});dialog.close();await loadBookings();byId('bookingFeedback').textContent='Đã xóa đơn đặt vé. '+(result.notification?.sent?'Đã gửi thông báo Telegram.':'Chưa gửi được thông báo Telegram.');}catch(error){byId('deleteMessage').textContent=error.message;}finally{button.disabled=false;}};dialog.showModal();
}
let bookingsRevision=0;
async function loadBookings(){const requestRevision=++bookingsRevision;const sessionId=state.session?.user?.id;const list=byId('bookingList');if(!state.session){show('authScreen');byId('authMessage').textContent='Hãy đăng nhập để xem vé đã đặt.';return;}list.innerHTML='<p class="list-message">Đang tải danh sách…</p>';byId('refreshBookings').disabled=true;try{const access=await apiRequest('/api/me');if(requestRevision!==bookingsRevision||sessionId!==state.session?.user?.id)return;const canManage=access.isAdmin===true;const bookings=await apiRequest(canManage?'/api/bookings?scope=admin':'/api/bookings');if(requestRevision!==bookingsRevision||sessionId!==state.session?.user?.id)return;state.isAdmin=canManage;byId('bookingsTitle').textContent=canManage?'Tất cả đơn đặt vé':'Vé đã đặt của tôi';byId('bookingFeedback').textContent=canManage?'Quản trị: '+access.email+' · Chọn Sửa thông tin hoặc Xóa đơn bên dưới mỗi đơn.':'Tài khoản: '+access.email+' · Bạn chỉ có quyền xem vé của mình.';if(!bookings.length){list.innerHTML=`<p class="list-message">${canManage?'Chưa có người đặt vé.':'Bạn chưa đặt vé nào.'}</p>`;return;}list.innerHTML=bookings.map((item,index)=>`<article class="booking-person"><div class="booking-concert"><small>Tên concert</small><strong>${escapeHtml(item.concert?.title||'Không còn thông tin concert')}</strong></div><div><small>Người đặt</small><strong>${escapeHtml(item.buyer_name)}</strong></div><div><small>Liên hệ</small><span>${escapeHtml(item.buyer_email)}<br>${escapeHtml(item.buyer_phone)}</span></div><div><small>Đơn vé</small><span class="booking-code">${escapeHtml(bookingCode(item.id))}</span><span>${item.quantity} vé · ${money.format(item.total_amount)}</span></div><span class="booking-status">${statusLabel(item.status)}</span>${canManage?`<div class="booking-actions"><button data-edit-booking="${index}">Sửa thông tin</button><button class="delete-booking" data-delete-booking="${index}">Xóa đơn</button></div>`:''}</article>`).join('');if(canManage){list.querySelectorAll('[data-edit-booking]').forEach(button=>button.addEventListener('click',()=>editBooking(bookings[Number(button.dataset.editBooking)])));list.querySelectorAll('[data-delete-booking]').forEach(button=>button.addEventListener('click',()=>deleteBooking(bookings[Number(button.dataset.deleteBooking)])));}}catch(error){if(requestRevision!==bookingsRevision||sessionId!==state.session?.user?.id)return;list.innerHTML=`<p class="list-message">Không tải được: ${escapeHtml(error.message)}</p>`;}finally{if(requestRevision===bookingsRevision)byId('refreshBookings').disabled=false;}}
async function saveBooking(status){if(!state.session)throw Object.assign(new Error('Bạn cần đăng nhập trước khi đặt vé.'),{status:401});const response=await apiRequest('/api/bookings','POST',{concert_id:selectedConcert.id,ticket_type_id:state.ticket.id,buyer_name:state.buyer.name.trim(),buyer_phone:state.buyer.phone.replace(/\s/g,''),quantity:state.quantity,unit_price:state.ticket.price,total_amount:total(),status});return Array.isArray(response)?response[0]:response;}
async function processPayment(){
  if(state.processing)return;
  if(!state.session){requestCheckoutLogin();return;}
  if(!state.ticket){show('ticketsScreen');return;}
  if(!validate()){show('detailsScreen');return;}
  state.processing=true;const button=byId('payButton');button.disabled=true;button.textContent='Đang xử lý…';
  byId('saveNotice').textContent='Đang xác nhận đặt vé…';byId('saveNotice').classList.remove('save-error');
  try{
    const created=await saveBooking('success');
    byId('resultIcon').textContent='✓';byId('resultTitle').textContent='Đặt vé thành công';
    byId('resultMessage').textContent='Vé của bạn đã được đặt. Hãy lưu mã đặt vé bên dưới để tra cứu.';
    byId('resultBookingCode').textContent=bookingCode(created?.id);byId('resultBookingCode').parentElement.hidden=!created?.id;
    byId('resultNotification').textContent=created?.notification?.sent?'Đã gửi thông báo đặt vé kèm mã đến Telegram.':'Đơn đã được lưu. Chưa gửi được thông báo Telegram; bạn không cần đặt lại.';
    byId('resultSummary').innerHTML=summary();byId('retryButton').style.display='none';show('resultScreen');
  }catch(error){
    if(error.status===401){applyAuthState(null);requestCheckoutLogin();return;}
    byId('saveNotice').textContent=`Không lưu được: ${error.message}`;byId('saveNotice').classList.add('save-error');
  }finally{state.processing=false;button.disabled=false;button.textContent='Xác nhận & thanh toán';}
}
document.querySelectorAll('[data-open-tickets]').forEach(b=>b.addEventListener('click',()=>byId('additionalConcerts').scrollIntoView({behavior:'smooth'})));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));byId('homeButton').addEventListener('click',()=>show('discoverScreen'));byId('authButton').addEventListener('click',async()=>{if(state.session){await supabaseClient.auth.signOut();show('discoverScreen');}else{setAuthMode('login');show('authScreen')}});byId('loginTab').addEventListener('click',()=>setAuthMode('login'));byId('registerTab').addEventListener('click',()=>setAuthMode('register'));byId('authForm').addEventListener('submit',handleAuthSubmit);byId('bookingsButton').addEventListener('click',()=>{if(!state.session){setAuthMode('login');show('authScreen');byId('authMessage').textContent='Hãy đăng nhập để xem vé đã đặt.';return;}show('bookingsScreen');loadBookings()});byId('refreshBookings').addEventListener('click',loadBookings);byId('minus').addEventListener('click',()=>{state.quantity=Math.max(1,state.quantity-1);renderSelection()});byId('plus').addEventListener('click',()=>{state.quantity=Math.min(6,state.quantity+1);renderSelection()});byId('continueButton').addEventListener('click',()=>{if(!state.session){requestCheckoutLogin();return;}byId('detailsSummary').innerHTML=summary();show('detailsScreen')});
byId('buyerForm').addEventListener('submit',event=>{event.preventDefault();if(!state.session){requestCheckoutLogin();return;}byId('buyerEmail').value=state.session.user.email;state.buyer={name:byId('buyerName').value,email:byId('buyerEmail').value,phone:byId('buyerPhone').value};if(validate()){byId('reviewName').textContent=state.buyer.name;byId('reviewContact').textContent=`${state.buyer.email} · ${state.buyer.phone}`;byId('reviewSummary').innerHTML=summary();show('reviewScreen')}});byId('payButton').addEventListener('click',()=>processPayment());byId('retryButton').addEventListener('click',()=>processPayment());byId('restartButton').addEventListener('click',()=>{state.ticket=null;state.quantity=1;renderTickets();renderSelection();show('discoverScreen')});
async function initializeApp(){try{const response=await fetch(`${API_BASE}/api/config`);if(!response.ok)throw new Error(`HTTP ${response.status}`);const config=await response.json();supabaseClient=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey);const {data,error}=await supabaseClient.auth.getSession();if(error)throw error;applyAuthState(data.session);supabaseClient.auth.onAuthStateChange((_event,session)=>{applyAuthState(session);});}catch(error){byId('authUser').textContent='Máy chủ local chưa chạy';byId('authMessage').textContent='Hãy chạy start-website.bat rồi mở http://localhost:3001/index.html.';console.error('Không khởi tạo được Supabase:',error);}renderTickets();renderSelection();}
let concertSaving=false,concerts=[],editingConcertId=null,concertListRevision=0;
function updateConcertAccess(){
  const button=byId('addConcertButton');if(button)button.hidden=!state.isAdmin;
  document.querySelectorAll('[data-concert-admin]').forEach(el=>el.hidden=!state.isAdmin);
  if(!state.isAdmin){for(const id of ['concertDialog','concertDeleteDialog'])if(byId(id)?.open)byId(id).close();}
}
function concertDate(date){return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short',timeStyle:'short'}).format(new Date(date));}
function openConcert(id){
  const concert=concerts.find(c=>c.id===id);if(!concert)return;
  selectedConcert=concert;tickets=concert.ticket_types.map(t=>({...t,price:Number(t.price),note:''}));
  state.ticket=null;state.quantity=1;checkoutPending=false;
  byId('ticketConcertTitle').textContent=concert.title;renderTickets();renderSelection();show('ticketsScreen');
}
function renderConcerts(){
  const list=byId('additionalConcerts');list.replaceChildren();
  if(!concerts.length){const empty=document.createElement('p');empty.className='list-message';empty.textContent='Chưa có concert. Hãy quay lại sau.';list.append(empty);}
  concerts.forEach((concert,index)=>{
    const row=document.createElement('article');row.className='concert-row';
    const info=document.createElement('div');info.className='concert-info';
    const number=document.createElement('small');number.textContent=String(index+1).padStart(2,'0');
    const title=document.createElement('h2');title.textContent=concert.title;
    const detail=document.createElement('p');detail.textContent=`${concertDate(concert.date)} · ${concert.venue}`;
    const prices=document.createElement('p');prices.textContent=concert.ticket_types.map(t=>`${escapeHtml(t.name)}: ${money.format(t.price)}`).join(' · ');
    info.append(number,title,detail,prices);
    const actions=document.createElement('div');actions.className='concert-actions';
    const book=document.createElement('button');book.className='secondary';book.textContent=concert.ticket_types.length?'Xem & đặt vé':'Sắp mở bán';book.disabled=!concert.ticket_types.length;book.addEventListener('click',()=>openConcert(concert.id));actions.append(book);
    for(const [label,fn,cls] of [['Sửa',()=>openConcertEditor(concert),''],['Xóa',()=>openConcertDelete(concert),'danger']]){
      const button=document.createElement('button');button.type='button';button.className=`header-link ${cls}`;button.textContent=label;button.dataset.concertAdmin='';button.hidden=!state.isAdmin;button.addEventListener('click',fn);actions.append(button);
    }
    row.append(info,actions);list.append(row);
  });
}
async function loadConcerts(){
  const revision=++concertListRevision;
  try{
    const response=await fetch(`${API_BASE}/api/concerts`);
    if(!response.ok)throw new Error('Không tải được danh sách concert. Vui lòng tải lại trang.');
    const data=await response.json();if(revision!==concertListRevision)return;
    concerts=data.map(c=>({...c,ticket_types:c.ticket_types||[]}));renderConcerts();
  }catch(error){if(revision===concertListRevision)byId('concertFeedback').textContent=error.message;}
}
function fillOptions(id,values,placeholder,value){
  const select=byId(id);select.replaceChildren(new Option(placeholder,''));
  values.forEach(n=>select.add(new Option(String(n).padStart(2,'0'),String(n).padStart(2,'0'))));select.value=value||'';
}
function updateDays(){
  const day=byId('concertDay').value,month=Number(byId('concertMonth').value),year=Number(byId('concertYear').value);
  const count=month&&year?new Date(Date.UTC(year,month,0)).getUTCDate():31;
  fillOptions('concertDay',Array.from({length:count},(_,i)=>i+1),'Ngày',Number(day)<=count?day:'');
}
function prepareDate(date){
  const value=date?new Date(new Date(date).getTime()+7*3600000).toISOString():'';
  fillOptions('concertYear',Array.from({length:81},(_,i)=>2020+i),'Năm',value.slice(0,4));
  fillOptions('concertMonth',Array.from({length:12},(_,i)=>i+1),'Tháng',value.slice(5,7));
  updateDays();byId('concertDay').value=value.slice(8,10);
  fillOptions('concertHour',Array.from({length:24},(_,i)=>i),'Giờ',value.slice(11,13));
  fillOptions('concertMinute',Array.from({length:60},(_,i)=>i),'Phút',value.slice(14,16));
}
function updateTicketRemove(){
  const rows=byId('concertTicketRows').querySelectorAll('.concert-ticket-row');
  rows.forEach(row=>row.querySelector('button').disabled=concertSaving||rows.length===1);
  byId('addTicketType').disabled=concertSaving||rows.length>=20;
}
function addTicketRow(ticket={}){
  const row=document.createElement('div');row.className='concert-ticket-row';if(ticket.id)row.dataset.ticketId=ticket.id;
  const nameLabel=document.createElement('label');nameLabel.textContent='Hạng vé';
  const name=document.createElement('input');name.className='ticket-name';name.required=true;name.maxLength=80;name.placeholder='Ví dụ: Standard, VIP';name.value=ticket.name||'';nameLabel.append(name);
  const priceLabel=document.createElement('label');priceLabel.textContent='Giá vé (VNĐ)';
  const price=document.createElement('input');price.className='ticket-price';price.type='number';price.required=true;price.min='0';price.max='1000000000';price.step='1';price.placeholder='Ví dụ: 890000';price.value=ticket.price??'';priceLabel.append(price);
  const statusLabel=document.createElement('label');statusLabel.textContent='Trạng thái';
  const status=document.createElement('select');status.className='ticket-status';status.add(new Option('Còn vé','available'));status.add(new Option('Hết vé','sold_out'));status.value=ticket.status||'available';statusLabel.append(status);
  const remove=document.createElement('button');remove.type='button';remove.className='header-link danger';remove.textContent='Bỏ hạng vé';remove.addEventListener('click',()=>{row.remove();updateTicketRemove();});
  row.append(nameLabel,priceLabel,statusLabel,remove);byId('concertTicketRows').append(row);updateTicketRemove();
}
function openConcertEditor(concert=null){
  if(!state.isAdmin||concertSaving)return;
  editingConcertId=concert?.id||null;const form=byId('concertForm');form.reset();
  byId('concertTitle').textContent=concert?'Sửa concert':'Thêm concert';byId('saveConcert').textContent=concert?'Lưu thay đổi':'Thêm concert';
  form.elements.title.value=concert?.title||'';form.elements.venue.value=concert?.venue||'';prepareDate(concert?.date);
  byId('concertTicketRows').replaceChildren();(concert?.ticket_types.length?concert.ticket_types:[{}]).forEach(addTicketRow);
  byId('concertMessage').textContent='';byId('concertDialog').showModal();
}
function setConcertBusy(busy){
  concertSaving=busy;byId('concertForm').querySelectorAll('input,select,button').forEach(el=>el.disabled=busy);updateTicketRemove();
  byId('saveConcert').textContent=busy?'Đang lưu…':editingConcertId?'Lưu thay đổi':'Thêm concert';
}
byId('concertMonth').addEventListener('change',updateDays);byId('concertYear').addEventListener('change',updateDays);
byId('addTicketType').addEventListener('click',()=>addTicketRow());
byId('addConcertButton').addEventListener('click',()=>openConcertEditor());
byId('cancelConcert').addEventListener('click',()=>byId('concertDialog').close());
byId('concertDialog').addEventListener('cancel',event=>{if(concertSaving)event.preventDefault();});
byId('concertForm').addEventListener('submit',async event=>{
  event.preventDefault();if(concertSaving||!state.isAdmin)return;
  const form=event.currentTarget;
  const date=`${byId('concertYear').value}-${byId('concertMonth').value}-${byId('concertDay').value}T${byId('concertHour').value}:${byId('concertMinute').value}:00+07:00`;
  const ticketRows=Array.from(byId('concertTicketRows').querySelectorAll('.concert-ticket-row'));
  const ticketData=ticketRows.map(row=>({...row.dataset.ticketId?{id:row.dataset.ticketId}:{},name:row.querySelector('.ticket-name').value.trim(),price:Number(row.querySelector('.ticket-price').value),status:row.querySelector('.ticket-status').value}));
  const payload={title:form.elements.title.value.trim(),date,venue:form.elements.venue.value.trim(),tickets:ticketData};
  if(!payload.title||!payload.venue||ticketData.some(t=>!t.name)||new Set(ticketData.map(t=>t.name.toLowerCase())).size!==ticketData.length){byId('concertMessage').textContent='Nhập đầy đủ thông tin và không đặt trùng tên hạng vé.';return;}
  const revision=authRevision,id=editingConcertId;setConcertBusy(true);byId('concertMessage').textContent='';
  try{
    await apiRequest(id?`/api/concerts/${id}`:'/api/concerts',id?'PATCH':'POST',payload);
    byId('concertDialog').close();byId('concertFeedback').textContent=id?'Đã cập nhật concert.':'Đã thêm concert.';await loadConcerts();
  }catch(error){if(revision===authRevision)byId('concertMessage').textContent=error.message;if(error.status===403){state.isAdmin=false;updateConcertAccess();byId('concertFeedback').textContent=error.message;}}
  finally{setConcertBusy(false);}
});
function openConcertDelete(concert){
  if(!state.isAdmin||concertSaving)return;
  const dialog=byId('concertDeleteDialog');byId('concertDeleteDetail').textContent=concert.title;byId('concertDeleteMessage').textContent='';
  byId('confirmConcertDelete').onclick=async()=>{
    if(concertSaving||!state.isAdmin)return;concertSaving=true;
    byId('confirmConcertDelete').disabled=true;byId('cancelConcertDelete').disabled=true;
    try{await apiRequest(`/api/concerts/${concert.id}`,'DELETE',{confirm:true});dialog.close();byId('concertFeedback').textContent='Đã xóa concert khỏi danh sách.';await loadConcerts();}
    catch(error){byId('concertDeleteMessage').textContent=error.message;if(error.status===403){state.isAdmin=false;updateConcertAccess();}}
    finally{concertSaving=false;byId('confirmConcertDelete').disabled=false;byId('cancelConcertDelete').disabled=false;}
  };dialog.showModal();
}
byId('cancelConcertDelete').addEventListener('click',()=>byId('concertDeleteDialog').close());
byId('concertDeleteDialog').addEventListener('cancel',event=>{if(concertSaving)event.preventDefault();});
loadConcerts();
initializeApp();
