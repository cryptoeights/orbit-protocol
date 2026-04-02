import { Command } from "commander";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { loadKeypair, printSuccess, printError, apiGet } from "../utils.js";
import { buildAndSubmit, toAddress, toU64 } from "../stellar.js";
import { cfg } from "../config.js";

export const passportCmd = new Command("passport")
  .description("Passport operations");

passportCmd
  .command("mint")
  .description("Mint a soulbound passport (requires verification)")
  .requiredOption("-k, --key <path>", "Path to keypair JSON file")
  .option("-m, --metadata-uri <uri>", "Passport metadata URI", "")
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

      if (!agent.verified) {
        printError("Agent not verified. Run: orbit verify -k <keyfile>");
        process.exit(1);
      }

      const uri =
        opts.metadataUri ||
        `https://api.orbitprotocol.xyz/passports/${agent.agent_id}.json`;

      console.log(`\n  Minting passport for agent #${agent.agent_id}...`);

      await buildAndSubmit(
        cfg.passportId,
        "mint_passport",
        [
          toU64(agent.agent_id),
          toAddress(wallet),
          nativeToScVal(uri, { type: "string" }),
        ],
        keypair
      );

      printSuccess("Passport minted!");
      console.log(`  Agent: #${agent.agent_id}`);
      console.log(`  Metadata: ${uri}`);
      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
