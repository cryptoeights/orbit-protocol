#!/usr/bin/env node
import { Command } from "commander";
import { walletCmd } from "./commands/wallet.js";
import { lookupCmd } from "./commands/lookup.js";
import { reputationCmd } from "./commands/reputation.js";
import { trustCmd } from "./commands/trust.js";
import { registerCmd } from "./commands/register.js";
import { verifyCmd } from "./commands/verify.js";
import { passportCmd } from "./commands/passport.js";
import { linkWalletCmd } from "./commands/linkWallet.js";

const program = new Command();

program
  .name("orbit")
  .description("ORBIT Protocol CLI — identity tools for AI agents on Stellar")
  .version("0.1.0");

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
