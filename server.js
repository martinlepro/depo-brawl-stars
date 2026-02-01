const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();

// -------------------------
// CONFIG
// -------------------------

// CORS pour TurboWarp
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");
    next();
});

// Logs simples
app.use((req, res, next) => {
    console.log(`[LOG] ${req.method} ${req.url}`);
    next();
});

// -------------------------
// SERVEUR VIDEO
// -------------------------

const VIDEO_PATH = path.join(__dirname, "video", "ost_season_40_bs.mp4");

app.get("/video", (req, res) => {
    if (!fs.existsSync(VIDEO_PATH)) return res.status(404).send("Video missing");

    const range = req.headers.range;
    const videoSize = fs.statSync(VIDEO_PATH).size;

    // Pas de Range → envoie entier (TurboWarp)
    if (!range) {
        res.writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": videoSize
        });
        fs.createReadStream(VIDEO_PATH).pipe(res);
        return;
    }

    // Avec Range → streaming par chunks
    const CHUNK_SIZE = 1_000_000;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4"
    });

    fs.createReadStream(VIDEO_PATH, { start, end }).pipe(res);
});

// -------------------------
// SERVEUR IMAGES
// -------------------------

app.use("/img", express.static(path.join(__dirname, "img")));

// -------------------------
// ZIP TOUTES LES IMAGES DE /img/brawl_stars
// -------------------------

app.get("/brawl_stars", (req, res) => {
    const folder = path.join(__dirname, "img", "brawl_stars");

    if (!fs.existsSync(folder)) return res.status(404).send("brawl_stars folder missing");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=brawl_stars.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    archive.directory(folder, false);
    archive.finalize();
});

// -------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
