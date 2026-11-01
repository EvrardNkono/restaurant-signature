import { Link } from "react-router-dom";
import { EVENT, isEventActive } from "../../config/event";

/** Bandeau présent en haut du footer, donc sur toutes les pages client. */
export default function EventFooterStrip() {
  if (!isEventActive()) return null;
  return (
    <div className="ev-footer-strip">
      <p>
        <span className="ev-footer-script">{EVENT.artist} {EVENT.name}</span>
        <span> — {EVENT.kind} · {EVENT.dateLabel} · {EVENT.timeLabel}</span>
      </p>
      <div className="ev-footer-links">
        <a href={`tel:${EVENT.phoneTel}`}>{EVENT.phoneDisplay}</a>
        <Link to={EVENT.path}>Découvrir l'événement</Link>
      </div>
    </div>
  );
}
