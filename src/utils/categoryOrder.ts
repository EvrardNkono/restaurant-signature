// src/utils/categoryOrder.ts
// Ordre « logique » des catégories (entrées → plats → desserts, boissons fraîches → chaudes)
// calculé à partir de leur NOM : aucune modification de la base de données nécessaire.
import { Salad, Soup, Utensils, UtensilsCrossed, IceCreamCone, GlassWater, Martini, Beer, Wine, Coffee } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Univers = "Cuisine" | "Boissons";

interface Rule { test: RegExp; rank: number; icon: LucideIcon }

// Les règles sont testées dans l'ordre : la première qui correspond gagne.
const CUISINE: Rule[] = [
  { test: /dessert|gourmand|sucre|glace|patisserie|douceur/, rank: 80, icon: IceCreamCone },
  { test: /fromage/, rank: 60, icon: Utensils },
  { test: /enfant|kids/, rank: 40, icon: Utensils },
  { test: /accompagnement|garniture|supplement|\bsides?\b/, rank: 30, icon: Utensils },
  { test: /soupe|potage/, rank: 12, icon: Soup },
  { test: /salade/, rank: 14, icon: Salad },
  { test: /entree|starter|apero|tapas|accras|amuse|mise en bouche/, rank: 10, icon: Salad },
  { test: /plat|principal|viande|poisson|grill|burger|pizza|\bpates?\b|\briz\b|volaille|boeuf|poulet|brochette/, rank: 20, icon: UtensilsCrossed },
];
const BOISSONS: Rule[] = [
  { test: /cafe|\bthes?\b|infusion|chaud/, rank: 90, icon: Coffee },
  { test: /digestif|spiritueux|rhum|whisky|alcool fort|cognac|liqueur/, rank: 50, icon: Wine },
  { test: /\bvins?\b|champagne|bulles/, rank: 40, icon: Wine },
  { test: /biere|beer/, rank: 30, icon: Beer },
  { test: /cocktail|mocktail/, rank: 20, icon: Martini },
  { test: /\beaux?\b|soft|\bjus\b|limonade|soda|sans alcool|rafraich/, rank: 10, icon: GlassWater },
];

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function categoryMeta(name: string, univers: Univers): { rank: number; Icon: LucideIcon } {
  const n = norm(name);
  const hit = (univers === "Boissons" ? BOISSONS : CUISINE).find((r) => r.test.test(n));
  if (hit) return { rank: hit.rank, Icon: hit.icon };
  // Catégorie inconnue : après les plats mais avant les desserts (cuisine), au milieu (boissons)
  return univers === "Boissons" ? { rank: 60, Icon: GlassWater } : { rank: 25, Icon: Utensils };
}

// Tri stable : à rang égal, l'ordre d'origine est conservé
export function sortCategoryNames(names: string[], univers: Univers): string[] {
  return [...names].sort((a, b) => categoryMeta(a, univers).rank - categoryMeta(b, univers).rank);
}

export function sortPlatsByCategory<T extends { category?: { name?: string } | null }>(plats: T[], univers: Univers): T[] {
  const rank = (p: T) => categoryMeta(p.category?.name ?? "", univers).rank;
  return [...plats].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    // même rang : on regroupe quand même les plats d'une même catégorie
    return (a.category?.name ?? "").localeCompare(b.category?.name ?? "", "fr");
  });
}
