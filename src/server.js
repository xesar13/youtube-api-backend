const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const ytdl = require('ytdl-core');
const path = require('path');

require('dotenv').config();
require('./auth/auth'); // Importar la configuración de autenticación
const youTubeRoutes = require('./routes/youtubeRoutes');
//const youtubeAuth = require('./auth/jsongenerate');
const app = express();
const PORT = process.env.PORT || 8011;
// Configuración de CORS
const corsOptions = {
  origin: '*',  // O puedes especificar tu dominio, ej. 'http://example.com'
  methods: ['GET', 'POST', 'OPTIONS'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // Usar el middleware cors con las opciones configuradas
// Asegúrate de responder a las solicitudes OPTIONS
app.use(bodyParser.json());
// Configurar la sesión
app.use(session({
  secret: process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', youTubeRoutes);

// Servir archivos estáticos (como el index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
      res.redirect('https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=https://youtube-api.inydqs.easypanel.host');
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