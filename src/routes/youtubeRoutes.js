const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const getToken = require('../auth/getToken');
const {authenticate,ensureAuthenticated} = require('../auth/ensureAuthenticated'); // Importar la función de autenticación

// Ruta para obtener videos de YouTube
//router.get('/videos', ensureAuthenticated,getToken,youtubeController.getVideos.bind(youtubeController));

// Ruta para obtener videos suscribciones de YouTube
router.get('/suscribes', ensureAuthenticated, getToken,youtubeController.fetchVideoSuscribes.bind(youtubeController));

// Ruta para obtener videos suscribciones de YouTube
router.get('/allcategories', ensureAuthenticated,getToken,youtubeController.fetchVideosByCategoriesAll.bind(youtubeController));

// Ruta para obtener detalles de un video específico
router.get('/video/:id', ensureAuthenticated, getToken,youtubeController.getVideoById.bind(youtubeController));

// Ruta para buscar videos en YouTube
//router.get('/search', ensureAuthenticated,getToken,youtubeController.searchVideos.bind(youtubeController));

// Ruta para obtener la URL de transmisión de un video de YouTube
router.get('/stream/:id', ensureAuthenticated, getToken,youtubeController.getStreamUrl.bind(youtubeController));

router.get('/proxy/:id', ensureAuthenticated, getToken,youtubeController.streamVideo.bind(youtubeController));

router.get('/live-direct',  ensureAuthenticated,getToken,youtubeController.liveDirect);
router.get('/video-direct', ensureAuthenticated,getToken, youtubeController.liveDirectVideo);
router.get('/livestream',  ensureAuthenticated,getToken,youtubeController.liveStream);
router.get('/getstream', ensureAuthenticated,getToken, youtubeController.getStream.bind(youtubeController));
router.get('/live-ffmpeg', ensureAuthenticated, getToken,youtubeController.livestreamFFmpeg);
router.get('/live-ffmpeghls', ensureAuthenticated, getToken,youtubeController.livestreamFFmpegHLS);

// Ruta para obtener el tipo de video
router.get('/videoType',  ensureAuthenticated,getToken, youtubeController.getVideoType);
router.get('/generatetoken',  ensureAuthenticated, getToken,youtubeController.generateToken);

// Ruta para obtener la información del canal del usuario autenticado
router.get('/mychannel', ensureAuthenticated, getToken,youtubeController.getMyChannel.bind(youtubeController));

// Nueva ruta para obtener el token de acceso
router.get('/token', ensureAuthenticated, getToken,youtubeController.getToken.bind(youtubeController));

// Ruta para obtener videos de YouTube
router.get('/videos', async (req, res) => {
    try {
        const auth = await authenticate();
        const videos = await youtubeController.listVideos(auth);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  // Ruta para obtener detalles de un canal específico
  router.get('/channels/:id',async (req, res) => {
    try {
        const auth = await authenticate();
        const channel = await youtubeController.listChannels(auth, req.params.id);
        res.json(channel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  // Ruta para buscar videos en YouTube
  router.get('/search', async (req, res) => {
    try {
        const auth = await authenticate();
        const results = await youtubeController.searchVideos(auth, req.query.q);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

module.exports = router;