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
import OrderSuccess from "./pages/OrderSuccess";
import Chatbot from "./components/Chatbot"; 
import AdPopup from "./components/AdPopup"; 
import ScrollToTop from "./components/ScrollToTop";
import FloatingOrder from "./components/home/FloatingOrder";
import { CartProvider } from "./context/CartContext";
import InstallButton from './components/InstallButton';

// NOUVEAU : Import du Social Floating Button
import SocialFloatingButton from './components/SocialFloatingButton';

// 🆕 IMPORTS BLOG
import BlogPage from "./pages/BlogPage";
import BlogArticle from "./pages/BlogArticle";

// 🆕 IMPORTS QUIZ
import QuizPage from "./pages/QuizPage";
import QuizPopup from "./components/QuizPopup";

// 🎡 IMPORTS JEU DE LA ROUE
import FloatingWheelButton from "./components/FloatingWheelButton";
import WheelGame from "./components/WheelGame";
import { useState, useEffect } from "react";
import { getWheelSettings } from "./services/wheelService";
import axios from "axios";

// Imports Administration
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import MenuManager from "./admin/pages/MenuManager";
import Orders from "./admin/pages/Orders";
import Appearance from "./admin/pages/Appearance";
import SocialHub from "./admin/pages/SocialHub"; 
import CategoryManager from "./admin/pages/CategoryManager"; 
import AccompanimentManager from "./admin/pages/AccompanimentManager"; 
import SupplementManager from "./admin/pages/SupplementAdmin";
import TableManager from "./admin/pages/TableManager";
import WheelSettings from "./admin/pages/WheelSettings"; // 🎡 Page admin du jeu
import BlogManager from "./admin/pages/BlogManager"; // 📰 Page admin du blog
import QuizManagement from "./admin/pages/QuizManagement"; // 🧑‍🍳 NOUVEAU - Page admin du quiz

// 2. Création du client de cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 30,    // 30 minutes
    },
  },
});

if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
}

// Configuration du Quiz
const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

const QUIZ_API_URL = `${BASE_URL}/quiz`;

export default function AppRouter() {
  const [showWheel, setShowWheel] = useState(false);
  const [isWheelActive, setIsWheelActive] = useState(true);

  // --- STATE DU QUIZ POPUP ---
  const [showQuizPopup, setShowQuizPopup] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [popupShown, setPopupShown] = useState(false);

  // Charger l'état du jeu de la roue
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getWheelSettings();
        setIsWheelActive(settings.isActive);
      } catch (error) {
        console.error('Erreur chargement settings wheel:', error);
      }
    };
    fetchSettings();
  }, []);

  // Vérifier si le quiz est actif et afficher le popup
  useEffect(() => {
    const checkQuizStatus = async () => {
      // Ne vérifier que si le popup n'a pas déjà été affiché
      const hasPopupBeenShown = sessionStorage.getItem("quiz_popup_shown");
      if (hasPopupBeenShown) {
        setPopupShown(true);
        return;
      }

      try {
        const sessionRes = await axios.get(`${QUIZ_API_URL}/session/active`);
        if (sessionRes.data && sessionRes.data.active) {
          setIsQuizActive(true);
        }
      } catch (error) {
        // Pas de session active, le quiz est désactivé
        setIsQuizActive(false);
      }
    };

    checkQuizStatus();
  }, []);

  // Afficher le popup après un délai si le quiz est actif
  useEffect(() => {
    if (isQuizActive && !popupShown) {
      const timer = setTimeout(() => {
        setShowQuizPopup(true);
        setPopupShown(true);
        sessionStorage.setItem("quiz_popup_shown", "true");
      }, 1500); // Attendre 1.5s pour que la page se charge

      return () => clearTimeout(timer);
    }
  }, [isQuizActive, popupShown]);

  // Fermeture du popup
  const handlePopupClose = () => {
    setShowQuizPopup(false);
  };

  const handleWin = (reward: any) => {
    // 🎉 Action quand l'utilisateur gagne
    console.log('🎉 Gagné:', reward.label);
    
    // ✅ Notification plus élégante que alert()
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #1a1a1a, #2D2422);
      border: 2px solid #D4AF37;
      border-radius: 20px;
      padding: 2rem 3rem;
      color: #F5E6A3;
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      text-align: center;
      z-index: 99999;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(212,175,55,0.1);
      animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    toast.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
      <div style="font-size: 1.2rem; font-weight: 700; color: #D4AF37;">Félicitations !</div>
      <div style="font-size: 1rem; color: #aaa; margin-top: 0.5rem;">Vous avez gagné :</div>
      <div style="font-size: 1.8rem; margin-top: 0.3rem;">${reward.label}</div>
      <div style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">${reward.description}</div>
      <button style="
        margin-top: 1.5rem;
        padding: 0.6rem 2rem;
        background: linear-gradient(135deg, #D4AF37, #B8962E);
        border: none;
        border-radius: 50px;
        color: #1a1a1a;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
      " onclick="this.parentElement.remove()">
        ✨ Super !
      </button>
    `;
    document.body.appendChild(toast);
    
    // Supprimer après 10s si l'utilisateur ne clique pas
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.remove();
      }
    }, 10000);
  };

  return (
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
                  {/* Popup publicitaire existant */}
                  <AdPopup />
                  
                  {/* 🧑‍🍳 NOUVEAU - Popup du Quiz "La Question du Chef" */}
                  {showQuizPopup && <QuizPopup onClose={handlePopupClose} />}

                  <Navbar />
                  <FloatingOrder />
                  <InstallButton />
                  <SocialFloatingButton />

                  {/* 🎡 BOUTON FLOATING DU JEU DE LA ROUE */}
                  {isWheelActive && (
                    <FloatingWheelButton onClick={() => setShowWheel(true)} />
                  )}

                  <WheelGame 
                    isOpen={showWheel}
                    onClose={() => setShowWheel(false)}
                    onWin={handleWin}
                    isTestMode={false}
                  />

                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/carte" element={<CarteRestaurant />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/menu-soir" element={<MenuSoir />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogArticle />} />
                      <Route path="/a-propos" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/panier" element={<Cart />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      
                      {/* 🧑‍🍳 NOUVEAU - Route du Quiz */}
                      <Route path="/quiz" element={<QuizPage />} />
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
              <Route path="supplements" element={<SupplementManager />} />
              <Route path="accompaniments" element={<AccompanimentManager />} /> 
              <Route path="tables" element={<TableManager />} /> 
              <Route path="orders" element={<Orders />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="social" element={<SocialHub />} />
              <Route path="wheel" element={<WheelSettings />} /> {/* 🎡 Page admin du jeu */}
              <Route path="blog" element={<BlogManager />} /> {/* 📰 Page admin du blog */}
              
              {/* 🧑‍🍳 NOUVEAU - Page admin du Quiz */}
              <Route path="quiz" element={<QuizManagement />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </QueryClientProvider>
  );
}