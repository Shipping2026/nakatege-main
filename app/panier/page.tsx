"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = { id: number; name: string; price: number; rating: number; sold: number; image: string };

// Vide pour l'instant. Quand tu publies, les produits arrivent ici
// (le mieux : mettre cette liste dans un fichier commun avec la page messages).
const PRODUCTS: Product[] = [];

const METHODS = [
  { id: "paypal", label: "PayPal", icon: "P", color: "#1d4fd8" },
  { id: "apple", label: "Apple Pay", icon: "", color: "#2563eb" },
  { id: "mpesa", label: "M-Pesa", icon: "MP", color: "#16a34a" },
  { id: "orange", label: "Orange Money", icon: "◎", color: "#ea580c" },
  { id: "wave", label: "Wave", icon: "≋", color: "#0ea5e9" },
  { id: "card", label: "Bank Card", icon: "▭", color: "#f59e0b" },
];

const SHIPPING_RATE = 0.15;

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [method, setMethod] = useState<string>("");
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(load("ks2-cart", {}));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("ks2-cart", JSON.stringify(cart)); } catch {}
  }, [cart, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const items = PRODUCTS.filter((p) => cart[p.id]);
  const unit = items.reduce((s, p) => s + p.price * cart[p.id], 0);
  const shipping = unit * SHIPPING_RATE;
  const total = unit + shipping;
  const money = (n: number) => `$${n.toFixed(2)}`;

  const setQty = (id: number, d: number) =>
    setCart((c) => {
      const n = (c[id] || 0) + d;
      const { [id]: _, ...rest } = c;
      return n > 0 ? { ...c, [id]: n } : rest;
    });
  const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const placeOrder = () => {
    if (items.length === 0) return setToast("Your cart is empty. Add a product first.");
    try {
      const orders = load<unknown[]>("ks2-orders", []);
      orders.unshift({ id: `#KS${Date.now()}`, items: cart, total, status: "Placed" });
      localStorage.setItem("ks2-orders", JSON.stringify(orders));
    } catch {}
    setCart({});
    setToast("Order placed. Thank you!");
  };

  const pay = () => {
    if (items.length === 0) return setToast("Your cart is empty. Add a product first.");
    if (!method) return setToast("Choose a payment method first.");
    // TODO backend : lancer le vrai paiement (M-Pesa, PayPal, carte...) ici
    setToast(`Payment started with ${METHODS.find((m) => m.id === method)?.label}`);
  };

  return (
    <main className="cp">
      <style>{css}</style>

      <header className="cp-top">
        <button aria-label="Back" className="back" onClick={() => router.back()}>‹</button>
        <div className="brand">
          <img src="/logo.png" alt="" width={36} height={36} />
          <span>KING SHOPPING</span>
        </div>
        <div className="icons">
          <button aria-label="Cart">🛒{items.length > 0 && <b className="count">{items.length}</b>}</button>
          <button aria-label="Notifications" onClick={() => router.push("/messages")}>🔔</button>
        </div>
      </header>

      {items.length === 0 ? (
        <section className="empty">
          <div className="big">🛒</div>
          <h2>Your cart is empty —</h2>
          <button className="blue" onClick={() => router.push("/messages")}>Add Products</button>
        </section>
      ) : (
        <section className="lines">
          {items.map((p) => (
            <div key={p.id} className="line">
              <span>{p.name}<br /><small>{money(p.price)}</small></span>
              <span className="qty">
                <button aria-label="Remove one" onClick={() => setQty(p.id, -1)}>−</button>
                <b>{cart[p.id]}</b>
                <button aria-label="Add one" onClick={() => setQty(p.id, 1)}>+</button>
              </span>
            </div>
          ))}
        </section>
      )}

      <section className="box">
        <h3>Order Summary</h3>
        <div className="row"><span>15% Shipping fee</span><span>{money(shipping)}</span></div>
        <div className="row"><span>Unit price</span><span>{money(unit)}</span></div>
        <div className="row"><span>Total price</span><b className="gold">{money(total)}</b></div>
        <div className="actions">
          <button className="ghost" onClick={placeOrder}>Place Order</button>
          <button className="goldbtn" onClick={pay}>Pay Your Order</button>
        </div>
      </section>

      <section className="box">
        <h3>Payment Methods</h3>
        <div className="methods">
          {METHODS.map((m) => (
            <button key={m.id} className={`method ${method === m.id ? "sel" : ""}`} aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>
              <i style={{ background: m.color }}>{m.icon}</i>
              <small>{m.label}</small>
            </button>
          ))}
        </div>
      </section>

      <h3 className="rec">Recommended Products</h3>
      {PRODUCTS.length === 0 ? (
        <p className="none">No products yet. They will appear here once posted.</p>
      ) : (
        <div className="prods">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="prod">
              <img src={p.image} alt={p.name} />
              <h4>{p.name}</h4>
              <small>{p.rating} ★ • {p.sold} sold</small>
              <strong>{money(p.price)}</strong>
              <button onClick={() => add(p.id)}>Add to cart</button>
            </article>
          ))}
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

const css = `
.cp{--gold:#e8b85c;--bg:#0f0f10;max-width:430px;margin:0 auto;min-height:100vh;background:var(--bg);color:#fff;font-family:system-ui,sans-serif;padding:0 16px 40px}
.cp button{font:inherit;color:inherit;border:0;cursor:pointer;background:none}
.cp button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.cp-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;background:#1a1a1b;margin:0 -16px;padding:12px 16px}
.back{font-size:34px;line-height:1;padding:0 10px 4px 0}
.brand{display:flex;align-items:center;gap:8px;color:var(--gold);font-weight:600;letter-spacing:.06em}
.brand img{border-radius:50%;border:1px solid var(--gold)}
.icons{display:flex;gap:14px;font-size:22px}
.icons button{position:relative}
.count{position:absolute;top:-6px;right:-8px;min-width:18px;height:18px;border-radius:9px;background:#e8651a;font-size:11px;display:grid;place-items:center}
.empty{text-align:center;padding:36px 0 28px}
.big{font-size:96px;opacity:.55}
.empty h2{font-size:24px;font-weight:600;margin:8px 0 16px}
.blue{background:#2160c4!important;padding:12px 22px;border-radius:10px;font-weight:600}
.lines{margin-top:12px}
.line{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #333}
.line small{color:#aaa}
.qty{display:flex;align-items:center;gap:12px}
.qty button{width:32px;height:32px;border-radius:50%;background:#333;font-size:18px}
.box{border:1px solid #6b5420;border-radius:10px;padding:14px;margin:18px 0}
.box h3{margin:0 0 10px;font-size:17px;font-weight:500;color:var(--gold)}
.row{display:flex;justify-content:space-between;padding:9px 0;color:#ddd}
.gold{color:var(--gold)}
.actions{display:flex;gap:12px;margin-top:10px}
.actions button{flex:1;padding:12px 8px;border-radius:8px;font-weight:600}
.ghost{border:1px solid var(--gold)!important;color:#fff}
.goldbtn{background:var(--gold)!important;color:#1a1305!important}
.methods{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.method{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:12px;background:#1f1f21!important;border:2px solid transparent!important}
.method.sel{border-color:var(--gold)!important}
.method i{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-weight:700;font-size:16px}
.method small{font-size:11px;color:#ccc}
.rec{color:var(--gold);font-weight:500;font-size:19px;margin:24px 0 12px}
.none{color:#999;text-align:center;padding:16px 0}
.prods{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.prod{background:#f1f1f1;color:#111;border-radius:12px;padding:8px;text-align:center}
.prod img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#e2e2e2}
.prod h4{font-size:12px;margin:6px 0 2px}.prod small{display:block;font-size:10px;color:#555}
.prod strong{display:block;font-size:13px;margin:4px 0}
.prod button{background:#e8651a;color:#fff;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:600}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#fff;color:#111;padding:10px 18px;border-radius:999px;font-weight:600;z-index:20;max-width:90%;text-align:center}
`;