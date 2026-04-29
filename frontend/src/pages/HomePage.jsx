import { CalendarDays, Clock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const FieldPreview = () => (
  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-emerald-900/20 bg-emerald-700 shadow-xl shadow-slate-900/10">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,#047857,#16a34a)] bg-[size:72px_72px,auto]" />
    <div className="absolute inset-8 rounded-lg border-2 border-white/70" />
    <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] w-0.5 -translate-x-1/2 bg-white/60" />
    <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" />
    <div className="absolute left-8 top-1/2 h-40 w-20 -translate-y-1/2 rounded-r-lg border-y-2 border-r-2 border-white/70" />
    <div className="absolute right-8 top-1/2 h-40 w-20 -translate-y-1/2 rounded-l-lg border-y-2 border-l-2 border-white/70" />
    <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3">
      {[
        { label: "Mañana", value: "08-12" },
        { label: "Tarde", value: "13-18" },
        { label: "Noche", value: "19-23" }
      ].map((item) => (
        <div className="rounded-md bg-white/95 p-3 shadow-sm" key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.label}</p>
          <p className="mt-1 text-lg font-black text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const HomePage = () => {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Sistema de reservas
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black leading-tight text-slate-950">
            El Círculo Fútbol
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Reservá canchas por mañana, tarde o noche, gestioná pagos de prueba y administrá la disponibilidad del complejo desde un panel simple.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/canchas"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:bg-emerald-700"
          >
            <CalendarDays className="h-5 w-5" />
            Ver canchas
          </Link>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-emerald-700" />
            3 turnos por día
          </div>
        </div>

        <div className="grid max-w-2xl grid-cols-3 gap-3">
          {[
            { value: "ABM", label: "Usuarios, canchas y reservas" },
            { value: "Roles", label: "Cliente, admin y super admin" },
            { value: "SPA", label: "React con rutas protegidas" }
          ].map((item) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={item.value}>
              <p className="text-2xl font-black text-slate-950">{item.value}</p>
              <p className="mt-2 text-sm leading-5 text-slate-600">{item.label}</p>
            </article>
          ))}
        </div>
      </div>

      <FieldPreview />
    </section>
  );
};
