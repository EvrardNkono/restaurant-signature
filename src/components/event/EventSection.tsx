import { Link } from "react-router-dom";
import { Phone, CalendarDays, Clock, MapPin } from "lucide-react";
import { EVENT, isEventActive } from "../../config/event";
import EventCountdown from "./EventCountdown";

/** Grande section de mise en avant — affichée sur l'accueil juste après le Hero. */
export default function EventSection() {
  if (!isEventActive()) return null;

  return (
    <section className="ev-section" aria-labelledby="ev-section-title">
      <div className="ev-section-glow" aria-hidden="true" />
      <div className="ev-section-inner">
        <Link to={EVENT.path} className="ev-poster-frame" aria-label="Voir les détails de l'événement">
          <img
            src={EVENT.posterSmall}
            alt={`Affiche : ${EVENT.artist} ${EVENT.name}, ${EVENT.kind}`}
            width={640}
            height={906}
            loading="lazy"
          />
        </Link>

        <div className="ev-section-content">
          <p className="ev-eyebrow">{EVENT.announce} · Restaurant Signature présente</p>
          <h2 id="ev-section-title" className="ev-title">
            <span className="ev-script">{EVENT.artist}</span>
            <span className="ev-prelude">{EVENT.name}</span>
          </h2>
          <p className="ev-kind">{EVENT.kind}</p>
          <div className="ev-rule" aria-hidden="true" />
          <p className="ev-tagline">{EVENT.tagline}</p>

          <ul className="ev-facts">
            <li><CalendarDays size={18} aria-hidden="true" /> {EVENT.dateLabel}</li>
            <li><Clock size={18} aria-hidden="true" /> {EVENT.timeLabel}</li>
            <li><MapPin size={18} aria-hidden="true" /> {EVENT.address}</li>
          </ul>

          <p className="ev-countdown-label">Plus que</p>
          <EventCountdown />

          <div className="ev-actions">
            <a className="ev-btn ev-btn--gold" href={`tel:${EVENT.phoneTel}`}>
              <Phone size={16} aria-hidden="true" /> Réserver · {EVENT.phoneDisplay}
            </a>
            <Link className="ev-btn ev-btn--ghost" to={EVENT.path}>Tous les détails</Link>
          </div>
          {EVENT.limitedTables && <p className="ev-note">✦ Tables limitées — pensez à réserver</p>}
        </div>
      </div>
    </section>
  );
}
