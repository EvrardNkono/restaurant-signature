// src/admin/components/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminNotifications from "./AdminNotifications"; // ← Ajout
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h2>Panneau d'administration</h2>
          <div className="admin-topbar-right">
            <AdminNotifications /> {/* ← Ajout du bouton */}
            <div className="admin-user-info">Connecté : Admin</div>
          </div>
        </header>
        <div className="admin-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}