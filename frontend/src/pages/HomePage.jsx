import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock3,
  Goal,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UsersRound
} from "lucide-react";
import { Link } from "react-router-dom";

const momentos = [
  { label: "Mañana", text: "Arrancá el día con partido." },
  { label: "Tarde", text: "Ideal para juntarse después de clase o trabajo." },
  { label: "Noche", text: "El clásico turno para cerrar el día jugando." }
];

const pasos = [
  {
    icon: Goal,
    title: "Elegís la cancha",
    text: "Compará formatos, precio y descripción antes de reservar."
  },
  {
    icon: Clock3,
    title: "Marcás el momento",
    text: "Mañana, tarde o noche. Simple, rápido y sin horarios confusos."
  },
  {
    icon: BadgeCheck,
    title: "Confirmás tu lugar",
    text: "Tu reserva queda guardada y podés revisarla cuando quieras."
  }
];

const beneficios = [
  {
    icon: CalendarCheck,
    title: "Reserva sin llamadas",
    text: "Entrás, elegís y avanzás. Menos mensajes sueltos, más certeza para jugar."
  },
  {
    icon: UsersRound,
    title: "Para jugar con tu grupo",
    text: "Armá el partido de la semana y compartí la info clara con todos."
  },
  {
    icon: ShieldCheck,
    title: "Tu reserva ordenada",
    text: "Tenés historial y estado de cada turno, sin depender de capturas o chats."
  }
];

const formatos = [
  { title: "Fútbol 5", text: "Rápido, intenso y perfecto para equipos chicos." },
  { title: "Fútbol 7", text: "Más espacio, más juego y ritmo de partido completo." },
  { title: "Fútbol 11", text: "La experiencia grande para equipos completos." }
];

const FieldScene = () => (
  <div className="absolute inset-0 overflow-hidden bg-emerald-950">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#042f2e_0%,#047857_46%,#a3e635_140%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:78px_78px]" />
    <div className="absolute -right-10 top-8 h-[82%] w-[62%] rounded-[28px] border-2 border-white/45" />
    <div className="absolute right-[30%] top-8 h-[82%] w-px bg-white/35" />
    <div className="absolute right-[18%] top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border-2 border-white/40" />
    <div className="absolute right-10 top-1/2 h-48 w-28 -translate-y-1/2 rounded-l-2xl border-y-2 border-l-2 border-white/40" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_34%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.76)_43%,rgba(2,6,23,0.18)_100%)]" />
  </div>
);

const MiniBall = () => (
  <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm">
    <span className="h-5 w-5 rounded-full border-[3px] border-slate-950">
      <span className="mx-auto mt-1 block h-2 w-2 rotate-45 bg-slate-950" />
    </span>
  </span>
);

const FeatureCard = ({ icon: Icon, title, text }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
  </article>
);

export const HomePage = () => {
  return (
    <section className="space-y-12">
      <section className="relative -mt-2 min-h-[620px] overflow-hidden rounded-xl bg-slate-950 px-4 py-10 text-white sm:px-8 lg:px-10 lg:py-12">
        <FieldScene />

        <div className="relative flex min-h-[540px] max-w-6xl flex-col justify-between gap-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold text-emerald-50 ring-1 ring-white/15 backdrop-blur">
              <Trophy className="h-4 w-4 text-amber-300" />
              Tu próximo partido empieza acá
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl">
              Reservá cancha sin perder tiempo.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
              Elegí El Círculo Fútbol, encontrá el formato que va con tu grupo y asegurá tu turno en pocos pasos.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-md bg-amber-300 px-5 py-3 font-black text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-amber-200"
                to="/canchas"
              >
                Ver canchas
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15"
                to="/register"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {momentos.map((momento) => (
              <article
                className="rounded-xl border border-white/15 bg-white/12 p-4 shadow-sm backdrop-blur-md"
                key={momento.label}
              >
                <p className="text-xs font-black uppercase text-amber-200">{momento.label}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/90">{momento.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pasos.map((paso, index) => {
          const Icon = paso.icon;

          return (
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={paso.title}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-black text-emerald-700">0{index + 1}</span>
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">{paso.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{paso.text}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Canchas para cada plan
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-slate-950">
            Desde un reducido entre amigos hasta un partido completo.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">
            El foco es que el jugador encuentre rápido la cancha que necesita y pueda reservar sin fricción.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {formatos.map((formato) => (
            <article
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
              key={formato.title}
            >
              <MiniBall />
              <h3 className="mt-5 text-xl font-black text-slate-950">{formato.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{formato.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {beneficios.map((beneficio) => (
          <FeatureCard key={beneficio.title} {...beneficio} />
        ))}
      </section>

      <section className="relative overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,120,87,0.9),rgba(15,23,42,0.95)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:auto,64px_64px]" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-amber-200">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              Listo para jugar
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight">
              Menos coordinación, más partido.
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-200">
              Entrá a la carta de canchas, elegí tu turno y dejá tu próxima reserva encaminada.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-300 px-5 py-3 font-black text-slate-950 transition hover:bg-amber-200"
            to="/canchas"
          >
            Reservar ahora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </section>
  );
};
