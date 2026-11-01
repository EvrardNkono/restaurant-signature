import { useEffect, useState } from "react";
import { EVENT } from "../../config/event";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    ms,
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

export default function EventCountdown({ compact = false }: { compact?: boolean }) {
  const target = new Date(EVENT.startISO).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.ms === 0) {
    return (
      <div className="ev-countdown ev-countdown--live" role="status">
        <span className="ev-live-dot" aria-hidden="true" /> C'est maintenant !
      </div>
    );
  }

  const cells: [number, string][] = [
    [t.d, "jours"],
    [t.h, "heures"],
    [t.m, "min"],
    [t.s, "sec"],
  ];

  return (
    <div
      className={`ev-countdown ${compact ? "ev-countdown--compact" : ""}`}
      role="timer"
      aria-label={`Début de l'événement dans ${t.d} jours, ${t.h} heures et ${t.m} minutes`}
    >
      {cells.map(([n, label]) => (
        <div className="ev-count-cell" key={label}>
          <strong>{String(n).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
