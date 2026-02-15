import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Link, useLocation } from 'react-router-dom';
import './FloatingOrder.css';

export default function FloatingOrder() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const nodeRef = useRef(null);

  // MODIFICATION : On retire '/carte' pour qu'il soit visible sur cette page
  const hiddenRoutes = ['/menu', '/menu-soir'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const handleStart = () => {
    setIsDragging(false);
  };

  const handleDrag = () => {
    setIsDragging(true);
  };

  const handleStop = () => {
    // Si on n'a pas bougé, c'est un clic sur le bouton principal
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  // Force la navigation et ferme le menu
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
        cancel=".option-link" // TRÈS IMPORTANT : Dit au Draggable d'ignorer ces éléments
      >
        <div className="draggable-wrapper" ref={nodeRef}>
          
          {isOpen && (
            <div className="order-options">
              <Link 
                to="/menu" 
                className="option-link" 
                onClick={handleLinkAction}
                onMouseDown={(e) => e.stopPropagation()} // Sécurité PC
              >
                <span className="icon">☀️</span> Menu jour
              </Link>
              <Link 
                to="/menu-soir" 
                className="option-link" 
                onClick={handleLinkAction}
                onMouseDown={(e) => e.stopPropagation()} // Sécurité PC
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