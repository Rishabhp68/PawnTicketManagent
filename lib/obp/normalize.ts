/*
OBP (Oracle Blockchain Platform) response normalization.
Rules (per prompt):
- If returnCode !== 'Success' => treat as error even if HTTP 200.
- If result.payload exists => payload may include valueJson/value fields.
*/

export type ObpEnvelope<T = unknown> = {
  returnCode?: string;
  error?: string;
  result?: {
    payload?: any;
    txid?: string;
    encode?: string;
  };
};

export function normalizeObpPayload<T = any>(data: ObpEnvelope): T {
  if (data?.returnCode && data.returnCode !== "Success") {
    const msg = data.error || "OBP call failed";
    throw new Error(msg);
  }

  const result = data?.result;
  if (!result) return data as unknown as T;

  const payload = (result as any).payload;
  if (payload === undefined) return (result as unknown) as T;

  const decodeEntry = (entry: any) => {
    if (entry && typeof entry === "object") {
      if (entry.valueJson) {
        try {
          return JSON.parse(entry.valueJson);
        } catch {
          return entry.valueJson;
        }
      }
      if (entry.value !== undefined) {
        const v = entry.value;
        if (typeof v === "string") {
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        }
        return v;
      }
    }
    return entry;
  };

  if (Array.isArray(payload)) return payload.map(decodeEntry) as T;
  return decodeEntry(payload) as T;
}
