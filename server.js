const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const VIDEO_PATH = path.join(__dirname, "video", "ost_season_40_bs.mp4");

app.get("/video", (req, res) => {
    const range = req.headers.range;
    const videoSize = fs.statSync(VIDEO_PATH).size;

    // --- CAS 1 : le header Range est absent (ex: Scratch/Turbowarp) ---
    if (!range) {
        res.writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": videoSize
        });
        fs.createReadStream(VIDEO_PATH).pipe(res);
        return;
    }

    // --- CAS 2 : le header Range existe (navigateur normal) ---
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    });

    fs.createReadStream(VIDEO_PATH, { start, end }).pipe(res);
});

// Render utilise automatiquement PORT
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
