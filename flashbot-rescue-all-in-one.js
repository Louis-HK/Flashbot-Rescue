// flashbot-rescue-all-in-one.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

// Config
const ENV_PATH = '/opt/flashbot-rescue/.env';
const BOT_NAME = 'flashbot-rescue-all-in-one';
const PORT = 4001;
const API_TOKEN = "ebde35d7c2304522d9b51f06208b08dde6f7112fbf414b47e716f29c2e9782ea";

// Vérification .env
if (!fs.existsSync(ENV_PATH)) {
    console.error(`❌ .env file not found at ${ENV_PATH}`);
    process.exit(1);
}
require('dotenv').config({ path: ENV_PATH });

// Variables importantes du bot
let { PRIVATE_KEY, MASTER_WALLET, RPC_URL } = process.env;

if (!PRIVATE_KEY || !MASTER_WALLET || !RPC_URL) {
    console.error("❌ Certaines variables .env sont manquantes !");
    process.exit(1);
}

console.log("⚡ Flashbot Rescue All-in-One is running...");
console.log(`Monitoring bot with MASTER_WALLET=${MASTER_WALLET} and RPC_URL=${RPC_URL}`);

// --- Bot principal ---
function runBot() {
    const now = new Date().toISOString();
    console.log(`[${now}] 🟢 Flashbot Rescue heartbeat`);
    console.log(`[${now}] RPC_URL: ${RPC_URL}`);
    console.log(`[${now}] MASTER_WALLET: ${MASTER_WALLET}`);
}
const INTERVAL_MS = 60 * 1000; // 1 min
runBot();
setInterval(runBot, INTERVAL_MS);

// --- Express API pour .env ---
const app = express();
app.use(bodyParser.json());

// Middleware auth
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || token !== `Bearer ${API_TOKEN}`) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
});

// GET /env
app.get('/env', (req, res) => {
    try {
        const envContent = fs.readFileSync(ENV_PATH, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            if (line.trim() && line.includes('=')) {
                const [key, value] = line.split('=');
                envVars[key] = value.replace(/(^"|"$)/g, '');
            }
        });
        res.json(envVars);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read .env' });
    }
});

// POST /update-env
app.post('/update-env', (req, res) => {
    const envData = req.body;
    if (!envData || typeof envData !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const backupPath = `${ENV_PATH}.bak_${Date.now()}`;
    fs.copyFileSync(ENV_PATH, backupPath);

    let envContent = '';
    for (const [key, value] of Object.entries(envData)) {
        envContent += `${key}="${value}"\n`;
    }

    fs.writeFile(ENV_PATH, envContent, 'utf8', (err) => {
        if (err) return res.status(500).json({ error: 'Failed to write .env' });

        console.log(`✅ .env updated, backup at ${backupPath}`);

        // Recharger les variables pour le bot
        require('dotenv').config({ path: ENV_PATH });
        ({ PRIVATE_KEY, MASTER_WALLET, RPC_URL } = process.env);

        console.log(`⚡ Updated bot config: MASTER_WALLET=${MASTER_WALLET}, RPC_URL=${RPC_URL}`);

        res.json({ success: true, message: '.env updated and bot config reloaded', backup: backupPath });
    });
});

// Page HTML pour mise à jour manuelle
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Flashbot .env Update</title>
</head>
<body>
<h2>Update Flashbot .env</h2>
<form id="envForm">
    <label>PRIVATE_KEY: <input type="text" name="PRIVATE_KEY"></label><br>
    <label>MASTER_WALLET: <input type="text" name="MASTER_WALLET"></label><br>
    <label>RPC_URL: <input type="text" name="RPC_URL"></label><br>
    <button type="submit">Update .env</button>
</form>
<script>
const API_TOKEN = "${API_TOKEN}";
document.getElementById('envForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const res = await fetch('/update-env', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_TOKEN
        },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(JSON.stringify(result));
});
</script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`Env update API running on http://localhost:${PORT}`);
});

// --- Gestion des signaux PM2 ---
process.on('SIGINT', () => {
    console.log("⚠️ Flashbot Rescue received SIGINT, stopping...");
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log("⚠️ Flashbot Rescue received SIGTERM, stopping...");
    process.exit(0);
});

