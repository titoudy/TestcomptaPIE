import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import Admin from "./Admin";
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, orderBy
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword
} from "firebase/auth";

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #1a1a2e; --ink-soft: #4a4a6a; --ink-muted: #9090b0;
    --surface: #f7f6f2; --surface-2: #eeecea; --surface-3: #e5e3df;
    --white: #ffffff; --accent: #c8403a; --accent-soft: #f0e0df;
    --green: #2d6a4f; --green-soft: #d8f3dc; --amber: #b5540a;
    --amber-soft: #fef3e2; --blue: #1d4e89; --blue-soft: #dbeafe;
    --radius: 12px; --radius-sm: 8px;
    --shadow: 0 2px 16px rgba(26,26,46,0.08); --shadow-lg: 0 8px 40px rgba(26,26,46,0.14);
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--surface); color: var(--ink); }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; min-height: 100vh; background: var(--ink); display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 100; }
  .sidebar-logo { padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .sidebar-logo h1 { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--white); }
  .sidebar-logo span { color: var(--accent); }
  .sidebar-logo p { font-size: 11px; color: var(--ink-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
  .sidebar-user { padding: 16px 24px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; flex-shrink: 0; }
  .user-info p { font-size: 13px; color: var(--white); font-weight: 500; }
  .user-info span { font-size: 11px; color: var(--ink-muted); }
  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
  .nav-section { font-size: 10px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 1.2px; padding: 12px 12px 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm); cursor: pointer; color: rgba(255,255,255,0.6); font-size: 13.5px; transition: all 0.15s; user-select: none; }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--white); }
  .nav-item.active { background: var(--accent); color: var(--white); font-weight: 500; }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge { margin-left: auto; background: var(--accent); color: white; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 10px; }
  .nav-item.active .nav-badge { background: rgba(255,255,255,0.3); }
  .main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }
  .topbar { background: var(--white); border-bottom: 1px solid var(--surface-3); padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
  .topbar-title h2 { font-family: 'DM Serif Display', serif; font-size: 22px; }
  .topbar-title p { font-size: 13px; color: var(--ink-muted); margin-top: 1px; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #a8332d; }
  .btn-secondary { background: var(--surface-2); color: var(--ink); }
  .btn-secondary:hover { background: var(--surface-3); }
  .btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--surface-3); }
  .btn-ghost:hover { background: var(--surface); }
  .btn-sm { padding: 5px 12px; font-size: 12.5px; }
  .btn-green { background: var(--green); color: white; }
  .btn-danger { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent); }
  .page { padding: 28px 32px; }
  .card { background: var(--white); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); border: 1px solid var(--surface-3); }
  .card-title { font-family: 'DM Serif Display', serif; font-size: 17px; color: var(--ink); margin-bottom: 16px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--white); border-radius: var(--radius); padding: 20px 24px; box-shadow: var(--shadow); border: 1px solid var(--surface-3); }
  .stat-icon { font-size: 22px; margin-bottom: 4px; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 32px; line-height: 1; }
  .stat-label { font-size: 12px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; padding: 10px 14px; font-size: 11.5px; font-weight: 600; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid var(--surface-2); background: var(--surface); }
  tbody tr { border-bottom: 1px solid var(--surface-2); transition: background 0.1s; }
  tbody tr:hover { background: var(--surface); }
  tbody td { padding: 12px 14px; font-size: 13.5px; }
  td.muted { color: var(--ink-muted); font-size: 13px; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  .badge-green { background: var(--green-soft); color: var(--green); }
  .badge-red { background: var(--accent-soft); color: var(--accent); }
  .badge-amber { background: var(--amber-soft); color: var(--amber); }
  .badge-blue { background: var(--blue-soft); color: var(--blue); }
  .badge-gray { background: var(--surface-2); color: var(--ink-soft); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.55); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(2px); }
  .modal { background: var(--white); border-radius: var(--radius); padding: 32px; width: 540px; max-width: 95vw; box-shadow: var(--shadow-lg); max-height: 85vh; overflow-y: auto; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--surface-2); }
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.6px; }
  .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid var(--surface-3); border-radius: var(--radius-sm); font-size: 14px; font-family: inherit; color: var(--ink); background: var(--white); transition: border-color 0.15s; outline: none; }
  .form-input:focus { border-color: var(--accent); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; flex-shrink: 0; }
  .tabs { display: flex; border-bottom: 2px solid var(--surface-2); margin-bottom: 24px; }
  .tab { padding: 10px 20px; font-size: 13.5px; font-weight: 500; cursor: pointer; color: var(--ink-muted); border-bottom: 2px solid transparent; margin-bottom: -2px; }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: var(--ink); }
  .progress-bar { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
  .toast { position: fixed; bottom: 28px; right: 28px; background: var(--ink); color: white; padding: 12px 20px; border-radius: var(--radius-sm); font-size: 13.5px; box-shadow: var(--shadow-lg); z-index: 9999; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .spinner { width: 40px; height: 40px; border: 3px solid var(--surface-3); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; }
  .loading-screen p { color: var(--ink-muted); font-size: 14px; }

  /* LOGIN */
  .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--ink); }
  .login-box { background: var(--white); border-radius: var(--radius); padding: 48px; width: 400px; box-shadow: var(--shadow-lg); }
  .login-logo { font-family: 'DM Serif Display', serif; font-size: 28px; text-align: center; margin-bottom: 8px; }
  .login-logo span { color: var(--accent); }
  .login-sub { text-align: center; color: var(--ink-muted); font-size: 13px; margin-bottom: 32px; }
  .login-error { background: var(--accent-soft); color: var(--accent); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; }

  /* PAIE */
  .paie-header { background: var(--ink); color: white; padding: 24px; border-radius: var(--radius) var(--radius) 0 0; }
  .paie-line { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--surface-2); font-size: 13.5px; }
  .paie-total { display: flex; justify-content: space-between; padding: 14px 0; font-size: 16px; font-weight: 700; border-top: 2px solid var(--ink); margin-top: 8px; }

  /* CALENDAR */
  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-header { font-size: 11px; font-weight: 600; color: var(--ink-muted); text-align: center; padding: 4px; text-transform: uppercase; }
  .cal-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 13px; cursor: default; transition: all 0.1s; }
  .cal-day.today { background: var(--ink); color: white; font-weight: 600; }
  .cal-day.conge { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
  .cal-day.absence { background: var(--amber-soft); color: var(--amber); }
  .cal-day.empty { opacity: 0; pointer-events: none; }
  .search-wrap { position: relative; }
  .search-input { padding: 8px 14px 8px 36px; border: 1.5px solid var(--surface-3); border-radius: var(--radius-sm); font-size: 13.5px; font-family: inherit; outline: none; width: 220px; background: var(--surface); transition: all 0.15s; }
  .search-input:focus { border-color: var(--accent); background: white; width: 260px; }
  .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--ink-muted); font-size: 14px; pointer-events: none; }
`;

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const initials = (nom) => nom?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";
const fmt = (n) => Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const COULEURS = ["#c8403a","#2d6a4f","#1d4e89","#b5540a","#6b21a8","#0f766e","#be185d","#0369a1","#92400e","#065f46"];

// ─── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

// ─── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "DM Serif Display", fontSize: 20 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | register

  const handle = async () => {
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const msgs = {
        "auth/user-not-found": "Compte introuvable",
        "auth/wrong-password": "Mot de passe incorrect",
        "auth/invalid-email": "Email invalide",
        "auth/email-already-in-use": "Email déjà utilisé",
        "auth/weak-password": "Mot de passe trop faible (6 caractères min.)",
        "auth/invalid-credential": "Email ou mot de passe incorrect",
      };
      setError(msgs[e.code] || "Erreur de connexion");
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo">Asso<span>RH</span></div>
        <div className="login-sub">Gestion RH — Association PIE</div>
        {error && <div className="login-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="prenom.nom@asso.fr" />
        </div>
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} onClick={handle} disabled={loading}>
          {loading ? "Connexion..." : mode === "login" ? "Se connecter" : "Créer le compte"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-muted)" }}>
          {mode === "login" ? (
            <span>Pas encore de compte ? <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => setMode("register")}>Créer un compte</span></span>
          ) : (
            <span><span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => setMode("login")}>← Retour à la connexion</span></span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ salaries, conges, frais }) {
  const enAttente = conges.filter(c => c.statut === "en attente").length;
  const fraisAttente = frais.filter(f => f.statut === "en attente").length;
  const masse = salaries.reduce((s, e) => s + Number(e.salaireBrut || 0), 0);

  return (
    <div className="page">
      <div className="stats-grid">
        {[
          { icon: "👥", value: salaries.length, label: "Salariés actifs" },
          { icon: "🌴", value: enAttente, label: "Congés en attente" },
          { icon: "💶", value: masse.toLocaleString("fr-FR") + " €", label: "Masse salariale brute" },
          { icon: "🧾", value: fraisAttente, label: "Notes à traiter" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Équipe</div>
          {salaries.slice(0, 7).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div className="avatar" style={{ background: COULEURS[i % COULEURS.length] }}>{initials(s.nom)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.nom}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.poste}</div>
              </div>
              <span className={`badge ${s.contrat === "CDI" ? "badge-green" : s.contrat === "CDD" ? "badge-amber" : "badge-blue"}`}>{s.contrat}</span>
            </div>
          ))}
          {salaries.length > 7 && <div style={{ fontSize: 12.5, color: "var(--ink-muted)", textAlign: "center", marginTop: 8 }}>+{salaries.length - 7} autres</div>}
          {salaries.length === 0 && <div style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>Aucun salarié pour l'instant</div>}
        </div>
        <div className="card">
          <div className="card-title">Soldes de congés</div>
          {salaries.slice(0, 6).map((s, i) => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span>{s.nom}</span><span style={{ fontWeight: 600 }}>{s.soldeConges || 0}j</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, ((s.soldeConges || 0) / 25) * 100)}%`, background: COULEURS[i % COULEURS.length] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SALARIES ──────────────────────────────────────────────────────────────────
function Salaries({ salaries, setSalaries, toast }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const blank = { nom: "", poste: "", contrat: "CDI", dateEntree: "", salaireBrut: "", email: "", tel: "", soldeConges: 25 };
  const [form, setForm] = useState(blank);

  const filtered = salaries.filter(s =>
    s.nom?.toLowerCase().includes(search.toLowerCase()) ||
    s.poste?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setSelected(null); setForm(blank); setModal(true); };
  const openEdit = (s) => { setSelected(s); setForm({ ...s }); setModal(true); };

  const save = async () => {
    if (!form.nom || !form.poste) return;
    setSaving(true);
    try {
      const data = { ...form, salaireBrut: Number(form.salaireBrut), soldeConges: Number(form.soldeConges), updatedAt: serverTimestamp() };
      if (selected) {
        await updateDoc(doc(db, "salaries", selected.id), data);
        setSalaries(prev => prev.map(s => s.id === selected.id ? { ...s, ...data } : s));
        toast("Fiche mise à jour");
      } else {
        data.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, "salaries"), data);
        setSalaries(prev => [...prev, { id: ref.id, ...data }]);
        toast("Salarié ajouté");
      }
      setModal(false);
    } catch (e) { toast("Erreur : " + e.message); }
    setSaving(false);
  };

  const supprimer = async (s) => {
    if (!confirm(`Supprimer ${s.nom} ?`)) return;
    try {
      await deleteDoc(doc(db, "salaries", s.id));
      setSalaries(prev => prev.filter(x => x.id !== s.id));
      toast("Salarié supprimé");
    } catch (e) { toast("Erreur"); }
  };

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Ajouter un salarié</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Salarié</th><th>Poste</th><th>Contrat</th><th>Entrée</th><th>Salaire brut</th><th>Congés</th><th></th></tr></thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ background: COULEURS[i % COULEURS.length], width: 30, height: 30, fontSize: 11 }}>{initials(s.nom)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.nom}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.poste}</td>
                  <td><span className={`badge ${s.contrat === "CDI" ? "badge-green" : s.contrat === "CDD" ? "badge-amber" : "badge-blue"}`}>{s.contrat}</span></td>
                  <td className="muted">{fmtDate(s.dateEntree)}</td>
                  <td style={{ fontWeight: 600 }}>{Number(s.salaireBrut).toLocaleString("fr-FR")} €</td>
                  <td style={{ fontWeight: 600, color: (s.soldeConges || 0) < 5 ? "var(--accent)" : "var(--green)" }}>{s.soldeConges || 0}j</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => supprimer(s)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--ink-muted)" }}>Aucun salarié trouvé</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={selected ? "Modifier le salarié" : "Nouveau salarié"} onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nom complet</label><input className="form-input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Poste</label><input className="form-input" value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Contrat</label>
              <select className="form-input" value={form.contrat} onChange={e => setForm({ ...form, contrat: e.target.value })}>
                {["CDI","CDD","Temps partiel","Alternance","Stage","Bénévole"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Date d'entrée</label><input type="date" className="form-input" value={form.dateEntree} onChange={e => setForm({ ...form, dateEntree: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Salaire brut (€)</label><input type="number" className="form-input" value={form.salaireBrut} onChange={e => setForm({ ...form, salaireBrut: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Solde congés (j)</label><input type="number" className="form-input" value={form.soldeConges} onChange={e => setForm({ ...form, soldeConges: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CONGES ────────────────────────────────────────────────────────────────────
function Conges({ conges, setConges, salaries, toast }) {
  const [tab, setTab] = useState("liste");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mois, setMois] = useState(new Date().getMonth());
  const [an, setAn] = useState(new Date().getFullYear());
  const blank = { salarie: "", type: "Congés payés", debut: "", fin: "", motif: "" };
  const [form, setForm] = useState(blank);

  const save = async () => {
    if (!form.salarie || !form.debut || !form.fin) return;
    setSaving(true);
    try {
      const jours = Math.round((new Date(form.fin) - new Date(form.debut)) / 86400000) + 1;
      const data = { ...form, jours, statut: "en attente", createdAt: serverTimestamp() };
      const ref = await addDoc(collection(db, "conges"), data);
      setConges(prev => [...prev, { id: ref.id, ...data }]);
      toast("Demande soumise");
      setModal(false); setForm(blank);
    } catch (e) { toast("Erreur"); }
    setSaving(false);
  };

  const updateStatut = async (id, statut) => {
    try {
      await updateDoc(doc(db, "conges", id), { statut });
      setConges(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
      toast(statut === "approuvé" ? "Congé approuvé ✓" : "Congé refusé");
    } catch (e) { toast("Erreur"); }
  };

  const firstDay = new Date(an, mois, 1).getDay();
  const daysInMonth = new Date(an, mois + 1, 0).getDate();
  const today = new Date();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const getCongeDay = (day) => {
    const date = new Date(an, mois, day);
    return conges.find(c => {
      const d = new Date(c.debut), f = new Date(c.fin);
      return date >= d && date <= f && c.statut === "approuvé";
    });
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: "none" }}>
          {["liste","calendrier","soldes"].map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</div>)}
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nouvelle demande</button>
      </div>

      {tab === "liste" && (
        <div className="card">
          <table>
            <thead><tr><th>Salarié</th><th>Type</th><th>Période</th><th>Durée</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {conges.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.salarie}</td>
                  <td><span className={`badge ${c.type === "Congés payés" ? "badge-green" : c.type === "Maladie" ? "badge-red" : "badge-blue"}`}>{c.type}</span></td>
                  <td className="muted">{fmtDate(c.debut)} → {fmtDate(c.fin)}</td>
                  <td style={{ fontWeight: 600 }}>{c.jours}j</td>
                  <td><span className={`badge ${c.statut === "approuvé" ? "badge-green" : c.statut === "refusé" ? "badge-red" : "badge-amber"}`}>{c.statut}</span></td>
                  <td>
                    {c.statut === "en attente" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-green btn-sm" onClick={() => updateStatut(c.id, "approuvé")}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => updateStatut(c.id, "refusé")}>✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {conges.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--ink-muted)" }}>Aucune demande</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "calendrier" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { if (mois === 0) { setMois(11); setAn(an - 1); } else setMois(mois - 1); }}>←</button>
            <div style={{ fontFamily: "DM Serif Display", fontSize: 20 }}>{MOIS[mois]} {an}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => { if (mois === 11) { setMois(0); setAn(an + 1); } else setMois(mois + 1); }}>→</button>
          </div>
          <div className="calendar-grid" style={{ gap: 6 }}>
            {JOURS.map(j => <div key={j} className="cal-header">{j}</div>)}
            {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} className="cal-day empty">0</div>)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const c = getCongeDay(day);
              const isToday = today.getFullYear() === an && today.getMonth() === mois && today.getDate() === day;
              return <div key={day} className={`cal-day ${isToday ? "today" : c ? (c.type === "Maladie" ? "absence" : "conge") : ""}`} title={c ? `${c.salarie} — ${c.type}` : ""}>{day}</div>;
            })}
          </div>
        </div>
      )}

      {tab === "soldes" && (
        <div className="card">
          <table>
            <thead><tr><th>Salarié</th><th>Contrat</th><th>Solde CP</th><th>Progression</th></tr></thead>
            <tbody>
              {salaries.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ background: COULEURS[i % COULEURS.length], width: 28, height: 28, fontSize: 11 }}>{initials(s.nom)}</div>
                      {s.nom}
                    </div>
                  </td>
                  <td><span className={`badge ${s.contrat === "CDI" ? "badge-green" : "badge-amber"}`}>{s.contrat}</span></td>
                  <td style={{ fontWeight: 700, color: (s.soldeConges || 0) < 5 ? "var(--accent)" : "var(--green)" }}>{s.soldeConges || 0} jours</td>
                  <td style={{ width: 200 }}><div className="progress-bar"><div className="progress-fill" style={{ width: `${((s.soldeConges || 0) / 25) * 100}%`, background: COULEURS[i % COULEURS.length] }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nouvelle demande de congé" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Envoi..." : "Soumettre"}</button></>}>
          <div className="form-group"><label className="form-label">Salarié</label>
            <select className="form-input" value={form.salarie} onChange={e => setForm({ ...form, salarie: e.target.value })}>
              <option value="">Sélectionner...</option>
              {salaries.map(s => <option key={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Type d'absence</label>
            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {["Congés payés","RTT","Congé sans solde","Maladie","Maternité/Paternité","Congé exceptionnel"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Début</label><input type="date" className="form-input" value={form.debut} onChange={e => setForm({ ...form, debut: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Fin</label><input type="date" className="form-input" value={form.fin} onChange={e => setForm({ ...form, fin: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Motif (optionnel)</label><input className="form-input" value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── NOTES DE FRAIS ────────────────────────────────────────────────────────────
function NotesFrais({ frais, setFrais, salaries, toast }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = { salarie: "", date: "", categorie: "Transport", description: "", montant: "" };
  const [form, setForm] = useState(blank);

  const totalAttente = frais.filter(f => f.statut === "en attente").reduce((s, f) => s + Number(f.montant || 0), 0);
  const totalApprouve = frais.filter(f => f.statut === "approuvé").reduce((s, f) => s + Number(f.montant || 0), 0);

  const save = async () => {
    if (!form.salarie || !form.montant || !form.description) return;
    setSaving(true);
    try {
      const data = { ...form, montant: Number(form.montant), statut: "en attente", justif: false, createdAt: serverTimestamp() };
      const ref = await addDoc(collection(db, "frais"), data);
      setFrais(prev => [...prev, { id: ref.id, ...data }]);
      toast("Note soumise");
      setModal(false); setForm(blank);
    } catch (e) { toast("Erreur"); }
    setSaving(false);
  };

  const updateStatut = async (id, statut) => {
    try {
      await updateDoc(doc(db, "frais", id), { statut });
      setFrais(prev => prev.map(f => f.id === id ? { ...f, statut } : f));
      toast(statut === "approuvé" ? "Note approuvée" : "Note refusée");
    } catch (e) { toast("Erreur"); }
  };

  const catIcons = { Transport: "🚆", Repas: "🍽️", Fournitures: "📦", Formation: "🎓", Hébergement: "🏨", Autre: "📎" };

  return (
    <div className="page">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value">{fmt(totalAttente)}</div><div className="stat-label">En attente</div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{fmt(totalApprouve)}</div><div className="stat-label">Approuvé</div></div>
        <div className="stat-card"><div className="stat-icon">🧾</div><div className="stat-value">{frais.filter(f => f.statut === "en attente").length}</div><div className="stat-label">À traiter</div></div>
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 className="card-title" style={{ margin: 0 }}>Toutes les notes</h3>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nouvelle note</button>
        </div>
        <table>
          <thead><tr><th>Salarié</th><th>Date</th><th>Catégorie</th><th>Description</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {frais.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 500 }}>{f.salarie}</td>
                <td className="muted">{fmtDate(f.date)}</td>
                <td>{catIcons[f.categorie] || "📎"} {f.categorie}</td>
                <td className="muted">{f.description}</td>
                <td style={{ fontWeight: 700, fontFamily: "DM Serif Display", fontSize: 16 }}>{fmt(Number(f.montant))}</td>
                <td><span className={`badge ${f.statut === "approuvé" ? "badge-green" : f.statut === "refusé" ? "badge-red" : "badge-amber"}`}>{f.statut}</span></td>
                <td>
                  {f.statut === "en attente" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-green btn-sm" onClick={() => updateStatut(f.id, "approuvé")}>✓</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStatut(f.id, "refusé")}>✕</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {frais.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--ink-muted)" }}>Aucune note de frais</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Nouvelle note de frais" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Envoi..." : "Soumettre"}</button></>}>
          <div className="form-group"><label className="form-label">Salarié</label>
            <select className="form-input" value={form.salarie} onChange={e => setForm({ ...form, salarie: e.target.value })}>
              <option value="">Sélectionner...</option>
              {salaries.map(s => <option key={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Catégorie</label>
              <select className="form-input" value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                {["Transport","Repas","Fournitures","Formation","Hébergement","Autre"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Montant (€)</label><input type="number" step="0.01" className="form-input" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── FICHES DE PAIE ────────────────────────────────────────────────────────────
function FichesPaie({ salaries, toast }) {
  const [mois, setMois] = useState(new Date().getMonth());
  const [an, setAn] = useState(new Date().getFullYear());
  const [selected, setSelected] = useState(null);

  const calcPaie = (s) => {
    const brut = Number(s.salaireBrut || 0);
    const cotSal = Math.round(brut * 0.22 * 100) / 100;
    const cotPat = Math.round(brut * 0.42 * 100) / 100;
    const net = Math.round((brut - cotSal) * 100) / 100;
    return { brut, cotSal, cotPat, net };
  };

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (mois === 0) { setMois(11); setAn(an - 1); } else setMois(mois - 1); }}>← Préc.</button>
        <div style={{ fontFamily: "DM Serif Display", fontSize: 20, flex: 1, textAlign: "center" }}>{MOIS[mois]} {an}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (mois === 11) { setMois(0); setAn(an + 1); } else setMois(mois + 1); }}>Suiv. →</button>
      </div>

      {!selected ? (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Bulletins — {MOIS[mois]} {an}</h3>
            <button className="btn btn-primary" onClick={() => toast("Génération de tous les bulletins...")}>Générer tous</button>
          </div>
          <table>
            <thead><tr><th>Salarié</th><th>Poste</th><th>Brut</th><th>Cotisations</th><th>Net à payer</th><th></th></tr></thead>
            <tbody>
              {salaries.map((s, i) => {
                const p = calcPaie(s);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ background: COULEURS[i % COULEURS.length], width: 28, height: 28, fontSize: 11 }}>{initials(s.nom)}</div>
                        <span style={{ fontWeight: 500 }}>{s.nom}</span>
                      </div>
                    </td>
                    <td className="muted">{s.poste}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(p.brut)}</td>
                    <td style={{ color: "var(--accent)" }}>−{fmt(p.cotSal)}</td>
                    <td style={{ fontWeight: 700, color: "var(--green)", fontSize: 15 }}>{fmt(p.net)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}>👁 Voir</button>
                    </td>
                  </tr>
                );
              })}
              {salaries.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--ink-muted)" }}>Aucun salarié</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSelected(null)}>← Retour</button>
          <div className="card" style={{ maxWidth: 580, margin: "0 auto", padding: 0, overflow: "hidden" }}>
            <div className="paie-header">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ fontFamily: "DM Serif Display", fontSize: 22 }}>Bulletin de Paie</div><div style={{ fontSize: 13, opacity: 0.6 }}>{MOIS[mois]} {an}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "DM Serif Display", fontSize: 18 }}>Asso<span style={{ color: "var(--accent)" }}>PIE</span></div><div style={{ fontSize: 11, opacity: 0.5 }}>Association loi 1901</div></div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.nom}</div>
                <div style={{ fontSize: 13, opacity: 0.6 }}>{selected.poste} · {selected.contrat}</div>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {(() => {
                const p = calcPaie(selected);
                return (
                  <>
                    <div className="paie-line"><span>Salaire de base</span><span style={{ fontWeight: 600 }}>{fmt(p.brut)}</span></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", margin: "14px 0 10px" }}>Cotisations salariales</div>
                    <div className="paie-line"><span>Assurance maladie</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.007)}</span></div>
                    <div className="paie-line"><span>Retraite (AGIRC-ARRCO)</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.069)}</span></div>
                    <div className="paie-line"><span>Chômage</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.024)}</span></div>
                    <div className="paie-line"><span>CSG/CRDS</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.098)}</span></div>
                    <div className="paie-line"><span>Prévoyance & mutuelle</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.022)}</span></div>
                    <div className="paie-total"><span>Net à payer</span><span style={{ color: "var(--green)" }}>{fmt(p.net)}</span></div>
                    <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-muted)", display: "flex", justifyContent: "space-between" }}>
                      <span>Coût total employeur</span><span style={{ fontWeight: 600, color: "var(--ink)" }}>{fmt(p.brut + p.cotPat)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
            <button className="btn btn-primary" onClick={() => { toast("Téléchargement..."); window.print(); }}>⬇ Imprimer / PDF</button>
            <button className="btn btn-secondary" onClick={() => toast(`Bulletin envoyé à ${selected.email}`)}>📧 Envoyer par email</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [salaries, setSalaries] = useState([]);
  const [conges, setConges] = useState([]);
  const [frais, setFrais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = (msg) => setToastMsg(msg);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  // Load data from Firestore when logged in
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubSalaries = onSnapshot(collection(db, "salaries"), snap => {
      setSalaries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubConges = onSnapshot(collection(db, "conges"), snap => {
      setConges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubFrais = onSnapshot(collection(db, "frais"), snap => {
      setFrais(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubSalaries(); unsubConges(); unsubFrais(); };
  }, [user]);

  const enAttente = conges.filter(c => c.statut === "en attente").length;
  const fraisAttente = frais.filter(f => f.statut === "en attente").length;

  const nav = [
    { id: "dashboard", label: "Tableau de bord", icon: "◉", section: null },
    { id: "salaries", label: "Salariés", icon: "👥", section: "RH" },
    { id: "conges", label: "Congés & Absences", icon: "🌴", section: "RH", badge: enAttente },
    { id: "contrats", label: "Contrats", icon: "📄", section: "RH" },
    { id: "paie", label: "Fiches de paie", icon: "💶", section: "Paie" },
    { id: "frais", label: "Notes de frais", icon: "🧾", section: "Paie", badge: fraisAttente },
    { id: "admin", label: "Administration", icon: "⚙️", section: "Système" },
  ];

  const titles = {
    dashboard: { title: "Tableau de bord", sub: `${salaries.length} salariés actifs` },
    salaries: { title: "Salariés", sub: `${salaries.length} membres` },
    conges: { title: "Congés & Absences", sub: `${enAttente} demande${enAttente > 1 ? "s" : ""} en attente` },
    contrats: { title: "Contrats", sub: "Modèles et suivi" },
    paie: { title: "Fiches de paie", sub: "Bulletins mensuels" },
    frais: { title: "Notes de frais", sub: `${fraisAttente} à traiter` },
  };

  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen"><div className="spinner" /><p>Chargement...</p></div>
    </>
  );

  if (!user) return <><style>{CSS}</style><Login /></>;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>Asso<span>RH</span></h1>
            <p>Gestion RH · PIE</p>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">{user.email?.[0]?.toUpperCase() || "?"}</div>
            <div className="user-info">
              <p>{user.email?.split("@")[0]}</p>
              <span>Administrateur</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {[...new Set(nav.map(n => n.section))].map(section => (
              <div key={section || "main"}>
                {section && <div className="nav-section">{section}</div>}
                {nav.filter(n => n.section === section).map(n => (
                  <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                    <span className="icon">{n.icon}</span>
                    {n.label}
                    {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: "12px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 6 }}>{user.email}</div>
              <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }} onClick={() => signOut(auth)}>
                Déconnexion
              </button>
            </div>
          </nav>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="topbar-title">
              <h2>{titles[page]?.title}</h2>
              <p>{titles[page]?.sub}</p>
            </div>
            <span style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </header>

          {loading ? (
            <div className="loading-screen" style={{ flex: 1 }}><div className="spinner" /><p>Chargement des données...</p></div>
          ) : (
            <>
              {page === "dashboard" && <Dashboard salaries={salaries} conges={conges} frais={frais} />}
              {page === "salaries" && <Salaries salaries={salaries} setSalaries={setSalaries} toast={toast} />}
              {page === "conges" && <Conges conges={conges} setConges={setConges} salaries={salaries} toast={toast} />}
              {page === "contrats" && (
                <div className="page">
                  <div className="card">
                    <div className="card-title">Module Contrats</div>
                    <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>Les modèles de contrats (CDI, CDD, Alternance) seront générés ici et stockés dans Firebase Storage.</p>
                  </div>
                </div>
              )}
              {page === "paie" && <FichesPaie salaries={salaries} toast={toast} />}
              {page === "frais" && <NotesFrais frais={frais} setFrais={setFrais} salaries={salaries} toast={toast} />}
              {page === "admin" && <Admin salaries={salaries} toast={toast} />}
            </>
          )}
        </main>
      </div>

      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
    </>
  );
}
