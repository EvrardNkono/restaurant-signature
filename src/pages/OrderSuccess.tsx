import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Optionnel: Appeler votre backend pour confirmer le paiement
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
            Retour à l'accueil
          </Link>
          <Link to="/carte" className="btn-continue">
            Commander à nouveau
          </Link>
        </div>
      </div>
    </div>
  );
}