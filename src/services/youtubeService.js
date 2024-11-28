const axios = require('axios');
require('dotenv').config();


class M3UService {
    constructor() {
        if (!M3UService.instance) {
            M3UService.instance = this;
        }
        return M3UService.instance;
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

}
const instance = new M3UService();
Object.freeze(instance);

module.exports = instance;
