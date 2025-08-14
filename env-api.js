// flashbot-env-api.js (version corrigée)
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');

// FORCER le chargement du .env dès le départ
require('dotenv').config({ path: '/opt/flashbot-rescue/.env' });

const app = express();
const PORT = 4001;
const API_TOKEN = "ebde35d7c2304522d9b51f06208b08dde6f7112fbf414b47e716f29c2e9782ea"; // remplace par ton token
const ENV_PATH = '/opt/flashbot-rescue/.env';
const BOT_NAME = 'flashbot-rescue';

app.use(bodyParser.json());

// Middleware d’authentification
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || token !== `Bearer ${API_TOKEN}`) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
});

// Endpoint GET /env
app.get('/env', (req, res) => {
    if (!fs.existsSync(ENV_PATH)) {
        return res.status(404).json({ error: '.env file not found' });
    }

    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        if (line.trim() && line.includes('=')) {
            const [key, value] = line.split('=');
            envVars[key] = value.replace(/(^"|"$)/g, '');
        }
    });

    res.json(envVars);
});

// Endpoint POST /update-env
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

        exec(`pm2 restart ${BOT_NAME}`, (err) => {
            if (err) return res.status(500).json({ error: 'Env updated but failed to restart bot' });

            return res.json({
                success: true,
                message: '.env updated and bot restarted',
                backup: backupPath
            });
        });
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
    <label>FUNDER_WALLET_PK: <input type="text" name="FUNDER_WALLET_PK"></label><br>
    <label>RPC_URL: <input type="text" name="RPC_URL" value="http://127.0.0.1:8545"></label><br>
    <label>SAFE_ADDRESS: <input type="text" name="SAFE_ADDRESS" value="0x91a7c0acef1fC528CE695513A648490C8242191A"></label><br>
    <label>TOKEN_ADDRESS: <input type="text" name="TOKEN_ADDRESS" value="0xdAC17F958D2ee523a2206206994597C13D831ec7"></label><br>
    <label>CHAIN_ID: <input type="text" name="CHAIN_ID" value="1"></label><br>
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Env update API running on all interfaces (public)`);
});

