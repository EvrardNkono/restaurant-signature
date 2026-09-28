// src/admin/pages/Dashboard.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Sun, Moon, LayoutGrid, Truck, RefreshCw, Download,
  FileSpreadsheet, Images, Package, Check, AlertTriangle,
} from "lucide-react";
import axios from "axios";
import "./Dashboard.css";
import InstallButtonAdmin from "../components/InstallButtonAdmin";

const isLocal = window.location.hostname === "localhost";
const BASE_API = isLocal
  ? "http://localhost:5000/api"
  : "https://signature-backend-alpha.vercel.app/api";

type Toast = { type: "success" | "error"; text: string } | null;
type ExportKind = "images" | "csv" | "all" | null;
type Mode = "JOUR" | "SOIR" | "CARTE";

const MODES: { id: Mode; label: string; preview: string; icon: typeof Sun }[] = [
  { id: "JOUR", label: "Midi", preview: "Menu du midi", icon: Sun },
  { id: "SOIR", label: "Soir", preview: "Menu du soir", icon: Moon },
  { id: "CARTE", label: "Carte complète", preview: "Tous les produits", icon: LayoutGrid },
];

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, cooking: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [displayMode, setDisplayMode] = useState<Mode>("JOUR");

  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [exporting, setExporting] = useState<ExportKind>(null);
  const [progress, setProgress] = useState(0);
  const [imagesCount, setImagesCount] = useState(0);

  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((type: "success" | "error", text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  // ---------- Données ----------
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_API}/orders`);
      const orders: any[] = res.data.data ?? [];
      const count = (s: string) => orders.filter((o) => o.status === s).length;
      setStats({
        total: orders.length,
        revenue: orders
          .filter((o) => o.status === "done" || o.status === "archived")
          .reduce((acc, o) => acc + parseFloat(o.total || 0), 0),
        pending: count("pending"),
        cooking: count("cooking"),
        done: count("done"),
      });
      setUpdatedAt(new Date());
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchImagesCount = async () => {
    try {
      const res = await axios.get(`${BASE_API}/export/images/list`);
      if (res.data.success) setImagesCount(res.data.count || 0);
    } catch {
      setImagesCount(0);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${BASE_API}/settings`);
      if (res.data.success && res.data.data) {
        setDeliveryAvailable(res.data.data.deliveryAvailable ?? true);
      }
    } catch (err) {
      console.error("Erreur chargement paramètres:", err);
    }
  };

  const toggleDelivery = async () => {
    setDeliveryLoading(true);
    const next = !deliveryAvailable;
    try {
      const res = await axios.put(`${BASE_API}/settings`, { deliveryAvailable: next });
      if (!res.data.success) throw new Error("Réponse invalide");
      setDeliveryAvailable(next);
      notify("success", next ? "Livraisons activées" : "Livraisons désactivées");
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      notify("error", "Modification impossible. Réessayez.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  // ---------- Exports ----------
  const download = async (kind: Exclude<ExportKind, null>, path: string, fallback: string) => {
    setExporting(kind);
    setProgress(0);
    try {
      const res = await axios.get(`${BASE_API}${path}`, {
        responseType: "blob",
        onDownloadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      let filename = fallback;
      const cd: string | undefined = res.headers["content-disposition"];
      const match = cd?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      if (match?.[1]) filename = decodeURIComponent(match[1]);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify("success", "Export téléchargé");
    } catch (err) {
      console.error("Erreur export:", err);
      notify("error", "Export impossible. Réessayez dans un instant.");
    } finally {
      setExporting(null);
      setProgress(0);
    }
  };

  // ---------- Effets ----------
  useEffect(() => {
    fetchStats();
    fetchSettings();
    fetchImagesCount();

    // Polling 30 s, en pause quand l'onglet est masqué
    let id: number | undefined;
    const start = () => { id = window.setInterval(fetchStats, 30000); };
    const stop = () => window.clearInterval(id);
    const onVisibility = () => {
      stop();
      if (!document.hidden) { fetchStats(); start(); }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [fetchStats]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin-sw.js", { scope: "/admin/" })
        .catch((err) => console.error("Admin SW erreur:", err));
    }
  }, []);

  // ---------- Rendu ----------
  const value = (v: string | number) => (loading ? <span className="db-skeleton" /> : v);
  const pipelineTotal = stats.pending + stats.cooking + stats.done || 1;
  const pipeline = [
    { key: "pending", label: "En attente", n: stats.pending },
    { key: "cooking", label: "En cuisine", n: stats.cooking },
    { key: "done", label: "Prêtes ou servies", n: stats.done },
  ];
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const activeMode = MODES.find((m) => m.id === displayMode)!;
  const busy = exporting !== null;

  return (
    <div className="db">
      <header className="db-head">
        <div>
          <p className="db-date">{today}</p>
          <h1 className="db-title">Tableau de bord</h1>
        </div>
        <button
          className="db-refresh"
          onClick={() => { setRefreshing(true); fetchStats(); }}
          disabled={refreshing}
          aria-label="Actualiser les chiffres"
        >
          <RefreshCw size={16} className={refreshing ? "db-spin" : ""} />
          <span>
            {updatedAt
              ? `Mis à jour à ${updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
              : "Actualiser"}
          </span>
        </button>
      </header>

      {/* Chiffres clés */}
      <section className="db-kpis" aria-label="Chiffres clés">
        <div className="db-lead">
          <span className="db-lead-label">Chiffre d'affaires encaissé</span>
          <strong className="db-lead-value">{value(eur.format(stats.revenue))}</strong>
          <span className="db-lead-sub">
            {loading ? "" : `sur ${stats.total} commande${stats.total > 1 ? "s" : ""} au total`}
          </span>
        </div>

        <div className="db-pipeline">
          <div className="db-bar" role="img" aria-label="Répartition des commandes en cours">
            {pipeline.map((p) => (
              <span
                key={p.key}
                className={`db-bar-seg db-${p.key}`}
                style={{ flexGrow: p.n }}
              />
            ))}
          </div>
          <ul className="db-steps">
            {pipeline.map((p) => (
              <li key={p.key}>
                <span className={`db-dot db-${p.key}`} aria-hidden="true" />
                <span className="db-step-n">{value(p.n)}</span>
                <span className="db-step-l">{p.label}</span>
              </li>
            ))}
          </ul>
          <p className="db-hint">
            {stats.pending > 0
              ? `${stats.pending} commande${stats.pending > 1 ? "s" : ""} à prendre en charge`
              : "Aucune commande en attente"}
          </p>
        </div>
      </section>

      <div className="db-grid">
        {/* Livraison */}
        <section className="db-panel">
          <div className="db-panel-head">
            <Truck size={18} aria-hidden="true" />
            <h2>Livraison</h2>
          </div>
          <div className="db-switch-row">
            <div>
              <p className="db-strong">{deliveryAvailable ? "Livraisons ouvertes" : "Livraisons fermées"}</p>
              <p className="db-muted">
                {deliveryAvailable
                  ? "Les clients peuvent choisir la livraison."
                  : "Les clients ne peuvent plus choisir la livraison."}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={deliveryAvailable}
              aria-label="Service de livraison"
              className={`db-switch ${deliveryAvailable ? "on" : ""}`}
              onClick={toggleDelivery}
              disabled={deliveryLoading}
            >
              <span className="db-switch-knob" />
            </button>
          </div>
        </section>

        {/* Mode d'affichage */}
        <section className="db-panel">
          <div className="db-panel-head">
            <LayoutGrid size={18} aria-hidden="true" />
            <h2>Menu affiché</h2>
          </div>
          <div className="db-segment" role="group" aria-label="Mode d'affichage du menu">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                aria-pressed={displayMode === id}
                className={displayMode === id ? "active" : ""}
                onClick={() => setDisplayMode(id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="db-muted">Aperçu : {activeMode.preview}</p>
        </section>
      </div>

      {/* Exports */}
      <section className="db-panel db-export">
        <div className="db-panel-head">
          <Package size={18} aria-hidden="true" />
          <h2>Exporter le catalogue</h2>
        </div>
        <p className="db-muted db-export-text">
          Images des plats, fichier CSV (nom, description, prix, catégorie, disponibilité) et
          métadonnées, prêts pour un catalogue papier ou une autre application.
        </p>

        <div className="db-actions">
          <button
            className="db-btn db-btn-primary"
            disabled={busy}
            onClick={() => download("all", "/export/complete", `signature_complet_${Date.now()}.zip`)}
          >
            {exporting === "all" ? <RefreshCw size={16} className="db-spin" /> : <Download size={16} />}
            <span>{exporting === "all" ? "Préparation…" : "Tout exporter (ZIP)"}</span>
          </button>
          <button
            className="db-btn"
            disabled={busy}
            onClick={() => download("images", "/export/images/all", `signature_images_${Date.now()}.zip`)}
          >
            {exporting === "images" ? <RefreshCw size={16} className="db-spin" /> : <Images size={16} />}
            <span>Images ({imagesCount})</span>
          </button>
          <button
            className="db-btn"
            disabled={busy}
            onClick={() => download("csv", "/export/plats-data", `plats_catalogue_${Date.now()}.csv`)}
          >
            {exporting === "csv" ? <RefreshCw size={16} className="db-spin" /> : <FileSpreadsheet size={16} />}
            <span>Catalogue CSV</span>
          </button>
        </div>

        {busy && (
          <div
            className="db-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: progress > 0 ? `${progress}%` : "35%" }} className={progress > 0 ? "" : "indeterminate"} />
          </div>
        )}
      </section>

      <InstallButtonAdmin />

      <div className="db-toast-zone" role="status" aria-live="polite">
        {toast && (
          <div className={`db-toast ${toast.type}`}>
            {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{toast.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}