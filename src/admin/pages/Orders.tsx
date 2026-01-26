// src/admin/pages/Orders.tsx
import { useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, Eye, Printer } from "lucide-react";
import "./Orders.css";

export default function Orders() {
  // Simulation des commandes reçues
  const [orders] = useState([
    { id: "#1204", table: "Table 5", items: "2x Filet de Bar, 1x Vin Blanc", total: "78.00€", status: "En préparation", time: "10 min" },
    { id: "#1203", table: "Table 2", items: "1x Formule Signature", total: "45.00€", status: "En attente", time: "2 min" },
    { id: "#1202", table: "Table 8", items: "3x Cocktails, 2x Entrées", total: "112.00€", status: "Terminée", time: "45 min" },
  ]);

  const getStatusClass = (status: string) => {
    switch(status) {
      case "En attente": return "status-pending";
      case "En préparation": return "status-cooking";
      case "Terminée": return "status-done";
      default: return "";
    }
  };

  return (
    <div className="orders-page">
      <header className="admin-header-gold">
        <div className="header-seal-small">
          <ShoppingBag size={18} strokeWidth={2.5} />
        </div>
        <span className="admin-badge">Flux en direct</span>
        <h1 className="admin-main-title">Commandes Clients</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <section className="orders-content">
        <div className="orders-stats-row">
          <div className="order-stat-card">
            <div className="stat-icon-circle pending"><AlertCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">1</span>
              <span className="stat-label">Nouvelle</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle cooking"><Clock size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">1</span>
              <span className="stat-label">En cuisine</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle done"><CheckCircle2 size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">12</span>
              <span className="stat-label">Terminées</span>
            </div>
          </div>
        </div>

        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className={`order-card ${getStatusClass(order.status)}`}>
              <div className="gold-thin-border"></div>
              
              <div className="order-card-header">
                <div className="order-id-tag">
                  <ShoppingBag size={14} />
                  <span>{order.id}</span>
                </div>
                <span className="order-time">Il y a {order.time}</span>
              </div>

              <div className="order-card-body">
                <h3 className="table-number">{order.table}</h3>
                <div className="items-list">
                  <p>{order.items}</p>
                </div>
                <div className="order-total-price">
                  <span className="label">Total</span>
                  <span className="value">{order.total}</span>
                </div>
              </div>

              <div className="order-card-footer">
                <div className={`status-pill ${getStatusClass(order.status)}`}>
                  <span className="dot"></span>
                  {order.status}
                </div>
                <div className="order-actions">
                  <button className="order-action-btn view" title="Détails"><Eye size={18} /></button>
                  <button className="order-action-btn print" title="Imprimer"><Printer size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}