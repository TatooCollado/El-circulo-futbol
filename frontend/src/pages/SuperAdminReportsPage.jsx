import { BarChart3, CalendarDays, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { reportService } from "../services/reportService.js";
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

const formatMoney = (value) => {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
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
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await reportService.getGeneralReport();
        setReport(data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
        Cargando reportes...
      </section>
    );
  }

  if (error) {
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
        <p className="mt-2 text-slate-600">Indicadores generales del complejo y sus reservas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Usuarios activos" value={report.resumen.usuariosActivos} />
        <StatCard icon={BarChart3} label="Reservas totales" value={report.resumen.totalReservas} />
        <StatCard icon={CalendarDays} label="Canchas disponibles" value={report.resumen.canchasDisponibles} />
        <StatCard icon={DollarSign} label="Ingresos aprobados" value={formatMoney(report.resumen.ingresosAprobados)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CountList title="Reservas por estado" data={report.reservasPorEstado} labels={estadoLabels} />
        <CountList title="Pagos por estado" data={report.pagosPorEstado} labels={pagoLabels} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">Canchas más reservadas</h2>
          <div className="mt-4 space-y-3">
            {report.reservasPorCancha.length === 0 && (
              <p className="text-sm text-slate-600">Todavía no hay reservas registradas.</p>
            )}
            {report.reservasPorCancha.map((item) => (
              <div className="flex items-center justify-between gap-3" key={item.canchaId}>
                <span className="text-sm font-medium text-slate-700">{item.cancha}</span>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700">
                  {item.total}
                </span>
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

