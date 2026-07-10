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

const SEED_PRODUCTS = [
  { id: "p1", name: "Jus de bissap", cat: "Jus naturels", price: 1500, stock: 24, unit: "1L", popular: true },
  { id: "p2", name: "Jus de bouye", cat: "Jus naturels", price: 1800, stock: 14, unit: "1L" },
  { id: "p3", name: "Jus de gingembre", cat: "Jus naturels", price: 1500, stock: 3, unit: "1L" },
  { id: "p4", name: "Sirop de bissap", cat: "Sirops & concentrés", price: 2500, stock: 18, unit: "50cl" },
  { id: "p5", name: "Sirop de gingembre", cat: "Sirops & concentrés", price: 2500, stock: 9, unit: "50cl" },
  { id: "p6", name: "Confiture de mangue", cat: "Confitures & marmelades", price: 2000, stock: 21, unit: "250g", popular: true },
  { id: "p7", name: "Confiture d'orange", cat: "Confitures & marmelades", price: 2000, stock: 0, unit: "250g" },
  { id: "p8", name: "Compote de tamarin", cat: "Purées & compotes", price: 1700, stock: 12, unit: "250g", popular: true },
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
          {cats.map((cat) => (
            <div key={cat} ref={(el) => (sectionRefs.current[cat] = el)} style={{ marginBottom: 30, scrollMarginTop: 128 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 18, background: COLORS.red, borderRadius: 3 }} />
                {cat}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                {products.filter((p) => p.cat === cat).map((p) => (
                  <ProductCard key={p.id} product={p} qty={cart[p.id] || 0} onChange={addToCart} />
                ))}
              </div>
            </div>
          ))}
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
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: `linear-gradient(135deg, ${COLORS.yellow} 0%, ${COLORS.red} 75%)`,
    }}>
      <div style={{
        position: "absolute", top: "-30%", left: "-10%", width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-35%", right: "-8%", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
      }} />
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "40px 16px 44px", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14,
      }}>
        <div style={{
          background: "#fff", borderRadius: 28, padding: "24px 36px",
          boxShadow: "0 24px 55px -18px rgba(36,27,18,0.5)",
        }} className="fajar-hero-logo-wrap">
          <img src={LOGO_SRC} alt="GIE FAJAR" className="fajar-hero-logo" />
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 28px)",
          color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.15)", letterSpacing: 0.2,
        }}>
          Les saveurs du terroir, transformées avec soin
        </div>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13.5, fontWeight: 500, maxWidth: 480 }}>
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
            flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${active === c ? COLORS.red : COLORS.line}`,
            background: active === c ? COLORS.red : "#fff", color: active === c ? "#fff" : COLORS.ink,
            whiteSpace: "nowrap",
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

function ProductCard({ product, qty, onChange }) {
  const outOfStock = product.stock === 0;
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 10,
      display: "flex", flexDirection: "column", gap: 6, opacity: outOfStock ? 0.5 : 1,
    }}>
      <div style={{
        position: "relative", height: 82, borderRadius: 9,
        background: `linear-gradient(150deg, ${COLORS.yellow}2a, ${COLORS.red}20)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ShoppingBasket size={24} color={COLORS.red} strokeWidth={1.6} />
        {product.popular && !outOfStock && (
          <span style={{ position: "absolute", top: 6, left: 6, background: COLORS.green, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999 }}>Populaire</span>
        )}
      </div>
      <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, minHeight: 32 }}>{product.name}</div>
      <div style={{ fontSize: 11, color: COLORS.muted }}>{product.unit}</div>
      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{money(product.price)}</div>
      {outOfStock ? (
        <div style={{ fontSize: 11, color: COLORS.red, fontWeight: 700, textAlign: "center", padding: "6px 0" }}>Rupture</div>
      ) : qty === 0 ? (
        <button onClick={() => onChange(product.id, 1)} style={{
          background: COLORS.red, color: "#fff", border: "none", borderRadius: 8, padding: "7px 0",
          fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        }}><Plus size={13} /> Ajouter</button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.sand, borderRadius: 8, padding: "4px 6px" }}>
          <button onClick={() => onChange(product.id, -1)} style={{ border: "none", background: "#fff", borderRadius: 6, width: 24, height: 24, cursor: "pointer" }}><Minus size={12} style={{ margin: "auto" }} /></button>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{qty}</span>
          <button onClick={() => onChange(product.id, 1)} disabled={qty >= product.stock} style={{ border: "none", background: "#fff", borderRadius: 6, width: 24, height: 24, cursor: "pointer" }}><Plus size={12} style={{ margin: "auto" }} /></button>
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
