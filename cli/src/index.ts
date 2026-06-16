#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { walletCmd } from "./commands/wallet.js";
import { lookupCmd } from "./commands/lookup.js";
import { reputationCmd } from "./commands/reputation.js";
import { trustCmd } from "./commands/trust.js";
import { registerCmd } from "./commands/register.js";
import { verifyCmd } from "./commands/verify.js";
import { passportCmd } from "./commands/passport.js";
import { linkWalletCmd } from "./commands/linkWallet.js";

// Read version from package.json so it never drifts from the published version.
const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8")
);

const program = new Command();

program
  .name("orbit")
  .description("ORBIT Protocol CLI — identity tools for AI agents on Stellar")
  .version(version);

// Read commands
program.addCommand(walletCmd);
program.addCommand(lookupCmd);
program.addCommand(reputationCmd);
program.addCommand(trustCmd);

// Write commands
program.addCommand(registerCmd);
program.addCommand(verifyCmd);
program.addCommand(passportCmd);
program.addCommand(linkWalletCmd);

program.parse();
