const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');
const ytstream = require('yt-stream');

const axios = require('axios');
require('dotenv').config();
require('./auth/auth'); // Asegúrate de que este archivo exista y esté configurado correctamente

const youTubeRoutes = require('./routes/youtubeRoutes');

const app = express();
const PORT = process.env.PORT || 8011;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';

app.use(cors()); // Use the cors middleware with your options
app.use(bodyParser.json());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', youTubeRoutes);

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

app.get('/livestream/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
  
    try {
      // Obtener información del video
    const info = await ytdl.getInfo(videoId);
    const videoTitle = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_');

    const formats720p = ytdl.filterFormats(info.formats, (format) => {
        return format.qualityLabel === '720p' && format.hasVideo && format.mimeType.includes('video/mp4');
      });

      const formats = formats720p[0];

           // Validar el ID del video
        const isValid = ytdl.validateID(videoId);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid video ID' });
        }

      // Verificar si es un livestream
      const isLive = info.videoDetails.isLiveContent || info.formats.some(format =>
        format.mimeType.includes('video/ts')
      );
  

      if (!isLive) {
        try {
        ytstream.setGlobalHeaders({
            'Content-Disposition': 'inline',
            'Content-Type': formats.mimeType || 'video/mp4'
        });
        const stream = await ytstream.stream(`https://www.youtube.com/watch?v=`+ videoId, {
            quality: 'high',
            type: 'video',
            highWaterMark: 1048576 * 32,
            download: true
        });
        stream.stream.pipe(res);
        return;
        }catch(error){
            return res.status(500).send('Error streaming the Live video');
        }

    }
  
      const hlsFormat = info.formats.find(format => format.isHLS);
      if (hlsFormat) {
          const stream = ytdl(videoId, { format: 'best' });
          res.setHeader('Content-Type', 'video/ts');
          res.setHeader('Transfer-Encoding', 'chunked'); // Para enviar el archivo en partes
          // Manejar errores del stream
          stream.on('error', (error) => {
            console.error('Error in HLS stream:', error);
            if (!res.headersSent) {
               return res.status(500).send('Error streaming the HLS video');
            }
         });
          // Hacer el pipe del HLS al cliente
           return stream.pipe(res);




      }else{
        return res.status(400).send('No se encontró un formato HLS para este livestream.');
      }
        
        
      
  
    } catch (error) {
      console.error('Error al procesar el livestream:', error.message);
      res.status(500).send('Error al procesar la solicitud.');
    }
  });

  async function downloadVideo(url, videoFormat, videoPath) {
    try {
        if (!videoFormat) {
          reject(new Error("No suitable format found."))
          return
        }
  
        ytdl(url, { format: videoFormat }).pipe(fs.createWriteStream(videoPath))
    } catch (error) {
      throw new Error("Error downloading video: " + error.message)
    }
  }
  
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});