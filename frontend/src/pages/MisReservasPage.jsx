import { Ban, CalendarDays, CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { pagoService } from "../services/pagoService.js";
import { reservaService } from "../services/reservaService.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const estadoLabels = {
  pendiente_pago: "Pendiente de pago",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  vencida: "Vencida",
  rechazada: "Rechazada"
};

const estadoStyles = {
  pendiente_pago: "bg-amber-50 text-amber-700",
  confirmada: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-red-50 text-red-700",
  vencida: "bg-slate-100 text-slate-700",
  rechazada: "bg-red-50 text-red-700"
};

const momentoLabels = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche"
};

const pagoLabels = {
  pendiente: "Pago pendiente",
  aprobado: "Pago aprobado",
  rechazado: "Pago rechazado",
  cancelado: "Pago cancelado"
};

const pagoStyles = {
  pendiente: "bg-amber-50 text-amber-700",
  aprobado: "bg-emerald-50 text-emerald-700",
  rechazado: "bg-red-50 text-red-700",
  cancelado: "bg-slate-100 text-slate-700"
};

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

const canCancelReserva = (estado) => ["pendiente_pago", "confirmada"].includes(estado);

export const MisReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [processingPagoId, setProcessingPagoId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReservas = async () => {
    const data = await reservaService.getMisReservas();
    setReservas(data.reservas);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadReservas();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleCancelReserva = async (reservaId) => {
    setError("");
    setSuccess("");

    try {
      setCancellingId(reservaId);
      await reservaService.cancelReserva(reservaId);
      setSuccess("Reserva cancelada correctamente.");
      await loadReservas();
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError));
    } finally {
      setCancellingId(null);
    }
  };

  const handleSimulatePago = async (pagoId, resultado) => {
    setError("");
    setSuccess("");

    try {
      setProcessingPagoId(pagoId);
      await pagoService.simulatePago(pagoId, resultado);
      setSuccess(
        resultado === "aprobado"
          ? "Pago aprobado. La reserva quedó confirmada."
          : "Pago rechazado. La reserva quedó rechazada."
      );
      await loadReservas();
    } catch (paymentError) {
      setError(getApiErrorMessage(paymentError));
    } finally {
      setProcessingPagoId(null);
    }
  };

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

      {(error || success) && (
        <div
          className={`rounded-md border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || success}
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
                <span
                  className={`rounded-md px-2 py-1 text-sm font-semibold ${
                    estadoStyles[reserva.estado] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {estadoLabels[reserva.estado] || reserva.estado}
                </span>
                {reserva.Pago && (
                  <span
                    className={`rounded-md px-2 py-1 text-sm font-semibold ${
                      pagoStyles[reserva.Pago.estado] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {pagoLabels[reserva.Pago.estado] || reserva.Pago.estado}
                  </span>
                )}
                {reserva.estado === "pendiente_pago" && reserva.Pago?.estado === "pendiente" && (
                  <>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => handleSimulatePago(reserva.Pago.id, "aprobado")}
                      disabled={processingPagoId === reserva.Pago.id}
                    >
                      <CreditCard className="h-4 w-4" />
                      {processingPagoId === reserva.Pago.id ? "Procesando..." : "Pagar demo"}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => handleSimulatePago(reserva.Pago.id, "rechazado")}
                      disabled={processingPagoId === reserva.Pago.id}
                    >
                      <Ban className="h-4 w-4" />
                      Rechazar demo
                    </button>
                  </>
                )}
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={() => handleCancelReserva(reserva.id)}
                  disabled={!canCancelReserva(reserva.estado) || cancellingId === reserva.id}
                >
                  <X className="h-4 w-4" />
                  {cancellingId === reserva.id ? "Cancelando..." : "Cancelar"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
