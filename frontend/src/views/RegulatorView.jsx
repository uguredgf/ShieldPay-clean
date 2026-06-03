import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Ban,
  Check,
  Clock,
  FileDown,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { submitASPAction } from "@/lib/StellarClient";
import { usePersistedState } from "@/lib/usePersistedState";
import { loadPayrollBatches } from "@/lib/payrollSecrets";

const INITIAL_EVENTS = [
  {
    id: 1,
    type: "allow",
    address: "GA7QYNF7...XK3HBFCQR7Z",
    label: "Verified counterparty",
    timestamp: "2 min ago",
    note: "KYC tier 2 completed, clean history, added to the ASP allowlist.",
  },
  {
    id: 2,
    type: "block",
    address: "GDOFAC18...M3LP9KQRZX",
    label: "Sanctioned entity",
    timestamp: "11 min ago",
    note: "Matched against OFAC screening, so withdrawal proofs were rejected at the gateway.",
  },
  {
    id: 3,
    type: "allow",
    address: "GBQ4FX2D...M9NSAPLE3T",
    label: "Audited institution",
    timestamp: "1 hr ago",
    note: "Whitelisted with annual attestation on file.",
  },
];

function TracingBeam({ containerRef }) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 80%", "end 20%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 360, damping: 42 });
  const beamHeight = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const dotY = useTransform(smooth, [0, 1], ["-4px", "calc(100% - 4px)"]);

  return (
    <div className="pointer-events-none absolute left-[18px] top-2 bottom-2 w-[2px]">
      <div className="absolute inset-0 bg-slate-200" />
      <motion.div
        className="absolute left-0 right-0 top-0 origin-top"
        style={{
          height: beamHeight,
          background: "linear-gradient(180deg, rgba(23,183,156,0) 0%, rgba(23,183,156,0.35) 25%, #17B79C 100%)",
        }}
      />
      <motion.span
        className="absolute -left-[5px] h-3 w-3 rounded-full bg-[color:var(--brand)] shadow-[0_0_0_6px_rgba(23,183,156,0.12)]"
        style={{ top: dotY }}
      />
    </div>
  );
}

function TimelineItem({ event, index }) {
  const isAllow = event.type === "allow";

  return (
    <motion.li
      data-testid={`timeline-item-${event.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.05, 0.22) }}
      className="relative pl-14 pb-7 last:pb-0"
    >
      <div className="absolute left-[9px] top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white shadow-soft">
        <div className={`h-3 w-3 rounded-full ${isAllow ? "bg-emerald-500" : "bg-rose-500"}`} />
      </div>
      <div className="rounded-[24px] border border-[color:var(--line)] bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                  isAllow ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {isAllow ? <Check className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                {isAllow ? "Allowed" : "Blocked"}
              </span>
              <span className="font-display text-lg font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                {event.label}
              </span>
            </div>
            <div className="mt-2 break-all font-mono text-[12px] leading-6 text-[color:var(--muted)]">{event.address}</div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            <Clock className="h-3.5 w-3.5" />
            {event.timestamp}
          </div>
        </div>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{event.note}</p>
      </div>
    </motion.li>
  );
}

export default function RegulatorView() {
  const [address, setAddress] = useState("");
  const [events, setEvents, clearEvents] = usePersistedState("shieldpay:regulator:events", INITIAL_EVENTS);
  const [pending, setPending] = useState(null);
  const [actionError, setActionError] = useState(null);
  const timelineRef = useRef(null);

  const payrollAddresses = loadPayrollBatches()
    .flatMap((batch) => batch.employees)
    .filter((employee, index, all) => all.findIndex((item) => item.address === employee.address) === index)
    .filter((employee) => employee.address && employee.address.startsWith("G"));

  const submit = async (type) => {
    const value = address.trim();
    if (!value || pending) return;

    setPending(type);
    setActionError(null);

    try {
      const result = await submitASPAction(type, value);
      const next = {
        id: Date.now(),
        type,
        address: value,
        label: type === "allow" ? "Manual allowlist entry" : "Manual blocklist entry",
        timestamp: "just now",
        note:
          type === "allow"
            ? `ASP membership update - tx ${result?.txHash?.slice(0, 12) || "ok"}...`
            : `ASP non-membership update - tx ${result?.txHash?.slice(0, 12) || "ok"}...`,
      };
      setEvents((current) => [next, ...current]);
      setAddress("");
    } catch (error) {
      setActionError(error?.message || String(error));
    } finally {
      setPending(null);
    }
  };

  const buildChecksum = (input) => {
    let h1 = 0x811c9dc5;
    let h2 = 0xdeadbeef;
    for (let i = 0; i < input.length; i += 1) {
      const code = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 2654435761);
      h2 = Math.imul(h2 ^ code, 1597334677);
    }
    const hex = (value) => (value >>> 0).toString(16).padStart(8, "0");
    let s1 = h1;
    let s2 = h2;
    let out = "";
    for (let i = 0; i < 8; i += 1) {
      s1 = Math.imul(s1 ^ s2, 2246822507);
      s2 = Math.imul(s2 ^ s1, 3266489917);
      out += hex(s1) + hex(s2);
    }
    return `0x${out}`;
  };

  const handleExport = () => {
    const exportedAt = new Date().toISOString();
    const base = {
      app: "ShieldPay",
      type: "asp_compliance_timeline",
      exportedAt,
      count: events.length,
      stats: {
        allowed: events.filter((event) => event.type === "allow").length,
        blocked: events.filter((event) => event.type === "block").length,
      },
      events,
    };
    const payload = { ...base, checksum: buildChecksum(JSON.stringify(base)) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shieldpay_compliance_${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const stats = {
    allowed: events.filter((event) => event.type === "allow").length,
    blocked: events.filter((event) => event.type === "block").length,
  };

  return (
    <div data-testid="regulator-view" className="space-y-6">
      <section className="surface-glass rounded-[34px] px-5 py-7 md:px-8 md:py-9">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)] shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5" />
            Regulator console
          </div>
          <h2 className="mt-5 font-display text-[2.1rem] font-bold tracking-[-0.055em] text-[color:var(--text)] md:text-[3.1rem] leading-[1.02]">
            Keep policy enforcement and the
            <span className="text-gradient-brand"> audit trail </span>
            in the same workspace.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)] md:text-lg">
            Manage allow and block decisions in one clear workspace and keep the policy history easy to review.
          </p>
        </div>
      </section>

      {payrollAddresses.length > 0 && (
        <section className="surface-card rounded-[30px] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Quick address pick</div>
          <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
            Pick a payroll address with one click
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {payrollAddresses.map((employee) => (
              <button
                key={employee.address}
                type="button"
                onClick={() => setAddress(employee.address)}
                className={`rounded-[22px] border px-4 py-3 text-left transition ${
                  address === employee.address
                    ? "border-emerald-200 bg-emerald-50 shadow-soft"
                    : "border-[color:var(--line)] bg-white hover:border-slate-300"
                }`}
              >
                <span className="block font-display text-base font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                  {employee.name}
                </span>
                <span className="mt-1 block font-mono text-[11px] text-[color:var(--brand)]">
                  {employee.address.slice(0, 8)}...{employee.address.slice(-6)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Stellar wallet address</label>
            <div className="mt-3 relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                data-testid="regulator-address-input"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="G... (56 chars)"
                className="w-full rounded-[24px] border border-[color:var(--line)] bg-white py-3.5 pl-11 pr-4 font-mono text-sm text-[color:var(--text)] outline-none transition focus:border-emerald-200 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end gap-3">
            <button
              data-testid="regulator-allow-btn"
              onClick={() => submit("allow")}
              disabled={!address || !!pending}
              className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-emerald-600 px-4 py-3.5 font-display text-sm font-semibold text-white shadow-[0_16px_28px_rgba(47,179,111,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {pending === "allow" ? "Submitting..." : "Allow"}
            </button>
            <button
              data-testid="regulator-block-btn"
              onClick={() => submit("block")}
              disabled={!address || !!pending}
              className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3.5 font-display text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldOff className="h-4 w-4" />
              {pending === "block" ? "Submitting..." : "Block"}
            </button>
          </div>
        </div>

        {actionError && (
          <p className="mt-4 text-sm text-rose-600" data-testid="regulator-error">
            {actionError}
          </p>
        )}

        <div className="mt-6 grid gap-3 border-t border-[color:var(--line)] pt-5 sm:grid-cols-2">
          <div className="rounded-[22px] bg-emerald-50 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-700">Allowlisted</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
              {stats.allowed}
            </div>
          </div>
          <div className="rounded-[22px] bg-rose-50 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-rose-700">Blocklisted</div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
              {stats.blocked}
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[30px] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Compliance timeline</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
              Audit timeline
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {events.length} events
            </div>
            <button
              data-testid="export-timeline-btn"
              onClick={handleExport}
              disabled={events.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileDown className="h-4 w-4 text-[color:var(--brand)]" />
              Export JSON
            </button>
            <button
              data-testid="clear-timeline-btn"
              onClick={clearEvents}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="relative mt-6" data-testid="compliance-timeline" ref={timelineRef}>
          <TracingBeam containerRef={timelineRef} />
          <ul>
            <AnimatePresence initial={false}>
              {events.map((event, index) => (
                <TimelineItem key={event.id} event={event} index={index} />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </section>
    </div>
  );
}
