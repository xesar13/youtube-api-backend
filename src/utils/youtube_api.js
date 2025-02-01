const express = require("express");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const open = require("open");

const app = express();
const PORT = 3000;

// Rutas de archivos
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

async function authenticate() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
        return oAuth2Client;
    }
    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/youtube.readonly"],
    });
    
    console.log("Autoriza la aplicación visitando esta URL:", authUrl);
    await open(authUrl);
    
    return new Promise((resolve) => {
        const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        
        readline.question("Introduce el código de autorización: ", async (code) => {
            readline.close();
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log("Token almacenado correctamente.");
            resolve(oAuth2Client);
        });
    });
}

async function listVideos(auth) {
    const youtube = google.youtube({ version: "v3", auth });
    const response = await youtube.videos.list({
        part: "snippet,contentDetails,statistics",
        chart: "mostPopular",
        maxResults: 5,
        regionCode: "US"
    });
    return response.data.items;
}

async function listChannels(auth, channelId) {
    const youtube = google.youtube({ version: "v3", auth });
    const response = await youtube.channels.list({
        part: "snippet,statistics",
        id: channelId,
    });
    return response.data.items[0];
}

async function searchVideos(auth, query) {
    const youtube = google.youtube({ version: "v3", auth });
    const response = await youtube.search.list({
        part: "snippet",
        q: query,
        maxResults: 5,
        type: "video",
    });
    return response.data.items;
}

app.get("/videos", async (req, res) => {
    try {
        const auth = await authenticate();
        const videos = await listVideos(auth);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/channels/:id", async (req, res) => {
    try {
        const auth = await authenticate();
        const channel = await listChannels(auth, req.params.id);
        res.json(channel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/search", async (req, res) => {
    try {
        const auth = await authenticate();
        const results = await searchVideos(auth, req.query.q);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
