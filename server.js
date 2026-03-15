import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Configuration pour récupérer le chemin du dossier actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser Scratch à communiquer avec le serveur (CORS)
app.use(cors());

// --- FEATURE 1 : Gestion des versions ---
app.get("/version.json", (req, res) => {
  res.json({
    version: process.env.VERSION || "1.0.0",
    url: process.env.PROJECT_URL || "https://scratch.mit.edu"
  });
});

// --- FEATURE 2 : Téléchargement de fichiers .txt ---
// Exemple d'utilisation : https://ton-url.com/telecharger/monfichier.txt
app.get("/telecharger/:nomFichier", (req, res) => {
  const nomFichier = req.params.nomFichier;

  // Sécurité : n'autoriser que les fichiers .txt
  if (!nomFichier.endsWith(".txt")) {
    return res.status(400).send("Erreur : Seuls les fichiers .txt sont autorisés.");
  }

  // Chemin vers le dossier "fichiers"
  const cheminComplet = path.join(__dirname, "fichiers", nomFichier);

  res.download(cheminComplet, nomFichier, (err) => {
    if (err) {
      console.error("Fichier non trouvé :", nomFichier);
      res.status(404).send("Le fichier demandé n'existe pas sur le serveur.");
    }
  });
});

// Page d'accueil par défaut
app.get("/", (req, res) => {
  res.send("<h1>✅ Serveur Actif</h1><p>Utilisez <b>/version.json</b> pour la version ou <b>/telecharger/nom.txt</b> pour les fichiers.</p>");
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
