import json
import os
import re
from datetime import datetime
from uuid import uuid4
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse, parse_qs
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent


def load_local_env():
    env_path = ROOT / ".env.local"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_local_env()
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
PUBLISHABLE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "").strip().lower()

if not all((SUPABASE_URL, PUBLISHABLE_KEY, SECRET_KEY)):
    raise RuntimeError("Thiếu cấu hình Supabase trong .env.local")


def remote_request(url, method="GET", headers=None, body=None):
    payload = None if body is None else json.dumps(body).encode("utf-8")
    request = Request(url, data=payload, method=method, headers=headers or {})
    try:
        with urlopen(request, timeout=20) as response:
            content = response.read().decode("utf-8")
            return response.status, json.loads(content) if content else None
    except HTTPError as error:
        content = error.read().decode("utf-8")
        try:
            message = json.loads(content)
        except json.JSONDecodeError:
            message = {"message": content or str(error)}
        return error.code, message
    except URLError as error:
        return 502, {"message": f"Không kết nối được Supabase: {error.reason}"}


class ConcertGoHandler(SimpleHTTPRequestHandler):
    ALLOWED_ORIGINS = {"http://localhost:3000", "http://127.0.0.1:3000"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def add_cors_headers(self):
        origin = self.headers.get("Origin")
        if origin in self.ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def send_json(self, status, data=None):
        payload = json.dumps(data if data is not None else {}, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.add_cors_headers()
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        if not urlparse(self.path).path.startswith("/api/"):
            return self.send_json(404, {"message": "Không tìm thấy API."})
        self.send_response(204)
        self.add_cors_headers()
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}

    def current_user(self):
        authorization = self.headers.get("Authorization", "")
        if not authorization.startswith("Bearer "):
            return None, (401, {"message": "Bạn cần đăng nhập."})
        status, user = remote_request(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": PUBLISHABLE_KEY, "Authorization": authorization},
        )
        if status == 401:
            return None, (401, {"message": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."})
        if status != 200:
            print(f"Auth upstream unavailable: HTTP {status}", flush=True)
            return None, (503, {"message": "Tạm thời không xác minh được đăng nhập. Vui lòng thử lại; phiên đăng nhập của bạn được giữ nguyên."})
        return user, None

    def require_admin(self):
        user, error = self.current_user()
        if error:
            return user, error
        if not self.is_admin(user):
            return None, (403, {"message": "Bạn không có quyền quản trị."})
        return user, None

    @staticmethod
    def is_admin(user):
        return bool(ADMIN_EMAIL) and bool(user.get("email_confirmed_at")) and str(user.get("email") or "").strip().lower() == ADMIN_EMAIL

    def database_request(self, path, method="GET", body=None, prefer=None):
        headers = {"apikey": SECRET_KEY, "Content-Type": "application/json"}
        if method in ("POST", "PATCH", "DELETE"):
            headers["Prefer"] = prefer or "return=minimal"
        return remote_request(f"{SUPABASE_URL}/rest/v1/{path}", method, headers, body)

    def notify_telegram(self, booking, event="created"):
        headers = {
            "apikey": SECRET_KEY,
            "Content-Type": "application/json",
        }
        return remote_request(
            f"{SUPABASE_URL}/functions/v1/send-booking-telegram",
            "POST",
            headers,
            {"booking": booking, "event": event},
        )

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/concerts":
            status, data = self.database_request("concerts?select=id,title,date,venue,ticket_types(id,name,price,status)&deleted_at=is.null&ticket_types.archived=eq.false&order=created_at.asc,id.asc")
            if status >= 400:
                return self.send_json(502, {"message": "Không tải được danh sách concert."})
            return self.send_json(200, data)
        if parsed.path == "/api/me":
            user, error = self.current_user()
            if error:
                return self.send_json(*error)
            return self.send_json(200, {"isAdmin": self.is_admin(user), "email": user.get("email", "")})
        if parsed.path == "/api/config":
            return self.send_json(200, {
                "appVersion": "env-config-20260911-1",
                "supabaseUrl": SUPABASE_URL,
                "supabasePublishableKey": PUBLISHABLE_KEY,
            })
        if parsed.path.startswith("/api/bookings/"):
            return self.admin_change("GET")
        if parsed.path != "/api/bookings":
            if parsed.path not in ("/", "/index.html", "/style.css", "/script.js"):
                return self.send_json(404, {"message": "Không tìm thấy trang."})
            return super().do_GET()
        user, auth_error = self.current_user()
        if auth_error:
            return self.send_json(*auth_error)
        is_admin = self.is_admin(user)
        if parse_qs(parsed.query).get("scope") == ["admin"]:
            _, error = self.require_admin()
            if error:
                return self.send_json(*error)
        fields = "id,buyer_name,buyer_email,buyer_phone,quantity,total_amount,status,created_at,concert_id,ticket_type_id,unit_price,concert:concerts(title)"
        path = f"bookings?select={fields}&order=created_at.desc"
        if not is_admin:
            path += f"&buyer_email=eq.{quote(user.get('email', ''), safe='@._-')}"
        status, data = self.database_request(path)
        self.send_json(status, data)

    def manage_concert(self, method):
        _, error = self.require_admin()
        if error:
            return self.send_json(*error)
        path = urlparse(self.path).path
        concert_id = None if method == 'POST' else path.removeprefix('/api/concerts/')
        uuid_pattern = r'[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}'
        if concert_id is not None and not re.fullmatch(uuid_pattern, concert_id):
            return self.send_json(422, {'message': 'Mã concert không hợp lệ.'})
        try:
            source = self.read_json()
            if method == 'DELETE':
                if not isinstance(source, dict) or source.get('confirm') is not True:
                    raise ValueError()
                payload = None
            else:
                if not isinstance(source, dict) or set(source) != {'title', 'date', 'venue', 'tickets'}:
                    raise ValueError()
                if any(not isinstance(source[k], str) for k in ('title','date','venue')):
                    raise ValueError()
                title, venue, date = source['title'].strip(), source['venue'].strip(), source['date']
                if not 0 < len(title) <= 160 or not 0 < len(venue) <= 240:
                    raise ValueError()
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+07:00', date) or not 2020 <= datetime.fromisoformat(date).year <= 2100:
                    raise ValueError()
                if not isinstance(source['tickets'], list) or not 1 <= len(source['tickets']) <= 20:
                    raise ValueError()
                tickets, ids, names = [], set(), set()
                for item in source['tickets']:
                    if not isinstance(item, dict) or set(item)-{'id','name','price','status'}:
                        raise ValueError()
                    name = item.get('name')
                    if not isinstance(name,str) or not 0 < len(name.strip()) <= 80 or name.strip().lower() in names:
                        raise ValueError()
                    names.add(name.strip().lower())
                    if type(item.get('price')) is not int or not 0 <= item['price'] <= 1000000000 or item.get('status') not in ('available','sold_out'):
                        raise ValueError()
                    ticket = {'name':name.strip(),'price':item['price'],'status':item['status']}
                    if 'id' in item:
                        tid = item['id']
                        if method == 'POST' or not isinstance(tid,str) or not re.fullmatch(uuid_pattern,tid) or tid.lower() in ids:
                            raise ValueError()
                        ids.add(tid.lower()); ticket['id']=tid
                    tickets.append(ticket)
                payload = {'title':title,'venue':venue,'date':date,'tickets':tickets}
        except (ValueError, UnicodeDecodeError):
            return self.send_json(422, {'message':'Cần xác nhận xóa concert.' if method == 'DELETE' else 'Kiểm tra tên, ngày giờ, địa điểm, hạng vé và giá vé.'})
        status, data = self.database_request('rpc/manage_concert','POST',{'p_id':concert_id,'p_payload':payload,'p_delete':method == 'DELETE'})
        if status >= 400:
            code = (data or {}).get('code')
            return self.send_json(404 if code == 'P0002' else 422 if code == '22023' else 502, {'message':'Concert không còn tồn tại.' if code == 'P0002' else 'Hạng vé không hợp lệ hoặc không thuộc concert này.' if code == '22023' else 'Không lưu được concert. Vui lòng thử lại.'})
        return self.send_json(201 if method == 'POST' else 200,data)


    def do_POST(self):
        if urlparse(self.path).path == "/api/concerts":
            return self.manage_concert('POST')
        if urlparse(self.path).path != "/api/bookings":
            return self.send_json(404, {"message": "Không tìm thấy API."})
        user, auth_error = self.current_user()
        if auth_error:
            return self.send_json(*auth_error)
        try:
            booking = self.read_json()
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self.send_json(400, {"message": "Dữ liệu không hợp lệ."})
        allowed = {
            "concert_id", "ticket_type_id", "buyer_name", "buyer_phone",
            "quantity", "unit_price", "total_amount", "status"
        }
        booking = {key: value for key, value in booking.items() if key in allowed}
        booking["buyer_email"] = user.get("email", "")
        required = allowed | {"buyer_email"}
        if not required.issubset(booking) or booking["status"] not in ("success", "failed"):
            return self.send_json(400, {"message": "Booking thiếu thông tin hoặc trạng thái không hợp lệ."})
        if type(booking["quantity"]) is not int or not 1 <= booking["quantity"] <= 6:
            return self.send_json(400, {"message": "Số lượng vé phải từ 1 đến 6."})
        if booking["total_amount"] != booking["unit_price"] * booking["quantity"]:
            return self.send_json(400, {"message": "Tổng tiền không hợp lệ."})
        status, data = self.database_request(
            "rpc/place_concert_booking", "POST", {"p_booking": booking}
        )
        if status >= 400:
            return self.send_json(409 if (data or {}).get('code') == '22023' else 502, {'message':data.get('message') if (data or {}).get('code') == '22023' else 'Không lưu được đơn. Vui lòng thử lại.'})
        if 200 <= status < 300 and booking["status"] == "success":
            created_booking = data[0] if isinstance(data, list) and data else data
            if isinstance(created_booking, dict):
                try:
                    telegram_status, telegram_data = self.notify_telegram(created_booking)
                    sent = 200 <= telegram_status < 300 and bool((telegram_data or {}).get("sent"))
                except Exception:
                    sent = False
                created_booking["notification"] = {"sent": sent}
                if not sent:
                    print("Booking đã lưu nhưng chưa gửi được Telegram.", flush=True)
        self.send_json(status, data)

    def admin_change(self, method):
        prefix = "/api/bookings/"
        path = urlparse(self.path).path
        if not path.startswith(prefix):
            return self.send_json(404, {"message": "Không tìm thấy API."})
        _, error = self.require_admin()
        if error:
            return self.send_json(*error)
        booking_id = path[len(prefix):]
        if not re.fullmatch(r"[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}", booking_id):
            return self.send_json(422, {"message": "Mã đơn không hợp lệ."})
        body = None
        if method in ("PATCH", "DELETE"):
            try:
                source = self.read_json()
            except (ValueError, UnicodeDecodeError):
                return self.send_json(422, {"message": "Dữ liệu không hợp lệ."})
            if not isinstance(source, dict):
                return self.send_json(422, {"message": "Dữ liệu không hợp lệ."})
            if method == "DELETE" and source.get("confirm") is not True:
                return self.send_json(422, {"message": "Cần xác nhận xóa đơn."})
            if method == "PATCH":
                if not source or set(source) - {"buyer_name", "buyer_email", "buyer_phone"} or any(not isinstance(v, str) for v in source.values()):
                    return self.send_json(422, {"message": "Chỉ được sửa thông tin liên hệ."})
                body = {k: v.strip() for k, v in source.items()}
                valid = ("buyer_name" not in body or 0 < len(body["buyer_name"]) <= 120) and ("buyer_email" not in body or len(body["buyer_email"]) <= 254 and re.fullmatch(r"\S+@\S+\.\S+", body["buyer_email"])) and ("buyer_phone" not in body or re.fullmatch(r"[0-9]{9,11}", body["buyer_phone"]))
                if not valid:
                    return self.send_json(422, {"message": "Thông tin liên hệ không hợp lệ."})
        status, data = self.database_request(f"bookings?id=eq.{booking_id}", method, body, prefer="return=representation")
        if status >= 400:
            return self.send_json(409 if status == 409 else 502, {"message": "Không xử lý được đơn hoặc có ràng buộc dữ liệu."})
        if not data:
            return self.send_json(404, {"message": "Đơn không còn tồn tại. Hãy làm mới danh sách."})
        result = {"deleted": True} if method == "DELETE" else data[0]
        if method in ("PATCH", "DELETE"):
            fields = ("id", "buyer_name", "buyer_email", "buyer_phone") if method == "PATCH" else ("id",)
            notification_booking = {key: data[0].get(key) for key in fields}
            try:
                notification_status, _ = self.notify_telegram(notification_booking, "updated" if method == "PATCH" else "deleted")
                sent = 200 <= notification_status < 300
            except Exception:
                sent = False
            result["notification"] = {"sent": sent}
        return self.send_json(200, result)

    def do_PATCH(self):
        if urlparse(self.path).path.startswith('/api/concerts/'):
            return self.manage_concert('PATCH')
        self.admin_change("PATCH")

    def do_DELETE(self):
        if urlparse(self.path).path.startswith('/api/concerts/'):
            return self.manage_concert('DELETE')
        self.admin_change("DELETE")

    def log_message(self, format_string, *args):
        print(f"{self.address_string()} - {format_string % args}")


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", 3001), ConcertGoHandler)
    print("ConcertGo API đang chạy tại http://localhost:3001")
    print("Giữ cửa sổ này mở khi sử dụng website.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
