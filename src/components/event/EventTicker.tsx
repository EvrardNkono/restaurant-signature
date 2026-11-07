import { EVENT, isEventActive } from "../../config/event";

/** Ruban doré défilant « annonce » — affiché sur l'accueil juste sous le Hero. */
export default function EventTicker() {
  if (!isEventActive()) return null;

  const item = (
    <>
      <span className="ev-ticker-script">{EVENT.artist} {EVENT.name}</span>
      <span className="ev-ticker-dot" aria-hidden="true">✦</span>
      <span>{EVENT.kind}</span>
      <span className="ev-ticker-dot" aria-hidden="true">✦</span>
      <span>{EVENT.dateLabel}</span>
      <span className="ev-ticker-dot" aria-hidden="true">✦</span>
      <span>{EVENT.timeLabel}</span>
      <span className="ev-ticker-dot" aria-hidden="true">✦</span>
    </>
  );

  return (
    <div className="ev-ticker" role="note" aria-label={`${EVENT.artist} ${EVENT.name}, ${EVENT.kind}, ${EVENT.dateLabel}`}>
      <div className="ev-ticker-track" aria-hidden="true">
        <div className="ev-ticker-group">{item}{item}</div>
        <div className="ev-ticker-group">{item}{item}</div>
      </div>
    </div>
  );
}
