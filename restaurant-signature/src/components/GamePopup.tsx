import React, { useEffect, useState } from 'react';

interface GamePopupProps {
  message?: string;
}

const GamePopup: React.FC<GamePopupProps> = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={styles.popup}>
      <button onClick={() => setVisible(false)} style={styles.closeButton}>✖</button>
      <img
        src="/images/Affiche_resto.png"
        alt="Affiche promotionnelle"
        style={styles.image}
      />
      {message && (
        <div style={styles.textContainer}>
          <p style={styles.text}>{message}</p>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  popup: {
    position: 'fixed',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#0a0a0a',
    border: '2px solid #ff9800',
    padding: '0.8rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(255, 152, 0, 0.5)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '213px',          // 320 / 1.5
    maxHeight: '60vh',       // 90 / 1.5
    overflowY: 'auto',
    animation: 'fadeIn 0.5s ease',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '6px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: '8px 12px',
    borderRadius: '10px',
    marginTop: '8px',
    width: '90%',
    textAlign: 'center',
    border: '1px solid #00ffe7',
  },
  text: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#00ffe7',
    fontFamily: "'Orbitron', sans-serif",
    textShadow: '0 0 5px #00ffe7, 0 0 10px #000',
    margin: 0,
  },
  closeButton: {
    position: 'absolute',
    top: '5px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    color: '#ff9800',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};


export default GamePopup;
