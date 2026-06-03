import { useRef, useState } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import EmployerView from "@/views/EmployerView";
import EmployeeView from "@/views/EmployeeView";
import RegulatorView from "@/views/RegulatorView";

const VIEWS = [
  {
    id: "employer",
    label: "Employer",
    icon: Building2,
    sub: "Payroll operations",
    kicker: "Prepare batch",
    description: "Import the payroll list, review totals, and prepare protected distribution.",
    testid: "nav-employer",
  },
  {
    id: "employee",
    label: "Employee",
    icon: UserRound,
    sub: "Private salary claim",
    kicker: "Claim funds",
    description: "Use the employee secret, confirm the claim, and track withdrawal status clearly.",
    testid: "nav-employee",
  },
  {
    id: "regulator",
    label: "Regulator",
    icon: ShieldCheck,
    sub: "Policy oversight",
    kicker: "Verify policy",
    description: "Review allow and block decisions with a visible evidence trail.",
    testid: "nav-regulator",
  },
];

const FLOW = [
  {
    id: 1,
    roleId: "employer",
    title: "Employer prepares the batch",
    detail: "Payroll rows are imported, checked, and turned into one protected run.",
  },
  {
    id: 2,
    roleId: "employee",
    title: "Employee claims privately",
    detail: "A valid employee secret unlocks the withdrawal flow without exposing salary details.",
  },
  {
    id: 3,
    roleId: "regulator",
    title: "Regulator verifies policy",
    detail: "Allow and block actions remain traceable alongside the audit timeline.",
  },
];

const TRUST_PILLARS = [
  {
    title: "Protected payroll operations",
    detail: "Sensitive salary details stay out of the main workflow while teams still move quickly.",
  },
  {
    title: "Clear action for each role",
    detail: "Employers, employees, and regulators each get a focused screen instead of a generic dashboard.",
  },
  {
    title: "Visible compliance controls",
    detail: "Policy decisions and their history remain easy to review when it matters.",
  },
];

const ROLE_ACTIONS = {
  employer: "Import payroll data, review the batch, and prepare employee distribution.",
  employee: "Confirm the employee secret, then complete the withdrawal with confidence.",
  regulator: "Review policy status and keep the compliance record easy to inspect.",
};

const ROLE_AMBIENCE = {
  employer: {
    orbA: "radial-gradient(circle, rgba(23,183,156,0.22) 0%, rgba(23,183,156,0) 72%)",
    orbB: "radial-gradient(circle, rgba(90,168,244,0.14) 0%, rgba(90,168,244,0) 70%)",
  },
  employee: {
    orbA: "radial-gradient(circle, rgba(90,168,244,0.2) 0%, rgba(90,168,244,0) 72%)",
    orbB: "radial-gradient(circle, rgba(201,212,255,0.22) 0%, rgba(201,212,255,0) 72%)",
  },
  regulator: {
    orbA: "radial-gradient(circle, rgba(23,183,156,0.16) 0%, rgba(23,183,156,0) 72%)",
    orbB: "radial-gradient(circle, rgba(18,32,43,0.12) 0%, rgba(18,32,43,0) 72%)",
  },
};

function getCurrentStep(roleId) {
  return FLOW.find((step) => step.roleId === roleId) || FLOW[0];
}

function Sidebar({ active, onChange }) {
  return (
    <aside className="hidden xl:flex xl:w-[276px] 2xl:w-[304px] shrink-0 flex-col sticky top-0 h-screen border-r border-[color:var(--line)] bg-white/55 backdrop-blur-2xl">
      <div className="px-6 py-8 border-b border-[color:var(--line)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1eb49f_0%,#8fd5ff_100%)] text-white shadow-[0_18px_44px_rgba(23,183,156,0.26)]">
            <ShieldHalf className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-display text-[1.65rem] font-bold tracking-[-0.04em] text-[color:var(--text)]">
              ShieldPay
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
              Private Payroll Workspace
            </div>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
          One product flow for payroll teams, employees, and compliance reviewers.
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-3">
        {VIEWS.map((view) => {
          const Icon = view.icon;
          const isActive = active === view.id;

          return (
            <button
              key={view.id}
              data-testid={view.testid}
              onClick={() => onChange(view.id)}
              className={`group relative w-full overflow-hidden rounded-[28px] border p-4 text-left transition-all duration-300 ${
                isActive
                  ? "border-emerald-200 bg-white shadow-premium"
                  : "border-transparent bg-white/45 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#17B79C_0%,#8FD5FF_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                    isActive
                      ? "border-emerald-100 bg-emerald-50 text-[color:var(--brand)]"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-display text-lg font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                        {view.label}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                        {view.kicker}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]"
                      >
                        Active
                      </motion.div>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{view.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">Environment</div>
              <div className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                Stellar Testnet
              </div>
            </div>
            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(47,179,111,0.14)]" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">Network</div>
              <div className="mt-1 font-medium text-[color:var(--text)]">Testnet</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)]">Wallet</div>
              <div className="mt-1 font-medium text-[color:var(--text)]">Freighter</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileTabs({ active, onChange }) {
  return (
    <div className="xl:hidden sticky top-0 z-30 border-b border-[color:var(--line)] bg-[rgba(246,247,242,0.88)] backdrop-blur-2xl">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-bold tracking-[-0.04em] text-[color:var(--text)]">
            ShieldPay
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-[color:var(--muted)]">
            Private Payroll Workspace
          </div>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[color:var(--brand)] shadow-soft">
          Testnet
        </span>
      </div>
      <div className="px-3 pb-3 grid grid-cols-3 gap-2">
        {VIEWS.map((view) => {
          const Icon = view.icon;
          const isActive = active === view.id;

          return (
            <button
              key={view.id}
              data-testid={`${view.testid}-mobile`}
              onClick={() => onChange(view.id)}
              className={`relative rounded-[22px] px-3 py-3.5 text-center transition-all ${
                isActive ? "bg-white text-[color:var(--text)] shadow-soft" : "bg-white/50 text-slate-500"
              }`}
            >
              <Icon className="mx-auto h-4.5 w-4.5" strokeWidth={1.8} />
              <div className="mt-2 font-display text-sm font-medium">{view.label}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">{view.kicker}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LifecycleRail({ active }) {
  const activeStep = getCurrentStep(active);

  return (
    <div className="space-y-5">
      <div className="surface-card rounded-[28px] p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--muted)]">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          Shared lifecycle
        </div>
        <div className="mt-4 space-y-4">
          {FLOW.map((step) => {
            const stepActive = step.roleId === active;
            const doneStep = step.id < activeStep.id;

            return (
              <div key={step.id} className="relative pl-11">
                <div
                  className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    doneStep
                      ? "border-emerald-200 bg-emerald-50 text-[color:var(--brand)]"
                      : stepActive
                      ? "border-sky-200 bg-sky-50 text-sky-600"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {doneStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
                </div>
                {step.id !== FLOW.length && (
                  <div className="absolute left-[13px] top-8 h-[calc(100%+8px)] w-px bg-[linear-gradient(180deg,rgba(90,108,118,0.18)_0%,rgba(90,108,118,0.04)_100%)]" />
                )}
                <div className={stepActive ? "text-[color:var(--text)]" : "text-slate-700"}>
                  <div className="font-display text-base font-semibold tracking-[-0.02em]">{step.title}</div>
                  <div className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="surface-card rounded-[28px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--muted)]">Current role</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
              {activeStep.title}
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{activeStep.detail}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-[color:var(--brand)]">
            {activeStep.id}/3
          </span>
        </div>
      </div>
    </div>
  );
}

function FloatingWidgetScene({ active, compact = false }) {
  const containerRef = useRef(null);
  const [positions, setPositions] = useState({
    role: { x: 0, y: 0 },
    signal: { x: 0, y: 0 },
    network: { x: 0, y: 0 },
  });
  const [zOrder, setZOrder] = useState({
    role: 3,
    signal: 2,
    network: 1,
  });

  const currentView = VIEWS.find((view) => view.id === active) || VIEWS[0];
  const activeStep = getCurrentStep(active);
  const cards = [
    {
      id: "role",
      title: currentView.label,
      subtitle: currentView.sub,
      tone: "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(232,247,242,0.92))]",
      rotate: -4,
      icon: currentView.icon,
      float: { y: [0, -7, 0], x: [0, 3, 0], rotate: [-4, -2, -4] },
    },
    {
      id: "signal",
      title: activeStep.title,
      subtitle: "Current product stage",
      tone: "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,244,255,0.92))]",
      rotate: 5,
      icon: Sparkles,
      float: { y: [0, 9, 0], x: [0, -5, 0], rotate: [5, 7, 5] },
    },
    {
      id: "network",
      title: "Stellar Testnet",
      subtitle: "Freighter supported",
      tone: "bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(245,248,255,0.94))]",
      rotate: -2,
      icon: WalletCards,
      float: { y: [0, -5, 0], x: [0, 6, 0], rotate: [-2, 0, -2] },
    },
  ];

  const heightClass = compact ? "h-[300px]" : "h-[360px]";
  const baseClasses = compact
    ? {
        role: "left-[10%] top-[8%] w-[68%]",
        signal: "right-[6%] top-[36%] w-[56%]",
        network: "left-[18%] bottom-[6%] w-[52%]",
      }
    : {
        role: "left-[8%] top-[10%] w-[66%]",
        signal: "right-[4%] top-[34%] w-[54%]",
        network: "left-[18%] bottom-[8%] w-[48%]",
      };

  const bringToFront = (cardId) => {
    const nextTop = Math.max(...Object.values(zOrder)) + 1;
    setZOrder((current) => ({
      ...current,
      [cardId]: nextTop,
    }));
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(255,255,255,0.5))] p-5 shadow-premium backdrop-blur-2xl ${heightClass}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_58%)]" />
      <div className="absolute left-[10%] top-[12%] h-24 w-24 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="absolute bottom-[8%] right-[8%] h-28 w-28 rounded-full bg-sky-100/70 blur-3xl" />

      <div className="relative h-full">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              drag
              dragConstraints={containerRef}
              dragElastic={0.12}
              dragMomentum={false}
              style={{
                x: positions[card.id].x,
                y: positions[card.id].y,
                zIndex: zOrder[card.id],
                rotate: card.rotate,
                cursor: "grab",
              }}
              onPointerDown={() => bringToFront(card.id)}
              onDragStart={() => bringToFront(card.id)}
              onDragEnd={(_, info) => {
                setPositions((current) => ({
                  ...current,
                  [card.id]: {
                    x: current[card.id].x + info.offset.x,
                    y: current[card.id].y + info.offset.y,
                  },
                }));
              }}
              whileDrag={{ scale: 1.03, zIndex: 20, cursor: "grabbing" }}
              whileHover={{ scale: 1.02 }}
              className={`absolute ${baseClasses[card.id]}`}
            >
              <motion.div
                animate={{
                  x: card.float.x,
                  y: card.float.y,
                  rotate: card.float.rotate,
                }}
                transition={{
                  duration: 6.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: card.id === "signal" ? 0.5 : card.id === "network" ? 1 : 0,
                }}
                className={`rounded-[28px] border border-white/85 ${card.tone} p-5 shadow-[0_18px_40px_rgba(18,32,43,0.1)]`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[color:var(--brand)] shadow-soft">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="font-display text-lg font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                      {card.title}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                      {card.subtitle}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function HeroSection({ currentView, active }) {
  return (
    <section className="surface-glass rounded-[34px] px-5 py-6 md:px-7 md:py-7 xl:px-8 xl:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)] shadow-soft">
            <WalletCards className="h-3.5 w-3.5" />
            {currentView.kicker}
          </div>
          <h1 className="mt-5 font-display text-[2.35rem] font-bold leading-[1.02] tracking-[-0.055em] text-[color:var(--text)] md:text-[3rem] xl:text-[3.55rem]">
            Private payroll in one calm, secure workflow.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)] md:text-lg">
            ShieldPay brings payroll preparation, employee claims, and policy review into one product experience that
            feels clear, trustworthy, and easy to follow.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: "Network", value: "Stellar Testnet" },
              { label: "Wallet", value: "Freighter" },
              { label: "Current role", value: currentView.label },
            ].map((item) => (
              <div key={item.label} className="rounded-full border border-white/80 bg-white/72 px-4 py-2.5 shadow-soft">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">{item.label}</div>
                <div className="mt-1 font-display text-sm font-semibold tracking-[-0.02em] text-[color:var(--text)]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <FloatingWidgetScene active={active} />
          <div className="rounded-[28px] border border-[color:var(--line)] bg-white/75 p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Current focus</div>
                <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
                  {currentView.label}
                </div>
                <p className="mt-3 max-w-md text-sm leading-7 text-[color:var(--muted)]">{ROLE_ACTIONS[currentView.id]}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                Live preview
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowSection({ active, onStepSelect }) {
  const activeStep = getCurrentStep(active);

  return (
    <section className="mt-6 surface-card rounded-[34px] px-5 py-6 md:px-7 md:py-7 xl:px-8 xl:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
            <Sparkles className="h-3.5 w-3.5" />
            How it works
          </div>
          <h2 className="mt-4 font-display text-[1.9rem] font-semibold tracking-[-0.05em] text-[color:var(--text)] md:text-[2.35rem]">
            Three roles, one payroll cycle.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
            Move between the employer, employee, and regulator views to see how the product stays consistent across the
            full payroll journey.
          </p>
        </div>

        <div className="rounded-[24px] border border-[color:var(--line)] bg-white/74 px-4 py-4 shadow-soft lg:max-w-[320px]">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Selected role</div>
          <div className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">
            {activeStep.title}
          </div>
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{activeStep.detail}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {FLOW.map((step) => {
          const isActive = step.roleId === active;
          const isDone = step.id < activeStep.id;
          const linkedView = VIEWS.find((view) => view.id === step.roleId) || VIEWS[0];

          return (
            <button
              key={step.id}
              onClick={() => onStepSelect(step.roleId)}
              className={`group relative overflow-hidden rounded-[26px] border p-5 text-left transition-all duration-300 ${
                isActive
                  ? "border-sky-200 bg-white shadow-premium"
                  : "border-[color:var(--line)] bg-white/75 hover:-translate-y-1 hover:bg-white hover:shadow-soft"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    isDone
                      ? "bg-emerald-50 text-[color:var(--brand)]"
                      : isActive
                      ? "bg-sky-50 text-sky-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">{linkedView.label}</div>
              </div>
              <div className="mt-4 font-display text-lg font-semibold tracking-[-0.04em] text-[color:var(--text)]">
                {step.title}
              </div>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{step.detail}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CustomerValueSection({ active }) {
  const currentView = VIEWS.find((view) => view.id === active) || VIEWS[0];

  return (
    <section className="mt-6 surface-card rounded-[34px] px-5 py-6 md:px-7 md:py-7 xl:px-8 xl:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] xl:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)] shadow-soft">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Why ShieldPay
          </div>
          <h2 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.05em] text-[color:var(--text)] md:text-[2.4rem]">
            Privacy, clarity, and compliance should work together.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {TRUST_PILLARS.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[color:var(--line)] bg-white/78 p-4 shadow-soft">
                <div className="font-display text-lg font-semibold tracking-[-0.03em] text-[color:var(--text)]">
                  {item.title}
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <FloatingWidgetScene active={active} compact />
          <div className="rounded-[28px] border border-[color:var(--line)] bg-white/75 p-5 shadow-soft">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Role summary</div>
            <div className="mt-3 font-display text-xl font-semibold tracking-[-0.03em] text-[color:var(--text)]">
              {currentView.label}
            </div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{currentView.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingDock({ onJump }) {
  const sections = [
    { id: "hero", label: "Intro", icon: WalletCards },
    { id: "flow", label: "Flow", icon: Sparkles },
    { id: "workspace", label: "Preview", icon: ShieldHalf },
    { id: "value", label: "Value", icon: ArrowUpRight },
  ];

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 xl:block">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/80 bg-white/78 px-3 py-3 shadow-[0_18px_42px_rgba(18,32,43,0.12)] backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onJump(section.id)}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[color:var(--brand)] hover:shadow-soft"
                title={section.label}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState("employer");
  const currentView = VIEWS.find((view) => view.id === active) || VIEWS[0];
  const heroRef = useRef(null);
  const flowRef = useRef(null);
  const workspaceRef = useRef(null);
  const valueRef = useRef(null);
  const ambience = ROLE_AMBIENCE[active] || ROLE_AMBIENCE.employer;

  const sectionRefs = {
    hero: heroRef,
    flow: flowRef,
    workspace: workspaceRef,
    value: valueRef,
  };

  const handleJumpToSection = (sectionId) => {
    const ref = sectionRefs[sectionId];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="App relative min-h-screen overflow-x-hidden bg-[color:var(--canvas)] text-[color:var(--text)]">
      <div className="pointer-events-none fixed inset-0 bg-grid-soft opacity-70" />
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-40" />
      <motion.div
        animate={{ x: active === "employee" ? 40 : active === "regulator" ? -25 : 0, y: active === "regulator" ? 28 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed left-[-10%] top-[-14%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: ambience.orbA }}
      />
      <motion.div
        animate={{ x: active === "employee" ? -30 : active === "regulator" ? 20 : 0, y: active === "employee" ? 22 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed right-[-8%] top-[12%] h-[380px] w-[380px] rounded-full blur-3xl"
        style={{ background: ambience.orbB }}
      />
      <div className="pointer-events-none fixed bottom-[-12%] left-[22%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(201,212,255,0.32)_0%,_rgba(201,212,255,0)_72%)] blur-3xl" />

      <div className="relative flex min-h-screen">
        <Sidebar active={active} onChange={setActive} />

        <main className="min-w-0 flex-1">
          <MobileTabs active={active} onChange={setActive} />
          <FloatingDock onJump={handleJumpToSection} />

          <div className="mx-auto max-w-[1720px] px-5 py-6 md:px-8 md:py-8 xl:px-10">
            <div ref={heroRef}>
              <HeroSection currentView={currentView} active={active} />
            </div>

            <div ref={flowRef}>
              <FlowSection active={active} onStepSelect={setActive} />
            </div>

            <section ref={workspaceRef} className="mt-6">
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-6 min-w-0">
                  <div className="surface-card rounded-[34px] px-5 py-6 md:px-7 md:py-7 xl:px-8 xl:py-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                          <Sparkles className="h-3.5 w-3.5" />
                          Product preview
                        </div>
                        <h2 className="mt-4 font-display text-[2rem] font-semibold tracking-[-0.05em] text-[color:var(--text)] md:text-[2.4rem]">
                          Open the role-specific workspace.
                        </h2>
                        <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                          Explore the actual employer, employee, and regulator screens below without repeated
                          explanations or internal product notes.
                        </p>
                      </div>

                      <div className="rounded-[26px] border border-[color:var(--line)] bg-white/75 px-5 py-4 shadow-soft lg:max-w-[320px]">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">Now previewing</div>
                        <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text)]">
                          {currentView.label}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{currentView.description}</p>
                      </div>
                    </div>
                  </div>

                  <section className="min-w-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {active === "employer" && <EmployerView />}
                        {active === "employee" && <EmployeeView />}
                        {active === "regulator" && <RegulatorView />}
                      </motion.div>
                    </AnimatePresence>
                  </section>
                </div>

                <aside className="hidden 2xl:block">
                  <div className="sticky top-6">
                    <LifecycleRail active={active} />
                  </div>
                </aside>
              </div>
            </section>

            <div ref={valueRef}>
              <CustomerValueSection active={active} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
