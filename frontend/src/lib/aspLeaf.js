/* global BigInt */
import { StrKey } from "@stellar/stellar-sdk";

/**
 * Demo ASP leaf from a Stellar G-address (not the full SPP Poseidon leaf formula).
 * Sufficient for UI / allowlist smoke tests; production uses WASM deriveAspUserLeaf.
 */
export function addressToDemoLeaf(address) {
  const raw = StrKey.decodeEd25519PublicKey(address);
  return BigInt(`0x${Buffer.from(raw).toString("hex")}`);
}

export function addressToDemoBlockEntry(address) {
  const leaf = addressToDemoLeaf(address);
  return { key: leaf, value: leaf };
}
