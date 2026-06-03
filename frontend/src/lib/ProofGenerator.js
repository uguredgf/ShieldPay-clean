/* global BigInt */
import { buildPoseidon } from "circomlibjs";
import { hasSppCircuitWasm } from "./circuitAssets";

export async function generateCommitmentHash(secret, amount) {
  const poseidon = await buildPoseidon();

  if (secret == null || secret === "") throw new Error("Secret cannot be empty.");

  const amountStr = amount == null || amount === "" ? "0" : String(amount);
  const amountNum = Number(amountStr);
  if (isNaN(amountNum)) throw new Error(`Invalid amount: ${amountStr}`);

  const secretBigInt =
    typeof secret === "string" ? BigInt(`0x${Buffer.from(secret).toString("hex")}`) : BigInt(secret);
  const amountBigInt = BigInt(Math.round(amountNum));

  const hash = poseidon([secretBigInt, amountBigInt]);
  return poseidon.F.toString(hash);
}

export async function generateNullifierHash(secret) {
  const poseidon = await buildPoseidon();
  const secretBigInt =
    typeof secret === "string" ? BigInt(`0x${Buffer.from(secret).toString("hex")}`) : BigInt(secret);
  const hash = poseidon([secretBigInt, BigInt(1)]);
  return poseidon.F.toString(hash);
}

function buildDemoProof(commitment, secret, amount) {
  return {
    protocol: "shieldpay-demo",
    commitment,
    secret: String(secret),
    amount: String(amount),
    generatedAt: new Date().toISOString(),
  };
}

export async function generateDepositProof(inputs) {
  if (inputs.secret == null || inputs.secret === "") {
    throw new Error("A secret is required.");
  }
  if (inputs.amount == null || inputs.amount === "") {
    throw new Error("An amount is required. Check the CSV columns.");
  }

  const commitment = await generateCommitmentHash(inputs.secret, inputs.amount);
  const wasmReady = await hasSppCircuitWasm();

  if (wasmReady) {
    console.warn(
      "[ShieldPay] policy_tx_2_2.wasm found; full Groth16 support still requires SPP prover worker integration."
    );
  }

  const proof = buildDemoProof(commitment, inputs.secret, inputs.amount);
  return {
    proof,
    publicSignals: [commitment],
    commitment,
    mode: "demo",
  };
}

export async function generateWithdrawProof(inputs) {
  if (inputs.secret == null || inputs.amount == null || inputs.nullifier == null) {
    throw new Error("Withdrawal requires a secret, amount, and nullifier.");
  }

  const commitment = await generateCommitmentHash(inputs.secret, inputs.amount);
  const proof = buildDemoProof(commitment, inputs.secret, inputs.amount);
  proof.nullifier = String(inputs.nullifier);
  proof.merkleProof = inputs.merkleProof || [];

  return {
    proof,
    publicSignals: [commitment, inputs.nullifier],
    mode: "demo",
  };
}

export function proofToBytes(proof) {
  return Buffer.from(JSON.stringify(proof)).toString("base64");
}

export function publicSignalsToBytes(publicSignals) {
  return Buffer.from(JSON.stringify(publicSignals)).toString("base64");
}

export async function generatePayrollProof(rows) {
  const batch = [];
  for (const row of rows) {
    const secret = Math.random().toString(36).substring(2, 10);
    const amount = String(row.amount);
    const result = await generateDepositProof({ secret, amount });
    batch.push({
      name: row.name,
      address: row.address,
      amount: row.amount,
      secret,
      commitment: result.commitment,
      proof: result.proof,
      publicSignals: result.publicSignals,
      mode: result.mode,
    });
  }
  return {
    batch,
    generatedAt: new Date().toISOString(),
    count: batch.length,
  };
}
