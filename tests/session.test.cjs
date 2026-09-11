const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync(require('path').join(__dirname,'../script.js'),'utf8');
const source=code.slice(code.indexOf('let sessionRefreshPromise='),code.indexOf('async function supabaseChange'));
let fetches=0,refreshes=0;
const context={state:{session:{access_token:'expired'}},API_BASE:'',supabaseClient:{auth:{refreshSession:async()=>{refreshes++;return {data:{session:{access_token:'fresh'}}}}}},fetch:async()=>({status:++fetches===1?401:200,ok:fetches>1,text:async()=>'{"isAdmin":true}'}),Error,JSON};
vm.createContext(context);vm.runInContext(source,context);
(async()=>{assert.equal((await context.apiRequest('/api/me')).isAdmin,true);assert.equal(refreshes,1);assert.equal(fetches,2);console.log('Expired session refresh test passed');})();
