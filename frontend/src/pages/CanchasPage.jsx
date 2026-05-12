import { CalendarDays, Goal, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState, FieldArtwork, PageHero, StatusMessage } from "../components/PolishedUi.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { canchaService } from "../services/canchaService.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { polishCanchaDescription } from "../utils/text.js";

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
  const { isAuthenticated, rol } = useAuth();
  const navigate = useNavigate();
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

  const canReserve = !isAuthenticated || rol === "cliente";
  const isAdminPreview = rol === "admin" || rol === "super_admin";

  const handleCardClick = (canchaId) => {
    if (canReserve) {
      navigate(`/reservar/${canchaId}`);
    }
  };

  const handleCardKeyDown = (event, canchaId) => {
    if (!canReserve) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(`/reservar/${canchaId}`);
    }
  };

  return (
    <section className="space-y-8">
      <PageHero
        eyebrow="Canchas listas para jugar"
        title="Elegí tu cancha y reservá en minutos."
        description="Fútbol 5, 7 u 11. Compará precios, revisá el formato y asegurá tu turno por mañana, tarde o noche."
        icon={Goal}
        statLabel="Turnos"
        statValue="3 por día"
      />

      {isLoading && <StatusMessage>Cargando canchas disponibles...</StatusMessage>}

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {!isLoading && !error && canchas.length === 0 && (
        <EmptyState
          icon={Goal}
          title="No hay canchas disponibles"
          description="Volvé a intentar más tarde o consultá con el complejo."
        />
      )}

      {isAdminPreview && (
        <section className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-emerald-950">Vista cliente</p>
            <p className="mt-1 text-sm text-emerald-800">
              Esta es la experiencia pública de reserva. La gestión operativa sigue en el panel admin.
            </p>
          </div>
          <Link className="ec-button-primary" to="/admin">
            <Sparkles className="h-4 w-4" />
            Gestionar canchas
          </Link>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {canchas.map((cancha) => (
          <article
            className={`group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition ${
              canReserve
                ? "cursor-pointer hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/10 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                : ""
            }`}
            key={cancha.id}
            role={canReserve ? "link" : undefined}
            tabIndex={canReserve ? 0 : undefined}
            onClick={() => handleCardClick(cancha.id)}
            onKeyDown={(event) => handleCardKeyDown(event, cancha.id)}
          >
            <FieldArtwork title={cancha.nombre} label="Cancha" type={tipoLabels[cancha.tipo] || cancha.tipo} />
            <div className="space-y-5 p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-black leading-tight text-slate-950">{cancha.nombre}</h2>
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-black uppercase text-amber-700">
                    {tipoLabels[cancha.tipo] || cancha.tipo}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                  {polishCanchaDescription(cancha.descripcion) || "Cancha lista para reservar en el turno que prefieras."}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                <MapPin className="h-4 w-4 text-emerald-700" />
                El Círculo Fútbol
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">Precio</p>
                  <p className="text-2xl font-black text-slate-950">{formatPrice(cancha.precio)}</p>
                </div>
                {canReserve && (
                  <Link
                    className="ec-button-primary"
                    to={`/reservar/${cancha.id}`}
                    onClick={(event) => event.stopPropagation()}
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
