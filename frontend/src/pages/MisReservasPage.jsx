import { Ban, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, History, Trophy, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageHero, StatusMessage } from "../components/PolishedUi.jsx";
import { pagoService } from "../services/pagoService.js";
import { reservaService } from "../services/reservaService.js";
import { getLocalDateString } from "../utils/date.js";
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

const momentoOrder = {
  manana: 1,
  tarde: 2,
  noche: 3
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

const activeStates = ["pendiente_pago", "confirmada"];
const RESERVAS_PAGE_SIZE = 5;

const statusPriority = {
  pendiente_pago: 1,
  confirmada: 2,
  cancelada: 3,
  vencida: 4,
  rechazada: 5
};

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatReservaDate = (dateString) => {
  return parseLocalDate(dateString).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const getReservaSortValue = (reserva) => {
  return parseLocalDate(reserva.fecha).getTime() + momentoOrder[reserva.momento] * 1000;
};

const canCancelReserva = (estado) => activeStates.includes(estado);

const getReservasPagination = (reservas, page) => {
  const totalItems = reservas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / RESERVAS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * RESERVAS_PAGE_SIZE;
  const endIndex = Math.min(startIndex + RESERVAS_PAGE_SIZE, totalItems);

  return {
    currentPage,
    endIndex,
    items: reservas.slice(startIndex, endIndex),
    startIndex,
    totalItems,
    totalPages
  };
};

const ReservaCard = ({
  reserva,
  cancellingId,
  processingPagoId,
  onCancelReserva,
  onSimulatePago
}) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-lg">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h3 className="text-xl font-black text-slate-950">{reserva.Cancha?.nombre || "Cancha"}</h3>
        <p className="mt-1 flex items-center gap-2 text-sm capitalize text-slate-600">
          <CalendarDays className="h-4 w-4 text-emerald-700" />
          {formatReservaDate(reserva.fecha)}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Turno: <span className="font-semibold text-slate-800">{momentoLabels[reserva.momento] || reserva.momento}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:items-end">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-slate-950 px-2 py-1 text-sm font-black text-white">
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
        </div>

        <div className="flex flex-wrap gap-2">
          {reserva.estado === "pendiente_pago" && reserva.Pago?.estado === "pendiente" && (
            <>
              <button
                className="ec-button-primary px-3 py-1.5"
                type="button"
                onClick={() => onSimulatePago(reserva.Pago.id, "aprobado")}
                disabled={processingPagoId === reserva.Pago.id}
              >
                <CreditCard className="h-4 w-4" />
                {processingPagoId === reserva.Pago.id ? "Procesando..." : "Pagar demo"}
              </button>
              <button
                className="ec-button-outline px-3 py-1.5"
                type="button"
                onClick={() => onSimulatePago(reserva.Pago.id, "rechazado")}
                disabled={processingPagoId === reserva.Pago.id}
              >
                <Ban className="h-4 w-4" />
                Rechazar demo
              </button>
            </>
          )}

          {canCancelReserva(reserva.estado) && (
            <button
              className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              type="button"
              onClick={() => onCancelReserva(reserva.id)}
              disabled={cancellingId === reserva.id}
            >
              <X className="h-4 w-4" />
              {cancellingId === reserva.id ? "Cancelando..." : "Cancelar"}
            </button>
          )}
        </div>
      </div>
    </div>
  </article>
);

const ReservaSection = ({
  title,
  description,
  icon: Icon,
  pagination,
  emptyMessage,
  cancellingId,
  processingPagoId,
  onCancelReserva,
  onPageChange,
  onSimulatePago
}) => {
  const hasPagination = pagination.totalPages > 1;

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-emerald-700" />
          <div>
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <span className="rounded-md bg-slate-950 px-2 py-1 text-sm font-black text-white">
          {pagination.totalItems}
        </span>
      </div>

      {pagination.totalItems === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">{emptyMessage}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span>
              Mostrando {pagination.startIndex + 1}-{pagination.endIndex} de {pagination.totalItems}
            </span>
            {hasPagination && (
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  type="button"
                  onClick={() => onPageChange(-1)}
                  disabled={pagination.currentPage === 1}
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="rounded-md bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 ring-1 ring-slate-200">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  type="button"
                  onClick={() => onPageChange(1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  title="Página siguiente"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {pagination.items.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              cancellingId={cancellingId}
              processingPagoId={processingPagoId}
              onCancelReserva={onCancelReserva}
              onSimulatePago={onSimulatePago}
            />
          ))}
        </>
      )}
    </section>
  );
};

export const MisReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [processingPagoId, setProcessingPagoId] = useState(null);
  const [proximasPage, setProximasPage] = useState(1);
  const [historialPage, setHistorialPage] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = getLocalDateString();
  const { proximasReservas, historialReservas } = useMemo(() => {
    const futuras = [];
    const historial = [];

    reservas.forEach((reserva) => {
      const isUpcoming = activeStates.includes(reserva.estado) && reserva.fecha >= today;
      if (isUpcoming) {
        futuras.push(reserva);
      } else {
        historial.push(reserva);
      }
    });

    return {
      proximasReservas: futuras.sort((a, b) => {
        const dateSort = getReservaSortValue(a) - getReservaSortValue(b);
        return dateSort || statusPriority[a.estado] - statusPriority[b.estado] || a.id - b.id;
      }),
      historialReservas: historial.sort((a, b) => {
        const dateSort = getReservaSortValue(b) - getReservaSortValue(a);
        return dateSort || statusPriority[a.estado] - statusPriority[b.estado] || b.id - a.id;
      })
    };
  }, [reservas, today]);

  const proximasPagination = useMemo(
    () => getReservasPagination(proximasReservas, proximasPage),
    [proximasPage, proximasReservas]
  );

  const historialPagination = useMemo(
    () => getReservasPagination(historialReservas, historialPage),
    [historialPage, historialReservas]
  );

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

  useEffect(() => {
    setProximasPage((currentPage) => {
      const totalPages = Math.max(1, Math.ceil(proximasReservas.length / RESERVAS_PAGE_SIZE));
      return Math.min(currentPage, totalPages);
    });
  }, [proximasReservas.length]);

  useEffect(() => {
    setHistorialPage((currentPage) => {
      const totalPages = Math.max(1, Math.ceil(historialReservas.length / RESERVAS_PAGE_SIZE));
      return Math.min(currentPage, totalPages);
    });
  }, [historialReservas.length]);

  const handleProximasPageChange = (offset) => {
    setProximasPage((currentPage) => {
      const nextPage = currentPage + offset;
      return Math.min(Math.max(nextPage, 1), proximasPagination.totalPages);
    });
  };

  const handleHistorialPageChange = (offset) => {
    setHistorialPage((currentPage) => {
      const nextPage = currentPage + offset;
      return Math.min(Math.max(nextPage, 1), historialPagination.totalPages);
    });
  };

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
      <PageHero
        eyebrow="Tu agenda de fútbol"
        title="Mis reservas"
        description="Revisá tus próximos turnos, simulá pagos pendientes y consultá tu historial sin perder el hilo."
        icon={Trophy}
        statLabel="Activas"
        statValue={proximasReservas.length}
      />

      {isLoading && <StatusMessage>Cargando reservas...</StatusMessage>}

      {(error || success) && (
        <StatusMessage type={error ? "error" : "success"}>{error || success}</StatusMessage>
      )}

      {!isLoading && !error && reservas.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Todavía no tenés reservas"
          description="Cuando elijas una cancha, tus próximos partidos van a aparecer acá."
        />
      )}

      {!isLoading && reservas.length > 0 && (
        <div className="space-y-8">
          <ReservaSection
            title="Próximas reservas"
            description="Turnos activos desde hoy en adelante."
            icon={CheckCircle2}
            pagination={proximasPagination}
            emptyMessage="No tenés reservas activas próximas."
            cancellingId={cancellingId}
            processingPagoId={processingPagoId}
            onCancelReserva={handleCancelReserva}
            onPageChange={handleProximasPageChange}
            onSimulatePago={handleSimulatePago}
          />

          <ReservaSection
            title="Historial"
            description="Reservas pasadas, canceladas, vencidas o rechazadas."
            icon={History}
            pagination={historialPagination}
            emptyMessage="Todavía no hay reservas en el historial."
            cancellingId={cancellingId}
            processingPagoId={processingPagoId}
            onCancelReserva={handleCancelReserva}
            onPageChange={handleHistorialPageChange}
            onSimulatePago={handleSimulatePago}
          />
        </div>
      )}
    </section>
  );
};
