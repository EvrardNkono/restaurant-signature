import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, ShoppingBag, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  // On vide le panier une seule fois au montage du composant
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="success-container">
      <div className="success-card">
        {/* Icône de succès avec effet d'animation */}
        <div className="success-icon-wrapper">
          <CheckCircle size={80} className="success-check-icon" />
          <div className="success-pulse"></div>
        </div>

        <h1 className="success-title">Commande Confirmée</h1>
        <div className="title-underline-gold central"></div>

        <p className="success-message">
          Merci pour votre confiance. Votre expérience culinaire <strong>Signature</strong> commence maintenant. 
          Un e-mail de confirmation vous a été envoyé.
        </p>

        {orderId && (
          <div className="order-reference">
            <span>Référence de commande :</span>
            <span className="order-id">{orderId}</span>
          </div>
        )}

        <div className="next-steps">
          <div className="step-item">
            <ShoppingBag size={20} />
            <p>Préparation de vos plats par notre chef</p>
          </div>
          <div className="step-item">
            <MapPin size={20} />
            <p>Rendez-vous au 13 Rue Saint-Barthélémy, Melun</p>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/" className="return-home-btn">
            Retour à l'accueil
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <style>{`
        .success-container {
        padding-top: 100px;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: #fdfcf8; /* Ivoire */
        }

        .success-card {
          background: white;
          padding: 60px 40px;
          border-radius: 4px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          max-width: 600px;
          width: 100%;
          text-align: center;
          border: 1px solid #eee;
        }

        .success-icon-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 30px;
        }

        .success-check-icon {
          color: #D4AF37; /* Gold */
          position: relative;
          z-index: 2;
        }

        .success-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 50%;
          z-index: 1;
          animation: pulse 2s infinite;
        }

        .success-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          color: #1a1a1a;
          margin-bottom: 10px;
        }

        .central {
          margin: 0 auto 30px auto;
          width: 60px;
          height: 2px;
          background: #D4AF37;
        }

        .success-message {
          color: #666;
          line-height: 1.6;
          font-size: 1.1rem;
          margin-bottom: 40px;
        }

        .order-reference {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .order-id {
          font-weight: bold;
          color: #D4AF37;
          font-family: monospace;
          font-size: 1.2rem;
        }

        .next-steps {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 50px;
          border-top: 1px solid #eee;
          padding-top: 30px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #444;
        }

        .return-home-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #1a1a1a;
          color: white;
          text-decoration: none;
          padding: 18px 35px;
          font-weight: 600;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }

        .return-home-btn:hover {
          background: #D4AF37;
          transform: translateY(-2px);
        }

        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        @media (max-width: 480px) {
          .success-card { padding: 40px 20px; }
          .success-title { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}