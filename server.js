const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// -------- CONFIG DES DOSSIERS -------- //
const VIDEO_DIR = path.join(__dirname, 'video');
const IMG_DIR = path.join(__dirname, 'img');

// -------- MIDDLEWARE CORS -------- //
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// -------- SERVEUR D’IMAGES -------- //
// Exemple : /img/brawl_stars/shop.png
app.get('/img/*', (req, res) => {
  const filePath = path.join(IMG_DIR, req.params[0]);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Image not found");
  }

  res.sendFile(filePath);
});

// -------- SERVEUR DE VIDÉOS (STREAMING) -------- //
// Exemple : /video/brawl_stars/ost_season_40_bs.mp4
app.get('/video/*', (req, res) => {
  const filePath = path.join(VIDEO_DIR, req.params[0]);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Video not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    return res.status(400).send("Requires Range header");
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  const chunkSize = end - start + 1;
  const file = fs.createReadStream(filePath, { start, end });

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4"
  });

  file.pipe(res);
});

// -------- ROUTE PRINCIPALE -------- //
app.get('/', (req, res) => {
  res.send("Server OK - vidéos & images disponibles ✔");
});

// -------- DÉMARRAGE -------- //
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
