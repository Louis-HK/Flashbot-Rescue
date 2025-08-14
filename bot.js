// flashbot-rescue bot.js (version complète avec .env complet)
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve('/opt/flashbot-rescue/.env') }); // chemin vers le .env

// Variables d'environnement importantes
const { PRIVATE_KEY, FUNDER_WALLET_PK, RPC_URL, SAFE_ADDRESS, TOKEN_ADDRESS, CHAIN_ID, API_KEY } = process.env;

// Vérification au démarrage
if (!PRIVATE_KEY || !FUNDER_WALLET_PK || !RPC_URL || !SAFE_ADDRESS || !TOKEN_ADDRESS || !CHAIN_ID) {
    console.error("❌ Certaines variables .env sont manquantes !");
    process.exit(1);
}

console.log("⚡ Flashbot Rescue is running...");
console.log(`Monitoring bot with SAFE_ADDRESS=${SAFE_ADDRESS}, TOKEN_ADDRESS=${TOKEN_ADDRESS}, RPC_URL=${RPC_URL}`);

// Fonction principale du bot
function runBot() {
    const now = new Date().toISOString();
    console.log(`[${now}] 🟢 Flashbot Rescue heartbeat`);
    
    // Exemple : log des variables critiques
    console.log(`[${now}] RPC_URL: ${RPC_URL}`);
    console.log(`[${now}] SAFE_ADDRESS: ${SAFE_ADDRESS}`);
    console.log(`[${now}] TOKEN_ADDRESS: ${TOKEN_ADDRESS}`);
}

// Intervalle d'exécution (modifiable)
const INTERVAL_MS = 60 * 1000; // toutes les 1 minute

// Lancer immédiatement et toutes les INTERVAL_MS
runBot();
setInterval(runBot, INTERVAL_MS);

// Gestion des signaux PM2 pour shutdown propre
process.on('SIGINT', () => {
    console.log("⚠️ Flashbot Rescue received SIGINT, stopping...");
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log("⚠️ Flashbot Rescue received SIGTERM, stopping...");
    process.exit(0);
});

