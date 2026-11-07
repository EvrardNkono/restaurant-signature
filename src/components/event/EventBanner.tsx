import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { EVENT, isEventActive } from "../../config/event";

const KEY = "rs_event_banner_closed";

/** Bandeau fin en haut de toutes les pages client. Fermable (revient à la prochaine visite). */
export default function EventBanner() {
  const [closed, setClosed] = useState(() => sessionStorage.getItem(KEY) === "1");
  const visible = isEventActive() && !closed;

  useEffect(() => {
    document.body.classList.toggle("has-event-banner", visible);
    return () => document.body.classList.remove("has-event-banner");
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="ev-banner" role="region" aria-label="Événement à venir">
      <Link to={EVENT.path} className="ev-banner-link">
        <Sparkles size={14} aria-hidden="true" className="ev-banner-spark" />
        <span className="ev-banner-text">
          <b>{EVENT.artist} {EVENT.name}</b>
          <span className="ev-banner-sep">·</span>
          {EVENT.announce}
          <span className="ev-banner-sep">·</span>
          <span className="ev-banner-date">{EVENT.dateShort} · 19h30</span>
        </span>
        <span className="ev-banner-cta">Découvrir</span>
      </Link>
      <button
        type="button"
        className="ev-banner-close"
        aria-label="Fermer le bandeau"
        onClick={() => {
          sessionStorage.setItem(KEY, "1");
          setClosed(true);
        }}
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
