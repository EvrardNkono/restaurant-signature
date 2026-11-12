// src/components/menu/CategoryBar.tsx
// Barre de catégories commune au menu du jour et au menu du soir.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { categoryMeta, sortCategoryNames } from "../../utils/categoryOrder";
import type { Univers } from "../../utils/categoryOrder";
import "./menuNav.css";

interface Props {
  categories: string[];                                   // noms des catégories (« Tous » est ajouté ici)
  active: string;
  onSelect: (cat: string) => void;
  items: { category?: { name?: string } | null }[];       // plats de l'univers affiché (pour les compteurs)
  univers: Univers;
  variant?: "light" | "dark";
  disabled?: boolean;
}

export default function CategoryBar({ categories, active, onSelect, items, univers, variant = "light", disabled = false }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  const ordered = useMemo(
    () => sortCategoryNames(categories.filter((c) => c !== "Tous"), univers),
    [categories, univers]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => {
      const n = i.category?.name;
      if (n) map[n] = (map[n] || 0) + 1;
    });
    return map;
  }, [items]);

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges, ordered]);

  // Ramène la catégorie choisie au centre de la barre
  useEffect(() => {
    const el = scroller.current;
    const btn = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !btn) return;
    el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <nav className={`cbar cbar--${variant}`} aria-label="Catégories du menu">
      <div className={`cbar-wrap ${edge.left ? "has-left" : ""} ${edge.right ? "has-right" : ""}`}>
        {edge.left && (
          <button type="button" className="cbar-arrow left" onClick={() => scrollBy(-1)} aria-label="Catégories précédentes" tabIndex={-1}>
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="cbar-scroll" ref={scroller} onScroll={updateEdges}>
          {["Tous", ...ordered].map((cat) => {
            const isAll = cat === "Tous";
            const Icon = isAll ? LayoutGrid : categoryMeta(cat, univers).Icon;
            const count = isAll ? items.length : counts[cat] || 0;
            const isActive = active === cat;
            return (
              <button
                type="button"
                key={cat}
                className={`cbar-chip ${isActive ? "active" : ""}`}
                aria-pressed={isActive}
                disabled={disabled}
                onClick={() => onSelect(cat)}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="cbar-label">{isAll ? "Tout voir" : cat}</span>
                <span className="cbar-count">{count}</span>
              </button>
            );
          })}
        </div>

        {edge.right && (
          <button type="button" className="cbar-arrow right" onClick={() => scrollBy(1)} aria-label="Catégories suivantes" tabIndex={-1}>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </nav>
  );
}
