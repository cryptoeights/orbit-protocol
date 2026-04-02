import { Command } from "commander";
import { loadKeypair, printSuccess, printError, apiGet } from "../utils.js";
import { buildAndSubmit, toAddress, toU64 } from "../stellar.js";
import { cfg } from "../config.js";

export const linkWalletCmd = new Command("link-wallet")
  .description("Link a new wallet to your agent identity")
  .requiredOption("-k, --key <path>", "Path to authority keypair JSON file")
  .requiredOption("--new-wallet <address>", "Stellar public key of wallet to link")
  .action(async (opts) => {
    try {
      const keypair = loadKeypair(opts.key);
      const wallet = keypair.publicKey();

      // Look up agent_id.
      const agent = await apiGet(`/api/agents/${wallet}`);
      if (!agent || !agent.agent_id) {
        printError("Agent not found. Register first.");
        process.exit(1);
      }

      console.log(`\n  Linking wallet to agent #${agent.agent_id}...`);
      console.log(`  Authority: ${wallet.slice(0, 8)}...`);
      console.log(`  New wallet: ${opts.newWallet.slice(0, 8)}...`);

      await buildAndSubmit(
        cfg.multiWalletId,
        "link_wallet",
        [
          toU64(agent.agent_id),
          toAddress(wallet),
          toAddress(opts.newWallet),
        ],
        keypair
      );

      printSuccess("Wallet linked!");
      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
