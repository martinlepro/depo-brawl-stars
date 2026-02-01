const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

// Page d'accueil (optionnelle)
app.get("/", (req, res) => {
    res.send(`
        <h1>Serveur vidéo streamé</h1>
        <video controls autoplay width="640">
            <source src="/video" type="video/mp4">
        </video>
    `);
});

// Streaming en chunks
app.get("/video", (req, res) => {
    const videoPath = path.join(__dirname, "Background.mp4");
    const videoSize = fs.statSync(videoPath).size;

    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
        return;
    }

    const chunkSize = 1_000_000; // 1MB chunk
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, videoSize - 1);

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
});

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
