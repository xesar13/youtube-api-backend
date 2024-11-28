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

}


module.exports = new M3UController();