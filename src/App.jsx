import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingBasket, Plus, Minus, X, Check, Clock, Star, MapPin, Phone } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`;
const LOGO_SRC = "/logo.png";

const COLORS = {
  ink: "#241B12",
  cream: "#FFFBF3",
  sand: "#FBF1DE",
  card: "#FFFFFF",
  red: "#E2231A",
  yellow: "#F5A200",
  green: "#1F5C3E",
  line: "#EAE0C8",
  muted: "#7A6C51",
};

const CAT_META = {
  "Jus naturels": {
    icon: "🧃", overline: "Pressés le jour même",
    subtitle: "De bissap au moringa, en passant par le bouye et le madd — 100% naturels, sans additifs.",
  },
  "Sirops & concentrés": {
    icon: "🍹", overline: "À diluer ou en cocktail",
    subtitle: "Concentrés artisanaux, parfaits pour twister vos boissons et sublimer vos cocktails.",
  },
  "Confitures": {
    icon: "🍓", overline: "Fruits locaux mijotés",
    subtitle: "Pots de 370g, cuits doucement pour préserver le goût des fruits du terroir.",
  },
  "Chutneys": {
    icon: "🌶️", overline: "Condiments relevés",
    subtitle: "Le compagnon parfait de vos plats — bissap et citron, en pots de 370g.",
  },
};

function groupByFlavor(catProducts) {
  const map = new Map();
  for (const p of catProducts) {
    if (!map.has(p.name)) map.set(p.name, []);
    map.get(p.name).push(p);
  }
  return [...map.entries()].map(([name, variants]) => ({ id: `${variants[0].cat}::${name}`, name, variants }));
}

const SEED_PRODUCTS = [
  // Jus naturels
  { id: "p1", name: "Jus de bissap rouge", cat: "Jus naturels", price: 1000, stock: 3, unit: "1L", popular: true , image: "/produits/jus-bissap-rouge-1l.jpg" },
  { id: "p2", name: "Jus de bissap rouge", cat: "Jus naturels", price: 100, stock: 0, unit: "50cl" , image: "/produits/jus-bissap-rouge-50cl.jpg" },
  { id: "p3", name: "Jus de bissap blanc", cat: "Jus naturels", price: 1000, stock: 0, unit: "1L" , image: "/produits/jus-bissap-blanc-1l.jpg" },
  { id: "p4", name: "Jus de bissap blanc", cat: "Jus naturels", price: 100, stock: 0, unit: "50cl" , image: "/produits/jus-bissap-blanc-50cl.jpg" },
  { id: "p5", name: "Jus de bouye", cat: "Jus naturels", price: 1000, stock: 4, unit: "1L" , image: "/produits/jus-bouye-1l.jpg" },
  { id: "p6", name: "Jus de bouye", cat: "Jus naturels", price: 100, stock: 0, unit: "50cl" , image: "/produits/jus-bouye-50cl.jpg" },
  { id: "p7", name: "Jus de madd", cat: "Jus naturels", price: 1000, stock: 0, unit: "1L" , image: "/produits/jus-madd-1l.jpg" },
  { id: "p8", name: "Jus de madd", cat: "Jus naturels", price: 100, stock: 0, unit: "50cl" , image: "/produits/jus-madd-50cl.jpg" },
  { id: "p9", name: "Jus de moringa", cat: "Jus naturels", price: 1000, stock: 6, unit: "1L", popular: true , image: "/produits/jus-moringa-1l.jpg" },
  { id: "p10", name: "Jus de moringa", cat: "Jus naturels", price: 100, stock: 0, unit: "50cl" , image: "/produits/jus-moringa-50cl.jpg" },
  { id: "p11", name: "Jus de tamarin", cat: "Jus naturels", price: 1000, stock: 0, unit: "1L" , image: "/produits/jus-tamarin-1l.jpg" },
  { id: "p12", name: "Jus de tamarin", cat: "Jus naturels", price: 100, stock: 1, unit: "50cl" , image: "/produits/jus-tamarin-50cl.jpg" },
  { id: "p13", name: "Jus de gingembre", cat: "Jus naturels", price: 1000, stock: 0, unit: "1L" , image: "/produits/jus-gingembre-1l.jpg" },
  { id: "p14", name: "Jus de gingembre", cat: "Jus naturels", price: 100, stock: 0, unit: "50cl" , image: "/produits/jus-gingembre-50cl.jpg" },

  // Sirops & concentrés
  { id: "p15", name: "Sirop de bissap rouge", cat: "Sirops & concentrés", price: 2000, stock: 5, unit: "1L", popular: true , image: "/produits/sirop-bissap-rouge-1l.jpg" },
  { id: "p16", name: "Sirop de bissap blanc", cat: "Sirops & concentrés", price: 2000, stock: 0, unit: "1L" , image: "/produits/sirop-bissap-blanc-1l.jpg" },
  { id: "p17", name: "Sirop de bouye", cat: "Sirops & concentrés", price: 2000, stock: 0, unit: "1L" , image: "/produits/sirop-bouye-1l.jpg" },
  { id: "p18", name: "Sirop de gingembre", cat: "Sirops & concentrés", price: 2000, stock: 0, unit: "1L" , image: "/produits/sirop-gingembre-1l.jpg" },
  { id: "p19", name: "Sirop de tamarin", cat: "Sirops & concentrés", price: 2000, stock: 0, unit: "1L" , image: "/produits/sirop-tamarin-1l.jpg" },
  { id: "p20", name: "Sirop de madd", cat: "Sirops & concentrés", price: 2000, stock: 0, unit: "1L" , image: "/produits/sirop-madd-1l.jpg" },

  // Confitures
  { id: "p21", name: "Confiture de mangue", cat: "Confitures", price: 1500, stock: 0, unit: "370g" , image: "/produits/confiture-mangue.jpg" },
  { id: "p22", name: "Confiture de madd", cat: "Confitures", price: 1500, stock: 2, unit: "370g" , image: "/produits/confiture-madd.jpg" },

  // Chutneys
  { id: "p23", name: "Chutney bissap", cat: "Chutneys", price: 1500, stock: 12, unit: "370g" , image: "/produits/chutney-bissap.jpg" },
  { id: "p24", name: "Chutney citron", cat: "Chutneys", price: 1500, stock: 27, unit: "370g", popular: true , image: "/produits/chutney-citron.jpg" },
];

const money = (n) => new Intl.NumberFormat("fr-SN").format(n) + " FCFA";
const KEY_PRODUCTS = "fajar:products";
const KEY_ORDERS = "fajar:orders";

async function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
async function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function App() {
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [cart, setCart] = useState({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const sectionRefs = useRef({});
  const productRefs = useRef({});

  useEffect(() => {
    (async () => {
      const p = await loadStorage(KEY_PRODUCTS, SEED_PRODUCTS);
      const o = await loadStorage(KEY_ORDERS, []);
      setProducts(p);
      setOrders(o);
      setActiveCat([...new Set(p.map((x) => x.cat))][0]);
      setLoading(false);
    })();
  }, []);

  const cartItems = useMemo(() => {
    if (!products) return [];
    return Object.entries(cart).filter(([, q]) => q > 0)
      .map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty }));
  }, [cart, products]);

  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  function addToCart(id, delta) {
    const product = products.find((p) => p.id === id);
    setCart((c) => {
      const current = c[id] || 0;
      const next = Math.max(0, Math.min(product.stock, current + delta));
      return { ...c, [id]: next };
    });
  }

  async function placeOrder(client) {
    const num = `FAJ-${String(orders.length + 1).padStart(4, "0")}`;
    const order = {
      id: num, date: new Date().toISOString(), client,
      items: cartItems.map(({ id, name, price, qty, unit }) => ({ id, name, price, qty, unit })),
      total: cartTotal, status: "Nouvelle",
    };
    const nextOrders = [order, ...orders];
    const nextProducts = products.map((p) => {
      const inCart = cart[p.id] || 0;
      return inCart ? { ...p, stock: p.stock - inCart } : p;
    });
    setOrders(nextOrders); setProducts(nextProducts);
    await saveStorage(KEY_ORDERS, nextOrders);
    await saveStorage(KEY_PRODUCTS, nextProducts);
    setCart({}); setCheckoutOpen(false); setConfirmedOrder(order);
  }

  function scrollToCat(cat) {
    setActiveCat(cat);
    sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToProduct(cat, id) {
    setActiveCat(cat);
    productRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function shortLabel(name) {
    const words = name.replace(/^Jus de |^Sirop de |^Confiture d[e']\s?|^Compote de /i, "").trim();
    return words.length > 16 ? words.slice(0, 15) + "…" : words;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.cream, fontFamily: "Inter, sans-serif" }}>
        <style>{FONT_IMPORT}</style>Chargement…
      </div>
    );
  }

  const cats = [...new Set(products.map((p) => p.cat))];
  const populaires = products.filter((p) => p.popular && p.stock > 0);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "'Inter', sans-serif", color: COLORS.ink, paddingBottom: cartItems.length ? 76 : 0 }}>
      <style>{FONT_IMPORT}</style>
      <TopBar />
      <Header cartCount={cartCount} />
      <Hero />
      <CatNav cats={cats} active={activeCat} onSelect={scrollToCat} />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 16px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }} className="fajar-layout">
        <Sidebar populaires={populaires} onPick={(id) => addToCart(id, 1)} />
        <div>
          {cats.map((cat) => {
            const catProducts = products.filter((p) => p.cat === cat);
            const groups = groupByFlavor(catProducts);
            const meta = CAT_META[cat] || { icon: "🌿", overline: "Fait maison à Dakar", subtitle: "" };
            return (
              <div key={cat} ref={(el) => (sectionRefs.current[cat] = el)} style={{ marginBottom: 44, scrollMarginTop: 128 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                  color: COLORS.red, marginBottom: 6, display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span> {meta.overline}
                </div>
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(21px, 3.4vw, 28px)",
                  letterSpacing: 0.2, margin: "0 0 6px", textTransform: "uppercase",
                }}>
                  {cat}
                </h2>
                {meta.subtitle && (
                  <div style={{ color: COLORS.muted, fontSize: 13, maxWidth: 520, marginBottom: 16, lineHeight: 1.5 }}>
                    {meta.subtitle}
                  </div>
                )}
                {groups.length > 1 && (
                  <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", marginBottom: 16, paddingBottom: 2 }}>
                    {groups.map((g) => (
                      <button key={g.id} onClick={() => scrollToProduct(cat, g.id)} style={{
                        flexShrink: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        border: `1px solid ${COLORS.line}`, background: "#fff", color: COLORS.ink, whiteSpace: "nowrap",
                      }}>{shortLabel(g.name)}</button>
                    ))}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 }}>
                  {groups.map((g) => (
                    <div key={g.id} ref={(el) => (productRefs.current[g.id] = el)} style={{ scrollMarginTop: 170 }}>
                      <ProductGroupCard group={g} cart={cart} onChange={addToCart} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />

      {cartItems.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.ink, color: "#fff", padding: "13px 16px", zIndex: 20 }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 14 }}><b>{cartCount}</b> article(s) · {money(cartTotal)}</div>
            <button onClick={() => setCheckoutOpen(true)} style={{
              background: COLORS.red, color: "#fff", border: "none", borderRadius: 999, padding: "10px 20px",
              fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer",
            }}>Commander</button>
          </div>
        </div>
      )}
      {checkoutOpen && <CheckoutModal items={cartItems} total={cartTotal} onClose={() => setCheckoutOpen(false)} onConfirm={placeOrder} />}
      {confirmedOrder && <ConfirmModal order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />}

      <style>{`@media (max-width: 760px) { .fajar-layout { grid-template-columns: 1fr !important; } .fajar-sidebar { order: 2; } }`}</style>
    </div>
  );
}

function TopBar() {
  return (
    <div style={{ background: COLORS.red, color: "#fff", fontSize: 12, fontWeight: 600, textAlign: "center", padding: "7px 12px" }}>
      🛵 Livraison à Dakar sous 24-48h · Retrait gratuit à l'atelier
    </div>
  );
}

function Header({ cartCount }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 30, background: COLORS.cream, borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          background: "#fff", borderRadius: 12, padding: "6px 12px", boxShadow: "0 2px 10px -4px rgba(36,27,18,0.18)",
          border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center",
        }}>
          <img src={LOGO_SRC} alt="GIE FAJAR" style={{ height: 42 }} />
        </div>
        <div style={{
          position: "relative", display: "flex", alignItems: "center", gap: 6, background: COLORS.ink,
          color: "#fff", borderRadius: 999, padding: "8px 14px", fontWeight: 700, fontSize: 13,
        }}>
          <ShoppingBasket size={15} />
          <span style={{
            background: COLORS.yellow, color: COLORS.ink, borderRadius: "50%", width: 20, height: 20,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800,
          }}>{cartCount}</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const images = [
    "/hero/toasts-confitures.jpg",
    "/hero/cocktails.jpg",
    "/hero/fruits-splash.jpg",
    "/hero/jus-splash.jpg",
  ];
  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: 280 }}>
      <div className="fajar-hero-collage" style={{
        position: "absolute", inset: 0, display: "grid",
        gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
      }}>
        {images.map((src) => (
          <div key={src} style={{ overflow: "hidden" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, ${COLORS.cream}E6 0%, ${COLORS.cream}CC 40%, ${COLORS.cream}F2 100%)`,
      }} />
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "40px 16px 44px", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14,
      }}>
        <div style={{
          background: "#fff", borderRadius: 28, padding: "24px 36px",
          boxShadow: "0 24px 55px -18px rgba(36,27,18,0.35)",
        }} className="fajar-hero-logo-wrap">
          <img src={LOGO_SRC} alt="GIE FAJAR" className="fajar-hero-logo" />
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 28px)",
          color: COLORS.ink, letterSpacing: 0.2,
        }}>
          Les saveurs du terroir, transformées avec soin
        </div>
        <div style={{ color: COLORS.muted, fontSize: 13.5, fontWeight: 500, maxWidth: 480 }}>
          Jus, sirops et confitures artisanaux — bissap, bouye, gingembre, mangue, tamarin.
        </div>
      </div>
      <style>{`
        .fajar-hero-logo { height: 168px; }
        @media (max-width: 560px) { .fajar-hero-logo { height: 108px; } .fajar-hero-logo-wrap { padding: 18px 24px !important; } }
      `}</style>
    </div>
  );
}

function CatNav({ cats, active, onSelect }) {
  return (
    <div style={{ position: "sticky", top: 56, zIndex: 25, background: COLORS.cream, borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "10px 16px", display: "flex", gap: 8,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {cats.map((c) => (
          <button key={c} onClick={() => onSelect(c)} style={{
            flexShrink: 0, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
            border: `1.5px solid ${active === c ? COLORS.ink : COLORS.line}`,
            background: active === c ? COLORS.ink : "#fff", color: active === c ? "#fff" : COLORS.ink,
            whiteSpace: "nowrap", fontFamily: "'Space Grotesk', sans-serif",
          }}>{c}</button>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ populaires, onPick }) {
  return (
    <div className="fajar-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
          <Clock size={14} color={COLORS.red} /> Commande en ligne
        </div>
        {["Lun – Sam", "Dimanche"].map((d, i) => (
          <div key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: COLORS.muted, padding: "3px 0" }}>
            <span>{d}</span><span>{i === 0 ? "08h – 20h" : "09h – 18h"}</span>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
          <Star size={14} color={COLORS.yellow} /> Top produits
        </div>
        {populaires.map((p) => (
          <div key={p.id} onClick={() => onPick(p.id)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0",
            borderTop: `1px solid ${COLORS.line}`, cursor: "pointer", fontSize: 12.5,
          }}>
            <span>{p.name}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              {money(p.price)} <Plus size={13} />
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.ink, color: "#fff", borderRadius: 14, padding: 14, fontSize: 12.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><MapPin size={14} color={COLORS.yellow} /> Atelier FAJAR</div>
        <div style={{ color: "#C9BC9F" }}>Dakar, Sénégal</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}><Phone size={14} color={COLORS.yellow} /> 77 000 00 00</div>
      </div>
    </div>
  );
}

function ProductGroupCard({ group, cart, onChange }) {
  const { variants } = group;
  const defaultId = (variants.find((v) => v.stock > 0) || variants[0]).id;
  const [selectedId, setSelectedId] = useState(defaultId);
  const selected = variants.find((v) => v.id === selectedId) || variants[0];
  const outOfStock = selected.stock === 0;
  const qty = cart[selected.id] || 0;
  const isPopular = variants.some((v) => v.popular);
  const isNew = ["p9", "p15"].includes(variants[0]?.id);

  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 12,
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "0 10px 26px -18px rgba(36,27,18,0.25)",
    }}>
      <div style={{
        position: "relative", height: 128, borderRadius: 12, overflow: "hidden",
        background: selected.image ? "#fff" : `linear-gradient(150deg, ${COLORS.yellow}2a, ${COLORS.red}20)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected.image ? (
          <img src={selected.image} alt={group.name} style={{ height: "100%", width: "100%", objectFit: "contain" }} />
        ) : (
          <ShoppingBasket size={30} color={COLORS.red} strokeWidth={1.6} />
        )}
        {isPopular && (
          <span style={{ position: "absolute", top: 8, left: 8, background: COLORS.green, color: "#fff", fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, letterSpacing: 0.3 }}>TOP VENTE</span>
        )}
        {!isPopular && isNew && (
          <span style={{ position: "absolute", top: 8, left: 8, background: COLORS.yellow, color: COLORS.ink, fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, letterSpacing: 0.3 }}>NOUVEAU</span>
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.25, fontFamily: "'Space Grotesk', sans-serif" }}>{group.name}</div>

      {variants.length > 1 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {variants.map((v) => (
            <button key={v.id} onClick={() => setSelectedId(v.id)} disabled={v.stock === 0} style={{
              padding: "5px 9px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: v.stock === 0 ? "not-allowed" : "pointer",
              border: `1.5px solid ${v.id === selectedId ? COLORS.ink : COLORS.line}`,
              background: v.id === selectedId ? COLORS.ink : "#fff",
              color: v.id === selectedId ? "#fff" : (v.stock === 0 ? COLORS.muted : COLORS.ink),
              opacity: v.stock === 0 ? 0.5 : 1, textDecoration: v.stock === 0 ? "line-through" : "none",
            }}>{v.unit} · {money(v.price)}</button>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: COLORS.muted }}>{selected.unit}</div>
      )}

      <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>{money(selected.price)}</div>

      {outOfStock ? (
        <div style={{ fontSize: 11.5, color: COLORS.red, fontWeight: 700, textAlign: "center", padding: "8px 0", background: `${COLORS.red}12`, borderRadius: 8 }}>Rupture de stock</div>
      ) : qty === 0 ? (
        <button onClick={() => onChange(selected.id, 1)} style={{
          background: COLORS.red, color: "#fff", border: "none", borderRadius: 999, padding: "9px 0",
          fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          fontFamily: "'Space Grotesk', sans-serif",
        }}><Plus size={14} /> Commander</button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.sand, borderRadius: 999, padding: "4px 6px" }}>
          <button onClick={() => onChange(selected.id, -1)} style={{ border: "none", background: "#fff", borderRadius: 999, width: 26, height: 26, cursor: "pointer" }}><Minus size={13} style={{ margin: "auto" }} /></button>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{qty}</span>
          <button onClick={() => onChange(selected.id, 1)} disabled={qty >= selected.stock} style={{ border: "none", background: "#fff", borderRadius: 999, width: 26, height: 26, cursor: "pointer" }}><Plus size={13} style={{ margin: "auto" }} /></button>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <div style={{ background: COLORS.ink, color: "#B8AC96", marginTop: 30 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "6px 10px", display: "flex" }}>
            <img src={LOGO_SRC} alt="" style={{ height: 30 }} />
          </div>
          <span style={{ fontSize: 12.5 }}>© {new Date().getFullYear()} GIE FAJAR — Dakar, Sénégal</span>
        </div>
        <div style={{ fontSize: 12.5 }}>contact@fajar.sn</div>
      </div>
    </div>
  );
}

function CheckoutModal({ items, total, onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState("Retrait");
  const [address, setAddress] = useState("");
  const canSubmit = name.trim() && phone.trim() && (mode === "Retrait" || address.trim());

  return (
    <Overlay onClose={onClose}>
      <ModalTitle title="Finaliser la commande" onClose={onClose} />
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: COLORS.sand, borderRadius: 10, padding: 12, fontSize: 13 }}>
          {items.map((i) => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{i.qty} × {i.name}</span><span>{money(i.qty * i.price)}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>Total</span><span>{money(total)}</span>
          </div>
        </div>
        <Field label="Nom complet"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Ex : Awa Diop" /></Field>
        <Field label="Téléphone"><input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="77 000 00 00" /></Field>
        <Field label="Mode">
          <div style={{ display: "flex", gap: 8 }}>
            {["Retrait", "Livraison"].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${mode === m ? COLORS.ink : COLORS.line}`,
                background: mode === m ? COLORS.ink : "#fff", color: mode === m ? "#fff" : COLORS.ink,
                fontWeight: 600, fontSize: 13,
              }}>{m}</button>
            ))}
          </div>
        </Field>
        {mode === "Livraison" && (
          <Field label="Adresse de livraison"><input value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} placeholder="Quartier, ville" /></Field>
        )}
        <button disabled={!canSubmit} onClick={() => onConfirm({ name, phone, mode, address })} style={{
          marginTop: 6, padding: "12px 0", borderRadius: 10, border: "none",
          background: canSubmit ? COLORS.red : "#E2CFC0", color: "#fff", fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif", cursor: canSubmit ? "pointer" : "not-allowed",
        }}>Confirmer la commande</button>
      </div>
    </Overlay>
  );
}

function ConfirmModal({ order, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ padding: 28, textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Check color="#fff" size={24} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>Commande {order.id} enregistrée</div>
        <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}>
          Merci {order.client.name} — total {money(order.total)}. L'équipe FAJAR vous contacte au {order.client.phone}.
        </div>
        <button onClick={onClose} style={{ marginTop: 18, padding: "10px 22px", borderRadius: 999, border: "none", background: COLORS.ink, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Fermer</button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(36,27,18,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.cream, width: "100%", maxWidth: 480, borderRadius: "18px 18px 0 0", maxHeight: "88vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ title, onClose }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 10px" }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17 }}>{title}</div>
      <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={20} /></button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${COLORS.line}`,
  fontSize: 14, boxSizing: "border-box", fontFamily: "'Inter', sans-serif",
};
