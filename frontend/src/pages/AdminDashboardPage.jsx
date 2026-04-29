import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { canchaService } from "../services/canchaService.js";
import { reservaService } from "../services/reservaService.js";
import { getLocalDateString } from "../utils/date.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const emptyCanchaForm = {
  nombre: "",
  tipo: "futbol_5",
  descripcion: "",
  precio: "",
  disponible: true
};

const createEmptyReservaForm = () => ({
  usuarioId: "",
  canchaId: "",
  fecha: getLocalDateString(),
  momento: "manana",
  estado: "confirmada"
});

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

export const AdminDashboardPage = () => {
  const [canchas, setCanchas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [form, setForm] = useState(emptyCanchaForm);
  const [reservaForm, setReservaForm] = useState(createEmptyReservaForm);
  const [filters, setFilters] = useState({ estado: "", canchaId: "", fecha: "" });
  const [editingCanchaId, setEditingCanchaId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReserva, setIsSubmittingReserva] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeReservas = useMemo(
    () => reservas.filter((reserva) => ["pendiente_pago", "confirmada"].includes(reserva.estado)),
    [reservas]
  );

  const canchasDisponibles = useMemo(
    () => canchas.filter((cancha) => cancha.disponible),
    [canchas]
  );

  const filteredReservas = useMemo(() => {
    return reservas.filter((reserva) => {
      const matchesEstado = filters.estado ? reserva.estado === filters.estado : true;
      const matchesCancha = filters.canchaId ? String(reserva.canchaId) === filters.canchaId : true;
      const matchesFecha = filters.fecha ? reserva.fecha === filters.fecha : true;

      return matchesEstado && matchesCancha && matchesFecha;
    });
  }, [filters, reservas]);

  const loadAdminData = async () => {
    const [canchasData, reservasData, clientesData] = await Promise.all([
      canchaService.getCanchasAdmin(),
      reservaService.getReservas(),
      reservaService.getClientesParaReserva()
    ]);
    setCanchas(canchasData.canchas);
    setReservas(reservasData.reservas);
    setClientes(clientesData.clientes);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadAdminData();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleReservaFormChange = (event) => {
    const { name, value } = event.target;
    setReservaForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const resetCanchaForm = () => {
    setForm(emptyCanchaForm);
    setEditingCanchaId(null);
  };

  const resetReservaForm = () => {
    setReservaForm(createEmptyReservaForm());
  };

  const handleEditCancha = (cancha) => {
    setEditingCanchaId(cancha.id);
    setForm({
      nombre: cancha.nombre,
      tipo: cancha.tipo,
      descripcion: cancha.descripcion || "",
      precio: cancha.precio,
      disponible: cancha.disponible
    });
  };

  const handleSubmitCancha = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre || !form.precio) {
      setError("Completá nombre y precio de la cancha.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        precio: Number(form.precio)
      };

      if (editingCanchaId) {
        await canchaService.updateCancha(editingCanchaId, payload);
        setSuccess("Cancha actualizada correctamente.");
      } else {
        await canchaService.createCancha(payload);
        setSuccess("Cancha creada correctamente.");
      }

      resetCanchaForm();
      await loadAdminData();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReserva = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!reservaForm.usuarioId || !reservaForm.canchaId || !reservaForm.fecha || !reservaForm.momento) {
      setError("Completá usuario, cancha, fecha y momento para crear la reserva.");
      return;
    }

    try {
      setIsSubmittingReserva(true);
      await reservaService.createReservaAdmin({
        ...reservaForm,
        usuarioId: Number(reservaForm.usuarioId),
        canchaId: Number(reservaForm.canchaId)
      });
      setSuccess("Reserva manual creada correctamente.");
      resetReservaForm();
      await loadAdminData();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmittingReserva(false);
    }
  };

  const handleDeleteCancha = async (canchaId) => {
    setError("");
    setSuccess("");

    try {
      await canchaService.deleteCancha(canchaId);
      setSuccess("Cancha dada de baja correctamente.");
      await loadAdminData();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    }
  };

  const handleConfirmReserva = async (reservaId) => {
    setError("");
    setSuccess("");

    try {
      await reservaService.confirmReserva(reservaId);
      setSuccess("Reserva confirmada correctamente.");
      await loadAdminData();
    } catch (confirmError) {
      setError(getApiErrorMessage(confirmError));
    }
  };

  const handleCancelReserva = async (reservaId) => {
    setError("");
    setSuccess("");

    try {
      await reservaService.cancelReserva(reservaId);
      setSuccess("Reserva cancelada correctamente.");
      await loadAdminData();
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError));
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
        Cargando panel admin...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel admin</h1>
        <p className="mt-2 text-slate-600">Gestioná canchas, disponibilidad y reservas.</p>
      </div>

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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Canchas totales</p>
          <p className="mt-1 text-3xl font-bold">{canchas.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Disponibles</p>
          <p className="mt-1 text-3xl font-bold">{canchasDisponibles.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Reservas activas</p>
          <p className="mt-1 text-3xl font-bold">{activeReservas.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold">
              {editingCanchaId ? "Editar cancha" : "Nueva cancha"}
            </h2>

            <form className="mt-4 space-y-3" onSubmit={handleSubmitCancha}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nombre</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Tipo</span>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    name="tipo"
                    value={form.tipo}
                    onChange={handleFormChange}
                  >
                    <option value="futbol_5">Fútbol 5</option>
                    <option value="futbol_7">Fútbol 7</option>
                    <option value="futbol_11">Fútbol 11</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Precio</span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    min="0"
                    name="precio"
                    type="number"
                    value={form.precio}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Descripción</span>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  checked={form.disponible}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  name="disponible"
                  type="checkbox"
                  onChange={handleFormChange}
                />
                Disponible
              </label>

              <div className="flex gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  {editingCanchaId ? "Guardar" : "Crear"}
                </button>
                {editingCanchaId && (
                  <button
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    type="button"
                    onClick={resetCanchaForm}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold">Reserva manual</h2>

            <form className="mt-4 space-y-3" onSubmit={handleSubmitReserva}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Cliente</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="usuarioId"
                  value={reservaForm.usuarioId}
                  onChange={handleReservaFormChange}
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.apellido}, {cliente.nombre} · {cliente.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Cancha</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="canchaId"
                  value={reservaForm.canchaId}
                  onChange={handleReservaFormChange}
                >
                  <option value="">Seleccionar cancha</option>
                  {canchasDisponibles.map((cancha) => (
                    <option key={cancha.id} value={cancha.id}>
                      {cancha.nombre} · {formatPrice(cancha.precio)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Fecha</span>
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    min={getLocalDateString()}
                    name="fecha"
                    type="date"
                    value={reservaForm.fecha}
                    onChange={handleReservaFormChange}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Momento</span>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    name="momento"
                    value={reservaForm.momento}
                    onChange={handleReservaFormChange}
                  >
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Estado</span>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    name="estado"
                    value={reservaForm.estado}
                    onChange={handleReservaFormChange}
                  >
                    <option value="confirmada">Confirmada</option>
                    <option value="pendiente_pago">Pendiente</option>
                  </select>
                </label>
              </div>

              <button
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                type="submit"
                disabled={isSubmittingReserva}
              >
                <Plus className="h-4 w-4" />
                {isSubmittingReserva ? "Creando..." : "Crear reserva"}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {canchas.map((cancha) => (
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={cancha.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-950">{cancha.nombre}</h3>
                    <p className="text-sm text-slate-600">
                      {cancha.tipo.replace("_", " ")} · {formatPrice(cancha.precio)}
                    </p>
                    <p className={`mt-1 text-sm font-semibold ${cancha.disponible ? "text-emerald-700" : "text-red-700"}`}>
                      {cancha.disponible ? "Disponible" : "No disponible"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-md border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
                      type="button"
                      onClick={() => handleEditCancha(cancha)}
                      title="Editar cancha"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                      onClick={() => handleDeleteCancha(cancha.id)}
                      disabled={!cancha.disponible}
                      title="Dar de baja cancha"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-xl font-bold">Reservas</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
              >
                <option value="">Todos los estados</option>
                {Object.entries(estadoLabels).map(([estado, label]) => (
                  <option key={estado} value={estado}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="canchaId"
                value={filters.canchaId}
                onChange={handleFilterChange}
              >
                <option value="">Todas las canchas</option>
                {canchas.map((cancha) => (
                  <option key={cancha.id} value={cancha.id}>
                    {cancha.nombre}
                  </option>
                ))}
              </select>
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="fecha"
                type="date"
                value={filters.fecha}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {filteredReservas.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
              No hay reservas para los filtros seleccionados.
            </div>
          )}

          {filteredReservas.map((reserva) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={reserva.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">{reserva.Cancha?.nombre || "Cancha"}</h3>
                  <p className="text-sm text-slate-600">
                    {reserva.User?.nombre} {reserva.User?.apellido} · {reserva.fecha} ·{" "}
                    {momentoLabels[reserva.momento]}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {estadoLabels[reserva.estado]} · {formatPrice(reserva.precioFinal)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-emerald-200 p-2 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => handleConfirmReserva(reserva.id)}
                    disabled={reserva.estado !== "pendiente_pago"}
                    title="Confirmar reserva"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-md border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => handleCancelReserva(reserva.id)}
                    disabled={!["pendiente_pago", "confirmada"].includes(reserva.estado)}
                    title="Cancelar reserva"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
};

