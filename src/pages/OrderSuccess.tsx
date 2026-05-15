// src/pages/OrderSuccess.tsx
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && orderId) {
      const isLocal = window.location.hostname === "localhost";
      const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";
      
      fetch(`${BASE_API}/payments/confirm-payment?session_id=${sessionId}&orderId=${orderId}`)
        .then(res => res.json())
        .then(data => console.log("Paiement confirmé:", data))
        .catch(console.error);
    }
  }, [sessionId, orderId]);

  return (
    <div className="order-success-page">
      {/* Fond décoratif */}
      <div className="success-bg-pattern"></div>
      
      <div className="success-container">
        {/* Sceau décoratif */}
        <div className="success-seal">
          <span>S</span>
        </div>

        {/* Icône de succès */}
        <div className="success-icon-wrapper">
          <div className="success-icon-circle">
            <CheckCircle size={60} strokeWidth={1.5} />
          </div>
          <div className="sparkle-decoration">
            <Sparkles size={20} />
          </div>
        </div>

        <h1 className="success-title">Commande Confirmée !</h1>
        
        <p className="success-message">
          Votre commande a été reçue avec succès. <br />
          Un email de confirmation vous a été envoyé.
        </p>

        {/* Badge de numéro de commande */}
        <div className="order-card">
          <span className="order-label">NUMÉRO DE COMMANDE</span>
          <div className="order-id-wrapper">
            <span className="order-id-value">{orderId || 'SIG-' + Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div className="next-steps">
          <h3 className="steps-title">✨ Prochaines étapes</h3>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-text">Notre équipe prépare votre commande</div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-text">Vous serez notifié dès que ce sera prêt</div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-text">Venez récupérer ou recevez votre livraison</div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="success-actions">
          <Link to="/" className="btn-home">
            <Home size={18} />
            <span>Accueil</span>
          </Link>
          <Link to="/carte" className="btn-continue">
            <ShoppingBag size={18} />
            <span>Commander à nouveau</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}