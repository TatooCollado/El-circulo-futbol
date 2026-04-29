import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { canchaService } from "../services/canchaService.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const tipoLabels = {
  futbol_5: "Fútbol 5",
  futbol_7: "Fútbol 7",
  futbol_11: "Fútbol 11"
};

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

const CanchaArtwork = ({ nombre, tipo }) => (
  <div className="relative aspect-[16/9] overflow-hidden bg-emerald-700">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(135deg,#065f46,#16a34a_55%,#bef264)] bg-[size:56px_56px,auto]" />
    <div className="absolute inset-5 rounded-lg border-2 border-white/65" />
    <div className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 bg-white/55" />
    <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/65" />
    <div className="absolute left-5 top-1/2 h-24 w-12 -translate-y-1/2 rounded-r-md border-y-2 border-r-2 border-white/65" />
    <div className="absolute right-5 top-1/2 h-24 w-12 -translate-y-1/2 rounded-l-md border-y-2 border-l-2 border-white/65" />
    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
      <div className="rounded-md bg-slate-950/75 px-3 py-2 text-white backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Cancha</p>
        <p className="text-lg font-black leading-tight">{nombre}</p>
      </div>
      <span className="rounded-md bg-white px-3 py-2 text-sm font-black text-emerald-700 shadow-sm">
        {tipoLabels[tipo] || tipo}
      </span>
    </div>
  </div>
);

export const CanchasPage = () => {
  const { isAuthenticated, rol } = useAuth();
  const [canchas, setCanchas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCanchas = async () => {
      try {
        const data = await canchaService.getCanchas();
        setCanchas(data.canchas);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    loadCanchas();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Disponibilidad del complejo
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Canchas</h1>
          <p className="mt-2 text-slate-600">
            Elegí una cancha disponible y reservá por mañana, tarde o noche.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-sm font-medium text-slate-500">Turnos disponibles</p>
          <p className="mt-1 text-2xl font-black text-slate-950">3 por día</p>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Cargando canchas...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && canchas.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          No hay canchas disponibles por el momento.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {canchas.map((cancha) => (
          <article
            className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/10"
            key={cancha.id}
          >
            <CanchaArtwork nombre={cancha.nombre} tipo={cancha.tipo} />
            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-slate-950">{cancha.nombre}</h2>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Disponible
                  </span>
                </div>
                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                  {cancha.descripcion || "Cancha lista para reservar en el turno que prefieras."}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-emerald-700" />
                El Círculo Fútbol
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Precio</p>
                  <p className="text-2xl font-black text-slate-950">{formatPrice(cancha.precio)}</p>
                </div>
                {(!isAuthenticated || rol === "cliente") && (
                  <Link
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:bg-emerald-700"
                    to={`/reservar/${cancha.id}`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Reservar
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
