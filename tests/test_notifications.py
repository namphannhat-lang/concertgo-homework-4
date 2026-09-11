import importlib.util, os
from pathlib import Path
os.environ.update(ADMIN_EMAIL='admin@example.com',SUPABASE_URL='https://example.test',SUPABASE_PUBLISHABLE_KEY='public',SUPABASE_SECRET_KEY='secret')
spec=importlib.util.spec_from_file_location('server', Path(__file__).resolve().parents[1] / 'server.py')
server=importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)
h=object.__new__(server.ConcertGoHandler)
h.path='/api/bookings/00000000-0000-4000-8000-000000000001'
h.current_user=lambda:({'email':'admin@example.com','email_confirmed_at':'yes'},None)
saved={'id':'00000000-0000-4000-8000-000000000001','buyer_name':'Test','buyer_email':'test@example.com','buyer_phone':'0900000000'}
h.database_request=lambda *a,**k:(200,[dict(saved)])
results=[];sent=[]
h.send_json=lambda status,data:results.append((status,data))
h.read_json=lambda:{'buyer_name':'Test'}
h.notify_telegram=lambda booking,event:(sent.append((booking,event)) or (200,{'sent':True}))
h.admin_change('PATCH');assert results[-1][0]==200 and results[-1][1]['notification']['sent'];assert sent[-1][0]['buyer_email']=='test@example.com'
h.read_json=lambda:{'confirm':True}
h.admin_change('DELETE');assert sent[-1]==({'id':saved['id']},'deleted')
h.notify_telegram=lambda *a:(502,{})
h.admin_change('DELETE');assert results[-1][0]==200 and not results[-1][1]['notification']['sent']
h.database_request=lambda *a,**k:(404,[])
count=len(sent);h.admin_change('PATCH');assert len(sent)==count
print('Backend notification success, failure and payload checks passed')
