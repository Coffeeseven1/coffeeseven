const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function makeToken(secret) {
  const payload = btoa(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return payload + "." + await hmac(secret, payload);
}

async function validToken(request, secret) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const expected = await hmac(secret, parts[0]);
  if (expected !== parts[1]) return false;
  try {
    const payload = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp > Date.now();
  } catch { return false; }
}

async function readData(env) {
  const row = await env.GAME7_DB.prepare("SELECT payload FROM app_data WHERE id = ?").bind("main").first();
  if (!row) throw new Error("Database not initialized. Apply D1 migrations first.");
  return JSON.parse(row.payload);
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/menu" && request.method === "GET") {
    try { return json(await readData(env)); }
    catch (e) { return json({ error: "اطلاعات منو هنوز آماده نیست. مهاجرت دیتابیس را اجرا کنید." }, 503); }
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
      return json({ error: "تنظیمات رمز مدیریت روی Cloudflare کامل نشده است." }, 500);
    }
    let body;
    try { body = await request.json(); } catch { return json({ error: "درخواست نامعتبر است." }, 400); }
    if (!body || body.password !== env.ADMIN_PASSWORD) return json({ error: "رمز عبور اشتباه است." }, 401);
    return json({ token: await makeToken(env.SESSION_SECRET) });
  }

  if (url.pathname === "/api/admin/data" && request.method === "PUT") {
    if (!env.SESSION_SECRET || !(await validToken(request, env.SESSION_SECRET))) {
      return json({ error: "نشست مدیریت معتبر نیست؛ دوباره وارد شوید." }, 401);
    }
    let data;
    try { data = await request.json(); } catch { return json({ error: "ساختار اطلاعات نامعتبر است." }, 400); }
    if (!data || !Array.isArray(data.prices) || !Array.isArray(data.products) ||
        !Array.isArray(data.offers) || typeof data.settings !== "object") {
      return json({ error: "ساختار اطلاعات معتبر نیست." }, 400);
    }
    const payload = JSON.stringify(data);
    if (payload.length > 500000) return json({ error: "حجم اطلاعات بیش از حد مجاز است." }, 413);
    await env.GAME7_DB.prepare(
      "INSERT INTO app_data (id, payload, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP"
    ).bind("main", payload).run();
    return json({ ok: true });
  }
  return json({ error: "مسیر پیدا نشد." }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  }
};
