module.exports = {
  apps: [
    {
      name: 'bot-bruna',
      script: 'bot/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        BOT_API_PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
    },
    {
      name: 'painel-bruna',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: __dirname + '/painel',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
    },
  ],
};
