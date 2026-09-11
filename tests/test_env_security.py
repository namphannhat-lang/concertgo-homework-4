import importlib.util
import os
from pathlib import Path

os.environ.update(SUPABASE_URL='https://example.test', SUPABASE_PUBLISHABLE_KEY='public-test', SUPABASE_SECRET_KEY='server-only-test', ADMIN_EMAIL=' Admin@Example.com ')
spec = importlib.util.spec_from_file_location('concertgo_env_test', Path(__file__).resolve().parents[1] / 'server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)
admin = {'email': 'ADMIN@example.com', 'email_confirmed_at': 'yes'}
assert server.ConcertGoHandler.is_admin(admin)
assert not server.ConcertGoHandler.is_admin({'email': 'admin@example.com'})
assert not server.ConcertGoHandler.is_admin({'email': 'other@example.com', 'email_confirmed_at': 'yes', 'user_metadata': {'role': 'admin'}})
server.ADMIN_EMAIL = ''
assert not server.ConcertGoHandler.is_admin(admin)
assert not server.ConcertGoHandler.is_admin({'email': '', 'email_confirmed_at': 'yes'})
h = object.__new__(server.ConcertGoHandler)
results = []
h.send_json = lambda status, data: results.append((status, data))
for path in ['/.env.local', '/.env', '/.git/config', '/server.py', '/lib/supabase.js', '/supabase/functions/.env']:
    h.path = path
    h.do_GET()
    assert results[-1][0] == 404
h.path = '/api/config'
h.do_GET()
assert results[-1][0] == 200
assert set(results[-1][1]) == {'appVersion', 'supabaseUrl', 'supabasePublishableKey'}
assert 'server-only-test' not in str(results[-1][1])
print('PASS Python environment security: admin configuration, file denylist regression, public configuration allowlist.')
