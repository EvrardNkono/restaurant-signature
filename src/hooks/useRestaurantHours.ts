// hooks/useRestaurantHours.ts

export type ServicePeriod = "JOUR" | "SOIR" | "FERME";

export interface RestaurantHoursResult {
  currentPeriod: ServicePeriod;
  isJourOpen: boolean;
  isSoirOpen: boolean;
  nextJourInfo: string | null;
  nextSoirInfo: string | null;
  nextPeriodInfo: string | null;
}

/**
 * Horaires du restaurant Signature :
 * - Lundi        : Fermé
 * - Mardi–Vendredi : Déjeuner 12h00–15h00 / Dîner 18h00–23h00
 * - Samedi–Dimanche : Déjeuner 10h00–15h30 / Dîner 18h00–00h00
 */
function getHoursStatus(): RestaurantHoursResult {
  const now = new Date();
  const day = now.getDay(); // 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMinutes = h * 60 + m;

  const toMin = (hh: number, mm = 0) => hh * 60 + mm;

  const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  // Lundi : fermé toute la journée
  if (day === 1) {
    return {
      currentPeriod: "FERME",
      isJourOpen: false,
      isSoirOpen: false,
      nextJourInfo: "Mardi à 12h00",
      nextSoirInfo: "Mardi à 18h00",
      nextPeriodInfo: "Mardi à 12h00",
    };
  }

  // Samedi (6) & Dimanche (0)
  if (day === 0 || day === 6) {
    const jourStart = toMin(10);
    const jourEnd = toMin(15, 30);
    const soirStart = toMin(18);
    const soirEnd = toMin(24); // minuit

    const isJourOpen = totalMinutes >= jourStart && totalMinutes < jourEnd;
    const isSoirOpen = totalMinutes >= soirStart && totalMinutes < soirEnd;

    let currentPeriod: ServicePeriod = "FERME";
    if (isJourOpen) currentPeriod = "JOUR";
    else if (isSoirOpen) currentPeriod = "SOIR";

    const nextDayName = day === 6 ? "dimanche" : "lundi (fermé) — mardi";

    return {
      currentPeriod,
      isJourOpen,
      isSoirOpen,
      nextJourInfo: isJourOpen ? null : (totalMinutes < jourStart ? `Aujourd'hui à 10h00` : `${nextDayName} à 10h00`),
      nextSoirInfo: isSoirOpen ? null : (totalMinutes < soirStart ? `Aujourd'hui à 18h00` : `${nextDayName} à 18h00`),
      nextPeriodInfo: currentPeriod !== "FERME" ? null : (
        totalMinutes < jourStart ? `Aujourd'hui à 10h00` :
        totalMinutes < soirStart ? `Aujourd'hui à 18h00` :
        `${nextDayName} à 10h00`
      ),
    };
  }

  // Mardi–Vendredi (day 2–5)
  const jourStart = toMin(12);
  const jourEnd = toMin(15);
  const soirStart = toMin(18);
  const soirEnd = toMin(23);

  const isJourOpen = totalMinutes >= jourStart && totalMinutes < jourEnd;
  const isSoirOpen = totalMinutes >= soirStart && totalMinutes < soirEnd;

  let currentPeriod: ServicePeriod = "FERME";
  if (isJourOpen) currentPeriod = "JOUR";
  else if (isSoirOpen) currentPeriod = "SOIR";

  const nextDayName = day < 5 ? DAY_NAMES[day + 1] : "samedi";

  return {
    currentPeriod,
    isJourOpen,
    isSoirOpen,
    nextJourInfo: isJourOpen ? null : (totalMinutes < jourStart ? `Aujourd'hui à 12h00` : `${nextDayName} à 12h00`),
    nextSoirInfo: isSoirOpen ? null : (totalMinutes < soirStart ? `Aujourd'hui à 18h00` : `${nextDayName} à 18h00`),
    nextPeriodInfo: currentPeriod !== "FERME" ? null : (
      totalMinutes < jourStart ? `Aujourd'hui à 12h00` :
      totalMinutes < soirStart ? `Aujourd'hui à 18h00` :
      `${nextDayName} à 12h00`
    ),
  };
}

import { useState, useEffect } from "react";

export function useRestaurantHours(): RestaurantHoursResult {
  const [status, setStatus] = useState<RestaurantHoursResult>(getHoursStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getHoursStatus());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}