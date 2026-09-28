// src/admin/components/Sidebar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Utensils, Image as ImageIcon, ShoppingBag, LogOut, Zap,
  Tags, ListPlus, PlusSquare, Smartphone, Gift, Newspaper, Brain,
  Megaphone, Search, ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./Sidebar.css";

type Item = { path: string; icon: LucideIcon; label: string; hint: string };
type Group = { id: string; label: string; icon: LucideIcon; items: Item[] };

// 12 entrées regroupées en 3 univers, selon le moment où on s'en sert
const GROUPS: Group[] = [
  {
    id: "service",
    label: "Service",
    icon: ShoppingBag,
    items: [
      { path: "/admin", icon: LayoutDashboard, label: "Tableau de bord", hint: "Chiffres du jour et exports" },
      { path: "/admin/orders", icon: ShoppingBag, label: "Commandes", hint: "Suivre et traiter les commandes" },
      { path: "/admin/tables", icon: Smartphone, label: "Gestion des tables", hint: "Tables et QR codes" },
    ],
  },
  {
    id: "carte",
    label: "Carte",
    icon: Utensils,
    items: [
      { path: "/admin/menu", icon: Utensils, label: "Ma carte", hint: "Plats, prix et disponibilité" },
      { path: "/admin/categories", icon: Tags, label: "Catégories", hint: "Organiser la carte" },
      { path: "/admin/supplements", icon: PlusSquare, label: "Suppléments", hint: "Options payantes" },
      { path: "/admin/accompaniments", icon: ListPlus, label: "Accompagnements", hint: "Choix d'accompagnement" },
    ],
  },
  {
    id: "vitrine",
    label: "Vitrine",
    icon: Megaphone,
    items: [
      { path: "/admin/appearance", icon: ImageIcon, label: "Apparence et pub", hint: "Visuels et bannières" },
      { path: "/admin/social", icon: Zap, label: "Social Broadcaster", hint: "Publier sur les réseaux" },
      { path: "/admin/blog", icon: Newspaper, label: "Blog", hint: "Articles du site" },
      { path: "/admin/wheel", icon: Gift, label: "Jeu de la roue", hint: "Lots et participations" },
      { path: "/admin/quiz", icon: Brain, label: "La question du chef", hint: "Quiz pour les clients" },
    ],
  },
];

type Props = {
  onLogout?: () => void;
  /** Éléments affichés à droite de la barre (ex. bouton de notifications) */
  tools?: ReactNode;
};

export default function Sidebar({ onLogout, tools }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const barRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) =>
    path === "/admin"
      ? pathname === "/admin" || pathname === "/admin/"
      : pathname === path || pathname.startsWith(`${path}/`);

  const all = useMemo(
    () => GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))),
    []
  );
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((i) => `${i.label} ${i.group} ${i.hint}`.toLowerCase().includes(q));
  }, [query, all]);

  // Ferme tout à chaque changement de page
  useEffect(() => {
    setOpen(null);
    setPalette(false);
  }, [pathname]);

  // Raccourci Ctrl/Cmd + K, Échap, clic à l'extérieur
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      } else if (e.key === "Escape") {
        setOpen(null);
        setPalette(false);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  useEffect(() => {
    if (palette) {
      setQuery("");
      inputRef.current?.focus();
    }
  }, [palette]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (results[0]) navigate(results[0].path);
  };

  return (
    <>
      <header className="admin-sidebar" ref={barRef}>
        <Link to="/admin" className="tn-brand" aria-label="Signature, tableau de bord">
          <span className="tn-seal" aria-hidden="true">S</span>
          <span className="tn-brand-text">
            <strong>Signature</strong>
            <small>Administration</small>
          </span>
        </Link>

        <nav className="tn-groups" aria-label="Navigation de l'administration">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            const isOpen = open === g.id;
            const active = g.items.some((i) => isActive(i.path));
            return (
              <div key={g.id} className="tn-group">
                <button
                  type="button"
                  className={`tn-tab ${active ? "is-active" : ""} ${isOpen ? "is-open" : ""}`}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : g.id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{g.label}</span>
                  <ChevronDown size={14} className="tn-chev" aria-hidden="true" />
                </button>

                {isOpen && (
                  <ul className="tn-panel">
                    {g.items.map(({ path, icon: ItemIcon, label, hint }) => (
                      <li key={path}>
                        <Link
                          to={path}
                          className={`tn-link ${isActive(path) ? "is-current" : ""}`}
                          aria-current={isActive(path) ? "page" : undefined}
                        >
                          <span className="tn-link-icon"><ItemIcon size={18} aria-hidden="true" /></span>
                          <span className="tn-link-text">
                            <strong>{label}</strong>
                            <small>{hint}</small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="tn-tools">
          {tools}
          <button type="button" className="tn-search" onClick={() => setPalette(true)} aria-label="Rechercher une page">
            <Search size={16} aria-hidden="true" />
            <span>Aller à…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button type="button" className="tn-logout" onClick={onLogout} aria-label="Déconnexion" title="Déconnexion">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {palette && (
        <div
          className="tn-overlay"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setPalette(false); }}
        >
          <form className="tn-palette" onSubmit={submit} role="dialog" aria-label="Aller à une page">
            <div className="tn-palette-input">
              <Search size={18} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une page (commandes, blog, catégories…)"
                aria-label="Rechercher une page"
              />
            </div>
            <ul className="tn-results">
              {results.length === 0 && <li className="tn-empty">Aucune page ne correspond à « {query} ».</li>}
              {results.map((r, idx) => {
                const RIcon = r.icon;
                return (
                  <li key={r.path}>
                    <Link to={r.path} className={`tn-result ${idx === 0 && query ? "is-first" : ""}`}>
                      <RIcon size={18} aria-hidden="true" />
                      <span>{r.label}</span>
                      <small>{r.group}</small>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </form>
        </div>
      )}
    </>
  );
}