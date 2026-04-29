import { BarChart3, CalendarDays, DollarSign, Percent, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { reportService } from "../services/reportService.js";
import { getLocalDateString } from "../utils/date.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const estadoLabels = {
  pendiente_pago: "Pendientes",
  confirmada: "Confirmadas",
  cancelada: "Canceladas",
  vencida: "Vencidas",
  rechazada: "Rechazadas"
};

const pagoLabels = {
  pendiente: "Pendientes",
  aprobado: "Aprobados",
  rechazado: "Rechazados",
  cancelado: "Cancelados"
};

const momentoLabels = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche"
};

const getCurrentMonthRange = () => {
  const now = new Date();

  return {
    fechaDesde: getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
    fechaHasta: getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  };
};

const formatMoney = (value) => {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

const formatPercent = (value) => {
  return value === null || value === undefined ? "Sin rango" : `${value}%`;
};

const StatCard = ({ icon: Icon, label, value }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </article>
);

const CountList = ({ title, data, labels }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h2 className="text-xl font-bold">{title}</h2>
    <div className="mt-4 space-y-3">
      {Object.entries(labels).map(([key, label]) => (
        <div className="flex items-center justify-between gap-3" key={key}>
          <span className="text-sm text-slate-600">{label}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
            {data?.[key] || 0}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export const SuperAdminReportsPage = () => {
  const [filters, setFilters] = useState(getCurrentMonthRange);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await reportService.getGeneralReport(filters);
        setReport(data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const handleCurrentMonth = () => {
    setFilters(getCurrentMonthRange());
  };

  if (isLoading && !report) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
        Cargando reportes...
      </section>
    );
  }

  if (error && !report) {
    return (
      <section className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="mt-2 text-slate-600">Indicadores del complejo para el período seleccionado.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Desde</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              name="fechaDesde"
              type="date"
              value={filters.fechaDesde}
              onChange={handleFilterChange}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hasta</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              name="fechaHasta"
              type="date"
              value={filters.fechaHasta}
              onChange={handleFilterChange}
            />
          </label>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            type="button"
            onClick={handleCurrentMonth}
          >
            <CalendarDays className="h-4 w-4" />
            Mes actual
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
          <span>Período: {report.filtros.fechaDesde || "inicio"} al {report.filtros.fechaHasta || "hoy"}</span>
          {report.filtros.diasPeriodo && <span>· {report.filtros.diasPeriodo} días</span>}
          {isLoading && <span>· Actualizando...</span>}
        </div>
      </section>

      {error && (
        <section className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BarChart3} label="Reservas del período" value={report.resumen.totalReservas} />
        <StatCard icon={Users} label="Reservas activas" value={report.resumen.reservasActivas} />
        <StatCard icon={Percent} label="Ocupación estimada" value={formatPercent(report.resumen.ocupacionPromedio)} />
        <StatCard icon={DollarSign} label="Ingresos aprobados" value={formatMoney(report.resumen.ingresosAprobados)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Usuarios activos" value={report.resumen.usuariosActivos} />
        <StatCard icon={CalendarDays} label="Canchas disponibles" value={report.resumen.canchasDisponibles} />
        <StatCard icon={BarChart3} label="Turnos posibles" value={report.resumen.capacidadTurnosPeriodo || "Sin rango"} />
        <StatCard icon={CalendarDays} label="Canchas totales" value={report.resumen.totalCanchas} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CountList title="Reservas por estado" data={report.reservasPorEstado} labels={estadoLabels} />
        <CountList title="Pagos por estado" data={report.pagosPorEstado} labels={pagoLabels} />
        <CountList title="Reservas por momento" data={report.reservasPorMomento} labels={momentoLabels} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">Ocupación por cancha</h2>
          <div className="mt-4 space-y-3">
            {report.reservasPorCancha.length === 0 && (
              <p className="text-sm text-slate-600">No hay reservas activas en el período.</p>
            )}
            {report.reservasPorCancha.map((item) => (
              <div className="flex items-center justify-between gap-3" key={item.canchaId}>
                <span className="text-sm font-medium text-slate-700">{item.cancha}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700">
                    {item.total}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                    {formatPercent(item.ocupacionPorcentaje)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">Próximas reservas activas</h2>
          <div className="mt-4 space-y-3">
            {report.proximasReservas.length === 0 && (
              <p className="text-sm text-slate-600">No hay reservas activas próximas.</p>
            )}
            {report.proximasReservas.map((reserva) => (
              <article className="rounded-md border border-slate-100 bg-slate-50 p-3" key={reserva.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{reserva.Cancha?.nombre || "Cancha"}</p>
                    <p className="text-sm text-slate-600">
                      {reserva.User?.nombre} {reserva.User?.apellido} · {reserva.fecha} ·{" "}
                      {momentoLabels[reserva.momento] || reserva.momento}
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                    {estadoLabels[reserva.estado] || reserva.estado}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};
