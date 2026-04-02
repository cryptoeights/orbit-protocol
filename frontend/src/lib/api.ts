const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getAgents(params?: {
  search?: string;
  sort?: string;
  verified?: boolean;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.sort) sp.set("sort", params.sort);
  if (params?.verified) sp.set("verified", "true");
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return apiFetch(`/api/agents${qs ? `?${qs}` : ""}`);
}

export async function getAgent(wallet: string) {
  return apiFetch(`/api/agents/${wallet}`);
}

export async function getReputation(wallet: string) {
  return apiFetch(`/api/agents/${wallet}/reputation`);
}

export async function getPassport(wallet: string) {
  return apiFetch(`/api/agents/${wallet}/passport`);
}

export async function getLinkedWallets(wallet: string) {
  return apiFetch(`/api/agents/${wallet}/wallets`);
}

export async function getTrust(wallet: string) {
  return apiFetch(`/api/trust/${wallet}`);
}

export async function getTrustDetails(wallet: string) {
  return apiFetch(`/api/trust/${wallet}/details`);
}
