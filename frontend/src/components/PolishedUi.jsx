import { Goal } from "lucide-react";

export const PageHero = ({
  eyebrow,
  title,
  description,
  icon: Icon = Goal,
  action,
  statLabel,
  statValue
}) => (
  <section className="relative overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,120,87,0.94),rgba(15,23,42,0.96)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:auto,72px_72px]" />
    <div className="absolute -right-10 top-8 h-48 w-48 rounded-full border border-white/15" />
    <div className="absolute right-16 bottom-[-70px] h-44 w-44 rounded-full border border-amber-200/20" />

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold text-emerald-50 ring-1 ring-white/15">
            <Icon className="h-4 w-4 text-amber-300" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl leading-7 text-emerald-50/85">{description}</p>}
      </div>

      {(action || statLabel || statValue) && (
        <div className="flex flex-wrap items-center gap-3">
          {statLabel && (
            <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs font-bold uppercase text-emerald-100">{statLabel}</p>
              <p className="mt-1 text-2xl font-black">{statValue}</p>
            </div>
          )}
          {action}
        </div>
      )}
    </div>
  </section>
);

export const FieldArtwork = ({ title = "Cancha", label = "El Círculo", type = "Fútbol" }) => (
  <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl bg-emerald-900">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(135deg,#064e3b,#10b981_58%,#a3e635)] bg-[size:58px_58px,58px_58px,auto]" />
    <div className="absolute inset-5 rounded-xl border-2 border-white/65" />
    <div className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 bg-white/55" />
    <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/65" />
    <div className="absolute left-5 top-1/2 h-24 w-12 -translate-y-1/2 rounded-r-md border-y-2 border-r-2 border-white/65" />
    <div className="absolute right-5 top-1/2 h-24 w-12 -translate-y-1/2 rounded-l-md border-y-2 border-l-2 border-white/65" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/24 via-transparent to-white/4" />
    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
      <div className="rounded-lg bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
        <p className="text-[11px] font-black uppercase text-emerald-100">{label}</p>
        <p className="text-lg font-black leading-tight">{title}</p>
      </div>
      <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-emerald-700 shadow-sm">
        {type}
      </span>
    </div>
  </div>
);

export const SurfaceCard = ({ children, className = "" }) => (
  <section className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

export const StatusMessage = ({ type = "info", children }) => {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-slate-200 bg-white text-slate-600"
  };

  return <div className={`rounded-lg border p-4 text-sm shadow-sm ${styles[type]}`}>{children}</div>;
};

export const EmptyState = ({ icon: Icon = Goal, title, description, action }) => (
  <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
      <Icon className="h-6 w-6" />
    </div>
    <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
    {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </section>
);
