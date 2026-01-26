import { useState } from 'react';
import axios from 'axios';
import { Send, Loader2, Facebook, Instagram, Zap, Share2, Film, CheckCircle2 } from 'lucide-react';
import './SocialHub.css';

// --- CONFIGURATION SIGNATURE MEDIA ---
const CLOUD_NAME = "djzarpmvq"; 
const UPLOAD_PRESET = "signature_preset"; 
const WEBHOOK_URL = "https://hook.eu1.make.com/8mlidrzi4zgdap4b957x3fnrq5k75vn5";

export default function SocialHub() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true,
    tiktok: false,
    snapchat: false
  });

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    file: "" 
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      const reader = new FileReader();
      reader.onloadend = () => setPostData({ ...postData, file: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const togglePlatform = (id: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const broadcastNow = async () => {
    const activePlatforms = Object.keys(platforms).filter(p => platforms[p as keyof typeof platforms]);
    
    if (!postData.file || !postData.content || activePlatforms.length === 0) {
      alert("⚠️ Vérifie que tu as un média, un message et au moins un réseau sélectionné !");
      return;
    }

    setIsPublishing(true);
    setUploadProgress(0);

    try {
      // --- ÉTAPE 1 : CLOUDINARY (Upload Unsigned) ---
      const formData = new FormData();
      formData.append('file', postData.file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        formData,
        {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }, // Important pour certains navigateurs
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 100) / (p.total || 100));
            setUploadProgress(Math.round(percent * 0.80)); // 80% pour l'upload
          }
        }
      );

      const mediaUrl = cloudRes.data.secure_url;
      console.log("🚀 Succès Cloudinary :", mediaUrl);

      // --- ÉTAPE 2 : MAKE.COM (Distribution) ---
      setUploadProgress(90);
      await axios.post(WEBHOOK_URL, { 
        title: postData.title,
        content: postData.content,
        file: mediaUrl, 
        mediaType, 
        targetPlatforms: activePlatforms 
      });

      setUploadProgress(100);
      setTimeout(() => {
        alert("✅ Signature Media : Diffusion lancée avec succès !");
      }, 500);
      
    } catch (err: any) {
      console.error("Détails de l'erreur :", err.response?.data || err.message);
      alert(`❌ Échec : ${err.response?.data?.error?.message || "Vérifie ta connexion ou le preset Cloudinary"}`);
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setIsPublishing(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="social-hub-page">
      <header className="admin-header-gold">
        <div className="header-seal-small"><Zap size={20} /></div>
        <span className="admin-badge">Signature Media Command</span>
        <h1 className="admin-main-title">Broadcaster Pro</h1>
        <div className="header-double-line-gold"></div>
      </header>

      <div className="hub-container">
        <div className="hub-editor">
          <div className="hub-card">
            <label className="input-label-gold">Média (Image ou Vidéo 9:16)</label>
            <div className="hub-media-dropzone" onClick={() => document.getElementById('file-up')?.click()}>
              {postData.file ? (
                mediaType === 'video' ? (
                  <video src={postData.file} className="media-preview" controls />
                ) : (
                  <img src={postData.file} alt="Preview" className="media-preview" />
                )
              ) : (
                <div className="upload-placeholder">
                  <Film size={40} />
                  <span>Glissez ou cliquez pour charger</span>
                </div>
              )}
              <input type="file" id="file-up" hidden onChange={handleFileUpload} accept="image/*,video/*" />
            </div>

            <div className="input-group">
              <label className="input-label-gold">Titre interne</label>
              <input 
                type="text" className="admin-input-terracotta"
                placeholder="Ex: Arrivage Langoustes"
                value={postData.title}
                onChange={(e) => setPostData({...postData, title: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label className="input-label-gold">Légende des posts</label>
              <textarea 
                className="admin-input-terracotta" rows={4}
                placeholder="Le texte qui sera publié..."
                value={postData.content}
                onChange={(e) => setPostData({...postData, content: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="hub-sidebar">
          <div className="hub-card">
            <h3 className="section-title">Canaux de diffusion</h3>
            <div className="platform-selector">
              {Object.entries(platforms).map(([id, active]) => (
                <div 
                  key={id} 
                  className={`platform-item ${active ? 'active' : ''}`}
                  onClick={() => togglePlatform(id as keyof typeof platforms)}
                >
                  <div className="platform-info">
                    {id === 'facebook' && <Facebook size={18} />}
                    {id === 'instagram' && <Instagram size={18} />}
                    {id === 'tiktok' && <Zap size={18} />}
                    {id === 'snapchat' && <Share2 size={18} />}
                    <span className="capitalize">{id}</span>
                  </div>
                  {active && <CheckCircle2 size={18} className="check-gold" />}
                </div>
              ))}
            </div>

            <div className="broadcast-zone">
              <p className="warning-text">
                {mediaType === 'image' && platforms.tiktok && "⚠️ TikTok sera ignoré (vidéo requise)."}
              </p>

              {isPublishing && (
                <div className="progress-wrapper">
                  <div className="progress-container">
                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span className="progress-status">{uploadProgress}%</span>
                </div>
              )}

              <button 
                className={`broadcast-btn ${isPublishing ? 'loading' : ''}`}
                onClick={broadcastNow}
                disabled={isPublishing}
              >
                {isPublishing ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
                <span>{isPublishing ? "TRANSMISSION..." : "PUBLIER MAINTENANT"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}