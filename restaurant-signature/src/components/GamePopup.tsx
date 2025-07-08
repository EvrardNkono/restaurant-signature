import React, { useEffect, useState } from 'react';

interface GamePopupProps {
  message: string;
}

const GamePopup: React.FC<GamePopupProps> = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000); // 10 secondes

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={styles.popup}>
      {message}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  popup: {
    position: 'fixed',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#fff8e1',
    border: '2px solid #ff9800',
    color: '#333',
    padding: '1rem 1.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    zIndex: 9999,
    fontWeight: 'bold',
    fontSize: '1.2rem',
    transition: 'opacity 0.5s ease-in-out',
  }
};

export default GamePopup;
