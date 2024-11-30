const express = require('express');
const youtubeService = require('../services/youtubeService');
const ytdl = require('ytdl-core');
class M3UController {
    async getVideos(req, res) {
        try {
            const videos = await youtubeService.fetchVideos();
            res.json(videos);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
    
  async getVideoById(req, res) {
    try {
        const videoId = req.params.id;
        const video = await youtubeService.fetchVideoById(videoId);
        res.json(video);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }


    async searchVideos(req, res) {
        try {
            const query = req.query.q;
            const videos = await youtubeService.searchVideos(query);
            res.json(videos);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async getStreamUrl(req, res) {
        try {
            const videoId = req.params.id;
            const streamUrl = await youtubeService.getStreamUrl(videoId);
            res.json({ url: streamUrl });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

   async streamVideo (req, res)  {
        try {
            const videoId = req.params.id;
            console.log(`Fetching video with ID: ${videoId}`);
            
            // Obtener información del video
            const info = await youtubeService.getVideoInfo(videoId);
    
            // Obtener el formato del video
            const format = youtubeService.getVideoFormat(info);
    
            // Transmitir el video
            //youtubeService.streamVideo(videoId, format, res);
            const stream = ytdl(videoId, { format: format });
            stream.pipe(res);
    
        } catch (error) {
            console.error('Error streaming video:', error);
            if (error.message === 'Invalid video ID') {
                return res.status(400).json({ error: 'Invalid video ID' });
            }
            if (error.message === 'No suitable formats found.') {
                return res.status(404).send('No suitable formats found.');
            }
            if (error.statusCode === 403) {
                return res.status(403).send('Access to the video is forbidden.');
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async livestream (req, res) {
        let url = req.query.url;
        let quality = req.query.quality || '720p';

        if (!url) {
            return res.status(400).send('URL is required');
        }
        if (youtubeService.validateUrl(url)) {
           url = youtubeService.extractYouTubeId(url);
        }
        try {
            // Obtener información del video
            const info = await youtubeService.getVideoInfo(url);
            // Obtener el formato del video
            const format = youtubeService.getVideoFormat(info);
             // Verificar si es un livestream
             youtubeService.streamVideo(url, res);
             return;
 
            /*const isLive = info.videoDetails.isLiveContent || info.formats.some(format =>
            format.mimeType.includes('video/ts')
          );*/
            //if (isLive || format.isHLS) {
               // youtubeService.streamVideoLive(url, format, res);
              // youtubeService.streamVideo(url, format,info, res);

             //   return;
            /*}else{
                youtubeService.streamVideo(url, format,info, res);
                return;
            }*/

        } catch (error) {
            console.error('Error streaming video:', error);
            if (error.message === 'Invalid video URL') {
                return res.status(400).json({ error: 'Invalid video URL' });
            }
            if (error.message === 'No suitable formats found.') {
                return res.status(404).send('No suitable formats found.');
            }
            if (error.statusCode === 403) {
                return res.status(403).send('Access to the video is forbidden.');
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };

    async livestreamFFmpeg (req, res) {
        let url = req.query.url;
        let quality = req.query.quality || '720p';

        if (!url) {
            return res.status(400).send('URL is required');
        }
        if (youtubeService.validateUrl(url)) {
           url = youtubeService.extractYouTubeId(url);
        }
        try {
            // Obtener información del video
            const info = await youtubeService.getVideoInfo(url);
            // Obtener el formato del video
            const format = youtubeService.getVideoFormat(info);
             // Verificar si es un livestream
             youtubeService.streamVideoFFmpeg(url, res);

             
 
            /*const isLive = info.videoDetails.isLiveContent || info.formats.some(format =>
            format.mimeType.includes('video/ts')
          );*/
            //if (isLive || format.isHLS) {
               // youtubeService.streamVideoLive(url, format, res);
              // youtubeService.streamVideo(url, format,info, res);

             //   return;
            /*}else{
                youtubeService.streamVideo(url, format,info, res);
                return;
            }*/

        } catch (error) {
            console.error('Error streaming video:', error);
            if (error.message === 'Invalid video URL') {
                return res.status(400).json({ error: 'Invalid video URL' });
            }
            if (error.message === 'No suitable formats found.') {
                return res.status(404).send('No suitable formats found.');
            }
            if (error.statusCode === 403) {
                return res.status(403).send('Access to the video is forbidden.');
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };

    async livestreamFFmpegHLS (req, res) {
        let url = req.query.url;
        let quality = req.query.quality || '720p';

        if (!url) {
            return res.status(400).send('URL is required');
        }
        if (youtubeService.validateUrl(url)) {
           url = youtubeService.extractYouTubeId(url);
        }
        try {
            // Obtener información del video
            const info = await youtubeService.getVideoInfo(url);
            // Obtener el formato del video
            const format = youtubeService.getVideoFormat(info);
             // Verificar si es un livestream
             youtubeService.streamVideoFFmpegHLS(url, res);


        } catch (error) {
            console.error('Error streaming video:', error);
            if (error.message === 'Invalid video URL') {
                return res.status(400).json({ error: 'Invalid video URL' });
            }
            if (error.message === 'No suitable formats found.') {
                return res.status(404).send('No suitable formats found.');
            }
            if (error.statusCode === 403) {
                return res.status(403).send('Access to the video is forbidden.');
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };

    async getVideoType (req, res) {
        let url = req.query.url;
        if (!url) {
            return res.status(400).send('URL is required');
        }
    
        try {
        
    
            // Obtener información del video
            const info = await youtubeService.getVideoInfo(url);
    
            // Verificar si es un livestream
            const isLive = info.videoDetails.isLiveContent;
    
            // Obtener el formato del video
            const format = isLive ? 'video/ts' : 'video/mp4';
    
            res.json({ format });
    
        } catch (error) {
            console.error('Error getting video type:', error);
            if (error.message === 'Invalid video URL') {
                return res.status(400).json({ error: 'Invalid video URL' });
            }
            if (error.message === 'No suitable formats found.') {
                return res.status(404).send('No suitable formats found.');
            }
            if (error.statusCode === 403) {
                return res.status(403).send('Access to the video is forbidden.');
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };

}


module.exports = new M3UController();