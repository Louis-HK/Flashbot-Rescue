# Flashbot Rescue Bot

**Flashbot-Rescue v0.1** is the first public release of a lightweight bot designed to safely recover ERC20 tokens from compromised wallets using Flashbots. It executes atomic bundles, ensuring transactions occur within the same block and avoid the public mempool.

## Key Features

* **Atomic Recovery:** Funds a compromised wallet with ETH for gas fees and transfers ERC20 tokens to a recovery address within the same block.
* **Secure and Modular:** Built with Node.js, designed for simple setup and integration with existing Flashbot environments.
* **Lightweight Foundation:** Provides the essential features for bot execution, with future releases planned for extended monitoring and management tools.

## Requirements

* Node.js >= 16
* npm >= 8
* A fully synced Geth node with HTTP RPC enabled (`--http`)

## Installation

```bash
git clone https://github.com/Louis-HK/Flashbot-Rescue.git
cd flashbot-rescue
npm install
cp .env.example .env
# Edit .env with your private keys and addresses
```

## Testing

```bash
node healthcheck.js
```

## Running in Production

```bash
pm2 start ecosystem.config.js
pm2 logs flashbot
```

## Stopping

```bash
pm2 stop flashbot
```

## Notes

* Keep your private keys safe. Do not commit `.env` to version control.
* Always test on a testnet (e.g., Sepolia) with a compatible relay before using on mainnet.
* This release focuses on the core bot functionality; advanced features like web-based environment management or multi-instance monitoring will come in future versions.

