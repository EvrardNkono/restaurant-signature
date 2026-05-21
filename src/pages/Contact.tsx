// frontend/src/pages/Contact.jsx
import { useState } from 'react';
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

  // Remplace ces deux fonctions

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSuccess(false), 5000);
  } catch (err) {
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
          <div className="header-seal">C</div>
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
                <p>Yaoundé, Cameroun<br />Quartier Bastos, Immeuble CAPEF</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon"><Phone size={18} /></div>
              <div>
                <h4>Téléphone</h4>
                <p>+237 6XX XXX XXX</p>
                <p>+237 6XX XXX XXX</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon"><Mail size={18} /></div>
              <div>
                <h4>Email</h4>
                <p>contact@propertycameroon.com</p>
                <p>support@propertycameroon.com</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon"><Clock size={18} /></div>
              <div>
                <h4>Horaires</h4>
                <p>Lundi - Vendredi : 9h - 18h</p>
                <p>Samedi : 10h - 14h</p>
              </div>
            </div>

            <div className="contact-socials">
              <span>📷 Instagram</span>
              <span>👍 Facebook</span>
              <span>💼 LinkedIn</span>
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
                <label>Nom Complet</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com" 
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea 
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