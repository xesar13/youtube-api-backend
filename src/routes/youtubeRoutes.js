const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { ensureAuthenticated } = require('../auth/ensureAuthenticated');

// Ruta para obtener videos de YouTube
router.get('/videos', ensureAuthenticated,youtubeController.getVideos.bind(youtubeController));

// Ruta para obtener videos suscribciones de YouTube
router.get('/suscribes', ensureAuthenticated, youtubeController.fetchVideoSuscribes.bind(youtubeController));

// Ruta para obtener videos suscribciones de YouTube
router.get('/allcategories', ensureAuthenticated,youtubeController.fetchVideosByCategoriesAll.bind(youtubeController));

// Ruta para obtener detalles de un video específico
router.get('/video/:id', ensureAuthenticated, youtubeController.getVideoById.bind(youtubeController));

// Ruta para buscar videos en YouTube
router.get('/search', ensureAuthenticated,youtubeController.searchVideos.bind(youtubeController));

// Ruta para obtener la URL de transmisión de un video de YouTube
router.get('/stream/:id', ensureAuthenticated, youtubeController.getStreamUrl.bind(youtubeController));

router.get('/proxy/:id', ensureAuthenticated, youtubeController.streamVideo.bind(youtubeController));

router.get('/live-direct',  ensureAuthenticated,youtubeController.liveDirect);
router.get('/video-direct', ensureAuthenticated, youtubeController.liveDirectVideo);
router.get('/livestream',  ensureAuthenticated,youtubeController.liveStream);
router.get('/getstream', ensureAuthenticated, youtubeController.getStream.bind(youtubeController));
router.get('/live-ffmpeg', ensureAuthenticated, youtubeController.livestreamFFmpeg);
router.get('/live-ffmpeghls', ensureAuthenticated, youtubeController.livestreamFFmpegHLS);

// Ruta para obtener el tipo de video
router.get('/videoType',  ensureAuthenticated, youtubeController.getVideoType);
router.get('/generatetoken',  ensureAuthenticated, youtubeController.generateToken);

// Ruta para obtener la información del canal del usuario autenticado
router.get('/mychannel', ensureAuthenticated, youtubeController.getMyChannel.bind(youtubeController));

// Nueva ruta para obtener el token de acceso
router.get('/token', ensureAuthenticated, youtubeController.getToken.bind(youtubeController));

module.exports = router;