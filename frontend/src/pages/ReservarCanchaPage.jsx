import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { canchaService } from "../services/canchaService.js";
import { reservaService } from "../services/reservaService.js";
import { getLocalDateString } from "../utils/date.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const momentos = [
  { value: "manana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "noche", label: "Noche" }
];

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

export const ReservarCanchaPage = () => {
  const { canchaId } = useParams();
  const navigate = useNavigate();
  const today = useMemo(() => getLocalDateString(), []);
  const [cancha, setCancha] = useState(null);
  const [form, setForm] = useState({
    fecha: today,
    momento: "manana"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCancha = async () => {
      try {
        const data = await canchaService.getCanchaById(canchaId);
        setCancha(data.cancha);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    loadCancha();
  }, [canchaId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fecha || !form.momento) {
      setError("Elegí una fecha y un momento para reservar.");
      return;
    }

    try {
      setIsSubmitting(true);
      await reservaService.createReserva({
        canchaId,
        fecha: form.fecha,
        momento: form.momento
      });
      setSuccess("Reserva creada. Quedó pendiente de pago por 15 minutos.");
      setTimeout(() => navigate("/mis-reservas"), 900);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
        Cargando cancha...
      </section>
    );
  }

  if (!cancha) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" to="/canchas">
          <ArrowLeft className="h-4 w-4" />
          Volver a canchas
        </Link>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "No se pudo cargar la cancha."}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" to="/canchas">
        <ArrowLeft className="h-4 w-4" />
        Volver a canchas
      </Link>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[18/7] bg-[linear-gradient(135deg,#0f766e,#22c55e,#bef264)]" />
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{cancha.nombre}</h1>
            <p className="text-slate-600">{cancha.descripcion || "Cancha disponible para reservar."}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                {cancha.tipo.replace("_", " ")}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                {formatPrice(cancha.precio)}
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                Fecha
              </span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                min={today}
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={handleChange}
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock className="h-4 w-4 text-emerald-700" />
                Momento
              </span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="momento"
                value={form.momento}
                onChange={handleChange}
              >
                {momentos.map((momento) => (
                  <option key={momento.value} value={momento.value}>
                    {momento.label}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <button
              className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Reservando..." : "Confirmar reserva"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
