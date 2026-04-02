import { Command } from "commander";
import { nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { loadKeypair, printSuccess, printError, apiGet } from "../utils.js";
import { buildAndSubmit, toAddress, toU64 } from "../stellar.js";
import { cfg } from "../config.js";

export const verifyCmd = new Command("verify")
  .description("Verify your agent (pays XLM fee)")
  .requiredOption("-k, --key <path>", "Path to keypair JSON file")
  .option("--tier <tier>", "Verification tier: basic or premium", "basic")
  .action(async (opts) => {
    try {
      const keypair = loadKeypair(opts.key);
      const wallet = keypair.publicKey();

      // Look up agent_id from API.
      const agent = await apiGet(`/api/agents/${wallet}`);
      if (!agent || !agent.agent_id) {
        printError("Agent not found. Register first with: orbit register");
        process.exit(1);
      }

      const tierVal = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol(opts.tier === "premium" ? "Premium" : "Basic"),
      ]);

      const fee =
        opts.tier === "premium" ? "100 XLM" : "10 XLM";

      console.log(`\n  Verifying agent #${agent.agent_id} (${opts.tier} tier, ${fee})...`);

      await buildAndSubmit(
        cfg.verificationId,
        "verify_agent",
        [
          toU64(agent.agent_id),
          toAddress(wallet),
          tierVal,
        ],
        keypair
      );

      printSuccess(`Agent verified! (${opts.tier} tier, paid ${fee})`);
      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
