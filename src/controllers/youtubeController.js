const express = require("express");
const youtubeService = require("../services/youtubeService");
const youtubeAuth = require("../auth/jsongenerate");
const ytdl = require("ytdl-core");
const { default: axios } = require("axios");
const { containsWord } = require("../utils/utils");
const { google } = require("googleapis");

class YouTubeController {

  async listVideos(auth) {
    const youtube = google.youtube({ version: "v3", auth });
    const response = await youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      maxResults: 5,
      regionCode: "MX"
    });
    return response.data.items;
  }

  async listChannels(auth, channelId) {
    const youtube = google.youtube({ version: "v3", auth });
    const response = await youtube.channels.list({
      part: "snippet,statistics",
      id: channelId
    });
    return response.data.items[0];
  }

  async searchVideos(auth, query) {
    if (!query) throw new Error("El parámetro de búsqueda 'q' es requerido.");

    const youtube = google.youtube({ version: "v3", auth });
    try {
      const response = await youtube.search.list({
        part: "snippet",
        q: query,
        maxResults: 5,
        type: "video",
      });

      return response.data.items;  // 👈 Asegúrate de retornar los resultados
    } catch (error) {
      console.error("Error al buscar videos:", error);
      throw new Error("Error al buscar videos");
    }
  }

  async getMyChannel(req, res) {
    try {
      const tokens = {
        access_token: req.tokens.accessToken,
        refresh_token: req.tokens.refreshToken
      };
      youtubeService.setCredentials(tokens);
      const channel = await youtubeService.getMyChannel();
      res.json(channel);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

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

  // Nuevo método para obtener el token de acceso
  async getToken(req, res) {
    try {
      const tokens = {
        access_token: req.tokens.accessToken,
        refresh_token: req.tokens.refreshToken
      };
      console.log("Access token:", tokens.access_token);
      res.json(tokens);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async searchVideos(req, res) {
    try {
      const query = req.query.q;
      const type = req.query.type || "none";
      const eventType = req.query.eventtype || "none";
      const category = req.query.category || "none";
      const maxResults = req.query.maxresults || 0;
      //const validateWordsType = this.validateWordsType(req.query.eventtype) && this.validateWordsType(req.query.type);
      if (query === undefined) {
        return res.status(400).send("Query is required");
      }

      if (this.validateWordsType(req.query.eventtype)) {
        if (!this.validateWordsType(req.query.type)) {
          return res.status(400).send("Type & eventType is required");
        }
      }

      const videos = await youtubeService.searchVideos(
        query,
        type,
        eventType,
        category,
        maxResults
      );
      res.json(videos);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async fetchVideoSuscribes(req, res) {
    try {
      //const query = req.query.q;
      const videos = await youtubeService.fetchVideosSuscribes(query);
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

  async streamVideo(req, res) {
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
      console.error("Error streaming video:", error);
      if (error.message === "Invalid video ID") {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      if (error.message === "No suitable formats found.") {
        return res.status(404).send("No suitable formats found.");
      }
      if (error.statusCode === 403) {
        return res.status(403).send("Access to the video is forbidden.");
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
  async getStream(req, res) {
    let url = req.query.url;
    let type = req.query.type || "video";
    let info;
    if (!url) {
      return res.status(400).send("URL is required");
    }
    if (youtubeService.validateUrl(url)) {
      url = youtubeService.extractYouTubeId(url);
    }
    try {
      // Obtener información del video

      //res.setHeader('Access-Control-Allow-Origin', '*');
      //res.setHeader('Content-Type', response.headers['content-type']);
      const video = await youtubeService.getStreamUrl(url, "248");
      const audio = await youtubeService.getStreamUrl(url, "140");
      res.json({ audio, video });
    } catch (error) {
      console.error("Error streaming video:", error);
    }
  }
  async liveDirect(req, res) {
    let url = req.query.url;
    let quality = req.query.quality || "720p";

    if (!url) {
      return res.status(400).send("URL is required");
    }
    if (youtubeService.validateUrl(url)) {
      url = youtubeService.extractYouTubeId(url);
    }
    try {
      // Obtener información del video
      const info = await youtubeService.getVideoInfo(url);
      // Obtener el formato del video
      // const format = youtubeService.getVideoFormat(info);
      // Verificar si es un livestream
      youtubeService.streamVideoAudioM3u(url, res, info);
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
      console.error("Error streaming video:", error);
      if (error.message === "Invalid video URL") {
        return res.status(400).json({ error: "Invalid video URL" });
      }
      if (error.message === "No suitable formats found.") {
        return res.status(404).send("No suitable formats found.");
      }
      if (error.statusCode === 403) {
        return res.status(403).send("Access to the video is forbidden.");
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async liveDirectVideo(req, res) {
    let url = req.query.url;

    if (!url) {
      return res.status(400).send("URL is required");
    }
    if (youtubeService.validateUrl(url)) {
      url = youtubeService.extractYouTubeId(url);
    }
    try {
      //await youtubeService.streamVideoAudioDirect(url, res,req);
      await youtubeService.getStreamUrl(url, "b");
    } catch (error) {
      console.error("Error streaming video:", error);
      if (error.message === "Invalid video URL") {
        return res.status(400).json({ error: "Invalid video URL" });
      }
    }
  }

  async liveStream(req, res) {
    let url = req.query.url;
    let quality = req.query.quality || "720p";

    if (!url) {
      return res.status(400).send("URL is required");
    }
    if (youtubeService.validateUrl(url)) {
      url = youtubeService.extractYouTubeId(url);
    }
    try {
      const stream = youtubeService.getBestVideoUrlStreamDirect(url);
      stream.pipe(res);
    } catch (error) {
      console.error("Error streaming video:", error);
      if (error.message === "Invalid video URL") {
        return res.status(400).json({ error: "Invalid video URL" });
      }
      if (error.message === "No suitable formats found.") {
        return res.status(404).send("No suitable formats found.");
      }
      if (error.statusCode === 403) {
        return res.status(403).send("Access to the video is forbidden.");
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async livestreamFFmpeg(req, res) {
    let url = req.query.url;
    let quality = req.query.quality || "720p";

    if (!url) {
      return res.status(400).send("URL is required");
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
      console.error("Error streaming video:", error);
      if (error.message === "Invalid video URL") {
        return res.status(400).json({ error: "Invalid video URL" });
      }
      if (error.message === "No suitable formats found.") {
        return res.status(404).send("No suitable formats found.");
      }
      if (error.statusCode === 403) {
        return res.status(403).send("Access to the video is forbidden.");
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async livestreamFFmpegHLS(req, res) {
    let url = req.query.url;
    let quality = req.query.quality || "720p";

    if (!url) {
      return res.status(400).send("URL is required");
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
      console.error("Error streaming video:", error);
      if (error.message === "Invalid video URL") {
        return res.status(400).json({ error: "Invalid video URL" });
      }
      if (error.message === "No suitable formats found.") {
        return res.status(404).send("No suitable formats found.");
      }
      if (error.statusCode === 403) {
        return res.status(403).send("Access to the video is forbidden.");
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async fetchVideosByCategoriesAll(req, res) {
    try {
      const videos = await youtubeService.fetchVideosByCategoriesAll();
      res.json({ videos });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  async getVideoType(req, res) {
    let url = req.query.url;
    if (!url) {
      return res.status(400).send("URL is required");
    }

    try {
      // Obtener información del video
      const info = await youtubeService.getVideoInfo(url);

      // Verificar si es un livestream
      const isLive = info.videoDetails.isLiveContent;

      // Obtener el formato del video
      const format = isLive ? "video/ts" : "video/mp4";

      res.json({ format });
    } catch (error) {
      console.error("Error getting video type:", error);
      if (error.message === "Invalid video URL") {
        return res.status(400).json({ error: "Invalid video URL" });
      }
      if (error.message === "No suitable formats found.") {
        return res.status(404).send("No suitable formats found.");
      }
      if (error.statusCode === 403) {
        return res.status(403).send("Access to the video is forbidden.");
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
  async generateToken(req, res) {
    try {
      const token = youtubeAuth.generateToken(req, res);
      res.json({ token });
    } catch (error) {
      console.error("Error generating token:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  validateWordsEventType(word) {
    const wordArray = ["completed", "live", "upcoming"];
    return containsWord(word, wordArray);
  }

  validateWordsType(word) {
    const wordArray = ["video", "channel", "playlist"];
    return containsWord(word, wordArray);
  }
}

module.exports = new YouTubeController();
