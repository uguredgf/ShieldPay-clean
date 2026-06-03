// ShieldPay — Testnet Contract ID'leri
// Kaynak: NethermindEth/stellar-private-payments deployments.json

/** Nethermind stellar-private-payments testnet (deployments.json) */
export const CONTRACTS = {
  pool: "CADR52VEDD5CCT2VIRGPEVF7BQ373HDKAK2TIPXQJ33GHPALIPEKOLNR",
  verifier: "CC7NY5R3RVNBCA7T2ZOFHNBKEWKJN54TOP2UB77EETNNATE6CVBR2SFO",
  asp_membership: "CBIUJ2HY7FFWRRGVJ6HWH53EJ2GKLKVCIXWILUGXI7WJEGZFUYDVP4XQ",
  asp_non_membership: "CDV656IUD34VC3YBXYTNPC6IUWJYJPWU25SHLAH5ZRTEXVLDPUNEJ3V4",
};

export const NETWORK = {
  name: "testnet",
  rpcUrl: "https://soroban-testnet.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
  passphrase: "Test SDF Network ; September 2015",
};

export const TOKEN = {
  // Native XLM pool (deployments.json'dan)
  contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
};