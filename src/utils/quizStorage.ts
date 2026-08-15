// src/utils/quizStorage.ts

const STORAGE_KEY = 'signature_quiz_data';

interface QuizPlayerData {
  playerId: string;        // ID unique généré
  points: number;
  roueDebloquee: boolean;
  historique: {
    date: string;
    score: number;
    pointsGagnes: number;
  }[];
}

// Générer un ID unique
const generatePlayerId = (): string => {
  return 'PLAYER_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
};

// Récupérer les données du joueur
export const getPlayerData = (): QuizPlayerData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Si corruption, recréer
    }
  }
  
  // Créer nouveau joueur
  const newData: QuizPlayerData = {
    playerId: generatePlayerId(),
    points: 0,
    roueDebloquee: false,
    historique: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  return newData;
};

// Sauvegarder les données
export const savePlayerData = (data: QuizPlayerData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Ajouter des points
export const addPoints = (points: number): void => {
  const data = getPlayerData();
  data.points += points;
  if (data.points >= 3) {
    data.roueDebloquee = true;
  }
  savePlayerData(data);
};

// Réinitialiser les points (après la roue)
export const resetPoints = (): void => {
  const data = getPlayerData();
  data.points = 0;
  data.roueDebloquee = false;
  savePlayerData(data);
};

// Ajouter une partie à l'historique
export const addHistorique = (score: number, pointsGagnes: number): void => {
  const data = getPlayerData();
  data.historique.push({
    date: new Date().toISOString(),
    score,
    pointsGagnes,
  });
  savePlayerData(data);
};

// Vérifier si la roue est débloquée
export const isRoueDebloquee = (): boolean => {
  const data = getPlayerData();
  return data.roueDebloquee;
};

// Obtenir les points
export const getPoints = (): number => {
  const data = getPlayerData();
  return data.points;
};