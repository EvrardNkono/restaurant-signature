import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// 1. Imports pour le cache
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import FloatingOrder from "./components/home/FloatingOrder";
import { CartProvider } from "./context/CartContext";

// Imports Administration
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import MenuManager from "./admin/pages/MenuManager";
import Orders from "./admin/pages/Orders";
import Appearance from "./admin/pages/Appearance";
import SocialHub from "./admin/pages/SocialHub"; 
import CategoryManager from "./admin/pages/CategoryManager"; 
import AccompanimentManager from "./admin/pages/AccompanimentManager"; 
import SupplementManager from "./admin/pages/SupplementAdmin"; // Ajout ici
import TableManager from "./admin/pages/TableManager"; 

// 2. Création du client de cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // Les données sont considérées "fraîches" pendant 10 minutes
      gcTime: 1000 * 60 * 30,    // Garde en mémoire pendant 30 minutes même si on ne les utilise pas
    },
  },
});

if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
}

export default function AppRouter() {
  return (
    // 3. On enveloppe avec le Provider de Cache
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router>
          <ScrollToTop />

          <Routes>
            {/* --- PARTIE CLIENT --- */}
            <Route
              path="/*"
              element={
                <>
                  <AdPopup word="SIGNATURE" />
                  <Navbar />
                  <FloatingOrder /> 

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

            {/* --- PARTIE ADMIN --- */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<CategoryManager />} /> 
              <Route path="menu" element={<MenuManager />} />
              <Route path="supplements" element={<SupplementManager />} /> {/* Ajout ici */}
              <Route path="accompaniments" element={<AccompanimentManager />} /> 
              <Route path="tables" element={<TableManager />} /> 
              <Route path="orders" element={<Orders />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="social" element={<SocialHub />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </QueryClientProvider>
  );
}