/* eslint-disable no-undef */
import { buildPoseidon } from "circomlibjs";

let poseidon = null;

async function getPoseidon() {
  if (!poseidon) {
    poseidon = await buildPoseidon();
  }
  return poseidon;
}

// Commitment üret: Poseidon(secret, amount)
export async function generateCommitment(secret, amount) {
  const p = await getPoseidon();
  const hash = p([BigInt(secret), BigInt(amount)]);
  return p.F.toString(hash);
}

// Nullifier üret: Poseidon(secret, 0)
export async function generateNullifier(secret) {
  const p = await getPoseidon();
  const hash = p([BigInt(secret), BigInt(0)]);
  return p.F.toString(hash);
}

// Rastgele secret üret
export function generateSecret() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return BigInt("0x" + Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join(""));
}