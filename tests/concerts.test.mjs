import assert from 'node:assert/strict';
process.env.ADMIN_EMAIL='admin@example.com';
process.env.SUPABASE_URL='https://example.test';process.env.SUPABASE_PUBLISHABLE_KEY='public';process.env.SUPABASE_SECRET_KEY='secret';
const {default:handler}=await import('../api/concerts.js');
let identity=null,writes=0,lastBody,upstream=200,code='';
global.fetch=async(url,options)=>{
 if(url.includes('/auth/'))return {ok:!!identity,status:identity?200:401,json:async()=>identity};
 if(options.method==='POST'){writes++;lastBody=JSON.parse(options.body);}
 return {status:upstream,text:async()=>JSON.stringify(upstream>=400?{code}:options.method==='GET'?[]:{id:'00000000-0000-4000-8000-000000000001'})};
};
async function run(method,body,token=true,id=method==='PATCH'||method==='DELETE'?'00000000-0000-4000-8000-000000000001':undefined){let status,data;const response={setHeader(){},status(s){status=s;return this},json(d){data=d;return this}};await handler({method,body,query:{id},headers:token?{authorization:'Bearer mock'}:{}},response);return{status,data};}
const valid={title:' Concert mới ',date:'2028-02-29T00:00:00+07:00',venue:'TP.HCM',tickets:[{name:'VIP',price:100000,status:'available'}]};
assert.equal((await run('GET',null,false)).status,200);
for(const method of ['POST','PATCH','DELETE']){
 assert.equal((await run(method,valid,false)).status,401);
 for(const user of [{email:'other@example.com',email_confirmed_at:'yes',user_metadata:{email:'admin@example.com',role:'admin'}},{email:'admin@example.com'}]){identity=user;assert.equal((await run(method,valid)).status,403);}
}
assert.equal(writes,0);identity={email:'admin@example.com',email_confirmed_at:'yes'};
const invalid=[null,[],{}, {...valid,title:' '},{...valid,date:'2027-02-29T00:00:00+07:00'},{...valid,tickets:[]},{...valid,tickets:[{name:'VIP',price:-1,status:'available'}]},{...valid,tickets:[{name:'VIP',price:1.5,status:'available'}]},{...valid,tickets:[{name:'VIP',price:'100',status:'available'}]},{...valid,tickets:[valid.tickets[0],valid.tickets[0]]},{...valid,tickets:[{...valid.tickets[0],id:'bad'}]}];
for(const method of ['POST','PATCH'])for(const body of invalid)assert.equal((await run(method,body)).status,422);
assert.equal((await run('DELETE',{})).status,422);assert.equal(writes,0);
assert.equal((await run('POST',valid)).status,201);assert.equal(lastBody.p_payload.title,'Concert mới');assert.equal(lastBody.p_id,null);
assert.equal((await run('PATCH',valid)).status,200);assert.ok(lastBody.p_id);
assert.equal((await run('DELETE',{confirm:true})).status,200);assert.equal(lastBody.p_delete,true);
for(const [error,status] of [['P0002',404],['22023',422],['unexpected',502]]){code=error;upstream=400;assert.equal((await run('PATCH',valid)).status,status);}
console.log('PASS concert API: all mutations protected, date/ticket/price validation, create/edit/delete and DB errors.');
