import { Command } from "commander";
import { apiGet, printJson, printTable, printError } from "../utils.js";

export const lookupCmd = new Command("lookup")
  .description("Look up an agent by wallet address")
  .argument("<wallet>", "Stellar wallet address")
  .option("--json", "Output as JSON")
  .action(async (wallet: string, opts) => {
    try {
      const agent = await apiGet(`/api/agents/${wallet}`);

      if (opts.json) {
        printJson(agent);
        return;
      }

      console.log(`\n  🤖 ${agent.name}\n`);
      printTable({
        "Agent ID": agent.agent_id,
        "Wallet": agent.wallet,
        "Status": agent.status,
        "Verified": agent.verified ? `✅ ${agent.verification_tier}` : "❌",
        "Reputation": `${agent.reputation_score}/10000 (${agent.total_interactions} interactions)`,
        "Passport": agent.has_passport ? `✅ #${agent.passport_id}` : "❌",
        "Metadata": agent.metadata_uri || "(none)",
      });
      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
