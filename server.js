import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  if (!fichier.endsWith(".txt")) {
    return res.status(400).send("Erreur : Seuls les fichiers .txt sont autorisés.");
  }

  const cheminFichier = path.join(__dirname, "fichiers", fichier);

  res.download(cheminFichier, fichier, (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement :", err);
      res.status(404).send("Fichier introuvable.");
    }
  });
});

// ✅ AJOUT : Téléchargement depuis le dossier /txt
app.get("/txt/:nomFichier", (req, res) => {
  const fichier = req.params.nomFichier;
  const cheminFichier = path.join(__dirname, "txt", fichier);

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

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
