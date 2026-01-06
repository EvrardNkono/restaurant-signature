import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import CarteRestaurant from "./pages/CarteRestaurant";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Chatbot from "./components/Chatbot"; // Import du Chatbot
import { CartProvider } from "./context/CartContext";

export default function AppRouter() {
  return (
    <CartProvider>
      <Router>
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

        {/* Le Chatbot est placé ici pour flotter au-dessus du contenu sur toutes les pages */}
        <Chatbot />

        <Footer />
      </Router>
    </CartProvider>
  );
}