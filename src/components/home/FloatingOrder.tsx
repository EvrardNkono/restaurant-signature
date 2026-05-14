import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, Moon, Sparkles, X, ChefHat, Star } from 'lucide-react';
import './FloatingOrder.css';

export default function FloatingOrder() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleExternalToggle = () => {
      setIsOpen((prev) => {
        const newState = !prev;
        if (newState && nodeRef.current) {
          setTimeout(() => {
            nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 10);
        }
        return newState;
      });
    };

    window.addEventListener('openReservation', handleExternalToggle);
    return () => {
      window.removeEventListener('openReservation', handleExternalToggle);
    };
  }, []);

  const hiddenRoutes = ['/menu', '/menu-soir'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const handleStart = () => {
    setIsDragging(false);
  };

  const handleDrag = () => {
    setIsDragging(true);
  };

  const handleStop = () => {
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
              <div className="options-header">
                <Sparkles size={12} />
                <span>Notre sélection</span>
              </div>
              <Link 
                to="/menu" 
                className="option-link" 
                onClick={handleLinkAction}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="option-icon">
                  <Utensils size={16} />
                </div>
                <div className="option-content">
                  <span className="option-title">Menu Jour</span>
                  <span className="option-desc">Découvrez notre carte du jour</span>
                </div>
                <div className="option-arrow">→</div>
              </Link>
              <Link 
                to="/menu-soir" 
                className="option-link" 
                onClick={handleLinkAction}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="option-icon">
                  <Moon size={16} />
                </div>
                <div className="option-content">
                  <span className="option-title">Menu Soir</span>
                  <span className="option-desc">L'élégance après le coucher du soleil</span>
                </div>
                <div className="option-arrow">→</div>
              </Link>
            </div>
          )}

          <div 
            className={`fab-button ${isOpen ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="fab-particles">
              <span className="particle"></span>
              <span className="particle"></span>
              <span className="particle"></span>
            </div>
            <div className="fab-content">
              {isOpen ? (
                <X size={28} strokeWidth={1.5} />
              ) : (
                <>
                  <ChefHat size={22} />
                  <span className="fab-text">Commander</span>
                </>
              )}
            </div>
            <div className="fab-ring"></div>
            <div className="fab-ring-delayed"></div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}