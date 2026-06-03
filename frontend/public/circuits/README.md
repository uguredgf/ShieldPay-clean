# ZK circuit artifacts

`snarkjs` **cannot** load `policy_tx_2_2_proving_key.bin` from Nethermind SPP — that file is **arkworks** format, not a `.zkey`.

For full Groth16 in the browser, use the upstream app prover:

1. Build circuits in `stellar-private-payments`:
   ```bash
   cargo build -p circuits --release
   ```
2. Copy into this folder:
   - `policy_tx_2_2.wasm`
   - `policy_tx_2_2.r1cs`
   - `policy_tx_2_2_proving_key.bin` (from `deployments/testnet/circuit_keys/`)

Until the Rust prover worker is wired into ShieldPay, the UI uses **Poseidon commitment + demo proof** (no WASM compile step).
