// src/components/BillPopup.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Receipt, X, CreditCard, Banknote,
  Clock, CheckCircle, Sparkles, Utensils,
  ChevronRight, AlertCircle
} from "lucide-react";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

interface BillItem {
  name: string;
  quantity: number;
  price: number;
  chosenAccompaniment?: string;
  supplements?: { name: string; price: number }[];
}

interface Bill {
  _id: string;
  tableNumber: string;
  total: number;
  status: "pending" | "paid" | "closed";
  orderIds: string[];
  orders?: { items: BillItem[]; total: number; createdAt: string }[];
  createdAt: string;
}

interface BillPopupProps {
  /** Appelé quand une bill pending est détectée — pour bloquer le menu */
  onBillPending?: (pending: boolean) => void;
}

export default function BillPopup({ onBillPending }: BillPopupProps) {
  const clientId = localStorage.getItem("signature_client_id");

  const [bill, setBill] = useState<Bill | null>(null);
  const [visible, setVisible] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [tab, setTab] = useState<"summary" | "detail">("summary");

  // Timer de réapparition si fermé sans payer
  const reappearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Nettoyage des timers ───
  const clearTimers = () => {
    if (reappearTimerRef.current) clearTimeout(reappearTimerRef.current);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };

  // ─── Polling : vérifier si une bill pending existe pour ce client ───
  const checkBill = useCallback(async () => {
    if (!clientId) return;
    try {
      const res = await axios.get(`${BASE_API}/bills/check/${clientId}`);
      const data: Bill | null = res.data.bill || null;

      if (data && data.status === "pending") {
        setBill(data);
        setVisible(true);
        setPaid(false);
        onBillPending?.(true);
        // Annuler le timer de réapparition s'il tournait
        if (reappearTimerRef.current) clearTimeout(reappearTimerRef.current);
      } else if (data && data.status === "paid") {
        // Bill payée → on ferme proprement
        setBill(data);
        setPaid(true);
        setVisible(true);
        onBillPending?.(false);
        // Fermeture auto après 4s
        setTimeout(() => {
          setVisible(false);
          setBill(null);
          setPaid(false);
        }, 4000);
      } else {
        // Pas de bill → on s'assure que tout est clean
        if (!bill) onBillPending?.(false);
      }
    } catch {
      // Silencieux — réseau temporairement indisponible
    }
  }, [clientId, bill, onBillPending]);

  // ─── Lancer le polling dès le montage ───
  useEffect(() => {
    if (!clientId) return;
    checkBill(); // vérif immédiate
    pollIntervalRef.current = setInterval(checkBill, 10000);
    return () => clearTimers();
  }, [clientId]); // eslint-disable-line

  // ─── Fermer le popup (sans payer) → réapparaître dans 10s ───
  const handleDismiss = () => {
    setVisible(false);
    reappearTimerRef.current = setTimeout(() => {
      if (bill && !paid) setVisible(true);
    }, 10000);
  };

  // ─── Paiement en ligne via Stripe ───
  const handlePayOnline = async () => {
    if (!bill) return;
    setPayingOnline(true);
    try {
      // Construire les items Stripe depuis les commandes de la bill
      const stripeItems = (bill.orders || []).flatMap(order =>
        order.items.map((item: BillItem) => {
          const suppTotal = item.supplements?.reduce((s, sup) => s + sup.price, 0) || 0;
          return {
            name: item.name,
            price: (item.price + suppTotal) * (item.quantity || 1),
            quantity: 1,
            chosenAccompaniment: item.chosenAccompaniment || "Aucun",
          };
        })
      );

      const res = await axios.post(`${BASE_API}/payments/create-checkout-session`, {
        items: stripeItems.length > 0 ? stripeItems : [{ name: `Addition Table ${bill.tableNumber}`, price: bill.total, quantity: 1 }],
        billId: bill._id,
        mode: "bill",
        depositPercentage: 100,
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setPayingOnline(false);
        alert("Erreur lors de la redirection vers le paiement.");
      }
    } catch (err: any) {
      setPayingOnline(false);
      alert(`Erreur : ${err.message}`);
    }
  };

  // ─── Paiement à la caisse → notifier le serveur ───
  // ─── Paiement à la caisse → ferme la tab et débloque le menu ───
const handlePayAtCounter = async () => {
  if (!bill) return;
  setPayingOnline(true);
  try {
    // Appeler la nouvelle route close-tab
    await axios.post(`${BASE_API}/bills/${bill._id}/close-tab`, {
      clientId,
      tableNumber: bill.tableNumber,
    });
    
    // Marquer comme payé localement
    setPaid(true);
    onBillPending?.(false);
    
    // Notification locale
    showToastLocal("✅ Paiement enregistré ! Vous pouvez recommander.");
    
    // Fermer le popup après 2 secondes
    setTimeout(() => {
      setVisible(false);
      setBill(null);
      setPayingOnline(false);
    }, 2000);
    
  } catch (error) {
    setPayingOnline(false);
    showToastLocal("❌ Erreur lors du paiement, appelez le serveur.");
  }
};

  // ─── Mini toast local ───
  const [localToast, setLocalToast] = useState<string | null>(null);
  const showToastLocal = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 4000);
  };

  // ─── Regrouper tous les articles de toutes les commandes ───
  const allItems = bill?.orders?.flatMap(o => o.items) || [];
  const mergedItems = allItems.reduce<(BillItem & { totalLine: number })[]>((acc, item) => {
    const suppTotal = item.supplements?.reduce((s, sup) => s + sup.price, 0) || 0;
    const unitFull = item.price + suppTotal;
    const existing = acc.find(i => i.name === item.name && i.chosenAccompaniment === item.chosenAccompaniment);
    if (existing) {
      existing.quantity += item.quantity || 1;
      existing.totalLine += unitFull * (item.quantity || 1);
    } else {
      acc.push({ ...item, totalLine: unitFull * (item.quantity || 1) });
    }
    return acc;
  }, []);

  if (!visible || !bill) return (
    <>
      {localToast && <LocalToast message={localToast} />}
    </>
  );

  // ─── ÉCRAN "PAYÉ" ───
  if (paid) {
    return (
      <div className="bill-overlay">
        <div className="bill-popup bill-paid-screen">
          <div className="paid-icon-wrapper">
            <div className="paid-icon-ring">
              <CheckCircle size={48} color="#27AE60" />
            </div>
          </div>
          <h2 className="paid-title">Merci !</h2>
          <p className="paid-subtitle">Votre paiement a bien été enregistré.<br />Bonne continuation 🍾</p>
          <div className="paid-sparkles">
            {[...Array(6)].map((_, i) => (
              <Sparkles key={i} className={`paid-sparkle ps-${i}`} size={16} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── ÉCRAN PRINCIPAL ───
  return (
    <>
      {localToast && <LocalToast message={localToast} />}

      <div className="bill-overlay">
        <div className="bill-popup">

          {/* ── Barre dorée en haut ── */}
          <div className="bill-gold-bar" />

          {/* ── Header ── */}
          <div className="bill-header">
            <div className="bill-header-left">
              <div className="bill-icon-circle">
                <Receipt size={22} color="#D4AF37" />
              </div>
              <div>
                <h2 className="bill-title">Votre Addition</h2>
                <p className="bill-subtitle">Table {bill.tableNumber} · {bill.orderIds.length} commande{bill.orderIds.length > 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Bouton fermer — réapparaît dans 10s */}
            <button className="bill-dismiss-btn" onClick={handleDismiss} title="Fermer (réapparaîtra dans 10s)">
              <X size={18} />
            </button>
          </div>

          {/* ── Avertissement blocage ── */}
          <div className="bill-warning-bar">
            <AlertCircle size={14} />
            <span>Les nouvelles commandes sont suspendues jusqu'au règlement</span>
          </div>

          {/* ── Onglets résumé / détail ── */}
          <div className="bill-tabs">
            <button
              className={`bill-tab ${tab === "summary" ? "active" : ""}`}
              onClick={() => setTab("summary")}
            >
              <Receipt size={14} /> Résumé
            </button>
            <button
              className={`bill-tab ${tab === "detail" ? "active" : ""}`}
              onClick={() => setTab("detail")}
            >
              <Utensils size={14} /> Détail
            </button>
          </div>

          {/* ── Contenu ── */}
          <div className="bill-content">
            {tab === "summary" ? (
              <div className="bill-summary">
                <div className="bill-summary-row">
                  <span>Nombre de commandes</span>
                  <span>{bill.orderIds.length}</span>
                </div>
                <div className="bill-summary-row">
                  <span>Articles commandés</span>
                  <span>{allItems.reduce((s, i) => s + (i.quantity || 1), 0)}</span>
                </div>
                <div className="bill-summary-divider" />
                <div className="bill-summary-row total">
                  <span>Total à régler</span>
                  <span className="bill-total-amount">{bill.total.toFixed(2)}€</span>
                </div>
              </div>
            ) : (
              <div className="bill-detail">
                {mergedItems.length > 0 ? (
                  mergedItems.map((item, idx) => (
                    <div key={idx} className="bill-detail-row">
                      <div className="bill-detail-left">
                        <span className="bill-qty">{item.quantity}×</span>
                        <div>
                          <span className="bill-item-name">{item.name}</span>
                          {item.chosenAccompaniment && item.chosenAccompaniment !== "Aucun" && (
                            <span className="bill-item-acc">+ {item.chosenAccompaniment}</span>
                          )}
                          {item.supplements && item.supplements.length > 0 && (
                            <div className="bill-item-supps">
                              {item.supplements.map((s, i) => (
                                <span key={i} className="bill-supp-tag">+{s.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="bill-detail-price">{item.totalLine.toFixed(2)}€</span>
                    </div>
                  ))
                ) : (
                  // Fallback si orders pas peuplés
                  <div className="bill-detail-fallback">
                    <Receipt size={32} color="rgba(212,175,55,0.4)" />
                    <p>Total de votre repas</p>
                    <span className="bill-total-amount">{bill.total.toFixed(2)}€</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Total fixe en bas ── */}
          <div className="bill-footer-total">
            <span>Total</span>
            <span className="bill-footer-amount">{bill.total.toFixed(2)}€</span>
          </div>

          {/* ── Actions de paiement ── */}
          <div className="bill-actions">
            <button
              className="bill-pay-btn online"
              onClick={handlePayOnline}
              disabled={payingOnline}
            >
              {payingOnline ? (
                <span className="bill-spinner" />
              ) : (
                <CreditCard size={18} />
              )}
              <span>{payingOnline ? "Redirection..." : "Payer en ligne"}</span>
              <ChevronRight size={16} className="btn-arrow" />
            </button>

            <button className="bill-pay-btn counter" onClick={handlePayAtCounter}>
              <Banknote size={18} />
              <span>Payer à la caisse</span>
              <ChevronRight size={16} className="btn-arrow" />
            </button>
          </div>

          {/* ── Indicateur réapparition ── */}
          <div className="bill-reappear-hint">
            <Clock size={11} />
            <span>Ce popup réapparaîtra automatiquement si non réglé</span>
          </div>

        </div>
      </div>

      <style>{`
        /* ════════ OVERLAY ════════ */
        .bill-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 99999;
          padding: 0;
          animation: overlayIn 0.3s ease;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        /* ════════ POPUP ════════ */
        .bill-popup {
          background: linear-gradient(160deg, #1C1008 0%, #0f0800 100%);
          border: 1px solid rgba(212,175,55,0.35);
          border-bottom: none;
          border-radius: 28px 28px 0 0;
          width: 100%; max-width: 480px;
          max-height: 92vh;
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 -20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1);
          animation: popupUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popupUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* ── Barre dorée ── */
        .bill-gold-bar {
          height: 3px;
          background: linear-gradient(90deg, transparent, #D4AF37, #F5D98B, #D4AF37, transparent);
        }

        /* ── Header ── */
        .bill-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 20px 12px;
        }
        .bill-header-left { display: flex; align-items: center; gap: 14px; }
        .bill-icon-circle {
          width: 48px; height: 48px; border-radius: 14px;
          background: rgba(212,175,55,0.12);
          border: 1px solid rgba(212,175,55,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .bill-title {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.25rem; color: #fff; margin: 0 0 3px;
        }
        .bill-subtitle { font-size: 0.78rem; color: rgba(255,255,255,0.45); margin: 0; }

        .bill-dismiss-btn {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .bill-dismiss-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        /* ── Warning bar ── */
        .bill-warning-bar {
          display: flex; align-items: center; gap: 8px;
          margin: 0 20px 14px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(231,76,60,0.1);
          border: 1px solid rgba(231,76,60,0.3);
          color: #e74c3c; font-size: 0.75rem; font-weight: 500;
        }

        /* ── Tabs ── */
        .bill-tabs {
          display: flex; gap: 6px;
          padding: 0 20px 14px;
        }
        .bill-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.45);
          font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
        }
        .bill-tab.active {
          background: rgba(212,175,55,0.15);
          border-color: rgba(212,175,55,0.4);
          color: #D4AF37;
        }

        /* ── Contenu scrollable ── */
        .bill-content {
          flex: 1; overflow-y: auto;
          padding: 0 20px;
          scrollbar-width: thin;
          scrollbar-color: rgba(212,175,55,0.3) transparent;
        }

        /* Résumé */
        .bill-summary { padding: 8px 0; }
        .bill-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; font-size: 0.88rem;
          color: rgba(255,255,255,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .bill-summary-row.total {
          color: #fff; font-weight: 700; font-size: 1rem;
          border-bottom: none; padding-top: 14px;
        }
        .bill-summary-divider { height: 1px; background: rgba(212,175,55,0.2); margin: 8px 0; }
        .bill-total-amount { color: #D4AF37; font-size: 1.3rem; font-family: "Playfair Display", serif; }

        /* Détail */
        .bill-detail { padding: 4px 0 8px; }
        .bill-detail-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 12px;
        }
        .bill-detail-left { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
        .bill-qty {
          font-size: 0.75rem; font-weight: 700;
          background: rgba(212,175,55,0.15); color: #D4AF37;
          padding: 2px 6px; border-radius: 6px; flex-shrink: 0;
          margin-top: 2px;
        }
        .bill-item-name { font-size: 0.88rem; color: #fff; display: block; }
        .bill-item-acc { font-size: 0.72rem; color: rgba(212,175,55,0.7); display: block; margin-top: 2px; }
        .bill-item-supps { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
        .bill-supp-tag {
          font-size: 0.68rem; background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.5); padding: 1px 6px; border-radius: 6px;
        }
        .bill-detail-price { font-size: 0.9rem; font-weight: 600; color: #D4AF37; flex-shrink: 0; }
        .bill-detail-fallback {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 24px 0; color: rgba(255,255,255,0.4);
          font-size: 0.85rem;
        }

        /* ── Total fixe ── */
        .bill-footer-total {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px;
          border-top: 1px solid rgba(212,175,55,0.2);
          background: rgba(212,175,55,0.04);
        }
        .bill-footer-total span:first-child { font-size: 0.85rem; color: rgba(255,255,255,0.5); }
        .bill-footer-amount {
          font-size: 1.4rem; font-weight: 700; color: #D4AF37;
          font-family: "Playfair Display", serif;
        }

        /* ── Boutons paiement ── */
        .bill-actions { display: flex; flex-direction: column; gap: 10px; padding: 14px 20px 8px; }
        .bill-pay-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 16px 20px; border-radius: 14px; border: none;
          font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: all 0.25s; position: relative;
        }
        .bill-pay-btn .btn-arrow { margin-left: auto; opacity: 0.6; }
        .bill-pay-btn:active { transform: scale(0.98); }

        .bill-pay-btn.online {
          background: linear-gradient(135deg, #D4AF37, #B8962E);
          color: #1a0a00;
          box-shadow: 0 6px 20px rgba(212,175,55,0.3);
        }
        .bill-pay-btn.online:hover:not(:disabled) {
          box-shadow: 0 8px 28px rgba(212,175,55,0.45);
          transform: translateY(-1px);
        }
        .bill-pay-btn.online:disabled { opacity: 0.6; cursor: not-allowed; }

        .bill-pay-btn.counter {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.85);
        }
        .bill-pay-btn.counter:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }

        .bill-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(26,10,0,0.3);
          border-top-color: #1a0a00;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Hint réapparition ── */
        .bill-reappear-hint {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 8px 20px 16px;
          font-size: 0.68rem; color: rgba(255,255,255,0.25);
        }

        /* ════════ ÉCRAN PAYÉ ════════ */
        .bill-paid-screen {
          align-items: center; justify-content: center;
          padding: 48px 32px; text-align: center;
          border-radius: 28px; max-height: 60vh; position: relative; overflow: hidden;
        }
        .paid-icon-wrapper { margin-bottom: 24px; position: relative; z-index: 1; }
        .paid-icon-ring {
          width: 90px; height: 90px; border-radius: 50%;
          background: rgba(39,174,96,0.1);
          border: 2px solid rgba(39,174,96,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto;
          animation: paidPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes paidPop { from { transform: scale(0); } to { transform: scale(1); } }
        .paid-title {
          font-family: "Playfair Display", serif;
          font-size: 2rem; color: #fff; margin: 0 0 10px; position: relative; z-index: 1;
        }
        .paid-subtitle { color: rgba(255,255,255,0.55); font-size: 0.9rem; line-height: 1.6; position: relative; z-index: 1; }
        .paid-sparkles { position: absolute; inset: 0; pointer-events: none; }
        .paid-sparkle { position: absolute; color: #D4AF37; opacity: 0; animation: sparkleFloat 2s ease-in-out forwards; }
        .ps-0 { top: 15%; left: 20%; animation-delay: 0.1s; }
        .ps-1 { top: 20%; right: 15%; animation-delay: 0.3s; }
        .ps-2 { top: 60%; left: 10%; animation-delay: 0.5s; }
        .ps-3 { top: 55%; right: 12%; animation-delay: 0.2s; }
        .ps-4 { top: 80%; left: 30%; animation-delay: 0.4s; }
        .ps-5 { top: 75%; right: 25%; animation-delay: 0.6s; }
        @keyframes sparkleFloat {
          0%   { opacity: 0; transform: translateY(10px) scale(0.5); }
          50%  { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.8); }
        }
      `}</style>
    </>
  );
}

// ─── Mini toast local (sans dépendances externes) ───
function LocalToast({ message }: { message: string }) {
  return (
    <div style={{
      position: "fixed", bottom: "20px", left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(39,174,96,0.95)",
      color: "white", padding: "12px 20px",
      borderRadius: "12px", fontSize: "0.85rem",
      fontWeight: 600, zIndex: 100000,
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      whiteSpace: "nowrap",
      animation: "toastIn 0.3s ease",
    }}>
      {message}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}