import { readFileSync, writeFileSync, existsSync } from "fs";
import { Keypair } from "@stellar/stellar-sdk";
import { cfg } from "./config.js";

// ── API helpers ──

export async function apiGet(path: string): Promise<any> {
  const url = `${cfg.apiUrl}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || body.error || `API error: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

export async function apiPost(path: string, body?: any): Promise<any> {
  const url = `${cfg.apiUrl}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data.message || data.error || `API error: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

// ── Keypair helpers ──

export interface KeyFile {
  publicKey: string;
  secretKey: string;
}

export function loadKeypair(path: string): Keypair {
  if (!existsSync(path)) {
    throw new Error(`Key file not found: ${path}`);
  }
  const data: KeyFile = JSON.parse(readFileSync(path, "utf-8"));
  return Keypair.fromSecret(data.secretKey);
}

export function saveKeypair(kp: Keypair, path: string): void {
  const data: KeyFile = {
    publicKey: kp.publicKey(),
    secretKey: kp.secret(),
  };
  writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 });
}

// ── Output helpers ──

export function printJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(rows: Record<string, any>): void {
  const maxKeyLen = Math.max(...Object.keys(rows).map((k) => k.length));
  for (const [key, value] of Object.entries(rows)) {
    const label = key.padEnd(maxKeyLen + 2);
    const val =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    console.log(`  ${label}${val}`);
  }
}

export function printSuccess(msg: string): void {
  console.log(`✅ ${msg}`);
}

export function printError(msg: string): void {
  console.error(`❌ ${msg}`);
}
