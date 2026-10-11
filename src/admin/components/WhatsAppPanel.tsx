import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Trash2, Paperclip, X, UserPlus } from "lucide-react";
import "./WhatsAppPanel.css";

const API = import.meta.env.VITE_WA_API || "http://localhost:4000/api/whatsapp";

type Contact = { _id: string; phone: string; name: string; optOut: boolean; lastStatus: string };
type Status = { running: boolean; total: number; done: number; sent: number; failed: number };

export default function WhatsAppPanel() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const r = await fetch(`${API}/contacts`);
    setContacts(await r.json());
  };

  useEffect(() => {
    load().catch(() => setMsg("Serveur WhatsApp injoignable (node whatsapp/app.js est-il lancé ?)"));
  }, []);

  // Suivi de l'envoi en cours
  useEffect(() => {
    if (!status?.running) return;
    const t = setInterval(async () => {
      const s: Status = await (await fetch(`${API}/status`)).json();
      setStatus(s);
      if (!s.running) load();
    }, 2000);
    return () => clearInterval(t);
  }, [status?.running]);

  const sendable = contacts.filter((c) => !c.optOut);
  const allSelected = sendable.length > 0 && sendable.every((c) => selected.has(c._id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(sendable.map((c) => c._id)));

  const post = async (list: { phone: string; name?: string }[]) => {
    const r = await fetch(`${API}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts: list }),
    });
    const d = await r.json();
    setMsg(`${d.added} ajouté(s), ${d.ignored} ignoré(s) (doublon ou numéro invalide)`);
    load();
  };

  const addOne = async () => {
    if (!phone.trim()) return;
    await post([{ phone, name }]);
    setPhone("");
    setName("");
  };

  const importBulk = async () => {
    const list = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [p, ...rest] = l.split(/[,;\t]/);
        return { phone: p, name: rest.join(" ").trim() };
      });
    if (!list.length) return;
    await post(list);
    setBulk("");
  };

  const remove = async (id: string) => {
    await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    load();
  };

  const send = async () => {
    if (!selected.size) return setMsg("Sélectionne au moins un contact.");
    if (!text.trim() && !media) return setMsg("Écris un message ou ajoute un média.");
    if (!confirm(`Envoyer à ${selected.size} contact(s) ?`)) return;

    const fd = new FormData();
    fd.append("text", text);
    fd.append("ids", JSON.stringify([...selected]));
    if (media) fd.append("media", media);

    const r = await fetch(`${API}/send`, { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || "Erreur d'envoi");
    setMsg("");
    setStatus({ running: true, total: d.total, done: 0, sent: 0, failed: 0 });
  };

  const pct = status?.total ? (status.done / status.total) * 100 : 0;

  return (
    <section className="wa-panel">
      <header className="wa-head">
        <span className="wa-head-icon"><MessageCircle size={20} aria-hidden="true" /></span>
        <div>
          <h1>Messages WhatsApp</h1>
          <p>Envoyer un message à plusieurs clients à la fois</p>
        </div>
      </header>

      {msg && <p className="wa-msg" role="status">{msg}</p>}

      <div className="wa-card">
        <h2>Ajouter un contact</h2>
        <div className="wa-row">
          <input className="wa-input" placeholder="Numéro avec indicatif (ex. 33612345678)"
            value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Numéro de téléphone" />
          <input className="wa-input" placeholder="Nom (facultatif)"
            value={name} onChange={(e) => setName(e.target.value)} aria-label="Nom du contact" />
          <button type="button" className="wa-btn" onClick={addOne}>
            <UserPlus size={16} aria-hidden="true" /> Ajouter
          </button>
        </div>
        <details className="wa-details">
          <summary>Importer plusieurs numéros</summary>
          <textarea className="wa-input wa-textarea"
            placeholder={"Un contact par ligne :\n33612345678, Marie\n237695766808"}
            value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <button type="button" className="wa-btn" onClick={importBulk}>Importer</button>
        </details>
      </div>

      <div className="wa-card">
        <div className="wa-card-top">
          <h2>Contacts ({contacts.length})</h2>
          <label className="wa-check">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} /> Tout sélectionner
          </label>
        </div>
        <ul className="wa-list">
          {contacts.map((c) => (
            <li key={c._id} className={`wa-contact ${c.optOut ? "is-off" : ""}`}>
              <input type="checkbox" disabled={c.optOut} checked={selected.has(c._id)}
                onChange={() => toggle(c._id)} aria-label={`Sélectionner ${c.name || c.phone}`} />
              <span className="wa-contact-text">
                <strong>{c.name || "Sans nom"}</strong>
                <small>{c.phone}{c.optOut && " · désabonné"}</small>
              </span>
              {c.lastStatus && (
                <span className={`wa-badge ${c.lastStatus === "failed" ? "is-fail" : "is-ok"}`}>
                  {c.lastStatus === "sent" ? "envoyé" : "échec"}
                </span>
              )}
              <button type="button" className="wa-icon-btn" onClick={() => remove(c._id)}
                aria-label={`Supprimer ${c.name || c.phone}`}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
          {!contacts.length && <li className="wa-empty">Aucun contact pour le moment.</li>}
        </ul>
      </div>

      <div className="wa-card">
        <h2>Message</h2>
        <textarea className="wa-input wa-textarea" placeholder="Bonjour {prenom}, ..."
          value={text} onChange={(e) => setText(e.target.value)} aria-label="Texte du message" />
        <small className="wa-hint">
          {"{prenom}"} est remplacé par le nom du contact (vide s'il n'y en a pas).
        </small>

        <div className="wa-row wa-media">
          <input ref={fileRef} type="file" accept="image/*,video/*" hidden
            onChange={(e) => setMedia(e.target.files?.[0] || null)} />
          <button type="button" className="wa-btn is-ghost" onClick={() => fileRef.current?.click()}>
            <Paperclip size={16} aria-hidden="true" /> Image ou vidéo (facultatif)
          </button>
          {media && (
            <span className="wa-file">
              {media.name}
              <button type="button" className="wa-icon-btn" aria-label="Retirer le fichier"
                onClick={() => { setMedia(null); if (fileRef.current) fileRef.current.value = ""; }}>
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          )}
        </div>

        <button type="button" className="wa-btn is-primary" disabled={status?.running} onClick={send}>
          <Send size={16} aria-hidden="true" /> Envoyer à {selected.size} contact(s)
        </button>
      </div>

      {status && (
        <div className="wa-card">
          <strong>{status.running ? "Envoi en cours…" : "Envoi terminé"}</strong>
          <div className="wa-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="wa-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <small>{status.done}/{status.total} · {status.sent} envoyés · {status.failed} échecs</small>
        </div>
      )}
    </section>
  );
}