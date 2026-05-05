import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock3,
  Goal,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UsersRound
} from "lucide-react";
import { Link } from "react-router-dom";

const turnos = [
  { label: "Mañana", detail: "Arranque temprano" },
  { label: "Tarde", detail: "Partido con amigos" },
  { label: "Noche", detail: "Después del trabajo" }
];

const beneficios = [
  {
    icon: CalendarCheck,
    title: "Reserva simple",
    text: "Elegís cancha, día y momento sin llamar ni esperar confirmaciones manuales."
  },
  {
    icon: Goal,
    title: "Canchas para cada partido",
    text: "Fútbol 5, 7 y 11 para organizar desde un reducido hasta un partido completo."
  },
  {
    icon: ShieldCheck,
    title: "Estado siempre claro",
    text: "Cada reserva muestra si está pendiente, confirmada, cancelada o vencida."
  }
];

const pasos = [
  { icon: MapPin, title: "Elegís cancha", text: "Comparás tipo, precio y descripción." },
  { icon: Clock3, title: "Seleccionás turno", text: "Mañana, tarde o noche, sin franjas complicadas." },
  { icon: BadgeCheck, title: "Confirmás reserva", text: "El sistema guarda tu lugar y lo ves en tu historial." }
];

const FieldHeroScene = () => (
  <div className="absolute inset-0 overflow-hidden bg-emerald-800">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(135deg,#064e3b,#0f9f6e_58%,#b7f261)] bg-[size:72px_72px,72px_72px,auto]" />
    <div className="absolute inset-7 rounded-xl border-2 border-white/65 sm:inset-10" />
    <div className="absolute left-1/2 top-10 h-[calc(100%-5rem)] w-0.5 -translate-x-1/2 bg-white/55" />
    <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/65 sm:h-48 sm:w-48" />
    <div className="absolute left-10 top-1/2 h-40 w-20 -translate-y-1/2 rounded-r-xl border-y-2 border-r-2 border-white/65 sm:h-56 sm:w-28" />
    <div className="absolute right-10 top-1/2 h-40 w-20 -translate-y-1/2 rounded-l-xl border-y-2 border-l-2 border-white/65 sm:h-56 sm:w-28" />
    <div className="absolute inset-0 bg-slate-950/35" />
  </div>
);

const SoccerBallMark = () => (
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl ring-4 ring-white/25">
    <div className="h-10 w-10 rounded-full border-4 border-slate-950 bg-white">
      <div className="mx-auto mt-2 h-4 w-4 rotate-45 bg-slate-950" />
    </div>
  </div>
);

const BusinessCard = ({ icon: Icon, title, text }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </article>
);

export const HomePage = () => {
  return (
    <section className="space-y-10">
      <section className="relative -mx-4 -mt-2 min-h-[560px] overflow-hidden bg-slate-950 px-4 py-10 text-white sm:rounded-xl sm:px-8 lg:py-14">
        <FieldHeroScene />
        <div className="absolute inset-x-0 bottom-0 h-px bg-amber-300/70" />

        <div className="relative mx-auto flex min-h-[480px] max-w-6xl flex-col justify-between gap-10">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-emerald-50 ring-1 ring-white/15">
                <Trophy className="h-4 w-4 text-amber-300" />
                Fútbol con reserva online
              </p>

              <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">
                El Círculo Fútbol
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-50/90">
                Organizá tu partido, elegí cancha y asegurá tu turno por mañana, tarde o noche desde una experiencia clara y rápida.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-md bg-amber-300 px-5 py-3 font-black text-slate-950 shadow-sm transition hover:bg-amber-200"
                  to="/canchas"
                >
                  Reservar cancha
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
                  to="/register"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>

            <div className="hidden shrink-0 rounded-xl bg-slate-950/72 p-4 shadow-xl ring-1 ring-white/15 backdrop-blur md:block">
              <SoccerBallMark />
              <p className="mt-4 text-xs font-semibold uppercase text-emerald-100">Cancha destacada</p>
              <p className="mt-1 text-2xl font-black">Fútbol 5</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-4xl">
            {turnos.map((turno) => (
              <div
                className="rounded-lg bg-white/95 p-4 text-slate-950 shadow-sm ring-1 ring-white/50"
                key={turno.label}
              >
                <p className="text-xs font-bold uppercase text-emerald-700">{turno.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{turno.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              { value: "3", label: "turnos por día" },
              { value: "5/7/11", label: "formatos de cancha" },
              { value: "24/7", label: "reservas online" }
            ].map((item) => (
              <div className="border-l border-white/20 pl-4" key={item.label}>
                <p className="text-3xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-sm font-medium text-emerald-50/75">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {beneficios.map((beneficio) => (
          <BusinessCard key={beneficio.title} {...beneficio} />
        ))}
      </section>

      <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Listo para jugar
          </p>
          <h2 className="mt-4 text-3xl font-black text-slate-950">
            Reservar no tiene que ser una vuelta más.
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-slate-600">
            La web acompaña el flujo real de un complejo: el cliente encuentra cancha, confirma su turno y puede volver a consultar su historial cuando lo necesite.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {pasos.map((paso, index) => {
            const Icon = paso.icon;

            return (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={paso.title}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-emerald-700 ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black text-amber-600">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-black text-slate-950">{paso.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{paso.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700 ring-1 ring-sky-100">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-950">Pensada para jugadores y para el negocio</h2>
              <p className="mt-3 leading-7 text-slate-600">
                El cliente ve una experiencia simple; el administrador mantiene el control de canchas, reservas, usuarios y reportes sin mezclar pantallas operativas con la vista pública.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            <span className="text-sm font-black uppercase">Club organizado</span>
          </div>
          <p className="mt-4 text-2xl font-black leading-tight text-slate-950">
            Menos mensajes sueltos, más turnos claros.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            to="/canchas"
          >
            Ver canchas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </section>
  );
};
