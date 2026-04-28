import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { reservaService } from "../services/reservaService.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const estadoLabels = {
  pendiente_pago: "Pendiente de pago",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  vencida: "Vencida",
  rechazada: "Rechazada"
};

const momentoLabels = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche"
};

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

export const MisReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReservas = async () => {
      try {
        const data = await reservaService.getMisReservas();
        setReservas(data.reservas);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    loadReservas();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis reservas</h1>
        <p className="mt-2 text-slate-600">Historial de reservas realizadas.</p>
      </div>

      {isLoading && (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
          Cargando reservas...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && reservas.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
          Todavía no tenés reservas.
        </div>
      )}

      <div className="space-y-3">
        {reservas.map((reserva) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={reserva.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {reserva.Cancha?.nombre || "Cancha"}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays className="h-4 w-4 text-emerald-700" />
                  {reserva.fecha} · {momentoLabels[reserva.momento] || reserva.momento}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                  {formatPrice(reserva.precioFinal)}
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700">
                  {estadoLabels[reserva.estado] || reserva.estado}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
