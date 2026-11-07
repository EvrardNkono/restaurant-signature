import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { EVENT, isEventActive } from "../../config/event";
import EventCountdown from "./EventCountdown";

/**
 * Bandeau « réservez votre soirée » affiché sous l'en-tête des pages Carte,
 * Menu du jour et Menu du soir : on donne envie de venir pendant qu'on choisit ses plats.
 */
export default function EventMenuBand() {
  if (!isEventActive()) return null;

  return (
    <aside className="ev-menu-band" aria-label={`Événement ${EVENT.artist} ${EVENT.name}`}>
      <Link to={EVENT.path} className="ev-menu-band-poster" aria-label="Voir l'événement">
        <img src={EVENT.posterSmall} alt="" width={64} height={90} loading="lazy" />
      </Link>

      <div className="ev-menu-band-text">
        <p className="ev-eyebrow">{EVENT.announce} · Réservez votre soirée</p>
        <p className="ev-menu-band-title">
          <span className="ev-menu-band-script">{EVENT.artist} {EVENT.name}</span>
          <span className="ev-menu-band-kind">{EVENT.kind}</span>
        </p>
        <p className="ev-menu-band-sub">
          {EVENT.dateLabel} · {EVENT.timeLabel}
          {EVENT.limitedTables ? " · Tables limitées" : ""}
        </p>
      </div>

      <EventCountdown compact />

      <div className="ev-menu-band-actions">
        <a className="ev-btn ev-btn--gold" href={`tel:${EVENT.phoneTel}`}>
          <Phone size={16} aria-hidden="true" /> {EVENT.phoneDisplay}
        </a>
        <Link className="ev-btn ev-btn--ghost" to={EVENT.path}>Détails</Link>
      </div>
    </aside>
  );
}
