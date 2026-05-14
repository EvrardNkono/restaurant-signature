// frontend/src/pages/OrderSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import './OrderSuccess.css'; // Optionnel : pour le style

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Valider le paiement auprès du backend
    const validatePayment = async () => {
      if (sessionId && orderId) {
        try {
          const isLocal = window.location.hostname === "localhost";
          const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";
          
          await fetch(`${BASE_API}/payments/confirm-payment?session_id=${sessionId}&orderId=${orderId}`);
        } catch (error) {
          console.error("Erreur validation paiement:", error);
        }
      }
      setIsValidating(false);
    };

    validatePayment();
  }, [sessionId, orderId]);

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">
          <CheckCircle size={80} color="#D4AF37" strokeWidth={1.5} />
        </div>
        
        <h1 className="success-title">Commande confirmée !</h1>
        
        <p className="success-message">
          Merci pour votre commande. Vous recevrez un email de confirmation.
        </p>
        
        <div className="order-details">
          <p className="order-id-label">N° commande :</p>
          <p className="order-id-value">{orderId || 'Généré'}</p>
        </div>
        
        <div className="success-actions">
          <Link to="/" className="btn-home">
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <Link to="/carte" className="btn-continue">
            <ShoppingBag size={18} />
            Commander à nouveau
          </Link>
        </div>
      </div>
    </div>
  );
}