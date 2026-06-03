const STORAGE_KEY = "shieldpay:payroll:batches";

export function savePayrollBatch(receipt) {
  if (!receipt?.receipts?.length) return;
  const batches = loadPayrollBatches();
  const entry = {
    batchId: receipt.txHash,
    submittedAt: receipt.submittedAt || new Date().toISOString(),
    employees: receipt.receipts.map((row) => ({
      name: row.name,
      secret: row.secret,
      amount: row.amount,
      commitment: row.commitment,
      address: row.address,
      note: row.note,
    })),
  };
  const next = [entry, ...batches.filter((batch) => batch.batchId !== entry.batchId)].slice(0, 8);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function loadPayrollBatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function findEmployeeBySecret(secret) {
  const needle = String(secret).trim();
  for (const batch of loadPayrollBatches()) {
    const employee = batch.employees.find((item) => item.secret === needle);
    if (employee) {
      return { ...employee, batchId: batch.batchId };
    }
  }
  return null;
}

export function interpretSecretInput(input) {
  const trimmed = String(input).trim();
  if (!trimmed) {
    return { kind: "empty" };
  }

  if (trimmed.startsWith("demo-") || /^[a-f0-9]{10,}$/i.test(trimmed)) {
    const batch = loadPayrollBatches().find(
      (item) =>
        item.batchId === trimmed ||
        item.batchId === `demo-${trimmed}` ||
        item.batchId.endsWith(trimmed)
    );

    if (batch) {
      return {
        kind: "batch_tx",
        batch,
        message:
          "This value is the batch transaction summary, not an employee secret. Choose a secret below or copy one from the Employer flow.",
      };
    }

    return {
      kind: "maybe_tx",
      message:
        "This looks like a transaction hash, not an employee secret. Use the short secret shown after payroll submission in the Employer flow, for example k7x2m9p1.",
    };
  }

  const employee = findEmployeeBySecret(trimmed);
  if (employee) {
    return { kind: "ok", employee };
  }

  return {
    kind: "unknown",
    secret: trimmed,
    message:
      "This secret does not exist in the saved batch. Use a valid employer-issued secret to continue with withdrawal.",
  };
}

export function listEmployeesForPicker() {
  const out = [];
  for (const batch of loadPayrollBatches()) {
    for (const employee of batch.employees) {
      out.push({ ...employee, batchId: batch.batchId });
    }
  }
  return out;
}
