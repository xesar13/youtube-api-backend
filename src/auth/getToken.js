const db = require('../database/database');

async function getToken(req, res, next) {
  const userId = req.user.id; // Asumiendo que el usuario está autenticado y su ID está en req.user

  const query = `SELECT accessToken, refreshToken FROM users WHERE id = ?`;
  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error al obtener el token de la base de datos:', err);
      return res.status(500).send('Error al obtener el token');
    }
    if (!row) {
      return res.status(404).send('Token no encontrado');
    }

    req.tokens = {
      accessToken: row.accessToken,
      refreshToken: row.refreshToken
    };
    next();
  });
}

module.exports = getToken;