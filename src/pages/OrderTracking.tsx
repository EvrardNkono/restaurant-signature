import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, Utensils, CheckCircle, ArrowLeft, RefreshCw, Package } from "lucide-react";
import "./OrderTracking.css";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature.abbadevelop.net/api";

export default function OrderTracking() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const clientId = localStorage.getItem('signature_client_id');
    
    // Si pas de clientId, on ne peut rien suivre
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const res = await axios.get(`${BASE_API}/orders/track/${clientId}`);
      
      if (res.data.success) {
        // On récupère les commandes (le backend filtre déjà sur 24h)
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Erreur récupération suivi:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Rafraîchissement automatique toutes les 20 secondes pour voir l'admin changer les statuts
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleFinishSession = () => {
    if (window.confirm("Voulez-vous terminer votre session ? Cela effacera l'historique de suivi sur ce téléphone.")) {
      localStorage.removeItem('signature_client_id');
      navigate('/carte');
    }
  };

  if (loading) {
    return (
      <div className="tracking-loader">
        <RefreshCw className="spin-icon" size={40} />
        <p>Récupération de vos commandes Signature...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="track-empty-state">
        <Package size={60} color="#D4AF37" />
        <h2>Aucune commande active</h2>
        <p>Vous n'avez pas de commande en cours actuellement.</p>
        <Link to="/carte" className="btn-return-gold">Consulter la carte</Link>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <header className="tracking-header">
        <button onClick={() => navigate('/carte')} className="back-link">
          <ArrowLeft size={18} /> Retour à la carte
        </button>
        <h1 className="gold-title">Suivi en Temps Réel</h1>
        {isRefreshing && <div className="refresh-mini-loader">Mise à jour...</div>}
      </header>

      <div className="orders-container">
        {orders.map((order) => (
          <div key={order._id} className={`order-status-card ${order.status === 'done' ? 'completed' : ''}`}>
            
            <div className="card-top">
              <span className="order-id">Commande #{order._id.slice(-4).toUpperCase()}</span>
              <span className={`status-tag ${order.status}`}>
                {order.status === 'pending' ? 'En attente' : order.status === 'cooking' ? 'En cuisine' : 'Prête !'}
              </span>
            </div>

            <div className="tracking-visual">
              <div className="steps-wrapper">
                {/* Étape 1 : Toujours active car la commande existe */}
                <div className="step active">
                  <div className="icon-circle"><Clock size={18} /></div>
                  <span>Validée</span>
                </div>

                {/* Connecteur entre 1 et 2 */}
                <div className={`connector to-cooking ${['cooking', 'done'].includes(order.status) ? 'active' : ''}`}></div>

                {/* Étape 2 : Cuisine */}
                <div className={`step ${['cooking', 'done'].includes(order.status) ? 'active' : ''}`}>
                  <div className="icon-circle"><Utensils size={18} /></div>
                  <span>Cuisine</span>
                </div>

                {/* Connecteur entre 2 et 3 */}
                <div className={`connector to-done ${order.status === 'done' ? 'active' : ''}`}></div>

                {/* Étape 3 : Prête */}
                <div className={`step ${order.status === 'done' ? 'active' : ''}`}>
                  <div className="icon-circle"><CheckCircle size={18} /></div>
                  <span>Prête</span>
                </div>
              </div>
            </div>

            <div className="order-summary-mini">
              <div className="summary-details">
                <span>{order.items.length} article(s)</span>
                <span className="separator">•</span>
                <span className="gold-text">{parseFloat(order.total).toFixed(2)}€</span>
              </div>
              
              {order.status === 'done' && (
                <div className="pick-up-box">
                  <p className="pick-up-msg">Votre commande est prête !</p>
                  <p className="pick-up-sub">Veuillez vous présenter au comptoir.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="tracking-footer">
        <p>Les statuts se mettent à jour automatiquement.</p>
        <button onClick={handleFinishSession} className="btn-clear-session">
          Terminer ma visite
        </button>
      </footer>
    </div>
  );
}