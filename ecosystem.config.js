// PM2 ecosystem file for DigitalOcean/VPS deployment
module.exports = {
  apps: [
    {
      name: 'pixel-place',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'socket-server',
      script: 'server.js',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
