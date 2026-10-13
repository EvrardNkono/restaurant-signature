import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import axios from 'axios';
import {
  Send,
  Loader2,
  Facebook,
  Instagram,
  Youtube,
  Radio,
  UploadCloud,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import './SocialHub.css';

// --- CONFIGURATION SIGNATURE MEDIA ---
const CLOUD_NAME = 'djzarpmvq';
const UPLOAD_PRESET = 'signature_preset';
const WEBHOOK_URL = 'https://hook.eu1.make.com/8mlidrzi4zgdap4b957x3fnrq5k75vn5';

// --- LIMITES ---
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;
const MAX_TITLE = 100;

// --- TYPES ---
type PlatformId = 'facebook' | 'instagram' | 'tiktok' | 'youtube';
type MediaType = 'image' | 'video';
type NoticeType = 'success' | 'error';

interface MediaMeta {
  width?: number;
  height?: number;
  duration?: number;
}

interface PlatformConfig {
  id: PlatformId;
  label: string;
  needsVideo: boolean;
  captionMax: number;
  icon: ComponentType<{ size?: number }>;
}

// Icône TikTok (Lucide n'en propose pas)
const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
  </svg>
);

const PLATFORMS: PlatformConfig[] = [
  { id: 'facebook', label: 'Facebook', needsVideo: false, captionMax: 63000, icon: Facebook },
  { id: 'instagram', label: 'Instagram', needsVideo: false, captionMax: 2200, icon: Instagram },
  { id: 'tiktok', label: 'TikTok', needsVideo: true, captionMax: 2200, icon: TikTokIcon },
  { id: 'youtube', label: 'YouTube Shorts', needsVideo: true, captionMax: 5000, icon: Youtube },
];

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
    : `${Math.max(1, Math.round(bytes / 1024))} Ko`;

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};

export default function SocialHub() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [meta, setMeta] = useState<MediaMeta>({});
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState<Record<PlatformId, boolean>>({
    facebook: true,
    instagram: true,
    tiktok: false,
    youtube: false,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notice, setNotice] = useState<{ type: NoticeType; text: string } | null>(null);

  // --- Aperçu local du fichier (sans base64) ---
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // --- Fermeture automatique des messages ---
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  // --- Sélection / validation du fichier ---
  const acceptFile = useCallback((f?: File) => {
    if (!f) return;
    const isVideo = f.type.startsWith('video/');
    const isImage = f.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setNotice({ type: 'error', text: 'Format non pris en charge. Choisissez une image ou une vidéo.' });
      return;
    }
    const limit = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (f.size > limit * 1024 * 1024) {
      setNotice({
        type: 'error',
        text: `Fichier trop lourd (${formatSize(f.size)}). Maximum : ${limit} Mo pour ${isVideo ? 'une vidéo' : 'une image'}.`,
      });
      return;
    }
    setFile(f);
    setMediaType(isVideo ? 'video' : 'image');
    setMeta({});
  }, []);

  const removeFile = () => {
    setFile(null);
    setMediaType(null);
    setMeta({});
  };

  const togglePlatform = (id: PlatformId) => {
    setPlatforms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Contraintes ---
  const activePlatforms = PLATFORMS.filter((p) => platforms[p.id]);

  const captionLimit = activePlatforms.length
    ? Math.min(...activePlatforms.map((p) => p.captionMax))
    : 2200;

  const { errors, warnings } = useMemo(() => {
    const errs: string[] = [];
    const warns: string[] = [];

    if (!file) errs.push('Ajoutez une image ou une vidéo.');
    if (!content.trim()) errs.push('Rédigez la légende.');
    if (activePlatforms.length === 0) errs.push('Sélectionnez au moins un canal.');

    if (mediaType === 'image') {
      activePlatforms
        .filter((p) => p.needsVideo)
        .forEach((p) => errs.push(`${p.label} nécessite une vidéo.`));
    }
    if (platforms.youtube && !title.trim()) {
      errs.push('YouTube exige un titre.');
    }
    if (content.length > captionLimit) {
      errs.push(`Légende trop longue : ${captionLimit} caractères maximum pour les canaux choisis.`);
    }

    if (mediaType === 'video') {
      const vertical = platforms.instagram || platforms.tiktok || platforms.youtube;
      if (vertical && meta.width && meta.height && meta.width >= meta.height) {
        warns.push('Vidéo non verticale : le format 9:16 est recommandé pour Reels, TikTok et Shorts.');
      }
      if (platforms.youtube && meta.duration && meta.duration > 180) {
        warns.push('YouTube Shorts est limité à 3 minutes.');
      }
    }
    return { errors: errs, warnings: warns };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, content, title, mediaType, meta, platforms, captionLimit]);

  const canPublish = errors.length === 0 && !isPublishing;

  // --- Diffusion ---
  const broadcastNow = async () => {
    if (!file || errors.length > 0) return;

    setIsPublishing(true);
    setUploadProgress(0);
    setNotice(null);

    try {
      // ÉTAPE 1 : Cloudinary (upload direct du fichier, image ou vidéo)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        formData,
        {
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 100) / (p.total || file.size || 100));
            setUploadProgress(Math.min(85, Math.round(percent * 0.85)));
          },
        }
      );
      const mediaUrl: string = cloudRes.data.secure_url;

      // ÉTAPE 2 : Make.com (distribution)
      setUploadProgress(92);
      await axios.post(WEBHOOK_URL, {
        title: title.trim(),
        content: content.trim(),
        file: mediaUrl,
        mediaType,
        targetPlatforms: activePlatforms.map((p) => p.id),
      });

      setUploadProgress(100);
      setNotice({
        type: 'success',
        text: `Diffusion lancée sur ${activePlatforms.map((p) => p.label).join(', ')}.`,
      });

      // Réinitialisation pour éviter une double publication
      removeFile();
      setTitle('');
      setContent('');
    } catch (err: any) {
      console.error('Erreur :', err.response?.data || err.message);
      setNotice({
        type: 'error',
        text: err.response?.data?.error?.message || 'Échec de la diffusion. Vérifiez votre connexion et réessayez.',
      });
    } finally {
      setTimeout(() => {
        setIsPublishing(false);
        setUploadProgress(0);
      }, 800);
    }
  };

  // --- Glisser-déposer ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isPublishing) setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isPublishing) acceptFile(e.dataTransfer.files?.[0]);
  };

  const orientation =
    meta.width && meta.height
      ? meta.width === meta.height
        ? 'Carré'
        : meta.height > meta.width
        ? 'Vertical'
        : 'Horizontal'
      : null;

  return (
    <div className="sh-page">
      {/* ---------- BARRE SUPÉRIEURE ---------- */}
      <header className="sh-topbar">
        <div className="sh-brand">
          <span className="sh-seal" aria-hidden="true">
            <Radio size={18} />
          </span>
          <div className="sh-brand-text">
            <span className="sh-brand-name">Signature Media</span>
            <span className="sh-brand-sub">Broadcaster Pro</span>
          </div>
        </div>
        <p className="sh-topbar-note">Un contenu, tous vos réseaux.</p>
      </header>

      <main className="sh-shell">
        <div className="sh-intro">
          <h1 className="sh-title">Nouvelle publication</h1>
          <p className="sh-lead">
            Ajoutez votre média, rédigez la légende, choisissez vos canaux. Le contenu est diffusé en une seule action.
          </p>
        </div>

        <div className="sh-grid">
          {/* ---------- COMPOSITION ---------- */}
          <section className="sh-composer" aria-label="Composition">
            {/* Étape 1 : média */}
            <div className="sh-card">
              <div className="sh-card-head">
                <span className="sh-step">1</span>
                <div>
                  <h2 className="sh-card-title">Média</h2>
                  <p className="sh-card-sub">
                    Image (max {MAX_IMAGE_MB} Mo) ou vidéo (max {MAX_VIDEO_MB} Mo). Format vertical 9:16 recommandé.
                  </p>
                </div>
              </div>

              <div
                className="sh-media-field"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input
                  type="file"
                  id="file-up"
                  className="sh-file-input"
                  accept="image/*,video/*"
                  disabled={isPublishing}
                  onChange={(e) => {
                    acceptFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />

                {file && previewUrl ? (
                  <div className={`sh-media-ready ${isDragging ? 'is-dragging' : ''}`}>
                    <div className="sh-media-stage">
                      {mediaType === 'video' ? (
                        <video
                          src={previewUrl}
                          className="sh-media-preview"
                          controls
                          playsInline
                          onLoadedMetadata={(e) =>
                            setMeta({
                              width: e.currentTarget.videoWidth,
                              height: e.currentTarget.videoHeight,
                              duration: e.currentTarget.duration,
                            })
                          }
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Aperçu du média"
                          className="sh-media-preview"
                          onLoad={(e) =>
                            setMeta({
                              width: e.currentTarget.naturalWidth,
                              height: e.currentTarget.naturalHeight,
                            })
                          }
                        />
                      )}
                    </div>

                    <div className="sh-media-bar">
                      <div className="sh-media-info">
                        <span className="sh-media-icon">
                          {mediaType === 'video' ? <Film size={16} /> : <ImageIcon size={16} />}
                        </span>
                        <div className="sh-media-text">
                          <span className="sh-media-name" title={file.name}>
                            {file.name}
                          </span>
                          <span className="sh-media-meta">
                            {[
                              formatSize(file.size),
                              meta.width && meta.height ? `${meta.width}×${meta.height}` : null,
                              orientation,
                              mediaType === 'video' && meta.duration ? formatDuration(meta.duration) : null,
                            ]
                              .filter(Boolean)
                              .join('  ·  ')}
                          </span>
                        </div>
                      </div>
                      <div className="sh-media-actions">
                        <label
                          htmlFor="file-up"
                          className={`sh-btn-ghost ${isPublishing ? 'is-disabled' : ''}`}
                        >
                          <RefreshCw size={15} />
                          Remplacer
                        </label>
                        <button
                          type="button"
                          className="sh-btn-ghost sh-btn-danger"
                          onClick={removeFile}
                          disabled={isPublishing}
                        >
                          <Trash2 size={15} />
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="file-up"
                    className={`sh-dropzone ${isDragging ? 'is-dragging' : ''}`}
                  >
                    <span className="sh-dropzone-icon">
                      <UploadCloud size={26} />
                    </span>
                    <span className="sh-dropzone-title">Glissez votre fichier ici</span>
                    <span className="sh-dropzone-sub">ou cliquez pour parcourir vos fichiers</span>
                  </label>
                )}
              </div>
            </div>

            {/* Étape 2 : texte */}
            <div className="sh-card">
              <div className="sh-card-head">
                <span className="sh-step">2</span>
                <div>
                  <h2 className="sh-card-title">Texte</h2>
                  <p className="sh-card-sub">Le titre sert de repère interne et de titre sur YouTube.</p>
                </div>
              </div>

              <div className="sh-field">
                <div className="sh-field-row">
                  <label className="sh-label" htmlFor="post-title">
                    Titre
                  </label>
                  <span className="sh-counter">
                    {title.length}/{MAX_TITLE}
                  </span>
                </div>
                <input
                  id="post-title"
                  type="text"
                  className="sh-input"
                  placeholder="Ex : Soirée dégustation truffe"
                  maxLength={MAX_TITLE}
                  value={title}
                  disabled={isPublishing}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="sh-field">
                <div className="sh-field-row">
                  <label className="sh-label" htmlFor="post-caption">
                    Légende
                  </label>
                  <span className={`sh-counter ${content.length > captionLimit ? 'is-over' : ''}`}>
                    {content.length}/{captionLimit}
                  </span>
                </div>
                <textarea
                  id="post-caption"
                  className="sh-input sh-textarea"
                  rows={5}
                  placeholder="Décrivez votre plat ou votre événement…"
                  value={content}
                  disabled={isPublishing}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            {/* Étape 3 : canaux */}
            <div className="sh-card">
              <div className="sh-card-head">
                <span className="sh-step">3</span>
                <div>
                  <h2 className="sh-card-title">Canaux</h2>
                  <p className="sh-card-sub">Sélectionnez où publier ce contenu.</p>
                </div>
              </div>

              <div className="sh-channels">
                {PLATFORMS.map((p) => {
                  const active = platforms[p.id];
                  const blocked = active && p.needsVideo && mediaType === 'image';
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`sh-channel ${active ? 'is-active' : ''} ${blocked ? 'is-blocked' : ''}`}
                      aria-pressed={active}
                      disabled={isPublishing}
                      onClick={() => togglePlatform(p.id)}
                    >
                      <span className="sh-channel-icon">
                        <Icon size={18} />
                      </span>
                      <span className="sh-channel-text">
                        <span className="sh-channel-name">{p.label}</span>
                        <span className="sh-channel-hint">
                          {blocked ? 'Vidéo requise' : p.needsVideo ? 'Vidéo uniquement' : 'Image ou vidéo'}
                        </span>
                      </span>
                      <span className="sh-channel-check" aria-hidden="true">
                        {active && <CheckCircle2 size={18} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---------- APERÇU ---------- */}
          <aside className="sh-preview" aria-label="Aperçu">
            <div className="sh-preview-inner">
              <h2 className="sh-preview-title">Aperçu</h2>

              <div className="sh-phone">
                <div className="sh-phone-screen">
                  {previewUrl && mediaType === 'video' && (
                    <video src={previewUrl} className="sh-phone-media" muted loop autoPlay playsInline />
                  )}
                  {previewUrl && mediaType === 'image' && (
                    <img src={previewUrl} alt="" className="sh-phone-media" />
                  )}
                  {!previewUrl && (
                    <div className="sh-phone-empty">
                      <Film size={28} />
                      <span>Votre média apparaîtra ici</span>
                    </div>
                  )}

                  <div className="sh-phone-shade" />
                  <div className="sh-phone-caption">
                    <strong>Signature Media</strong>
                    {title.trim() && <span className="sh-phone-title">{title.trim()}</span>}
                    <p>{content.trim() || 'Votre légende apparaîtra ici.'}</p>
                  </div>
                </div>
              </div>

              <div className="sh-preview-chips">
                {activePlatforms.length === 0 ? (
                  <span className="sh-chip is-empty">Aucun canal</span>
                ) : (
                  activePlatforms.map((p) => {
                    const Icon = p.icon;
                    return (
                      <span key={p.id} className="sh-chip">
                        <Icon size={13} />
                        {p.label}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* ---------- PUBLICATION ---------- */}
          <section className="sh-publish" aria-label="Publication">
            <div className="sh-checks">
              <h2 className="sh-checks-title">Avant la diffusion</h2>

              {errors.length === 0 && warnings.length === 0 && (
                <p className="sh-check is-ok">
                  <CheckCircle2 size={16} />
                  Tout est prêt.
                </p>
              )}
              {errors.map((e) => (
                <p key={e} className="sh-check is-error">
                  <XCircle size={16} />
                  {e}
                </p>
              ))}
              {warnings.map((w) => (
                <p key={w} className="sh-check is-warn">
                  <AlertTriangle size={16} />
                  {w}
                </p>
              ))}
            </div>

            <div className="sh-publish-action">
              {isPublishing && (
                <div className="sh-progress" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="sh-progress-track">
                    <div className="sh-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="sh-progress-value">{uploadProgress}%</span>
                </div>
              )}

              <button
                type="button"
                className="sh-publish-btn"
                onClick={broadcastNow}
                disabled={!canPublish}
              >
                {isPublishing ? <Loader2 className="sh-spinner" size={20} /> : <Send size={20} />}
                <span>{isPublishing ? 'Diffusion en cours…' : 'Lancer la diffusion'}</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* ---------- MESSAGE ---------- */}
      {notice && (
        <div
          className={`sh-toast ${notice.type === 'error' ? 'is-error' : 'is-success'}`}
          role={notice.type === 'error' ? 'alert' : 'status'}
        >
          {notice.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notice.text}</span>
          <button type="button" className="sh-toast-close" onClick={() => setNotice(null)} aria-label="Fermer le message">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}