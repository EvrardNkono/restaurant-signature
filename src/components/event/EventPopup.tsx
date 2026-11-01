import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Phone } from "lucide-react";
import { EVENT, isEventActive } from "../../config/event";

const KEY = "rs_event_popup_shown";

/**
 * Popup affiche — une seule fois par session.
 * Attend que les autres popups (pub, quiz) soient fermés pour ne pas s'empiler.
 */
export default function EventPopup() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isEventActive() || sessionStorage.getItem(KEY) === "1") return;

    let tries = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    // Premier essai après 5 s, puis toutes les 2 s tant qu'un autre popup est ouvert
    const start = setTimeout(() => {
      interval = setInterval(() => {
        tries += 1;
        const otherPopup = document.querySelector(".ad-floating-banner, .quiz-popup-overlay");
        if (!otherPopup) {
          clearInterval(interval);
          sessionStorage.setItem(KEY, "1");
          setOpen(true);
        } else if (tries > 30) {
          clearInterval(interval); // on n'insiste pas
        }
      }, 2000);
    }, 5000);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="ev-popup-overlay" onClick={() => setOpen(false)}>
      <div
        className="ev-popup"
        role="dialog"
        aria-modal="true"
        aria-label={`${EVENT.artist} ${EVENT.name} — ${EVENT.kind}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="ev-popup-close" onClick={() => setOpen(false)} aria-label="Fermer">
          <X size={18} aria-hidden="true" />
        </button>
        <img
          className="ev-popup-img"
          src={EVENT.posterSmall}
          alt={`Affiche : ${EVENT.artist} ${EVENT.name}, ${EVENT.kind}, ${EVENT.dateLabel}, ${EVENT.timeLabel}`}
          width={640}
          height={906}
        />
        <div className="ev-popup-body">
          <p className="ev-popup-date">{EVENT.dateLabel} · {EVENT.timeLabel}</p>
          <div className="ev-popup-actions">
            <a className="ev-btn ev-btn--gold" href={`tel:${EVENT.phoneTel}`}>
              <Phone size={16} aria-hidden="true" /> Réserver · {EVENT.phoneDisplay}
            </a>
            <Link className="ev-btn ev-btn--ghost" to={EVENT.path} onClick={() => setOpen(false)}>
              Voir les détails
            </Link>
          </div>
          {EVENT.limitedTables && <p className="ev-popup-note">Tables limitées</p>}
        </div>
      </div>
    </div>
  );
}
