"use client";

import { useEffect, useState } from "react";

// ======================================================
//  KING SHOPPING — Page Catégories
//  Colle ce fichier dans app/categories/page.tsx
// ======================================================

const ORANGE = "#e8650a";

// Page où le bouton "Passer la commande" envoie le client (change-la si besoin).
const CHECKOUT_URL = "/panier";

// Produit publié depuis la page admin (voir lib/products.ts)
type Product = {
  id: string;
  name: string;
  price: number; // prix actuel (en promotion)
  old: number; // ancien prix
  category: string; // id de la catégorie (ex : "vetements")
  img: string; // adresse de la photo
};
const photo = (p: Product) => p.img;

type Reco = { name: string; icon: string };
type Category = { id: string; name: string; icon: string; recos: Reco[] };

// ---------- Données par défaut (En vedette) ----------
const FEATURED_RECOS: Reco[] = [
  { name: "Téléphones", icon: "📱" },
  { name: "Ordinateurs", icon: "💻" },
  { name: "Mode", icon: "👕" },
  { name: "Maison", icon: "🏠" },
  { name: "Beauté", icon: "💄" },
  { name: "Sport", icon: "🏋️" },
];

// ---------- Catégories (liste de gauche) ----------
// Les produits en promotion ne sont pas écrits ici : ils viennent de ta page admin (/api/products).
const CATEGORIES: Category[] = [
  { id: "vedette", name: "En vedette", icon: "✨", recos: FEATURED_RECOS },
  { id: "offres", name: "Offres spéciales", icon: "🏷️", recos: FEATURED_RECOS },
  {
    id: "vetements", name: "Vêtements & Accessoires", icon: "👕",
    recos: [
      { name: "T-shirts", icon: "👕" }, { name: "Robes", icon: "👗" }, { name: "Pantalons", icon: "👖" },
      { name: "Vestes", icon: "🧥" }, { name: "Chapeaux", icon: "🧢" }, { name: "Écharpes", icon: "🧣" },
    ]
  },
  {
    id: "maison", name: "Maison & Jardin", icon: "🌱",
    recos: [
      { name: "Meubles", icon: "🛋️" }, { name: "Cuisine", icon: "🍳" }, { name: "Literie", icon: "🛏️" },
      { name: "Décoration", icon: "🖼️" }, { name: "Jardin", icon: "🪴" }, { name: "Rangement", icon: "🗄️" },
    ]
  },
  {
    id: "electronique", name: "Électronique", icon: "📱",
    recos: [
      { name: "Smartphones", icon: "📱" }, { name: "Écouteurs", icon: "🎧" }, { name: "Télévisions", icon: "📺" },
      { name: "Enceintes", icon: "🔊" }, { name: "Appareils photo", icon: "📷" }, { name: "Montres connectées", icon: "⌚" },
    ]
  },
  {
    id: "beaute", name: "Beauté & Santé", icon: "💄",
    recos: [
      { name: "Soins visage", icon: "🧴" }, { name: "Maquillage", icon: "💄" }, { name: "Parfums", icon: "🌸" },
      { name: "Cheveux", icon: "💇" }, { name: "Hygiène", icon: "🧼" }, { name: "Vitamines", icon: "💊" },
    ]
  },
  {
    id: "sport", name: "Sport & Loisirs", icon: "🏋️",
    recos: [
      { name: "Fitness", icon: "🏋️" }, { name: "Vélos", icon: "🚴" }, { name: "Football", icon: "⚽" },
      { name: "Camping", icon: "⛺" }, { name: "Yoga", icon: "🧘" }, { name: "Natation", icon: "🏊" },
    ]
  },
  { id: "jouets", name: "Jouets & Jeux", icon: "🧩", recos: FEATURED_RECOS },
  { id: "cuisine", name: "Cuisine", icon: "🍳", recos: FEATURED_RECOS },
  {
    id: "chaussures", name: "Chaussures", icon: "👟",
    recos: [
      { name: "Sneakers", icon: "👟" }, { name: "Sandales", icon: "🩴" }, { name: "Bottes", icon: "🥾" },
      { name: "Talons", icon: "👠" }, { name: "Sport", icon: "🏃" }, { name: "Enfants", icon: "🧒" },
    ]
  },
  { id: "sacs", name: "Sacs & Bagages", icon: "👜", recos: FEATURED_RECOS },
  { id: "bijoux", name: "Bijoux & Montres", icon: "⌚", recos: FEATURED_RECOS },
  { id: "auto", name: "Auto & Moto", icon: "🚗", recos: FEATURED_RECOS },
  { id: "bebe", name: "Bébé & Puériculture", icon: "🍼", recos: FEATURED_RECOS },
  { id: "animaux", name: "Animaux", icon: "🐾", recos: FEATURED_RECOS },
  { id: "bureau", name: "Bureau & Papeterie", icon: "📒", recos: FEATURED_RECOS },
  { id: "telephonie", name: "Téléphonie", icon: "📞", recos: FEATURED_RECOS },
  { id: "informatique", name: "Informatique", icon: "💻", recos: FEATURED_RECOS },
  { id: "tv", name: "TV & Son", icon: "📺", recos: FEATURED_RECOS },
  { id: "gaming", name: "Gaming", icon: "🎮", recos: FEATURED_RECOS },
  { id: "outillage", name: "Outillage", icon: "🔧", recos: FEATURED_RECOS },
  { id: "jardinage", name: "Jardinage", icon: "🪴", recos: FEATURED_RECOS },
  { id: "decoration", name: "Décoration", icon: "🖼️", recos: FEATURED_RECOS },
  { id: "luminaires", name: "Luminaires", icon: "💡", recos: FEATURED_RECOS },
  { id: "literie", name: "Literie", icon: "🛏️", recos: FEATURED_RECOS },
  { id: "meubles", name: "Meubles", icon: "🛋️", recos: FEATURED_RECOS },
  { id: "alimentaire", name: "Alimentaire", icon: "🛍️", recos: FEATURED_RECOS },
  { id: "boissons", name: "Boissons", icon: "🥤", recos: FEATURED_RECOS },
  { id: "sante", name: "Santé", icon: "➕", recos: FEATURED_RECOS },
  { id: "accessoires", name: "Accessoires", icon: "🕶️", recos: FEATURED_RECOS },
  { id: "voyage", name: "Voyage", icon: "🧳", recos: FEATURED_RECOS },
  { id: "musique", name: "Musique", icon: "🎵", recos: FEATURED_RECOS },
  { id: "livre", name: "Livre", icon: "📖", recos: FEATURED_RECOS },
  { id: "bio", name: "Produits bio", icon: "🌿", recos: FEATURED_RECOS },
  { id: "services", name: "Services", icon: "⚙️", recos: FEATURED_RECOS },
];

const euro = (n: number) => n.toFixed(2).replace(".", ",") + " €";

// Recherche sans tenir compte des accents ni des majuscules
const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

type CartLine = { product: Product; qty: number };
type Cart = Record<string, CartLine>;
const CART_KEY = "king-cart";

// ---------- Composant ----------
export default function CategoriesPage() {
  const [activeId, setActiveId] = useState("vedette");
  const [promoOpen, setPromoOpen] = useState(true);
  const [showAllReco, setShowAllReco] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Cart>({});
  const [loaded, setLoaded] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);

  // Charge les produits publiés depuis la page admin (et recharge quand on revient sur la page)
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

  // Le panier est gardé en mémoire dans le téléphone (il reste si on change de page)
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

  const lines = Object.values(cart);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.product.price, 0);

  const addToCart = (product: Product) =>
    setCart((c) => ({ ...c, [product.id]: { product, qty: (c[product.id]?.qty ?? 0) + 1 } }));
  const changeQty = (name: string, delta: number) =>
    setCart((c) => {
      const line = c[name];
      if (!line) return c;
      const qty = line.qty + delta;
      if (qty <= 0) {
        const { [name]: _removed, ...rest } = c;
        return rest;
      }
      return { ...c, [name]: { ...line, qty } };
    });
  const removeLine = (name: string) =>
    setCart((c) => {
      const { [name]: _removed, ...rest } = c;
      return rest;
    });

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];

  // Produits en promotion = produits publiés dont le prix est inférieur à l'ancien prix.
  // "En vedette" et "Offres spéciales" montrent toutes les promotions, les autres seulement leur catégorie.
  const isOffers = active.id === "vedette" || active.id === "offres";
  const promoProducts = catalog.filter((p) => p.old > p.price && (isOffers || p.category === active.id));

  // Recherche
  const q = norm(query);
  const searching = searchOpen && q.length > 0;
  const productResults = searching ? catalog.filter((p) => norm(p.name).includes(q)) : [];
  const categoryResults = searching ? CATEGORIES.filter((c) => c.id !== "vedette" && norm(c.name).includes(q)) : [];

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };
  const chooseCategory = (id: string) => {
    setActiveId(id);
    setQuery("");
    setShowAllReco(false);
  };

  const renderCard = (p: Product) => {
    const onSale = p.old > p.price;
    const pct = onSale ? Math.round((1 - p.price / p.old) * 100) : 0;
    const inCart = cart[p.id]?.qty ?? 0;
    return (
      <article key={p.id} style={s.card}>
        <div style={s.imgWrap}>
          {onSale && <span style={s.promo}>-{pct}%</span>}
          <img src={photo(p)} alt={p.name} loading="lazy" style={s.img} />
        </div>
        <div style={s.prodName}>{p.name}</div>
        <div style={s.price}>{euro(p.price)}</div>
        <div style={s.oldPrice}>{onSale ? euro(p.old) : "\u00a0"}</div>
        <button style={s.addBtn} onClick={() => addToCart(p)}>
          <CartIcon size={18} color="#fff" />
          {inCart > 0 ? `Ajouté (${inCart})` : "Ajouter"}
        </button>
      </article>
    );
  };

  return (
    <div style={s.page}>
      {/* EN-TÊTE */}
      <header style={s.header}>
        <div style={s.logo}>
          <span style={{ color: "#111" }}>KING </span>
          <span style={{ color: ORANGE }}>SHOPPING</span>
        </div>
        <div style={s.headerIcons}>
          <button style={s.iconBtn} aria-label="Rechercher" onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={searchOpen ? ORANGE : "#444"} strokeWidth="2.6" strokeLinecap="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" />
            </svg>
          </button>
          <button style={{ ...s.iconBtn, position: "relative" }} aria-label="Ouvrir le panier" onClick={() => setCartOpen(true)}>
            <CartIcon size={32} color="#333" />
            {count > 0 && <span style={s.badge}>{count}</span>}
          </button>
        </div>
      </header>

      {/* BARRE DE RECHERCHE */}
      {searchOpen && (
        <div style={s.searchBar}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit ou une catégorie"
            style={s.searchInput}
          />
          {query && (
            <button style={s.clearBtn} onClick={() => setQuery("")} aria-label="Effacer">
              ×
            </button>
          )}
          <button style={s.cancelBtn} onClick={closeSearch}>
            Annuler
          </button>
        </div>
      )}

      <div style={s.body}>
        {/* GAUCHE : liste des catégories */}
        <nav style={s.sidebar}>
          <div style={s.pourVous}>
            <span style={{ fontSize: 14 }}>☆</span> Pour vous
          </div>
          {CATEGORIES.map((c) => {
            const on = c.id === activeId && !searching;
            return (
              <button key={c.id} onClick={() => chooseCategory(c.id)} style={{ ...s.sideItem, ...(on ? s.sideItemOn : {}) }}>
                <span style={{ ...s.sideIcon, filter: on ? "brightness(0) invert(1)" : "grayscale(1) brightness(0.2)" }}>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </nav>

        {/* DROITE */}
        <main style={s.content}>
          {searching ? (
            <>
              <h2 style={{ ...s.h2, marginBottom: 12 }}>
                Résultats pour « {query.trim()} »
              </h2>

              {categoryResults.length > 0 && (
                <div style={s.chips}>
                  {categoryResults.map((c) => (
                    <button key={c.id} style={s.chip} onClick={() => chooseCategory(c.id)}>
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              )}

              {productResults.length > 0 ? (
                <div style={s.prodGrid}>{productResults.map(renderCard)}</div>
              ) : (
                categoryResults.length === 0 && (
                  <p style={s.empty}>Aucun résultat. Essaie un autre mot (ex : « sac », « montre », « téléphone »).</p>
                )
              )}
            </>
          ) : (
            <>
              <div style={s.rowTitle}>
                <h2 style={s.h2}>Recommandations</h2>
                <button style={s.linkBtn} onClick={() => setShowAllReco(!showAllReco)}>
                  {showAllReco ? "Voir moins ‹" : "Voir tout ›"}
                </button>
              </div>

              <div style={s.recoGrid}>
                {showAllReco
                  ? CATEGORIES.filter((c) => c.id !== "vedette").map((c) => (
                      <button key={c.id} style={s.reco} onClick={() => chooseCategory(c.id)}>
                        <span style={s.recoCircle}>
                          <span style={{ fontSize: 30, filter: "brightness(0) invert(1)" }}>{c.icon}</span>
                        </span>
                        <span style={s.recoLabel}>{c.name}</span>
                      </button>
                    ))
                  : active.recos.map((r) => (
                      <button key={r.name} style={s.reco} onClick={() => { setSearchOpen(true); setQuery(r.name); }}>
                        <span style={s.recoCircle}>
                          <span style={{ fontSize: 30, filter: "brightness(0) invert(1)" }}>{r.icon}</span>
                        </span>
                        <span style={s.recoLabel}>{r.name}</span>
                      </button>
                    ))}
              </div>

              <div style={{ ...s.rowTitle, marginTop: 22 }}>
                <h2 style={s.h2}>Produits en promotion</h2>
                <button style={s.chevron} onClick={() => setPromoOpen(!promoOpen)} aria-label="Afficher ou masquer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: promoOpen ? "none" : "rotate(-90deg)" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {promoOpen &&
                (promoProducts.length > 0 ? (
                  <div style={s.prodGrid}>{promoProducts.map(renderCard)}</div>
                ) : (
                  <p style={s.empty}>Aucun produit en promotion pour le moment.</p>
                ))}
            </>
          )}
        </main>
      </div>

      {/* PANIER */}
      {cartOpen && (
        <div style={s.sheet}>
          <div style={s.sheetHeader}>
            <button style={s.backBtn} onClick={() => setCartOpen(false)} aria-label="Fermer le panier">
              ‹
            </button>
            <h2 style={{ ...s.h2, flex: 1 }}>Mon panier ({count})</h2>
            {lines.length > 0 && (
              <button style={s.linkBtn} onClick={() => setCart({})}>
                Vider
              </button>
            )}
          </div>

          <div style={s.sheetBody}>
            {lines.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: 60 }}>
                <CartIcon size={64} color="#ccc" />
                <p style={{ ...s.empty, marginTop: 12 }}>Ton panier est vide.</p>
                <button style={{ ...s.addBtn, width: "auto", padding: "10px 22px", margin: "0 auto" }} onClick={() => setCartOpen(false)}>
                  Continuer mes achats
                </button>
              </div>
            ) : (
              lines.map(({ product, qty }) => (
                <div key={product.id} style={s.line}>
                  <img src={photo(product)} alt={product.name} style={s.lineImg} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: ORANGE, marginTop: 2 }}>{euro(product.price)}</div>
                    <div style={s.qtyRow}>
                      <button style={s.qtyBtn} onClick={() => changeQty(product.id, -1)} aria-label="Moins">−</button>
                      <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{qty}</span>
                      <button style={s.qtyBtn} onClick={() => changeQty(product.id, 1)} aria-label="Plus">+</button>
                      <button style={{ ...s.linkBtn, marginLeft: "auto" }} onClick={() => removeLine(product.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {lines.length > 0 && (
            <div style={s.sheetFooter}>
              <div style={s.totalRow}>
                <span>Total</span>
                <strong style={{ fontSize: 20 }}>{euro(total)}</strong>
              </div>
              <button style={s.checkoutBtn} onClick={() => (window.location.href = CHECKOUT_URL)}>
                Passer la commande
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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

// ---------- Styles ----------
const s: Record<string, React.CSSProperties> = {
  page: { height: "100dvh", display: "flex", flexDirection: "column", background: "#fff", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", color: "#111", position: "relative" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 2 },
  logo: { fontSize: 32, fontWeight: 900, letterSpacing: -1, lineHeight: 1 },
  headerIcons: { display: "flex", alignItems: "center", gap: 18 },
  iconBtn: { background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" },
  badge: { position: "absolute", top: -8, right: -10, minWidth: 20, height: 20, borderRadius: 10, background: ORANGE, color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" },

  searchBar: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fff", borderBottom: "1px solid #eee" },
  searchInput: { flex: 1, border: `2px solid ${ORANGE}`, borderRadius: 22, padding: "9px 16px", fontSize: 15, outline: "none", fontFamily: "inherit" },
  clearBtn: { background: "#ddd", border: "none", borderRadius: "50%", width: 24, height: 24, fontSize: 16, lineHeight: 1, cursor: "pointer", marginLeft: -40 },
  cancelBtn: { background: "none", border: "none", color: ORANGE, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },

  body: { flex: 1, display: "flex", minHeight: 0 },
  sidebar: { width: "38%", maxWidth: 200, overflowY: "auto", background: "#f1f1f1", padding: "14px 8px 24px 12px", display: "flex", flexDirection: "column", gap: 2 },
  pourVous: { display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", fontSize: 13, color: "#667" },
  sideItem: { display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, textAlign: "left", color: "#111", borderRadius: 18, fontFamily: "inherit" },
  sideItemOn: { background: ORANGE, color: "#fff", fontWeight: 600, padding: "10px 12px" },
  sideIcon: { fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 },

  content: { flex: 1, overflowY: "auto", padding: "16px 14px 30px", background: "#fff" },
  rowTitle: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  h2: { fontSize: 18, fontWeight: 700, margin: 0 },
  recoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  reco: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" },
  recoCircle: { width: 64, height: 64, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" },
  recoLabel: { fontSize: 12, fontWeight: 500, color: "#111", textAlign: "center" },
  chevron: { width: 28, height: 28, borderRadius: "50%", background: ORANGE, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: { background: "#fff3ea", color: ORANGE, border: `1px solid ${ORANGE}`, borderRadius: 16, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  empty: { color: "#777", fontSize: 14, textAlign: "center" },

  prodGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 },
  card: { background: "#fff", borderRadius: 10, padding: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", alignItems: "center" },
  imgWrap: { position: "relative", width: "100%", aspectRatio: "1 / 1", background: "#f2f2f2", borderRadius: 8, overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  promo: { position: "absolute", top: 0, left: 0, background: ORANGE, color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: "8px 0 8px 0", zIndex: 1 },
  prodName: { fontSize: 12, marginTop: 10, textAlign: "center" },
  price: { fontSize: 17, fontWeight: 800, marginTop: 4 },
  oldPrice: { fontSize: 11, color: "#777", textDecoration: "line-through", marginBottom: 8 },
  addBtn: { width: "100%", background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" },

  sheet: { position: "fixed", inset: 0, background: "#fff", zIndex: 10, display: "flex", flexDirection: "column" },
  sheetHeader: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  backBtn: { background: "none", border: "none", fontSize: 34, lineHeight: 1, cursor: "pointer", color: "#333", padding: "0 6px" },
  linkBtn: { background: "none", border: "none", color: ORANGE, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  sheetBody: { flex: 1, overflowY: "auto", padding: 16 },
  line: { display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #eee" },
  lineImg: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, background: "#f2f2f2", flexShrink: 0 },
  qtyRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${ORANGE}`, background: "#fff", color: ORANGE, fontSize: 18, lineHeight: 1, cursor: "pointer", fontWeight: 700 },
  sheetFooter: { padding: 16, boxShadow: "0 -2px 8px rgba(0,0,0,0.08)" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, fontSize: 16 },
  checkoutBtn: { width: "100%", background: ORANGE, color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" },
};