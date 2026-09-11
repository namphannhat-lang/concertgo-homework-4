import assert from 'node:assert/strict';
process.env.ADMIN_EMAIL='admin@example.com';
process.env.SUPABASE_URL='https://example.test';process.env.SUPABASE_PUBLISHABLE_KEY='public';process.env.SUPABASE_SECRET_KEY='secret';
const {default:handler}=await import('../api/bookings/[id].js');
let identity=null,calls=0;
global.fetch=async(url,options)=>{if(url.includes('/auth/'))return {ok:!!identity,json:async()=>identity};calls++;return {status:200,text:async()=>JSON.stringify([{id:'00000000-0000-4000-8000-000000000001'}])};};
async function run(method,body,token=true){let status,data;const response={setHeader(){},status(s){status=s;return this},json(d){data=d;return this}};await handler({method,body,query:{id:'00000000-0000-4000-8000-000000000001'},headers:token?{authorization:'Bearer test'}:{}},response);return status;}
for(const method of ['GET','PATCH','DELETE'])assert.equal(await run(method,{},false),401);
identity={email:'other@example.com',email_confirmed_at:'today',app_metadata:{role:'admin'}};
for(const method of ['GET','PATCH','DELETE'])assert.equal(await run(method,{}),403);
identity={email:'admin@example.com'};assert.equal(await run('GET'),403);assert.equal(calls,0);
identity={email:' admin@example.com ',email_confirmed_at:'today'};
assert.equal(await run('PATCH',{status:'success'}),422);assert.equal(await run('PATCH',{buyer_phone:'invalid'}),422);assert.equal(await run('DELETE',{}),422);
assert.equal(await run('GET'),200);assert.equal(await run('PATCH',{buyer_name:'Test'}),200);assert.equal(await run('DELETE',{confirm:true}),200);
console.log('13 authorization and validation cases passed; unauthorized requests never reached database.');
