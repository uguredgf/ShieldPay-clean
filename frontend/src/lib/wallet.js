import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  signTransaction,
  signAuthEntry,
} from "@stellar/freighter-api";
import { NETWORK } from "../config/contracts";

async function ensureFreighter() {
  const conn = await isConnected();
  if (!conn?.isConnected) {
    throw new Error(
      "Freighter was not found. Install it from https://www.freighter.app/ and switch to testnet."
    );
  }
  const allowed = await isAllowed();
  if (!allowed?.isAllowed) {
    const res = await setAllowed();
    if (res?.error) throw new Error(res.error);
  }
}

export async function connectFreighterWallet() {
  await ensureFreighter();
  const access = await requestAccess();
  if (access?.error) throw new Error(access.error);
  if (!access?.address) throw new Error("Freighter did not return an address.");
  return access.address;
}

export async function getFreighterAddress() {
  await ensureFreighter();
  const res = await getAddress();
  if (res?.error) throw new Error(res.error);
  if (!res?.address) throw new Error("No connected wallet was found.");
  return res.address;
}

export function buildFreighterSigner(address) {
  return {
    signTransaction: async (xdr, opts = {}) =>
      signTransaction(xdr, {
        networkPassphrase: NETWORK.passphrase,
        address,
        ...opts,
      }),
    signAuthEntry: async (entryXdr, opts = {}) =>
      signAuthEntry(entryXdr, {
        networkPassphrase: NETWORK.passphrase,
        address,
        ...opts,
      }),
  };
}
