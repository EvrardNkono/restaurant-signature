// src/admin/hooks/usePendingReservations.ts
// Nombre de réservations à confirmer (badge de la barre d'administration)
import { useEffect, useState } from "react";
import axios from "axios";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

export default function usePendingReservations(intervalMs = 30000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      axios
        .get(`${BASE_API}/reservations/pending-count`)
        .then((r) => alive && setCount(r.data.count || 0))
        .catch(() => {});
    load();
    const id = setInterval(load, intervalMs);
    // La page Réservations déclenche cet événement après chaque action : badge à jour immédiatement
    window.addEventListener("reservations:changed", load);
    return () => {
      alive = false;
      clearInterval(id);
      window.removeEventListener("reservations:changed", load);
    };
  }, [intervalMs]);

  return count;
}
