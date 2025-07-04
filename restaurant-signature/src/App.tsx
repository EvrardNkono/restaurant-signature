import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CartPage from './pages/CartPage';  // <-- Import de la page panier
import SpecialWeekend from './pages/SpecialWeekend'; // <-- Import nouvelle page
import PopupBack from './components/PopupBack';
import ScrollTopPopup from './components/ScrollTopPopup';
import FloatingCartIcon from './components/FloatingCartIcon';
import { CartProvider } from './context/CartContext';
import ChefConcept from './pages/ChefConcept';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  const location = useLocation();
  const shouldShowPopupBack = location.pathname !== '/';
  const shouldShowPopup = location.pathname !== '/';

  return (
    <CartProvider>
      {shouldShowPopupBack && <PopupBack />}
      {shouldShowPopup && <ScrollTopPopup />}
      {location.pathname !== '/' && <FloatingCartIcon />}


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/panier" element={<CartPage />} /> {/* Route panier */}
        <Route path="/special-weekend" element={<SpecialWeekend />} /> {/* Nouvelle route */}
        <Route path="/concept-chef" element={<ChefConcept />} />
         <Route path="/commande" element={<CheckoutPage />} /> {/* ✅ nouvelle route */}
      </Routes>
    </CartProvider>
  );
}

export default App;
