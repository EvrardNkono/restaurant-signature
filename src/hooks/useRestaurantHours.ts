import { useState, useEffect } from 'react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  name: string;
  open: boolean;
  lunch: TimeSlot | null;
  dinner: TimeSlot | null;
}

export function useRestaurantHours() {
  const [currentPeriod, setCurrentPeriod] = useState<"JOUR" | "SOIR" | "FERME">("FERME");
  const [nextPeriodInfo, setNextPeriodInfo] = useState<string | null>(null);

  const openingHours: DaySchedule[] = [
    { name: "Lundi", open: false, lunch: null, dinner: null },
    { name: "Mardi", open: true, lunch: { start: "12:00", end: "14:00" }, dinner: { start: "18:00", end: "23:00" } },
    { name: "Mercredi", open: true, lunch: { start: "12:00", end: "14:00" }, dinner: { start: "18:00", end: "23:00" } },
    { name: "Jeudi", open: true, lunch: { start: "12:00", end: "14:00" }, dinner: { start: "18:00", end: "23:00" } },
    { name: "Vendredi", open: true, lunch: { start: "12:00", end: "14:00" }, dinner: { start: "18:00", end: "23:00" } },
    { name: "Samedi", open: true, lunch: { start: "12:00", end: "14:00" }, dinner: { start: "18:00", end: "00:00" } },
    { name: "Dimanche", open: true, lunch: { start: "12:00", end: "14:00" }, dinner: { start: "18:00", end: "00:00" } }
  ];

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  };

  const isTimeInRange = (current: Date, start: Date, end: Date): boolean => {
    // Gestion spéciale pour minuit
    if (end.getHours() === 0 && end.getMinutes() === 0) {
      end.setHours(23, 59, 59);
    }
    return current >= start && current <= end;
  };

  const getNextPeriod = (currentDate: Date): { period: "JOUR" | "SOIR", time: string, day: string } | null => {
    const currentDay = currentDate.getDay();
    const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1;
    const currentTime = parseTime(`${currentDate.getHours()}:${currentDate.getMinutes()}`);
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    
    // Vérifier si on peut encore commander pour le déjeuner aujourd'hui
    const todaySchedule = openingHours[currentDayIndex];
    if (todaySchedule.open && todaySchedule.lunch) {
      const lunchStart = parseTime(todaySchedule.lunch.start);
      const lunchEnd = parseTime(todaySchedule.lunch.end);
      
      // Si on est avant le déjeuner
      if (currentTime < lunchStart) {
        return { period: "JOUR", time: todaySchedule.lunch.start, day: "aujourd'hui" };
      }
      // Si on est pendant le déjeuner mais avant la fin (dernière commande 30 min avant)
      if (currentTime >= lunchStart && currentTime <= new Date(lunchEnd.getTime() - 30 * 60000)) {
        return { period: "JOUR", time: "maintenant", day: "aujourd'hui" };
      }
    }
    
    // Vérifier le dîner aujourd'hui
    if (todaySchedule.open && todaySchedule.dinner) {
      const dinnerStart = parseTime(todaySchedule.dinner.start);
      const dinnerEnd = parseTime(todaySchedule.dinner.end);
      
      if (currentTime < dinnerStart) {
        return { period: "SOIR", time: todaySchedule.dinner.start, day: "aujourd'hui" };
      }
      if (currentTime >= dinnerStart && currentTime <= new Date(dinnerEnd.getTime() - 30 * 60000)) {
        return { period: "SOIR", time: "maintenant", day: "aujourd'hui" };
      }
    }
    
    // Chercher le prochain service
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextSchedule = openingHours[nextDayIndex];
      
      if (nextSchedule.open) {
        // Priorité au déjeuner
        if (nextSchedule.lunch) {
          return { 
            period: "JOUR", 
            time: nextSchedule.lunch.start, 
            day: days[nextDayIndex] 
          };
        }
        // Sinon dîner
        if (nextSchedule.dinner) {
          return { 
            period: "SOIR", 
            time: nextSchedule.dinner.start, 
            day: days[nextDayIndex] 
          };
        }
      }
    }
    
    return null;
  };

  const checkCurrentPeriod = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1;
    const todaySchedule = openingHours[currentDayIndex];
    const currentTime = parseTime(`${now.getHours()}:${now.getMinutes()}`);
    
    if (!todaySchedule.open) {
      const next = getNextPeriod(now);
      setCurrentPeriod("FERME");
      setNextPeriodInfo(next ? `${next.period === "JOUR" ? "Déjeuner" : "Dîner"} le ${next.day} à ${next.time}` : null);
      return;
    }
    
    // Vérifier service du midi
    if (todaySchedule.lunch) {
      const lunchStart = parseTime(todaySchedule.lunch.start);
      const lunchEnd = parseTime(todaySchedule.lunch.end);
      // Dernière commande 30 min avant fermeture
      const lastOrderTime = new Date(lunchEnd.getTime() - 30 * 60000);
      
      if (isTimeInRange(currentTime, lunchStart, lastOrderTime)) {
        setCurrentPeriod("JOUR");
        setNextPeriodInfo(null);
        return;
      }
    }
    
    // Vérifier service du soir
    if (todaySchedule.dinner) {
      const dinnerStart = parseTime(todaySchedule.dinner.start);
      let dinnerEnd = parseTime(todaySchedule.dinner.end);
      if (todaySchedule.dinner.end === "00:00") {
        dinnerEnd = parseTime("23:59");
      }
      const lastOrderTime = new Date(dinnerEnd.getTime() - 30 * 60000);
      
      if (isTimeInRange(currentTime, dinnerStart, lastOrderTime)) {
        setCurrentPeriod("SOIR");
        setNextPeriodInfo(null);
        return;
      }
    }
    
    // Entre les services ou après fermeture
    const next = getNextPeriod(now);
    setCurrentPeriod("FERME");
    setNextPeriodInfo(next ? `${next.period === "JOUR" ? "Déjeuner" : "Dîner"} le ${next.day} à ${next.time}` : null);
  };

  useEffect(() => {
    checkCurrentPeriod();
    const interval = setInterval(checkCurrentPeriod, 60000);
    return () => clearInterval(interval);
  }, []);

  return { currentPeriod, nextPeriodInfo, openingHours };
}