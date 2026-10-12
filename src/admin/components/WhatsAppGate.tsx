import { useState } from "react";
import type { FormEvent } from "react";
import { Lock } from "lucide-react";
import WhatsAppPanel from "./WhatsAppPanel";
import { API, getToken, setToken } from "./waApi";
import "./WhatsAppPanel.css";

export default function WhatsAppGate() {
  const [logged, setLogged] = useState(!!getToken());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erreur de connexion");
      setToken(d.token);
      setLogged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Serveur injoignable");
    } finally {
      setLoading(false);
    }
  };

  if (logged) return <WhatsAppPanel />;

  return (
    <section className="wa-panel">
      <form className="wa-card" onSubmit={login}>
        <h2><Lock size={16} aria-hidden="true" /> Accès WhatsApp</h2>
        <div className="wa-row">
          <input className="wa-input" type="password" placeholder="Mot de passe"
            value={password} onChange={(e) => setPassword(e.target.value)}
            aria-label="Mot de passe WhatsApp" autoFocus />
          <button type="submit" className="wa-btn is-primary" style={{ marginTop: 0 }} disabled={loading}>
            {loading ? "Connexion…" : "Entrer"}
          </button>
        </div>
        {loading && <small className="wa-hint">Le serveur peut mettre jusqu'à une minute à se réveiller.</small>}
        {error && <p className="wa-msg" role="alert">{error}</p>}
      </form>
    </section>
  );
}