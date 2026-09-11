type Booking = {
  id?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  quantity?: number;
  total_amount?: number;
  status?: string;
  created_at?: string;
};

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function formatAmount(value: number | undefined) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function bookingMessage(booking: Booking, event: string) {
  const code = `CG-${String(booking.id).toUpperCase()}`;
  if(event !== "created") return [event === "updated" ? "✏️ Đã sửa thông tin đơn" : "🗑️ Đã xóa đơn", `Mã đặt vé: ${code}`, ...(event === "updated" ? [`Tên sau khi sửa: ${booking.buyer_name || ""}`, `Email sau khi sửa: ${booking.buyer_email || ""}`, `Điện thoại sau khi sửa: ${booking.buyer_phone || ""}`] : []), `Thời gian: ${new Date().toISOString()}`].join("\n");
  return [
    "🎫 Đặt vé mới thành công",
    `Mã đặt vé: ${code}`,
    `Người đặt: ${booking.buyer_name || "(không có)"}`,
    `Email: ${booking.buyer_email || "(không có)"}`,
    `Điện thoại: ${booking.buyer_phone || "(không có)"}`,
    `Số lượng: ${booking.quantity || 0} vé`,
    `Tổng tiền: ${formatAmount(booking.total_amount)}`,
    `Thời gian: ${booking.created_at || new Date().toISOString()}`,
  ].join("\n");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json(405, { message: "Phương thức không được hỗ trợ." });
  }

  const providedApiKey = request.headers.get("apikey");
  const configuredKeys: Record<string, string> = JSON.parse(
    Deno.env.get("SUPABASE_SECRET_KEYS") || "{}",
  );
  if (!providedApiKey || !Object.values(configuredKeys).includes(providedApiKey)) {
    return json(401, { message: "Không được phép gọi chức năng này." });
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!botToken || !chatId) {
    console.error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID.");
    return json(500, { message: "Thiếu cấu hình Telegram trong Supabase Secrets." });
  }

  let booking: Booking | undefined;
  let event = "created";
  try {
    const payload: { booking?: Booking; event?: string } = await request.json();
    booking = payload?.booking;
    event = payload?.event || "created";
  } catch {
    return json(400, { message: "Dữ liệu JSON không hợp lệ." });
  }

  if (!["created", "updated", "deleted"].includes(event) || !booking?.id || (event === "created" && booking.status !== "success")) {
    return json(400, { message: "Đơn hoặc loại thông báo không hợp lệ." });
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: bookingMessage(booking, event),
        }),
      },
    );
    const telegramResult: any = await telegramResponse.json();
    if (!telegramResponse.ok || !telegramResult?.ok) {
      console.error("Telegram Bot API từ chối thông báo.");
      return json(502, {
        message: "Telegram Bot API từ chối thông báo.",
      });
    }
    return json(200, { sent: true, messageId: telegramResult.result?.message_id });
  } catch (error) {
    console.error("Không kết nối được Telegram Bot API.");
    return json(502, { message: "Không kết nối được Telegram Bot API." });
  }
});
