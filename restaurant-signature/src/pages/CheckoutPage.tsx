import React, { useState } from 'react';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const [showOnlineForm, setShowOnlineForm] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    time: '',
  });

  const handleOnlineFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Merci ${formData.firstname} ${formData.lastname} !\nVotre commande est validée pour ${formData.time}.`);
    // 👉 Ici tu peux envoyer les données au backend
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="checkout-page">
      <h1>Finalisation de votre commande</h1>
      <p className="subtitle">Merci de votre commande ! Choisissez le mode de réception ci-dessous.</p>

      <div className="order-options">
        <button className="order-btn advance-btn" onClick={() => setShowOnlineForm(true)}>
          Commander à distance (paiement en ligne)
        </button>
        <button className="order-btn reserve-btn" onClick={() => alert('Merci ! Rendez-vous au comptoir pour payer.')}>
          Réserver sur place (paiement au comptoir)
        </button>
      </div>

      {showOnlineForm && (
        <form className="reservation-form" onSubmit={handleOnlineFormSubmit}>
          <p className="reservation-warning">
            ⚠️ En cas d'absence, vous serez intégralement remboursé sous 24h.
          </p>

          <label htmlFor="firstname">Prénom :</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />

          <label htmlFor="lastname">Nom :</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />

          <label htmlFor="time">Heure de réservation :</label>
          <select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionnez une heure --</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="19:00">19:00</option>
            <option value="20:00">20:00</option>
            <option value="21:00">21:00</option>
          </select>

          <button type="submit" className="validate-btn">
            Valider et payer en ligne
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckoutPage;
