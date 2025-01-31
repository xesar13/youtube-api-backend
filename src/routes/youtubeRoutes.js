const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { ensureAuthenticated } = require('../auth/ensureAuthenticated');

// Ruta para obtener videos de YouTube
router.get('/videos', ensureAuthenticated, youtubeController.getVideos.bind(youtubeController));

// Ruta para obtener videos suscribciones de YouTube
router.get('/suscribes',  youtubeController.fetchVideoSuscribes.bind(youtubeController));

// Ruta para obtener videos suscribciones de YouTube
router.get('/allcategories', youtubeController.fetchVideosByCategoriesAll.bind(youtubeController));

// Ruta para obtener detalles de un video específico
router.get('/video/:id',  youtubeController.getVideoById.bind(youtubeController));

// Ruta para buscar videos en YouTube
router.get('/search', youtubeController.searchVideos.bind(youtubeController));

// Ruta para obtener la URL de transmisión de un video de YouTube
router.get('/stream/:id',  youtubeController.getStreamUrl.bind(youtubeController));

router.get('/proxy/:id',  youtubeController.streamVideo.bind(youtubeController));

router.get('/live-direct',  youtubeController.liveDirect);
router.get('/video-direct',  youtubeController.liveDirectVideo);
router.get('/livestream',  youtubeController.liveStream);
router.get('/getstream',  youtubeController.getStream.bind(youtubeController));
router.get('/live-ffmpeg',  youtubeController.livestreamFFmpeg);
router.get('/live-ffmpeghls',  youtubeController.livestreamFFmpegHLS);

// Ruta para obtener el tipo de video
router.get('/videoType',  youtubeController.getVideoType);
router.get('/generatetoken',  youtubeController.generateToken);

module.exports = router;