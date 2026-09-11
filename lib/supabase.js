const SUPABASE_URL=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const PUBLISHABLE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY||'';
const SECRET_KEY=process.env.SUPABASE_SECRET_KEY||'';
const ADMIN_EMAIL=(process.env.ADMIN_EMAIL||'').trim().toLowerCase();

export function assertConfig(){
  if(!SUPABASE_URL||!PUBLISHABLE_KEY||!SECRET_KEY)throw new Error('Thiếu cấu hình Supabase trên máy chủ.');
}

export async function currentUser(request){
  assertConfig();
  const authorization=request.headers.authorization||'';
  if(!authorization.startsWith('Bearer '))return {error:[401,'Bạn cần đăng nhập.']};
  const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:PUBLISHABLE_KEY,authorization}});
  if(response.status===401)return {error:[401,'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.']};
  if(!response.ok)return {error:[503,'Tạm thời không xác minh được đăng nhập. Vui lòng thử lại; phiên đăng nhập của bạn được giữ nguyên.']};
  return {user:await response.json()};
}

export async function databaseRequest(path,{method='GET',body,prefer}={}){
  assertConfig();
  const headers={apikey:SECRET_KEY,'content-type':'application/json'};
  if(method!=='GET')headers.prefer=prefer||'return=minimal';
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    method,headers,body:body===undefined?undefined:JSON.stringify(body)
  });
  const text=await response.text();
  let data=null;
  if(text){try{data=JSON.parse(text);}catch{data={message:text};}}
  return {status:response.status,data};
}

export async function invokeFunction(name,body){
  assertConfig();
  const response=await fetch(`${SUPABASE_URL}/functions/v1/${name}`,{
    method:'POST',
    headers:{
      apikey:SECRET_KEY,
      'content-type':'application/json'
    },
    body:JSON.stringify(body)
  });
  const text=await response.text();
  let data=null;
  if(text){try{data=JSON.parse(text);}catch{data={message:text};}}
  if(!response.ok)throw new Error(data?.message||`Edge Function trả về HTTP ${response.status}.`);
  return data;
}

export function send(response,status,data={}){
  response.setHeader('Cache-Control','no-store');
  return response.status(status).json(data??{});
}

export {SUPABASE_URL,PUBLISHABLE_KEY};

export function isAdmin(user){return Boolean(ADMIN_EMAIL)&&Boolean(user?.email_confirmed_at)&&String(user?.email||'').trim().toLowerCase()===ADMIN_EMAIL;}
export async function requireAdmin(request){const auth=await currentUser(request);if(auth.error)return auth;if(!isAdmin(auth.user))return {error:[403,'Bạn không có quyền quản trị.']};return auth;}
export function validateChanges(source){
 const allowed=['buyer_name','buyer_email','buyer_phone'];
 if(!source||typeof source!=='object'||Array.isArray(source)||!Object.keys(source).length||Object.keys(source).some(k=>!allowed.includes(k)))return null;
 const result={};for(const [key,value] of Object.entries(source)){if(typeof value!=='string')return null;result[key]=value.trim();}
 if('buyer_name' in result&&(!result.buyer_name||result.buyer_name.length>120))return null;
 if('buyer_email' in result&&(result.buyer_email.length>254||!/^\S+@\S+\.\S+$/.test(result.buyer_email)))return null;
 if('buyer_phone' in result&&!/^[0-9]{9,11}$/.test(result.buyer_phone))return null;
 return result;
}
