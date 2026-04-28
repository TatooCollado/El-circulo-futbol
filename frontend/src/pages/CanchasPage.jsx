import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export const CanchasPage = () => {
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
      <div>
        <h1 className="text-3xl font-bold">Canchas</h1>
        <p className="mt-2 text-slate-600">
          Elegí una cancha disponible y reservá por mañana, tarde o noche.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
          Cargando canchas...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && canchas.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
          No hay canchas disponibles por el momento.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canchas.map((cancha) => (
          <article
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            key={cancha.id}
          >
            <div className="aspect-[16/10] bg-[linear-gradient(135deg,#0f766e,#22c55e,#bef264)]" />
            <div className="space-y-4 p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-slate-950">{cancha.nombre}</h2>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {tipoLabels[cancha.tipo] || cancha.tipo}
                  </span>
                </div>
                <p className="line-clamp-2 min-h-10 text-sm text-slate-600">
                  {cancha.descripcion || "Cancha disponible para reservar."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-emerald-700" />
                El Círculo Fútbol
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">Precio</p>
                  <p className="text-lg font-bold text-slate-950">{formatPrice(cancha.precio)}</p>
                </div>
                <Link
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  to={`/reservar/${cancha.id}`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Reservar
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
