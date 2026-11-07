// config/event.ts
// ─────────────────────────────────────────────────────────────
//  UN SEUL FICHIER À MODIFIER pour piloter l'événement sur tout le site.
//  - enabled : false → tout disparaît immédiatement (thème, bandeau, popup…)
//  - Après `endISO`, tout se désactive automatiquement.
// ─────────────────────────────────────────────────────────────

export const EVENT = {
  enabled: true,

  // Textes
  artist: "Danys'",
  name: "Prelude",
  kind: "Dîner Showcase",
  announce: "Elle arrive à Melun",
  tagline: "Une soirée d'exception au Restaurant Signature, autour de la cuisine afro-caribéenne.",

  // Date & heure (heure de Paris — novembre = UTC+01:00)
  // ⚠ Le 14 novembre 2026 tombe un SAMEDI.
  startISO: "2026-11-14T19:30:00+01:00",
  endISO: "2026-11-15T03:00:00+01:00", // fin de l'affichage (dimanche 3h)
  dateLabel: "Samedi 14 novembre 2026",
  dateShort: "Sam. 14 novembre",
  timeLabel: "À partir de 19h30",

  // Lieu & réservation (repris de l'affiche)
  venue: "Restaurant Signature",
  cuisine: "Cuisine Afro-Caribéenne",
  address: "13 Rue Saint-Barthélémy, 77000 Melun",
  phoneDisplay: "01 83 86 58 12",
  phoneTel: "+33183865812",
  website: "https://www.restaurantsignature.fr",
  limitedTables: true,

  // Visuels (dossier NOUVEAU : public/evenements — n'écrase rien)
  poster: "/evenements/danys-prelude.webp",
  posterSmall: "/evenements/danys-prelude-640.webp",
  posterJpg: "/evenements/danys-prelude.jpg",

  // Page dédiée
  path: "/evenement",

  // false = le thème émeraude & or s'éteint après l'événement
  keepThemeAfterEvent: false,
} as const;

export function isEventActive(now: Date = new Date()): boolean {
  if (!EVENT.enabled) return false;
  return now.getTime() < new Date(EVENT.endISO).getTime();
}

export function isThemeActive(now: Date = new Date()): boolean {
  if (!EVENT.enabled) return false;
  return EVENT.keepThemeAfterEvent || isEventActive(now);
}

export function mapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${EVENT.venue} ${EVENT.address}`
  )}`;
}
