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


module.exports = router;