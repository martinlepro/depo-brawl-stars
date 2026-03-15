import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Permet de retrouver le chemin du dossier actuel (nécessaire avec "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Endpoint principal : version + lien
app.get("/version.json", (req, res) => {
  res.json({
    version: process.env.VERSION || "inconnu",
    url: process.env.PROJECT_URL || null
  });
});

// NOUVEAU : Endpoint pour télécharger des fichiers .txt
app.get("/telecharger/:nomFichier", (req, res) => {
  const fichier = req.params.nomFichier;

  // Sécurité : on s'assure que l'utilisateur demande bien un fichier texte
  if (!fichier.endsWith(".txt")) {
    return res.status(400).send("Erreur : Seuls les fichiers .txt sont autorisés.");
  }

  // Chemin vers le dossier "fichiers" qui contiendra tes .txt
  const cheminFichier = path.join(__dirname, "fichiers", fichier);

  // Force le téléchargement
  res.download(cheminFichier, fichier, (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement :", err);
      res.status(404).send("Fichier introuvable.");
    }
  });
});

// Endpoint de test
app.get("/", (req, res) => {
  res.send("✅ Serveur actif - consultez /version.json pour voir la version et le lien");
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
