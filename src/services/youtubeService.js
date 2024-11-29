const axios = require('axios');
require('dotenv').config();
const ytdl = require('ytdl-core');
const ytstream = require('yt-stream');
class M3UService {
    constructor() {
        if (!M3UService.instance) {
            M3UService.instance = this;
        }
        return M3UService.instance;
    }

    validateUrl (url) {
        const urlPattern = /^(https?:\/\/)/;
        return urlPattern.test(url);
    }

    async fetchVideos() {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&key=${apiKey}`;
      
        const response = await axios.get(url);
        return response.data.items;
    }

    async fetchVideoById(id) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${apiKey}`;
      
        const response = await axios.get(url);
        return response.data.items[0];
    }

    async searchVideos(query) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}`;
      
        const response = await axios.get(url);
        return response.data.items;
    }

    async getVideoInfo (url) {
        let info;
        if (!this.validateUrl(url)) {
            info = await ytdl.getInfo(url);

            return info;
        }else{
        // Validar la URL del video
        //const videoId = ytdl.getURLVideoID(url);
        const videoId = this.extractYouTubeId(url);
        const isValid = ytdl.validateID(videoId);
        if (!isValid) {
            throw new Error('Invalid video ID');
            
        }
        info = await ytdl.getInfo(videoId);
        // Obtener información del video
        return info;
    }

    }
    
     getVideoFormat (info) {
        // Filtrar formatos de video y audio
        const formats720p = ytdl.filterFormats(info.formats, (format) => {
            return format.qualityLabel === '720p' && format.hasVideo && format.mimeType.includes('video/mp4');
        });
    
        if (formats720p.length === 0) {
            throw new Error('No suitable formats found.');
        }
    
        // Obtener el formato
        return formats720p[0];
    }
    
     streamVideoLive (url, formats, res) {
        try{
        // Establecer encabezados HTTP
        //res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Content-Type', 'video/ts');
        res.setHeader('Transfer-Encoding', 'chunked'); // Para enviar el archivo en partes

        // Transmitir el video
        const stream = ytdl(url,{ format: 'best' });

        return stream.pipe(res);
        }catch(error){
            return res.status(500).send('Error streaming the Live video');
        }
        
    }

    async streamVideo (url, formats, info, res){
        try {
            ytstream.setGlobalHeaders({
                'Content-Disposition': 'inline'
            });
            const stream = await ytstream.stream('https://www.youtube.com/watch?v='+url, {
                quality: 'high',
                type: 'video',
                highWaterMark: 1048576 * 32,
                container: formats.container,
                download: true,
                format:{
                    formats
                },
                mimeType: formats.mimeType,
                info: info
            });
            stream.stream.pipe(res);
            return;
            }catch(error){
                this.streamVideoLive(url,formats,res);
                //return res.status(500).send('Error streaming the Live video');
            }
    }

    extractYouTubeId(url) {
        try {
          const parsedUrl = new URL(url);
          
          // Case 1: Check for "/live/{id}" format
          if (parsedUrl.pathname.startsWith('/live/')) {
            return parsedUrl.pathname.split('/live/')[1].split('?')[0];
          }
          
          // Case 2: Check for "youtu.be/{id}" short URL format
          if (parsedUrl.hostname === 'youtu.be') {
            return parsedUrl.pathname.substring(1); // Extract everything after '/'
          }
          
          // Case 3: Check for "watch?v={id}" standard format
          if (parsedUrl.pathname === '/watch') {
            return parsedUrl.searchParams.get('v'); // Extract the 'v' query parameter
          }
      
          // If no valid format is matched
          throw new Error('Invalid YouTube URL format');
        } catch (error) {
          console.error('Error extracting ID:', error.message);
          return null;
        }
      }
      
}
const instance = new M3UService();
Object.freeze(instance);

module.exports = instance;
