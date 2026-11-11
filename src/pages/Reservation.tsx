import { useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock, Users, Loader2, Check, Phone } from "lucide-react";
import "./reservation.css";

const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

// ─── RÈGLES D'OUVERTURE (reprises de menu.tsx — à ajuster) ───
const CLOSED_DAYS: number[] = []; // 0 = dimanche … 6 = samedi. Ex: [1] si fermé le lundi
const MAX_ONLINE_GUESTS = 10;
const LAST_SEATING_MINUTES_BEFORE_CLOSE = 60;

const slotsBetween = (from: string, to: string) => {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const out: string[] = [];
  for (let m = toMin(from); m <= toMin(to); m += 30) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
};

const getSlots = (dateStr: string) => {
  if (!dateStr) return [];
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  if (CLOSED_DAYS.includes(day)) return [];
  // Week-end : service continu 12h–23h. Semaine : 12h–15h et 18h–23h.
  const slots =
    day === 0 || day === 6
      ? slotsBetween("12:00", "22:00")
      : [...slotsBetween("12:00", "14:00"), ...slotsBetween("18:00", "22:00")];

  // Pas de créneau passé pour aujourd'hui (+1h de préavis)
  const today = localISO();
  if (dateStr === today) {
    const now = new Date();
    const limit = now.getHours() * 60 + now.getMinutes() + 60;
    return slots.filter((s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3)) >= limit);
  }
  return slots;
};

const localISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayISO = () => localISO();

export default function Reservation() {
  const [form, setForm] = useState({
    date: "", time: "", guests: 2, name: "", phone: "", email: "", notes: "",
    consent: false, website: "", // "website" = champ piège anti-spam
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const slots = useMemo(() => getSlots(form.date), [form.date]);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.time) return setError("Choisissez un créneau horaire.");
    if (!form.consent) return setError("Merci d'accepter le traitement de vos données.");
    setStatus("sending");
    try {
      await axios.post(`${BASE_URL}/reservations`, form);
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.message || "Envoi impossible. Appelez-nous directement.");
    }
  };

  if (status === "done") {
    return (
      <section className="resa-page">
        <div className="resa-card resa-done">
          <div className="resa-done-icon"><Check size={28} /></div>
          <h1>Demande envoyée</h1>
          <p>
            {form.guests} couvert{form.guests > 1 ? "s" : ""} le{" "}
            {new Date(`${form.date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}{" "}
            à {form.time}.
          </p>
          <p className="resa-muted">
            Nous vous confirmons la réservation par téléphone ou par message au {form.phone}.
            La table n'est réservée qu'après notre confirmation.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="resa-page">
      <form className="resa-card" onSubmit={submit} noValidate={false}>
        <h1 className="resa-title">Réserver une table</h1>
        <p className="resa-muted">Signature · Melun. Nous confirmons chaque demande par téléphone ou message.</p>

        <div className="resa-grid">
          <label className="resa-field">
            <span><CalendarDays size={14} /> Date</span>
            <input type="date" required min={todayISO()} value={form.date}
              onChange={(e) => { set("date", e.target.value); set("time", ""); }} />
          </label>

          <label className="resa-field">
            <span><Users size={14} /> Couverts</span>
            <select value={form.guests} onChange={(e) => set("guests", Number(e.target.value))}>
              {Array.from({ length: MAX_ONLINE_GUESTS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} personne{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="resa-hint">Plus de {MAX_ONLINE_GUESTS} personnes ? Appelez-nous.</p>

        <div className="resa-field">
          <span><Clock size={14} /> Horaire</span>
          {!form.date ? (
            <p className="resa-muted">Choisissez d'abord une date.</p>
          ) : slots.length === 0 ? (
            <p className="resa-muted">Aucun créneau disponible ce jour-là. Essayez une autre date.</p>
          ) : (
            <div className="resa-slots" role="radiogroup" aria-label="Horaire">
              {slots.map((s) => (
                <button type="button" key={s} role="radio" aria-checked={form.time === s}
                  className={`resa-slot ${form.time === s ? "active" : ""}`}
                  onClick={() => set("time", s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="resa-grid">
          <label className="resa-field">
            <span>Nom</span>
            <input required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="resa-field">
            <span><Phone size={14} /> Téléphone</span>
            <input required type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>
        </div>

        <label className="resa-field">
          <span>E-mail (facultatif)</span>
          <input type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>

        <label className="resa-field">
          <span>Allergies, occasion, demande particulière</span>
          <textarea rows={3} maxLength={500} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </label>

        {/* Champ piège : invisible pour les humains */}
        <input className="resa-trap" tabIndex={-1} autoComplete="off" aria-hidden="true"
          value={form.website} onChange={(e) => set("website", e.target.value)} />

        <label className="resa-consent">
          <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span>
            J'accepte que Signature utilise ces informations pour traiter ma réservation.
            Elles ne sont pas conservées au-delà de 12 mois.
          </span>
        </label>

        {error && <p className="resa-error" role="alert">{error}</p>}

        <button className="resa-submit" disabled={status === "sending"}>
          {status === "sending" ? <><Loader2 size={16} className="spin" /> Envoi…</> : "Envoyer ma demande"}
        </button>
      </form>
    </section>
  );
}
