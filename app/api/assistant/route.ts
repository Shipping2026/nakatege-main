import { NextResponse } from "next/server";

// Fichier à placer ici : app/api/assistant/route.ts
// La clé reste SECRÈTE sur le serveur : ANTHROPIC_API_KEY dans le fichier .env.local

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 500 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const messages: Msg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
    .slice(-12)
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user")
    return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const currency = String(body.currency || "USD").slice(0, 5);
  const country = String(body.country || "").slice(0, 40);
  const catalogue = (Array.isArray(body.catalogue) ? body.catalogue : []).slice(0, 200);

  const system = `You are King AI, the shopping assistant inside the King Shipping app.
Your job: help the customer find a product and tell them the REAL market price.
- Reply in the same language as the customer. Keep answers short, clear, friendly. Plain text only, no markdown.
- First check the store catalogue below. If a matching product exists, recommend it with its store price.
- For real prices of products (or products not in the store), use web search, then give a realistic price range and name the typical sellers or sources. Say clearly that prices change.
- The customer is in ${country || "an unknown country"} and prefers ${currency}. Give prices in ${currency} when you can, and say when it is an approximate conversion.
- Never invent a price or a product. If you are not sure, say so.
- Do not talk about topics other than shopping.

Store catalogue (JSON): ${JSON.stringify(catalogue)}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 1000,
        system,
        messages,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      }),
    });
    const data: any = await r.json();
    if (!r.ok) return NextResponse.json({ error: data?.error?.message || "api_error" }, { status: 500 });
    const text = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ text: text || "I could not find an answer." });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 500 });
  }
}