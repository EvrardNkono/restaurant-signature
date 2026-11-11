// src/admin/pages/Reservations.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  CalendarCheck, Check, X, Phone, Mail, MessageCircle, Users, Clock,
  Trash2, Volume2, VolumeX, StickyNote, RotateCcw,
} from "lucide-react";
import "./Reservations.css";

/* ── Config ───────────────────────────────────────────────── */
const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

type Status = "pending" | "confirmed" | "declined";
interface Resa {
  _id: string; date: string; time: string; guests: number;
  name: string; phone: string; email?: string; notes?: string;
  status: Status; createdAt: string;
}

const FILTERS: { id: Status; label: string }[] = [
  { id: "pending", label: "À confirmer" },
  { id: "confirmed", label: "Confirmées" },
  { id: "declined", label: "Refusées" },
];

/* ── Helpers ──────────────────────────────────────────────── */
const localISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const dayLabel = (date: string) => {
  const t = new Date();
  const tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  if (date === localISO(t)) return "Aujourd'hui";
  if (date === localISO(tomorrow)) return "Demain";
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

const timeAgo = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (min < 1440) return `il y a ${Math.round(min / 60)} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

// 06 12 34 56 78 → 33612345678 (format attendu par wa.me)
const waNumber = (phone: string) => {
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d.slice(1);
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `33${d.slice(1)}`;
  return d;
};

const messageFor = (r: Resa) => {
  const when = `${dayLabel(r.date).toLowerCase()} à ${r.time}`;
  const pers = `${r.guests} personne${r.guests > 1 ? "s" : ""}`;
  return r.status === "confirmed"
    ? `Bonjour ${r.name}, votre réservation chez Signature est confirmée : ${pers}, ${when}. À très bientôt !`
    : `Bonjour ${r.name}, nous sommes désolés, nous ne pouvons pas vous accueillir ${when}. Vous pouvez choisir un autre créneau sur notre site ou nous appeler.`;
};

// Petit bip sans fichier audio (le navigateur exige un clic préalable sur la page)
const beep = () => {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1100].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 0.4);
    });
  } catch { /* son indisponible : on ignore */ }
};

/* ─────────────────────────────────────────────────────────── */
export default function Reservations() {
  const [list, setList] = useState<Resa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Status>("pending");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [soundOn, setSoundOn] = useState(localStorage.getItem("rsv_sound") !== "off");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const knownIds = useRef<Set<string> | null>(null);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchList = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_API}/reservations`);
      const data: Resa[] = res.data.data || [];

      // Nouvelle demande détectée → bip + message (pas au premier chargement)
      const pendingIds = data.filter((r) => r.status === "pending").map((r) => r._id);
      if (knownIds.current) {
        const fresh = data.filter((r) => r.status === "pending" && !knownIds.current!.has(r._id));
        if (fresh.length) {
          if (soundOn) beep();
          showToast(`📅 Nouvelle réservation : ${fresh[0].name} (${fresh[0].guests} pers.)`);
        }
      }
      knownIds.current = new Set(pendingIds);

      setList(data);
      setError("");
    } catch {
      setError("Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  }, [soundOn]);

  useEffect(() => {
    fetchList();
    const id = setInterval(fetchList, 15000); // même rythme que la page Commandes
    return () => clearInterval(id);
  }, [fetchList]);

  const counts = useMemo(() => ({
    pending: list.filter((r) => r.status === "pending").length,
    confirmed: list.filter((r) => r.status === "confirmed").length,
    declined: list.filter((r) => r.status === "declined").length,
  }), [list]);

  // Titre de l'onglet : (2) Réservations
  useEffect(() => {
    document.title = counts.pending ? `(${counts.pending}) Réservations` : "Réservations";
    return () => { document.title = "Signature"; };
  }, [counts.pending]);

  const grouped = useMemo(() => {
    const items = list.filter((r) => r.status === filter);
    const map = new Map<string, Resa[]>();
    items.forEach((r) => map.set(r.date, [...(map.get(r.date) || []), r]));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [list, filter]);

  const setStatus = async (r: Resa, status: Status) => {
    setBusy((b) => new Set(b).add(r._id));
    const previous = list;
    setList((l) => l.map((x) => (x._id === r._id ? { ...x, status } : x))); // mise à jour immédiate
    try {
      await axios.patch(`${BASE_API}/reservations/${r._id}/status`, { status });
      window.dispatchEvent(new Event("reservations:changed"));
      if (status === "confirmed") { setFilter("confirmed"); showToast("✅ Confirmée — prévenez le client avec les boutons ci-dessous"); }
      if (status === "declined") { setFilter("declined"); showToast("Refusée — prévenez le client avec les boutons ci-dessous"); }
    } catch {
      setList(previous);
      showToast("❌ Action impossible, réessayez", "err");
    } finally {
      setBusy((b) => { const n = new Set(b); n.delete(r._id); return n; });
    }
  };

  const remove = async (r: Resa) => {
    if (!window.confirm(`Supprimer la réservation de ${r.name} ?`)) return;
    try {
      await axios.delete(`${BASE_API}/reservations/${r._id}`);
      setList((l) => l.filter((x) => x._id !== r._id));
    } catch { showToast("❌ Suppression impossible", "err"); }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("rsv_sound", next ? "on" : "off");
    if (next) beep(); // aussi utile : ce clic autorise le son dans le navigateur
  };

  /* ── Rendu ──────────────────────────────────────────────── */
  const card = (r: Resa) => {
    const isBusy = busy.has(r._id);
    const msg = encodeURIComponent(messageFor(r));
    return (
      <article key={r._id} className={`rsv-card rsv-${r.status}`}>
        <div className="rsv-time"><Clock size={15} /> {r.time}</div>
        <div className="rsv-main">
          <h3>{r.name}</h3>
          <div className="rsv-meta">
            <span><Users size={14} /> {r.guests} personne{r.guests > 1 ? "s" : ""}</span>
            <a href={`tel:${r.phone}`}><Phone size={14} /> {r.phone}</a>
            <span className="rsv-ago">reçue {timeAgo(r.createdAt)}</span>
          </div>
          {r.notes && <p className="rsv-notes"><StickyNote size={14} /> {r.notes}</p>}

          {r.status === "pending" && (
            <div className="rsv-actions">
              <button className="rsv-btn rsv-ok" disabled={isBusy} onClick={() => setStatus(r, "confirmed")}>
                <Check size={16} /> Confirmer
              </button>
              <button className="rsv-btn rsv-no" disabled={isBusy} onClick={() => setStatus(r, "declined")}>
                <X size={16} /> Refuser
              </button>
              <a className="rsv-btn rsv-ghost" href={`tel:${r.phone}`}><Phone size={16} /> Appeler</a>
            </div>
          )}

          {r.status !== "pending" && (
            <div className="rsv-actions">
              <a className="rsv-btn rsv-wa" target="_blank" rel="noreferrer"
                 href={`https://wa.me/${waNumber(r.phone)}?text=${msg}`}>
                <MessageCircle size={16} /> Prévenir par WhatsApp
              </a>
              {r.email && (
                <a className="rsv-btn rsv-ghost"
                   href={`mailto:${r.email}?subject=${encodeURIComponent("Votre réservation — Signature")}&body=${msg}`}>
                  <Mail size={16} /> E-mail
                </a>
              )}
              <button className="rsv-btn rsv-ghost" disabled={isBusy} onClick={() => setStatus(r, "pending")} title="Remettre à confirmer">
                <RotateCcw size={16} />
              </button>
              <button className="rsv-btn rsv-ghost rsv-del" onClick={() => remove(r)} title="Supprimer">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="rsv-page">
      <header className="rsv-head">
        <div>
          <h1><CalendarCheck size={24} /> Réservations</h1>
          <p>Les demandes du site arrivent ici et par notification.</p>
        </div>
        <button className="rsv-sound" onClick={toggleSound} aria-pressed={soundOn}>
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {soundOn ? "Son activé" : "Son coupé"}
        </button>
      </header>

      <div className="rsv-tabs" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id}
            className={`rsv-tab ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}
            <span className={`rsv-count ${f.id === "pending" && counts.pending ? "alert" : ""}`}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="rsv-empty">Chargement…</p>
      ) : error ? (
        <p className="rsv-empty">{error}</p>
      ) : grouped.length === 0 ? (
        <p className="rsv-empty">
          {filter === "pending" ? "Aucune demande à confirmer. 🎉" : "Rien à afficher ici pour le moment."}
        </p>
      ) : (
        grouped.map(([date, items]) => (
          <section key={date} className="rsv-day">
            <h2>{dayLabel(date)} <small>{items.reduce((n, r) => n + r.guests, 0)} couverts</small></h2>
            <div className="rsv-list">{items.map(card)}</div>
          </section>
        ))
      )}

      {toast && <div className={`rsv-toast ${toast.kind}`} role="status">{toast.msg}</div>}
    </div>
  );
}
