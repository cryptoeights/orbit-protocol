import { Command } from "commander";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { loadKeypair, printSuccess, printError, apiPost } from "../utils.js";
import { buildAndSubmit, toAddress } from "../stellar.js";
import { cfg } from "../config.js";

export const registerCmd = new Command("register")
  .description("Register a new agent identity on-chain")
  .requiredOption("-k, --key <path>", "Path to keypair JSON file")
  .requiredOption("-n, --name <name>", "Agent name (3-64 chars)")
  .option("-d, --description <desc>", "Agent description", "")
  .option("-m, --metadata-uri <uri>", "Metadata URI", "")
  .action(async (opts) => {
    try {
      const keypair = loadKeypair(opts.key);
      const wallet = keypair.publicKey();

      console.log(`\n  Registering agent "${opts.name}" for ${wallet.slice(0, 8)}...`);

      const result = await buildAndSubmit(
        cfg.agentRegistryId,
        "register_agent",
        [
          toAddress(wallet),
          nativeToScVal(opts.name, { type: "string" }),
          nativeToScVal(opts.description, { type: "string" }),
          nativeToScVal(opts.metadataUri, { type: "string" }),
        ],
        keypair
      );

      printSuccess("Agent registered on-chain!");
      console.log(`  Wallet: ${wallet}`);

      // Sync to API cache.
      try {
        await apiPost(`/api/agents/sync/${wallet}`);
        console.log("  API cache synced.");
      } catch {
        console.log("  ⚠️  API sync skipped (server may not be running)");
      }

      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
