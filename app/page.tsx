"use client";
// ####################################################################
//  KING SHIPPING : TOUT LE CODE DE L'APPLICATION DANS UN SEUL FICHIER
//  "use client" (ligne 1) dit à Next.js que cette page tourne dans le
//  navigateur (boutons, panier, saisie). Descends dans le fichier :
//
//   1. LANGUES ........................ cherche  LANGUES
//   2. PAGE RACINE .................... cherche  PAGE RACINE
//   3. PAGE 1  Welcome ................ cherche  PAGE 1
//   4. PAGE 2  Log In ................. cherche  PAGE 2
//   5. PAGE 3  Create Account ......... cherche  PAGE 3
//   6. PAGE 4  Vidéos ................. cherche  PAGE 4
//   7. CONFIGURATION (contacts, produits, publicités) .. cherche  CONFIGURATION
//   8. BOUTIQUE (Home, Category, Cart, Message, Account, Settings) .. cherche  PAGE :
//   9. STYLES (couleurs, tailles) ..... cherche  STYLES
//  (Ctrl+F dans VS Code pour aller à une section)
// ####################################################################
import { useState, useEffect, useRef, ChangeEvent } from "react";

type Screen = "welcome" | "login" | "signup" | "intro" | "home";
type User = {
  nom: string; postnom: string; prenom: string;
  email: string; phone: string; country: string;
  password: string; photo: string;
};

const COUNTRIES = [
  "Kenya", "DR Congo", "Tanzania", "Uganda", "Rwanda", "Burundi", "Ethiopia",
  "Nigeria", "Ghana", "South Africa", "Egypt", "Morocco", "Senegal",
  "Côte d'Ivoire", "Cameroon", "France", "Belgium", "Canada",
  "United States", "United Kingdom", "UAE", "China", "India",
];

// ==================================================================
// LANGUES : 65 langues, traduites à la demande
// ==================================================================
// ---- Languages : l'interface est écrite en anglais, puis traduite à la demande (65 langues) ----
type Lang = [string, string, string, boolean?]; // code, nom natif, nom anglais, droite-à-gauche
const LANGS: Lang[] = [
  ["en", "English", "English"], ["fr", "Français", "French"], ["es", "Español", "Spanish"],
  ["pt", "Português", "Portuguese"], ["de", "Deutsch", "German"], ["it", "Italiano", "Italian"],
  ["nl", "Nederlands", "Dutch"], ["ru", "Русский", "Russian"], ["uk", "Українська", "Ukrainian"],
  ["pl", "Polski", "Polish"], ["cs", "Čeština", "Czech"], ["sk", "Slovenčina", "Slovak"],
  ["ro", "Română", "Romanian"], ["el", "Ελληνικά", "Greek"], ["bg", "Български", "Bulgarian"],
  ["sr", "Srpski", "Serbian"], ["hr", "Hrvatski", "Croatian"], ["hu", "Magyar", "Hungarian"],
  ["sv", "Svenska", "Swedish"], ["no", "Norsk", "Norwegian"], ["da", "Dansk", "Danish"],
  ["fi", "Suomi", "Finnish"], ["ca", "Català", "Catalan"], ["tr", "Türkçe", "Turkish"],
  ["ar", "العربية", "Arabic", true], ["he", "עברית", "Hebrew", true], ["fa", "فارسی", "Persian", true],
  ["ur", "اردو", "Urdu", true], ["hi", "हिन्दी", "Hindi"], ["bn", "বাংলা", "Bengali"],
  ["pa", "ਪੰਜਾਬੀ", "Punjabi"], ["ta", "தமிழ்", "Tamil"], ["te", "తెలుగు", "Telugu"],
  ["mr", "मराठी", "Marathi"], ["gu", "ગુજરાતી", "Gujarati"], ["ne", "नेपाली", "Nepali"],
  ["si", "සිංහල", "Sinhala"], ["th", "ไทย", "Thai"], ["vi", "Tiếng Việt", "Vietnamese"],
  ["id", "Bahasa Indonesia", "Indonesian"], ["ms", "Bahasa Melayu", "Malay"], ["fil", "Filipino", "Filipino"],
  ["zh", "简体中文", "Chinese (Simplified)"], ["zh-TW", "繁體中文", "Chinese (Traditional)"],
  ["ja", "日本語", "Japanese"], ["ko", "한국어", "Korean"],
  ["sw", "Kiswahili", "Swahili"], ["ln", "Lingála", "Lingala"], ["kg", "Kikongo", "Kikongo"],
  ["lua", "Tshiluba", "Tshiluba"], ["rw", "Kinyarwanda", "Kinyarwanda"], ["rn", "Kirundi", "Kirundi"],
  ["lg", "Luganda", "Luganda"], ["am", "አማርኛ", "Amharic"], ["so", "Soomaali", "Somali"],
  ["ha", "Hausa", "Hausa"], ["yo", "Yorùbá", "Yoruba"], ["ig", "Igbo", "Igbo"],
  ["zu", "isiZulu", "Zulu"], ["xh", "isiXhosa", "Xhosa"], ["af", "Afrikaans", "Afrikaans"],
  ["sn", "chiShona", "Shona"], ["mg", "Malagasy", "Malagasy"], ["wo", "Wolof", "Wolof"],
  ["ht", "Kreyòl ayisyen", "Haitian Creole"],
];
let CUR_LANG = "en";
let DICT: Record<string, string> = {};
const PENDING = new Set<string>();
const FAILED = new Set<string>();
let ON_PENDING: (() => void) | null = null;

// t("English text") -> texte traduit dans la langue choisie (traduit à la demande, mis en cache)
function t(s: string, vars?: Record<string, string | number>): string {
  let out = s;
  if (CUR_LANG !== "en" && s.trim()) {
    const tr = DICT[s];
    if (tr) out = tr;
    else if (!PENDING.has(s) && !FAILED.has(s)) { PENDING.add(s); if (ON_PENDING) ON_PENDING(); }
  }
  if (vars) for (const k of Object.keys(vars)) out = out.split("{" + k + "}").join(String(vars[k]));
  return out;
}

const getUsers = (): User[] => {
  try { return JSON.parse(localStorage.getItem("ks_users") || "[]"); } catch { return []; }
};

// ==================================================================
// PAGE RACINE : choisit l'écran à afficher + gère la langue
// ==================================================================
export default function Page() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [current, setCurrent] = useState<User | null>(null);
  const [lang, setLang] = useState("en");
  const [, bump] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // traduit par paquets les textes affichés (via /api/translate)
  const flush = async () => {
    const code = CUR_LANG;
    if (code === "en") return;
    const batch = Array.from(PENDING).slice(0, 60);
    if (batch.length === 0) return;
    batch.forEach((b) => PENDING.delete(b));
    const meta = LANGS.find((l) => l[0] === code);
    try {
      const r = await fetch("/api/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: meta ? meta[2] : code, strings: batch }),
      });
      const d = await r.json();
      if (CUR_LANG !== code) return;
      if (r.ok && Array.isArray(d.translations) && d.translations.length === batch.length) {
        batch.forEach((str, i) => {
          const tr = d.translations[i];
          if (typeof tr === "string" && tr.trim()) DICT[str] = tr; else FAILED.add(str);
        });
        try { localStorage.setItem("ks_dict_" + code, JSON.stringify(DICT)); } catch {}
      } else batch.forEach((str) => FAILED.add(str));
    } catch { if (CUR_LANG === code) batch.forEach((str) => FAILED.add(str)); }
    bump((n) => n + 1);
    if (PENDING.size > 0 && CUR_LANG === code) timer.current = setTimeout(flush, 100);
  };
  const selectLang = (code: string) => {
    CUR_LANG = code; FAILED.clear(); PENDING.clear();
    try { DICT = code === "en" ? {} : JSON.parse(localStorage.getItem("ks_dict_" + code) || "{}"); } catch { DICT = {}; }
    try { localStorage.setItem("ks_lang", code); } catch {}
    setLang(code); bump((n) => n + 1);
  };
  useEffect(() => {
    ON_PENDING = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 300);
    };
    let saved = "en";
    try { saved = localStorage.getItem("ks_lang") || "en"; } catch {}
    if (saved !== "en") selectLang(saved);
    return () => { ON_PENDING = null; };
  }, []);

  // restore session
  useEffect(() => {
    const email = localStorage.getItem("ks_session");
    if (email) {
      const u = getUsers().find((x) => x.email === email);
      if (u) { setCurrent(u); setScreen("home"); }
    }
  }, []);

  const enter = (u: User) => {
    localStorage.setItem("ks_session", u.email);
    setCurrent(u); setScreen("intro");
  };
  const logout = () => {
    localStorage.removeItem("ks_session");
    setCurrent(null); setScreen("welcome");
  };

  return (
    <div className="root">
      <style>{css}</style>
      <div className="phone" dir={LANGS.some((l) => l[0] === lang && l[3]) ? "rtl" : "ltr"}>
        {screen === "welcome" && <Welcome go={setScreen} />}
        {screen === "login" && <Login go={setScreen} onOk={enter} />}
        {screen === "signup" && <Signup go={setScreen} onOk={enter} />}
        {screen === "intro" && <Intro onDone={() => setScreen("home")} />}
        {screen === "home" && current && <Shop user={current} onLogout={logout} lang={lang} onLang={selectLang} />}
      </div>
    </div>
  );
}

function Logo({ size = 70 }: { size?: number }) {
  return (
    <div className="logo" style={{ width: size, height: size, fontSize: size * 0.38 }}>KS</div>
  );
}

// ==================================================================
// PAGE 1 : WELCOME  (Sign Up / Log In)
// ==================================================================
function Welcome({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="welcome">
      <div className="top">
        <div className="mini"><Logo size={56} /><small>KING SHIPPING</small></div>
        <button className="ghost" onClick={() => go("login")}>{t("Log In")}</button>
      </div>
      <div className="center">
        <button className="outline" onClick={() => go("signup")}>{t("Sign Up")}</button>
        <p className="small">{t("Create your account")}</p>
      </div>
      <div className="bottom">
        <p>{t("Do your shopping with security and guarantee on King Shipping application")}</p>
        <h3>{t("WELCOME TO APP")}</h3>
      </div>
    </div>
  );
}

// ==================================================================
// PIÈCES : boutons Gmail / iCloud / Google et champ mot de passe
// ==================================================================
function Social({ onClick }: { onClick: (p: string) => void }) {
  return (
    <>
      <p className="or">{t("or continue with")}</p>
      <div className="social">
        <button onClick={() => onClick("Gmail")}>Gmail</button>
        <button onClick={() => onClick("iCloud")}>iCloud</button>
        <button onClick={() => onClick("Google")}>Google</button>
      </div>
    </>
  );
}

function Password({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field pw">
      <input type={show ? "text" : "password"} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="eye" onClick={() => setShow(!show)}><Icon n={show ? "eyeoff" : "eye"} size={20} /></button>
    </div>
  );
}

// ==================================================================
// PAGE 2 : LOG IN
// ==================================================================
function Login({ go, onOk }: { go: (s: Screen) => void; onOk: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!email.trim() && !phone.trim()) return setError(t("Enter your email or phone number."));
    if (!password) return setError(t("Enter your password."));
    const u = getUsers().find(
      (x) => (email.trim() && x.email.toLowerCase() === email.trim().toLowerCase()) ||
             (phone.trim() && x.phone.replace(/\s/g, "") === phone.replace(/\s/g, ""))
    );
    if (!u) return setError(t("No account found. Please Sign Up."));
    if (u.password !== password) return setError(t("Wrong password."));
    onOk(u);
  };

  const social = (p: string) => setError(t("{p} sign-in will be available soon.", { p }));

  return (
    <div className="page">
      <button className="back" onClick={() => go("welcome")}>‹</button>
      <div className="frame">
        <div className="center-col"><Logo /><small className="brand">KING SHIPPING</small></div>
        <h1>{t("Log In")}</h1>

        <label className="tag">{t("Email")}</label>
        <div className="field"><span className="fic"><Icon n="mail" size={18} /></span>
          <input type="email" placeholder={t("Enter your email")} value={email} onChange={(e) => setEmail(e.target.value)} /></div>

        <label className="tag">{t("Phone Number")}</label>
        <div className="field"><span className="fic"><Icon n="phone" size={18} /></span>
          <input type="tel" placeholder={t("Enter your phone number")} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>

        <label className="tag">{t("Password")}</label>
        <Password value={password} onChange={setPassword} placeholder={t("Enter your password")} />

        {error && <p className="error">{error}</p>}
        <Social onClick={social} />
        <button className="primary" onClick={submit}>{t("Log In")}</button>
        <p className="foot">{t("Don't have an account?")}<br />
          <a onClick={() => go("signup")}>{t("Sign Up")}</a></p>
      </div>
    </div>
  );
}

// ==================================================================
// PAGE 3 : CREATE ACCOUNT
// ==================================================================
function Signup({ go, onOk }: { go: (s: Screen) => void; onOk: (u: User) => void }) {
  const [f, setF] = useState({
    nom: "", postnom: "", prenom: "", email: "", phone: "",
    country: "", password: "", confirm: "", photo: "",
  });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const pickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError(t("Please choose an image file."));
    const r = new FileReader();
    r.onload = () => set("photo", String(r.result));
    r.readAsDataURL(file);
  };

  const submit = () => {
    setError("");
    if (!f.nom.trim() || !f.postnom.trim() || !f.prenom.trim()) return setError(t("Enter your last name, middle name and first name."));
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError(t("Enter a valid email."));
    if (f.phone.replace(/\D/g, "").length < 7) return setError(t("Enter a valid phone number."));
    if (!f.country) return setError(t("Select your country."));
    if (f.password.length < 6) return setError(t("Password must have at least 6 characters."));
    if (f.password !== f.confirm) return setError(t("Passwords do not match."));
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === f.email.toLowerCase()))
      return setError(t("This email already has an account. Please Log In."));
    const u: User = {
      nom: f.nom.trim(), postnom: f.postnom.trim(), prenom: f.prenom.trim(),
      email: f.email.trim(), phone: f.phone.trim(), country: f.country,
      password: f.password, photo: f.photo,
    };
    try {
      localStorage.setItem("ks_users", JSON.stringify([...users, u]));
    } catch {
      return setError(t("Photo too big. Choose a smaller photo."));
    }
    onOk(u);
  };

  const social = (p: string) => setError(t("{p} sign-up will be available soon.", { p }));

  return (
    <div className="page signup">
      <button className="back" onClick={() => go("welcome")}>‹</button>
      <div className="center-col"><Logo size={60} /><small className="brand">KING SHIPPING</small></div>
      <h1 className="yellow">{t("Create Account")}</h1>

      <label className="photo">
        {f.photo ? <img src={f.photo} alt="profile" /> : <span><Icon n="account" size={38} /></span>}
        <em>{f.photo ? t("Change photo") : t("Add profile photo")}</em>
        <input type="file" accept="image/*" hidden onChange={pickPhoto} />
      </label>
      {f.photo && <button className="link" onClick={() => set("photo", "")}>{t("Remove photo")}</button>}

      <label>{t("Last name")}</label>
      <input className="box" placeholder={t("Enter your last name")} value={f.nom} onChange={(e) => set("nom", e.target.value)} />
      <label>{t("Middle name")}</label>
      <input className="box" placeholder={t("Enter your middle name")} value={f.postnom} onChange={(e) => set("postnom", e.target.value)} />
      <label>{t("First name")}</label>
      <input className="box" placeholder={t("Enter your first name")} value={f.prenom} onChange={(e) => set("prenom", e.target.value)} />
      <label>{t("Email")}</label>
      <input className="box" type="email" placeholder={t("Enter your email")} value={f.email} onChange={(e) => set("email", e.target.value)} />
      <label>{t("Phone Number")}</label>
      <input className="box" type="tel" placeholder="+1 555 000 0000" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
      <label>{t("Select Country")}</label>
      <select className="box" value={f.country} onChange={(e) => set("country", e.target.value)}>
        <option value="">{t("Select Country")}</option>
        {COUNTRIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}
      </select>
      <label>{t("Password")}</label>
      <Password value={f.password} onChange={(v) => set("password", v)} placeholder={t("Password")} />
      <label>{t("Confirm Password")}</label>
      <Password value={f.confirm} onChange={(v) => set("confirm", v)} placeholder={t("Confirm password")} />

      {error && <p className="error">{error}</p>}
      <Social onClick={social} />
      <button className="primary" onClick={submit}>{t("Create Account")}</button>
      <p className="foot">{t("Already have an account?")}<a onClick={() => go("login")}>{t("Log in")}</a></p>
    </div>
  );
}

// ==================================================================
// PAGE 4 : LES 2 VIDÉOS OBLIGATOIRES (compte à rebours 45 s)
// ==================================================================
// Le propriétaire ajoute lui-même les 2 vidéos dans /public/videos/
//   -> public/videos/exclusive.mp4  et  public/videos/security.mp4
// Tant qu'elles n'existent pas, un compte à rebours de 45 s s'affiche.
const INTRO_VIDEOS = [
  { src: "/videos/exclusive.mp4", title: "Exclusive", text: "King Shipping, an exclusive shopping experience.", seconds: 45 },
  { src: "/videos/security.mp4", title: "Security", text: "Shop and protect your money with security.", seconds: 45 },
];

function Intro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState(false);
  const v = INTRO_VIDEOS[i];
  const [left, setLeft] = useState(v.seconds);

  useEffect(() => { setLeft(v.seconds); setFailed(false); }, [i]);
  useEffect(() => {
    const iv = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [i]);

  const last = i === INTRO_VIDEOS.length - 1;
  const next = () => (last ? onDone() : setI(i + 1));

  return (
    <div className="page center-col intro">
      <small className="brand">{t("VIDEO")} {i + 1} / {INTRO_VIDEOS.length}</small>
      <div className="vbox">
        {!failed ? (
          <video key={v.src} src={v.src} autoPlay muted playsInline controls={false}
            onLoadedMetadata={(e) => setLeft(Math.ceil(e.currentTarget.duration) || v.seconds)}
            onError={() => setFailed(true)}
            onEnded={() => setLeft(0)} />
        ) : (
          <div className="slide">
            <div className="count">{left}</div>
            <p className="owner">{t("The owner will add this video himself.")}</p>
          </div>
        )}
      </div>
      <h1 className="white">{t(v.title)}</h1>
      <p className="small">{t(v.text)}</p>
      <div className="bar"><div style={{ width: `${((v.seconds - left) / v.seconds) * 100}%` }} /></div>
      {/* Pas de bouton "Skip" : obligatoire */}
      <button className="primary" disabled={left > 0} style={{ opacity: left > 0 ? 0.4 : 1 }} onClick={next}>
        {left > 0 ? t("Please watch… {n}s", { n: left }) : last ? t("Start shopping") : t("Next video")}
      </button>
    </div>
  );
}

// ==================================================================
// BOUTIQUE : CONFIGURATION  (tes contacts ADMIN, tes produits PRODUCTS, tes publicités ADS)
// ==================================================================
type Product = {
  id: string; name: string; price: number; currency: string; category: string;
  images: string[];          // MINIMUM 5 photos obligatoires
  video?: string; promo?: boolean; oldPrice?: number;
  description?: string;      // quelques mots sur le produit
};
type Ad = { image?: string; video?: string; link?: string };
type OrderMsg = { id: string; date: number; channel: "WhatsApp" | "Email"; kind: "message" | "order" | "payment"; text: string };

// >>> TES COORDONNÉES : les clients te contactent ici
const ADMIN = {
  whatsapp: "254182349840",        // numéro WhatsApp avec indicatif pays (254 = Kenya), sans + ni espaces
  email: "nakategejeune@icloud.com", // ton email
};
const VERSION = "1.0.0";
const MIN_PHOTOS = 5;

// >>> PAIEMENTS : devise d'Airtel Money dans ton pays (KES, CDF, UGX, TZS, RWF, ZMW…)
const AIRTEL_CURRENCY = "KES";
type PayMethod = {
  id: string; name: string; short: string; color: string; available: boolean; currency: string;
  account?: string; accountLabel?: string; needsPhone?: boolean;
};
// available:false = "Not available yet" (grisé). Mets true quand le moyen de paiement est prêt.
const PAY_METHODS: PayMethod[] = [
  { id: "paypal", name: "PayPal", short: "PP", color: "#3d63a8", available: true, currency: "USD",
    account: "nartelly@icloud.com", accountLabel: "PayPal email" },
  { id: "mpesa", name: "M-Pesa", short: "M", color: "#3f8f6b", available: true, currency: "KES",
    account: "0182349840", accountLabel: "M-Pesa number", needsPhone: true },
  { id: "airtel", name: "Airtel Money", short: "A", color: "#a8433f", available: true, currency: AIRTEL_CURRENCY,
    account: "0964321659", accountLabel: "Airtel Money number", needsPhone: true },
  { id: "card", name: "Bank card", short: "CC", color: "#6b5ca5", available: false, currency: "USD" },
  { id: "wave", name: "Wave", short: "W", color: "#2f7f94", available: false, currency: "XOF" },
  { id: "orange", name: "Orange Money", short: "O", color: "#c9742a", available: false, currency: "XOF" },
];

// >>> Tes produits (vide pour l'instant). Chaque produit = 5 photos minimum.
// { id: "1", name: "Perfume", description: "Long lasting, 100ml", price: 25, currency: "USD", category: "Cosmetics", promo: true, oldPrice: 35,
//   images: ["/products/1/1.jpg","/products/1/2.jpg","/products/1/3.jpg","/products/1/4.jpg","/products/1/5.jpg"] }
const PRODUCTS: Product[] = [];
// >>> Tes publicités (images ou vidéos) : { image: "/ads/pub1.jpg" } ou { video: "/ads/pub1.mp4" }
const ADS: Ad[] = [];

const VALID = PRODUCTS.filter((p) => {
  const ok = p.images.length >= MIN_PHOTOS;
  if (!ok) console.warn(`Produit "${p.name}" ignoré : il faut au moins ${MIN_PHOTOS} photos.`);
  return ok;
});

const CATEGORIES = [
  "All", "Cosmetics", "Electronics", "Mechanics", "Phones", "Computers", "Fashion", "Shoes", "Bags",
  "Jewelry", "Watches", "Perfumes", "Beauty", "Home & Kitchen", "Furniture", "Baby", "Toys", "Sports",
  "Health", "Auto Parts", "Tools", "Garden", "Books", "Office", "Pets", "Food", "Gaming", "Cameras",
  "Audio", "Lighting", "Building", "Agriculture",
];

// 35 monnaies (le dollar USD est la monnaie principale)
const WORLD: [string, string, string][] = [
  ["🇺🇸", "USD", "US Dollar"], ["🇪🇺", "EUR", "Euro"], ["🇬🇧", "GBP", "Pound"], ["🇰🇪", "KES", "Kenya"],
  ["🇨🇩", "CDF", "DR Congo"], ["🇹🇿", "TZS", "Tanzania"], ["🇺🇬", "UGX", "Uganda"], ["🇷🇼", "RWF", "Rwanda"],
  ["🇧🇮", "BIF", "Burundi"], ["🇪🇹", "ETB", "Ethiopia"], ["🇳🇬", "NGN", "Nigeria"], ["🇬🇭", "GHS", "Ghana"],
  ["🇿🇦", "ZAR", "South Africa"], ["🇪🇬", "EGP", "Egypt"], ["🇲🇦", "MAD", "Morocco"], ["🇸🇳", "XOF", "Senegal"],
  ["🇨🇲", "XAF", "Cameroon"], ["🇨🇦", "CAD", "Canada"], ["🇦🇺", "AUD", "Australia"], ["🇦🇪", "AED", "UAE"],
  ["🇸🇦", "SAR", "Saudi Arabia"], ["🇹🇷", "TRY", "Turkey"], ["🇨🇳", "CNY", "China"], ["🇯🇵", "JPY", "Japan"],
  ["🇰🇷", "KRW", "South Korea"], ["🇮🇳", "INR", "India"], ["🇵🇰", "PKR", "Pakistan"], ["🇧🇩", "BDT", "Bangladesh"],
  ["🇮🇩", "IDR", "Indonesia"], ["🇲🇾", "MYR", "Malaysia"], ["🇸🇬", "SGD", "Singapore"], ["🇧🇷", "BRL", "Brazil"],
  ["🇲🇽", "MXN", "Mexico"], ["🇨🇭", "CHF", "Switzerland"], ["🇷🇺", "RUB", "Russia"],
];

type Tab = "home" | "categories" | "cart" | "messages" | "account" | "settings";

const ICONS: Record<string, string> = {
  home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  categories: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  cart: "M6 6h15l-2 9H8zM6 6L5 3H2M9 20h.01M18 20h.01",
  messages: "M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z",
  account: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  mail: "M3 5h18v14H3zM3 5l9 8 9-8",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeoff: "M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22",
  card: "M2 5h20v14H2zM2 10h20",
  spark: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18",
};
function Icon({ n, size = 22 }: { n: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[n]} /></svg>
  );
}
const Stars = () => <span className="stars">★★★★★</span>;
const waLink = (text: string) => `https://wa.me/${ADMIN.whatsapp}?text=${encodeURIComponent(text)}`;
const mailLink = (subject: string, body: string) =>
  `mailto:${ADMIN.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
// ==================================================================
// BOUTIQUE : toutes les pages après les vidéos (Home, Category, Cart, Message, Account, Settings)
// + assistant IA, appel, paiement, langues
// ==================================================================
function Shop({ user, onLogout, lang, onLang }: { user: User; onLogout: () => void; lang: string; onLang: (c: string) => void }) {
  const [tab, setTab] = useState<Tab>("home");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(WORLD[0]);
  const [curOpen, setCurOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [adI, setAdI] = useState(0);
  const [msgTab, setMsgTab] = useState("Messages");
  const [notif, setNotif] = useState(true);
  const [msgAlerts, setMsgAlerts] = useState(true);
  const [text, setText] = useState("");
  const [detail, setDetail] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  // ---- Historique de nos messages / commandes (gardé sur le téléphone) ----
  const ordersKey = "ks_orders_" + user.email;
  const [orders, setOrders] = useState<OrderMsg[]>([]);
  useEffect(() => {
    try { setOrders(JSON.parse(localStorage.getItem(ordersKey) || "[]")); } catch {}
  }, [ordersKey]);
  const logMsg = (channel: OrderMsg["channel"], kind: OrderMsg["kind"], text: string) => {
    const entry: OrderMsg = { id: String(Date.now()), date: Date.now(), channel, kind, text };
    setOrders((o) => {
      const n = [entry, ...o].slice(0, 100);
      try { localStorage.setItem(ordersKey, JSON.stringify(n)); } catch {}
      return n;
    });
  };
  const [langQ, setLangQ] = useState("");
  const [callOpen, setCallOpen] = useState(false);

  // ---- Assistant IA (bouton flottant sur toutes les pages) ----
  type AiMsg = { role: "user" | "assistant"; content: string };
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsgs, setAiMsgs] = useState<AiMsg[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMsgs, aiLoading, aiOpen]);

  const askAI = async (txt: string) => {
    const q2 = txt.trim();
    if (!q2 || aiLoading) return;
    const next: AiMsg[] = [...aiMsgs, { role: "user", content: q2 }];
    setAiMsgs(next); setAiInput(""); setAiLoading(true);
    let answer = t("Sorry, I could not answer. Please try again.");
    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next, currency: cur[1], country: user.country,
          catalogue: VALID.slice(0, 200).map((p) => ({
            name: p.name, price: p.price, currency: p.currency, category: p.category, description: p.description || "",
          })),
        }),
      });
      const d = await r.json();
      if (r.ok && d.text) answer = d.text;
      else if (d.error === "missing_key") answer = t("The assistant is not connected yet. The owner must add the API key.");
    } catch { answer = t("No connection. Please check your internet and try again."); }
    setAiMsgs([...next, { role: "assistant", content: answer }]);
    setAiLoading(false);
  };

  useEffect(() => {
    if (ADS.length < 2) return;
    const iv = setInterval(() => setAdI((i) => (i + 1) % ADS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  const count = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);
  const add = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    setToast(t("Added to cart ✓")); setTimeout(() => setToast(""), 1600);
  };
  const sub = (id: string) =>
    setCart((c) => { const n = { ...c }; n[id] = (n[id] || 0) - 1; if (n[id] <= 0) delete n[id]; return n; });
  const cartItems = VALID.filter((p) => cart[p.id]);
  const totals: Record<string, number> = {};
  cartItems.forEach((p) => { totals[p.currency] = (totals[p.currency] || 0) + p.price * cart[p.id]; });
  const totalText = Object.entries(totals).map(([c, v]) => `${v} ${c}`).join(" + ");
  const cartText = `Hello, I want to order:\n${cartItems.map((p) => `- ${p.name} x${cart[p.id]} (${p.price} ${p.currency})`).join("\n")}\nTotal: ${totalText}\nName: ${user.prenom} ${user.nom}\nPhone: ${user.phone}`;

  const promos = VALID.filter((p) => p.promo);
  const recommended = VALID.filter((p) => !p.promo);
  const cartCats = cartItems.map((p) => p.category);
  const similar = VALID.filter((p) => !cart[p.id]).sort(
    (x, y) => Number(cartCats.includes(y.category)) - Number(cartCats.includes(x.category))
  );
  const list = VALID.filter((p) => cat === "All" || p.category === cat);
  const results = VALID.filter((p) =>
    (p.name + " " + p.category).toLowerCase().includes(q.trim().toLowerCase()));

  const grid = (items: Product[]) =>
    items.length === 0 ? (
      <div className="empty"><div className="ring"><Icon n="categories" size={26} /></div>
        <b>{t("No products yet")}</b><span>{t("Products will appear here soon.")}</span></div>
    ) : (
      <div className="pgrid">
        {items.map((p) => (
          <div className="pcard" key={p.id} onClick={() => setDetail(p)}>
            {p.promo && <em className="badge">{t("PROMO")}</em>}
            <img src={p.images[0]} alt={p.name} />
            <div className="pname">{p.name}</div>
            {p.description && <div className="pdesc">{p.description}</div>}
            <Stars />
            <div className="pprice">{p.price} {p.currency}
              {p.oldPrice ? <s>{p.oldPrice}</s> : null}</div>
            <button onClick={(e) => { e.stopPropagation(); add(p); }}>{t("Add to cart")}</button>
          </div>
        ))}
      </div>
    );

  const section = (title: string, items: Product[]) => (
    <div className="sect"><h3>{t(title)}</h3>{grid(items)}</div>
  );

  // ---- Paiements ----
  const [payId, setPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [payMsg, setPayMsg] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false); // caché au départ

  const copyText = (txt: string) => {
    try { navigator.clipboard.writeText(txt); setToast(t("Copied ✓")); setTimeout(() => setToast(""), 1500); } catch {}
  };
  const openPay = (id: string) => {
    const m = PAY_METHODS.find((x) => x.id === id);
    if (!m || !m.available) return;
    setPayId(id); setPayMsg("");
    setPayAmount(totals[m.currency] ? String(totals[m.currency]) : "");
    setPayPhone(m.needsPhone ? user.phone : "");
  };
  const payNow = async () => {
    const m = PAY_METHODS.find((x) => x.id === payId);
    if (!m) return;
    const amount = Number(payAmount);
    if (!(amount > 0)) return setPayMsg(t("Enter a valid amount."));
    if (m.needsPhone && payPhone.replace(/\D/g, "").length < 9) return setPayMsg(t("Enter a valid phone number."));
    setPayBusy(true); setPayMsg("");
    try {
      const r = await fetch(`/api/pay/${m.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", amount, currency: m.currency, phone: payPhone }),
      });
      const d = await r.json();
      if (d.approveUrl) { window.location.href = d.approveUrl; return; }
      if (r.ok) setPayMsg(d.message || "Request sent.");
      else if (d.error === "not_configured")
        setPayMsg(t("Automatic payment is not set up yet. Send the money to the account below, then send your proof on WhatsApp."));
      else setPayMsg(d.message || "Payment failed. Please try again.");
    } catch { setPayMsg(t("No connection. Please try again.")); }
    setPayBusy(false);
  };
  // retour de PayPal (?paypal=return&token=...)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const flag = sp.get("paypal");
    if (!flag) return;
    const orderId = sp.get("token");
    window.history.replaceState({}, "", window.location.pathname);
    setPayId("paypal");
    if (flag === "cancel") { setPayMsg(t("Payment cancelled.")); return; }
    if (flag === "return" && orderId) {
      setPayBusy(true); setPayMsg(t("Confirming your payment…"));
      fetch("/api/pay/paypal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "capture", orderId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.status === "COMPLETED") { setPayMsg(t("Payment received. Thank you!")); setCart({}); }
          else setPayMsg(t("Payment not completed. Please try again."));
        })
        .catch(() => setPayMsg(t("Could not confirm the payment.")))
        .finally(() => setPayBusy(false));
    }
  }, []);

  const payBox = (title: string) => (
    <div className="sect">
      <button className={"paytoggle" + (payOpen ? " open" : "")} onClick={() => setPayOpen(!payOpen)}>
        <span className="payico"><Icon n="card" size={18} /></span><b>{t(title)}</b><em>{payOpen ? t("Hide") : t("Show")}</em><u>▾</u>
      </button>
      {payOpen && <div className="paygrid">
        {PAY_METHODS.map((m) => (
          <button key={m.id} className={"paym" + (m.available ? "" : " off")} disabled={!m.available}
            onClick={() => openPay(m.id)}>
            <i style={{ background: m.color }}>{m.short}</i>
            <span><b>{m.name}</b><small>{m.available ? t("Pay now") : t("Not available yet")}</small></span>
          </button>
        ))}
      </div>}
    </div>
  );

  const adView = (a: Ad, k?: number) => {
    const inner = a.video ? (
      <video key={a.video} src={a.video} autoPlay muted loop playsInline controls />
    ) : (<img src={a.image} alt="ad" />);
    return a.link ? <a key={k} href={a.link} target="_blank" rel="noreferrer">{inner}</a> : <div key={k}>{inner}</div>;
  };

  const adsEmpty = (
    <div className="adempty"><b>{t("Advertisement")}</b><span>{t("Your ads and videos will appear here")}</span></div>
  );

  return (
    <div className="shop">
      {/* ================= BARRE DU HAUT (toutes les pages) ================= */}
      {/* ---- En-tête de TOUTES les pages : compte, monnaie, notification, panier, recherche ---- */}
      <div className="shead">
        <div className="toprow">
          <button className="me" onClick={() => setTab("account")}>
            {user.photo ? <img src={user.photo} alt="" /> : <span><Icon n="account" size={18} /></span>}
            <b>{user.prenom}</b>
          </button>
          <div className="grow" />
          <button className="cur" onClick={() => { setCurOpen(!curOpen); setNotifOpen(false); }}>
            {cur[0]} {cur[1]} ▾
          </button>
          <button className="ib" onClick={() => { setNotifOpen(!notifOpen); setCurOpen(false); }}><Icon n="bell" /></button>
          <button className="ib dark" onClick={() => setTab("cart")}>
            <Icon n="cart" />{count > 0 && <i>{count}</i>}
          </button>
        </div>
        {curOpen && (
          <div className="curlist">
            {WORLD.map((w) => (
              <button key={w[1]} className={cur[1] === w[1] ? "on" : ""}
                onClick={() => { setCur(w); setCurOpen(false); }}>
                <span>{w[0]}</span><b>{w[1]}</b><em>{t(w[2])}</em>
              </button>
            ))}
          </div>
        )}
        {notifOpen && (
          <div className="notifp">{notif ? t("No notifications yet.") : t("Notifications are turned off in Settings.")}</div>
        )}
        <div className="search"><Icon n="search" size={18} />
          <input placeholder={t("Search products")} value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button className="x" onClick={() => setQ("")}>✕</button>}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* ---- Recherche (dans toutes les pages) ---- */}
      {q.trim() ? (
        <div className="padw"><h2>{t("Results for")} “{q}”</h2>{grid(results)}</div>
      ) : (
        <>
          {/* ================= PAGE : HOME (accueil) ================= */}
          {tab === "home" && (
            <>
              <div className="chips">
                {CATEGORIES.map((c) => (
                  <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{t(c)}</button>
                ))}
              </div>
              <div className="ad">{ADS.length === 0 ? adsEmpty : adView(ADS[adI])}</div>
              <div className="padw">
                {section(cat === "All" ? "All products" : cat, list)}
              </div>
            </>
          )}

          {/* ================= PAGE : CATEGORY ================= */}
          {tab === "categories" && (
            <div className="padw">
              <h2>{t("Categories")}</h2>
              <div className="catgrid">
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <button key={c} onClick={() => { setCat(c); setTab("home"); }}>{t(c)}</button>
                ))}
              </div>
              {payBox("Payment")}
              {section("Promotions", promos)}
              {section("Recommended for you", recommended)}
            </div>
          )}

          {/* ================= PAGE : CART (panier) ================= */}
          {tab === "cart" && (
            <div className="padw">
              <h2>{t("My Cart")}</h2>
              {cartItems.length === 0 ? (
                <div className="empty"><div className="ring"><Icon n="cart" size={26} /></div><b>{t("Your cart is empty")}</b>
                  <span>{t("Add products to start shopping.")}</span></div>
              ) : (
                <>
                  {cartItems.map((p) => (
                    <div className="crow" key={p.id}>
                      <img src={p.images[0]} alt="" />
                      <div><b>{p.name}</b><span>{p.price} {p.currency}</span></div>
                      <div className="qty"><button onClick={() => sub(p.id)}>−</button>
                        <em>{cart[p.id]}</em><button onClick={() => add(p)}>+</button></div>
                    </div>
                  ))}
                  <p className="total">{t("Total:")} {totalText}</p>
                  <a className="buy wa" target="_blank" rel="noreferrer"
                    href={waLink(cartText)} onClick={() => logMsg("WhatsApp", "order", cartText)}>
                    {t("Order on WhatsApp")}</a>
                </>
              )}
              {payBox("Pay now")}
              {section("Similar products", similar)}
            </div>
          )}

          {/* ================= PAGE : MESSAGE (commandes, WhatsApp, email) ================= */}
          {tab === "messages" && (
            <div className="padw">
              <h2>{t("Messages")}</h2>
              <div className="tabs">
                {["Messages", "Activity", "Live orders"].map((tb) => (
                  <button key={tb} className={msgTab === tb ? "on" : ""} onClick={() => setMsgTab(tb)}>{t(tb)}</button>
                ))}
              </div>
              {(() => {
                const kindOf: Record<string, string> = { "Messages": "", "Activity": "payment", "Live orders": "order" };
                const shown = orders.filter((o) => !kindOf[msgTab] || o.kind === kindOf[msgTab]);
                if (shown.length === 0)
                  return (
                    <div className="empty"><div className="ring"><Icon n="messages" size={26} /></div><b>{t("No {x} yet", { x: t(msgTab).toLowerCase() })}</b>
                      <span>{t("New {x} will appear here.", { x: t(msgTab).toLowerCase() })}</span></div>
                  );
                return (
                  <div className="mlist">
                    {shown.map((o) => (
                      <div className={"mcard " + (o.channel === "WhatsApp" ? "wa" : "mail")} key={o.id}>
                        <div className="mtop">
                          <b>{o.kind === "order" ? t("Order") : o.kind === "payment" ? t("Payment") : t("Message")} · {o.channel}</b>
                          <em>{new Date(o.date).toLocaleString()}</em>
                        </div>
                        <p>{o.text}</p>
                        <div className="mfoot">
                          <span className="mstat">{t("Sent")}</span>
                          <a target="_blank" rel="noreferrer"
                            href={o.channel === "WhatsApp" ? waLink(o.text) : mailLink("King Shipping", o.text)}>{t("Send again")}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="contact">
                <b>{t("Contact the admin to order")}</b>
                <textarea placeholder={t("Write your message or order here…")} value={text}
                  onChange={(e) => setText(e.target.value)} />
                <a className="buy wa" target="_blank" rel="noreferrer"
                  href={waLink(text || "Hello, I want to order.")}
                  onClick={() => { logMsg("WhatsApp", "message", text || "Hello, I want to order."); setText(""); }}>{t("Send on WhatsApp")}</a>
                <a className="buy mail"
                  href={mailLink("Order King Shipping", text || "Hello, I want to order.")}
                  onClick={() => { logMsg("Email", "message", text || "Hello, I want to order."); setText(""); }}>{t("Send by Email")}</a>
              </div>
              {payBox("Payment")}
              {section("Promotions", promos)}
            </div>
          )}

          {/* ================= PAGE : ACCOUNT ================= */}
          {tab === "account" && (
            <div className="padw acc">
              <div className="avatar">{user.photo ? <img src={user.photo} alt="" /> : <span><Icon n="account" size={38} /></span>}</div>
              <h2>{user.prenom} {user.nom} {user.postnom}</h2>
              <p>{user.email}</p><p>{user.phone}</p><p>{user.country}</p>
              <button className="buy" onClick={onLogout}>{t("Log Out")}</button>
              <div className="sect left"><h3>{t("Advertising")}</h3>
                {ADS.length === 0 ? <div className="ad">{adsEmpty}</div>
                  : <div className="adlist">{ADS.map((a, k) => adView(a, k))}</div>}
              </div>
            </div>
          )}

          {/* ================= PAGE : SETTINGS ================= */}
          {tab === "settings" && (
            <div className="padw">
              <h2>{t("Settings")}</h2>
              <div className="srow"><span>{t("Notifications")}</span>
                <button className={"sw" + (notif ? " on" : "")} onClick={() => setNotif(!notif)}><i /></button></div>
              <div className="srow"><span>{t("Messages alerts")}</span>
                <button className={"sw" + (msgAlerts ? " on" : "")} onClick={() => setMsgAlerts(!msgAlerts)}><i /></button></div>
              <div className="srow"><span>{t("Currency")}</span>
                <select value={cur[1]} onChange={(e) => setCur(WORLD.find((w) => w[1] === e.target.value) || WORLD[0])}>
                  {WORLD.map((w) => <option key={w[1]} value={w[1]}>{w[0]} {w[1]} · {t(w[2])}</option>)}
                </select></div>
              <div className="srow"><span>{t("Language")}</span>
                <button className="langbtn" onClick={() => setLangOpen(true)}>
                  <Icon n="globe" size={16} /> {(LANGS.find((l) => l[0] === lang) || LANGS[0])[1]}</button></div>
              <div className="srow"><span>{t("Version")}</span><em>{VERSION}</em></div>
              {payBox("Payment")}
              <button className="buy" onClick={onLogout}>{t("Log Out")}</button>
              {section("Promotions", promos)}
              {section("Products", VALID)}
            </div>
          )}
        </>
      )}

      {/* ================= FICHE PRODUIT ================= */}
      {/* ---- Fiche produit : 5 photos minimum, 5 étoiles ---- */}
      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button className="x close" onClick={() => setDetail(null)}>✕</button>
            <div className="gal">{detail.images.map((src, k) => <img key={k} src={src} alt="" />)}</div>
            <h3>{detail.name}</h3>
            {detail.description && <p className="ddesc">{detail.description}</p>}
            <Stars />
            <div className="pprice big">{detail.price} {detail.currency}{detail.oldPrice ? <s>{detail.oldPrice}</s> : null}</div>
            {detail.video && <video src={detail.video} controls playsInline />}
            <button className="buy" onClick={() => add(detail)}>{t("Add to cart")}</button>
            <a className="buy wa" target="_blank" rel="noreferrer"
              href={waLink(`Hello, I want to order: ${detail.name} (${detail.price} ${detail.currency})`)}
              onClick={() => logMsg("WhatsApp", "order", `Hello, I want to order: ${detail.name} (${detail.price} ${detail.currency})`)}>
              {t("Order on WhatsApp")}</a>
          </div>
        </div>
      )}

      {/* ================= CHOIX DE LA LANGUE ================= */}
      {/* ---- Choix de la langue ---- */}
      {langOpen && (
        <div className="modal" onClick={() => setLangOpen(false)}>
          <div className="psheet" onClick={(e) => e.stopPropagation()}>
            <div className="phead"><b>{t("Language")}</b>
              <button className="x" onClick={() => setLangOpen(false)}>✕</button></div>
            <input className="pin" placeholder={t("Search language")} value={langQ}
              onChange={(e) => setLangQ(e.target.value)} />
            <div className="langlist">
              {LANGS.filter((l) => (l[1] + " " + l[2]).toLowerCase().includes(langQ.toLowerCase())).map((l) => (
                <button key={l[0]} className={lang === l[0] ? "on" : ""}
                  onClick={() => { onLang(l[0]); setLangOpen(false); setLangQ(""); }}>
                  <b>{l[1]}</b><em>{l[2]}</em>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= FENÊTRE DE PAIEMENT ================= */}
      {/* ---- Fenêtre de paiement ---- */}
      {payId && (() => {
        const m = PAY_METHODS.find((x) => x.id === payId);
        if (!m) return null;
        const proofText = `Payment proof\nMethod: ${m.name}\nAmount: ${payAmount} ${m.currency}\nName: ${user.prenom} ${user.nom}\nPhone: ${user.phone}`;
        return (
          <div className="modal" onClick={() => setPayId(null)}>
            <div className="psheet" onClick={(e) => e.stopPropagation()}>
              <div className="phead"><i style={{ background: m.color }}>{m.short}</i><b>{t("Pay with {name}", { name: m.name })}</b>
                <button className="x" onClick={() => setPayId(null)}>✕</button></div>
              <label>{t("Amount")} ({m.currency})</label>
              <input className="pin" inputMode="decimal" placeholder={t("Amount in {cur}", { cur: m.currency })}
                value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              {m.needsPhone && (
                <>
                  <label>{t("Your {name} phone number", { name: m.name })}</label>
                  <input className="pin" type="tel" placeholder={t("Phone number")}
                    value={payPhone} onChange={(e) => setPayPhone(e.target.value)} />
                </>
              )}
              <button className="buy" disabled={payBusy} onClick={payNow}>
                {payBusy ? t("Please wait…") : `${t("Pay")} ${payAmount} ${m.currency}`}
              </button>
              {payMsg && <p className="paymsg">{payMsg}</p>}
              {m.account && (
                <div className="acctbox">
                  <small>{t("Or send manually to this {label}:", { label: t(m.accountLabel || "") })}</small>
                  <div><b>{m.account}</b><button onClick={() => copyText(m.account as string)}>{t("Copy")}</button></div>
                </div>
              )}
              <a className="buy wa" target="_blank" rel="noreferrer"
                href={waLink(proofText)} onClick={() => logMsg("WhatsApp", "payment", proofText)}>
                {t("Send proof on WhatsApp")}</a>
            </div>
          </div>
        );
      })()}

      {/* ================= BOUTON D'APPEL ================= */}
      {/* ---- Bouton d'appel flottant (Panier et Account) ---- */}
      {(tab === "cart" || tab === "account") && !aiOpen && !detail && !payId && !langOpen && !callOpen && (
        <button className="callfab" aria-label={t("Call")} onClick={() => { setCallOpen(true); setCurOpen(false); setNotifOpen(false); }}>
          <Icon n="phone" size={20} /><em>{t("Call")}</em>
        </button>
      )}
      {callOpen && (
        <div className="modal" onClick={() => setCallOpen(false)}>
          <div className="psheet" onClick={(e) => e.stopPropagation()}>
            <div className="phead"><b>{t("Call")}</b>
              <button className="x" onClick={() => setCallOpen(false)}>✕</button></div>
            <p className="callnote">{t("Call the administrator for more information.")}</p>
            <div className="callnum">+{ADMIN.whatsapp}</div>
            <a className="buy" href={`tel:+${ADMIN.whatsapp}`}>{t("Normal call")}</a>
            <a className="buy wa" target="_blank" rel="noreferrer"
              href={waLink("Hello, I would like to call you about my order.")}>{t("WhatsApp call")}</a>
            <p className="callnote small2">{t("In WhatsApp, tap the call icon at the top of the chat.")}</p>
          </div>
        </div>
      )}

      {/* ================= ASSISTANT IA ================= */}
      {/* ---- Bouton IA flottant (toutes les pages) ---- */}
      {!aiOpen && !detail && !payId && !langOpen && !callOpen && (
        <button className="aifab" aria-label={t("AI assistant")} onClick={() => { setAiOpen(true); setCurOpen(false); setNotifOpen(false); }}>
          <Icon n="spark" size={20} /><em>AI</em>
        </button>
      )}
      {aiOpen && (
        <div className="modal" onClick={() => setAiOpen(false)}>
          <div className="aisheet" onClick={(e) => e.stopPropagation()}>
            <div className="aihead">
              <div className="aidot"><Icon n="spark" size={18} /></div>
              <div className="aititle"><b>King AI</b><small>{t("Find products and real prices")}</small></div>
              <button className="x" onClick={() => setAiOpen(false)}>✕</button>
            </div>
            <div className="aibody">
              {aiMsgs.length === 0 && (
                <div className="aihello">
                  <p>{t("Hi {name}! Ask me to find a product or to check its real price.", { name: user.prenom })}</p>
                  <div className="aisug">
                    {["Find a perfume under 30 USD", "Real price of an iPhone 15", "Compare cheap laptops"].map((x) => (
                      <button key={x} onClick={() => askAI(t(x))}>{t(x)}</button>
                    ))}
                  </div>
                </div>
              )}
              {aiMsgs.map((m, k) => <div key={k} className={"aimsg " + m.role}>{m.content}</div>)}
              {aiLoading && <div className="aimsg assistant">{t("Searching…")}</div>}
              <div ref={endRef} />
            </div>
            <div className="ainput">
              <input placeholder={t("Ask about a product or price…")} value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") askAI(aiInput); }} />
              <button onClick={() => askAI(aiInput)} disabled={aiLoading}><Icon n="arrow" size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BARRE DU BAS ================= */}
      {/* ---- Barre du bas ---- */}
      <nav className="bnav">
        {([["home", "Home"], ["categories", "Category"], ["cart", "Cart"], ["messages", "Message"], ["account", "Account"], ["settings", "Settings"]] as [Tab, string][]).map(([tk, label]) => (
          <button key={tk} className={tab === tk ? "on" : ""} onClick={() => { setTab(tk); setQ(""); }}>
            <Icon n={tk} /><span>{t(label)}</span>
            {tk === "cart" && count > 0 && <i>{count}</i>}
          </button>
        ))}
      </nav>
    </div>
  );
}
// ==================================================================
// STYLES : couleurs, tailles, police Times New Roman
// ==================================================================
const css = `
/* ===== King Shipping : design sobre et raffiné (noir, blanc cassé, une seule couleur d'accent) ===== */
*{box-sizing:border-box}
body{margin:0;background:#000}
.root{--bg:#08090c;--surf:#11131a;--surf2:#181b24;--line:#262b3a;--txt:#efeae0;--mut:#9a9aa6;--acc:#c9742a;--blue:#3d63a8;--green:#3f8f6b;--wine:#9a3f50;--gold:#c9a24a;--steel:#7d9bc4;
 min-height:100vh;display:flex;justify-content:center;background:#000;color:var(--txt);
 font-family:"Times New Roman",Times,"Liberation Serif","Noto Serif",serif;font-size:16px;line-height:1.35;-webkit-font-smoothing:antialiased}
.phone{width:100%;max-width:430px;min-height:100vh;background:var(--bg);position:relative;overflow-x:hidden}
button,input,select,textarea{font-family:inherit}
button{cursor:pointer}
.logo{border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid var(--acc);color:var(--gold);font-weight:700;letter-spacing:.08em;background:linear-gradient(135deg,#1c2a4a,#3a2414)}
.brand{letter-spacing:.35em;color:var(--mut);font-size:12px;margin-top:8px;text-transform:uppercase}
.center-col{display:flex;flex-direction:column;align-items:center}
/* ---- welcome ---- */
.welcome{min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;padding:26px;background:radial-gradient(ellipse at 0% 60%,rgba(61,99,168,.30),transparent 55%),radial-gradient(ellipse at 100% 72%,rgba(201,116,42,.26),transparent 55%),#08090c}
.welcome .top{display:flex;justify-content:space-between;align-items:flex-start}
.welcome .mini{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;color:var(--mut);letter-spacing:.3em}
.ghost{background:transparent;color:#9db7e6;border:1px solid var(--blue);padding:10px 22px;border-radius:6px;font-size:16px;letter-spacing:.04em}
.center{text-align:center}
.outline{background:transparent;color:var(--gold);border:1px solid var(--acc);padding:15px 46px;border-radius:6px;font-size:19px;letter-spacing:.1em;text-transform:uppercase}
.small{font-size:15px;color:var(--mut);margin:12px 0}
.bottom{text-align:center;color:var(--mut);font-size:16px}
.bottom h3{color:var(--acc);font-weight:400;letter-spacing:.4em;font-size:15px;margin:14px 0 4px}
/* ---- login / signup ---- */
.page{padding:26px 22px 44px;position:relative}
.back{position:absolute;left:10px;top:10px;background:none;border:none;color:var(--txt);font-size:36px;line-height:1}
h1{text-align:center;color:var(--txt);font-size:32px;font-weight:400;letter-spacing:.04em;margin:20px 0 10px}
h1.yellow{font-size:30px}
.frame{border:1px solid #2f4a80;border-radius:12px;padding:30px 20px;margin-top:22px;background:var(--surf)}
.tag,.signup label{display:block;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin:20px 0 8px}
.field{display:flex;align-items:center;border:1px solid #2c3f6b;border-radius:8px;padding:2px 12px;background:var(--bg);gap:10px}
.field:focus-within,.box:focus{border-color:var(--acc);outline:none}
.fic{color:#7f9fd6;display:flex}
.field input{flex:1;background:transparent;border:none;outline:none;color:var(--txt);font-size:17px;padding:13px 2px;min-width:0}
.field input::placeholder,.box::placeholder{color:#6d6a63}
.eye{background:none;border:none;color:var(--mut);display:flex;padding:4px}
.or{text-align:center;color:var(--mut);margin:26px 0 12px;font-size:14px;letter-spacing:.14em;text-transform:uppercase}
.social{display:flex;gap:10px}
.social button{flex:1;background:transparent;border:1px solid #2f4a80;color:var(--txt);border-radius:8px;padding:12px 4px;font-size:16px}
.primary{width:100%;margin-top:24px;background:var(--acc);color:#fff;border:none;border-radius:8px;padding:16px;font-size:18px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.foot{text-align:center;color:var(--mut);font-size:16px;margin-top:20px}
.foot a{color:var(--acc);text-decoration:underline;cursor:pointer}
.error{color:#e07b7b;font-size:15px;text-align:center;margin:14px 0 0}
.box{width:100%;background:var(--surf);border:1px solid #2c3f6b;border-radius:8px;color:var(--txt);font-size:17px;padding:14px}
select.box{appearance:none}
.photo{display:flex;flex-direction:column;align-items:center;margin:14px 0 0;font-size:16px;cursor:pointer;letter-spacing:0!important;text-transform:none!important}
.photo span,.photo img,.avatar span,.avatar img{width:92px;height:92px;border-radius:50%;object-fit:cover;border:1px solid var(--acc);display:flex;align-items:center;justify-content:center;background:var(--surf);color:var(--mut)}
.photo em{font-style:italic;color:var(--acc);font-size:15px;margin-top:10px}
.link{display:block;margin:6px auto 0;background:none;border:none;color:var(--mut);font-size:14px;text-decoration:underline}
/* ---- intro ---- */
.intro{padding-top:52px}
.vbox{width:100%;aspect-ratio:9/12;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:#000;margin:16px 0}
.vbox video{width:100%;height:100%;object-fit:cover}
.slide{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 20% 20%,rgba(61,99,168,.32),transparent 60%),radial-gradient(ellipse at 80% 85%,rgba(201,116,42,.26),transparent 60%),#0a0b10}
.count{font-size:84px;font-weight:400;color:var(--txt);font-variant-numeric:lining-nums}
.owner{color:var(--mut);font-size:16px;text-align:center;padding:0 24px;margin-top:10px;font-style:italic}
h1.white{font-size:30px;margin:6px 0}
.bar{width:100%;height:2px;background:var(--line);overflow:hidden;margin-top:12px}
.bar div{height:100%;background:var(--acc);transition:width 1s linear}
/* ===== boutique ===== */
.shop{background:var(--bg);color:var(--txt);min-height:100vh;padding-bottom:96px}
.shead{background:rgba(8,9,12,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:12px 14px;position:sticky;top:0;z-index:20;border-bottom:1px solid var(--line)}
.toprow{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.grow{flex:1}
.me{display:flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--line);border-radius:22px;padding:3px 14px 3px 3px;font-size:16px;color:var(--txt)}
.me img,.me span{width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--acc);background:var(--surf);display:flex;align-items:center;justify-content:center;color:var(--mut)}
.cur{background:transparent;border:1px solid var(--acc);color:#e9b27a;border-radius:6px;padding:9px 12px;font-size:15px;letter-spacing:.04em}
.ib{position:relative;width:40px;height:40px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--txt);display:flex;align-items:center;justify-content:center}
.ib.dark{background:var(--blue);border-color:var(--blue);color:#fff}
.ib i,.bnav i{position:absolute;top:-6px;right:-6px;background:var(--acc);color:#fff;font-style:normal;font-size:12px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center}
.curlist{max-height:290px;overflow-y:auto;border:1px solid var(--line);border-radius:8px;margin-bottom:10px;background:var(--surf)}
.curlist button{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;background:transparent;border:none;border-bottom:1px solid var(--line);font-size:16px;color:var(--txt);text-align:left}
.curlist button span{font-size:20px}.curlist button b{width:46px;font-weight:600}.curlist button em{color:var(--mut);font-style:normal;font-size:14px}
.curlist button.on{background:var(--surf2);color:var(--acc)}
.notifp{border:1px solid var(--line);border-radius:8px;padding:14px;margin-bottom:10px;font-size:16px;color:var(--mut);background:var(--surf)}
.search{display:flex;align-items:center;gap:8px;background:var(--surf);border:1px solid var(--line);border-radius:8px;padding:0 12px;color:var(--mut)}
.search:focus-within{border-color:var(--steel)}
.search input{flex:1;border:none;background:transparent;outline:none;font-size:17px;padding:12px 0;color:var(--txt);min-width:0}
.search input::placeholder{color:#6d6a63}
.x{background:none;border:none;color:var(--mut);font-size:18px}
.toast{position:fixed;top:96px;left:50%;transform:translateX(-50%);background:var(--txt);color:#111;padding:10px 20px;border-radius:6px;font-size:16px;z-index:40}
.chips{display:flex;gap:8px;overflow-x:auto;padding:14px 14px 4px;scrollbar-width:none}
.chips button{flex:0 0 auto;background:#14203a;border:1px solid #2c3f6b;color:var(--txt);border-radius:6px;padding:9px 16px;font-size:16px;white-space:nowrap}
.chips button.on{background:var(--acc);color:#fff;border-color:var(--acc)}
.ad{margin:14px 14px 0;border-radius:10px;overflow:hidden;min-height:140px;background:linear-gradient(120deg,#1d3566 0%,#463266 55%,#8a4a22 100%);border:none}
.ad img,.ad video,.adlist img,.adlist video{width:100%;display:block;object-fit:cover;max-height:200px}
.adlist{display:flex;flex-direction:column;gap:12px}
.adempty{min-height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#e8dfd0}
.adempty b{font-size:15px;letter-spacing:.3em;text-transform:uppercase;font-weight:400;color:#e6c77a}.adempty span{font-size:16px;font-style:italic}
.sect{margin-top:26px}
.sect h3{margin:0 0 14px;font-size:21px;font-weight:400;letter-spacing:.03em;color:var(--txt);padding:0 0 8px 10px;border-left:3px solid var(--acc);border-bottom:1px solid var(--line)}
.sect.left{text-align:left}
.empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:34px 12px;color:var(--mut);background:var(--surf);border:1px solid var(--line);border-radius:10px}
.empty b{color:var(--txt);font-size:18px;font-weight:400}.empty span{font-size:15px;font-style:italic}
.ring{width:56px;height:56px;border-radius:50%;border:1px solid #2f4a80;color:#7f9fd6;display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.pgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.pcard{position:relative;border-radius:6px;padding:5px 5px 8px;background:#fff;color:#111;cursor:pointer}
.pcard img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:3px;background:#eee}
.badge{position:absolute;top:9px;left:9px;background:var(--wine);color:#fff;font-style:normal;font-size:10px;font-weight:700;letter-spacing:.1em;padding:3px 6px;border-radius:2px;text-transform:uppercase}
.pname{font-size:14px;font-weight:700;margin:6px 0 1px;color:#111;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pdesc{font-size:12.5px;color:#555;line-height:1.25;margin-bottom:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ddesc{color:#555;font-size:16px;margin:0 0 6px}
.stars{color:#c2902f;font-size:13px;letter-spacing:0}
.pprice{color:#a9561a;font-weight:700;font-size:14.5px;margin-top:2px}.pprice s{color:#888;font-weight:400;font-size:12.5px;margin-left:4px}
.pprice.big{font-size:24px;margin:6px 0}.pprice.big s{font-size:15px}
.pcard button{width:100%;margin-top:6px;background:#2f4f8f;color:#fff;border:none;border-radius:3px;padding:8px 2px;font-size:12.5px;letter-spacing:.04em}
.padw{padding:18px 14px}
.padw h2{margin:0 0 16px;font-size:28px;font-weight:400;letter-spacing:.02em;color:var(--txt)}
.catgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.catgrid button{background:var(--surf);border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:8px;padding:18px 12px;color:var(--txt);text-align:left;font-size:17px}
.catgrid button:nth-child(4n+2){border-left-color:var(--blue)}
.catgrid button:nth-child(4n+3){border-left-color:var(--green)}
.catgrid button:nth-child(4n){border-left-color:#6b5ca5}
.tabs{display:flex;margin-bottom:14px;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.tabs button{flex:1;padding:11px 4px;border:none;background:transparent;font-size:15px;color:var(--mut)}
.tabs button.on{background:var(--blue);color:#fff}
.contact{border:1px solid var(--line);border-radius:10px;padding:16px;margin-top:16px;background:var(--surf)}
.contact b{color:var(--txt);font-size:18px;font-weight:400}
.contact textarea{width:100%;min-height:96px;border:1px solid var(--line);border-radius:8px;padding:12px;margin-top:12px;font-size:16px;color:var(--txt);background:var(--bg)}
.crow{display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:#fff;color:#111;border-radius:6px}
.crow img{width:58px;height:58px;border-radius:3px;object-fit:cover;background:#eee}
.crow div:nth-child(2){flex:1;display:flex;flex-direction:column;font-size:16px}
.crow span{color:#a9561a;font-weight:700}
.qty{display:flex;align-items:center;gap:8px}
.qty em{font-style:normal;font-weight:700}
.qty button{width:30px;height:30px;border-radius:4px;border:none;background:#2f4f8f;color:#fff;font-size:18px}
.total{font-weight:700;font-size:20px;margin:18px 0 0;color:var(--gold)}
.buy{display:block;width:100%;text-align:center;text-decoration:none;margin-top:12px;background:var(--acc);color:#fff;border:none;border-radius:8px;padding:15px;font-size:17px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.buy.wa{background:#2f7a5a;color:#fff}
.buy.mail{background:var(--blue);color:#fff}
.buy:disabled{opacity:.55}
.acc{text-align:center}.acc p{margin:4px 0;color:var(--mut)}
.acc h2{margin-top:6px}
.acc .avatar{display:flex;justify-content:center;margin-bottom:10px}
.shop .avatar span,.shop .avatar img{width:100px;height:100px}
.srow{display:flex;justify-content:space-between;align-items:center;padding:15px 14px;margin-bottom:8px;background:var(--surf);border:1px solid var(--line);border-radius:8px;font-size:17px;gap:10px;color:var(--txt)}
.srow select{max-width:190px;padding:8px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--txt);font-size:15px}
.srow em{color:var(--acc);font-style:normal}
.langbtn{display:flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--blue);color:var(--txt);border-radius:6px;padding:8px 12px;font-size:16px}
.sw{width:50px;height:28px;border-radius:14px;border:none;background:#3a3a3f;position:relative}
.sw i{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.2s}
.sw.on{background:var(--green)}.sw.on i{left:25px}
.modal{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:50;display:flex;align-items:flex-end;justify-content:center}
.sheet{position:relative;background:#fff;color:#111;width:100%;max-width:430px;max-height:90vh;overflow-y:auto;border-radius:14px 14px 0 0;padding:16px}
.sheet h3{color:#111;font-size:24px;font-weight:400;margin:6px 0}
.close{position:absolute;right:14px;top:10px;z-index:2;background:#111;color:#fff;border-radius:50%;width:32px;height:32px}
.gal{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;margin-bottom:10px}
.gal img{flex:0 0 85%;scroll-snap-align:center;aspect-ratio:1;object-fit:cover;border-radius:6px;background:#eee}
.sheet video{width:100%;border-radius:6px;margin-top:10px}
.paytoggle{width:100%;display:flex;align-items:center;gap:12px;background:var(--surf);border:1px solid var(--line);border-radius:8px;padding:14px;color:var(--txt);font-size:18px;text-align:left}
.paytoggle b{flex:1;font-weight:400}
.paytoggle .payico{width:36px;height:36px;border-radius:50%;background:var(--blue);border:none;color:#fff;display:flex;align-items:center;justify-content:center}
.paytoggle em{font-style:italic;color:var(--mut);font-size:15px}
.paytoggle u{text-decoration:none;color:var(--acc);transition:transform .2s}
.paytoggle.open u{transform:rotate(180deg)}
.paytoggle.open{border-color:var(--acc)}
.paytoggle+.paygrid{margin-top:10px}
.paygrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.paym{display:flex;align-items:center;gap:10px;background:var(--surf);border:1px solid var(--line);border-radius:8px;padding:12px;color:var(--txt);text-align:left}
.paym i,.phead i{flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:var(--blue);border:none;color:#fff;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:700;font-size:12px}
.paym span{display:flex;flex-direction:column;min-width:0}
.paym b{font-size:16px;font-weight:600}.paym small{color:#6fbf93;font-size:13px;margin-top:2px;font-style:italic}
.paym.off{opacity:.45}.paym.off small{color:var(--mut)}
.psheet{background:var(--surf);color:var(--txt);width:100%;max-width:430px;max-height:92vh;overflow-y:auto;border-radius:14px 14px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line)}
.phead{display:flex;align-items:center;gap:10px;margin-bottom:8px}.phead b{flex:1;font-size:20px;font-weight:400}
.psheet label{display:block;margin:16px 0 6px;color:var(--mut);font-size:13px;letter-spacing:.14em;text-transform:uppercase}
.pin{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:14px;font-size:17px;color:var(--txt);outline:none}
.pin:focus{border-color:var(--acc)}
.paymsg{margin:14px 0 0;padding:12px;border-radius:8px;background:var(--bg);border:1px solid var(--line);font-size:16px;line-height:1.4;color:var(--txt)}
.acctbox{margin-top:16px;padding:12px;border-radius:8px;background:var(--bg);border:1px dashed var(--line)}
.acctbox small{color:var(--mut);font-size:14px}
.acctbox div{display:flex;align-items:center;justify-content:space-between;margin-top:6px;font-size:18px;gap:8px}
.acctbox b{word-break:break-all;font-weight:600}
.acctbox button{background:transparent;color:var(--acc);border:1px solid var(--acc);border-radius:6px;padding:7px 14px;font-size:15px}
.langlist{max-height:55vh;overflow-y:auto;margin-top:10px;border:1px solid var(--line);border-radius:8px}
.langlist button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px 14px;background:transparent;border:none;border-bottom:1px solid var(--line);color:var(--txt);font-size:17px;text-align:left}
.langlist button b{font-weight:600}.langlist button em{color:var(--mut);font-style:normal;font-size:14px}
.langlist button.on{background:var(--surf2);color:var(--acc)}
.aifab{position:fixed;right:max(14px,calc(50% - 201px));bottom:96px;z-index:25;width:54px;height:54px;border-radius:50%;border:none;background:linear-gradient(135deg,#4a3f86,#2f4f8f);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;box-shadow:0 6px 20px rgba(0,0,0,.6);animation:aifloat 3.4s ease-in-out infinite}
.aifab em{font-style:normal;font-size:11px;font-weight:700;letter-spacing:.12em}
@keyframes aifloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.aisheet{background:var(--surf);color:var(--txt);width:100%;max-width:430px;height:78vh;border-radius:14px 14px 0 0;display:flex;flex-direction:column;overflow:hidden;border-top:1px solid var(--line)}
.aihead{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}
.aidot{width:38px;height:38px;border-radius:50%;border:none;background:linear-gradient(135deg,#4a3f86,#2f4f8f);color:#fff;display:flex;align-items:center;justify-content:center}
.aititle{flex:1;display:flex;flex-direction:column}.aititle b{font-weight:400;font-size:20px}.aititle small{color:var(--mut);font-size:14px;font-style:italic}
.aibody{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.aihello p{color:var(--mut);font-size:17px;margin:0 0 12px;font-style:italic}
.aisug{display:flex;flex-direction:column;gap:8px}
.aisug button{background:transparent;border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:12px 14px;font-size:16px;text-align:left}
.aimsg{max-width:88%;padding:11px 14px;border-radius:10px;font-size:16.5px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}
.aimsg.user{align-self:flex-end;background:#2f4f8f;color:#fff}
.aimsg.assistant{align-self:flex-start;background:var(--bg);border:1px solid var(--line);color:var(--txt)}
.ainput{display:flex;gap:8px;padding:12px 14px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line)}
.ainput input{flex:1;min-width:0;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:13px 14px;font-size:17px;color:var(--txt);outline:none}
.ainput input:focus{border-color:var(--acc)}
.ainput button{width:48px;border:none;border-radius:8px;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center}
.ainput button:disabled{opacity:.5}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;display:flex;background:rgba(8,9,12,.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--line);padding:8px 2px calc(8px + env(safe-area-inset-bottom,0px));z-index:30}
.bnav button{flex:1;position:relative;background:none;border:none;color:var(--mut);display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px}
.bnav button.on{color:var(--acc)}
.bnav button.on::before{content:"";position:absolute;top:-9px;width:24px;height:1px;background:var(--acc)}
.bnav i{top:-4px;right:12px}
.mlist{display:flex;flex-direction:column;gap:10px}
.mcard{background:var(--surf);border:1px solid var(--line);border-left:3px solid var(--blue);border-radius:8px;padding:12px 14px}
.mcard.wa{border-left-color:var(--green)}.mcard.mail{border-left-color:var(--blue)}
.mtop{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.mtop b{font-size:16px;font-weight:600}.mtop em{font-style:normal;color:var(--mut);font-size:13px}
.mcard p{margin:8px 0;white-space:pre-wrap;font-size:16px;color:var(--txt);word-wrap:break-word}
.mfoot{display:flex;justify-content:space-between;align-items:center;font-size:14px}
.mstat{color:#6fbf93;font-style:italic}.mfoot a{color:#9db7e6;text-decoration:underline}
.callfab{position:fixed;right:max(80px,calc(50% - 135px));bottom:96px;z-index:25;width:54px;height:54px;border-radius:50%;border:none;background:linear-gradient(135deg,#3f8f6b,#2c6b50);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;box-shadow:0 6px 20px rgba(0,0,0,.6);animation:aifloat 3.4s ease-in-out infinite;animation-delay:.7s}
.callfab em{font-style:normal;font-size:11px;font-weight:700;letter-spacing:.08em}
.callnote{color:var(--mut);font-size:17px;text-align:center;margin:10px 0 0;font-style:italic}
.callnote.small2{font-size:14px;margin-top:14px}
.callnum{font-size:28px;letter-spacing:.04em;text-align:center;margin:12px 0 8px;color:var(--txt)}
`;