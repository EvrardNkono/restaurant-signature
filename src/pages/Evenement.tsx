import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, CalendarDays, Clock, MapPin, Utensils, Share2, Navigation, Check } from "lucide-react";
import { EVENT, isEventActive, mapsUrl } from "../config/event";
import EventCountdown from "../components/event/EventCountdown";
import "./evenement.css";

export default function Evenement() {
  const [copied, setCopied] = useState(false);

  // Titre de l'onglet + données structurées « Event » pour Google
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${EVENT.artist} ${EVENT.name} — ${EVENT.kind} | Restaurant Signature Melun`;

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "ld-event";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${EVENT.artist} ${EVENT.name} — ${EVENT.kind}`,
      description: EVENT.tagline,
      startDate: EVENT.startISO,
      endDate: EVENT.endISO,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: [`${EVENT.website}${EVENT.posterJpg}`],
      location: {
        "@type": "Restaurant",
        name: EVENT.venue,
        servesCuisine: "Afro-Caribéenne",
        telephone: EVENT.phoneTel,
        address: {
          "@type": "PostalAddress",
          streetAddress: "13 Rue Saint-Barthélémy",
          postalCode: "77000",
          addressLocality: "Melun",
          addressCountry: "FR",
        },
      },
      organizer: { "@type": "Organization", name: EVENT.venue, url: EVENT.website },
    });
    document.head.appendChild(ld);

    return () => {
      document.title = previousTitle;
      ld.remove();
    };
  }, []);

  const share = async () => {
    const url = window.location.href;
    const data = { title: `${EVENT.artist} ${EVENT.name} — ${EVENT.kind}`, text: `${EVENT.dateLabel}, ${EVENT.timeLabel} au ${EVENT.venue}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* partage annulé */
    }
  };

  if (!isEventActive()) {
    return (
      <div className="evp-over">
        <h1 className="evp-script">Merci d'être venus !</h1>
        <p>Cet événement est terminé. Suivez-nous pour les prochaines soirées.</p>
        <Link className="ev-btn ev-btn--gold" to="/">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="evp">
      <section className="evp-hero">
        <div className="evp-hero-inner">
          <div className="evp-poster">
            <img
              src={EVENT.poster}
              alt={`Affiche : ${EVENT.artist} ${EVENT.name}, ${EVENT.kind}, ${EVENT.dateLabel}, ${EVENT.timeLabel}`}
              width={1054}
              height={1492}
            />
          </div>

          <div className="evp-info">
            <p className="ev-eyebrow">{EVENT.announce} · Restaurant Signature présente</p>
            <h1 className="ev-title">
              <span className="ev-script">{EVENT.artist}</span>
              <span className="ev-prelude">{EVENT.name}</span>
            </h1>
            <p className="ev-kind">{EVENT.kind}</p>
            <div className="ev-rule" aria-hidden="true" />
            <p className="ev-tagline">{EVENT.tagline}</p>

            <p className="ev-countdown-label">Plus que</p>
            <EventCountdown />

            <div className="evp-cards">
              <div className="evp-card"><CalendarDays size={22} aria-hidden="true" /><div><small>Date</small><strong>{EVENT.dateLabel}</strong></div></div>
              <div className="evp-card"><Clock size={22} aria-hidden="true" /><div><small>Heure</small><strong>{EVENT.timeLabel}</strong></div></div>
              <div className="evp-card"><Utensils size={22} aria-hidden="true" /><div><small>Cuisine</small><strong>{EVENT.cuisine}</strong></div></div>
              <div className="evp-card"><MapPin size={22} aria-hidden="true" /><div><small>Lieu</small><strong>{EVENT.address}</strong></div></div>
            </div>

            <div className="ev-actions">
              <a className="ev-btn ev-btn--gold" href={`tel:${EVENT.phoneTel}`}>
                <Phone size={16} aria-hidden="true" /> Réserver · {EVENT.phoneDisplay}
              </a>
              <a className="ev-btn ev-btn--ghost" href={mapsUrl()} target="_blank" rel="noopener noreferrer">
                <Navigation size={16} aria-hidden="true" /> Itinéraire
              </a>
              <button type="button" className="ev-btn ev-btn--ghost" onClick={share}>
                {copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
                {copied ? "Lien copié" : "Partager"}
              </button>
            </div>
            {EVENT.limitedTables && <p className="ev-note">✦ Tables limitées — la réservation par téléphone est recommandée</p>}
          </div>
        </div>
      </section>

      <section className="evp-more">
        <p>Envie de découvrir la carte avant la soirée ?</p>
        <div className="ev-actions ev-actions--center">
          <Link className="ev-btn ev-btn--ghost" to="/menu-soir">Menu du soir</Link>
          <Link className="ev-btn ev-btn--ghost" to="/carte">Notre carte</Link>
        </div>
      </section>
    </div>
  );
}
