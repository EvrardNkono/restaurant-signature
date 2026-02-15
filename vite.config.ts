import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Utilise './' pour que les chemins soient relatifs. 
  // Cela évite que Surge ne confonde les scripts JS avec ton fichier HTML.
  base: './', 
  build: {
    // S'assure que le dossier de sortie est bien "dist"
    outDir: 'dist',
    // Optionnel : vide le dossier avant de reconstruire pour éviter les vieux fichiers
    emptyOutDir: true,
  }
})