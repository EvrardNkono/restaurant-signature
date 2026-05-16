// src/admin/components/TestNotification.tsx
import { useState } from 'react';
import axios from 'axios';

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal ? "http://localhost:5000/api" : "https://signature-backend-alpha.vercel.app/api";

export default function TestNotification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestNotification = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await axios.post(`${BASE_API}/notifications/send-notification`, {
        title: '🧪 Test de notification',
        body: 'Ceci est un test depuis votre panneau admin !',
        data: { url: '/' }
      });
      
      setResult(`✅ ${response.data.message}`);
    } catch (error) {
      setResult('❌ Erreur lors de l\'envoi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-notification">
      <button 
        onClick={sendTestNotification} 
        disabled={loading}
        className="test-notif-btn"
      >
        {loading ? 'Envoi...' : '📨 Tester les notifications'}
      </button>
      {result && <p className="result">{result}</p>}
    </div>
  );
}