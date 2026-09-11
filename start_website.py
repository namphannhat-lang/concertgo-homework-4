"""Open ConcertGo without starting duplicate servers."""
import json
import subprocess
import sys
import time
import webbrowser
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError

ROOT = Path(__file__).resolve().parent
URL = 'http://localhost:3001'
VERSION = 'env-config-20260911-1'

def running_version():
    try:
        with urlopen(URL + '/api/config', timeout=2) as response:
            return json.load(response).get('appVersion', 'outdated')
    except (URLError, TimeoutError, ValueError):
        return None

def main():
    version = running_version()
    if version == VERSION:
        webbrowser.open(URL + '/index.html?v=admin-ui-20260908-3')
        return 0
    if version is not None:
        print('Server cu dang chay o cong 3001. Hay dong server cu truoc khi chay lai.')
        return 1
    process = subprocess.Popen([sys.executable, '-X', 'utf8', '-B', str(ROOT / 'server.py')], cwd=ROOT,
        creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(30):
        if process.poll() is not None:
            print('Khong khoi dong duoc. Kiem tra cong 3001 va cau hinh .env.local.')
            return 1
        if running_version() == VERSION:
            webbrowser.open(URL + '/index.html?v=admin-ui-20260908-3')
            return 0
        time.sleep(0.2)
    print('Server chua san sang. Kiem tra cau hinh va thu lai.')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
