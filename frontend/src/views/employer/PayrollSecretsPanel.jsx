import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, KeyRound, Send, ShieldCheck } from "lucide-react";

export default function PayrollSecretsPanel({ receipt, onDismiss }) {
  const [copied, setCopied] = useState(null);
  const employees = receipt?.receipts || [];

  const copy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  if (!employees.length) return null;

  return (
    <motion.section
      data-testid="payroll-secrets-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-glass rounded-[32px] px-5 py-6 md:px-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)]">
            <KeyRound className="h-3.5 w-3.5" />
            Secret distribution
          </div>
          <div className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
            Employee secrets are now ready for distribution
          </div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            The batch receipt is only a summary. Each employee must use their own secret in the Employee flow to start
            the claim process.
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-soft"
          >
            Close panel
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {employees.map((employee) => (
          <div
            key={`${employee.secret}-${employee.name}`}
            className="rounded-[28px] border border-[color:var(--line)] bg-white/86 p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                  {employee.name}
                </div>
                <div className="mt-2 font-mono text-[11px] leading-6 text-[color:var(--muted)] break-all">
                  {employee.address}
                </div>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700">
                ${Number(employee.amount || 0).toLocaleString("en-US")}
              </span>
            </div>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Employee secret</div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="rounded-full bg-white px-4 py-2 font-mono text-sm text-[color:var(--brand)] shadow-soft">
                  {employee.secret}
                </code>
                <button
                  type="button"
                  data-testid={`copy-secret-${employee.name}`}
                  onClick={() => copy(employee.secret, employee.name)}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-3.5 py-2 text-sm font-medium text-slate-700"
                >
                  <Copy className="h-4 w-4 text-[color:var(--brand)]" />
                  {copied === employee.name ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-[22px] bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              <span>This secret lets the employee start the proof and withdrawal flow in the Employee workspace.</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-[color:var(--line)] bg-white/86 px-4 py-4 text-sm leading-7 text-[color:var(--muted)] shadow-soft">
        <Send className="mt-1 h-4.5 w-4.5 shrink-0 text-[color:var(--brand)]" />
        <span>
          Next best step: send each secret through a secure channel, then follow the employee claim flow inside the same
          product.
        </span>
      </div>
    </motion.section>
  );
}
