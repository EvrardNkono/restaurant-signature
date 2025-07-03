import React, { useState } from 'react';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const [mode, setMode] = useState<'reservation' | 'surPlace' | ''>('');
  const [time, setTime] = useState('');
  const [, setPaymentMethod] = useState<'carte' | 'caisse' | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification des horaires côté JS
    if (mode === 'reservation' && (time < '10:00' || time > '22:00')) {
      alert("L'heure de réservation doit être comprise entre 10h00 et 22h00.");
      return;
    }

    alert('Commande enregistrée !');
  };

  return (
    <div className="checkout-container">
      <h1>🍽️ Finaliser votre commande</h1>

      <form onSubmit={handleSubmit} className="checkout-form">

        <div className="form-group">
          <label>Souhaitez-vous réserver ou venir directement ?</label>
          <div className="choice-buttons">
            <button
              type="button"
              className={mode === 'reservation' ? 'active' : ''}
              onClick={() => {
                setMode('reservation');
                setPaymentMethod('carte');
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
              }}
            >
              Manger sur place
            </button>
          </div>
        </div>

        {mode === 'reservation' && (
          <div className="form-group">
            <label>Choisissez votre heure de réservation :</label>
            <input
              type="time"
              min="10:00"
              max="22:00"
              step={60}  // ← Ajouté pour que minute soit sélectionnable
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        )}

        {mode && (
  <div className="form-group">
    <label>Méthode de paiement :</label>
    <div className="payment-info">
      {mode === 'reservation' ? (
        <span className="payment-tag carte">
          🧾 Vous paierez en ligne
        </span>
      ) : (
        <span className="payment-tag caisse">
          🧾 Rendez-vous à la caisse pour payer
        </span>
      )}
    </div>
  </div>
)}



        {mode && (
          <div className="form-group">
            <button type="submit" className="submit-button">
              💳Confirmer ma commande
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutPage;
