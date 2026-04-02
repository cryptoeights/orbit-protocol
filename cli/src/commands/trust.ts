import { Command } from "commander";
import { apiGet, printJson, printTable, printError } from "../utils.js";

export const trustCmd = new Command("trust")
  .description("Check trust tier for an agent")
  .argument("<wallet>", "Stellar wallet address")
  .option("--json", "Output as JSON")
  .action(async (wallet: string, opts) => {
    try {
      const trust = await apiGet(`/api/trust/${wallet}`);

      if (opts.json) {
        printJson(trust);
        return;
      }

      const tierEmoji: Record<string, string> = {
        unknown: "⬜",
        registered: "🟦",
        verified: "🟩",
        trusted: "🟨",
        elite: "🟪",
      };

      console.log(
        `\n  ${tierEmoji[trust.trust_tier] || "⬜"} Trust: ${trust.trust_tier.toUpperCase()} (${trust.trust_score}/10000)\n`
      );

      if (trust.factors) {
        console.log("  Factors:");
        for (const [factor, score] of Object.entries(trust.factors)) {
          const bar = "█".repeat(Math.floor((score as number) / 500));
          console.log(`    ${factor.padEnd(16)} +${String(score).padStart(5)}  ${bar}`);
        }
      }
      console.log();
    } catch (e: any) {
      printError(e.message);
      process.exit(1);
    }
  });
