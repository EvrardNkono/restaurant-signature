import { useEffect } from "react";
import { isThemeActive } from "../../config/event";

/**
 * Active le thème « rouge & or » (classe `event-theme` sur <body>) sur les pages client.
 * Monté uniquement dans la partie client : l'administration n'est jamais touchée.
 */
export default function EventTheme() {
  useEffect(() => {
    const on = isThemeActive();
    document.body.classList.toggle("event-theme", on);
    return () => document.body.classList.remove("event-theme");
  }, []);
  return null;
}
