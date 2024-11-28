const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://xtremtv.ddns.net/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Guardar el perfil del usuario en un archivo local
    const userProfile = {
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails,
      photos: profile.photos
    };

    const filePath = path.join(__dirname, `../../data/series/userProfile.json`);
    fs.writeFileSync(filePath, JSON.stringify(userProfile, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar el perfil del usuario:', err);
        return done(err);
      }
      console.log('Perfil del usuario guardado correctamente.');
      return done(null, profile);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
    const filePath = path.join(__dirname, '../../data/series/userProfile.json');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error al leer el perfil del usuario:', err);
        return done(err);
      }
      const user = JSON.parse(data);
      if (user.id === id) {
        done(null, user);
      } else {
        done(new Error('Usuario no encontrado'));
      }
    });
  });