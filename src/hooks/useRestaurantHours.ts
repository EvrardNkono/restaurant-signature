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
 * - Lundi                    : Fermé toute la journée
 * - Mardi–Vendredi           : Déjeuner 12h00–15h00 / Dîner 18h00–23h00
 * - Samedi–Dimanche          : Ouvert en continu 12h00–23h00 (les DEUX menus ouverts)
 */
function getHoursStatus(): RestaurantHoursResult {
  const now = new Date();
  const day = now.getDay(); // 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
  const totalMinutes = now.getHours() * 60 + now.getMinutes();

  const toMin = (hh: number, mm = 0) => hh * 60 + mm;

  const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  // ─── LUNDI : FERMÉ TOUTE LA JOURNÉE ───
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

  // ─── WEEKEND (Samedi & Dimanche) : 12h00 – 23h00 continu ───
  // ✅ Les DEUX menus (Jour et Soir) sont ouverts de 12h à 23h
  if (day === 0 || day === 6) {
    const openStart = toMin(12);
    const openEnd = toMin(23);

    const isOpen = totalMinutes >= openStart && totalMinutes < openEnd;

    return {
      currentPeriod: isOpen ? "JOUR" : "FERME",
      isJourOpen: isOpen,
      isSoirOpen: isOpen, // ✅ Les deux menus ouverts en même temps le weekend
      nextJourInfo: isOpen ? null : "Aujourd'hui à 12h00",
      nextSoirInfo: isOpen ? null : "Aujourd'hui à 12h00",
      nextPeriodInfo: isOpen ? null : "Aujourd'hui à 12h00",
    };
  }

  // ─── MARDI–VENDREDI : 12h–15h et 18h–23h ───
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
    nextJourInfo: isJourOpen ? null : (totalMinutes < jourStart ? "Aujourd'hui à 12h00" : `${nextDayName} à 12h00`),
    nextSoirInfo: isSoirOpen ? null : (totalMinutes < soirStart ? "Aujourd'hui à 18h00" : `${nextDayName} à 18h00`),
    nextPeriodInfo: currentPeriod !== "FERME" ? null : (
      totalMinutes < jourStart ? "Aujourd'hui à 12h00" :
      totalMinutes < soirStart ? "Aujourd'hui à 18h00" :
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