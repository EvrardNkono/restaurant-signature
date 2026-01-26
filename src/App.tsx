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
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";

// Imports de l'Administration
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import MenuManager from "./admin/pages/MenuManager";
import Orders from "./admin/pages/Orders";
import Appearance from "./admin/pages/Appearance";
// 1. IMPORT DU NOUVEAU COMPOSANT
import SocialHub from "./admin/pages/SocialHub"; 

export default function AppRouter() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />

        <Routes>
          {/* --- PARTIE CLIENT (AVEC NAVBAR ET FOOTER) --- */}
          <Route
            path="/*"
            element={
              <>
                <AdPopup word="SIGNATURE" />
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/carte" element={<CarteRestaurant />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/menu-soir" element={<MenuSoir />} />
                    <Route path="/a-propos" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/panier" element={<Cart />} />
                  </Routes>
                </main>
                <Chatbot />
                <Footer />
              </>
            }
          />

          {/* --- PARTIE ADMIN (AVEC SIDEBAR DÉDIÉE) --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="orders" element={<Orders />} />
            <Route path="appearance" element={<Appearance />} />
            {/* 2. DÉCLARATION DE LA ROUTE SOCIALE */}
            <Route path="social" element={<SocialHub />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}