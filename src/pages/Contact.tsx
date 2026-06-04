// frontend/src/pages/Contact.tsx
import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import "./contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      successTimer.current = setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page">
      {/* BANNIÈRE */}
      <div className="contact-banner-box">
        <div className="contact-header">
          <div className="header-seal">S</div>
          <span className="contact-badge">Réservations & Informations</span>
          <h2 className="contact-main-title">Contactez-nous</h2>
          <div className="header-double-line"></div>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-grid">

          {/* INFOS DE CONTACT */}
          <div className="contact-info">
            <h3 className="gold-section-title">Coordonnées</h3>

            <div className="info-item">
              <div className="info-icon"><MapPin size={18} /></div>
              <div>
                <h4>Adresse</h4>
                <p>13 Rue Saint-Barthélémy<br />77000 Melun, France</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><Phone size={18} /></div>
              <div>
                <h4>Téléphone</h4>
                <a href="tel:+33183865812">+33 1 83 86 58 12</a>
                <p className="phone-note">(Appel gratuit)</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><Mail size={18} /></div>
              <div>
                <h4>Email</h4>
                <a href="mailto:restaurantsignature@outlook.fr">restaurantsignature@outlook.fr</a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><Clock size={18} /></div>
              <div>
                <h4>Horaires</h4>
                <p><strong>Mardi - Vendredi :</strong> 12h00 - 15h00 / 18h00 - 23h00</p>
                <p><strong>Samedi - Dimanche :</strong> 12h00 - 00h00 (service continu)</p>
                <p><strong>Lundi :</strong> Fermé</p>
                <p className="hours-note">⚠️ Dernières commandes 30 min avant fermeture</p>
              </div>
            </div>

            <div className="contact-socials">
              <a href="#" aria-label="Instagram">📷 Instagram</a>
              <a href="#" aria-label="Facebook">👍 Facebook</a>
              <a href="https://wa.me/33183865812" aria-label="WhatsApp">💬 WhatsApp</a>
            </div>
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              {success && (
                <div className="contact-success">
                  <CheckCircle size={20} />
                  <span>Message envoyé avec succès !</span>
                </div>
              )}

              {error && (
                <div className="contact-error">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Nom Complet</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Votre demande ou réservation..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Envoi en cours...' : (
                  <>
                    <Send size={16} /> Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;