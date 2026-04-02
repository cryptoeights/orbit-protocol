import {
  Account,
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  xdr,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";
import { cfg } from "./config.js";

const server = new rpc.Server(cfg.rpcUrl);

/**
 * Build, simulate, sign, and submit a Soroban contract invocation.
 * Returns the result value from the transaction.
 */
export async function buildAndSubmit(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  keypair: Keypair
): Promise<any> {
  const contract = new Contract(contractId);
  const publicKey = keypair.publicKey();

  // Load the source account from the network.
  const accountResponse = await server.getAccount(publicKey);
  const account = new Account(publicKey, accountResponse.sequenceNumber());

  // Build the transaction.
  const tx = new TransactionBuilder(account, {
    fee: "1000000", // 0.1 XLM max fee — generous for testnet
    networkPassphrase: cfg.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  // Simulate to get resource estimates.
  const sim = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    const errMsg = (sim as any).error || "unknown simulation error";
    throw new Error(`Simulation failed: ${errMsg}`);
  }

  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error("Simulation did not succeed");
  }

  // Assemble the transaction with resource footprint from simulation.
  const assembled = rpc.assembleTransaction(tx, sim).build();

  // Sign.
  assembled.sign(keypair);

  // Submit.
  const response = await server.sendTransaction(assembled);

  if (response.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${response.status}`);
  }

  // Poll for result.
  const hash = response.hash;
  let result = await server.getTransaction(hash);

  const maxWait = 30; // seconds
  for (let i = 0; i < maxWait; i++) {
    if (result.status !== "NOT_FOUND") break;
    await new Promise((r) => setTimeout(r, 1000));
    result = await server.getTransaction(hash);
  }

  if (result.status === "SUCCESS") {
    return result;
  } else if (result.status === "FAILED") {
    throw new Error(`Transaction failed on-chain`);
  } else {
    throw new Error(`Transaction status: ${result.status} after ${maxWait}s`);
  }
}

/**
 * Helper to convert values to ScVal for contract arguments.
 */
export function toScVal(value: any, type: string): xdr.ScVal {
  return nativeToScVal(value, { type } as any);
}

export function toAddress(addr: string): xdr.ScVal {
  return new Address(addr).toScVal();
}

export function toU64(n: number): xdr.ScVal {
  return nativeToScVal(n, { type: "u64" });
}

export function toI128(n: number): xdr.ScVal {
  return nativeToScVal(n, { type: "i128" });
}

export function toStr(env_unused: null, s: string): xdr.ScVal {
  return nativeToScVal(s, { type: "string" });
}
