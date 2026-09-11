import importlib.util, os, io
from pathlib import Path
os.environ.update(ADMIN_EMAIL='admin@example.com',SUPABASE_URL='https://example.test',SUPABASE_PUBLISHABLE_KEY='public',SUPABASE_SECRET_KEY='secret')
spec=importlib.util.spec_from_file_location('concertgo',str(Path(__file__).resolve().parents[1] / 'server.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
h=object.__new__(m.ConcertGoHandler);h.path='/api/bookings/00000000-0000-4000-8000-000000000001';results=[];calls=[]
h.send_json=lambda status,data=None:results.append(status)
h.notify_telegram=lambda *a,**k:(200,{'sent':True})
h.database_request=lambda *a,**k:(calls.append(a) or (200,[{'id':'test'}]))
for identity,expected in [(None,401),({'email':'other@example.com','email_confirmed_at':'yes','app_metadata':{'role':'admin'}},403),({'email':'admin@example.com'},403)]:
 h.current_user=lambda:(identity,None) if identity else (None,(401,{}))
 for method in ['GET','PATCH','DELETE']:
  h.admin_change(method);assert results[-1]==expected
assert not calls
h.current_user=lambda:({'email':'admin@example.com','email_confirmed_at':'yes'},None)
for method,body,expected in [('GET',{},200),('PATCH',{'status':'success'},422),('PATCH',{'buyer_name':'Test'},200),('DELETE',{},422),('DELETE',{'confirm':True},200)]:
 h.read_json=lambda:body;h.admin_change(method);assert results[-1]==expected,(method,results[-1])
print('14 Python authorization and validation cases passed')

# Authentication transport failures must never masquerade as expired sessions.
from unittest.mock import patch
transport_handler=object.__new__(m.ConcertGoHandler)
transport_handler.headers={'Authorization':'Bearer mock'}
for upstream,expected in [(401,401),(403,503),(429,503),(500,503),(502,503),(503,503)]:
 with patch.object(m,'remote_request',return_value=(upstream,{})):
  assert transport_handler.current_user()[1][0]==expected
with patch.object(m,'remote_request',return_value=(200,{'id':'mock'})):
 assert transport_handler.current_user()==({'id':'mock'},None)
print('7 Python authentication transport cases passed')