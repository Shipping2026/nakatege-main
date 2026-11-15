"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "messages" | "activity" | "orders";
type View = "home" | "chat" | "favorites" | "profile";
type Panel = "none" | "cart" | "notifs" | "thread";
type Msg = { from: "them" | "me"; text: string; time: string };
type Thread = { id: number; sender: string; time: string; replied: boolean; unread: boolean; msgs: Msg[] };
type Product = { id: number; name: string; price: number; rating: number; sold: number; image: string };
type Order = { id: string; item: string; status: string; step: number };
type Notif = { id: number; text: string; read: boolean };

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const THREADS0: Thread[] = [];
const PRODUCTS: Product[] = [];
const ORDERS: Order[] = [];
const ACTIVITY: string[] = [];
const NOTIFS0: Notif[] = [];
const AGENT_EMAIL = "agent@icloud.com";
const AGENT_WHATSAPP = "254182349840";

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>("messages");
  const [view, setView] = useState<View>("home");
  const [panel, setPanel] = useState<Panel>("none");
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<Thread[]>(THREADS0);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS0);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favs, setFavs] = useState<number[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [showAllMsgs, setShowAllMsgs] = useState(false);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCart(load("ks2-cart", {})); setFavs(load("ks2-favs", []));
    setThreads(load("ks2-threads", THREADS0)); setNotifs(load("ks2-notifs", NOTIFS0));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("ks2-cart", JSON.stringify(cart));
      localStorage.setItem("ks2-favs", JSON.stringify(favs));
      localStorage.setItem("ks2-threads", JSON.stringify(threads));
      localStorage.setItem("ks2-notifs", JSON.stringify(notifs));
    } catch {}
  }, [cart, favs, threads, notifs, ready]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 1800); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threads, openId, panel]);

  const q = query.trim().toLowerCase();
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = PRODUCTS.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
  const unreadNotifs = notifs.filter(n => !n.read).length;
  const unreadThreads = threads.filter(t => t.unread).length;
  const open = threads.find(t => t.id === openId) || null;

  const results = useMemo(() => {
    if (!q) return null;
    return {
      threads: threads.filter(t => t.sender.toLowerCase().includes(q) || t.msgs.some(m => m.text.toLowerCase().includes(q))),
      orders: ORDERS.filter(o => o.id.toLowerCase().includes(q) || o.item.toLowerCase().includes(q)),
      products: PRODUCTS.filter(p => p.name.toLowerCase().includes(q)),
    };
  }, [q, threads]);

  const addToCart = (p: Product) => { setCart(c => ({ ...c, [p.id]: (c[p.id] || 0) + 1 })); setToast(`${p.name} added`); };
  const setQty = (id: number, d: number) => setCart(c => { const n = (c[id] || 0) + d; const { [id]: _, ...rest } = c; return n > 0 ? { ...c, [id]: n } : rest; });
  const toggleFav = (id: number) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const openThread = (id: number) => { setThreads(ts => ts.map(t => t.id === id ? { ...t, unread: false } : t)); setOpenId(id); setPanel("thread"); };
  const startAdminThread = () => {
    const ex = threads.find(t => t.sender === "Admin");
    if (ex) return openThread(ex.id);
    const id = Date.now();
    setThreads(ts => [{ id, sender: "Admin", time: now(), replied: false, unread: false, msgs: [] }, ...ts]);
    setOpenId(id); setPanel("thread");
  };
  const send = () => {
    const text = draft.trim(); if (!text || openId === null) return;
    setThreads(ts => ts.map(t => t.id === openId ? { ...t, replied: true, msgs: [...t.msgs, { from: "me", text, time: now() }] } : t));
    setDraft("");
  };
  const checkout = () => { setToast("Order placed!"); setNotifs(n => [{ id: Date.now(), text: `Order confirmed: $${cartTotal.toFixed(2)}`, read: false }, ...n]); setCart({}); setPanel("none"); };
  const goView = (v: View) => { setView(v); setPanel("none"); };

  const ProductCard = ({ p }: { p: Product }) => (
    <article className="product">
      <button className={`heart ${favs.includes(p.id) ? "on" : ""}`} onClick={() => toggleFav(p.id)}>♥</button>
      <img src={p.image} alt={p.name} /><div className="stars">★★★★★</div>
      <div className="meta">{p.rating} • {p.sold} sold</div><h3>{p.name}</h3><strong>${p.price.toFixed(2)}</strong>
      <button className="add" onClick={() => addToCart(p)}>Add to cart</button>
    </article>
  );
  const ThreadCard = ({ t }: { t: Thread }) => {
    const last = t.msgs[t.msgs.length - 1];
    return (
      <button className="msg" onClick={() => openThread(t.id)}>
        <img src="/avatar.png" alt="" className="avatar" />
        <div className="msg-body"><div className="msg-row"><strong>{t.sender}</strong>{t.replied ? <span className="replied">✔ Replied</span> : <time>{t.time}</time>}</div><p>{last ? last.text : "No messages yet"}</p></div>
        {t.unread && <i className="unread" />}
      </button>
    );
  };
  const OrderCard = ({ o }: { o: Order }) => (
    <article className="order"><div className="msg-row"><strong>{o.id}</strong><span className="status">{o.status}</span></div><p>{o.item}</p><div className="bar"><i style={{ width: `${(o.step / 3) * 100}%` }} /></div></article>
  );

  return (
    <main className="ks">
      <style>{css}</style>
      {/* BARRE DE RETOUR SEULEMENT */}
      <header className="ks-back">
        <button onClick={() => { if(panel !== "none") setPanel("none"); else if(view !== "home") goView("home"); else history.back(); }}>‹ Retour</button>
        <img src="/logo.png" alt="KS" />
      </header>

      <div className="searchbox">
        <input className="ks-search" placeholder="Search messages, orders, products..." value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button className="clear" onClick={() => setQuery("")}>✕</button>}
      </div>

      {results ? (
        <section><div className="ks-head"><h2>Search results</h2></div>
          {results.threads.length + results.orders.length + results.products.length === 0 && <p className="empty">Nothing found for “{query}”.</p>}
          {results.threads.length > 0 && <><h4>Messages</h4>{results.threads.map(t => <ThreadCard key={t.id} t={t} />)}</>}
          {results.orders.length > 0 && <><h4>Orders</h4>{results.orders.map(o => <OrderCard key={o.id} o={o} />)}</>}
          {results.products.length > 0 && <><h4>Products</h4><div className="products">{results.products.map(p => <ProductCard key={p.id} p={p} />)}</div></>}
        </section>
      ) : (
        <>
          {view === "home" && (
            <>
              <nav className="ks-tabs"><button aria-selected={tab === "messages"} onClick={() => setTab("messages")}>Messages{unreadThreads > 0 && <b className="count-inline">{unreadThreads}</b>}</button><button aria-selected={tab === "activity"} onClick={() => setTab("activity")}>Activity</button><button aria-selected={tab === "orders"} onClick={() => setTab("orders")}>Live orders</button></nav>
              <div className="ks-channels"><a className="email" href={`mailto:${AGENT_EMAIL}`}>✉ Email</a><a className="wa" href={`https://wa.me/${AGENT_WHATSAPP}`} target="_blank">💬 WhatsApp</a><button className="notif" onClick={() => setPanel("notifs")}>🔔 {unreadNotifs > 0 ? `${unreadNotifs} new` : "Notifications"}</button></div>
              {tab === "messages" && <><section><div className="ks-head"><h2>Recent</h2><button className="link" onClick={() => setShowAllMsgs(v => !v)}>{showAllMsgs ? "Show less" : "See all ›"}</button></div>{threads.length === 0 && <p className="empty">No messages yet.</p>}{(showAllMsgs ? threads : threads.slice(0, 2)).map(t => <ThreadCard key={t.id} t={t} />)}<button className="primary" onClick={startAdminThread}>New message to admin</button></section></>}
              {tab === "activity" && <section>{ACTIVITY.length === 0 && <p className="empty">No activity yet.</p>}</section>}
              {tab === "orders" && <section>{ORDERS.length === 0 && <p className="empty">No live orders yet.</p>}{ORDERS.map(o => <OrderCard key={o.id} o={o} />)}</section>}
            </>
          )}
          {view === "chat" && <section><div className="ks-head"><h2>Conversations</h2></div>{threads.map(t => <ThreadCard key={t.id} t={t} />)}</section>}
          {view === "favorites" && <section><div className="ks-head"><h2>Favorites</h2></div><div className="products">{PRODUCTS.map(p => <ProductCard key={p.id} p={p} />)}</div></section>}
          {view === "profile" && <section className="profile"><div className="ks-head"><h2>My account</h2></div><p>Cart: {cartCount} • Total: ${cartTotal.toFixed(2)}</p></section>}
        </>
      )}

      <footer className="ks-nav">
        <button className={view === "home" ? "on" : ""} onClick={() => { goView("home"); setQuery(""); }}>🏠</button>
        <button className={`${view === "chat" ? "on" : ""} ${unreadThreads ? "dot" : ""}`} onClick={() => { goView("chat"); setQuery(""); }}>💬</button>
        <button onClick={() => (threads[0] ? openThread(threads[0].id) : startAdminThread())}>🗨</button>
        <button className={view === "favorites" ? "on" : ""} onClick={() => { goView("favorites"); setQuery(""); }}>♥</button>
        <button className={view === "profile" ? "on" : ""} onClick={() => { goView("profile"); setQuery(""); }}>👤</button>
      </footer>

      {panel !== "none" && <div className="scrim" onClick={() => setPanel("none")} />}
      {panel === "cart" && <aside className="sheet"><div className="ks-head"><h2>Cart</h2><button className="link" onClick={() => setPanel("none")}>Close ✕</button></div>{cartCount === 0 ? <p className="empty">Empty</p> : <><div className="total"><span>Total</span><strong>${cartTotal.toFixed(2)}</strong></div><button className="primary" onClick={checkout}>Place order</button></>}</aside>}
      {panel === "notifs" && <aside className="sheet"><div className="ks-head"><h2>Notifications</h2><button className="link" onClick={() => setNotifs(n => n.map(x => ({ ...x, read: true })))}>Mark all read</button></div>{notifs.map(n => <button key={n.id} className={`notif-item ${n.read ? "" : "new"}`} onClick={() => setNotifs(l => l.map(x => x.id === n.id ? { ...x, read: true } : x))}>{n.text}</button>)}</aside>}
      {panel === "thread" && open && <aside className="sheet tall"><div className="ks-head"><h2>{open.sender}</h2><button className="link" onClick={() => setPanel("none")}>Close ✕</button></div><div className="bubbles">{open.msgs.map((m, i) => <div key={i} className={`bubble ${m.from}`}>{m.text}<time>{m.time}</time></div>)}<div ref={endRef} /></div><div className="composer"><input value={draft} placeholder="Write a reply..." onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} /><button className="primary" onClick={send}>Send</button></div></aside>}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

const css = `
.ks{--bg:#111;--gold:#d9a441;--orange:#e8651a;--card:#fff;max-width:430px;margin:0 auto;padding:0 14px 96px;background:var(--bg);color:#fff;min-height:100vh;font-family:system-ui;position:relative}
.ks-back{height:48px;display:flex;align-items:center;justify-content:space-between;background:#000;color:#fff;padding:0 4px;position:sticky;top:0;z-index:9}
.ks-back button{background:none;font-size:16px;font-weight:600;color:#fff}
.ks-back img{width:32px;height:32px;border-radius:50%;object-fit:cover}
.searchbox{position:relative;margin-top:12px}.ks-search{width:100%;padding:12px 40px 12px 16px;border-radius:999px;border:1px solid #333;background:#1a1a1a;color:#fff;box-sizing:border-box}.clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none}
.ks-tabs{display:flex;background:#222;border-radius:10px;margin-top:14px}.ks-tabs button{flex:1;padding:12px 6px;opacity:.6;font-weight:600;background:none}.ks-tabs button[aria-selected=true]{opacity:1;border-bottom:2px solid var(--orange);color:var(--gold)}
.ks-channels{display:flex;gap:8px;margin:14px 0}.ks-channels>*{flex:1;padding:12px 6px;border-radius:10px;font-weight:600;text-align:center;font-size:14px}.email{background:var(--orange)}.wa{background:#2bb55a}.notif{background:#2f6fe0}
.ks-head{display:flex;justify-content:space-between;margin:10px 0}.link{background:none;color:var(--orange)!important}.msg{display:flex;gap:10px;background:#fff;color:#111;border-radius:14px;padding:12px;margin-bottom:10px;width:100%;text-align:left}.avatar{width:38px;height:38px;border-radius:50%;background:#ddd}.msg-body{flex:1;min-width:0}.msg-row{display:flex;justify-content:space-between}.replied{color:#1d6fd6;font-size:12px}.unread{width:8px;height:8px;background:var(--orange);border-radius:50%;align-self:center}.empty{color:#888;text-align:center;padding:20px 0}.products{display:grid;grid-template-columns:1fr 1fr;gap:10px}.product{background:#f3f3f3;color:#111;border-radius:14px;padding:10px;text-align:center;position:relative}.product img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;background:#e6e6e6}.heart{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;background:#fff;color:#bbb}.heart.on{color:#e0245e}.stars{color:#f5b400;font-size:12px}.meta{font-size:12px;color:#666}.product h3{font-size:13px;margin:4px 0}.product strong{color:var(--orange)}.add{margin-top:6px;background:var(--orange);color:#fff;padding:6px 10px;border-radius:999px;font-size:12px}.order{background:#1e1e1e;border-radius:12px;padding:12px;margin-bottom:8px}.status{color:var(--orange);font-size:12px}.bar{height:5px;background:#333;border-radius:3px;margin-top:8px}.bar i{display:block;height:100%;background:var(--orange)}.ks-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;display:flex;justify-content:space-around;padding:12px 0 18px;background:#1a1a1a;z-index:5}.ks-nav button{background:none;font-size:22px;opacity:.5}.ks-nav button.on{opacity:1}.dot::after{content:"";position:absolute;top:0;right:6px;width:7px;height:7px;background:var(--orange);border-radius:50%}.scrim{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10}.sheet{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;max-height:70vh;overflow:auto;background:#1a1a1a;border-radius:18px 18px 0 0;padding:14px;z-index:11;box-sizing:border-box}.sheet.tall{height:70vh;display:flex;flex-direction:column}.total{display:flex;justify-content:space-between;padding:10px 0}.primary{background:var(--orange);color:#fff!important;padding:10px 16px;border-radius:10px;font-weight:700;width:100%}.notif-item{width:100%;text-align:left;background:#242424;padding:12px;border-radius:10px;margin-bottom:6px}.notif-item.new{border-left:3px solid var(--orange);color:#fff}.bubbles{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px}.bubble{max-width:78%;padding:8px 12px;border-radius:14px;font-size:14px}.bubble.them{background:#2a2a2a;align-self:flex-start}.bubble.me{background:var(--orange);align-self:flex-end}.bubble time{display:block;font-size:10px;opacity:.6}.composer{display:flex;gap:6px;padding-top:8px}.composer input{flex:1;padding:10px 12px;border-radius:999px;border:1px solid #444;background:#111;color:#fff}.composer .primary{width:auto}.toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#fff;color:#111;padding:8px 16px;border-radius:999px;font-weight:600;z-index:20}
`;