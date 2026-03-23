import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Résolution du chemin du dossier courant (nécessaire avec ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Autoriser les requêtes cross-origin (ex : Scratch, navigateur externe)
app.use(cors());

// ─────────────────────────────────────────────
// PAGE D'ACCUEIL
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Serveur Actif</h1>
    <ul>
      <li><a href="/version.json">/version.json</a> — version et lien du projet</li>
      <li><b>/telecharger/nom.txt</b> — télécharger un fichier .txt</li>
    </ul>
  `);
});

// ─────────────────────────────────────────────
// FEATURE 1 : Informations de version
// GET /version.json
// ─────────────────────────────────────────────
app.get("/version.json", (req, res) => {
  res.json({
    version: process.env.VERSION || "1.0.0",
    url: process.env.PROJECT_URL || "https://scratch.mit.edu",
  });
});

// ─────────────────────────────────────────────
// FEATURE 2 : Téléchargement de fichiers .txt
// GET /telecharger/:nomFichier
// Les fichiers doivent être placés dans le dossier "./fichiers/"
// ─────────────────────────────────────────────
app.get("/telecharger/:nomFichier", (req, res) => {
  const nomFichier = req.params.nomFichier;

  // Sécurité : uniquement les fichiers .txt
  if (!nomFichier.endsWith(".txt")) {
    return res.status(400).send("❌ Erreur : seuls les fichiers .txt sont autorisés.");
  }

  const cheminComplet = path.join(__dirname, "fichiers", nomFichier);

  res.download(cheminComplet, nomFichier, (err) => {
    if (err) {
      console.error(`Fichier introuvable : ${nomFichier}`);
      res.status(404).send("❌ Le fichier demandé n'existe pas sur le serveur.");
    }
  });
});

// ─────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
