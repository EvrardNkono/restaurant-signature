// src/components/menu/SectionHeading.tsx
// Titre de section (« Entrées », « Plats »…) affiché avant le premier plat de chaque catégorie.
import { categoryMeta } from "../../utils/categoryOrder";
import type { Univers } from "../../utils/categoryOrder";
import "./menuNav.css";

interface Props {
  list: { category?: { name?: string } | null }[];   // plats affichés, déjà triés par catégorie
  plat: { category?: { name?: string } | null };
  show: boolean;                                      // vrai quand on voit « Tout voir » sans recherche
  univers: Univers;
  variant?: "light" | "dark";
}

export default function SectionHeading({ list, plat, show, univers, variant = "light" }: Props) {
  const name = plat.category?.name;
  const index = list.indexOf(plat);
  if (!show || !name || index < 0) return null;
  if (index > 0 && list[index - 1].category?.name === name) return null; // pas le premier de sa catégorie

  const count = list.filter((p) => p.category?.name === name).length;
  const { Icon } = categoryMeta(name, univers);

  return (
    <div className={`msec-head msec-head--${variant}`} role="heading" aria-level={2}>
      <Icon size={22} className="msec-icon" aria-hidden="true" />
      <span className="msec-title">{name}</span>
      <span className="msec-line" aria-hidden="true" />
      <span className="msec-count">{count} {univers === "Boissons" ? "choix" : count > 1 ? "plats" : "plat"}</span>
    </div>
  );
}
