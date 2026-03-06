import { requireUser } from "@/lib/session";
import { normalizeObpPayload, type ObpEnvelope } from "@/lib/obp/normalize";

function mustGet(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const BC_URL = mustGet("BC_URL");
const BC_CHANNEL = mustGet("BC_CHANNEL");
const BC_CHAINCODE_NAME = mustGet("BC_CHAINCODE_NAME");
const BC_TIMEOUT = process.env.BC_TIMEOUT ?? "60";
const BC_SYNC = process.env.BC_SYNC ?? "true";

export type ObpCallKind = "query" | "tx";

export async function obpCall<T>(kind: ObpCallKind, args: any[], opts?: { sameOrgEndorser?: boolean; endorsers?: any[], preAuth?: {username: string, password: string} }) {
  const user = !opts?.preAuth ? await requireUser() : {username: opts?.preAuth.username, password: opts?.preAuth.password}
  const path =
    kind === "query"
      ? `/api/v2/channels/${encodeURIComponent(BC_CHANNEL)}/chaincode-queries`
      : `/api/v2/channels/${encodeURIComponent(BC_CHANNEL)}/transactions`;
  const res = await fetch(`${BC_URL}${path}` as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${user.username}:${user.password}`).toString("base64")}`,
    },
    // OBP expects args array with specific stringified JSON entries for some methods.
    body: JSON.stringify({
      chaincode: BC_CHAINCODE_NAME,
      args,
      timeout: 6000,
      sync: true,
      // ...(kind === "tx" ? { sameOrgEndorser: opts?.sameOrgEndorser ?? true, endorsers: opts?.endorsers } : {}),
    }),
    cache: "no-store",
  });

  

  const text = await res.text();
  let data: ObpEnvelope;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Even if HTTP is not ok, OBP returns returnCode/error.
  if (!res.ok && (data?.returnCode !== "Success")) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return normalizeObpPayload<T>(data);
}
