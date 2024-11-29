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
  
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});