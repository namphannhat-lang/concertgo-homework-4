const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=process.argv[2]||path.join(__dirname,'..');
const code=fs.readFileSync(path.join(root,'script.js'),'utf8');
const source=code.slice(code.indexOf('let sessionRefreshPromise='),code.indexOf('async function supabaseChange'));
async function run(status,refreshResult){
 let refreshes=0,requests=0;
 const c={state:{session:{access_token:'original'}},API_BASE:'',supabaseClient:{auth:{refreshSession:async()=>{refreshes++;return refreshResult}}},fetch:async()=>{requests++;return{status,ok:false,text:async()=>'{"message":"Temporary failure"}'}}};
 vm.createContext(c);vm.runInContext(source,c);
 let error;try{await c.apiRequest('/api/me')}catch(e){error=e}
 return {error,refreshes,requests,session:c.state.session};
}
(async()=>{
 const offline=await run(503);assert.equal(offline.error.status,503);assert.equal(offline.refreshes,0);assert.equal(offline.session.access_token,'original');
 const refreshOffline=await run(401,{error:{status:503,message:'Service unavailable'},data:{session:null}});
 assert.equal(refreshOffline.error.status,503,'Refresh service failure must not be reported as expired session');assert.equal(refreshOffline.session.access_token,'original');
 const expired=await run(401,{error:{status:400,code:'refresh_token_not_found'},data:{session:null}});assert.equal(expired.error.status,401);
 console.log('PASS: upstream outage and refresh outage preserve the session; invalid refresh requires login');
})().catch(e=>{console.error(e);process.exitCode=1});
