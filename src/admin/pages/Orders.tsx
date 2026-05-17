// src/admin/pages/Orders.tsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  ShoppingBag, Clock, CheckCircle, AlertCircle, Eye, 
  Printer, Utensils, Package, Download, Calendar, Wallet, ListOrdered, Archive,
  Truck, Sparkles, Bell, BellRing, Phone, Mail, MapPin, Clock as ClockIcon, Trash2,
  Receipt, Users, ChevronDown, ChevronUp, CreditCard
} from "lucide-react";
import axios from "axios";
import "./Orders.css";
import * as XLSX from 'xlsx';

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

// ─── Groupe de table : toutes les commandes open_tab d'une même table ───
interface TableGroup {
  tableNumber: string;
  orders: any[];
  totalCumule: number;
  clientIds: string[];
  fcmTokens: string[];
  hasOpenTab: boolean;
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const [activeFilter, setActiveFilter] = useState("365");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [viewMode, setViewMode] = useState<"all" | "tables">("all");
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [sendingBillIds, setSendingBillIds] = useState<Set<string>>(new Set());
  const [closingTabIds, setClosingTabIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({
    show: false, message: "", type: ""
  });

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

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

  useEffect(() => {
    applyFilter(orders, activeFilter, customRange);
  }, [activeFilter, customRange]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ─────────────────────────────────────────────────────────────
  // GROUPEMENT PAR TABLE
  // ─────────────────────────────────────────────────────────────
  const tableGroups = useMemo<TableGroup[]>(() => {
    const openTabOrders = orders.filter(o =>
      o.details?.paymentStatus === "open_tab" &&
      o.status !== "archived" &&
      o.details?.tableNumber
    );

    const grouped: Record<string, TableGroup> = {};

    openTabOrders.forEach(order => {
      const table = String(order.details.tableNumber);
      if (!grouped[table]) {
        grouped[table] = {
          tableNumber: table,
          orders: [],
          totalCumule: 0,
          clientIds: [],
          fcmTokens: [],
          hasOpenTab: true,
        };
      }
      grouped[table].orders.push(order);
      grouped[table].totalCumule += parseFloat(order.total || 0);
      if (order.clientId && !grouped[table].clientIds.includes(order.clientId)) {
        grouped[table].clientIds.push(order.clientId);
      }
      if (order.fcmToken && !grouped[table].fcmTokens.includes(order.fcmToken)) {
        grouped[table].fcmTokens.push(order.fcmToken);
      }
    });

    return Object.values(grouped).sort((a, b) =>
      parseInt(a.tableNumber) - parseInt(b.tableNumber)
    );
  }, [orders]);

  // ─────────────────────────────────────────────────────────────
  // ENVOYER L'ADDITION À UNE TABLE
  // ─────────────────────────────────────────────────────────────
  const sendBillToTable = async (group: TableGroup) => {
    const key = group.tableNumber;
    if (sendingBillIds.has(key)) return;

    setSendingBillIds(prev => new Set(prev).add(key));

    try {
      await axios.post(`${BASE_API}/bills`, {
        tableNumber: group.tableNumber,
        clientIds: group.clientIds,
        fcmTokens: group.fcmTokens,
        orderIds: group.orders.map(o => o._id),
        total: group.totalCumule,
        status: "pending",
      });

      if (group.fcmTokens.length > 0) {
        await axios.post(`${BASE_API}/notifications/send-bill`, {
          fcmTokens: group.fcmTokens,
          tableNumber: group.tableNumber,
          total: group.totalCumule.toFixed(2),
        }).catch(() => {});
      }

      showToast(`🧾 Addition envoyée — Table ${group.tableNumber} (${group.totalCumule.toFixed(2)}€)`, "success");
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    } finally {
      setSendingBillIds(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // NOUVEAU : FERMER LA TAB APRÈS PAIEMENT CAISSE
  // ─────────────────────────────────────────────────────────────
  const closeTabAndMarkPaid = async (group: TableGroup) => {
    const key = group.tableNumber;
    if (closingTabIds.has(key)) return;

    setClosingTabIds(prev => new Set(prev).add(key));

    try {
      // Chercher la bill pending pour cette table
      const billsRes = await axios.get(`${BASE_API}/bills?status=pending`);
      const pendingBill = billsRes.data.data.find((b: any) => b.tableNumber === group.tableNumber);
      
      if (pendingBill) {
        // Fermer la bill via close-tab
        await axios.post(`${BASE_API}/bills/${pendingBill._id}/close-tab`, {
          clientId: group.clientIds[0],
          tableNumber: group.tableNumber,
        });
        showToast(`✅ Table ${group.tableNumber} — Paiement enregistré, tab fermée`, "success");
      } else {
        // Pas de bill, fermer directement les commandes
        for (const order of group.orders) {
          await axios.put(`${BASE_API}/orders/${order._id}`, {
            'details.paymentStatus': 'closed',
            isPaid: true,
            paidAt: new Date().toISOString()
          });
        }
        showToast(`✅ Table ${group.tableNumber} — Commandes fermées`, "success");
      }
      
      fetchOrders(); // Rafraîchir la liste
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    } finally {
      setClosingTabIds(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UPDATE STATUT
  // ─────────────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (updatingIds.has(orderId)) return;
    const now = new Date().toISOString();
    setUpdatingIds(prev => new Set(prev).add(orderId));

    const updateFn = (list: any[]) =>
      list.map(o => o._id === orderId ? { ...o, status: newStatus, updatedAt: now } : o);
    setOrders(prev => updateFn(prev));
    setFilteredOrders(prev => updateFn(prev));

    try {
      await axios.put(`${BASE_API}/orders/${orderId}`, { status: newStatus, updatedAt: now });
      showToast(`✅ Statut mis à jour : ${getStatusLabel(newStatus)}`, "success");

      axios.post(`${BASE_API}/notifications/order-status`, { orderId, newStatus })
        .catch(err => console.warn("⚠️ Notification non envoyée:", err.message));

    } catch (err: any) {
      showToast(`❌ Erreur: ${err.response?.data?.message || err.message}`, "error");
      fetchOrders();
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const sendCustomNotification = async (orderId: string, title: string, body: string) => {
    try {
      const response = await axios.post(`${BASE_API}/notifications/custom-notification`, { orderId, title, body });
      if (response.data.success) showToast(`✅ Notification personnalisée envoyée`, "success");
      else showToast(`⚠️ Échec: ${response.data.message}`, "error");
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    }
  };

  const deleteArchivedOrders = async () => {
    const archived = orders.filter(o => o.status === "archived");
    if (archived.length === 0) { showToast("Aucune commande archivée à supprimer", "info"); return; }
    setConfirmModal({
      show: true,
      title: "Supprimer les commandes archivées",
      message: `Vous allez supprimer définitivement ${archived.length} commande(s) archivée(s). Cette action est irréversible.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, show: false }));
        try {
          await Promise.all(archived.map(o => axios.delete(`${BASE_API}/orders/${o._id}`)));
          showToast(`✅ ${archived.length} commande(s) supprimée(s)`, "success");
          fetchOrders();
        } catch (err: any) { showToast(`❌ Erreur: ${err.message}`, "error"); }
      }
    });
  };

  const deleteAllOrders = async () => {
    setConfirmModal({
      show: true,
      title: "⚠️ Supprimer TOUTES les commandes",
      message: `Vous allez supprimer définitivement les ${orders.length} commande(s). Cette action est IRRÉVERSIBLE.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, show: false }));
        try {
          await Promise.all(orders.map(o => axios.delete(`${BASE_API}/orders/${o._id}`)));
          showToast(`✅ Toutes les commandes ont été supprimées`, "success");
          fetchOrders();
        } catch (err: any) { showToast(`❌ Erreur: ${err.message}`, "error"); }
      }
    });
  };

  const downloadExcel = () => {
    const data = filteredOrders.map(o => {
      const articlesDetails = o.items.map((i: any) => {
        const acc = i.chosenAccompaniment && i.chosenAccompaniment !== "Aucun" ? ` (Acc: ${i.chosenAccompaniment})` : "";
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
        "Tab ouverte": o.details?.paymentStatus === "open_tab" ? "✅ Oui" : "Non",
        "Token FCM": o.fcmToken ? "✅ Oui" : "❌ Non",
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
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
          {order.details?.paymentStatus === "open_tab" && (
            <span className="open-tab-badge-small">Tab ouverte</span>
          )}
        </div>
      );
    }
    return <div className="origin-default"><Utensils size={14} /><span>Sur place</span></div>;
  };

  const getOrderDetails = (order: any) => {
    if (order.mode === "delivery") {
      return (
        <div className="order-details-delivery">
          <div className="detail-row"><Phone size={14} className="detail-icon" /><span>{order.customer?.phone || "Non renseigné"}</span></div>
          <div className="detail-row"><Mail size={14} className="detail-icon" /><span>{order.customer?.email || "Non renseigné"}</span></div>
          <div className="detail-row"><MapPin size={14} className="detail-icon" /><span>{order.customer?.address || "Non renseignée"}</span></div>
          <div className="detail-row"><ClockIcon size={14} className="detail-icon" /><span>Livraison : {order.details?.deliveryTime || "Non spécifiée"}</span></div>
          {order.details?.deliveryFee > 0 && (
            <div className="detail-row delivery-fee"><Truck size={14} className="detail-icon" /><span>Frais : {order.details.deliveryFee}€</span></div>
          )}
        </div>
      );
    }
    if (order.mode === "booking") {
      return (
        <div className="order-details-booking">
          <div className="detail-row"><Phone size={14} className="detail-icon" /><span>{order.customer?.phone || "Non renseigné"}</span></div>
          <div className="detail-row"><Mail size={14} className="detail-icon" /><span>{order.customer?.email || "Non renseigné"}</span></div>
          <div className="detail-row"><Calendar size={14} className="detail-icon" /><span>Réservation : {order.details?.bookingSlot ? new Date(order.details.bookingSlot).toLocaleString() : "Non spécifiée"}</span></div>
          <div className="detail-row"><Wallet size={14} className="detail-icon" /><span>Acompte : {order.amountPaid?.toFixed(2) || "0"}€ / {order.total?.toFixed(2)}€</span></div>
        </div>
      );
    }
    return null;
  };

  // ─── Carte commande individuelle ───
  const OrderCard = ({ order }: { order: any }) => {
    const isUpdating = updatingIds.has(order._id);
    const isOpenTab = order.details?.paymentStatus === "open_tab";

    return (
      <div className={`order-card-luxury ${getStatusClass(order.status)} ${isOpenTab ? "open-tab-card" : ""}`}>
        <div className="gold-top-border"></div>

        <div className="order-card-header">
          <div className="order-id">
            {getModeIcon(order.mode, order.details)}
            <span className="id-number">#{order._id.slice(-6).toUpperCase()}</span>
            {order.fcmToken && (
              <span className="fcm-indicator" title="Notifications actives">
                <BellRing size={12} />
              </span>
            )}
            {isOpenTab && (
              <span className="open-tab-badge-card" title="Tab ouverte — paiement en fin de repas">
                <CreditCard size={11} /> Tab
              </span>
            )}
            {order.isPaid && (
              <span className="paid-badge-card" style={{ background: "#27ae60", color: "white", padding: "2px 6px", borderRadius: "12px", fontSize: "0.65rem", marginLeft: "6px" }}>
                ✅ Payé
              </span>
            )}
          </div>
          <div className="order-time">
            <Clock size={12} />
            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="order-card-body">
          <div className="order-origin">{getOrderOrigin(order)}</div>
          <div className="order-details-section">{getOrderDetails(order)}</div>

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
        </div>

        <div className="order-card-footer">
          <div className={`status-pill-luxury ${getStatusClass(order.status)}`}>
            <span className="status-dot"></span>
            <span>{getStatusLabel(order.status)}</span>
          </div>

          <div className="order-actions-luxury">
            {order.status === "pending" && (
              <button className="action-btn cooking" disabled={isUpdating} onClick={() => updateOrderStatus(order._id, "cooking")}>
                {isUpdating ? <span className="spinner-small" /> : <Clock size={14} />}
                <span>Cuisine</span>
              </button>
            )}
            {order.status === "cooking" && (
              <button className="action-btn done" disabled={isUpdating} onClick={() => updateOrderStatus(order._id, "done")}>
                {isUpdating ? <span className="spinner-small" /> : <CheckCircle size={14} />}
                <span>Terminer</span>
              </button>
            )}
            {order.status === "done" && (
              <button className="action-btn archive" disabled={isUpdating} onClick={() => updateOrderStatus(order._id, "archived")}>
                {isUpdating ? <span className="spinner-small" /> : <Archive size={14} />}
                <span>Archiver</span>
              </button>
            )}
            <button
              className="action-btn icon-only"
              title="Notification personnalisée"
              onClick={() => {
                const message = prompt("Message personnalisé :");
                if (message) sendCustomNotification(order._id, "📢 Message du restaurant", message);
              }}
            >
              <Bell size={16} />
            </button>
            <button className="action-btn icon-only" title="Voir détails"><Eye size={16} /></button>
            <button className="action-btn icon-only" title="Imprimer"><Printer size={16} /></button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Carte groupe de table AVEC BOUTON PAYÉ ───
  const TableGroupCard = ({ group }: { group: TableGroup }) => {
    const isExpanded = expandedTables.has(group.tableNumber);
    const isSending = sendingBillIds.has(group.tableNumber);
    const isClosing = closingTabIds.has(group.tableNumber);
    const pendingCount = group.orders.filter(o => o.status === "pending").length;
    const cookingCount = group.orders.filter(o => o.status === "cooking").length;
    const doneCount = group.orders.filter(o => o.status === "done").length;

    const toggleExpand = () => {
      setExpandedTables(prev => {
        const next = new Set(prev);
        if (next.has(group.tableNumber)) next.delete(group.tableNumber);
        else next.add(group.tableNumber);
        return next;
      });
    };

    return (
      <div className="table-group-card">
        <div className="table-group-header" onClick={toggleExpand}>
          <div className="table-group-left">
            <div className="table-group-icon">
              <Utensils size={20} />
            </div>
            <div className="table-group-info">
              <h3 className="table-group-title">Table {group.tableNumber}</h3>
              <div className="table-group-meta">
                <span className="tg-meta-item">
                  <Receipt size={12} /> {group.orders.length} commande{group.orders.length > 1 ? "s" : ""}
                </span>
                {pendingCount > 0 && <span className="tg-badge pending">{pendingCount} en attente</span>}
                {cookingCount > 0 && <span className="tg-badge cooking">{cookingCount} en cuisine</span>}
                {doneCount > 0 && <span className="tg-badge done">{doneCount} servi{doneCount > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>

          <div className="table-group-right">
            <div className="table-group-total">
              <span className="tg-total-label">Cumul</span>
              <span className="tg-total-amount">{group.totalCumule.toFixed(2)}€</span>
            </div>

            {/* BOUTON ENVOYER L'ADDITION */}
            <button
              className={`send-bill-btn ${isSending ? "sending" : ""}`}
              disabled={isSending}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmModal({
                  show: true,
                  title: `Envoyer l'addition — Table ${group.tableNumber}`,
                  message: `Vous allez envoyer l'addition de ${group.totalCumule.toFixed(2)}€ au client de la table ${group.tableNumber}. Il ne pourra plus commander tant qu'il n'aura pas payé.`,
                  onConfirm: () => {
                    setConfirmModal(m => ({ ...m, show: false }));
                    sendBillToTable(group);
                  }
                });
              }}
              title="Envoyer l'addition au client"
            >
              {isSending ? <span className="spinner-small" /> : <Receipt size={16} />}
              <span>{isSending ? "Envoi..." : "L'addition"}</span>
            </button>

            {/* NOUVEAU BOUTON PAYÉ / FERMER LA TAB */}
            <button
              className={`close-tab-btn ${isClosing ? "closing" : ""}`}
              disabled={isClosing}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmModal({
                  show: true,
                  title: `💰 Paiement encaissé — Table ${group.tableNumber}`,
                  message: `Confirmez-vous que la table ${group.tableNumber} a bien réglé ${group.totalCumule.toFixed(2)}€ ?\n\nLes commandes seront marquées comme payées et la tab sera fermée.`,
                  onConfirm: () => {
                    setConfirmModal(m => ({ ...m, show: false }));
                    closeTabAndMarkPaid(group);
                  }
                });
              }}
              title="Marquer comme payé et fermer la tab"
            >
              {isClosing ? <span className="spinner-small" /> : <CheckCircle size={16} />}
              <span>{isClosing ? "Fermeture..." : "Payé"}</span>
            </button>

            <button className="tg-expand-btn" onClick={toggleExpand}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="table-group-orders">
            {group.orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="orders-page">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

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
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #ddd", background: "white", color: "#6B5B57", cursor: "pointer", fontWeight: 600 }}
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#D4AF37", color: "white", cursor: "pointer", fontWeight: 700 }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="orders-header-luxury">
        <div className="header-seal-terracotta"><ShoppingBag size={24} /></div>
        <span className="header-badge-gold">Gestion des Commandes</span>
        <h1 className="header-title-terracotta">Commandes en temps réel</h1>
        <p className="header-subtitle">Total: {orders.length} commandes</p>
        <div className="header-gold-line"></div>
      </header>

      <div className="revenue-panel-luxury">
        <div className="revenue-card-luxury">
          <div className="rev-icon-gold"><Wallet size={24} /></div>
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
              <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
              <span className="to-text">→</span>
              <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
            </div>
          )}

          <button className="btn-download-gold" onClick={downloadExcel}><Download size={18} /><span>Exporter Excel</span></button>
          <button className="btn-delete-archived" onClick={deleteArchivedOrders}><Trash2 size={18} /><span>Vider archives</span></button>
          <button className="btn-delete-all" onClick={deleteAllOrders}><Trash2 size={18} /><span>Tout effacer</span></button>
        </div>
      </div>

      <div className="stats-grid-luxury">
        <div className="stat-card-luxury highlight">
          <div className="stat-icon period"><ListOrdered size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.length}</span>
            <span className="stat-label">Commandes</span>
          </div>
        </div>
        <div className="stat-card-luxury">
          <div className="stat-icon pending"><AlertCircle size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.filter(o => o.status === "pending").length}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card-luxury">
          <div className="stat-icon cooking"><Clock size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.filter(o => o.status === "cooking").length}</span>
            <span className="stat-label">En cuisine</span>
          </div>
        </div>
        <div className="stat-card-luxury">
          <div className="stat-icon done"><CheckCircle size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{filteredOrders.filter(o => o.status === "done").length}</span>
            <span className="stat-label">Prêts / Servis</span>
          </div>
        </div>
        <div className="stat-card-luxury" style={{ borderColor: "rgba(212,175,55,0.4)" }}>
          <div className="stat-icon" style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37" }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{tableGroups.length}</span>
            <span className="stat-label">Tables actives</span>
          </div>
        </div>
      </div>

      <div className="view-toggle-bar">
        <button
          className={`view-toggle-btn ${viewMode === "all" ? "active" : ""}`}
          onClick={() => setViewMode("all")}
        >
          <ListOrdered size={16} />
          <span>Toutes les commandes</span>
        </button>
        <button
          className={`view-toggle-btn ${viewMode === "tables" ? "active" : ""}`}
          onClick={() => setViewMode("tables")}
        >
          <Users size={16} />
          <span>Par table</span>
          {tableGroups.length > 0 && (
            <span className="toggle-badge">{tableGroups.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="loading-luxury">
          <Sparkles size={30} className="spinner-gold" />
          <span>Chargement des commandes...</span>
        </div>
      ) : viewMode === "tables" ? (
        tableGroups.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">🍽️</div>
            <h3>Aucune table active</h3>
            <p>Aucune commande "sur place" en cours pour le moment</p>
          </div>
        ) : (
          <div className="table-groups-list">
            {tableGroups.map(group => (
              <TableGroupCard key={group.tableNumber} group={group} />
            ))}
          </div>
        )
      ) : (
        filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📭</div>
            <h3>Aucune commande</h3>
            <p>Aucune commande trouvée pour cette période</p>
          </div>
        ) : (
          <div className="orders-grid-luxury">
            {filteredOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )
      )}

      <style>{`
        .toast-notification {
          position: fixed; top: 20px; right: 20px;
          padding: 12px 20px; border-radius: 8px; color: white;
          font-weight: 500; z-index: 10000;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .toast-notification.success { background: linear-gradient(135deg, #27ae60, #2ecc71); }
        .toast-notification.error   { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .toast-notification.info    { background: linear-gradient(135deg, #3498db, #2980b9); }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .view-toggle-bar {
          display: flex; gap: 8px;
          padding: 0 24px 16px;
          border-bottom: 1px solid rgba(212,175,55,0.15);
          margin-bottom: 8px;
        }
        .view-toggle-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          border: 1px solid rgba(212,175,55,0.3);
          background: transparent; color: rgba(255,255,255,0.6);
          cursor: pointer; font-size: 0.85rem; font-weight: 500;
          transition: all 0.2s;
        }
        .view-toggle-btn.active {
          background: rgba(212,175,55,0.15);
          border-color: #D4AF37; color: #D4AF37;
        }
        .toggle-badge {
          background: #D4AF37; color: #1a0a00;
          border-radius: 20px; padding: 2px 8px;
          font-size: 0.75rem; font-weight: 700;
        }

        .table-groups-list {
          display: flex; flex-direction: column; gap: 16px;
          padding: 16px 24px;
        }
        .table-group-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .table-group-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; cursor: pointer;
          transition: background 0.2s;
        }
        .table-group-header:hover { background: rgba(212,175,55,0.05); }
        .table-group-left { display: flex; align-items: center; gap: 16px; }
        .table-group-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3);
          display: flex; align-items: center; justify-content: center; color: #D4AF37;
        }
        .table-group-title {
          font-family: "Playfair Display", serif;
          font-size: 1.2rem; color: #fff; margin: 0 0 6px;
        }
        .table-group-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .tg-meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: rgba(255,255,255,0.5); }
        .tg-badge {
          font-size: 0.7rem; font-weight: 600; padding: 2px 8px;
          border-radius: 20px;
        }
        .tg-badge.pending { background: rgba(243,156,18,0.2); color: #F39C12; }
        .tg-badge.cooking { background: rgba(231,76,60,0.2); color: #E74C3C; }
        .tg-badge.done    { background: rgba(39,174,96,0.2); color: #27AE60; }

        .table-group-right { display: flex; align-items: center; gap: 12px; }
        .table-group-total { text-align: right; }
        .tg-total-label { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
        .tg-total-amount { font-size: 1.3rem; font-weight: 700; color: #D4AF37; font-family: "Playfair Display", serif; }

        .send-bill-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px;
          background: linear-gradient(135deg, #D4AF37, #B8962E);
          border: none; color: #1a0a00;
          font-weight: 700; font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 4px 15px rgba(212,175,55,0.3);
        }
        .send-bill-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212,175,55,0.45);
        }
        .send-bill-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .send-bill-btn.sending { background: rgba(212,175,55,0.3); color: #D4AF37; }

        /* ─── BOUTON PAYÉ / FERMER LA TAB ─── */
        .close-tab-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px;
          background: linear-gradient(135deg, #27ae60, #1e8449);
          border: none; color: white;
          font-weight: 700; font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 4px 15px rgba(39,174,96,0.3);
        }
        .close-tab-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(39,174,96,0.45);
        }
        .close-tab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .close-tab-btn.closing { background: rgba(39,174,96,0.3); color: white; }

        .tg-expand-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .tg-expand-btn:hover { background: rgba(255,255,255,0.1); }

        .table-group-orders {
          padding: 0 16px 16px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 12px;
          border-top: 1px solid rgba(212,175,55,0.1);
          padding-top: 16px;
        }

        .open-tab-badge-card {
          display: inline-flex; align-items: center; gap: 4px;
          margin-left: 6px; font-size: 0.65rem; font-weight: 700;
          background: rgba(212,175,55,0.2); color: #D4AF37;
          border: 1px solid rgba(212,175,55,0.4);
          padding: 2px 6px; border-radius: 20px;
        }
        .open-tab-badge-small {
          font-size: 0.65rem; font-weight: 600;
          background: rgba(212,175,55,0.15); color: #D4AF37;
          padding: 1px 6px; border-radius: 10px; margin-left: 4px;
        }
        .open-tab-card { border-color: rgba(212,175,55,0.35) !important; }

        .fcm-indicator {
          display: inline-flex; align-items: center;
          margin-left: 8px; color: #2ecc71;
          background: rgba(46,204,113,0.1);
          padding: 2px 6px; border-radius: 12px;
        }
        .spinner-small {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%; border-top-color: white;
          animation: spin 0.6s linear infinite;
          display: inline-block; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .action-btn:disabled { opacity: 0.6; cursor: not-allowed; pointer-events: none; }
        .order-details-section {
          background: rgba(0,0,0,0.2); border-radius: 8px;
          padding: 8px 12px; margin: 8px 0; font-size: 0.75rem;
        }
        .detail-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; color: rgba(255,255,255,0.7); }
        .detail-icon { color: #D4AF37; flex-shrink: 0; }
        .delivery-fee { color: #D4AF37; font-weight: 500; }
        .deposit-badge {
          display: inline-block; margin-left: 8px; font-size: 0.7rem;
          background: rgba(212,175,55,0.2); color: #D4AF37;
          padding: 2px 6px; border-radius: 12px;
        }
        .paid-badge-card {
          background: #27ae60; color: white;
          padding: 2px 6px; border-radius: 12px;
          font-size: 0.65rem; margin-left: 6px;
          display: inline-flex; align-items: center; gap: 3px;
        }
      `}</style>
    </div>
  );
}