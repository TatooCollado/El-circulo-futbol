import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Goal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FieldArtwork, StatusMessage, SurfaceCard } from "../components/PolishedUi.jsx";
import { canchaService } from "../services/canchaService.js";
import { reservaService } from "../services/reservaService.js";
import { getLocalDateString } from "../utils/date.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { polishCanchaDescription } from "../utils/text.js";

const momentos = [
  { value: "manana", label: "Mañana", detail: "Arranque temprano" },
  { value: "tarde", label: "Tarde", detail: "Partido con amigos" },
  { value: "noche", label: "Noche", detail: "Después del trabajo" }
];

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

export const ReservarCanchaPage = () => {
  const { canchaId } = useParams();
  const navigate = useNavigate();
  const today = useMemo(() => getLocalDateString(), []);
  const [cancha, setCancha] = useState(null);
  const [form, setForm] = useState({
    fecha: today,
    momento: "manana"
  });
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDisponibilidad, setIsLoadingDisponibilidad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
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

  useEffect(() => {
    if (!form.fecha) {
      setDisponibilidad(null);
      return undefined;
    }

    let shouldIgnore = false;

    const loadDisponibilidad = async () => {
      try {
        setIsLoadingDisponibilidad(true);
        setAvailabilityError("");
        const data = await canchaService.getDisponibilidad(canchaId, form.fecha);

        if (shouldIgnore) {
          return;
        }

        setDisponibilidad(data);

        if (data.disponibles.length > 0) {
          setForm((currentForm) =>
            data.disponibles.includes(currentForm.momento)
              ? currentForm
              : { ...currentForm, momento: data.disponibles[0] }
          );
        }
      } catch (loadError) {
        if (!shouldIgnore) {
          setDisponibilidad(null);
          setAvailabilityError(getApiErrorMessage(loadError));
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoadingDisponibilidad(false);
        }
      }
    };

    loadDisponibilidad();

    return () => {
      shouldIgnore = true;
    };
  }, [canchaId, form.fecha]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleMomentoChange = (momento) => {
    setForm((currentForm) => ({ ...currentForm, momento }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fecha || !form.momento) {
      setError("Elegí una fecha y un momento para reservar.");
      return;
    }

    if (disponibilidad && !disponibilidad.disponibles.includes(form.momento)) {
      setError("Ese momento ya está ocupado. Elegí otro turno disponible.");
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
    return <StatusMessage>Cargando cancha...</StatusMessage>;
  }

  if (!cancha) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-emerald-700" to="/canchas">
          <ArrowLeft className="h-4 w-4" />
          Volver a canchas
        </Link>
        <StatusMessage type="error">{error || "No se pudo cargar la cancha."}</StatusMessage>
      </section>
    );
  }

  const occupiedMomentos = disponibilidad?.ocupados || [];
  const availableMomentos = disponibilidad?.disponibles || [];
  const hasAvailableMomentos = !disponibilidad || availableMomentos.length > 0;

  return (
    <section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-emerald-700" to="/canchas">
        <ArrowLeft className="h-4 w-4" />
        Volver a canchas
      </Link>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="overflow-hidden">
          <FieldArtwork title={cancha.nombre} label="Reserva" type={tipoLabels[cancha.tipo] || cancha.tipo} />
          <div className="space-y-5 p-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700">
                <Goal className="h-4 w-4" />
                {tipoLabels[cancha.tipo] || cancha.tipo}
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950">{cancha.nombre}</h1>
              <p className="mt-3 leading-7 text-slate-600">
                {polishCanchaDescription(cancha.descripcion) || "Cancha lista para reservar en el turno que prefieras."}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase text-emerald-100">Precio del turno</p>
              <p className="mt-1 text-4xl font-black">{formatPrice(cancha.precio)}</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-700">
              <CalendarDays className="h-4 w-4" />
              Tu turno
            </p>
            <h2 className="mt-4 text-3xl font-black text-slate-950">Elegí día y momento.</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Te mostramos qué momentos siguen disponibles para esa fecha.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                Fecha
              </span>
              <input className="ec-input" min={today} name="fecha" type="date" value={form.fecha} onChange={handleChange} />
            </label>

            <div>
              <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                <Clock className="h-4 w-4 text-emerald-700" />
                Momento
              </span>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {momentos.map((momento) => {
                  const isOccupied = occupiedMomentos.includes(momento.value);
                  const isSelected = form.momento === momento.value;

                  return (
                    <button
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-4 ring-emerald-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50"
                      } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                      disabled={isOccupied}
                      key={momento.value}
                      type="button"
                      onClick={() => handleMomentoChange(momento.value)}
                    >
                      <span className="block font-black">{momento.label}</span>
                      <span className="mt-1 block text-xs font-bold">{isOccupied ? "Ocupado" : momento.detail}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isLoadingDisponibilidad && <StatusMessage>Consultando disponibilidad...</StatusMessage>}
            {availabilityError && <StatusMessage type="error">{availabilityError}</StatusMessage>}
            {!isLoadingDisponibilidad && disponibilidad && !hasAvailableMomentos && (
              <StatusMessage type="warning">No quedan turnos disponibles para esta fecha.</StatusMessage>
            )}
            {error && <StatusMessage type="error">{error}</StatusMessage>}
            {success && <StatusMessage type="success">{success}</StatusMessage>}

            <button
              className="ec-button-primary w-full"
              type="submit"
              disabled={isSubmitting || isLoadingDisponibilidad || !hasAvailableMomentos}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "Reservando..." : "Confirmar reserva"}
            </button>
          </form>
        </SurfaceCard>
      </div>
    </section>
  );
};
