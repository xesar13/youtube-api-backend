const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../database/database'); // Importar la configuración de la base de datos

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.YOUTUBE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // Guardar el perfil del usuario en la base de datos
    const userProfile = {
      id: profile.id,
      displayName: profile.displayName,
      emails: JSON.stringify(profile.emails),
      photos: JSON.stringify(profile.photos),
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    const query = `INSERT OR REPLACE INTO users (id, displayName, emails, photos, accessToken, refreshToken)
                   VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(query, [userProfile.id, userProfile.displayName, userProfile.emails, userProfile.photos, userProfile.accessToken, userProfile.refreshToken], (err) => {
      if (err) {
        console.error('Error al guardar el perfil del usuario en la base de datos:', err);
        return done(err);
      }
      console.log('Perfil del usuario guardado correctamente en la base de datos.');
      return done(null, profile);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error al leer el perfil del usuario de la base de datos:', err);
      return done(err);
    }
    if (!row) {
      return done(new Error('Usuario no encontrado'));
    }
    const user = {
      id: row.id,
      displayName: row.displayName,
      emails: JSON.parse(row.emails),
      photos: JSON.parse(row.photos),
      accessToken: row.accessToken,
      refreshToken: row.refreshToken
    };
    done(null, user);
  });
});

