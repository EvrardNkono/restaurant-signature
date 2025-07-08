import React, { useState } from 'react';
import './CheckoutPage.css';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_...'); // Remplace par ta clé publique Stripe

const CheckoutPage: React.FC = () => {
  const [mode, setMode] = useState<'reservation' | 'surPlace' | ''>('');
  const [time, setTime] = useState('');
  const [, setPaymentMethod] = useState<'carte' | 'caisse' | ''>('');  
  const [placeChoice, setPlaceChoice] = useState<'emporter' | 'surPlace' | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!placeChoice) {
      alert("Veuillez choisir entre 'À emporter' ou 'Sur place'.");
      return;
    }

    if (mode === 'reservation' && (time < '10:00' || time > '22:00')) {
      alert("L'heure de réservation doit être comprise entre 10h00 et 22h00.");
      return;
    }

    if (mode === 'reservation') {
      // Paiement Stripe pour réservation
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 2590, // Exemple : 25,90 € => 2590 centimes
          metadata: {
            mode,
            placeChoice,
            time
          }
        })
      });

      const session = await response.json();

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    } else {
      // Paiement sur place
      alert(`Commande enregistrée ! Vous paierez à la caisse.`);
    }
  };

  return (
    <div className="checkout-container">
      <h1>🍽️ Finaliser votre commande</h1>

      <form onSubmit={handleSubmit} className="checkout-form">
        {/* Choix du mode */}
        <div className="form-group">
          <label>Souhaitez-vous réserver ou venir directement ?</label>
          <div className="choice-buttons">
            <button
              type="button"
              className={mode === 'reservation' ? 'active' : ''}
              onClick={() => {
                setMode('reservation');
                setPaymentMethod('carte');
                setPlaceChoice('');
              }}
            >
              Réserver
            </button>
            <button
              type="button"
              className={mode === 'surPlace' ? 'active' : ''}
              onClick={() => {
                setMode('surPlace');
                setPaymentMethod('caisse');
                setTime('');
                setPlaceChoice('');
              }}
            >
              Je suis au restaurant
            </button>
          </div>
        </div>

        {/* Choix sur place ou emporter */}
        {mode && (
          <div className="form-group">
            <label>Souhaitez-vous manger sur place ou emporter ?</label>
            <div className="choice-buttons">
              <button
                type="button"
                className={placeChoice === 'surPlace' ? 'active' : ''}
                onClick={() => setPlaceChoice('surPlace')}
              >
                Sur place
              </button>
              <button
                type="button"
                className={placeChoice === 'emporter' ? 'active' : ''}
                onClick={() => setPlaceChoice('emporter')}
              >
                À emporter
              </button>
            </div>
          </div>
        )}

        {/* Heure de réservation */}
        {mode === 'reservation' && (
          <div className="form-group">
            <label>Choisissez votre heure de réservation :</label>
            <input
              type="time"
              min="10:00"
              max="22:00"
              step={60}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        )}

        {/* Infos paiement */}
        {mode && (
          <div className="form-group">
            <label>Méthode de paiement :</label>
            <div className="payment-info">
              {mode === 'reservation' ? (
                <span className="payment-tag carte">🧾 Paiement en ligne</span>
              ) : (
                <span className="payment-tag caisse">🧾 Paiement à la caisse</span>
              )}
            </div>
          </div>
        )}

        {/* Bouton final */}
        {mode && (
          <div className="form-group">
            <button type="submit" className="submit-button" disabled={!placeChoice}>
              💳 Confirmer ma commande
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutPage;
