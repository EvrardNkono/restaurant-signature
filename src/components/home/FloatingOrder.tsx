import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Link, useLocation } from 'react-router-dom';
import './FloatingOrder.css';

export default function FloatingOrder() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Ref typée pour TypeScript
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleExternalToggle = () => {
      // On utilise une fonction de mise à jour pour garantir la valeur la plus récente
      setIsOpen((prev) => {
        const newState = !prev;
        
        // Si le nouvel état est "ouvert", on scroll vers le bouton
        if (newState && nodeRef.current) {
          // On attend un micro-tick pour laisser le temps au menu de s'afficher si besoin
          setTimeout(() => {
            nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 10);
        }
        
        return newState;
      });
    };

    // Écoute le signal envoyé par le Footer
    window.addEventListener('openReservation', handleExternalToggle);
    
    return () => {
      window.removeEventListener('openReservation', handleExternalToggle);
    };
  }, []);

  // Gestion des routes où le bouton est masqué
  const hiddenRoutes = ['/menu', '/menu-soir'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const handleStart = () => {
    setIsDragging(false);
  };

  const handleDrag = () => {
    setIsDragging(true);
  };

  const handleStop = () => {
    // Si on n'a pas bougé (clic simple), on change l'état
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  const handleLinkAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="floating-container">
      <Draggable 
        nodeRef={nodeRef} 
        bounds="parent" 
        onStart={handleStart}
        onDrag={handleDrag} 
        onStop={handleStop}
        cancel=".option-link"
      >
        <div className="draggable-wrapper" ref={nodeRef}>
          
          {isOpen && (
            <div className="order-options">
              <Link 
                to="/menu" 
                className="option-link" 
                onClick={handleLinkAction}
                onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <span className="icon">☀️</span> Menu jour
              </Link>
              <Link 
                to="/menu-soir" 
                className="option-link" 
                onClick={handleLinkAction}
                onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <span className="icon">🌙</span> Menu soir
              </Link>
            </div>
          )}

          <div className={`fab-button ${isOpen ? 'active' : ''}`}>
            <div className="fab-content">
              <span className="fab-text">Commander</span>
            </div>
            <div className="fab-ring"></div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}