import { StrKey } from "@stellar/stellar-sdk";
import * as StellarSdk from "@stellar/stellar-sdk";
import { NETWORK, CONTRACTS } from "../config/contracts";
import { buildFreighterSigner, connectFreighterWallet } from "./wallet";
import { addressToDemoLeaf, addressToDemoBlockEntry } from "./aspLeaf";
import { fieldElementToBytes, utf8ToBytes } from "./fieldBytes";

export const rpc = new StellarSdk.rpc.Server(NETWORK.rpcUrl);
export const horizon = new StellarSdk.Horizon.Server(NETWORK.horizonUrl);

export async function getContractClient(contractId, publicKey, signer) {
  const options = {
    contractId,
    networkPassphrase: NETWORK.passphrase,
    rpcUrl: NETWORK.rpcUrl,
    publicKey,
  };
  if (signer?.signTransaction) {
    options.signTransaction = signer.signTransaction;
    options.signAuthEntry = signer.signAuthEntry;
  }
  return StellarSdk.contract.Client.from(options);
}

export async function getSignedContractClient(contractId, walletAddress) {
  const signer = buildFreighterSigner(walletAddress);
  return getContractClient(contractId, walletAddress, signer);
}

export function hasContractMethod(client, methodName) {
  return client != null && typeof client[methodName] === "function";
}

export async function submitContractCall(tx) {
  const sent = await tx.signAndSend();
  return sent?.sendTransactionResponse?.hash || sent?.hash || sent?.result?.hash || null;
}

function isValidStellarAddress(address) {
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

export async function submitToSoroban(zkBatch) {
  const items = zkBatch?.batch || [];
  const receipts = [];

  for (const item of items) {
    const row = {
      name: item.name,
      address: item.address,
      amount: item.amount,
      secret: item.secret,
      commitment: item.commitment,
      onChain: false,
      txHash: null,
    };

    if (!isValidStellarAddress(item.address)) {
      row.note = "Invalid address. The batch entry was prepared locally but not submitted on-chain.";
      receipts.push(row);
      continue;
    }

    try {
      const preview = await getContractClient(CONTRACTS.pool, item.address);
      if (hasContractMethod(preview, "deposit")) {
        const wallet = await connectFreighterWallet();
        const client = await getSignedContractClient(CONTRACTS.pool, wallet);
        const tx = await client.deposit({
          commitment: fieldElementToBytes(item.commitment),
          amount_encrypted: utf8ToBytes(JSON.stringify({ amount: item.amount, v: 1 })),
        });
        row.txHash = await submitContractCall(tx);
        row.onChain = true;
        row.note = "ShieldPay pool deposit";
      } else if (hasContractMethod(preview, "transact")) {
        row.note = "SPP pool requires transact(). The commitment was recorded, but on-chain submission is still pending.";
      }
    } catch (error) {
      row.note = `Chain: ${error.message}`;
    }

    receipts.push(row);
  }

  const firstTx = receipts.find((receipt) => receipt.txHash)?.txHash;
  return {
    txHash: firstTx || `demo-${Date.now().toString(16)}`,
    receipts,
    submittedAt: new Date().toISOString(),
    isBatchReceipt: !firstTx,
  };
}

export async function submitWithdrawal(zkWithdraw, { employeeName } = {}) {
  if (zkWithdraw?.mode === "demo") {
    return {
      ok: true,
      mode: "demo",
      demo: true,
      employeeName,
      message:
        "Withdrawal preview completed. A ZK proof was generated, but a full on-chain USDC withdrawal still requires Freighter plus pool.transact().",
      proof: zkWithdraw.proof,
      at: new Date().toISOString(),
    };
  }
  return { ok: true, demo: false, ...zkWithdraw };
}

export async function submitASPAction(action, address) {
  if (!StrKey.isValidEd25519PublicKey(address)) {
    throw new Error("Enter a valid Stellar G... address.");
  }

  const wallet = await connectFreighterWallet();

  try {
    if (action === "allow") {
      const client = await getSignedContractClient(CONTRACTS.asp_membership, wallet);
      if (!hasContractMethod(client, "insert_leaf")) {
        throw new Error("asp_membership.insert_leaf could not be found.");
      }
      const tx = await client.insert_leaf({ leaf: addressToDemoLeaf(address) });
      const hash = await submitContractCall(tx);
      return { action, address, txHash: hash, onChain: true };
    }

    if (action === "block") {
      const client = await getSignedContractClient(CONTRACTS.asp_non_membership, wallet);
      if (!hasContractMethod(client, "insert_leaf")) {
        throw new Error("asp_non_membership.insert_leaf could not be found.");
      }
      const { key, value } = addressToDemoBlockEntry(address);
      const tx = await client.insert_leaf({ key, value });
      const hash = await submitContractCall(tx);
      return { action, address, txHash: hash, onChain: true };
    }
  } catch (error) {
    console.warn("[ShieldPay] ASP contract error, falling back to demo mode:", error.message);
    return {
      action,
      address,
      txHash: `demo-asp-${Date.now().toString(16)}`,
      onChain: false,
      demo: true,
      error: error.message,
    };
  }

  throw new Error(`Unknown ASP action: ${action}`);
}

export async function fundTestnetAccount(publicKey) {
  const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
  return response.json();
}

export async function getAccountBalance(publicKey) {
  try {
    const account = await horizon.loadAccount(publicKey);
    return account.balances;
  } catch {
    return null;
  }
}

export async function submitNativeWithdrawal(recipientAddress) {
  const wallet = await connectFreighterWallet();
  const account = await horizon.loadAccount(wallet);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK.passphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination:
          recipientAddress && StellarSdk.StrKey.isValidEd25519PublicKey(recipientAddress)
            ? recipientAddress
            : wallet,
        asset: StellarSdk.Asset.native(),
        amount: "1",
      })
    )
    .setTimeout(30)
    .build();

  const signer = buildFreighterSigner(wallet);
  const signed = await signer.signTransaction(transaction.toXDR());
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signed.signedTxXdr ?? signed, NETWORK.passphrase);
  const result = await horizon.submitTransaction(signedTx);

  return {
    ok: true,
    txHash: result.hash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
  };
}

export { CONTRACTS, NETWORK };
