import { useEffect } from "react";
import { EVENT, isThemeActive } from "../../config/event";

/**
 * Active le thème « rouge & or » (classe `event-theme` sur <body>) sur les pages client.
 * Monté uniquement dans la partie client : l'administration n'est jamais touchée.
 */
export default function EventTheme() {
  useEffect(() => {
    const on = isThemeActive();
    document.body.classList.toggle("event-theme", on);
    // Petit cachet affiché sur les cartes de plats (texte piloté par config/event.ts)
    if (on) {
      document.body.style.setProperty("--ev-stamp", JSON.stringify(`✦ ${EVENT.kind} · ${EVENT.dateShort} ✦`));
    }
    return () => {
      document.body.classList.remove("event-theme");
      document.body.style.removeProperty("--ev-stamp");
    };
  }, []);
  return null;
}
