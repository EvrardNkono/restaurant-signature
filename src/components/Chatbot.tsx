import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import "./chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Bonjour ! Je suis Gluttony, votre guide gastronomique. Une question sur nos plats ou une envie particulière ? Je suis là pour vous aider !" 
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "C'est noté ! Je cherche cette information pour vous dans les cuisines de Gluttony..." 
      }]);
    }, 2000);
  };

  return (
    <div className="chatbot-wrapper">
      <button 
        className={`chat-trigger ${isOpen ? "active" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contacter Gluttony"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="pulse-ring"></span>}
      </button>

      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="header-info">
            <div className="concierge-avatar">G</div>
            <div>
              <h3>Gluttony</h3>
              <div className="status-indicator">
                <span className="dot"></span>
                <span>À votre service</span>
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

        <form className="chat-footer" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Demandez à Gluttony..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}