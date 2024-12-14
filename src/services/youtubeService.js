const axios = require('axios');
require('dotenv').config();
const ytdl = require('ytdl-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

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

    async fetchVideosByCategoriesAll() {
      // Leer el archivo config.json
      const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
      const categories = config.category_youtube.items.map(item => item.id);
      console.log(categories);
      const apiKey = process.env.YOUTUBE_API_KEY;
      const videosByCategory = {};
  
      for (const categoryId of categories) {
          const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=${categoryId}&key=${apiKey}`;
          const response = await axios.get(url);
          console.log(response.data.items);
          videosByCategory[categoryId] = response.data.items;
      }
      return videosByCategory;
  }

    async fetchVideosSuscribes() {
      const apiKey = process.env.YOUTUBE_API_KEY;
      const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&key=${apiKey}`;
    
      const response = await axios.get(url);
      return response.data.items;
  }

    async fetchVideoById(id) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${apiKey}`;
      
        const response = await axios.get(url);
        return response.data.items[0];
    }

    async searchVideos(query, type, eventType, category, maxResults) {
        const apiKey = process.env.YOUTUBE_API_KEY;
        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&order=date&regionCode=MX&key=${apiKey}`;
        if (maxResults > 0) {
            url += `&maxResults=${maxResults}`;
        }
        if (eventType !== 'none' && type !== 'none') {
            url += `&eventType=${eventType}&type=${type}`;
        }
        if (category !== 'none') {
            url += `&videoCategoryId=${category}`;
        } 
        console.log(url);
       // const response = await axios.get(url);
       // const videoIds = response.data.items.map(item => item.id.videoId).filter(id => id);
    
     /*   const videoDetails = await Promise.all(videoIds.map(async (id) => {
            const videoUrl = `https://www.youtube.com/watch?v=${id}`;
            const info = await this.getVideoInfo(videoUrl);
            const hasAudio = info.formats.some(format => format.hasAudio);
            const hasVideo = info.formats.some(format => format.hasVideo);
            const infoDetails = info.videoDetails;
            return hasAudio && hasVideo ? infoDetails : null;
        }));*/
    
        return videoDetails;
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
            return format.qualityLabel === '720p' && format.hasVideo;
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
            this.streamVideo(url, formats, res);
            return res.status(500).send('Error streaming the Live video');
        }
        
    }

    async streamVideo (url, res){
              
        const videoUrl = url; // The YouTube URL to process

        if (!videoUrl) {
            return res.status(400).send('Missing URL parameter');
        }

        try {

            // Get the video URL
            const bestVideoUrl = await this.getBestVideoUrl(videoUrl);

            // Create M3U content
            const m3uContent = `#EXTM3U\n#EXTINF:-1, YouTube Video\n${bestVideoUrl}\n`;

            // Set headers for downloading the M3U file
            res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u"');
            res.setHeader('Content-Type', 'video/mp4');

            // Send M3U content
            res.send(m3uContent);

        } catch (error) {
            console.error('Error generating M3U:', error.message);
            res.status(500).send('Error generating M3U file');
        }
      
    }

    async streamVideoAudioM3u (url, res,info){
              
      const videoUrl = url; // The YouTube URL to process

      if (!videoUrl) {
          return res.status(400).send('Missing URL parameter');
      }

      try {
        console.log(info);
          // Get the video URL
         const bestVideoUrl = await this.getStreamUrl(url,'best');
                 // Proxy the request to the M3U8 URL
   /*     proxy.web(req, res, { target: bestVideoUrl, changeOrigin: true }, (error) => {
          if (error) {
              console.error('Error proxying request:', error.message);
              res.status(500).send('Error proxying request');
          }
      });*/
          //const bestAudioUrl = await this.getStreamUrl(url,'140');

          // Create M3U content
          const m3uContent = `#EXTM3U\n#EXTINF:-1, ${info.videoDetails.title}\n${bestVideoUrl}`;

          // Set headers for downloading the M3U file
          res.setHeader('Content-Disposition', 'inline; filename="playlist.m3u"');
          //res.setHeader('Content-Type', 'application/x-mpegurl');

          // Send M3U content
          res.send(m3uContent);

      } catch (error) {
          console.error('Error generating M3U:', error.message);
          res.status(500).send('Error generating M3U file');
      }
    
  }

  async streamVideoAudioDirect (url, res,req){
    const videoUrl = url; // The YouTube URL to process

    if (!videoUrl) {
        return res.status(400).send('Missing URL parameter');
    }
    try {
       // Get the video URL
      // const bestVideoUrl = await this.getStreamUrl(url,'best');
      const bestVideoUrl = ytdl(url, { format: 'best' });
      const range = req.headers.range;

      const headers = {};
      if (range) {
          headers.Range = range;
      }

      const response = await axios.get(bestVideoUrl, {
          headers,
          responseType: 'stream'
      });

      // Copiar los encabezados de la respuesta de axios a la respuesta de Express
      Object.keys(response.headers).forEach(key => {
          res.setHeader(key, response.headers[key]);
      });

      if (range) {
          res.status(206); // HTTP Status 206 for Partial Content
      }
      console.log(bestVideoUrl);
      bestVideoUrl.pipe(res);
  } catch (error) {
      console.error("Error playing video part:", error.message);
      throw error;
  }
  
}

    async streamVideoFFmpeg(url, res){
        const videoId = 'https://www.youtube.com/watch?v=' + url; // The YouTube URL to process
        try {
            const { videoUrl, audioUrl } = await this.getVideoAudioUrls(videoId);
    
            // Usamos ffmpeg para combinar los flujos de video y audio en tiempo real
            const ffmpeg = spawn('ffmpeg', [
                '-i', videoUrl,    // URL de video
                '-i', audioUrl,    // URL de audio
                '-c:v', 'copy',     // Copiar el flujo de video sin recodificación
                '-c:a', 'aac',      // Codificar el audio a AAC
                '-f', 'mp4',        // Salida en formato MP4
                '-movflags', 'frag_keyframe+empty_moov', // Opciones para streaming
                '-'
            ]);
    
            // Configuramos los headers para que el cliente reciba el flujo como un video
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Transfer-Encoding', 'chunked');
    
            // Enviar el flujo del video al cliente en tiempo real
            ffmpeg.stdout.pipe(res);

            res.on('close', () => {
                console.log('Client disconnected');
                ffmpeg.kill();
            });
            // Manejo de errores de ffmpeg
            ffmpeg.stderr.on('data', (data) => {
                console.error(`ffmpeg stderr: ${data}`);
            });
    
            ffmpeg.on('close', (code) => {
                console.log(`ffmpeg process exited with code ${code}`);
            });
    
        } catch (error) {
            console.error('Error al obtener las URLs de video y audio:', error);
            res.status(500).send('Error al obtener las URLs de video y audio');
        }
    }

    async streamVideoFFmpegHLS (id,res) {
        const videoId = 'https://www.youtube.com/watch?v=' + id;
        
        this.verifyDir();
        const hlsPath = path.join(__dirname, "data/hls");
        const dashPath = path.join(__dirname, "data/dash");
      
        // Crear carpetas para HLS y DASH
        if (!fs.existsSync(hlsPath)) fs.mkdirSync(hlsPath, { recursive: true });
        if (!fs.existsSync(dashPath)) fs.mkdirSync(dashPath, { recursive: true });
   
try{
  const {videoUrl, audioUrl} = await this.getVideoAudioUrls(videoId);
   // Configurar FFmpeg para HLS y DASH
   const ffmpeg = spawn("ffmpeg", [
    "-i",
    videoUrl, // URL directa del video
    "-i",
    audioUrl, // URL directa del audio
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-preset",
    "fast",
    "-f",
    "hls",
    "-hls_time",
    "4", // Duración de cada segmento
    "-hls_list_size",
    "10",
    "-hls_flags",
    "append_list+delete_segments",
    "-hls_segment_filename",
    path.join(hlsPath, "segment%03d.ts"),
    path.join(hlsPath, "playlist.m3u8") // Salida HLS
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.error(`FFmpeg error: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    if (code !== 0) {
      console.error("FFmpeg terminó con errores.");
    }
  });
  res.on("close", () => {
    console.log("Client disconnected");
    ffmpeg.kill();
  });
  // Responder con el archivo de reproducción HLS/DASH según parámetro
  const format = "hls";

  if (format === "hls") {
    const hlsFilePath = path.join(hlsPath, "playlist.m3u8");
    if (!fs.existsSync(hlsFilePath)) {
      return res.status(404).send("HLS playlist no generada aún.");
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.setHeader("Content-Disposition", "inline");
   await fs.createReadStream(hlsFilePath).pipe(res);
    //ffmpeg.stdout.pipe(res);
  } else if (format === "dash") {
    const dashFilePath = path.join(dashPath, "manifest.mpd");
    if (!fs.existsSync(dashFilePath)) {
      return res.status(404).send("DASH manifest no generado aún.");
    }

    res.setHeader("Content-Type", "application/dash+xml");
    res.setHeader("Content-Disposition", "inline");
    fs.createReadStream(dashFilePath).pipe(res);
  } else {
    res.status(400).send("Formato no soportado. Usa ?format=hls o ?format=dash");
  }
  }catch(error){
      console.error('Error streaming the video:', error);
      res.status(500).send('Error streaming the video');
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
      
verifyDir(){
    // Path to the directory where ffmpeg will write files
const targetDir = path.join(__dirname, 'data');
  // Crear carpeta para HLS
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
// Check if the directory exists
fs.access(targetDir, fs.constants.F_OK, (err) => {
  if (err) {
    // Directory doesn't exist, create it
    fs.mkdir(targetDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
      } else {
        console.log('Directory created successfully');
      }
    });
  }

  // Set permissions for the directory (e.g., rwxr-xr-x)
  fs.chmod(targetDir, 0o755, (err) => {
    if (err) {
      console.error('Error setting permissions:', err);
    } else {
      console.log('Permissions set successfully');
    }
  });
});
}
// Function to extract the best video URL
getStreamUrl(videoUrl,format) {
    return new Promise((resolve, reject) => {
      const ytDlpProcess = spawn('yt-dlp', ['-f', format,'-g', `https://www.youtube.com/watch?v=${videoUrl}`], { windowsHide: true });
  
      let output = '';
      let errorOutput = '';
  
      // Capture the standard output
      ytDlpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
  
      // Capture the standard error output
      ytDlpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
  
      // Handle the process exit
      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`yt-dlp exited with code ${code}: ${errorOutput.trim()}`));
        }
      });
  
      ytDlpProcess.on('error', (err) => {
        reject(new Error(`Failed to start yt-dlp process: ${err.message}`));
      });
    });
  }

  getBestVideoUrlStreamDirect(videoUrl) {
      const ytDlpProcess = spawn('yt-dlp', ['-f', 'bv*+ba/b','-o','-', videoUrl], {windowsHide: true });
      return ytDlpProcess.stdout;
  }

  getVideoAudioUrls(url) {
    return new Promise((resolve, reject) => {
        // Llamar a yt-dlp para obtener las URL de video
        const videoStream = spawn('yt-dlp', ['-f', '137',  '-g', url], {windowsHide: true });
        // Llamar a yt-dlp para obtener las URL de audio
        const audioStream = spawn('yt-dlp', ['-f', '140', '-g', url], {windowsHide: true });

        let videoUrlStream;
        let audioUrlStream;

        // Capturamos las URL de video
        videoStream.stdout.on('data', (data) => {
            videoUrlStream = data.toString().trim();
        });

        // Capturamos las URL de audio
        audioStream.stdout.on('data', (data) => {
            audioUrlStream = data.toString().trim();
        });

        // Una vez que ambos procesos se completan, resolvemos la promesa
        Promise.all([
            new Promise((resolve) => {
                videoStream.on('exit', resolve);
            }),
            new Promise((resolve) => {
                audioStream.on('exit', resolve);
            })
        ]).then(() => {
            if (videoUrlStream && audioUrlStream) {
                resolve({ videoUrl: videoUrlStream, audioUrl: audioUrlStream });
            } else {
                reject('Error al obtener las URLs de video y audio.');
            }
        });

        // Manejo de errores
        videoStream.stderr.on('data', (data) => {
            console.error(`yt-dlp video stderr: ${data}`);
        });

        audioStream.stderr.on('data', (data) => {
            console.error(`yt-dlp audio stderr: ${data}`);
        });
    });
}

}
const instance = new M3UService();
Object.freeze(instance);

module.exports = instance;
