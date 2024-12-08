const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');
const ytstream = require('yt-stream');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { authenticateJWT } = require('./auth/jsongenerate'); // Importa la función de middleware
const axios = require('axios');
require('dotenv').config();
require('./auth/auth'); // Importar la configuración de autenticación
const youTubeRoutes = require('./routes/youtubeRoutes');
const youtubeAuth = require('./auth/jsongenerate');
const youtubeService = require('./services/youtubeService');  // Importa el servicio de YouTube
const app = express();
const PORT = process.env.PORT || 8011;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';
// Configuración de CORS
const corsOptions = {
  origin: '*',  // O puedes especificar tu dominio, ej. 'http://example.com'
  methods: ['GET', 'POST', 'OPTIONS'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // Usar el middleware cors con las opciones configuradas
// Asegúrate de responder a las solicitudes OPTIONS
app.use(bodyParser.json());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', youTubeRoutes);

// Servir archivos estáticos (como el index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/proxy', async (req, res) => {
  const videoId = req.query.id;

  let videoUrl = '';
  let audioUrl = '';
  if (!videoId) {
      return res.status(400).send('No video ID provided');
  }

  try {
      // Obtén la URL directa del video y audio usando yt-dlp
      //const ytDlpVideo = spawn('yt-dlp', ['-f', 'bv*+ba', '-g', `https://www.youtube.com/watch?v=${videoId}`]);
       videoUrl = await youtubeService.getStreamUrl(videoId,'137');
       audioUrl = await youtubeService.getStreamUrl(videoId,'140');

      ytDlpVideo.stdout.on('data', (data) => {
          const urls = data.toString().split('\n').filter(Boolean);
          [videoUrl, audioUrl] = urls;
      });

      ytDlpVideo.on('close', async () => {
          if (!videoUrl || !audioUrl) {
              return res.status(500).send('Failed to retrieve video/audio URLs');
          }

          // Proxy de video
          const range = req.headers.range;
          if (!range) {
              return res.status(400).send('Requires Range header');
          }

          const [start, end] = range.replace(/bytes=/, '').split('-');
          const videoResponse = await axios.get(videoUrl, {
              headers: {
                  Range: `bytes=${start}-${end}`,
              },
              responseType: 'stream',
          });

          res.writeHead(206, {
              'Content-Range': videoResponse.headers['content-range'],
              'Accept-Ranges': 'bytes',
              'Content-Length': videoResponse.headers['content-length'],
              'Content-Type': 'video/mp4',
          });

          videoResponse.data.pipe(res);
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching video data');
  }
});


// Ruta de autenticación con Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback de Google
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  }
);

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir la sesión:', err);
        return res.status(500).send('Error al cerrar sesión');
      }
      // Redirigir a la página de cierre de sesión de Google
      res.redirect('https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=https://xtremtv.ddns.net');
    });
  });
});

// Ruta protegida
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('No autorizado');
  }
  res.send(`Hola, ${req.user.displayName}`);
});
  
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});