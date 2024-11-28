const express = require('express');
const bodyParser = require('body-parser');
const youTubeRoutes = require('./routes/youtubeRoutes');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const ytdl = require('ytdl-core');
require('./auth/auth'); // Asegúrate de que este archivo exista y esté configurado correctamente

const app = express();
const PORT = process.env.PORT || 8011;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';


app.use(cors()); // Use the cors middleware with your optionsapp.use(bodyParser.json());
app.use('/api', youTubeRoutes);
app.use(bodyParser.json());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Ruta de autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })//scope: ['https://www.googleapis.com/auth/youtube'] })
  );
  
  // Ruta de callback de Google
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // Successful authentication, redirect home.
      res.redirect('/');
    }
  );
  
  // Ruta para cerrar sesión
  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  
  // Ruta protegida
  app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('No autorizado');
    }
    res.send(`Hola, ${req.user.displayName}`);
  });

// Proxy route to serve YouTube video streams
app.get('/proxy/:id', async (req, res) => {
    try {
        const videoId = req.params.id;
        console.log(`Fetching video with ID: ${videoId}`);
        const stream = ytdl(videoId, { quality: 'highest' });

        stream.on('info', (info) => {
            console.log(`Video title: ${info.videoDetails.title}`);
        });

        stream.on('response', (response) => {
            console.log(`Response status: ${response.statusCode}`);
            res.setHeader('Content-Type', 'video/mp4');
            response.pipe(res);
        });

        stream.on('error', (error) => {
            console.error(`Stream error: ${error.message}`);
            res.status(500).send(error.message);
        });

        stream.on('end', () => {
            console.log('Stream ended');
        });

    } catch (error) {
        console.error(`Error fetching video: ${error.message}`);
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});