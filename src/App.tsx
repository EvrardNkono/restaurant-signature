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
import SocialHub from "./admin/pages/SocialHub"; 
import CategoryManager from "./admin/pages/CategoryManager"; 
import AccompanimentManager from "./admin/pages/AccompanimentManager"; 
// --- AJOUT DU COMPOSANT GESTION DES TABLES ---
import TableManager from "./admin/pages/TableManager"; 

// Redirection HTTPS automatique (hors localhost)
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
}

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
            
            {/* Gestion des catégories */}
            <Route path="categories" element={<CategoryManager />} /> 
            
            {/* Gestion des accompagnements */}
            <Route path="accompaniments" element={<AccompanimentManager />} /> 
            
            <Route path="menu" element={<MenuManager />} />

            {/* --- NOUVELLE ROUTE POUR LA GESTION DES TABLES --- */}
            <Route path="tables" element={<TableManager />} /> 
            
            <Route path="orders" element={<Orders />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="social" element={<SocialHub />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}