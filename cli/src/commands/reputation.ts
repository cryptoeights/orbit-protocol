import { Command } from "commander";
import { apiGet, printJson, printTable, printError } from "../utils.js";

export const reputationCmd = new Command("reputation")
  .description("Check reputation for an agent")
  .argument("<wallet>", "Stellar wallet address")
  .option("--json", "Output as JSON")
  .action(async (wallet: string, opts) => {
    try {
      const rep = await apiGet(`/api/agents/${wallet}/reputation`);

      if (opts.json) {
        printJson(rep);
        return;
      }

      const ratio =
        rep.total_interactions > 0
          ? ((rep.positive_count / rep.total_interactions) * 100).toFixed(1)
          : "N/A";

      console.log(`\n  📊 Reputation for ${wallet.slice(0, 8)}...\n`);
      printTable({
        "Score": `${rep.score}/10000`,
        "Total Interactions": rep.total_interactions,
        "Positive": rep.positive_count ?? "N/A",
        "Negative": rep.negative_count ?? "N/A",
        "Positive Ratio": `${ratio}%`,
        "Last Feedback": rep.last_feedback_at
          ? new Date(rep.last_feedback_at * 1000).toISOString()
          : "never",
      });
      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
