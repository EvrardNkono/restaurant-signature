import { LayoutDashboard, Utensils, Image as ImageIcon, ShoppingBag, LogOut, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", icon: <LayoutDashboard />, label: "Dashboard" },
    { path: "/admin/menu", icon: <Utensils />, label: "Ma Carte" },
    { path: "/admin/appearance", icon: <ImageIcon />, label: "Apparence & Pub" }, 
    // Nouveau module de diffusion réseaux sociaux
    { path: "/admin/social", icon: <Zap size={22} />, label: "Social Broadcaster" }, 
    { path: "/admin/orders", icon: <ShoppingBag />, label: "Commandes" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-seal">S</div> {/* Changé J par S pour Signature */}
        <span>ADMIN SIGNATURE</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button className="logout-btn">
        <LogOut size={20} />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}