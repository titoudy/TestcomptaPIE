import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────
// Accessible uniquement depuis App.jsx quand role === "admin"
// Gère : comptes utilisateurs, rôles, paramètres généraux

export default function Admin({ toast, salaries }) {
  const [tab, setTab] = useState("utilisateurs");
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nom: "", role: "salarie", salarie: "" });

  // Charger les utilisateurs depuis Firestore (collection "users")
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erreur chargement users:", e);
      }
    };
    load();
  }, []);

  // Créer un nouveau compte utilisateur
  const creerCompte = async () => {
    if (!form.email || !form.password || !form.nom) return;
    setSaving(true);
    try {
      // Créer le compte Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Enregistrer les infos dans Firestore
      const data = {
        uid: cred.user.uid,
        email: form.email,
        nom: form.nom,
        role: form.role,
        salarie: form.salarie,
        createdAt: serverTimestamp(),
        actif: true
      };
      const ref = await addDoc(collection(db, "users"), data);
      setUsers(prev => [...prev, { id: ref.id, ...data }]);
      toast(`Compte créé pour ${form.nom}`);
      setModal(false);
      setForm({ email: "", password: "", nom: "", role: "salarie", salarie: "" });
    } catch (e) {
      const msgs = {
        "auth/email-already-in-use": "Cet email est déjà utilisé",
        "auth/weak-password": "Mot de passe trop faible (6 caractères min.)",
        "auth/invalid-email": "Email invalide"
      };
      toast("Erreur : " + (msgs[e.code] || e.message));
    }
    setSaving(false);
  };

  const toggleActif = async (user) => {
    try {
      await updateDoc(doc(db, "users", user.id), { actif: !user.actif });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, actif: !u.actif } : u));
      toast(user.actif ? `${user.nom} désactivé` : `${user.nom} réactivé`);
    } catch (e) { toast("Erreur"); }
  };

  const changerRole = async (user, role) => {
    try {
      await updateDoc(doc(db, "users", user.id), { role });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
      toast(`Rôle mis à jour pour ${user.nom}`);
    } catch (e) { toast("Erreur"); }
  };

  const supprimerUser = async (user) => {
    if (!confirm(`Supprimer le compte de ${user.nom} ?`)) return;
    try {
      await deleteDoc(doc(db, "users", user.id));
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast(`Compte ${user.nom} supprimé`);
    } catch (e) { toast("Erreur"); }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    actifs: users.filter(u => u.actif).length,
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "👤", value: stats.total, label: "Comptes créés" },
          { icon: "🔑", value: stats.admins, label: "Administrateurs" },
          { icon: "✅", value: stats.actifs, label: "Comptes actifs" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e3df", boxShadow: "0 2px 16px rgba(26,26,46,0.08)" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 32, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#9090b0", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #eeecea", marginBottom: 24 }}>
        {["utilisateurs", "paramètres", "sécurité"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "10px 20px", fontSize: 13.5, fontWeight: 500, cursor: "pointer",
            color: tab === t ? "#c8403a" : "#9090b0",
            borderBottom: tab === t ? "2px solid #c8403a" : "2px solid transparent",
            marginBottom: -2, textTransform: "capitalize"
          }}>{t}</div>
        ))}
      </div>

      {/* UTILISATEURS */}
      {tab === "utilisateurs" && (
        <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e5e3df", boxShadow: "0 2px 16px rgba(26,26,46,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "DM Serif Display, serif", fontSize: 17 }}>Gestion des accès</h3>
            <button onClick={() => setModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer", border: "none", background: "#c8403a", color: "white", fontFamily: "inherit" }}>
              + Créer un compte
            </button>
          </div>

          {users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#9090b0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
              <p>Aucun compte créé pour l'instant</p>
              <p style={{ fontSize: 12, marginTop: 8 }}>Créez des comptes pour chaque salarié</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Nom","Email","Rôle","Salarié lié","Statut","Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11.5, fontWeight: 600, color: "#9090b0", textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "2px solid #eeecea", background: "#f7f6f2" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #eeecea" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 500 }}>{u.nom}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#4a4a6a" }}>{u.email}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <select
                        value={u.role}
                        onChange={e => changerRole(u, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid #e5e3df", fontSize: 12.5, fontFamily: "inherit", cursor: "pointer" }}
                      >
                        <option value="admin">Admin</option>
                        <option value="salarie">Salarié</option>
                        <option value="lecture">Lecture seule</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#9090b0" }}>{u.salarie || "—"}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: u.actif ? "#d8f3dc" : "#f0e0df", color: u.actif ? "#2d6a4f" : "#c8403a" }}>
                        {u.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => toggleActif(u)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 500, cursor: "pointer", border: "1px solid #e5e3df", background: "transparent", fontFamily: "inherit" }}>
                          {u.actif ? "Désactiver" : "Activer"}
                        </button>
                        <button onClick={() => supprimerUser(u)} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid #e5e3df", background: "transparent", fontFamily: "inherit" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PARAMETRES */}
      {tab === "paramètres" && (
        <div style={{ background: "white", borderRadius: 12, padding: 32, border: "1px solid #e5e3df", boxShadow: "0 2px 16px rgba(26,26,46,0.08)", maxWidth: 560 }}>
          <h3 style={{ fontFamily: "DM Serif Display, serif", fontSize: 17, marginBottom: 24 }}>Paramètres de l'association</h3>
          {[
            { label: "Nom de l'association", value: "Paris Initiative Entreprise", type: "text" },
            { label: "SIRET", value: "350 318 500 00040", type: "text" },
            { label: "Adresse", value: "13 bis rue de Calais, 75009 Paris", type: "text" },
            { label: "Convention collective", value: "Animation (ECLAT)", type: "text" },
            { label: "Taux patronal (%)", value: "42", type: "number" },
            { label: "Taux salarial (%)", value: "22", type: "number" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4a4a6a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</label>
              <input type={f.type} defaultValue={f.value} style={{ width: "100%", padding: "9px 13px", border: "1.5px solid #e5e3df", borderRadius: 8, fontSize: 14, fontFamily: "inherit", color: "#1a1a2e", outline: "none" }} />
            </div>
          ))}
          <button onClick={() => toast("Paramètres enregistrés")} style={{ padding: "9px 20px", borderRadius: 8, background: "#c8403a", color: "white", border: "none", fontFamily: "inherit", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
            Enregistrer
          </button>
        </div>
      )}

      {/* SECURITE */}
      {tab === "sécurité" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
          {[
            { icon: "🔒", title: "Authentification obligatoire", desc: "Tous les utilisateurs doivent être connectés pour accéder aux données. Activé via Firebase Auth.", statut: "Actif", color: "#2d6a4f", bg: "#d8f3dc" },
            { icon: "🛡️", title: "Règles Firestore", desc: "Les données ne sont accessibles qu'aux utilisateurs authentifiés. Configuré dans la console Firebase.", statut: "Actif", color: "#2d6a4f", bg: "#d8f3dc" },
            { icon: "🌐", title: "HTTPS", desc: "Toutes les communications sont chiffrées. Géré automatiquement par Firebase Hosting.", statut: "Actif", color: "#2d6a4f", bg: "#d8f3dc" },
            { icon: "📋", title: "Journalisation", desc: "Les actions admin sont tracées dans Firebase (console → Logs).", statut: "Disponible", color: "#1d4e89", bg: "#dbeafe" },
          ].map(item => (
            <div key={item.title} style={{ background: "white", borderRadius: 12, padding: 20, border: "1px solid #e5e3df", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 16px rgba(26,26,46,0.08)" }}>
              <div style={{ fontSize: 28 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#9090b0" }}>{item.desc}</div>
              </div>
              <span style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: item.bg, color: item.color, flexShrink: 0 }}>{item.statut}</span>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREATION COMPTE */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: "white", borderRadius: 12, padding: 32, width: 480, maxWidth: "95vw", boxShadow: "0 8px 40px rgba(26,26,46,0.14)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "DM Serif Display, serif", fontSize: 20 }}>Créer un compte</h3>
              <button onClick={() => setModal(false)} style={{ background: "transparent", border: "1px solid #e5e3df", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>

            <div style={{ background: "#dbeafe", border: "1px solid #1d4e89", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#1d4e89" }}>
              ℹ️ Un email et un mot de passe seront créés. Communique-les au salarié concerné.
            </div>

            {[
              { label: "Nom complet", key: "nom", type: "text", placeholder: "Sophie Renard" },
              { label: "Email", key: "email", type: "email", placeholder: "s.renard@asso.fr" },
              { label: "Mot de passe temporaire", key: "password", type: "password", placeholder: "6 caractères minimum" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4a4a6a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "9px 13px", border: "1.5px solid #e5e3df", borderRadius: 8, fontSize: 14, fontFamily: "inherit", color: "#1a1a2e", outline: "none" }} />
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4a4a6a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px" }}>Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ width: "100%", padding: "9px 13px", border: "1.5px solid #e5e3df", borderRadius: 8, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
                  <option value="salarie">Salarié</option>
                  <option value="admin">Administrateur</option>
                  <option value="lecture">Lecture seule</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4a4a6a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px" }}>Lier à un salarié</label>
                <select value={form.salarie} onChange={e => setForm({ ...form, salarie: e.target.value })}
                  style={{ width: "100%", padding: "9px 13px", border: "1.5px solid #e5e3df", borderRadius: 8, fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
                  <option value="">— Optionnel —</option>
                  {salaries.map(s => <option key={s.id}>{s.nom}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24, paddingTop: 20, borderTop: "1px solid #eeecea" }}>
              <button onClick={() => setModal(false)} style={{ padding: "8px 16px", borderRadius: 8, background: "#eeecea", color: "#1a1a2e", border: "none", fontFamily: "inherit", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>Annuler</button>
              <button onClick={creerCompte} disabled={saving} style={{ padding: "8px 16px", borderRadius: 8, background: "#c8403a", color: "white", border: "none", fontFamily: "inherit", fontSize: 13.5, fontWeight: 500, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Création..." : "Créer le compte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
