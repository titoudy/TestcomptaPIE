import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a2e;
    --ink-soft: #4a4a6a;
    --ink-muted: #9090b0;
    --surface: #f7f6f2;
    --surface-2: #eeecea;
    --surface-3: #e5e3df;
    --white: #ffffff;
    --accent: #c8403a;
    --accent-soft: #f0e0df;
    --green: #2d6a4f;
    --green-soft: #d8f3dc;
    --amber: #b5540a;
    --amber-soft: #fef3e2;
    --blue: #1d4e89;
    --blue-soft: #dbeafe;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 2px 16px rgba(26,26,46,0.08);
    --shadow-lg: 0 8px 40px rgba(26,26,46,0.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--surface); color: var(--ink); }

  .app { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: 240px; min-height: 100vh; background: var(--ink);
    display: flex; flex-direction: column; position: fixed; left: 0; top: 0;
    padding: 0; z-index: 100;
  }
  .sidebar-logo {
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 22px; color: var(--white); letter-spacing: -0.5px;
  }
  .sidebar-logo span { color: var(--accent); }
  .sidebar-logo p { font-size: 11px; color: var(--ink-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
  .sidebar-user {
    padding: 16px 24px; display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .user-avatar {
    width: 32px; height: 32px; border-radius: 50%; background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: white; flex-shrink: 0;
  }
  .user-info p { font-size: 13px; color: var(--white); font-weight: 500; }
  .user-info span { font-size: 11px; color: var(--ink-muted); }
  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
  .nav-section { font-size: 10px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 1.2px; padding: 12px 12px 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: var(--radius-sm); cursor: pointer; color: rgba(255,255,255,0.6);
    font-size: 13.5px; font-weight: 400; transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--white); }
  .nav-item.active { background: var(--accent); color: var(--white); font-weight: 500; }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }
  .nav-badge {
    margin-left: auto; background: var(--accent); color: white;
    font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 10px;
  }
  .nav-item.active .nav-badge { background: rgba(255,255,255,0.3); }

  /* MAIN */
  .main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }
  .topbar {
    background: var(--white); border-bottom: 1px solid var(--surface-3);
    padding: 16px 32px; display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .topbar-title h2 { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--ink); }
  .topbar-title p { font-size: 13px; color: var(--ink-muted); margin-top: 1px; }
  .topbar-actions { display: flex; gap: 10px; align-items: center; }
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    border-radius: var(--radius-sm); font-size: 13.5px; font-weight: 500;
    cursor: pointer; border: none; transition: all 0.15s; font-family: inherit;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #a8332d; }
  .btn-secondary { background: var(--surface-2); color: var(--ink); }
  .btn-secondary:hover { background: var(--surface-3); }
  .btn-ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--surface-3); }
  .btn-ghost:hover { background: var(--surface); }
  .btn-sm { padding: 5px 12px; font-size: 12.5px; }
  .btn-green { background: var(--green); color: white; }
  .btn-green:hover { background: #245a42; }

  .page { padding: 28px 32px; }

  /* CARDS */
  .card {
    background: var(--white); border-radius: var(--radius); padding: 24px;
    box-shadow: var(--shadow); border: 1px solid var(--surface-3);
  }
  .card-title { font-family: 'DM Serif Display', serif; font-size: 17px; color: var(--ink); margin-bottom: 16px; }

  /* STATS GRID */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: var(--white); border-radius: var(--radius); padding: 20px 24px;
    box-shadow: var(--shadow); border: 1px solid var(--surface-3);
    display: flex; flex-direction: column; gap: 6px;
  }
  .stat-icon { font-size: 22px; margin-bottom: 4px; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 32px; color: var(--ink); line-height: 1; }
  .stat-label { font-size: 12px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .stat-delta { font-size: 12px; font-weight: 500; margin-top: 2px; }
  .delta-pos { color: var(--green); }
  .delta-neg { color: var(--accent); }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left; padding: 10px 14px; font-size: 11.5px; font-weight: 600;
    color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 2px solid var(--surface-2); background: var(--surface);
  }
  tbody tr { border-bottom: 1px solid var(--surface-2); transition: background 0.1s; }
  tbody tr:hover { background: var(--surface); }
  tbody td { padding: 12px 14px; font-size: 13.5px; color: var(--ink); }
  tbody td.muted { color: var(--ink-muted); font-size: 13px; }

  /* BADGES */
  .badge {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 20px; font-size: 12px; font-weight: 500;
  }
  .badge-green { background: var(--green-soft); color: var(--green); }
  .badge-red { background: var(--accent-soft); color: var(--accent); }
  .badge-amber { background: var(--amber-soft); color: var(--amber); }
  .badge-blue { background: var(--blue-soft); color: var(--blue); }
  .badge-gray { background: var(--surface-2); color: var(--ink-soft); }

  /* GRID LAYOUTS */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(26,26,46,0.55);
    display: flex; align-items: center; justify-content: center; z-index: 200;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--white); border-radius: var(--radius); padding: 32px;
    width: 540px; max-width: 95vw; box-shadow: var(--shadow-lg);
    max-height: 85vh; overflow-y: auto;
  }
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; margin-bottom: 24px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--surface-2); }

  /* FORMS */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.6px; }
  .form-input {
    width: 100%; padding: 9px 13px; border: 1.5px solid var(--surface-3);
    border-radius: var(--radius-sm); font-size: 14px; font-family: inherit;
    color: var(--ink); background: var(--white); transition: border-color 0.15s;
    outline: none;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  select.form-input { cursor: pointer; }

  /* CONGES CALENDAR */
  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-header { font-size: 11px; font-weight: 600; color: var(--ink-muted); text-align: center; padding: 4px; text-transform: uppercase; }
  .cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.1s;
    position: relative;
  }
  .cal-day:hover { background: var(--surface-2); }
  .cal-day.today { background: var(--ink); color: white; font-weight: 600; }
  .cal-day.conge { background: var(--accent-soft); color: var(--accent); font-weight: 500; }
  .cal-day.absence { background: var(--amber-soft); color: var(--amber); font-weight: 500; }
  .cal-day.empty { opacity: 0; pointer-events: none; }

  /* PROGRESS */
  .progress-bar { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }

  /* AVATAR GROUP */
  .avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; flex-shrink: 0; }

  /* TABS */
  .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--surface-2); margin-bottom: 24px; }
  .tab {
    padding: 10px 20px; font-size: 13.5px; font-weight: 500; cursor: pointer;
    color: var(--ink-muted); border-bottom: 2px solid transparent; margin-bottom: -2px;
    transition: all 0.15px;
  }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: var(--ink); }

  /* EMPTY STATE */
  .empty { text-align: center; padding: 48px 24px; color: var(--ink-muted); }
  .empty .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty p { font-size: 14px; }

  /* FRAIS */
  .frais-amount { font-family: 'DM Serif Display', serif; font-size: 18px; }

  /* TOAST */
  .toast {
    position: fixed; bottom: 28px; right: 28px; background: var(--ink);
    color: white; padding: 12px 20px; border-radius: var(--radius-sm);
    font-size: 13.5px; box-shadow: var(--shadow-lg); z-index: 9999;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* DASHBOARD WIDGETS */
  .widget-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .widget-row .card { flex: 1; }
  .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--surface-2); }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .activity-text { font-size: 13px; color: var(--ink); line-height: 1.4; }
  .activity-time { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }

  /* CONTRAT CARD */
  .contrat-card {
    border: 1.5px solid var(--surface-3); border-radius: var(--radius); padding: 20px;
    display: flex; align-items: center; gap: 16px; transition: all 0.15s; cursor: pointer;
  }
  .contrat-card:hover { border-color: var(--accent); box-shadow: var(--shadow); }
  .contrat-icon { font-size: 28px; }
  .contrat-info { flex: 1; }
  .contrat-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .contrat-info p { font-size: 12.5px; color: var(--ink-muted); }
  .contrat-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }

  /* FICHE PAIE */
  .paie-header { background: var(--ink); color: white; padding: 24px; border-radius: var(--radius) var(--radius) 0 0; }
  .paie-body { padding: 24px; }
  .paie-line { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--surface-2); font-size: 13.5px; }
  .paie-line:last-child { border-bottom: none; }
  .paie-total { display: flex; justify-content: space-between; padding: 14px 0; font-size: 16px; font-weight: 700; border-top: 2px solid var(--ink); margin-top: 8px; }

  /* SEARCH */
  .search-input {
    padding: 8px 14px 8px 36px; border: 1.5px solid var(--surface-3); border-radius: var(--radius-sm);
    font-size: 13.5px; font-family: inherit; outline: none; width: 220px; background: var(--surface);
    transition: all 0.15s;
  }
  .search-input:focus { border-color: var(--accent); background: white; width: 260px; }
  .search-wrap { position: relative; }
  .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--ink-muted); font-size: 14px; pointer-events: none; }

  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .grid-2 { grid-template-columns: 1fr; }
  }
`;

// ─── DATA ──────────────────────────────────────────────────────────────────────
const SALARIES_INIT = [
  { id: 1, nom: "Sophie Renard", poste: "Directrice", contrat: "CDI", dateEntree: "2019-03-01", salaireBrut: 3200, statut: "actif", email: "s.renard@asso.fr", tel: "06 12 34 56 78", soldeConges: 18, couleur: "#c8403a" },
  { id: 2, nom: "Marc Dubois", poste: "Chargé de mission", contrat: "CDI", dateEntree: "2020-09-15", salaireBrut: 2400, statut: "actif", email: "m.dubois@asso.fr", tel: "06 23 45 67 89", soldeConges: 12, couleur: "#2d6a4f" },
  { id: 3, nom: "Amina Koné", poste: "Coordinatrice ESS", contrat: "CDI", dateEntree: "2021-01-10", salaireBrut: 2600, statut: "actif", email: "a.kone@asso.fr", tel: "06 34 56 78 90", soldeConges: 22, couleur: "#1d4e89" },
  { id: 4, nom: "Thomas Leroy", poste: "Animateur", contrat: "CDD", dateEntree: "2023-06-01", salaireBrut: 1950, statut: "actif", email: "t.leroy@asso.fr", tel: "06 45 67 89 01", soldeConges: 8, couleur: "#b5540a" },
  { id: 5, nom: "Claire Martin", poste: "Comptable", contrat: "Temps partiel", dateEntree: "2022-04-01", salaireBrut: 1600, statut: "actif", email: "c.martin@asso.fr", tel: "06 56 78 90 12", soldeConges: 15, couleur: "#6b21a8" },
  { id: 6, nom: "Youssef Benali", poste: "Médiateur", contrat: "CDI", dateEntree: "2020-11-01", salaireBrut: 2200, statut: "actif", email: "y.benali@asso.fr", tel: "06 67 89 01 23", soldeConges: 5, couleur: "#0f766e" },
  { id: 7, nom: "Lucie Perrot", poste: "Chargée comm.", contrat: "Alternance", dateEntree: "2024-09-01", salaireBrut: 1100, statut: "actif", email: "l.perrot@asso.fr", tel: "06 78 90 12 34", soldeConges: 6, couleur: "#be185d" },
];

const CONGES_INIT = [
  { id: 1, salarie: "Marc Dubois", type: "Congés payés", debut: "2025-07-14", fin: "2025-07-25", jours: 10, statut: "approuvé", motif: "" },
  { id: 2, salarie: "Amina Koné", type: "RTT", debut: "2025-06-02", fin: "2025-06-04", jours: 3, statut: "approuvé", motif: "" },
  { id: 3, salarie: "Thomas Leroy", type: "Maladie", debut: "2025-05-20", fin: "2025-05-22", jours: 3, statut: "approuvé", motif: "Arrêt médical" },
  { id: 4, salarie: "Lucie Perrot", type: "Congés payés", debut: "2025-08-04", fin: "2025-08-15", jours: 10, statut: "en attente", motif: "" },
  { id: 5, salarie: "Sophie Renard", type: "Congés payés", debut: "2025-07-28", fin: "2025-08-08", jours: 10, statut: "approuvé", motif: "" },
];

const FRAIS_INIT = [
  { id: 1, salarie: "Marc Dubois", date: "2025-05-10", categorie: "Transport", description: "Train Paris-Lyon mission partenaires", montant: 87.50, statut: "approuvé", justif: true },
  { id: 2, salarie: "Amina Koné", date: "2025-05-14", categorie: "Repas", description: "Déjeuner réunion réseau ESS", montant: 34.00, statut: "en attente", justif: true },
  { id: 3, salarie: "Thomas Leroy", date: "2025-05-08", categorie: "Fournitures", description: "Matériel animation atelier", montant: 52.30, statut: "approuvé", justif: true },
  { id: 4, salarie: "Sophie Renard", date: "2025-05-16", categorie: "Transport", description: "Uber réunion mairie", montant: 18.90, statut: "en attente", justif: false },
  { id: 5, salarie: "Youssef Benali", date: "2025-05-12", categorie: "Formation", description: "Formation médiation conflits", montant: 290.00, statut: "approuvé", justif: true },
];

const CONTRATS_MODELES = [
  { id: 1, nom: "CDI Temps plein", icon: "📄", desc: "Contrat à durée indéterminée — 35h/semaine" },
  { id: 2, nom: "CDD 6 mois", icon: "📋", desc: "Contrat à durée déterminée renouvelable" },
  { id: 3, nom: "Temps partiel 80%", icon: "📃", desc: "CDI temps partiel — 28h/semaine" },
  { id: 4, nom: "Contrat d'apprentissage", icon: "🎓", desc: "Alternance — Convention de formation" },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const initials = (nom) => nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
const fmt = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
const fmtDate = (d) => new Date(d).toLocaleDateString("fr-FR");
const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const JOURS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 className="modal-title" style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ salaries, conges, frais }) {
  const enAttente = conges.filter(c => c.statut === "en attente").length;
  const fraisAttente = frais.filter(f => f.statut === "en attente").length;
  const masseSalariale = salaries.reduce((s, e) => s + e.salaireBrut, 0);
  const congesMonth = conges.filter(c => c.statut === "approuvé").length;

  const activities = [
    { color: "#c8403a", text: "Lucie Perrot a soumis une demande de congés (10j)", time: "Il y a 2h" },
    { color: "#2d6a4f", text: "Note de frais approuvée — Youssef Benali (290 €)", time: "Il y a 4h" },
    { color: "#1d4e89", text: "Contrat Thomas Leroy renouvelé jusqu'au 31/12", time: "Hier" },
    { color: "#b5540a", text: "Amina Koné — note de frais en attente de validation", time: "Il y a 2j" },
    { color: "#6b21a8", text: "Nouveau salarié ajouté : Lucie Perrot (Alternance)", time: "Il y a 5j" },
  ];

  return (
    <div className="page">
      <div className="stats-grid">
        {[
          { icon: "👥", value: salaries.length, label: "Salariés actifs", delta: "+1 ce mois", pos: true },
          { icon: "🌴", value: enAttente, label: "Congés en attente", delta: "À valider", pos: false },
          { icon: "💶", value: masseSalariale.toLocaleString("fr-FR") + " €", label: "Masse salariale brute", delta: "Mensuelle", pos: true },
          { icon: "🧾", value: fraisAttente, label: "Notes de frais", delta: "En attente", pos: false },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-delta ${s.pos ? "delta-pos" : "delta-neg"}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Équipe</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {salaries.slice(0, 6).map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="avatar" style={{ background: s.couleur }}>{initials(s.nom)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.nom}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.poste}</div>
                </div>
                <span className={`badge ${s.contrat === "CDI" ? "badge-green" : s.contrat === "CDD" ? "badge-amber" : "badge-blue"}`}>{s.contrat}</span>
              </div>
            ))}
            {salaries.length > 6 && <div style={{ fontSize: 12.5, color: "var(--ink-muted)", textAlign: "center" }}>+{salaries.length - 6} autres</div>}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">Activité récente</div>
            {activities.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-title">Soldes de congés</div>
          {salaries.slice(0, 5).map(s => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span>{s.nom}</span>
                <span style={{ fontWeight: 600 }}>{s.soldeConges}j</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (s.soldeConges / 25) * 100)}%`, background: s.couleur }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Répartition contrats</div>
          {[
            { label: "CDI", count: salaries.filter(s => s.contrat === "CDI").length, color: "#2d6a4f" },
            { label: "CDD", count: salaries.filter(s => s.contrat === "CDD").length, color: "#b5540a" },
            { label: "Temps partiel", count: salaries.filter(s => s.contrat === "Temps partiel").length, color: "#1d4e89" },
            { label: "Alternance", count: salaries.filter(s => s.contrat === "Alternance").length, color: "#6b21a8" },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.count} salarié{r.count > 1 ? "s" : ""}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(r.count / salaries.length) * 100}%`, background: r.color }} />
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
  const [form, setForm] = useState({ nom: "", poste: "", contrat: "CDI", dateEntree: "", salaireBrut: "", email: "", tel: "", soldeConges: 25 });

  const filtered = salaries.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()) || s.poste.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setSelected(null); setForm({ nom: "", poste: "", contrat: "CDI", dateEntree: "", salaireBrut: "", email: "", tel: "", soldeConges: 25 }); setModal(true); };
  const openEdit = (s) => { setSelected(s); setForm({ ...s }); setModal(true); };

  const save = () => {
    if (!form.nom || !form.poste) return;
    const couleurs = ["#c8403a","#2d6a4f","#1d4e89","#b5540a","#6b21a8","#0f766e","#be185d","#0369a1"];
    if (selected) {
      setSalaries(prev => prev.map(s => s.id === selected.id ? { ...s, ...form, salaireBrut: Number(form.salaireBrut), soldeConges: Number(form.soldeConges) } : s));
      toast("Fiche salarié mise à jour");
    } else {
      setSalaries(prev => [...prev, { ...form, id: Date.now(), statut: "actif", salaireBrut: Number(form.salaireBrut), soldeConges: Number(form.soldeConges), couleur: couleurs[prev.length % couleurs.length] }]);
      toast("Nouveau salarié ajouté");
    }
    setModal(false);
  };

  const supprimer = (id) => { setSalaries(prev => prev.filter(s => s.id !== id)); toast("Salarié supprimé"); };

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
            <thead>
              <tr>
                <th>Salarié</th><th>Poste</th><th>Contrat</th><th>Entrée</th>
                <th>Salaire brut</th><th>Congés</th><th>Statut</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ background: s.couleur, width: 32, height: 32, fontSize: 12 }}>{initials(s.nom)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.nom}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.poste}</td>
                  <td><span className={`badge ${s.contrat === "CDI" ? "badge-green" : s.contrat === "CDD" ? "badge-amber" : "badge-blue"}`}>{s.contrat}</span></td>
                  <td className="muted">{fmtDate(s.dateEntree)}</td>
                  <td style={{ fontWeight: 600 }}>{s.salaireBrut.toLocaleString("fr-FR")} €</td>
                  <td><span style={{ fontWeight: 600, color: s.soldeConges < 5 ? "var(--accent)" : "var(--green)" }}>{s.soldeConges}j</span></td>
                  <td><span className="badge badge-green">Actif</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => supprimer(s.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={selected ? "Modifier le salarié" : "Nouveau salarié"} onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>Enregistrer</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nom complet</label><input className="form-input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Poste</label><input className="form-input" value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Type de contrat</label>
              <select className="form-input" value={form.contrat} onChange={e => setForm({ ...form, contrat: e.target.value })}>
                {["CDI","CDD","Temps partiel","Alternance","Stage","Bénévole"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Date d'entrée</label><input type="date" className="form-input" value={form.dateEntree} onChange={e => setForm({ ...form, dateEntree: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Salaire brut (€/mois)</label><input type="number" className="form-input" value={form.salaireBrut} onChange={e => setForm({ ...form, salaireBrut: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Solde congés (jours)</label><input type="number" className="form-input" value={form.soldeConges} onChange={e => setForm({ ...form, soldeConges: e.target.value })} /></div>
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
  const [form, setForm] = useState({ salarie: "", type: "Congés payés", debut: "", fin: "", motif: "" });
  const [mois, setMois] = useState(new Date().getMonth());
  const [an, setAn] = useState(new Date().getFullYear());

  const save = () => {
    if (!form.salarie || !form.debut || !form.fin) return;
    const jours = Math.round((new Date(form.fin) - new Date(form.debut)) / 86400000) + 1;
    setConges(prev => [...prev, { ...form, id: Date.now(), jours, statut: "en attente" }]);
    toast("Demande soumise — en attente de validation");
    setModal(false);
    setForm({ salarie: "", type: "Congés payés", debut: "", fin: "", motif: "" });
  };

  const valider = (id) => { setConges(prev => prev.map(c => c.id === id ? { ...c, statut: "approuvé" } : c)); toast("Congé approuvé"); };
  const refuser = (id) => { setConges(prev => prev.map(c => c.id === id ? { ...c, statut: "refusé" } : c)); toast("Congé refusé"); };

  // Calendar logic
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
          {["liste", "calendrier", "soldes"].map(t => <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</div>)}
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
                        <button className="btn btn-green btn-sm" onClick={() => valider(c.id)}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => refuser(c.id)}>✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
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
              return (
                <div key={day} className={`cal-day ${isToday ? "today" : c ? (c.type === "Maladie" ? "absence" : "conge") : ""}`} title={c ? `${c.salarie} — ${c.type}` : ""}>
                  {day}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 12.5, color: "var(--ink-muted)" }}>
            <span><span style={{ background: "var(--accent-soft)", padding: "2px 8px", borderRadius: 4 }}>■</span> Congés payés</span>
            <span><span style={{ background: "var(--amber-soft)", padding: "2px 8px", borderRadius: 4 }}>■</span> Absence/Maladie</span>
          </div>
        </div>
      )}

      {tab === "soldes" && (
        <div className="card">
          <table>
            <thead><tr><th>Salarié</th><th>Contrat</th><th>Solde CP</th><th>Progression</th></tr></thead>
            <tbody>
              {salaries.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ background: s.couleur, width: 28, height: 28, fontSize: 11 }}>{initials(s.nom)}</div>
                      {s.nom}
                    </div>
                  </td>
                  <td><span className={`badge ${s.contrat === "CDI" ? "badge-green" : "badge-amber"}`}>{s.contrat}</span></td>
                  <td style={{ fontWeight: 700, color: s.soldeConges < 5 ? "var(--accent)" : "var(--green)" }}>{s.soldeConges} jours</td>
                  <td style={{ width: 200 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(s.soldeConges / 25) * 100}%`, background: s.couleur }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nouvelle demande de congé" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>Soumettre</button></>}>
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
            <div className="form-group"><label className="form-label">Date de début</label><input type="date" className="form-input" value={form.debut} onChange={e => setForm({ ...form, debut: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Date de fin</label><input type="date" className="form-input" value={form.fin} onChange={e => setForm({ ...form, fin: e.target.value })} /></div>
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
  const [form, setForm] = useState({ salarie: "", date: "", categorie: "Transport", description: "", montant: "" });

  const totalAttente = frais.filter(f => f.statut === "en attente").reduce((s, f) => s + f.montant, 0);
  const totalApprouve = frais.filter(f => f.statut === "approuvé").reduce((s, f) => s + f.montant, 0);

  const save = () => {
    if (!form.salarie || !form.montant || !form.description) return;
    setFrais(prev => [...prev, { ...form, id: Date.now(), montant: Number(form.montant), statut: "en attente", justif: false }]);
    toast("Note de frais soumise");
    setModal(false);
    setForm({ salarie: "", date: "", categorie: "Transport", description: "", montant: "" });
  };

  const valider = (id) => { setFrais(prev => prev.map(f => f.id === id ? { ...f, statut: "approuvé" } : f)); toast("Note approuvée"); };
  const refuser = (id) => { setFrais(prev => prev.map(f => f.id === id ? { ...f, statut: "refusé" } : f)); toast("Note refusée"); };

  const catIcons = { Transport: "🚆", Repas: "🍽️", Fournitures: "📦", Formation: "🎓", Hébergement: "🏨", Autre: "📎" };

  return (
    <div className="page">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{fmt(totalAttente)}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{fmt(totalApprouve)}</div>
          <div className="stat-label">Approuvé ce mois</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-value">{frais.filter(f => f.statut === "en attente").length}</div>
          <div className="stat-label">Notes à traiter</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 className="card-title" style={{ margin: 0 }}>Toutes les notes</h3>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nouvelle note</button>
        </div>
        <table>
          <thead><tr><th>Salarié</th><th>Date</th><th>Catégorie</th><th>Description</th><th>Montant</th><th>Justificatif</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {frais.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 500 }}>{f.salarie}</td>
                <td className="muted">{fmtDate(f.date)}</td>
                <td><span style={{ fontSize: 16 }}>{catIcons[f.categorie] || "📎"}</span> {f.categorie}</td>
                <td className="muted">{f.description}</td>
                <td><span className="frais-amount">{fmt(f.montant)}</span></td>
                <td>{f.justif ? <span className="badge badge-green">✓ Joint</span> : <span className="badge badge-red">Manquant</span>}</td>
                <td><span className={`badge ${f.statut === "approuvé" ? "badge-green" : f.statut === "refusé" ? "badge-red" : "badge-amber"}`}>{f.statut}</span></td>
                <td>
                  {f.statut === "en attente" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-green btn-sm" onClick={() => valider(f.id)}>✓</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => refuser(f.id)}>✕</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Nouvelle note de frais" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>Soumettre</button></>}>
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

// ─── CONTRATS ──────────────────────────────────────────────────────────────────
function Contrats({ salaries, toast }) {
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ salarie: "", modele: "", dateDebut: "", dateFin: "", salaire: "", notes: "" });

  const [contrats, setContrats] = useState([
    { id: 1, salarie: "Sophie Renard", type: "CDI Temps plein", dateDebut: "2019-03-01", dateFin: null, salaire: 3200, statut: "actif" },
    { id: 2, salarie: "Marc Dubois", type: "CDI Temps plein", dateDebut: "2020-09-15", dateFin: null, salaire: 2400, statut: "actif" },
    { id: 3, salarie: "Thomas Leroy", type: "CDD 6 mois", dateDebut: "2023-06-01", dateFin: "2025-12-31", salaire: 1950, statut: "actif" },
    { id: 4, salarie: "Lucie Perrot", type: "Contrat d'apprentissage", dateDebut: "2024-09-01", dateFin: "2026-08-31", salaire: 1100, statut: "actif" },
  ]);

  const save = () => {
    if (!form.salarie || !form.modele) return;
    setContrats(prev => [...prev, { ...form, id: Date.now(), type: form.modele, statut: "actif", salaire: Number(form.salaire) }]);
    toast("Contrat généré");
    setModal(false);
  };

  return (
    <div className="page">
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Modèles disponibles</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CONTRATS_MODELES.map(c => (
              <div key={c.id} className="contrat-card">
                <div className="contrat-icon">{c.icon}</div>
                <div className="contrat-info">
                  <h4>{c.nom}</h4>
                  <p>{c.desc}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { setForm({ ...form, modele: c.nom }); setModal(true); }}>Utiliser</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Contrats en cours</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contrats.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--surface-2)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{c.salarie}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{c.type} · depuis le {fmtDate(c.dateDebut)}</div>
                  {c.dateFin && <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 2 }}>Fin : {fmtDate(c.dateFin)}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.salaire.toLocaleString("fr-FR")} €</div>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>Actif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <Modal title="Générer un contrat" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>Générer le contrat</button></>}>
          <div style={{ background: "var(--blue-soft)", border: "1px solid var(--blue)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--blue)" }}>
            📋 Modèle sélectionné : <strong>{form.modele}</strong>
          </div>
          <div className="form-group"><label className="form-label">Salarié</label>
            <select className="form-input" value={form.salarie} onChange={e => setForm({ ...form, salarie: e.target.value })}>
              <option value="">Sélectionner...</option>
              {salaries.map(s => <option key={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date de début</label><input type="date" className="form-input" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Date de fin (CDD)</label><input type="date" className="form-input" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Salaire brut mensuel (€)</label><input type="number" className="form-input" value={form.salaire} onChange={e => setForm({ ...form, salaire: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Notes particulières</label><input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Clauses spécifiques, avantages..." /></div>
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
    const brut = s.salaireBrut;
    const cotSal = Math.round(brut * 0.22 * 100) / 100;
    const cotPat = Math.round(brut * 0.42 * 100) / 100;
    const net = Math.round((brut - cotSal) * 100) / 100;
    const netVerse = Math.round(net * 100) / 100;
    return { brut, cotSal, cotPat, net, netVerse };
  };

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (mois === 0) { setMois(11); setAn(an - 1); } else setMois(mois - 1); }}>← Mois préc.</button>
        <div style={{ fontFamily: "DM Serif Display", fontSize: 20, flex: 1, textAlign: "center" }}>{MOIS[mois]} {an}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (mois === 11) { setMois(0); setAn(an + 1); } else setMois(mois + 1); }}>Mois suiv. →</button>
      </div>

      {!selected ? (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Bulletins de paie — {MOIS[mois]} {an}</h3>
            <button className="btn btn-primary" onClick={() => toast("Génération de tous les bulletins...")}>Générer tous les bulletins</button>
          </div>
          <table>
            <thead><tr><th>Salarié</th><th>Poste</th><th>Salaire brut</th><th>Cotisations sal.</th><th>Net à payer</th><th></th></tr></thead>
            <tbody>
              {salaries.map(s => {
                const p = calcPaie(s);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar" style={{ background: s.couleur, width: 28, height: 28, fontSize: 11 }}>{initials(s.nom)}</div>
                        <span style={{ fontWeight: 500 }}>{s.nom}</span>
                      </div>
                    </td>
                    <td className="muted">{s.poste}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(p.brut)}</td>
                    <td style={{ color: "var(--accent)" }}>−{fmt(p.cotSal)}</td>
                    <td style={{ fontWeight: 700, color: "var(--green)", fontSize: 15 }}>{fmt(p.netVerse)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}>👁 Voir</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => toast(`Bulletin ${s.nom} téléchargé`)}>⬇ PDF</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSelected(null)}>← Retour à la liste</button>
          <div className="card" style={{ maxWidth: 600, margin: "0 auto", padding: 0, overflow: "hidden" }}>
            <div className="paie-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "DM Serif Display", fontSize: 22, marginBottom: 4 }}>Bulletin de Paie</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>{MOIS[mois]} {an}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "DM Serif Display", fontSize: 18 }}>Asso<span style={{ color: "var(--accent)" }}>PIE</span></div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Association loi 1901</div>
                </div>
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.nom}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{selected.poste} · {selected.contrat}</div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>Entrée le {fmtDate(selected.dateEntree)}</div>
              </div>
            </div>
            <div className="paie-body">
              {(() => {
                const p = calcPaie(selected);
                return (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Rémunération</div>
                    <div className="paie-line"><span>Salaire de base</span><span style={{ fontWeight: 600 }}>{fmt(p.brut)}</span></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "16px 0 12px" }}>Cotisations salariales</div>
                    <div className="paie-line"><span>Assurance maladie</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.007)}</span></div>
                    <div className="paie-line"><span>Retraite de base (AGIRC-ARRCO)</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.069)}</span></div>
                    <div className="paie-line"><span>Chômage</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.024)}</span></div>
                    <div className="paie-line"><span>CSG/CRDS</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.098)}</span></div>
                    <div className="paie-line"><span>Prévoyance & mutuelle</span><span style={{ color: "var(--accent)" }}>−{fmt(p.brut * 0.022)}</span></div>
                    <div className="paie-total">
                      <span>Net à payer</span>
                      <span style={{ color: "var(--green)" }}>{fmt(p.netVerse)}</span>
                    </div>
                    <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--surface)", borderRadius: 8, fontSize: 12, color: "var(--ink-muted)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span>Coût total employeur</span>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{fmt(p.brut + p.cotPat)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Solde congés payés</span>
                        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{selected.soldeConges} jours</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
            <button className="btn btn-primary" onClick={() => toast(`Bulletin ${selected.nom} téléchargé`)}>⬇ Télécharger PDF</button>
            <button className="btn btn-secondary" onClick={() => toast(`Bulletin envoyé à ${selected.email}`)}>📧 Envoyer par email</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [salaries, setSalaries] = useState(SALARIES_INIT);
  const [conges, setConges] = useState(CONGES_INIT);
  const [frais, setFrais] = useState(FRAIS_INIT);
  const [toastMsg, setToastMsg] = useState(null);
  const [role, setRole] = useState("admin"); // admin | salarie

  const toast = (msg) => setToastMsg(msg);

  const enAttente = conges.filter(c => c.statut === "en attente").length;
  const fraisAttente = frais.filter(f => f.statut === "en attente").length;

  const nav = [
    { id: "dashboard", label: "Tableau de bord", icon: "◉", section: null },
    { id: "salaries", label: "Salariés", icon: "👥", section: "RH" },
    { id: "conges", label: "Congés & Absences", icon: "🌴", section: "RH", badge: enAttente },
    { id: "contrats", label: "Contrats", icon: "📄", section: "RH" },
    { id: "paie", label: "Fiches de paie", icon: "💶", section: "Paie" },
    { id: "frais", label: "Notes de frais", icon: "🧾", section: "Paie", badge: fraisAttente },
  ];

  const sections = [...new Set(nav.map(n => n.section))];

  const titles = {
    dashboard: { title: "Tableau de bord", sub: `${salaries.length} salariés actifs` },
    salaries: { title: "Salariés", sub: `${salaries.length} membres dans l'équipe` },
    conges: { title: "Congés & Absences", sub: `${enAttente} demande${enAttente > 1 ? "s" : ""} en attente` },
    contrats: { title: "Contrats", sub: "Gestion et génération de contrats" },
    paie: { title: "Fiches de paie", sub: "Bulletins mensuels" },
    frais: { title: "Notes de frais", sub: `${fraisAttente} note${fraisAttente > 1 ? "s" : ""} à traiter` },
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>Asso<span>RH</span></h1>
            <p>Gestion des ressources humaines</p>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">SR</div>
            <div className="user-info">
              <p>Sophie Renard</p>
              <span>{role === "admin" ? "Administratrice" : "Salarié·e"}</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {sections.map(section => (
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
            <div style={{ padding: "12px 12px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Mode</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["admin","salarie"].map(r => (
                  <button key={r} className={`btn btn-sm ${role === r ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1, fontSize: 11, color: role !== r ? "rgba(255,255,255,0.4)" : undefined }} onClick={() => setRole(r)}>
                    {r === "admin" ? "Admin" : "Salarié"}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="main">
          <header className="topbar">
            <div className="topbar-title">
              <h2>{titles[page].title}</h2>
              <p>{titles[page].sub}</p>
            </div>
            <div className="topbar-actions">
              <span style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </header>

          {page === "dashboard" && <Dashboard salaries={salaries} conges={conges} frais={frais} />}
          {page === "salaries" && <Salaries salaries={salaries} setSalaries={setSalaries} toast={toast} />}
          {page === "conges" && <Conges conges={conges} setConges={setConges} salaries={salaries} toast={toast} />}
          {page === "contrats" && <Contrats salaries={salaries} toast={toast} />}
          {page === "paie" && <FichesPaie salaries={salaries} toast={toast} />}
          {page === "frais" && <NotesFrais frais={frais} setFrais={setFrais} salaries={salaries} toast={toast} />}
        </main>
      </div>

      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
    </>
  );
}
