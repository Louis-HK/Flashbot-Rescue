module.exports = {
  apps: [
    {
      name: "flashbot",
      script: "flashbot.js",
      node_args: "--max-old-space-size=256",
      env: {
        NODE_ENV: "production"
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/flashbot-error.log",
      out_file: "./logs/flashbot-out.log",
      merge_logs: true
    }
  ]
};
