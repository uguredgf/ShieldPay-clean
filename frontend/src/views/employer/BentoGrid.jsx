import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  GripVertical,
  LockKeyhole,
  Sparkles,
  Users,
} from "lucide-react";
import { usePersistedState } from "@/lib/usePersistedState";

const DEFAULT_ORDER = ["batch", "payout", "privacy", "coverage"];

function reorder(list, draggedId, targetId) {
  const next = list.filter((item) => item !== draggedId);
  const targetIndex = next.indexOf(targetId);
  next.splice(targetIndex, 0, draggedId);
  return next;
}

function WidgetCard({ widget, onDragStart, onDrop, onDragOver }) {
  const Icon = widget.icon;

  return (
    <motion.article
      layout
      draggable
      onDragStart={() => onDragStart(widget.id)}
      onDrop={() => onDrop(widget.id)}
      onDragOver={onDragOver}
      whileHover={{ y: -4, rotateX: 1.2, rotateY: -1.8 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={`group relative overflow-hidden rounded-[30px] border border-[color:var(--line)] bg-white/88 p-5 shadow-soft ${
        widget.featured ? "md:col-span-2 md:min-h-[220px]" : "min-h-[220px]"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(23,183,156,0.14),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[color:var(--brand)]">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
            <span>{widget.badge}</span>
            <GripVertical className="h-4 w-4 text-slate-300" />
          </div>
        </div>
        <div className="mt-5">
          <div className="font-display text-xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
            {widget.title}
          </div>
          <div className="mt-3 font-display text-[2rem] font-bold tracking-[-0.05em] text-[color:var(--text)]">
            {widget.value}
          </div>
          {widget.subValue && (
            <div className="mt-2 text-sm font-medium text-slate-700">{widget.subValue}</div>
          )}
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{widget.description}</p>
        </div>
        {widget.extra && <div className="mt-auto pt-5">{widget.extra}</div>}
      </div>
    </motion.article>
  );
}

export default function BentoGrid({ rows, total, sourceLabel = "seed", tx }) {
  const [order, setOrder] = usePersistedState("shieldpay:employer:widget-order", DEFAULT_ORDER);
  const [draggedId, setDraggedId] = useState(null);

  const validAddressCount = useMemo(
    () => rows.filter((row) => typeof row.address === "string" && row.address.trim().startsWith("G")).length,
    [rows]
  );
  const uniqueDepartments = useMemo(
    () => Array.from(new Set(rows.map((row) => row.dept || row.department || "").filter(Boolean))),
    [rows]
  );

  const widgets = useMemo(() => {
    const map = {
      batch: {
        id: "batch",
        icon: Users,
        badge: "Batch",
        title: "Batch overview",
        value: `${rows.length} employees`,
        subValue: sourceLabel === "seed" ? "Seed data ready" : `Loaded from ${sourceLabel}`,
        description: "See batch size, source, and distribution readiness at a glance.",
        featured: true,
        extra: (
          <div className="grid grid-cols-3 gap-2">
            {rows.slice(0, 3).map((row) => (
              <div key={`${row.name}-${row.address}`} className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="truncate text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">{row.name}</div>
                <div className="mt-2 text-sm font-semibold text-[color:var(--text)]">
                  ${Number(row.amount || 0).toLocaleString("en-US")}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      payout: {
        id: "payout",
        icon: CircleDollarSign,
        badge: "Payout",
        title: "Total payout",
        value: `$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subValue: `Average: $${rows.length ? (total / rows.length).toFixed(0) : "0"}`,
        description: "Understand total liability and approximate per-employee distribution volume instantly.",
      },
      privacy: {
        id: "privacy",
        icon: LockKeyhole,
        badge: "Privacy",
        title: "Proof / secret status",
        value: tx?.receipts?.length ? "Secrets ready" : "Awaiting proof",
        subValue: tx?.txHash ? tx.txHash : "No submission yet",
        description: "Shows whether the batch is ready for employee distribution and whether submission has completed.",
        extra: (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            {tx?.receipts?.length
              ? "Submission completed. Employee secrets are now ready for the claim flow."
              : "Once the proof is generated, employee secrets will appear here ready for distribution."}
          </div>
        ),
      },
      coverage: {
        id: "coverage",
        icon: BriefcaseBusiness,
        badge: "Coverage",
        title: "Quality and coverage",
        value: `${validAddressCount}/${rows.length || 0} addresses`,
        subValue: `${uniqueDepartments.length} departments`,
        description: "Summarizes rough address validity and how many operating groups the batch covers.",
        extra: (
          <div className="flex flex-wrap gap-2">
            {uniqueDepartments.slice(0, 4).map((department) => (
              <span key={department} className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                {department}
              </span>
            ))}
            {uniqueDepartments.length === 0 && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                No departments
              </span>
            )}
          </div>
        ),
      },
    };

    return order.filter((id) => map[id]).map((id) => map[id]);
  }, [order, rows, sourceLabel, total, tx, validAddressCount, uniqueDepartments]);

  const handleDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    setOrder((current) => reorder(current, draggedId, targetId));
    setDraggedId(null);
  };

  return (
    <section data-testid="employer-bento" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Customizable overview</div>
          <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
            Drag KPI cards to match your operational priorities
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)] shadow-soft">
          <Sparkles className="h-3.5 w-3.5" />
          Draggable widgets
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onDragStart={setDraggedId}
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
          />
        ))}
      </div>

      <div className="rounded-[26px] border border-[color:var(--line)] bg-white/75 px-5 py-4 shadow-soft">
        <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--muted)]">
          <BadgeCheck className="mt-1 h-4.5 w-4.5 shrink-0 text-[color:var(--brand)]" />
          <span>
            Use this overview to monitor payroll quality, proof readiness, and employee distribution from one place.
          </span>
        </div>
      </div>
    </section>
  );
}
