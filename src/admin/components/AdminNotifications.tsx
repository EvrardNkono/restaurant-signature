// src/admin/components/AdminNotifications.tsx
import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../../services/firebase';

const VAPID_KEY = "BOmQ73MJH6SreFfExPUgCXuuUpEnR1zwqGGC2LWs6yqZvpjy3yWlHtcOX9LBLVMcEBq9FtwqB2OG1Z-j8TxPjdQ";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

// URL complète de l'administration
const ADMIN_URL = "https://restaurantsignature.fr/admin";

export default function AdminNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Écoute les messages quand l'onglet est actif (foreground)
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 Message foreground reçu:', payload);
      
      if (!('Notification' in window)) return;
      
      if (Notification.permission === 'granted') {
        const notificationTitle = payload.notification?.title || 'Nouvelle commande !';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'order-notification',
          data: {
            url: ADMIN_URL,
            orderId: payload.data?.orderId || null
          }
        };
        
        const notification = new Notification(notificationTitle, notificationOptions);
        
        // Gestion du clic sur la notification
        notification.onclick = (event) => {
          event.preventDefault();
          notification.close();
          
          // Vérifier si on est déjà sur la page admin
          const currentPath = window.location.pathname;
          const isOnAdmin = currentPath === '/admin' || currentPath.startsWith('/admin/');
          const currentHost = window.location.hostname;
          const isCorrectHost = currentHost === 'restaurantsignature.fr' || currentHost === 'localhost';
          
          if (isOnAdmin && isCorrectHost) {
            // Déjà sur l'admin, juste focus
            window.focus();
          } else {
            // Ouvrir l'administration
            window.location.href = ADMIN_URL;
          }
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
          setIsEnabled(false);
        } else {
          console.warn('⚠️ Permission refusée, nettoyage des préférences');
          localStorage.removeItem('admin_notifications_enabled');
          localStorage.removeItem('admin_token');
          setIsEnabled(false);
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
      if (!('Notification' in window)) {
        alert('❌ Votre navigateur ne supporte pas les notifications');
        setLoading(false);
        return;
      }

      let permission = Notification.permission;
      
      if (permission === 'denied') {
        alert('❌ Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.');
        setLoading(false);
        return;
      }
      
      if (permission === 'default') {
        const result = await Notification.requestPermission();
        permission = result;
        
        if (permission !== 'granted') {
          alert('❌ Vous devez autoriser les notifications pour continuer');
          setLoading(false);
          return;
        }
      }
      
      console.log('✅ Permission accordée, activation en cours...');
      
      const messaging = getMessaging(app);
      
      let token = localStorage.getItem('admin_token');
      
      if (!token) {
        try {
          token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) {
            localStorage.setItem('admin_token', token);
            console.log('📱 Nouveau token généré et stocké');
          } else {
            throw new Error('Token vide retourné par Firebase');
          }
        } catch (tokenError: any) {
          console.error('Erreur détaillée token:', tokenError);
          
          if (tokenError.code === 'messaging/permission-blocked') {
            alert('❌ Les notifications sont bloquées par le navigateur. Vérifiez vos paramètres.');
          } else if (tokenError.code === 'messaging/failed-service-worker-registration') {
            alert('❌ Erreur Service Worker. Rafraîchissez la page et réessayez.');
          } else {
            alert(`❌ Impossible d'obtenir le token: ${tokenError.message || 'Erreur inconnue'}`);
          }
          setLoading(false);
          return;
        }
      }
      
      if (!token) {
        alert('❌ Impossible d\'obtenir le token de notification');
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
        alert('✅ Notifications activées avec succès !');
      } else {
        const errorText = await response.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur serveur: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      alert('❌ Impossible d\'activer les notifications. Vérifiez la console pour plus de détails.');
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    setLoading(true);
    try {
      const savedToken = localStorage.getItem('admin_token');
      if (savedToken) {
        try {
          await fetch(`${BASE_API}/notifications/unregister-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: savedToken })
          });
        } catch (error) {
          console.warn('Erreur lors de la désinscription serveur:', error);
        }
      }
      
      localStorage.removeItem('admin_notifications_enabled');
      localStorage.removeItem('admin_token');
      setIsEnabled(false);
      alert('🔕 Notifications désactivées');
    } catch (error) {
      console.error('Erreur désactivation:', error);
      alert('❌ Erreur lors de la désactivation');
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
        cursor: loading ? 'wait' : 'pointer',
        fontWeight: 500,
        fontFamily: 'inherit',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {loading ? (
        <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
      ) : isEnabled ? (
        <BellOff size={16} />
      ) : (
        <Bell size={16} />
      )}
      <span>
        {loading 
          ? 'Chargement...' 
          : isEnabled 
            ? 'Notif. actives' 
            : Notification.permission === 'denied'
              ? 'Notif. bloquées'
              : 'Activer notifs'}
      </span>
    </button>
  );
}