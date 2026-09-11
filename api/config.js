import {assertConfig,PUBLISHABLE_KEY,SUPABASE_URL,send} from '../lib/supabase.js';

export default function handler(request,response){
  if(request.method!=='GET')return send(response,405,{message:'Phương thức không được hỗ trợ.'});
  try{
    assertConfig();
    return send(response,200,{appVersion:"env-config-20260911-1",supabaseUrl:SUPABASE_URL,supabasePublishableKey:PUBLISHABLE_KEY});
  }catch(error){
    return send(response,500,{message:error.message});
  }
}
