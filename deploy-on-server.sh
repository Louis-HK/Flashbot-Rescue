#!/bin/bash
# deploy-on-server.sh — Clone, install, and run the Flashbot Rescue bot in production

# === CONFIG ===
GITHUB_USER="YourGitHubUsername"
REPO_NAME="flashbot-rescue"
APP_DIR="$HOME/$REPO_NAME"

# === INSTALL NODE & PM2 IF NEEDED ===
if ! command -v node &> /dev/null; then
    echo "[INFO] Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "[INFO] Installing PM2..."
    sudo npm install -g pm2
fi

# === CLONE REPO ===
if [ -d "$APP_DIR" ]; then
    echo "[INFO] Directory exists, pulling latest changes..."
    cd "$APP_DIR" || exit 1
    git pull origin main
else
    echo "[INFO] Cloning repository..."
    git clone "https://github.com/$GITHUB_USER/$REPO_NAME.git" "$APP_DIR"
    cd "$APP_DIR" || exit 1
fi

# === INSTALL DEPENDENCIES ===
npm install

# === COPY ENV FILE ===
if [ ! -f .env ]; then
    echo "[INFO] Copying env file from example..."
    cp .env.example .env
    echo "[WARN] Please edit .env with your private keys and addresses."
fi

# === START WITH PM2 ===
pm2 start ecosystem.config.js
pm2 save

echo "[OK] Application deployed and running under PM2."
