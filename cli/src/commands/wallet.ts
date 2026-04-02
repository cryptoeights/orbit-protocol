import { Command } from "commander";
import { Keypair } from "@stellar/stellar-sdk";
import { saveKeypair, printJson, printSuccess } from "../utils.js";
import { cfg } from "../config.js";

export const walletCmd = new Command("wallet")
  .description("Wallet management");

walletCmd
  .command("generate")
  .description("Generate a new Stellar keypair")
  .option("-o, --output <path>", "Output file path", "orbit-key.json")
  .option("--fund", "Fund the wallet via Friendbot (testnet only)", false)
  .action(async (opts) => {
    const kp = Keypair.random();

    saveKeypair(kp, opts.output);
    printSuccess(`Keypair saved to ${opts.output}`);

    console.log(`  Public Key:  ${kp.publicKey()}`);
    console.log(`  Secret Key:  ${kp.secret().slice(0, 4)}...${kp.secret().slice(-4)}`);

    if (opts.fund && cfg.network === "testnet") {
      console.log("\n  Funding via Friendbot...");
      try {
        const res = await fetch(
          `https://friendbot.stellar.org?addr=${kp.publicKey()}`
        );
        if (res.ok) {
          printSuccess("Wallet funded with 10,000 test XLM");
        } else {
          console.error("  ⚠️  Friendbot funding failed");
        }
      } catch {
        console.error("  ⚠️  Could not reach Friendbot");
      }
    }
  });
