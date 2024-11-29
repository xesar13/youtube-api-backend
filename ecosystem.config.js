module.exports = {
    apps: [
      {
        name: 'YoutubeAPI',
        script: 'src/server.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
          NODE_ENV: 'development',
          PORT: 8011
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 8011
        }
      }
    ]
  };