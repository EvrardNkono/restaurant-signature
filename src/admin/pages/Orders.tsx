// src/admin/pages/Orders.tsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ShoppingBag, Clock, CheckCircle, AlertCircle, Eye,
  Printer, Utensils, Package, Download, Calendar, Wallet,
  ListOrdered, Archive, Truck, Sparkles, Bell, BellRing,
  Phone, Mail, MapPin, Clock as ClockIcon, Trash2,
  Receipt, Users, ChevronDown, ChevronUp, CreditCard,
} from "lucide-react";
import axios from "axios";
import "./Orders.css";
import * as XLSX from "xlsx";

/* ── Config ───────────────────────────────────────────────── */
const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

/* ── Types ────────────────────────────────────────────────── */
interface TableGroup {
  tableNumber: string;
  orders: any[];
  totalCumule: number;
  clientIds: string[];
  fcmTokens: string[];
  hasOpenTab: boolean;
}

/* ── Helpers ──────────────────────────────────────────────── */
const STATUS_LABEL: Record<string, string> = {
  pending:         "En attente",
  pending_payment: "En attente",
  cooking:         "En cuisine",
  done:            "Prêt / Servi",
  archived:        "Archivée",
};

const getStatusLabel = (s: string) => STATUS_LABEL[s] ?? "En attente";

/* pending_payment est traité comme pending côté affichage et actions */
const normalizeStatus = (s: string) =>
  s === "pending_payment" ? "pending" : s;

const getStatusClass = (s: string) => {
  const map: Record<string, string> = {
    pending: "s-pending",
    cooking: "s-cooking",
    done:    "s-done",
    archived:"s-archived",
  };
  return map[normalizeStatus(s)] ?? "s-pending";
};

/* ─────────────────────────────────────────────────────────── */
export default function Orders() {
  const [orders,        setOrders]        = useState<any[]>([]);
  const [filteredOrders,setFilteredOrders] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [totalRevenue,  setTotalRevenue]  = useState(0);
  const [updatingIds,   setUpdatingIds]   = useState<Set<string>>(new Set());

  const [activeFilter,  setActiveFilter]  = useState("365");
  const [customRange,   setCustomRange]   = useState({ start: "", end: "" });
  const [viewMode,      setViewMode]      = useState<"all" | "tables">("all");
  const [expandedTables,setExpandedTables] = useState<Set<string>>(new Set());
  const [sendingBillIds,setSendingBillIds] = useState<Set<string>>(new Set());
  const [closingTabIds, setClosingTabIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({
    show: false, message: "", type: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean; title: string; message: string; onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  /* keep refs in sync for interval callback */
  const activeFilterRef = useRef(activeFilter);
  const customRangeRef  = useRef(customRange);
  activeFilterRef.current = activeFilter;
  customRangeRef.current  = customRange;

  /* ── Toast ─────────────────────────────────────────────── */
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  /* ── Filter ────────────────────────────────────────────── */
  const applyFilter = useCallback(
    (allOrders: any[], period: string, range: { start: string; end: string }) => {
      let filtered = [...allOrders];
      const now = new Date();

      if (period === "custom" && range.start && range.end) {
        const start = new Date(range.start);
        const end   = new Date(range.end);
        end.setHours(23, 59, 59);
        filtered = allOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d >= start && d <= end;
        });
      } else {
        const startDate = new Date();
        if      (period === "7")  startDate.setDate(now.getDate() - 7);
        else if (period === "14") startDate.setDate(now.getDate() - 14);
        else if (period === "30") startDate.setMonth(now.getMonth() - 1);
        else startDate.setFullYear(now.getFullYear() - 1);
        filtered = allOrders.filter(o => new Date(o.createdAt) >= startDate);
      }

      const revenue = filtered
        .filter(o => normalizeStatus(o.status) === "done" || o.status === "archived")
        .reduce((acc, o) => acc + parseFloat(o.total || 0), 0);

      setFilteredOrders(filtered);
      setTotalRevenue(revenue);
    },
    [],
  );

  /* ── Fetch ─────────────────────────────────────────────── */
  const fetchOrders = useCallback(async () => {
    try {
      const res  = await axios.get(`${BASE_API}/orders`);
      const data = res.data.data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(data);
      applyFilter(data, activeFilterRef.current, customRangeRef.current);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  }, [applyFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const id = setInterval(fetchOrders, 15000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  useEffect(() => {
    applyFilter(orders, activeFilter, customRange);
  }, [activeFilter, customRange, orders, applyFilter]);

  /* ── Table groups ───────────────────────────────────────── */
  const tableGroups = useMemo<TableGroup[]>(() => {
    const openTabOrders = orders.filter(
      o => o.details?.paymentStatus === "open_tab" &&
           o.status !== "archived" &&
           o.details?.tableNumber,
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
      if (order.clientId && !grouped[table].clientIds.includes(order.clientId))
        grouped[table].clientIds.push(order.clientId);
      if (order.fcmToken && !grouped[table].fcmTokens.includes(order.fcmToken))
        grouped[table].fcmTokens.push(order.fcmToken);
    });

    return Object.values(grouped).sort(
      (a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber),
    );
  }, [orders]);

  /* ── Actions ────────────────────────────────────────────── */
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (updatingIds.has(orderId)) return;
    const now = new Date().toISOString();
    setUpdatingIds(prev => new Set(prev).add(orderId));

    const patch = (list: any[]) =>
      list.map(o => o._id === orderId ? { ...o, status: newStatus, updatedAt: now } : o);
    setOrders(prev => patch(prev));
    setFilteredOrders(prev => patch(prev));

    try {
      await axios.put(`${BASE_API}/orders/${orderId}`, { status: newStatus, updatedAt: now });
      showToast(`✅ Statut mis à jour : ${getStatusLabel(newStatus)}`);
      axios
        .post(`${BASE_API}/notifications/order-status`, { orderId, newStatus })
        .catch(err => console.warn("⚠️ Notification:", err.message));
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.response?.data?.message || err.message}`, "error");
      fetchOrders();
    } finally {
      setUpdatingIds(prev => { const n = new Set(prev); n.delete(orderId); return n; });
    }
  };

  const sendCustomNotification = async (orderId: string, title: string, body: string) => {
    try {
      const res = await axios.post(`${BASE_API}/notifications/custom-notification`, { orderId, title, body });
      if (res.data.success) showToast("✅ Notification personnalisée envoyée");
      else showToast(`⚠️ Échec: ${res.data.message}`, "error");
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    }
  };

  const sendBillToTable = async (group: TableGroup) => {
    const key = group.tableNumber;
    if (sendingBillIds.has(key)) return;
    setSendingBillIds(prev => new Set(prev).add(key));
    try {
      await axios.post(`${BASE_API}/bills`, {
        tableNumber: group.tableNumber,
        clientIds:   group.clientIds,
        fcmTokens:   group.fcmTokens,
        orderIds:    group.orders.map(o => o._id),
        total:       group.totalCumule,
        status:      "pending",
      });
      if (group.fcmTokens.length > 0) {
        await axios.post(`${BASE_API}/notifications/send-bill`, {
          fcmTokens:   group.fcmTokens,
          tableNumber: group.tableNumber,
          total:       group.totalCumule.toFixed(2),
        }).catch(() => {});
      }
      showToast(`🧾 Addition envoyée — Table ${group.tableNumber} (${group.totalCumule.toFixed(2)}€)`);
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    } finally {
      setSendingBillIds(prev => { const n = new Set(prev); n.delete(key); return n; });
    }
  };

  const closeTabAndMarkPaid = async (group: TableGroup) => {
    const key = group.tableNumber;
    if (closingTabIds.has(key)) return;
    setClosingTabIds(prev => new Set(prev).add(key));
    try {
      const billsRes   = await axios.get(`${BASE_API}/bills?status=pending`);
      const pendingBill = billsRes.data.data.find((b: any) => b.tableNumber === group.tableNumber);
      if (pendingBill) {
        await axios.post(`${BASE_API}/bills/${pendingBill._id}/close-tab`, {
          clientId:    group.clientIds[0],
          tableNumber: group.tableNumber,
        });
      } else {
        for (const order of group.orders) {
          await axios.put(`${BASE_API}/orders/${order._id}`, {
            "details.paymentStatus": "closed",
            isPaid: true,
            paidAt: new Date().toISOString(),
          });
        }
      }
      if (group.fcmTokens.length > 0) {
        await axios.post(`${BASE_API}/notifications/payment-confirmed`, {
          fcmTokens:   group.fcmTokens,
          tableNumber: group.tableNumber,
          total:       group.totalCumule.toFixed(2),
        }).catch(err => console.warn("⚠️ Notification paiement:", err.message));
      }
      showToast(`✅ Table ${group.tableNumber} — Paiement enregistré, tab fermée`);
      fetchOrders();
    } catch (err: any) {
      showToast(`❌ Erreur: ${err.message}`, "error");
    } finally {
      setClosingTabIds(prev => { const n = new Set(prev); n.delete(key); return n; });
    }
  };

  const deleteArchivedOrders = () => {
    const archived = orders.filter(o => o.status === "archived");
    if (!archived.length) { showToast("Aucune commande archivée à supprimer", "info"); return; }
    setConfirmModal({
      show: true,
      title: "Supprimer les commandes archivées",
      message: `Vous allez supprimer définitivement ${archived.length} commande(s) archivée(s). Cette action est irréversible.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, show: false }));
        try {
          await Promise.all(archived.map(o => axios.delete(`${BASE_API}/orders/${o._id}`)));
          showToast(`✅ ${archived.length} commande(s) supprimée(s)`);
          fetchOrders();
        } catch (err: any) { showToast(`❌ Erreur: ${err.message}`, "error"); }
      },
    });
  };

  const deleteAllOrders = () => {
    setConfirmModal({
      show: true,
      title: "⚠️ Supprimer TOUTES les commandes",
      message: `Vous allez supprimer définitivement les ${orders.length} commande(s). Cette action est IRRÉVERSIBLE.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, show: false }));
        try {
          await Promise.all(orders.map(o => axios.delete(`${BASE_API}/orders/${o._id}`)));
          showToast("✅ Toutes les commandes ont été supprimées");
          fetchOrders();
        } catch (err: any) { showToast(`❌ Erreur: ${err.message}`, "error"); }
      },
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
      if (o.mode === "delivery")                        tableOrClient = o.customer?.name || "Livraison";
      else if (o.details?.tableNumber)                  tableOrClient = `Table ${o.details.tableNumber}`;
      else if (o.details?.consumeMode === "take_away")  tableOrClient = `À emporter (${o.customer?.name || "Client"})`;
      else                                              tableOrClient = o.customer?.name || "Sur place";

      const dateObj = new Date(o.createdAt);
      return {
        "ID Commande":       o._id.slice(-8).toUpperCase(),
        "Date":              dateObj.toLocaleDateString("fr-FR"),
        "Heure":             dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        "Jour":              dateObj.toLocaleDateString("fr-FR", { weekday: "long" }),
        "Mode":              o.mode === "delivery" ? "Livraison" : o.mode === "booking" ? "Réservation" : "Sur place",
        "Table / Client":    tableOrClient,
        "Téléphone":         o.customer?.phone || "-",
        "Email":             o.customer?.email || "-",
        "Adresse":           o.customer?.address || "-",
        "Heure livraison":   o.details?.deliveryTime || "-",
        "Service livraison": o.details?.deliveryService || "-",
        "Frais livraison":   o.details?.deliveryFee ? `${o.details.deliveryFee}€` : "-",
        "Date réservation":  o.details?.bookingSlot || "-",
        "Articles":          articlesDetails,
        "Quantité":          o.items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0),
        "Total TTC":         `${parseFloat(o.total).toFixed(2)} €`,
        "Montant payé":      `${parseFloat(o.amountPaid || 0).toFixed(2)} €`,
        "Statut":            getStatusLabel(o.status),
        "Tab ouverte":       o.details?.paymentStatus === "open_tab" ? "✅ Oui" : "Non",
        "Token FCM":         o.fcmToken ? "✅ Oui" : "❌ Non",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, `signature_commandes_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  /* ── Sub-components ─────────────────────────────────────── */

  const getModeIcon = (mode: string, details?: any) => {
    if (mode === "delivery")                      return <Truck    size={15} className="mode-icon delivery" />;
    if (mode === "booking")                       return <Calendar size={15} className="mode-icon booking" />;
    if (details?.consumeMode === "take_away")     return <Package  size={15} className="mode-icon takeaway" />;
    return <Utensils size={15} className="mode-icon onsite" />;
  };

  const getOriginRow = (order: any) => {
    if (order.mode === "delivery") return (
      <div className="origin-row">
        <Truck size={14} style={{ color: "var(--blue)" }} />
        <span>{order.customer?.name || "Client Livraison"}</span>
        {order.details?.deliveryService && (
          <span className="origin-sub delivery">{order.details.deliveryService}</span>
        )}
      </div>
    );
    if (order.mode === "booking") return (
      <div className="origin-row">
        <Calendar size={14} style={{ color: "var(--red)" }} />
        <span>{order.customer?.name || "Réservation"}</span>
        {order.details?.bookingSlot && (
          <span className="origin-sub booking">
            {new Date(order.details.bookingSlot).toLocaleString()}
          </span>
        )}
      </div>
    );
    if (order.details?.consumeMode === "take_away") return (
      <div className="origin-row">
        <Package size={14} style={{ color: "var(--orange)" }} />
        <span>À emporter</span>
        <span className="origin-sub delivery">{order.customer?.name || "Client"}</span>
      </div>
    );
    if (order.details?.tableNumber) return (
      <div className="origin-row">
        <Utensils size={14} style={{ color: "var(--gold)" }} />
        <span>Table {order.details.tableNumber}</span>
        {order.details?.paymentStatus === "open_tab" && (
          <span className="badge badge-tab"><CreditCard size={10} /> Tab</span>
        )}
      </div>
    );
    return (
      <div className="origin-row">
        <Utensils size={14} style={{ color: "var(--gold)" }} />
        <span>Sur place</span>
      </div>
    );
  };

  const getDetailBlock = (order: any) => {
    if (order.mode === "delivery") return (
      <div className="detail-block">
        <div className="detail-row"><Phone    size={13} /><span>{order.customer?.phone   || "Non renseigné"}</span></div>
        <div className="detail-row"><Mail     size={13} /><span>{order.customer?.email   || "Non renseigné"}</span></div>
        <div className="detail-row"><MapPin   size={13} /><span>{order.customer?.address || "Non renseignée"}</span></div>
        <div className="detail-row"><ClockIcon size={13}/><span>Livraison : {order.details?.deliveryTime || "Non spécifiée"}</span></div>
        {order.details?.deliveryFee > 0 && (
          <div className="detail-row"><Truck size={13} /><span>Frais : {order.details.deliveryFee}€</span></div>
        )}
      </div>
    );
    if (order.mode === "booking") return (
      <div className="detail-block">
        <div className="detail-row"><Phone    size={13} /><span>{order.customer?.phone || "Non renseigné"}</span></div>
        <div className="detail-row"><Mail     size={13} /><span>{order.customer?.email || "Non renseigné"}</span></div>
        <div className="detail-row"><Calendar size={13} /><span>
          Réservation : {order.details?.bookingSlot
            ? new Date(order.details.bookingSlot).toLocaleString()
            : "Non spécifiée"}
        </span></div>
        <div className="detail-row"><Wallet size={13} /><span>
          Acompte : {order.amountPaid?.toFixed(2) || "0"}€ / {order.total?.toFixed(2)}€
        </span></div>
      </div>
    );
    return null;
  };

  /* ── OrderCard ──────────────────────────────────────────── */
  const OrderCard = ({ order }: { order: any }) => {
    const isUpdating = updatingIds.has(order._id);
    const isOpenTab  = order.details?.paymentStatus === "open_tab";
    const ns         = normalizeStatus(order.status);
    const sc         = getStatusClass(order.status);

    return (
      <div className={`order-card ${sc} ${isOpenTab ? "open-tab-card" : ""}`}>
        {/* ─ Head ─ */}
        <div className="card-head">
          <div className="card-head-left">
            {getModeIcon(order.mode, order.details)}
            <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
            {order.fcmToken && (
              <span className="badge badge-fcm" title="Notifications actives">
                <BellRing size={10} />
              </span>
            )}
            {isOpenTab && (
              <span className="badge badge-tab">
                <CreditCard size={10} /> Tab
              </span>
            )}
            {order.isPaid && (
              <span className="badge badge-paid">✅ Payé</span>
            )}
          </div>
          <div className="card-time">
            <Clock size={11} />
            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>

        {/* ─ Body ─ */}
        <div className="card-body">
          {getOriginRow(order)}
          {getDetailBlock(order)}

          <div className="items-list">
            {order.items.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="item-row">
                <span className="item-qty">{item.quantity || 1}×</span>
                <span className="item-name">{item.name}</span>
                {item.chosenAccompaniment && item.chosenAccompaniment !== "Aucun" && (
                  <span className="item-acc">({item.chosenAccompaniment})</span>
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="items-more">+{order.items.length - 3} article(s)</div>
            )}
          </div>

          <div className="total-row">
            <span className="total-label">Total</span>
            {order.amountPaid > 0 && order.amountPaid < order.total && (
              <span className="deposit-badge">Acompte: {order.amountPaid.toFixed(2)}€</span>
            )}
            <span className="total-value">{parseFloat(order.total).toFixed(2)}€</span>
          </div>
        </div>

        {/* ─ Footer ─ */}
        <div className="card-footer">
          <span className={`status-pill ${sc}`}>
            <span className="status-dot" />
            {getStatusLabel(order.status)}
          </span>

          <div className="action-row">
            {ns === "pending" && (
              <button
                className="action-btn a-cooking"
                disabled={isUpdating}
                onClick={() => updateOrderStatus(order._id, "cooking")}
              >
                {isUpdating ? <span className="spinner" /> : <Clock size={13} />}
                En cuisine
              </button>
            )}
            {ns === "cooking" && (
              <button
                className="action-btn a-done"
                disabled={isUpdating}
                onClick={() => updateOrderStatus(order._id, "done")}
              >
                {isUpdating ? <span className="spinner" /> : <CheckCircle size={13} />}
                Terminer
              </button>
            )}
            {ns === "done" && (
              <button
                className="action-btn a-archive"
                disabled={isUpdating}
                onClick={() => updateOrderStatus(order._id, "archived")}
              >
                {isUpdating ? <span className="spinner" /> : <Archive size={13} />}
                Archiver
              </button>
            )}
            <button
              className="action-btn a-icon"
              title="Notification personnalisée"
              onClick={() => {
                const msg = prompt("Message personnalisé :");
                if (msg) sendCustomNotification(order._id, "📢 Message du restaurant", msg);
              }}
            >
              <Bell size={14} />
            </button>
            <button className="action-btn a-icon" title="Voir détails"><Eye     size={14} /></button>
            <button className="action-btn a-icon" title="Imprimer">    <Printer size={14} /></button>
          </div>
        </div>
      </div>
    );
  };

  /* ── TableGroupCard ─────────────────────────────────────── */
  const TableGroupCard = ({ group }: { group: TableGroup }) => {
    const isExpanded = expandedTables.has(group.tableNumber);
    const isSending  = sendingBillIds.has(group.tableNumber);
    const isClosing  = closingTabIds.has(group.tableNumber);
    const pendingCnt = group.orders.filter(o => normalizeStatus(o.status) === "pending").length;
    const cookingCnt = group.orders.filter(o => normalizeStatus(o.status) === "cooking").length;
    const doneCnt    = group.orders.filter(o => normalizeStatus(o.status) === "done").length;

    const toggle = () =>
      setExpandedTables(prev => {
        const n = new Set(prev);
        n.has(group.tableNumber) ? n.delete(group.tableNumber) : n.add(group.tableNumber);
        return n;
      });

    const confirmSendBill = () =>
      setConfirmModal({
        show: true,
        title: `Envoyer l'addition — Table ${group.tableNumber}`,
        message: `Vous allez envoyer l'addition de ${group.totalCumule.toFixed(2)}€ au client de la table ${group.tableNumber}. Il ne pourra plus commander tant qu'il n'aura pas payé.`,
        onConfirm: () => { setConfirmModal(m => ({ ...m, show: false })); sendBillToTable(group); },
      });

    const confirmCloseTab = () =>
      setConfirmModal({
        show: true,
        title: `💰 Paiement encaissé — Table ${group.tableNumber}`,
        message: `Confirmez-vous que la table ${group.tableNumber} a bien réglé ${group.totalCumule.toFixed(2)}€ ?\n\nLes commandes seront marquées comme payées, la tab sera fermée et le client recevra une confirmation.`,
        onConfirm: () => { setConfirmModal(m => ({ ...m, show: false })); closeTabAndMarkPaid(group); },
      });

    return (
      <div className="table-group-card">
        <div className="tg-header" onClick={toggle}>
          <div className="tg-left">
            <div className="tg-icon"><Utensils size={20} /></div>
            <div>
              <h3 className="tg-title">Table {group.tableNumber}</h3>
              <div className="tg-meta">
                <span className="tg-meta-item">
                  <Receipt size={11} /> {group.orders.length} commande{group.orders.length > 1 ? "s" : ""}
                </span>
                {pendingCnt > 0 && <span className="tg-badge pending">{pendingCnt} en attente</span>}
                {cookingCnt > 0 && <span className="tg-badge cooking">{cookingCnt} en cuisine</span>}
                {doneCnt    > 0 && <span className="tg-badge done">   {doneCnt}    servi{doneCnt > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>

          <div className="tg-right">
            <div className="tg-total-block">
              <span className="tg-total-label">Cumul</span>
              <span className="tg-total-value">{group.totalCumule.toFixed(2)}€</span>
            </div>

            <button
              className={`tg-btn tg-btn-bill ${isSending ? "sending" : ""}`}
              disabled={isSending}
              onClick={e => { e.stopPropagation(); confirmSendBill(); }}
            >
              {isSending ? <span className="spinner" style={{ borderTopColor: "#1A1210" }} /> : <Receipt size={15} />}
              <span>{isSending ? "Envoi..." : "L'addition"}</span>
            </button>

            <button
              className={`tg-btn tg-btn-paid ${isClosing ? "closing" : ""}`}
              disabled={isClosing}
              onClick={e => { e.stopPropagation(); confirmCloseTab(); }}
            >
              {isClosing ? <span className="spinner" /> : <CheckCircle size={15} />}
              <span>{isClosing ? "Fermeture..." : "Payé ✓"}</span>
            </button>

            <button className="tg-expand-btn" onClick={toggle}>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="tg-orders-grid">
            {group.orders.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    );
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="orders-page">

      {/* Toast */}
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      {/* Confirm modal */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">{confirmModal.title}</h3>
            <p className="modal-body">{confirmModal.message}</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setConfirmModal(m => ({ ...m, show: false }))}>
                Annuler
              </button>
              <button className="modal-confirm" onClick={confirmModal.onConfirm}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="orders-header">
        <div className="orders-header-left">
          <div className="header-icon"><ShoppingBag size={22} /></div>
          <div>
            <h1 className="header-title">Commandes</h1>
            <p className="header-subtitle">{orders.length} commande{orders.length > 1 ? "s" : ""} au total</p>
          </div>
        </div>
      </header>

      {/* Revenue + Filters */}
      <div className="revenue-bar">
        <div className="revenue-amount-block">
          <div className="revenue-icon"><Wallet size={22} /></div>
          <div>
            <span className="revenue-label">Encaissé sur la période</span>
            <span className="revenue-value">{totalRevenue.toFixed(2)}€</span>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-select-wrap">
            <Calendar size={16} />
            <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
              <option value="365">Tout l'historique</option>
              <option value="7">7 derniers jours</option>
              <option value="14">2 semaines</option>
              <option value="30">Dernier mois</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          {activeFilter === "custom" && (
            <div className="date-range">
              <input
                type="date"
                value={customRange.start}
                onChange={e => setCustomRange({ ...customRange, start: e.target.value })}
              />
              <span className="separator">→</span>
              <input
                type="date"
                value={customRange.end}
                onChange={e => setCustomRange({ ...customRange, end: e.target.value })}
              />
            </div>
          )}

          <button className="btn btn-gold"         onClick={downloadExcel}>       <Download size={15} /> Exporter Excel</button>
          <button className="btn btn-danger-soft"  onClick={deleteArchivedOrders}><Trash2   size={15} /> Vider archives</button>
          <button className="btn btn-danger"       onClick={deleteAllOrders}>     <Trash2   size={15} /> Tout effacer</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon-wrap gold"><ListOrdered size={20} /></div>
          <div>
            <span className="stat-value">{filteredOrders.length}</span>
            <span className="stat-label">Commandes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap orange"><AlertCircle size={20} /></div>
          <div>
            <span className="stat-value">{filteredOrders.filter(o => normalizeStatus(o.status) === "pending").length}</span>
            <span className="stat-label">En attente</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap blue"><Clock size={20} /></div>
          <div>
            <span className="stat-value">{filteredOrders.filter(o => normalizeStatus(o.status) === "cooking").length}</span>
            <span className="stat-label">En cuisine</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap green"><CheckCircle size={20} /></div>
          <div>
            <span className="stat-value">{filteredOrders.filter(o => normalizeStatus(o.status) === "done").length}</span>
            <span className="stat-label">Prêts / Servis</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap gold"><Users size={20} /></div>
          <div>
            <span className="stat-value">{tableGroups.length}</span>
            <span className="stat-label">Tables actives</span>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === "all" ? "active" : ""}`}
          onClick={() => setViewMode("all")}
        >
          <ListOrdered size={15} /> Toutes les commandes
        </button>
        <button
          className={`view-toggle-btn ${viewMode === "tables" ? "active" : ""}`}
          onClick={() => setViewMode("tables")}
        >
          <Users size={15} /> Par table
          {tableGroups.length > 0 && <span className="toggle-count">{tableGroups.length}</span>}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <Sparkles size={28} className="spin-gold" />
          <span>Chargement des commandes...</span>
        </div>
      ) : viewMode === "tables" ? (
        tableGroups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>Aucune table active</h3>
            <p>Aucune commande sur place en cours pour le moment</p>
          </div>
        ) : (
          <div className="table-groups-list">
            {tableGroups.map(g => <TableGroupCard key={g.tableNumber} group={g} />)}
          </div>
        )
      ) : (
        filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucune commande</h3>
            <p>Aucune commande trouvée pour cette période</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => <OrderCard key={order._id} order={order} />)}
          </div>
        )
      )}
    </div>
  );
}