import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CartPage from './pages/CartPage'; // <-- Import de la page panier
import SpecialWeekend from './pages/SpecialWeekend'; // <-- Import nouvelle page
import PopupBack from './components/PopupBack';
import ScrollTopPopup from './components/ScrollTopPopup';
import FloatingCartIcon from './components/FloatingCartIcon';
import { CartProvider } from './context/CartContext';
import ChefConcept from './pages/ChefConcept';
import CheckoutPage from './pages/CheckoutPage';
import GamePopup from './components/GamePopup'; // ✅ Import du popup du jeu

function App() {
  const location = useLocation();
  const shouldShowPopupBack = location.pathname !== '/';
  const shouldShowPopup = location.pathname !== '/';

  return (
    <CartProvider>
      {shouldShowPopupBack && <PopupBack />}
      {shouldShowPopup && <ScrollTopPopup />}
      {location.pathname !== '/' && <FloatingCartIcon />}

      {/* ✅ Affiche le popup de jeu uniquement sur la page concept-chef */}
      {location.pathname === '/concept-chef' && (
        <GamePopup message="🍽️ L’Énigme du Chef commence ! Prépare-toi..." />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/special-weekend" element={<SpecialWeekend />} />
        <Route path="/concept-chef" element={<ChefConcept />} />
        <Route path="/commande" element={<CheckoutPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
