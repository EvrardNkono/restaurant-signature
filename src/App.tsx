import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import CarteRestaurant from "./pages/CarteRestaurant";
import Menu from "./pages/Menu";
import MenuSoir from "./pages/MenuSoir"; 
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Chatbot from "./components/Chatbot"; 
import AdPopup from "./components/AdPopup"; 
import ScrollToTop from "./components/ScrollToTop"; // Import du nouveau composant
import { CartProvider } from "./context/CartContext";

export default function AppRouter() {
  return (
    <CartProvider>
      <Router>
        {/* Gestion du scroll automatique vers le haut à chaque changement d'URL */}
        <ScrollToTop />

        {/* Le Popup s'affichera ici au chargement initial */}
        <AdPopup 
          word="SIGNATURE" 
        />

        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carte" element={<CarteRestaurant />} />
            <Route path="/menu" element={<Menu />} />
            
            {/* Route pour le Menu du Soir */}
            <Route path="/menu-soir" element={<MenuSoir />} />
            
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/panier" element={<Cart />} />
          </Routes>
        </main>

        {/* Le Chatbot flotte au-dessus du contenu sur toutes les pages */}
        <Chatbot />

        <Footer />
      </Router>
    </CartProvider>
  );
}