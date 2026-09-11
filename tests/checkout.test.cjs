const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require('path').join(__dirname,'../');
const source=fs.readFileSync(root+'script.js','utf8').replace(/initializeApp\(\);\s*$/,'');
function setup(){
 const els=new Map(),screens=['discoverScreen','authScreen','ticketsScreen','detailsScreen','reviewScreen','resultScreen'];
 const el=id=>{if(!els.has(id)){const classes=new Set();els.set(id,{id,value:'',textContent:'',style:{},parentElement:{hidden:false},disabled:false,handlers:{},classList:{toggle(c,on){on?classes.add(c):classes.delete(c)},contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)},addEventListener(e,f){this.handlers[e]=f},replaceChildren(){},reset(){},focus(){},select(){}})}return els.get(id)};
 const c={window:{location:{protocol:'http:',hostname:'localhost',port:'3001',origin:'http://localhost:3001',pathname:'/index.html'},scrollTo(){}},document:{getElementById:el,querySelectorAll:s=>s==='.screen'?screens.map(el):[],querySelector:s=>s.includes('#detailsScreen.active')?screens.map(el).find(e=>['detailsScreen','reviewScreen'].includes(e.id)&&e.classList.contains('active')):null},console,Intl,setTimeout:f=>{queueMicrotask(f);return 0},fetch:async()=>({ok:true,status:200,text:async()=>'{"isAdmin":false,"email":"new@example.com"}'})};
 vm.createContext(c);vm.runInContext(source,c);vm.runInContext('verifyPermissions=async()=>{}',c);
 c.run=s=>vm.runInContext(s,c);c.el=el;c.active=()=>screens.find(id=>el(id).classList.contains('active'));return c;
}
const session={user:{id:'u1',email:'new@example.com'},access_token:'valid'};
(async()=>{
 const c=setup();c.session=session;c.run('state.ticket=tickets[0];state.quantity=2');
 c.el('buyerName').value='Draft buyer';c.el('buyerPhone').value='0901234567';
 c.run("show('reviewScreen')");assert.equal(c.active(),'authScreen');
 let saves=0;c.saveCount=()=>saves++;c.run('saveBooking=async()=>saveCount()');
 await c.processPayment('success');assert.equal(saves,0);assert.equal(c.active(),'authScreen');
 c.run('supabaseClient={auth:{signInWithPassword:async()=>({data:{session},error:null})}}');
 c.el('authEmail').value='new@example.com';c.el('authPassword').value='mock-only';
 await c.handleAuthSubmit({preventDefault(){}});
 assert.equal(c.active(),'detailsScreen');assert.equal(c.el('buyerName').value,'Draft buyer');assert.equal(c.el('buyerPhone').value,'0901234567');assert.equal(c.el('buyerEmail').value,'new@example.com');assert.equal(c.run('state.quantity'),2);
 c.el('buyerEmail').value='old@example.com';c.el('buyerForm').handlers.submit({preventDefault(){}});
 assert.equal(c.active(),'reviewScreen');assert.match(c.el('reviewContact').textContent,/new@example.com/);
 c.applyAuthState(null);assert.equal(c.active(),'authScreen');assert.equal(c.el('buyerName').value,'Draft buyer');
 c.applyAuthState(session);c.resumeAfterLogin();c.run("show('reviewScreen');saveBooking=async()=>{throw Object.assign(new Error('Expired'),{status:401})}");
 await c.processPayment('success');assert.equal(c.active(),'authScreen');assert.equal(c.el('payButton').disabled,false);assert.equal(c.run('state.processing'),false);
 c.applyAuthState(session);c.resumeAfterLogin();c.run("show('reviewScreen');saveBooking=async()=>{throw new Error('Network offline')}");
 await c.processPayment('success');assert.equal(c.active(),'reviewScreen');assert.match(c.el('saveNotice').textContent,/Network offline/);
 c.run('saveBooking=async()=>({id:"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",notification:{sent:true}})');await c.processPayment('success');assert.equal(c.active(),'resultScreen');assert.equal(c.el('resultBookingCode').textContent,'CG-AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE');assert.match(c.el('resultNotification').textContent,/Đã gửi/);
 const d=setup();d.run("state.ticket=tickets[0];requestCheckoutLogin();supabaseClient={auth:{signUp:async()=>({data:{session:null,user:{identities:[]}}})}};state.authMode='register'");
 await d.handleAuthSubmit({preventDefault(){}});assert.match(d.el('authMessage').textContent,/Đăng ký thất bại/);assert.equal(d.active(),'authScreen');assert.equal(d.run('state.session'),null);
 d.run('supabaseClient.auth.signUp=async()=>({data:{session:null,user:{identities:[{id:"pending"}]}}})');
 await d.handleAuthSubmit({preventDefault(){}});assert.equal(d.active(),'authScreen');assert.equal(d.run('state.session'),null);assert.match(d.el('authMessage').textContent,/xác nhận/);
 console.log('PASS: checkout guards, draft preservation, login resume, account email sync, lost session, expired POST, network error, successful payment, duplicate signup and pending confirmation. No live bookings created.');
})().catch(e=>{console.error(e);process.exitCode=1});
