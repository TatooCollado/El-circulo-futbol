import { BarChart3, CalendarDays, DollarSign, Percent, TrendingUp, Users } from "lucide-react";
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

const clampPercent = (value) => {
  const numericValue = Number(value) || 0;
  return Math.min(Math.max(numericValue, 0), 100);
};

const StatCard = ({ icon: Icon, label, value, tone = "emerald" }) => {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200"
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`rounded-md p-3 ring-1 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
};

const CountList = ({ title, data, labels }) => {
  const entries = Object.entries(labels).map(([key, label]) => ({
    key,
    label,
    value: data?.[key] || 0
  }));
  const total = entries.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{title}</h2>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
          {total}
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {entries.map((item) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.key}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                <span className="text-sm font-black text-slate-950">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

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
      <section className="rounded-md border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            Control del complejo
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Reportes</h1>
          <p className="mt-2 text-slate-600">Indicadores del complejo para el período seleccionado.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-sm font-medium text-slate-500">Ocupación estimada</p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatPercent(report.resumen.ocupacionPromedio)}
          </p>
        </div>
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
        <StatCard icon={Users} label="Reservas activas" value={report.resumen.reservasActivas} tone="sky" />
        <StatCard icon={Percent} label="Ocupación estimada" value={formatPercent(report.resumen.ocupacionPromedio)} tone="amber" />
        <StatCard icon={DollarSign} label="Ingresos aprobados" value={formatMoney(report.resumen.ingresosAprobados)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Usuarios activos" value={report.resumen.usuariosActivos} tone="slate" />
        <StatCard icon={CalendarDays} label="Canchas disponibles" value={report.resumen.canchasDisponibles} />
        <StatCard icon={BarChart3} label="Turnos posibles" value={report.resumen.capacidadTurnosPeriodo ?? "Sin rango"} tone="sky" />
        <StatCard icon={CalendarDays} label="Canchas totales" value={report.resumen.totalCanchas} tone="slate" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CountList title="Reservas por estado" data={report.reservasPorEstado} labels={estadoLabels} />
        <CountList title="Pagos por estado" data={report.pagosPorEstado} labels={pagoLabels} />
        <CountList title="Reservas por momento" data={report.reservasPorMomento} labels={momentoLabels} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black">Ocupación por cancha</h2>
          <div className="mt-4 space-y-4">
            {report.reservasPorCancha.length === 0 && (
              <p className="text-sm text-slate-600">No hay reservas activas en el período.</p>
            )}
            {report.reservasPorCancha.map((item) => {
              const percent = clampPercent(item.ocupacionPorcentaje);

              return (
                <article className="rounded-md border border-slate-100 bg-slate-50 p-3" key={item.canchaId}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">{item.cancha}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700">
                        {item.total}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        {formatPercent(item.ocupacionPorcentaje)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-black">Próximas reservas activas</h2>
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
                  <span className="w-fit rounded-md bg-white px-2 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
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
