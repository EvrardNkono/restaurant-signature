import { useState, useEffect } from "react";
import { 
  ShoppingBag, Clock, CheckCircle, AlertCircle, Eye, 
  Printer, MapPin, Utensils, Package, Download, Calendar, Wallet, ListOrdered 
} from "lucide-react";
import axios from "axios";
import "./Orders.css";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature.abbadevelop.net/api";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // États pour les filtres
  const [activeFilter, setActiveFilter] = useState("365");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

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
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeFilter, customRange]);

  const applyFilter = (allOrders: any[], period: string, range: {start: string, end: string}) => {
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
      .filter(o => o.status === "done")
      .reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    setFilteredOrders(filtered);
    setTotalRevenue(revenue);
  };

  // NOUVELLE FONCTION : Mise à jour du statut
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(`${BASE_API}/orders/${orderId}`, { status: newStatus });
      fetchOrders(); // Rafraîchissement automatique
    } catch (err) {
      console.error("Erreur update statut:", err);
      alert("Impossible de mettre à jour la commande.");
    }
  };

  const downloadHistory = () => {
    const headers = ["ID", "Date", "Heure", "Mode", "Table/Client", "Articles", "Total", "Statut"];
    const rows = filteredOrders.map(o => [
      o._id.slice(-6).toUpperCase(),
      new Date(o.createdAt).toLocaleDateString(),
      new Date(o.createdAt).toLocaleTimeString(),
      o.mode === "delivery" ? "Livraison" : "Sur Place",
      o.details?.tableNumber ? `Table ${o.details.tableNumber}` : (o.customer?.name || "N/A"),
      o.items.map((i: any) => i.name).join(" | "),
      `${o.total}€`,
      o.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_signature_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case "pending": return "status-pending";
      case "cooking": return "status-cooking";
      case "done": return "status-done";
      default: return "status-pending";
    }
  };

  const getModeIcon = (mode: string, details?: any) => {
    if (mode === "delivery") return <MapPin size={16} className="mode-icon delivery" />;
    if (details?.consumeMode === "take_away") return <Package size={16} className="mode-icon takeaway" />;
    return <Utensils size={16} className="mode-icon on-site" />;
  };

  return (
    <div className="orders-page">
      <header className="admin-header-gold">
        <div className="header-seal-small"><ShoppingBag size={18} /></div>
        <span className="admin-badge">Flux total : {orders.length} commandes</span>
        <h1 className="admin-main-title">Gestion des Commandes</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <section className="orders-content">
        <div className="revenue-export-panel">
          <div className="revenue-card">
            <div className="rev-icon"><Wallet size={24} /></div>
            <div className="rev-details">
              <span className="rev-label">Encaissé sur la période</span>
              <span className="rev-amount">{totalRevenue.toFixed(2)}€</span>
            </div>
          </div>

          <div className="export-controls">
            <div className="filter-wrapper">
              <div className="filter-group">
                <Calendar size={18} color="#D4AF37" />
                <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                  <option value="365">Période : Tout</option>
                  <option value="7">7 derniers jours</option>
                  <option value="14">2 semaines</option>
                  <option value="30">Dernier mois</option>
                  <option value="custom">Période personnalisée...</option>
                </select>
              </div>

              {activeFilter === "custom" && (
                <div className="custom-date-picker">
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} />
                  <span className="to-text">au</span>
                  <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} />
                </div>
              )}
            </div>
            <button className="btn-download" onClick={downloadHistory}><Download size={18} /> Télécharger CSV</button>
          </div>
        </div>

        <div className="orders-stats-row">
          <div className="order-stat-card highlight">
            <div className="stat-icon-circle period"><ListOrdered size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{filteredOrders.length}</span>
              <span className="stat-label">Commandes sur la période</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle pending"><AlertCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{filteredOrders.filter(o => o.status === "pending").length}</span>
              <span className="stat-label">Attente</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle cooking"><Clock size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{filteredOrders.filter(o => o.status === "cooking").length}</span>
              <span className="stat-label">Cuisine</span>
            </div>
          </div>
          <div className="order-stat-card">
            <div className="stat-icon-circle done"><CheckCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{filteredOrders.filter(o => o.status === "done").length}</span>
              <span className="stat-label">Terminées</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-gold">Mise à jour des données...</div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className={`order-card ${getStatusClass(order.status)}`}>
                <div className="gold-thin-border"></div>
                <div className="order-card-header">
                  <div className="order-id-tag">
                    {getModeIcon(order.mode, order.details)}
                    <span>#{order._id.slice(-4).toUpperCase()}</span>
                  </div>
                  <span className="order-time">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-origin">
                    {order.mode === "on_site" ? (
                      <h3 className="table-number">{order.details?.tableNumber ? `Table ${order.details.tableNumber}` : "À emporter"}</h3>
                    ) : (
                      <h3 className="customer-name">{order.customer?.name || "Client Livraison"}</h3>
                    )}
                  </div>

                  <div className="items-list">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="order-item-row">
                        <span className="item-qty">1x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-total-price">
                    <span className="label">Total</span>
                    <span className="value">{parseFloat(order.total).toFixed(2)}€</span>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className={`status-pill ${getStatusClass(order.status)}`}>
                    <span className="dot"></span>
                    {order.status === "pending" ? "En attente" : order.status === "cooking" ? "Cuisine" : "Terminé"}
                  </div>
                  
                  <div className="order-actions">
                    {/* BOUTONS DYNAMIQUES DE STATUT */}
                    {order.status === "pending" && (
                      <button className="order-action-btn cooking-btn" onClick={() => updateOrderStatus(order._id, "cooking")}>
                        <Clock size={16} /> <span>Cuisine</span>
                      </button>
                    )}
                    {order.status === "cooking" && (
                      <button className="order-action-btn done-btn" onClick={() => updateOrderStatus(order._id, "done")}>
                        <CheckCircle size={16} /> <span>Terminer</span>
                      </button>
                    )}
                    
                    <button className="order-action-btn view"><Eye size={18} /></button>
                    <button className="order-action-btn print"><Printer size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}