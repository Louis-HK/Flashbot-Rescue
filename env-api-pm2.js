// env-api-pm2-simple.js
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const ENV_PATH = '/opt/flashbot-rescue/.env';
require('dotenv').config({ path: ENV_PATH });

const app = express();
const PORT = 4001;
const BOT_NAME = 'flashbot-rescue-hot-reload'; // Nom exact dans PM2

app.use(bodyParser.json());

// GET /env
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

// POST /update-env
app.post('/update-env', (req, res) => {
    const envData = req.body;
    if (!envData || typeof envData !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    // Backup .env
    const backupPath = `${ENV_PATH}.bak_${Date.now()}`;
    fs.copyFileSync(ENV_PATH, backupPath);

    // Écriture du nouveau .env
    let envContent = '';
    for (const [key, value] of Object.entries(envData)) {
        envContent += `${key}="${value}"\n`;
    }

    fs.writeFile(ENV_PATH, envContent, 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write .env' });
        }

        // Redémarrage du bot via PM2 avec update-env
        const restartBot = `pm2 restart ${BOT_NAME} --update-env`;
        exec(restartBot, { env: process.env }, (err, stdout, stderr) => {
            console.log({ stdout, stderr });
            if (err) {
                return res.status(500).json({
                    error: 'Env updated but failed to restart bot',
                    details: stderr || err.message
                });
            }

            return res.json({
                success: true,
                message: '.env updated and bot restarted',
                backup: backupPath
            });
        });
    });
});

// Formulaire HTML simple
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
                <label>RPC_URL: <input type="text" name="RPC_URL" value="http://95.217.140.174:8545"></label><br>
                <label>SAFE_ADDRESS: <input type="text" name="SAFE_ADDRESS" value="0x91a7c0acef1fC528CE695513A648490C8242191A"></label><br>
                <label>TOKEN_ADDRESS: <input type="text" name="TOKEN_ADDRESS" value="0xdAC17F958D2ee523a2206206994597C13D831ec7"></label><br>
                <label>CHAIN_ID: <input type="text" name="CHAIN_ID" value="1"></label><br>
                <button type="submit">Update .env</button>
            </form>

            <script>
                document.getElementById('envForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());

                    const res = await fetch('/update-env', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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

// Lancer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Env update API running on port ${PORT}`);
});

