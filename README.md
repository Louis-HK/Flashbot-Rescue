# Flashbot Rescue Bot

A Node.js bot that uses Flashbots to execute an atomic bundle:
- Funds a compromised wallet with ETH for gas fees.
- Transfers an ERC20 token to a recovery address.
- All within the same block, avoiding public mempool.

## Requirements

- Node.js >= 16
- npm >= 8
- A fully synced Geth node with HTTP RPC enabled (`--http`)
- PM2 for process management in production

## Installation

```bash
git clone https://github.com/<your_repo>/flashbot-rescue.git
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
- Keep your private keys safe. Do not commit `.env` to version control.
- Always test on a testnet (Sepolia) with a compatible relay before mainnet usage.
