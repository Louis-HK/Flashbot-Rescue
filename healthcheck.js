const ethers = require("ethers");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");
require("dotenv").config();

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const block = await provider.getBlockNumber();
    console.log(`[OK] Geth RPC is accessible, current block: ${block}`);

    const authSigner = ethers.Wallet.createRandom();
    const fbProvider = await FlashbotsBundleProvider.create(provider, authSigner);
    if (fbProvider) {
      console.log("[OK] Successfully connected to Flashbots relay");
    } else {
      console.error("[FAIL] Could not create Flashbots provider");
    }
    process.exit(0);
  } catch (err) {
    console.error("[FAIL] Healthcheck error:", err);
    process.exit(1);
  }
})();
