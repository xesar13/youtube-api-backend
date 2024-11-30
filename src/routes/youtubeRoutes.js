const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');

// Ruta para obtener videos de YouTube
router.get('/videos', youtubeController.getVideos.bind(youtubeController));

// Ruta para obtener detalles de un video específico
router.get('/videos/:id', youtubeController.getVideoById.bind(youtubeController));

// Ruta para buscar videos en YouTube
router.get('/search', youtubeController.searchVideos.bind(youtubeController));

// Ruta para obtener la URL de transmisión de un video de YouTube
router.get('/stream/:id', youtubeController.getStreamUrl.bind(youtubeController));

router.get('/proxy/:id', youtubeController.streamVideo.bind(youtubeController));

router.get('/live-direct', youtubeController.liveDirect);
router.get('/livestream', youtubeController.liveStream);
router.get('/getstream', youtubeController.getStream);
router.get('/live-ffmpeg', youtubeController.livestreamFFmpeg);
router.get('/live-ffmpeghls', youtubeController.livestreamFFmpegHLS);
// Ruta para obtener el tipo de video
router.get('/videoType', youtubeController.getVideoType);

module.exports = router;