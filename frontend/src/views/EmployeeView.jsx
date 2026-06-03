import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  RotateCcw,
  Sparkles,
  WalletCards,
} from "lucide-react";
import {
  generateWithdrawProof,
  generateNullifierHash,
  generateCommitmentHash,
} from "@/lib/ProofGenerator";
import { submitWithdrawal, submitNativeWithdrawal } from "@/lib/StellarClient";
import {
  interpretSecretInput,
  listEmployeesForPicker,
  loadPayrollBatches,
} from "@/lib/payrollSecrets";

const PLACEHOLDERS = [
  "Employer secret code (e.g. k7x2m9p1)",
  "Use the short employee secret",
  "Paste the employee invitation code",
];

function TypewriterPlaceholder({ active }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState("");
  const [forward, setForward] = useState(true);

  useEffect(() => {
    if (active) return;
    const target = PLACEHOLDERS[idx];
    const timeout = setTimeout(() => {
      if (forward) {
        if (shown.length < target.length) {
          setShown(target.slice(0, shown.length + 1));
        } else {
          setTimeout(() => setForward(false), 1200);
        }
      } else if (shown.length > 0) {
        setShown(target.slice(0, shown.length - 1));
      } else {
        setForward(true);
        setIdx((current) => (current + 1) % PLACEHOLDERS.length);
      }
    }, forward ? 60 : 28);

    return () => clearTimeout(timeout);
  }, [active, forward, idx, shown]);

  if (active) return null;

  return (
    <span className="typewriter-caret pointer-events-none select-none font-display text-xl font-light text-slate-400 sm:text-2xl">
      {shown}
    </span>
  );
}

function SecretPicker({ employees, selectedSecret, onSelect }) {
  if (!employees.length) return null;

  const maskSecret = (value) => {
    if (!value) return "";
    if (value.length <= 4) return `${value.slice(0, 1)}***${value.slice(-1)}`;
    return `${value.slice(0, 2)}***${value.slice(-2)}`;
  };

  return (
    <section className="surface-card w-full max-w-4xl rounded-[30px] p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Last payroll</div>
          <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
            Use a saved employee secret from the latest payroll batch
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
          <WalletCards className="h-3.5 w-3.5" />
          Saved secrets
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => {
          const active = selectedSecret === employee.secret;

          return (
            <button
              key={`${employee.secret}-${employee.batchId}`}
              type="button"
              onClick={() => onSelect(employee.secret)}
              className={`rounded-[24px] border px-4 py-4 text-left transition ${
                active
                  ? "border-emerald-200 bg-emerald-50 shadow-soft"
                  : "border-[color:var(--line)] bg-white hover:border-slate-300 hover:shadow-soft"
              }`}
            >
              <div className="font-display text-lg font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                {employee.name}
              </div>
              <div className="mt-2 font-mono text-[12px] text-[color:var(--brand)]">{maskSecret(employee.secret)}</div>
              <div className="mt-3 text-sm text-[color:var(--muted)]">
                ${Number(employee.amount || 0).toLocaleString("en-US")}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function EmployeeView() {
  const [secret, setSecret] = useState("");
  const [matchedEmployee, setMatchedEmployee] = useState(null);
  const [inputHint, setInputHint] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pickerVersion, setPickerVersion] = useState(0);
  const [nullifier, setNullifier] = useState("");
  const [commitment, setCommitment] = useState("");
  const [hashError, setHashError] = useState(null);

  const availableEmployees = useMemo(() => listEmployeesForPicker(), [pickerVersion, secret]);
  const trimmedSecret = secret.trim();
  const interpretation = useMemo(() => interpretSecretInput(trimmedSecret), [trimmedSecret, pickerVersion]);

  const payAmount = (() => {
    const raw = matchedEmployee?.amount;
    if (raw == null || raw === "" || Number.isNaN(Number(raw))) return "0";
    return String(Number(raw));
  })();

  useEffect(() => {
    if (!trimmedSecret) {
      setMatchedEmployee(null);
      setInputHint(null);
      setNullifier("");
      setCommitment("");
      setHashError(null);
      return;
    }

    if (interpretation.kind === "batch_tx" || interpretation.kind === "maybe_tx") {
      setMatchedEmployee(null);
      setInputHint(interpretation.message);
      setNullifier("");
      setCommitment("");
      setHashError(null);
      return;
    }

    if (interpretation.kind === "ok") {
      setMatchedEmployee(interpretation.employee);
      setInputHint(null);
    } else {
      setMatchedEmployee(null);
      setInputHint(interpretation.message);
      setNullifier("");
      setCommitment("");
      setHashError(null);
      return;
    }

    if (trimmedSecret.length < 4) {
      setNullifier("");
      setCommitment("");
      setHashError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const employeeAmount = interpretation.employee?.amount;
        const amount =
          employeeAmount != null && employeeAmount !== "" && !Number.isNaN(Number(employeeAmount))
            ? String(Number(employeeAmount))
            : "0";

        const [generatedNullifier, generatedCommitment] = await Promise.all([
          generateNullifierHash(trimmedSecret),
          generateCommitmentHash(trimmedSecret, amount),
        ]);

        if (!cancelled) {
          setNullifier(generatedNullifier);
          setCommitment(generatedCommitment);
          setHashError(null);
        }
      } catch (error) {
        if (!cancelled) setHashError(error.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trimmedSecret, interpretation]);

  const handleWithdraw = async () => {
    if (!nullifier || withdrawing) return;

    if (interpretation.kind !== "ok") {
      setWithdrawResult({
        ok: false,
        message: "Enter a valid employee secret first. Transaction hashes or unknown values cannot start withdrawal.",
      });
      return;
    }

    setWithdrawing(true);
    setWithdrawResult(null);

    try {
      const zkWithdraw = await generateWithdrawProof({
        secret: trimmedSecret,
        amount: payAmount,
        nullifier,
        merkleProof: [],
      });

      let result;
      try {
        const native = await submitNativeWithdrawal(matchedEmployee?.address);
        result = {
          ok: true,
          demo: false,
          txHash: native.txHash,
          explorerUrl: native.explorerUrl,
          message: `Testnet transaction confirmed. ZK proof generated. TX: ${native.txHash.slice(0, 12)}...`,
        };
      } catch (freighterError) {
        // eslint-disable-next-line no-console
        console.warn("[ShieldPay] Freighter error, falling back to demo mode:", freighterError.message);
        result = await submitWithdrawal(zkWithdraw, { employeeName: matchedEmployee?.name });
      }

      setWithdrawResult(result);
      setPickerVersion((current) => current + 1);
    } catch (error) {
      setWithdrawResult({ ok: false, message: error?.message || "Withdrawal failed." });
    } finally {
      setWithdrawing(false);
    }
  };

  const resetFlow = () => {
    setSecret("");
    setWithdrawResult(null);
    setMatchedEmployee(null);
    setInputHint(null);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(trimmedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const revealed = interpretation.kind === "ok" && !!matchedEmployee && nullifier.length > 0;
  const withdrawDone = withdrawResult?.ok;
  const payrollCount = loadPayrollBatches().length;

  return (
    <div data-testid="employee-view" className="space-y-6">
      <section className="surface-glass rounded-[34px] px-5 py-7 text-center md:px-8 md:py-9">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)] shadow-soft">
            <KeyRound className="h-3.5 w-3.5" />
            Employee withdraw
          </div>
          <h2 className="mt-5 font-display text-[2.1rem] font-bold tracking-[-0.055em] text-[color:var(--text)] md:text-[3.3rem] leading-[1.02]">
            Make salary claims
            <span className="text-gradient-brand"> clear and trustworthy </span>
            for employees.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)] md:text-lg">
            Once the employee secret is verified, the claim flow opens immediately and keeps the next action obvious.
          </p>
        </div>
      </section>

      <SecretPicker
        employees={availableEmployees}
        selectedSecret={secret}
        onSelect={(value) => {
          setSecret(value);
          setWithdrawResult(null);
        }}
      />

      {payrollCount === 0 && (
        <div className="surface-card mx-auto max-w-3xl rounded-[28px] px-5 py-4 text-sm leading-7 text-[color:var(--muted)]">
          No saved payroll batch exists yet. A payroll run must be sent from the Employer flow first.
        </div>
      )}

      <section className="surface-card mx-auto max-w-4xl rounded-[32px] px-5 py-6 md:px-7">
        <div className="flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-[color:var(--brand)]" strokeWidth={1.7} />
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Secret input</div>
          {matchedEmployee && (
            <div className="ml-auto rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              {matchedEmployee.name} - ${Number(matchedEmployee.amount).toLocaleString("en-US")}
            </div>
          )}
        </div>

        <div className="mt-5 relative">
          <input
            data-testid="secret-input"
            value={secret}
            onChange={(event) => {
              setSecret(event.target.value);
              setWithdrawResult(null);
            }}
            autoComplete="off"
            spellCheck={false}
            className="w-full border-0 bg-transparent py-3 font-display text-3xl font-light tracking-tight text-[color:var(--text)] outline-none sm:text-4xl"
            type="text"
          />
          {!secret && (
            <div className="pointer-events-none absolute inset-0 flex items-center py-3">
              <TypewriterPlaceholder active={!!secret} />
            </div>
          )}
          <div className="relative h-[2px] overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#17B79C_0%,#5AA8F4_100%)]"
              animate={{ width: secret ? "100%" : "26%", opacity: secret ? 1 : 0.7 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-4 text-left text-[12px] font-mono leading-6">
          {hashError ? (
            <span className="text-rose-600">{hashError}</span>
          ) : inputHint ? (
            <span className="flex items-start gap-2 text-rose-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {inputHint}
            </span>
          ) : matchedEmployee ? (
            <span className="text-emerald-700">Matched against a saved payroll batch. Valid secret detected.</span>
          ) : (
            <span className="text-[color:var(--muted)]">
              Enter the employee secret from the payroll run. Batch transaction references do not work here.
            </span>
          )}
        </div>
      </section>

      <AnimatePresence>
        {revealed && (
          <motion.section
            data-testid="nullifier-section"
            key="reveal"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="surface-glass mx-auto max-w-4xl rounded-[32px] px-5 py-6 md:px-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Claim details
                </div>
                <div className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
                  Withdrawal details are ready
                </div>
              </div>

              <button
                type="button"
                data-testid="copy-nullifier-btn"
                onClick={copySecret}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft"
              >
                <Copy className="h-4 w-4 text-[color:var(--brand)]" />
                {copied ? "Copied" : "Copy secret"}
              </button>
            </div>

            <div className="mt-6 rounded-[28px] bg-slate-900 px-5 py-5 text-left shadow-premium">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Nullifier hash</div>
              <div
                data-testid="nullifier-hash"
                className="mt-3 break-all font-mono text-sm leading-7 text-emerald-300 md:text-base"
              >
                {nullifier}
              </div>

              <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 md:grid-cols-2">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Commitment</div>
                  <div className="mt-2 break-all font-mono text-[12px] leading-6 text-slate-200">{commitment}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Amount</div>
                  <div className="mt-2 font-mono text-[12px] leading-6 text-slate-200">
                    ${Number(payAmount).toLocaleString()} USDC
                  </div>
                </div>
              </div>
            </div>

            {withdrawResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-5 rounded-[24px] border px-4 py-4 text-sm leading-7 ${
                  withdrawResult.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
                data-testid="withdraw-status"
              >
                {withdrawResult.message}
                {withdrawResult.explorerUrl && (
                  <a
                    href={withdrawResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-[color:var(--brand-blue)] underline"
                  >
                    View in Stellar Explorer
                  </a>
                )}
              </motion.div>
            )}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)]">
                The claim stays readable for the employee while the protected proof data is prepared in the background.
              </p>

              <div className="flex flex-wrap gap-3">
                {withdrawDone && (
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-soft"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New withdrawal
                  </button>
                )}

                <button
                  data-testid="withdraw-btn"
                  type="button"
                  onClick={handleWithdraw}
                  disabled={withdrawing || withdrawDone}
                  className={`inline-flex items-center gap-3 rounded-full px-5 py-3.5 font-display text-sm font-semibold tracking-[-0.02em] transition ${
                    withdrawDone
                      ? "bg-emerald-600 text-white shadow-[0_16px_28px_rgba(47,179,111,0.24)]"
                      : "bg-[linear-gradient(135deg,#17B79C_0%,#5AA8F4_100%)] text-white shadow-[0_16px_28px_rgba(23,183,156,0.24)] hover:translate-y-[-1px]"
                  } disabled:cursor-not-allowed disabled:opacity-75`}
                >
                  {withdrawDone ? (
                    <>
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      Withdrawal complete
                    </>
                  ) : withdrawing ? (
                    <>
                      <motion.span
                        className="h-2.5 w-2.5 rounded-full bg-white"
                        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      Withdraw via ZK
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
