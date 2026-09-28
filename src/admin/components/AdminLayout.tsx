// src/admin/components/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminNotifications from "./AdminNotifications";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Ajoute onLogout={...} quand ta fonction de déconnexion est prête */}
      <Sidebar tools={<AdminNotifications />} />
      <main className="admin-main-content">
        <div className="admin-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}