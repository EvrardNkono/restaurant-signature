// src/admin/pages/Orders.tsx
import { useState, useEffect, useCallback } from "react";
import { 
  ShoppingBag, Clock, CheckCircle, AlertCircle, Eye, 
  Printer, Utensils, Package, Download, Calendar, Wallet, ListOrdered, Archive,
  Truck, Sparkles
} from "lucide-react";
import axios from "axios";
import "./Orders.css";
 import * as XLSX from 'xlsx';

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // États pour les filtres
  const [activeFilter, setActiveFilter] = useState("365");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const applyFilter = useCallback((allOrders: any[], period: string, range: {start: string, end: string}) => {
    let filtered = [...allOrders];
    const now = new Date();

    if (period === "custom" && range.start && range.end) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      end.setHours(23, 59, 59);
      filtered = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    } else {
      let startDate = new Date();
      if (period === "7") startDate.setDate(now.getDate() - 7);
      else if (period === "14") startDate.setDate(now.getDate() - 14);
      else if (period === "30") startDate.setMonth(now.getMonth() - 1);
      else startDate.setFullYear(now.getFullYear() - 1);
      
      filtered = allOrders.filter(o => new Date(o.createdAt) >= startDate);
    }

    const revenue = filtered
      .filter(o => o.status === "done" || o.status === "archived")
      .reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);

    setFilteredOrders(filtered);
    setTotalRevenue(revenue);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_API}/orders`);
      const data = res.data.data.reverse(); 
      setOrders(data);
      applyFilter(data, activeFilter, customRange);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [activeFilter, customRange, applyFilter]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const now = new Date().toISOString();
    try {
      setFilteredOrders(prev => 
        prev.map(o => o._id === orderId ? { ...o, status: newStatus, updatedAt: now } : o)
      );
      await axios.put(`${BASE_API}/orders/${orderId}`, { status: newStatus, updatedAt: now });
      fetchOrders(); 
    } catch (err) {
      console.error("Erreur update statut:", err);
      alert("Impossible de mettre à jour la commande.");
      fetchOrders(); 
    }
  };

 

const downloadExcel = () => {
  const data = filteredOrders.map(o => {
    // 1. Calcul du prix unitaire (approximation ou premier item) et formatage articles
    const articlesDetails = o.items.map((i: any) => {
      const acc = i.chosenAccompaniment && i.chosenAccompaniment !== "Aucun" 
        ? ` (Acc: ${i.chosenAccompaniment})` 
        : "";
      return `${i.name}${acc} x${i.quantity || 1}`;
    }).join(", ");

    // 2. Gestion propre de la provenance (Table ou Client)
    let tableOrClient = "-";
    if (o.mode === "delivery") tableOrClient = o.customer?.name || "Livraison";
    else if (o.details?.tableNumber) tableOrClient = `Table ${o.details.tableNumber}`;
    else if (o.details?.consumeMode === "take_away") tableOrClient = `À emporter (${o.customer?.name || "Client"})`;
    else tableOrClient = o.customer?.name || "Sur place";

    const dateObj = new Date(o.createdAt);

    return {
      "ID Commande": o._id.slice(-8).toUpperCase(),
      "Date": dateObj.toLocaleDateString('fr-FR'),
      "Heure": dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      "Jour": dateObj.toLocaleDateString('fr-FR', { weekday: 'long' }),
      "Mode": o.mode === "delivery" ? "Livraison" : o.mode === "booking" ? "Réservation" : "Sur place",
      "Table / Client": tableOrClient,
      "Téléphone": o.customer?.phone || "-",
      "Email": o.customer?.email || "-",
      "Articles": articlesDetails,
      "Quantité": o.items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0),
      "Total TTC": `${parseFloat(o.total).toFixed(2)} €`,
      "Statut": getStatusLabel(o.status),
      "Service livraison": o.details?.deliveryService || "-",
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  
  // Optionnel : Définir des largeurs de colonnes pour que ce soit propre à l'ouverture
  ws['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, 
    { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 10 }, 
    { wch: 12 }, { wch: 15 }, { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Commandes");
  XLSX.writeFile(wb, `signature_commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  const getStatusClass = (status: string) => {
    switch(status) {
      case "pending": return "status-pending";
      case "cooking": return "status-cooking";
      case "done": return "status-done";
      case "archived": return "status-archived";
      default: return "status-pending";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "pending": return "En attente";
      case "cooking": return "En cuisine";
      case "done": return "Prêt / Servi";
      case "archived": return "Archivée";
      default: return "En attente";
    }
  };

  const getModeIcon = (mode: string, details?: any) => {
    if (mode === "delivery") return <Truck size={16} className="mode-icon delivery" />;
    if (mode === "booking") return <Calendar size={16} className="mode-icon booking" />;
    if (details?.consumeMode === "take_away") return <Package size={16} className="mode-icon takeaway" />;
    return <Utensils size={16} className="mode-icon on-site" />;
  };

  // Fonction pour obtenir le nom de la table ou du client
  const getOrderOrigin = (order: any) => {
    if (order.mode === "delivery") {
      return (
        <div className="origin-delivery">
          <Truck size={14} />
          <span>{order.customer?.name || "Client Livraison"}</span>
          {order.details?.deliveryService && (
            <span className="delivery-service-badge">{order.details.deliveryService}</span>
          )}
        </div>
      );
    }
    if (order.mode === "booking") {
      return (
        <div className="origin-booking">
          <Calendar size={14} />
          <span>{order.customer?.name || "Réservation"}</span>
          {order.details?.bookingSlot && (
            <span className="booking-slot">{new Date(order.details.bookingSlot).toLocaleString()}</span>
          )}
        </div>
      );
    }
    if (order.details?.consumeMode === "take_away") {
      return (
        <div className="origin-takeaway">
          <Package size={14} />
          <span>À emporter</span>
          <span className="customer-name">{order.customer?.name || "Client"}</span>
        </div>
      );
    }
    // Sur place
    const tableNumber = order.details?.tableNumber;
    if (tableNumber) {
      return (
        <div className="origin-table">
          <Utensils size={14} />
          <span>Table {tableNumber}</span>
          {order.customer?.name && <span className="customer-name">{order.customer.name}</span>}
        </div>
      );
    }
    return (
      <div className="origin-default">
        <Utensils size={14} />
        <span>Sur place</span>
      </div>
    );
  };

  return (
    <div className="orders-page">
      {/* Header Luxe */}
      <header className="orders-header-luxury">
        <div className="header-seal-terracotta">
          <ShoppingBag size={24} />
        </div>
        <span className="header-badge-gold">Gestion des Commandes</span>
        <h1 className="header-title-terracotta">Commandes en temps réel</h1>
        <p className="header-subtitle">Total: {orders.length} commandes</p>
        <div className="header-gold-line"></div>
      </header>

      {/* Panneau Revenus & Filtres */}
      <div className="revenue-panel-luxury">
        <div className="revenue-card-luxury">
          <div className="rev-icon-gold">
            <Wallet size={24} />
          </div>
          <div className="rev-details">
            <span className="rev-label">Encaissé sur la période</span>
            <span className="rev-amount">{totalRevenue.toFixed(2)}€</span>
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group-luxury">
            <Calendar size={18} className="gold-icon" />
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              <option value="365">📅 Tout l'historique</option>
              <option value="7">📆 7 derniers jours</option>
              <option value="14">📆 2 semaines</option>
              <option value="30">📆 Dernier mois</option>
              <option value="custom">⚙️ Période personnalisée</option>
            </select>
          </div>

          {activeFilter === "custom" && (
            <div className="custom-date-picker-luxury">
              <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} />
              <span className="to-text">→</span>
              <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} />
            </div>
          )}

          <button className="btn-download-gold" onClick={downloadExcel}>
            <Download size={18} />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid-luxury">
        <div className="stat-card-luxury highlight">
          <div className="stat-icon period">
            <ListOrdered size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.length}</span>
            <span className="stat-label">Commandes</span>
          </div>
        </div>
        <div className="stat-card-luxury">
          <div className="stat-icon pending">
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.filter(o => o.status === "pending").length}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card-luxury">
          <div className="stat-icon cooking">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.filter(o => o.status === "cooking").length}</span>
            <span className="stat-label">En cuisine</span>
          </div>
        </div>
        <div className="stat-card-luxury">
          <div className="stat-icon done">
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.filter(o => o.status === "done").length}</span>
            <span className="stat-label">Prêts / Servis</span>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      {loading ? (
        <div className="loading-luxury">
          <Sparkles size={30} className="spinner-gold" />
          <span>Chargement des commandes...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📭</div>
          <h3>Aucune commande</h3>
          <p>Aucune commande trouvée pour cette période</p>
        </div>
      ) : (
        <div className="orders-grid-luxury">
          {filteredOrders.map((order) => (
            <div key={order._id} className={`order-card-luxury ${getStatusClass(order.status)}`}>
              <div className="gold-top-border"></div>
              
              <div className="order-card-header">
                <div className="order-id">
                  {getModeIcon(order.mode, order.details)}
                  <span className="id-number">#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="order-time">
                  <Clock size={12} />
                  <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-origin">
                  {getOrderOrigin(order)}
                </div>

                <div className="items-list-luxury">
                  {order.items.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="order-item">
                      <span className="item-qty">{item.quantity || 1}×</span>
                      <span className="item-name">{item.name}</span>
                      {item.chosenAccompaniment && item.chosenAccompaniment !== "Aucun" && (
                        <span className="item-accompaniment">({item.chosenAccompaniment})</span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">+{order.items.length - 3} autre(s)</div>
                  )}
                </div>

                <div className="order-total">
                  <span className="total-label">Total</span>
                  <span className="total-value">{parseFloat(order.total).toFixed(2)}€</span>
                </div>

                {order.details?.deliveryService && (
                  <div className="delivery-badge">
                    <Truck size={12} />
                    <span>{order.details.deliveryService}</span>
                  </div>
                )}
              </div>

              <div className="order-card-footer">
                <div className={`status-pill-luxury ${getStatusClass(order.status)}`}>
                  <span className="status-dot"></span>
                  <span>{getStatusLabel(order.status)}</span>
                </div>

                <div className="order-actions-luxury">
                  {order.status === "pending" && (
                    <button className="action-btn cooking" onClick={() => updateOrderStatus(order._id, "cooking")}>
                      <Clock size={14} />
                      <span>Cuisine</span>
                    </button>
                  )}
                  {order.status === "cooking" && (
                    <button className="action-btn done" onClick={() => updateOrderStatus(order._id, "done")}>
                      <CheckCircle size={14} />
                      <span>Terminer</span>
                    </button>
                  )}
                  {order.status === "done" && (
                    <button className="action-btn archive" onClick={() => updateOrderStatus(order._id, "archived")}>
                      <Archive size={14} />
                      <span>Archiver</span>
                    </button>
                  )}
                  <button className="action-btn icon-only" title="Voir détails">
                    <Eye size={16} />
                  </button>
                  <button className="action-btn icon-only" title="Imprimer">
                    <Printer size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}