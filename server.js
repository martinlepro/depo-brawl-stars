const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// -------- CONFIG DES DOSSIERS -------- //
const VIDEO_DIR   = path.join(__dirname, 'video');
const IMG_DIR     = path.join(__dirname, 'img');
const TXT_DIR     = path.join(__dirname, 'txt');
const MUSIQUE_DIR = path.join(__dirname, 'musique');

// -------- MIDDLEWARE CORS -------- //
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// -------- SERVEUR D'IMAGES -------- //
// Exemple : /img/brawl_stars/shop.png
app.get('/img/*', (req, res) => {
  const filePath = path.join(IMG_DIR, req.params[0]);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Image not found");
  }

  res.sendFile(filePath);
});

// -------- SERVEUR DE VIDÉOS (STREAMING PAR CHUNKS) -------- //
// Exemple : /video/brawl_stars/ost_season_40_bs.mp4
app.get('/video/*', (req, res) => {
  const filePath = path.join(VIDEO_DIR, req.params[0]);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Video not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Taille des chunks : 1 MB
  const CHUNK_SIZE = 1 * 1024 * 1024;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    });

    file.pipe(res);

  } else {
    const end = Math.min(CHUNK_SIZE - 1, fileSize - 1);
    const file = fs.createReadStream(filePath, { start: 0, end });

    res.writeHead(206, {
      "Content-Range": `bytes 0-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end + 1,
      "Content-Type": "video/mp4"
    });

    file.pipe(res);
  }
});

// -------- SERVEUR DE MUSIQUE (STREAMING AUDIO) -------- //
// Exemple : /musique/track.mp3 ou /musique/son.ogg
const AUDIO_MIME_TYPES = {
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
  '.aac':  'audio/aac',
  '.flac': 'audio/flac',
  '.m4a':  'audio/mp4',
  '.opus': 'audio/opus',
  '.webm': 'audio/webm',
};

app.get('/musique/*', (req, res) => {
  const filePath = path.join(MUSIQUE_DIR, req.params[0]);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Audio file not found");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = AUDIO_MIME_TYPES[ext];

  if (!contentType) {
    return res.status(415).send("Unsupported audio format");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType
    });

    file.pipe(res);

  } else {
    const end = Math.min(CHUNK_SIZE - 1, fileSize - 1);
    const file = fs.createReadStream(filePath, { start: 0, end });

    res.writeHead(206, {
      "Content-Range": `bytes 0-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end + 1,
      "Content-Type": contentType
    });

    file.pipe(res);
  }
});

// -------- SERVEUR DE FICHIERS TXT (TÉLÉCHARGEMENT) -------- //
// Exemple : /txt/mon_fichier.txt
app.get('/txt/*', (req, res) => {
  const filePath = path.join(TXT_DIR, req.params[0]);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath);
});

// -------- ROUTE PRINCIPALE -------- //
app.get('/', (req, res) => {
  res.send("Server OK - vidéos, images, musique & fichiers disponibles ✔");
});

// -------- DÉMARRAGE -------- //
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
