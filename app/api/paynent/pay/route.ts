import { NextResponse } from "next/server";

// Fichier à placer ici : app/api/pay/[method]/route.ts   (le dossier s'appelle vraiment [method])
// Toutes les clés restent SECRÈTES dans .env.local (jamais dans page.tsx).

const env = process.env;
const j = (o: any, status = 200) => NextResponse.json(o, { status });
const APP_URL = () => env.APP_URL || ""; // ex: https://ton-site.com (ou l'adresse publique Codespaces)

export async function POST(req: Request, ctx: { params: any }) {
  const { method } = await ctx.params;
  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    if (method === "mpesa-callback") {
      // Safaricom envoie ici le résultat final du paiement M-Pesa
      console.log("MPESA RESULT:", JSON.stringify(body));
      return j({ ResultCode: 0, ResultDesc: "Accepted" });
    }
    const amount = Number(body.amount);
    if (body.action !== "capture" && !(amount > 0 && amount < 10_000_000)) return j({ error: "bad_amount", message: "Invalid amount." }, 400);

    if (method === "paypal") return await paypal(req, body, amount);
    if (method === "mpesa") return await mpesa(body, amount);
    if (method === "airtel") return await airtel(body, amount);
  } catch (e: any) {
    return j({ error: "server_error", message: "Server error. Please try again." }, 500);
  }
  return j({ error: "unknown_method" }, 404);
}

/* ---------------- PayPal (l'argent va sur le compte PayPal Business qui a créé les clés) ---------------- */
const PP = () => (env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

async function paypal(req: Request, body: any, amount: number) {
  const id = env.PAYPAL_CLIENT_ID, secret = env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) return j({ error: "not_configured" }, 501);
  const t = await fetch(PP() + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const token = (await t.json()).access_token;
  if (!token) return j({ error: "paypal_auth", message: "PayPal login failed." }, 500);
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  if (body.action === "capture") {
    const r = await fetch(`${PP()}/v2/checkout/orders/${encodeURIComponent(String(body.orderId))}/capture`, { method: "POST", headers: H });
    const d = await r.json();
    return j({ status: d.status || "ERROR" }, r.ok ? 200 : 400);
  }

  const base = APP_URL() || new URL(req.url).origin;
  const r = await fetch(PP() + "/v2/checkout/orders", {
    method: "POST", headers: H,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ description: "King Shipping order", amount: { currency_code: String(body.currency || "USD"), value: amount.toFixed(2) } }],
      payment_source: { paypal: { experience_context: { return_url: `${base}/?paypal=return`, cancel_url: `${base}/?paypal=cancel`, user_action: "PAY_NOW" } } },
    }),
  });
  const d = await r.json();
  const link = (d.links || []).find((l: any) => l.rel === "payer-action" || l.rel === "approve");
  if (!r.ok || !link) return j({ error: "paypal_order", message: d?.message || "PayPal order failed." }, 400);
  return j({ approveUrl: link.href, orderId: d.id });
}

/* ---------------- M-Pesa (Safaricom Daraja, STK Push) : il faut un Paybill ou un Till ---------------- */
const MP = () => (env.MPESA_ENV === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke");

async function mpesa(body: any, amount: number) {
  const ck = env.MPESA_CONSUMER_KEY, cs = env.MPESA_CONSUMER_SECRET, sc = env.MPESA_SHORTCODE, pk = env.MPESA_PASSKEY;
  if (!ck || !cs || !sc || !pk) return j({ error: "not_configured" }, 501);
  let phone = String(body.phone || "").replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "254" + phone.slice(1);
  if (!/^254\d{9}$/.test(phone)) return j({ error: "bad_phone", message: "Use a Kenyan number like 0712345678." }, 400);

  const t = await fetch(MP() + "/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: "Basic " + Buffer.from(ck + ":" + cs).toString("base64") },
  });
  const token = (await t.json()).access_token;
  if (!token) return j({ error: "mpesa_auth", message: "M-Pesa login failed." }, 500);

  const ts = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const r = await fetch(MP() + "/mpesa/stkpush/v1/processrequest", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: sc,
      Password: Buffer.from(sc + pk + ts).toString("base64"),
      Timestamp: ts,
      TransactionType: env.MPESA_TYPE || "CustomerPayBillOnline", // "CustomerBuyGoodsOnline" pour un Till
      Amount: Math.ceil(amount),
      PartyA: phone,
      PartyB: env.MPESA_TILL || sc,
      PhoneNumber: phone,
      CallBackURL: `${APP_URL()}/api/pay/mpesa-callback`,
      AccountReference: "KingShipping",
      TransactionDesc: "King Shipping order",
    }),
  });
  const d = await r.json();
  if (d.ResponseCode === "0") return j({ message: "Check your phone and enter your M-Pesa PIN to finish." });
  return j({ error: "mpesa_failed", message: d.errorMessage || d.ResponseDescription || "M-Pesa request failed." }, 400);
}

/* ---------------- Airtel Money (Airtel Open API) : il faut un compte marchand Airtel ---------------- */
// À vérifier avec la documentation Airtel Africa de ton pays avant de passer en "live".
const AT = () => (env.AIRTEL_ENV === "live" ? "https://openapi.airtel.africa" : "https://openapiuat.airtel.africa");
const DIAL: Record<string, string> = { KE: "254", CD: "243", UG: "256", TZ: "255", RW: "250", ZM: "260", MW: "265", NG: "234" };

async function airtel(body: any, amount: number) {
  const id = env.AIRTEL_CLIENT_ID, secret = env.AIRTEL_CLIENT_SECRET;
  if (!id || !secret) return j({ error: "not_configured" }, 501);
  const country = env.AIRTEL_COUNTRY || "KE", currency = env.AIRTEL_CURRENCY || "KES";
  let msisdn = String(body.phone || "").replace(/\D/g, "");
  const dial = DIAL[country] || "";
  if (dial && msisdn.startsWith(dial)) msisdn = msisdn.slice(dial.length);
  if (msisdn.startsWith("0")) msisdn = msisdn.slice(1);
  if (msisdn.length < 8) return j({ error: "bad_phone", message: "Invalid Airtel Money number." }, 400);

  const t = await fetch(AT() + "/auth/oauth2/token", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: id, client_secret: secret, grant_type: "client_credentials" }),
  });
  const token = (await t.json()).access_token;
  if (!token) return j({ error: "airtel_auth", message: "Airtel login failed." }, 500);

  const r = await fetch(AT() + "/merchant/v2/payments/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Country": country, "X-Currency": currency },
    body: JSON.stringify({
      reference: "King Shipping order",
      subscriber: { country, currency, msisdn },
      transaction: { amount, country, currency, id: "KS" + Date.now() },
    }),
  });
  const d = await r.json();
  if (d?.status?.success) return j({ message: "Check your phone and enter your Airtel Money PIN to finish." });
  return j({ error: "airtel_failed", message: d?.status?.message || "Airtel Money request failed." }, 400);
}