/* global BigInt */
/** Poseidon / field element string → 32-byte Buffer for Soroban Bytes */
export function fieldElementToBytes(fieldStr) {
  const n = BigInt(fieldStr);
  const hex = n.toString(16).padStart(64, "0");
  return Buffer.from(hex.slice(-64), "hex");
}

export function utf8ToBytes(text) {
  return Buffer.from(String(text), "utf-8");
}
