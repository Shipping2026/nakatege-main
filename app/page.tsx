"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ======================================================
//  KING SHOPPING — Page d'accueil (app/page.tsx)
// ======================================================

const ORANGE = "#e8650a";
const USER_NAME = "KING";
const PROFILE_PHOTO = ""; // ex : "/photos/profil.jpg" (sinon la lettre du nom s'affiche)
const CART_KEY = "king-cart"; // même panier que la page Catégories

type Product = { id: string; name: string; price: number; old: number; category: string; img: string };
type Cart = Record<string, { product: Product; qty: number }>;

// Raccourcis du haut (les "id" sont les catégories de la page admin)
const SHORTCUTS = [
  { id: "vetements", label: "Mode", icon: "👕" },
  { id: "electronique", label: "Électronique", icon: "📱" },
  { id: "beaute", label: "Beauté", icon: "💄" },
  { id: "maison", label: "Maison", icon: "🛋️" },
  { id: "sport", label: "Sport", icon: "🏋️" },
  { id: "gaming", label: "Jeux", icon: "🎮" },
];

const euro = (n: number) => n.toFixed(2).replace(".", ",") + " €";
const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function HomePage() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [onlyPromo, setOnlyPromo] = useState(false);

  // Produits publiés depuis la page admin
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) setCatalog(await res.json());
      } catch {}
    };
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Panier enregistré dans le téléphone
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, loaded]);

  const count = Object.values(cart).reduce((n, l) => n + l.qty, 0);
  const addToCart = (p: Product) =>
    setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty ?? 0) + 1 } }));

  // Recherche vocale (micro)
  const listen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("La recherche vocale n'est pas disponible sur ce navigateur.");
    const r = new SR();
    r.lang = "fr-FR";
    r.onresult = (e: any) => setQuery(e.results[0][0].transcript);
    r.start();
  };

  const showOffers = () => {
    setOnlyPromo(true);
    setCat(null);
    document.getElementById("produits")?.scrollIntoView({ behavior: "smooth" });
  };

  const visible = catalog.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!onlyPromo || p.old > p.price) &&
      norm(p.name).includes(norm(query))
  );
  const filtered = cat !== null || onlyPromo || query.trim() !== "";

  return (
    <div style={s.page}>
      {/* EN-TÊTE SOMBRE */}
      <header style={s.header}>
        <div style={s.welcomeRow}>
          <div style={s.avatar}>
            {PROFILE_PHOTO ? <img src={PROFILE_PHOTO} alt="" style={s.avatarImg} /> : USER_NAME[0]}
          </div>
          <div>
            <div style={s.welcome}>Bienvenue,</div>
            <div style={s.welcome}>{USER_NAME}</div>
            <div style={s.verified}>
              <span style={s.verifiedDot}>✓</span> Vérifié
            </div>
          </div>

          <div style={s.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.6" strokeLinecap="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit..." style={s.searchInput} />
            <button style={s.micBtn} onClick={listen} aria-label="Recherche vocale">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3563e9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
          </div>

          <Link href="/panier" style={s.cartBtn} aria-label="Panier">
            <CartIcon size={20} color="#fff" />
            {count > 0 && <span style={s.badge}>{count}</span>}
          </Link>
        </div>
      </header>

      {/* RACCOURCIS */}
      <div style={s.shortcuts}>
        {SHORTCUTS.map((c) => {
          const on = cat === c.id;
          return (
            <button key={c.id} style={s.shortcut} onClick={() => { setCat(on ? null : c.id); setOnlyPromo(false); }}>
              <span style={{ ...s.shortcutBox, borderColor: on ? ORANGE : "#9bb0d8", background: on ? "#fff3ea" : "#fff" }}>{c.icon}</span>
              <span style={{ fontSize: 11, fontWeight: on ? 700 : 500, color: on ? ORANGE : "#111" }}>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* BANNIÈRE */}
      <section style={s.banner}>
        <h2 style={s.bannerTitle}>
          Super Soldes
          <br />
          Jusqu'à -70%
        </h2>
        <p style={s.bannerText}>Livraison offerte dès 50€</p>
        <button style={s.bannerBtn} onClick={showOffers}>
          Voir les offres →
        </button>
      </section>

      {/* PRODUITS */}
      <section id="produits" style={s.products}>
        <div style={s.productsHead}>
          <h2 style={s.h2}>Produits</h2>
          <span style={{ color: "#555", fontSize: 14 }}>
            {visible.length} article{visible.length > 1 ? "s" : ""}
          </span>
        </div>

        {filtered && (
          <button style={s.resetBtn} onClick={() => { setCat(null); setOnlyPromo(false); setQuery(""); }}>
            ✕ Tout afficher
          </button>
        )}

        {visible.length > 0 ? (
          <div style={s.grid}>
            {visible.map((p) => {
              const onSale = p.old > p.price;
              const inCart = cart[p.id]?.qty ?? 0;
              return (
                <article key={p.id} style={s.card}>
                  <div style={s.imgWrap}>
                    {onSale && <span style={s.promo}>-{Math.round((1 - p.price / p.old) * 100)}%</span>}
                    <img src={p.img} alt={p.name} loading="lazy" style={s.img} />
                  </div>
                  <div style={s.prodName}>{p.name}</div>
                  <div style={s.price}>{euro(p.price)}</div>
                  <div style={s.oldPrice}>{onSale ? euro(p.old) : "\u00a0"}</div>
                  <button style={s.addBtn} onClick={() => addToCart(p)}>
                    <CartIcon size={16} color="#fff" />
                    {inCart > 0 ? `Ajouté (${inCart})` : "Ajouter"}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={s.grid}>
            {[0, 1].map((i) => (
              <div key={i} style={s.placeholder}>
                <svg width="76" height="60" viewBox="0 0 76 60" fill="none" stroke="#888" strokeWidth="2" strokeDasharray="5 4">
                  <path d="M8 18h60v34H8zM8 18l8-12h44l8 12" />
                  <path d="M30 28h16" />
                </svg>
                <span style={{ fontSize: 13, color: "#555", textAlign: "center", marginTop: 14 }}>
                  {filtered ? "Aucun produit trouvé" : <>Aucun produit publié<br />pour le moment</>}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BARRE DU BAS */}
      <nav style={s.nav}>
        <NavItem href="/" label="Accueil" active icon={<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" fill={ORANGE} stroke={ORANGE} />} />
        <NavItem href="/categories" label="Catégories" icon={<><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>} />
        <NavItem href="/messages" label="Messages" icon={<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z" />} />
        <NavItem href="/panier" label="Panier" badge={count} icon={<><path d="M2 3h3l2.4 12.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 7H6" /><circle cx="9.5" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></>} />
        <NavItem href="/profil" label="Profil" icon={<><circle cx="12" cy="9" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>} />
      </nav>
    </div>
  );
}

function NavItem({ href, label, icon, active, badge }: { href: string; label: string; icon: React.ReactNode; active?: boolean; badge?: number }) {
  return (
    <Link href={href} style={{ ...s.navItem, color: active ? ORANGE : "#444", fontWeight: active ? 700 : 500 }}>
      <span style={{ position: "relative", display: "flex" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? ORANGE : "#444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
        {badge !== undefined && <span style={s.navBadge}>{badge}</span>}
      </span>
      {label}
    </Link>
  );
}

function CartIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h3l2.4 12.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 7H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </svg>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100dvh", background: "linear-gradient(#ebe8e5, #f4f2f0)", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", color: "#111", paddingBottom: 100 },

  header: { background: "#0e0e10", borderRadius: "0 0 28px 28px", padding: "22px 16px 24px" },
  welcomeRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 56, height: 56, borderRadius: "50%", background: "#d9d3cc", color: "#222", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  welcome: { color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1.25 },
  verified: { color: "#3b82f6", fontSize: 12, marginTop: 2, display: "flex", alignItems: "center", gap: 4 },
  verifiedDot: { background: "#3b82f6", color: "#fff", borderRadius: "50%", width: 13, height: 13, fontSize: 9, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  searchBox: { flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6, background: "#d9d9dc", borderRadius: 14, padding: "9px 10px" },
  searchInput: { flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: "inherit" },
  micBtn: { background: "none", border: "none", padding: 0, display: "flex", cursor: "pointer" },
  cartBtn: { position: "relative", width: 40, height: 40, borderRadius: 10, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: { position: "absolute", top: -7, right: -7, minWidth: 18, height: 18, borderRadius: 9, background: "#fff", color: ORANGE, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" },

  shortcuts: { display: "flex", justifyContent: "space-between", padding: "18px 14px 6px" },
  shortcut: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" },
  shortcutBox: { width: 50, height: 50, borderRadius: 12, border: "1.5px solid #9bb0d8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },

  banner: { margin: "18px 16px 0", borderRadius: 22, padding: "24px 20px 20px", background: "linear-gradient(115deg, #ee7d3f 0%, #d9622a 38%, #14100e 78%)", color: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" },
  bannerTitle: { margin: 0, fontSize: 30, lineHeight: 1.12, fontWeight: 900 },
  bannerText: { margin: "12px 0 14px", fontSize: 13, fontWeight: 600 },
  bannerBtn: { display: "block", marginLeft: "auto", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },

  products: { padding: "26px 16px 0" },
  productsHead: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 },
  h2: { margin: 0, fontSize: 26, fontWeight: 900, color: "#0b1b3a" },
  resetBtn: { background: "#fff3ea", color: ORANGE, border: `1px solid ${ORANGE}`, borderRadius: 16, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 14, fontFamily: "inherit" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 },
  placeholder: { minHeight: 230, border: "2px dashed #999", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12 },

  card: { background: "#fff", borderRadius: 10, padding: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", alignItems: "center" },
  imgWrap: { position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#f2f2f2", borderRadius: 8, overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  promo: { position: "absolute", top: 0, left: 0, background: ORANGE, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: "8px 0 8px 0", zIndex: 1 },
  prodName: { fontSize: 12, marginTop: 10, textAlign: "center" },
  price: { fontSize: 17, fontWeight: 800, marginTop: 4 },
  oldPrice: { fontSize: 11, color: "#777", textDecoration: "line-through", marginBottom: 8 },
  addBtn: { width: "100%", background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" },

  nav: { position: "fixed", left: 12, right: 12, bottom: 12, background: "#fff", borderRadius: 26, boxShadow: "0 4px 18px rgba(0,0,0,0.18)", display: "flex", justifyContent: "space-around", padding: "10px 4px 8px", zIndex: 5 },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 11, textDecoration: "none", flex: 1 },
  navBadge: { position: "absolute", top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: "#333", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
};