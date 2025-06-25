import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CartPage from './pages/CartPage';  // <-- Import de la page panier
import PopupBack from './components/PopupBack';
import ScrollTopPopup from './components/ScrollTopPopup';
import FloatingCartIcon from './components/FloatingCartIcon';
import { CartProvider } from './context/CartContext';

function App() {
  const location = useLocation();
  const shouldShowPopupBack = location.pathname !== '/';
  const shouldShowPopup = location.pathname !== '/';

  return (
    <CartProvider>
      {shouldShowPopupBack && <PopupBack />}
      {shouldShowPopup && <ScrollTopPopup />}
      <FloatingCartIcon />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/panier" element={<CartPage />} /> {/* Route panier */}
        {/* Ajoute d’autres routes ici */}
      </Routes>
    </CartProvider>
  );
}

export default App;
