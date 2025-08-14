// flashbot-rescue-hot-reload.js

require('dotenv').config({ path: '/opt/flashbot-rescue/.env' });
process.env = { ...process.env };

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const ENV_PATH = '/opt/flashbot-rescue/.env';
const PORT = 4001;
const API_TOKEN = "ebde35d7c2304522d9b51f06208b08dde6f7112fbf414b47e716f29c2e9782ea";

// --- Fonction pour charger les variables du .env ---
function loadEnv() {
    if (!fs.existsSync(ENV_PATH)) {
        console.error(`❌ .env file not found at ${ENV_PATH}`);
        process.exit(1);
    }
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        if (line.trim() && line.includes('=')) {
            const [key, value] = line.split('=');
            envVars[key] = value.replace(/(^"|"$)/g, '');
        }
    });
    process.env = { ...process.env, ...envVars };
    return envVars;
}

let envVars = loadEnv();
let { PRIVATE_KEY, FUNDER_WALLET_PK: MASTER_WALLET, RPC_URL } = envVars;

if (!PRIVATE_KEY || !MASTER_WALLET || !RPC_URL) {
    console.error("❌ Certaines variables .env sont manquantes !");
    process.exit(1);
}

console.log("⚡ Flashbot Rescue Hot Reload is running...");
console.log(`Monitoring bot with MASTER_WALLET=${MASTER_WALLET} and RPC_URL=${RPC_URL}`);

// --- Bot principal ---
function runBot() {
    const now = new Date().toISOString();
    console.log(`[${now}] 🟢 Flashbot Rescue heartbeat`);
    console.log(`[${now}] RPC_URL: ${RPC_URL}`);
    console.log(`[${now}] MASTER_WALLET: ${MASTER_WALLET}`);
}
const INTERVAL_MS = 60 * 1000;
runBot();
setInterval(runBot, INTERVAL_MS);

// --- Express API ---
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
    res.json(loadEnv());
});

// POST /update-env
app.post('/update-env', (req, res) => {
    const data = req.body;
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Invalid request body' });

    const backupPath = `${ENV_PATH}.bak_${Date.now()}`;
    fs.copyFileSync(ENV_PATH, backupPath);

    let newContent = '';
    for (const [key, value] of Object.entries(data)) {
        newContent += `${key}="${value}"\n`;
    }

    fs.writeFileSync(ENV_PATH, newContent, 'utf8');
    envVars = loadEnv();
    ({ PRIVATE_KEY, FUNDER_WALLET_PK: MASTER_WALLET, RPC_URL } = envVars);

    console.log(`✅ .env updated at ${new Date().toISOString()}, backup: ${backupPath}`);
    res.json({ success: true, message: '.env updated and bot config reloaded', backup: backupPath });
});

// Endpoint pour récupérer le token depuis le serveur
app.get('/token', (req, res) => {
    res.json({ token: API_TOKEN });
});

// Page HTML
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Flashbot .env Hot Reload</title>
</head>
<body>
    <h2>Update Flashbot .env</h2>
    <form id="envForm">
        <label>PRIVATE_KEY: <input type="text" name="PRIVATE_KEY" value="${PRIVATE_KEY}"></label><br>
        <label>MASTER_WALLET: <input type="text" name="MASTER_WALLET" value="${MASTER_WALLET}"></label><br>
        <label>RPC_URL: <input type="text" name="RPC_URL" value="${RPC_URL}"></label><br>
        <button type="submit">Update .env</button>
    </form>
    <script>
        // Récupérer automatiquement le token depuis le serveur
        const API_TOKEN = await (await fetch('/token')).json().then(res => res.token);

        // Fonction pour mettre à jour le formulaire depuis le serveur
        async function refreshForm() {
            const res = await fetch('/env', {
                headers: { 'Authorization': 'Bearer ' + API_TOKEN }
            });
            const data = await res.json();
            document.querySelector('input[name="PRIVATE_KEY"]').value = data.PRIVATE_KEY || '';
            document.querySelector('input[name="MASTER_WALLET"]').value = data.FUNDER_WALLET_PK || '';
            document.querySelector('input[name="RPC_URL"]').value = data.RPC_URL || '';
        }

        // Polling toutes les 5 secondes pour mise à jour live
        setInterval(refreshForm, 5000);

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Env update API running on http://0.0.0.0:${PORT}`);
});

// Signaux PM2
process.on('SIGINT', () => { console.log("⚠️ Flashbot Rescue received SIGINT, stopping..."); process.exit(0); });
process.on('SIGTERM', () => { console.log("⚠️ Flashbot Rescue received SIGTERM, stopping..."); process.exit(0); });

