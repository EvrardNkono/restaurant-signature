// src/components/MobileActionBar.tsx
// Barre fixe en bas de l'écran (mobile) : les 3 actions que cherche un client.
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { UtensilsCrossed, CalendarDays, Phone } from "lucide-react";
import { useRestaurantHours } from "../hooks/useRestaurantHours";
import { getOrderTarget } from "../utils/orderTarget";
import "./MobileActionBar.css";

// ⚠️ À confirmer : numéro appelé par le bouton « Appeler » (ici : celui du pied de page)
const PHONE_TEL = "+33183865812";

// Pages où la barre gênerait (déjà une action principale ou un tiroir en bas d'écran)
const HIDDEN_ROUTES = ["/menu", "/menu-soir", "/panier", "/order-success", "/reservation", "/quiz"];

export default function MobileActionBar() {
  const { pathname } = useLocation();
  const { currentPeriod, isJourOpen, isSoirOpen, nextPeriodInfo, nextJourInfo } = useRestaurantHours();
  const hidden = HIDDEN_ROUTES.includes(pathname);

  // Laisse de la place en bas de page et décale les autres boutons flottants (voir le CSS)
  useEffect(() => {
    if (hidden) return;
    document.body.classList.add("has-action-bar");
    return () => document.body.classList.remove("has-action-bar");
  }, [hidden]);

  if (hidden) return null;

  const open = isJourOpen || isSoirOpen;
  const next = (nextPeriodInfo ?? nextJourInfo ?? "").toLowerCase();

  return (
    <nav className="mab" aria-label="Actions rapides">
      <p className="mab-status">
        <span className={`mab-dot ${open ? "on" : "off"}`} aria-hidden="true" />
        {open ? "Ouvert maintenant" : next ? `Fermé · réouverture ${next}` : "Fermé actuellement"}
      </p>
      <div className="mab-row">
        <Link to={getOrderTarget(currentPeriod)} className="mab-btn mab-primary">
          <UtensilsCrossed size={20} aria-hidden="true" />
          <span>Commander</span>
        </Link>
        <Link to="/reservation" className="mab-btn">
          <CalendarDays size={18} aria-hidden="true" />
          <span>Réserver</span>
        </Link>
        <a href={`tel:${PHONE_TEL}`} className="mab-btn">
          <Phone size={18} aria-hidden="true" />
          <span>Appeler</span>
        </a>
      </div>
    </nav>
  );
}
