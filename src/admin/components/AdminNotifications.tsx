// src/admin/components/AdminNotifications.tsx
import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../../services/firebase';

const VAPID_KEY = "BOmQ73MJH6SreFfExPUgCXuuUpEnR1zwqGGC2LWs6yqZvpjy3yWlHtcOX9LBLVMcEBq9FtwqB2OG1Z-j8TxPjdQ";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

// Fonction pour ouvrir la page admin
const openAdminPage = () => {
  window.focus();
  window.location.href = '/admin';
};

export default function AdminNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Écoute les messages quand l'onglet est actif (foreground)
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 Message foreground reçu:', payload);
      if (Notification.permission === 'granted') {
        const notification = new Notification(payload.notification?.title || 'Nouvelle commande !', {
          body: payload.notification?.body || '',
          icon: '/icons/icon-192x192.png'
        });
        
        // 👇 AJOUT : Rediriger vers /admin quand on clique sur la notification
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          window.location.href = '/admin';
        };
      }
    });

    const restoreNotifications = async () => {
      const savedState = localStorage.getItem('admin_notifications_enabled');
      const savedToken = localStorage.getItem('admin_token');
      
      console.log('🔄 Vérification des notifications sauvegardées:', { savedState, hasToken: !!savedToken });
      
      if (savedState === 'true' && savedToken) {
        if (Notification.permission === 'granted') {
          console.log('✅ Permission toujours accordée, restauration en cours...');
          try {
            const response = await fetch(`${BASE_API}/notifications/register-admin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: savedToken })
            });
            
            if (response.ok) {
              setIsEnabled(true);
              console.log('✅ Notifications restaurées avec succès');
            } else {
              console.warn('⚠️ Échec restauration, token invalide');
              localStorage.removeItem('admin_notifications_enabled');
              localStorage.removeItem('admin_token');
            }
          } catch (error) {
            console.error('❌ Erreur restauration:', error);
          }
        } else if (Notification.permission === 'default') {
          console.log('⏳ Permission pas encore accordée');
        } else {
          console.warn('⚠️ Permission refusée, nettoyage des préférences');
          localStorage.removeItem('admin_notifications_enabled');
          localStorage.removeItem('admin_token');
        }
      } else {
        console.log('ℹ️ Aucune notification sauvegardée');
      }
    };
    
    restoreNotifications();

    return () => unsubscribe();
  }, []);

  const enableNotifications = async () => {
    setLoading(true);
    
    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('❌ Vous devez autoriser les notifications');
          setLoading(false);
          return;
        }
      }

      const messaging = getMessaging(app);
      
      let token = localStorage.getItem('admin_token');
      
      if (!token) {
        token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          localStorage.setItem('admin_token', token);
          console.log('📱 Nouveau token généré et stocké');
        }
      } else {
        console.log('📱 Token existant réutilisé:', token.substring(0, 30) + '...');
      }
      
      if (!token) {
        alert('❌ Impossible d\'obtenir le token');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_API}/notifications/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        localStorage.setItem('admin_notifications_enabled', 'true');
        setIsEnabled(true);
        alert('✅ Notifications activées !');
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Impossible d\'activer les notifications');
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('admin_notifications_enabled');
      localStorage.removeItem('admin_token');
      setIsEnabled(false);
      alert('🔕 Notifications désactivées');
    } finally {
      setLoading(false);
    }
  };

  if (!('Notification' in window)) return null;

  return (
    <button
      onClick={isEnabled ? disableNotifications : enableNotifications}
      disabled={loading}
      className={`admin-notif-btn ${isEnabled ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: isEnabled ? '#2D2422' : '#f5f0e8',
        color: isEnabled ? '#D4AF37' : '#2D2422',
        border: '1px solid #D4AF37',
        borderRadius: '30px',
        cursor: 'pointer',
        fontWeight: 500,
        fontFamily: 'inherit'
      }}
    >
      {loading ? (
        <Loader2 size={16} className="spinner" />
      ) : isEnabled ? (
        <BellOff size={16} />
      ) : (
        <Bell size={16} />
      )}
      <span>{isEnabled ? 'Notif. actives' : 'Activer notifs'}</span>
    </button>
  );
}