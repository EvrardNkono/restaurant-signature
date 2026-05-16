// src/admin/pages/Orders.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  ShoppingBag, Clock, CheckCircle, AlertCircle, Eye, 
  Printer, Utensils, Package, Download, Calendar, Wallet, ListOrdered, Archive,
  Truck, Sparkles, Bell, BellRing, Phone, Mail, MapPin, Clock as ClockIcon, Trash2
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
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const [activeFilter, setActiveFilter] = useState("365");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({
    show: false, message: "", type: ""
  });

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  // Refs pour éviter les closures périmées dans setInterval
  const activeFilterRef = useRef(activeFilter);
  const customRangeRef = useRef(customRange);
  activeFilterRef.current = activeFilter;
  customRangeRef.current = customRange;

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const applyFilter = useCallback((allOrders: any[], period: string, range: { start: string; end: string }) => {
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

  // fetchOrders ne dépend pas des états de filtre, utilise les refs
  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_API}/orders`);
      const data = res.data.data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(data);
      applyFilter(data, activeFilterRef.current, customRangeRef.current);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  }, [applyFilter]);

  // Re-appliquer le filtre quand il change (sans re-fetcher)
  useEffect(() => {
    applyFilter(orders, activeFilter, customRange);
  }, [activeFilter, customRange]); // eslint-disable-line

  // Fetch initial + polling
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Éviter les double-clics
    if (updatingIds.has(orderId)) return;

    const now = new Date().toISOString();

    // 1. Marquer comme en cours de mise à jour
    setUpdatingIds(prev => new Set(prev).add(orderId));

    // 2. Mise à jour optimiste immédiate sur les deux states
    const updateFn = (list: any[]) =>
      list.map(o => o._id === orderId ? { ...o, status: newStatus, updatedAt: now } : o);

    setOrders(prev => updateFn(prev));
    setFilteredOrders(prev => updateFn(prev));

    try {
      // 3. Appel API principal (statut)
      await axios.put(`${BASE_API}/orders/${orderId}`, { status: newStatus, updatedAt: now });
      showToast(`✅ Statut mis à jour : ${getStatusLabel(newStatus)}`, "success");

      // 4. Notification en fire-and-forget (ne bloque pas)
      axios.post(`${BASE_API}/notifications/order-status`, { orderId, newStatus })
        .then(res => {
          if (res.data?.success) {
            console.log(`📱 Notification envoyée pour commande ${orderId}`);
          }
        })
        .catch(err => {
          console.warn("⚠️ Notification non envoyée (non bloquant):", err.message);
        });

    } catch (err: any) {
      console.error("❌ Erreur update statut:", err);
      showToast(`❌ Erreur: ${err.response?.data?.message || err.message}`, "error");
      // Rollback : recharger depuis le serveur
      fetchOrders();
    } finally {
      // 5. Débloquer le bouton dans tous les cas
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const sendCustomNotification = async (orderId: string, title: string, body: string) => {
    try {
      const response = await axios.post(`${BASE_API}/notifications/custom-notification`, {
        orderId, title, body
      });
      if (response.data.success) {
        showToast(`✅ Notification personnalisée envoyée`, "success");
      } else {
        showToast(`⚠️ Échec: ${response.data.message}`, "error");
      }
    } catch (err: any) {
      console.error("❌ Erreur notification perso:", err);
      showToast(`❌ Erreur: ${err.message}`, "error");
    }
  };

  const deleteArchivedOrders = async () => {
    const archived = orders.filter(o => o.status === "archived");
    if (archived.length === 0) {
      showToast("Aucune commande archivée à supprimer", "info");
      return;
    }
    setConfirmModal({
      show: true,
      title: "Supprimer les commandes archivées",
      message: `Vous allez supprimer définitivement ${archived.length} commande(s) archivée(s). Cette action est irréversible.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, show: false }));
        try {
          await Promise.all(archived.map(o => axios.delete(`${BASE_API}/orders/${o._id}`)));
          showToast(`✅ ${archived.length} commande(s) archivée(s) supprimée(s)`, "success");
          fetchOrders();
        } catch (err: any) {
          showToast(`❌ Erreur: ${err.message}`, "error");
        }
      }
    });
  };

  const deleteAllOrders = async () => {
    setConfirmModal({
      show: true,
      title: "⚠️ Supprimer TOUTES les commandes",
      message: `Vous allez supprimer définitivement les ${orders.length} commande(s) de la base de données. Cette action est IRRÉVERSIBLE.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, show: false }));
        try {
          await Promise.all(orders.map(o => axios.delete(`${BASE_API}/orders/${o._id}`)));
          showToast(`✅ Toutes les commandes ont été supprimées`, "success");
          fetchOrders();
        } catch (err: any) {
          showToast(`❌ Erreur: ${err.message}`, "error");
        }
      }
    });
  };

  const downloadExcel = () => {
    const data = filteredOrders.map(o => {
      const articlesDetails = o.items.map((i: any) => {
        const acc = i.chosenAccompaniment && i.chosenAccompaniment !== "Aucun"
          ? ` (Acc: ${i.chosenAccompaniment})` : "";
        return `${i.name}${acc} x${i.quantity || 1}`;
      }).join(", ");

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
        "Adresse": o.customer?.address || "-",
        "Heure livraison": o.details?.deliveryTime || "-",
        "Service livraison": o.details?.deliveryService || "-",
        "Frais livraison": o.details?.deliveryFee ? `${o.details.deliveryFee}€` : "-",
        "Date réservation": o.details?.bookingSlot || "-",
        "Articles": articlesDetails,
        "Quantité": o.items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0),
        "Total TTC": `${parseFloat(o.total).toFixed(2)} €`,
        "Montant payé": `${parseFloat(o.amountPaid || 0).toFixed(2)} €`,
        "Statut": getStatusLabel(o.status),
        "Token FCM": o.fcmToken ? "✅ Oui" : "❌ Non",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, `signature_commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending": return "status-pending";
      case "cooking": return "status-cooking";
      case "done": return "status-done";
      case "archived": return "status-archived";
      default: return "status-pending";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
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

  const getOrderDetails = (order: any) => {
    if (order.mode === "delivery") {
      return (
        <div className="order-details-delivery">
          <div className="detail-row">
            <Phone size={14} className="detail-icon" />
            <span>{order.customer?.phone || "Non renseigné"}</span>
          </div>
          <div className="detail-row">
            <Mail size={14} className="detail-icon" />
            <span>{order.customer?.email || "Non renseigné"}</span>
          </div>
          <div className="detail-row">
            <MapPin size={14} className="detail-icon" />
            <span>{order.customer?.address || "Non renseignée"}</span>
          </div>
          <div className="detail-row">
            <ClockIcon size={14} className="detail-icon" />
            <span>Livraison : {order.details?.deliveryTime || "Non spécifiée"}</span>
          </div>
          {order.details?.deliveryFee > 0 && (
            <div className="detail-row delivery-fee">
              <Truck size={14} className="detail-icon" />
              <span>Frais de livraison : {order.details.deliveryFee}€</span>
            </div>
          )}
        </div>
      );
    }
    if (order.mode === "booking") {
      return (
        <div className="order-details-booking">
          <div className="detail-row">
            <Phone size={14} className="detail-icon" />
            <span>{order.customer?.phone || "Non renseigné"}</span>
          </div>
          <div className="detail-row">
            <Mail size={14} className="detail-icon" />
            <span>{order.customer?.email || "Non renseigné"}</span>
          </div>
          <div className="detail-row">
            <Calendar size={14} className="detail-icon" />
            <span>Réservation : {order.details?.bookingSlot ? new Date(order.details.bookingSlot).toLocaleString() : "Non spécifiée"}</span>
          </div>
          <div className="detail-row">
            <Wallet size={14} className="detail-icon" />
            <span>Acompte versé : {order.amountPaid?.toFixed(2) || "0"}€ / {order.total?.toFixed(2)}€</span>
          </div>
        </div>
      );
    }
    if (order.mode === "on_site" && order.details?.consumeMode === "take_away") {
      return (
        <div className="order-details-takeaway">
          <div className="detail-row">
            <Phone size={14} className="detail-icon" />
            <span>{order.customer?.phone || "Non renseigné"}</span>
          </div>
          <div className="detail-row">
            <Mail size={14} className="detail-icon" />
            <span>{order.customer?.email || "Non renseigné"}</span>
          </div>
        </div>
      );
    }
    if (order.customer?.email && order.details?.paymentStatus === "pending_stripe") {
      return (
        <div className="order-details-onsite">
          <div className="detail-row">
            <Mail size={14} className="detail-icon" />
            <span>{order.customer.email}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="orders-page">
      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modale de confirmation */}
      {confirmModal.show && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 20000, padding: "20px"
        }}>
          <div style={{
            background: "white", borderRadius: "20px", padding: "32px",
            maxWidth: "440px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            border: "1px solid rgba(212,175,55,0.3)"
          }}>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", color: "#2D2422", marginBottom: "12px" }}>
              {confirmModal.title}
            </h3>
            <p style={{ color: "#6B5B57", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "24px" }}>
              {confirmModal.message}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmModal(m => ({ ...m, show: false }))}
                style={{
                  padding: "10px 20px", borderRadius: "10px", border: "1px solid #ddd",
                  background: "white", color: "#6B5B57", cursor: "pointer", fontWeight: 600
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                style={{
                  padding: "10px 20px", borderRadius: "10px", border: "none",
                  background: "#e74c3c", color: "white", cursor: "pointer", fontWeight: 700
                }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="orders-header-luxury">
        <div className="header-seal-terracotta">
          <ShoppingBag size={24} />
        </div>
        <span className="header-badge-gold">Gestion des Commandes</span>
        <h1 className="header-title-terracotta">Commandes en temps réel</h1>
        <p className="header-subtitle">Total: {orders.length} commandes</p>
        <div className="header-gold-line"></div>
      </header>

      {/* Revenus & Filtres */}
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
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
              />
              <span className="to-text">→</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
              />
            </div>
          )}

          <button className="btn-download-gold" onClick={downloadExcel}>
            <Download size={18} />
            <span>Exporter Excel</span>
          </button>
          <button className="btn-delete-archived" onClick={deleteArchivedOrders}>
            <Trash2 size={18} />
            <span>Vider archives</span>
          </button>
          <button className="btn-delete-all" onClick={deleteAllOrders}>
            <Trash2 size={18} />
            <span>Tout effacer</span>
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
          {filteredOrders.map((order) => {
            const isUpdating = updatingIds.has(order._id);
            return (
              <div key={order._id} className={`order-card-luxury ${getStatusClass(order.status)}`}>
                <div className="gold-top-border"></div>

                <div className="order-card-header">
                  <div className="order-id">
                    {getModeIcon(order.mode, order.details)}
                    <span className="id-number">#{order._id.slice(-6).toUpperCase()}</span>
                    {order.fcmToken && (
                      <span className="fcm-indicator" title="Client peut recevoir des notifications">
                        <BellRing size={12} />
                      </span>
                    )}
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

                  <div className="order-details-section">
                    {getOrderDetails(order)}
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
                    {order.amountPaid > 0 && order.amountPaid < order.total && (
                      <span className="deposit-badge">Acompte: {order.amountPaid.toFixed(2)}€</span>
                    )}
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
                      <button
                        className="action-btn cooking"
                        disabled={isUpdating}
                        onClick={() => updateOrderStatus(order._id, "cooking")}
                      >
                        {isUpdating
                          ? <span className="spinner-small" />
                          : <Clock size={14} />
                        }
                        <span>Cuisine</span>
                      </button>
                    )}
                    {order.status === "cooking" && (
                      <button
                        className="action-btn done"
                        disabled={isUpdating}
                        onClick={() => updateOrderStatus(order._id, "done")}
                      >
                        {isUpdating
                          ? <span className="spinner-small" />
                          : <CheckCircle size={14} />
                        }
                        <span>Terminer</span>
                      </button>
                    )}
                    {order.status === "done" && (
                      <button
                        className="action-btn archive"
                        disabled={isUpdating}
                        onClick={() => updateOrderStatus(order._id, "archived")}
                      >
                        {isUpdating
                          ? <span className="spinner-small" />
                          : <Archive size={14} />
                        }
                        <span>Archiver</span>
                      </button>
                    )}
                    <button
                      className="action-btn icon-only"
                      title="Envoyer notification personnalisée"
                      onClick={() => {
                        const message = prompt("Message personnalisé à envoyer au client:");
                        if (message) {
                          sendCustomNotification(order._id, "📢 Message du restaurant", message);
                        }
                      }}
                    >
                      <Bell size={16} />
                    </button>
                    <button className="action-btn icon-only" title="Voir détails">
                      <Eye size={16} />
                    </button>
                    <button className="action-btn icon-only" title="Imprimer">
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .toast-notification.success { background: linear-gradient(135deg, #27ae60, #2ecc71); }
        .toast-notification.error   { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .toast-notification.info    { background: linear-gradient(135deg, #3498db, #2980b9); }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        .fcm-indicator {
          display: inline-flex;
          align-items: center;
          margin-left: 8px;
          color: #2ecc71;
          background: rgba(46, 204, 113, 0.1);
          padding: 2px 6px;
          border-radius: 12px;
        }

        .spinner-small {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .order-details-section {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          margin: 8px 0;
          font-size: 0.75rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          color: rgba(255, 255, 255, 0.7);
        }

        .detail-icon {
          color: #D4AF37;
          flex-shrink: 0;
        }

        .delivery-fee {
          color: #D4AF37;
          font-weight: 500;
        }

        .deposit-badge {
          display: inline-block;
          margin-left: 8px;
          font-size: 0.7rem;
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          padding: 2px 6px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}

