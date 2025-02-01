const path = require("path");
const fs = require("fs");
const { google } = require('googleapis');
const axios = require("axios");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}

// Rutas de archivos
const TOKEN_PATH = path.join(__dirname, "token.json");

async function getCredentials() {
    const credentialsUrl = process.env.CREDENTIALS_URL; // Leer la URL desde las variables de entorno

    if (!credentialsUrl) {
        throw new Error("CREDENTIALS_URL no está definida en el entorno.");
    }

    const response = await axios.get(credentialsUrl);
    return response.data;
}

async function authenticate() {
    const credentials = await getCredentials();
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8")));
        return oAuth2Client;
    }

    return oAuth2Client;
}

/*async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
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
    // Importar dinámicamente el módulo `open`
    const open = await import("open");
    await open.default(authUrl);
  
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
}*/

module.exports = { ensureAuthenticated,authenticate,TOKEN_PATH };