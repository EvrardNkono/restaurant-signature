import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import CarteRestaurant from "./pages/CarteRestaurant";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Chatbot from "./components/Chatbot"; 
import AdPopup from "./components/AdPopup"; // Import du nouveau Popup Publicitaire
import { CartProvider } from "./context/CartContext";

export default function AppRouter() {
  return (
    <CartProvider>
      <Router>
        {/* Le Popup s'affichera ici au chargement initial */}
        <AdPopup 
          word="SIGNATURE" 
          image="https://images.unsplash.com/photo-1550966841-3ee3ad359051?auto=format&fit=crop&w=800&q=80" 
        />

        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carte" element={<CarteRestaurant />} />
            <Route path="/menu" element={<Menu />} />
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