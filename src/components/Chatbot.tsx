import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import "./chatbot.css";

// --- CONFIGURATION DES ENDPOINTS ---
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

const CHAT_API = `${BASE_URL}/chat`;

// --- INTERFACES ---
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Bonjour ! Je suis Gluttony, l'ambassadeur de Signature. Une envie particulière pour ce service ? Je connais notre carte sur le bout des doigts !" 
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll fluide vers le bas lors de nouveaux messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  /**
   * Effet Typewriter : Affiche le texte mot par mot pour un effet "concierge" luxueux
   */
  const simulateTypewriter = (text: string) => {
    if (!text) return;
    
    const cleanText = text.trim();
    const words = cleanText.split(" ");
    
    // Initialisation du message vide de l'assistant
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    let i = 0;
    let currentText = "";

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = { ...updated[lastIndex], content: currentText };
          }
          return updated;
        });
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25); // Vitesse réglée à 25ms pour un confort de lecture optimal
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userContent = input;
    setMessages(prev => [...prev, { role: "user", content: userContent }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userContent,
          // Historique filtré pour Gemini (on ne garde que les messages avec du contenu)
          history: messages
            .filter(msg => msg.content && msg.content.length > 0)
            .slice(-6) // On garde un contexte de 6 messages pour la mémoire
            .map(msg => ({
              role: msg.role === "assistant" ? "model" : "user",
              parts: [{ text: msg.content }]
            }))
        })
      });

      if (!response.ok) throw new Error("Erreur réseau");

      const data = await response.json();
      setIsTyping(false);

      // Extraction de la réponse (gère les formats .text ou .content du backend)
      const fullResponse = data.text || data.content || "";
      
      if (fullResponse) {
        simulateTypewriter(fullResponse);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Je reste à votre disposition. Que souhaitez-vous savoir sur notre carte ?" 
        }]);
      }

    } catch (error) {
      console.error("Erreur Gluttony:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Mes excuses, la communication avec les cuisines est momentanément interrompue. Je reviens vers vous très vite !" 
      }]);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Bouton Bulle flottante */}
      <button 
        className={`chat-trigger ${isOpen ? "active" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Discuter avec Gluttony"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="pulse-ring"></span>}
      </button>

      {/* Fenêtre de Chat */}
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="header-info">
            <div className="concierge-avatar">G</div>
            <div>
              <h3>Gluttony</h3>
              <div className="status-indicator">
                <span className="dot"></span>
                <span>Ambassadeur Signature</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chat-body" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message-row assistant">
              <div className="message-bubble typing">
                <Sparkles size={14} className="sparkle-icon" />
                Gluttony réfléchit...
              </div>
            </div>
          )}
        </div>

        {/* Formulaire d'envoi */}
        <form className="chat-footer" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Posez votre question..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}