import axios from 'axios';

const isLocal = window.location.hostname === "localhost";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api" 
  : "https://signature-backend-alpha.vercel.app/api";

export interface WheelSettings {
  _id?: string;
  isActive: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  updatedAt?: string;
}

// ==================== RÉCUPÉRER LES SETTINGS ====================
export const getWheelSettings = async (): Promise<WheelSettings> => {
  try {
    const response = await axios.get(`${BASE_URL}/wheel/settings`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur getWheelSettings:', error);
    // Retourner les valeurs par défaut en cas d'erreur
    return {
      isActive: true,
      title: "🎡 Tentez votre chance",
      subtitle: "Gagnez des plats offerts !",
      buttonText: "Jouer"
    };
  }
};

// ==================== METTRE À JOUR LES SETTINGS ====================
export const updateWheelSettings = async (settings: Partial<WheelSettings>): Promise<WheelSettings> => {
  try {
    const response = await axios.put(`${BASE_URL}/wheel/settings`, settings);
    return response.data.data;
  } catch (error) {
    console.error('Erreur updateWheelSettings:', error);
    throw error;
  }
};

// ==================== ACTIVER/DÉSACTIVER LE JEU ====================
export const toggleWheelGame = async (isActive: boolean): Promise<WheelSettings> => {
  try {
    const response = await axios.patch(`${BASE_URL}/wheel/toggle`, { isActive });
    return response.data.data;
  } catch (error) {
    console.error('Erreur toggleWheelGame:', error);
    throw error;
  }
};

// ==================== STATISTIQUES DU JEU ====================
export const getWheelStats = async (): Promise<{ totalPlays: number; lastPlay: string | null }> => {
  try {
    const response = await axios.get(`${BASE_URL}/wheel/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur getWheelStats:', error);
    return { totalPlays: 0, lastPlay: null };
  }
};