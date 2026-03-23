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

// ✅ Images : /img/:dossier/:nomFichier
app.get("/img/:dossier/:nomFichier", (req, res) => {
  const { dossier, nomFichier } = req.params;
  const cheminFichier = path.join(__dirname, "img", dossier, nomFichier);

  res.sendFile(cheminFichier, (err) => {
    if (err) {
      console.error("Erreur image :", err);
      res.status(404).send("Image introuvable.");
    }
  });
});

// ✅ Vidéos : /video/:dossier/:nomFichier
app.get("/video/:dossier/:nomFichier", (req, res) => {
  const { dossier, nomFichier } = req.params;
  const cheminFichier = path.join(__dirname, "video", dossier, nomFichier);

  res.sendFile(cheminFichier, (err) => {
    if (err) {
      console.error("Erreur vidéo :", err);
      res.status(404).send("Vidéo introuvable.");
    }
  });
});

// ✅ Textes : /txt/:dossier/:nomFichier
app.get("/txt/:dossier/:nomFichier", (req, res) => {
  const { dossier, nomFichier } = req.params;
  const cheminFichier = path.join(__dirname, "txt", dossier, nomFichier);

  res.download(cheminFichier, nomFichier, (err) => {
    if (err) {
      console.error("Erreur texte :", err);
      res.status(404).send("Fichier texte introuvable.");
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
```

**Structure de dossiers attendue sur GitHub :**
```
mon-projet/
├── server.js
├── package.json
├── img/
│   └── brawl_stars/
│       └── image.png
├── video/
│   └── brawl_stars/
│       └── troncon_1.mp4
└── txt/
    └── brawl_stars/
        └── monfichier.txt
