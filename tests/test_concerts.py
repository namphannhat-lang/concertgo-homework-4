import importlib.util,os
from pathlib import Path
os.environ.update(ADMIN_EMAIL='admin@example.com',SUPABASE_URL='https://example.test',SUPABASE_PUBLISHABLE_KEY='public',SUPABASE_SECRET_KEY='secret')
spec=importlib.util.spec_from_file_location('concertgo',Path(__file__).resolve().parents[1]/'server.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
h=object.__new__(m.ConcertGoHandler);results=[];writes=[]
h.send_json=lambda status,data=None:results.append((status,data))
h.database_request=lambda path,method='GET',body=None,**kw:(writes.append(body) or (200,{'id':'test'})) if method=='POST' else (200,[])
valid={'title':' Concert mới ','date':'2028-02-29T00:00:00+07:00','venue':'TP.HCM','tickets':[{'name':'VIP','price':100000,'status':'available'}]}
for method in ['POST','PATCH','DELETE']:
 h.path='/api/concerts'+('' if method=='POST' else '/00000000-0000-4000-8000-000000000001')
 h.read_json=lambda:valid
 for user,status in [(None,401),({'email':'other@example.com','email_confirmed_at':'yes','user_metadata':{'role':'admin'}},403),({'email':'admin@example.com'},403)]:
  h.current_user=lambda:(user,None) if user else (None,(401,{}));getattr(h,'do_'+method)();assert results[-1][0]==status
assert not writes
h.current_user=lambda:({'email':'admin@example.com','email_confirmed_at':'yes'},None)
for method in ['POST','PATCH']:
 h.path='/api/concerts'+('' if method=='POST' else '/00000000-0000-4000-8000-000000000001')
 for body in [None,[],{},dict(valid,title=' '),dict(valid,date='2027-02-29T00:00:00+07:00'),dict(valid,tickets=[]),dict(valid,tickets=[{'name':'VIP','price':True,'status':'available'}]),dict(valid,tickets=[{'name':'VIP','price':-1,'status':'available'}]),dict(valid,tickets=valid['tickets']*2)]:
  h.read_json=lambda:body;getattr(h,'do_'+method)();assert results[-1][0]==422
assert not writes
for method,status,body in [('POST',201,valid),('PATCH',200,valid),('DELETE',422,{}),('DELETE',200,{'confirm':True})]:
 h.path='/api/concerts'+('' if method=='POST' else '/00000000-0000-4000-8000-000000000001');h.read_json=lambda:body;getattr(h,'do_'+method)();assert results[-1][0]==status
assert writes[-1]['p_delete'] is True
print('PASS Python concert API: authorization, dropdown date, ticket prices, create/edit/delete.')
