import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";

import FileDropZone from "@/views/employer/FileDropZone";
import BentoGrid from "@/views/employer/BentoGrid";
import PayrollTable from "@/views/employer/PayrollTable";
import MovingGradientButton from "@/views/employer/MovingGradientButton";
import DemoCsvButton from "@/views/employer/DemoCsvButton";
import { SEED_ROWS } from "@/views/employer/mockRows";

import { parseCSV } from "@/lib/csvParser";
import { generatePayrollProof } from "@/lib/ProofGenerator";
import { submitToSoroban } from "@/lib/StellarClient";
import { savePayrollBatch } from "@/lib/payrollSecrets";
import { usePersistedState } from "@/lib/usePersistedState";
import PayrollSecretsPanel from "@/views/employer/PayrollSecretsPanel";

function detectStage({ rows, sourceLabel, tx }) {
  if (tx?.receipts?.length) return 3;
  if (rows.length > 0 && sourceLabel !== "seed") return 2;
  return 1;
}

function StagePill({ active, index, label, detail }) {
  return (
    <div className="relative rounded-[24px] border border-[color:var(--line)] bg-white/80 px-4 py-4 shadow-soft">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
          active ? "bg-emerald-100 text-[color:var(--brand)]" : "bg-slate-100 text-slate-400"
        }`}
      >
        {index}
      </div>
      <div className="mt-4 font-display text-lg font-semibold tracking-[-0.03em] text-[color:var(--text)]">
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{detail}</p>
    </div>
  );
}

export default function EmployerView() {
  const [rows, setRows] = usePersistedState("shieldpay:employer:rows", SEED_ROWS);
  const [sourceLabel, setSourceLabel] = usePersistedState("shieldpay:employer:source", "seed");
  const [tx, setTx] = usePersistedState("shieldpay:employer:lastTx", null);
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0), [rows]);
  const isCustom = sourceLabel !== "seed";
  const stage = detectStage({ rows, sourceLabel, tx });

  const handleParse = useCallback((text, fileName) => {
    const { rows: parsed, errors } = parseCSV(text);
    if (errors.length && parsed.length === 0) {
      return errors[0];
    }
    setRows(parsed);
    setSourceLabel(fileName);
    setTx(null);
    return null;
  }, [setRows, setSourceLabel, setTx]);

  const handleReset = useCallback(() => {
    setRows(SEED_ROWS);
    setSourceLabel("seed");
    setTx(null);
  }, [setRows, setSourceLabel, setTx]);

  const handleAddRow = useCallback(() => {
    setRows((current) => [
      ...current,
      {
        name: "New employee",
        address: "",
        amount: 0,
        dept: "Operations",
      },
    ]);
  }, [setRows]);

  const handleRowChange = useCallback((index, field, value) => {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (field === "amount") {
          return { ...row, amount: value === "" ? "" : Number(value) };
        }
        return { ...row, [field]: value };
      })
    );
    setTx(null);
  }, [setRows, setTx]);

  const handleRemoveRow = useCallback((index) => {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    setTx(null);
  }, [setRows, setTx]);

  const handleSend = async () => {
    if (loading || rows.length === 0) return;
    setLoading(true);
    setTx(null);
    try {
      const zkBatch = await generatePayrollProof(rows);
      const receipt = await submitToSoroban(zkBatch);
      savePayrollBatch(receipt);
      setTx(receipt);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ShieldPay] proof/submit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="employer-view" className="space-y-6">
      <section className="surface-glass rounded-[34px] px-5 py-6 md:px-7 md:py-7">
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)] shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" />
              Employer console
            </div>
            <h2 className="mt-5 font-display text-[2rem] font-bold tracking-[-0.05em] text-[color:var(--text)] md:text-[2.65rem]">
              Run payroll operations through proof generation in one continuous flow.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
              Import the payroll batch, review employee rows, and prepare protected distribution from one screen.
            </p>
          </div>

          <div className="w-full max-w-[440px] space-y-4">
            {[
              {
                icon: Users2,
                label: "Employees",
                value: rows.length,
                detail: "Active records in the current payroll batch.",
                accent: "from-emerald-100/80 to-white",
              },
              {
                icon: FileSpreadsheet,
                label: "Source",
                value: sourceLabel === "seed" ? "Seed data" : "Imported CSV",
                detail: "The file or dataset currently driving this run.",
                accent: "from-sky-100/70 to-white",
              },
              {
                icon: LockKeyhole,
                label: "Status",
                value: tx ? "Secrets ready" : "Proof prep",
                detail: "Whether secrets are ready to share with employees after proof generation.",
                accent: "from-emerald-100/70 via-white to-sky-50/80",
                badge: tx ? "Ready to distribute" : "Waiting for proof",
                badgeTone: tx ? "bg-emerald-400" : "bg-amber-400",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className={`group relative overflow-hidden rounded-[30px] border border-white/75 bg-gradient-to-br ${item.accent} px-5 py-5 shadow-[0_22px_60px_rgba(18,32,43,0.08)]`}
                >
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/60 to-transparent" />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/80 bg-white/72 text-[color:var(--brand)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                        <Icon className="h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          {item.label}
                        </div>
                        <div className="mt-2 font-display text-[1.85rem] font-semibold leading-tight tracking-[-0.06em] text-[color:var(--text)]">
                          {item.value}
                        </div>
                        {item.badge && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/78 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--brand)] shadow-[0_8px_20px_rgba(23,183,156,0.08)]">
                            <span className={`h-2 w-2 rounded-full ${item.badgeTone}`} />
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--brand)] shadow-[0_8px_18px_rgba(18,32,43,0.04)]">
                        <span className={`h-1.5 w-1.5 rounded-full ${index === 1 ? "bg-sky-400" : "bg-emerald-400"}`} />
                        Live signal
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[color:var(--line)]/70 pt-4 text-sm leading-7 text-[color:var(--muted)]">
                    {item.detail}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="surface-card rounded-[30px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Batch intake</div>
              <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
                Import the CSV, adjust the batch, then generate the proof
              </div>
            </div>
            <DemoCsvButton />
          </div>
          <div className="mt-5">
            <FileDropZone onParse={handleParse} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <StagePill
            active={stage >= 1}
            index={1}
            label="Batch is prepared"
            detail="The CSV is imported, rows are refined, and quality is visible at a glance."
          />
          <StagePill
            active={stage >= 2}
            index={2}
            label="Proof is prepared"
            detail="Totals are reviewed one last time before the batch proof is generated."
          />
          <StagePill
            active={stage >= 3}
            index={3}
            label="Secrets are distributed"
            detail="Each employee gets a separate secret and the claim flow becomes ready."
          />
        </div>
      </section>

      <BentoGrid rows={rows} total={total} sourceLabel={sourceLabel} tx={tx} />

      <PayrollTable
        rows={rows}
        total={total}
        onReset={handleReset}
        onAddRow={handleAddRow}
        onRowChange={handleRowChange}
        onRemoveRow={handleRemoveRow}
        isCustom={isCustom}
      />

      {tx?.receipts?.length > 0 && <PayrollSecretsPanel receipt={tx} onDismiss={() => setTx(null)} />}

      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
              <Sparkles className="h-3.5 w-3.5" />
              Proof submission
            </div>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              After submission, the payroll batch is ready for private employee distribution while sensitive payment
              details stay protected.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <AnimatePresence>
              {tx && (
                <motion.div
                  data-testid="proof-success"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span className="font-medium">Batch submitted</span>
                  <span className="font-mono text-xs text-emerald-600">{tx.txHash}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <MovingGradientButton onClick={handleSend} loading={loading} loadingText="Preparing proof...">
              Send private payroll
              {!loading && <ArrowRight className="h-4 w-4" />}
            </MovingGradientButton>
          </div>
        </div>
      </section>
    </div>
  );
}
