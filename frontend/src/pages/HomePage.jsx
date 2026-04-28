import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Sistema de reservas
        </p>
        <h1 className="text-4xl font-bold text-slate-950 md:text-5xl">
          El Circulo Futbol
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Reserva canchas por manana, tarde o noche, gestiona pagos de prueba y administra la disponibilidad del complejo.
        </p>
        <Link
          to="/canchas"
          className="inline-flex rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Ver canchas
        </Link>
      </div>

      <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-emerald-700 via-emerald-500 to-lime-300 shadow-sm" />
    </section>
  );
};
