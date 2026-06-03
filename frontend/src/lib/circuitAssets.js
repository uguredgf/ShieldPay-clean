const CIRCUIT_BASE =
  process.env.PUBLIC_URL != null ? `${process.env.PUBLIC_URL}/circuits` : "/circuits";

/** Nethermind SPP uses policy_tx_2_2 — not snarkjs deposit.wasm */
export const SPP_CIRCUIT_WASM = "policy_tx_2_2.wasm";

export function getCircuitBase() {
  return CIRCUIT_BASE;
}

/** True if URL returns real WASM (not index.html 404). */
export async function hasSppCircuitWasm() {
  try {
    const res = await fetch(`${CIRCUIT_BASE}/${SPP_CIRCUIT_WASM}`, { method: "GET" });
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 4) return false;
    const magic = new Uint8Array(buf, 0, 4);
    return (
      magic[0] === 0x00 &&
      magic[1] === 0x61 &&
      magic[2] === 0x73 &&
      magic[3] === 0x6d
    );
  } catch {
    return false;
  }
}
