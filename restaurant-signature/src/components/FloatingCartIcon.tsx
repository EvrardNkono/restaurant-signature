import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FloatingCartIcon = () => {
  const { totalItems, lastRemovedProduct } = useCart();
  const navigate = useNavigate();

  const [animationKey, setAnimationKey] = useState(0);
  const [removedImage, setRemovedImage] = useState<string | null>(null);

  const previousTotalRef = useRef(totalItems);

  useEffect(() => {
    if (totalItems > previousTotalRef.current) {
      setAnimationKey(prev => prev + 1);
    } else if (totalItems < previousTotalRef.current && lastRemovedProduct?.image) {
      setRemovedImage(lastRemovedProduct.image);
      setTimeout(() => setRemovedImage(null), 1500); // ✳️ Durée augmentée
    }

    previousTotalRef.current = totalItems;
  }, [totalItems, lastRemovedProduct]);

  return (
    <>
      <style>
        {`
          @keyframes flashGrow {
            0% {
              background-color: #7C3AED;
              transform: translateX(-50%) scale(1);
              box-shadow: 0 0 8px rgba(124, 58, 237, 0.7);
            }
            30% {
              background-color: #FACC15;
              transform: translateX(-50%) scale(2);
              box-shadow: 0 0 20px rgba(250, 204, 21, 0.9);
            }
            100% {
              background-color: #7C3AED;
              transform: translateX(-50%) scale(1);
              box-shadow: 0 0 8px rgba(124, 58, 237, 0.7);
            }
          }

          @keyframes slideDownFade {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(120px);
              opacity: 0;
            }
          }

          .slide-out {
            animation: slideDownFade 1.5s ease-in-out forwards; /* ✳️ Plus long et fluide */
            position: fixed;
            top: 110px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9998;
            width: 72px; /* ✳️ Plus grand */
            height: 72px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
            background: white;
          }

          .slide-out img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        `}
      </style>

      {removedImage && (
        <div className="slide-out">
          <img src={removedImage} alt="Produit retiré" />
        </div>
      )}

      <div
        key={animationKey}
        style={{
          position: 'fixed',
          top: '110px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#7C3AED',
          color: 'white',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 0 8px rgba(124, 58, 237, 0.7)',
          userSelect: 'none',
          zIndex: 9999,
          animation: 'flashGrow 0.6s ease-in-out',
          transition: 'all 0.4s ease',
        }}
        title="Voir le panier"
        onClick={() => navigate('/panier')}
      >
        <FontAwesomeIcon icon={faShoppingCart} />
        {totalItems > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#F87171',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              color: 'white',
              pointerEvents: 'none',
              boxShadow: '0 0 3px rgba(0,0,0,0.3)',
            }}
          >
            {totalItems}
          </span>
        )}
      </div>
    </>
  );
};

export default FloatingCartIcon;
