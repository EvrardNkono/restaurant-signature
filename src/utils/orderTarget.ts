// src/utils/orderTarget.ts
import type { ServicePeriod } from "../hooks/useRestaurantHours";

/**
 * Choisit le menu à ouvrir quand le client clique sur « Commander » :
 * déjeuner le matin / à midi, dîner à partir de 15h (semaine) ou 18h (week-end).
 */
export function getOrderTarget(currentPeriod: ServicePeriod, now: Date = new Date()): "/menu" | "/menu-soir" {
  const day = now.getDay();
  const hour = now.getHours();
  const weekend = day === 0 || day === 6;

  if (currentPeriod === "SOIR") return "/menu-soir";
  if (currentPeriod === "JOUR") return weekend && hour >= 18 ? "/menu-soir" : "/menu";

  // Fermé : on propose le prochain service (pas de dîner après 23h ni le lundi)
  if (!weekend && day !== 1 && hour >= 15 && hour < 23) return "/menu-soir";
  return "/menu";
}
