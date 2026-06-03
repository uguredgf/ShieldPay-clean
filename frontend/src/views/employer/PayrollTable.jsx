import { motion } from "framer-motion";
import { Plus, RotateCcw, Trash2 } from "lucide-react";

function BaseInput({ value, onChange, placeholder, className = "", type = "text", align = "left" }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={`w-full rounded-2xl border border-[color:var(--line)] bg-white px-3.5 py-3 text-sm text-[color:var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] outline-none transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    />
  );
}

export default function PayrollTable({
  rows,
  total,
  onReset,
  isCustom,
  onAddRow,
  onRowChange,
  onRemoveRow,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="surface-card overflow-hidden rounded-[30px]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--line)] px-5 py-5 md:px-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Batch editor</div>
          <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
            Edit rows, close gaps, and track the total instantly
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isCustom && (
            <button
              data-testid="reset-rows-btn"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:border-slate-300"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to seed
            </button>
          )}
          <button
            data-testid="add-row-btn"
            onClick={onAddRow}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(23,183,156,0.24)] transition hover:translate-y-[-1px]"
          >
            <Plus className="h-4 w-4" />
            Add row
          </button>
        </div>
      </div>

      <div className="block border-b border-[color:var(--line)] px-5 py-4 md:hidden">
        <div className="grid gap-3">
          {rows.map((row, index) => (
            <div key={`${row.name}-${index}`} className="rounded-[24px] border border-[color:var(--line)] bg-white/80 p-4 shadow-soft">
              <div className="grid gap-3">
                <BaseInput
                  value={row.name}
                  onChange={(event) => onRowChange(index, "name", event.target.value)}
                  placeholder="Employee name"
                />
                <BaseInput
                  value={row.address}
                  onChange={(event) => onRowChange(index, "address", event.target.value)}
                  placeholder="Stellar address"
                  className="font-mono text-xs"
                />
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_52px] gap-3">
                  <BaseInput
                    value={row.dept || ""}
                    onChange={(event) => onRowChange(index, "dept", event.target.value)}
                    placeholder="Department"
                  />
                  <BaseInput
                    value={row.amount}
                    onChange={(event) => onRowChange(index, "amount", event.target.value)}
                    placeholder="0"
                    type="number"
                    align="right"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveRow(index)}
                    className="flex items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600"
                    aria-label="Delete row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table data-testid="payroll-table" className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Stellar address</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.name}-${index}`} className="border-t border-[color:var(--line)] align-top">
                <td className="px-6 py-4">
                  <BaseInput
                    value={row.name}
                    onChange={(event) => onRowChange(index, "name", event.target.value)}
                    placeholder="Employee name"
                  />
                </td>
                <td className="px-6 py-4">
                  <BaseInput
                    value={row.address}
                    onChange={(event) => onRowChange(index, "address", event.target.value)}
                    placeholder="G..."
                    className="font-mono text-xs"
                  />
                </td>
                <td className="px-6 py-4">
                  <BaseInput
                    value={row.dept || ""}
                    onChange={(event) => onRowChange(index, "dept", event.target.value)}
                    placeholder="Department"
                  />
                </td>
                <td className="px-6 py-4">
                  <BaseInput
                    value={row.amount}
                    onChange={(event) => onRowChange(index, "amount", event.target.value)}
                    placeholder="0"
                    type="number"
                    align="right"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(index)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t border-[color:var(--line-strong)] bg-slate-50/80">
              <td className="px-6 py-4 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]" colSpan={3}>
                Encrypted total
              </td>
              <td className="px-6 py-4 text-right font-display text-xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
