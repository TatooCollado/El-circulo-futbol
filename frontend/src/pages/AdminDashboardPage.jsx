import {
  Activity,
  Ban,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Eye,
  EyeOff,
  Map,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

const emptyClienteForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: ""
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

const activeReservaStates = ["pendiente_pago", "confirmada"];

const canchaTypeLabels = {
  futbol_5: "Fútbol 5",
  futbol_7: "Fútbol 7",
  futbol_11: "Fútbol 11"
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

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const estadoBadgeClasses = {
  pendiente_pago: "bg-amber-50 text-amber-700 ring-amber-100",
  confirmada: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelada: "bg-red-50 text-red-700 ring-red-100",
  vencida: "bg-slate-100 text-slate-700 ring-slate-200",
  rechazada: "bg-red-50 text-red-700 ring-red-100"
};

const statToneClasses = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
};

const normalizeText = (value) => {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const getClientLabel = (cliente) => {
  const fullName = [cliente?.nombre, cliente?.apellido].filter(Boolean).join(" ").trim();
  return fullName || "Cliente";
};

const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatReservaDate = (dateString) => {
  return parseLocalDate(dateString).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
};

const formatMonthValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getMonthLabel = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric"
  });
};

const buildCalendarDays = (monthValue, reservas) => {
  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startPadding = (firstDay.getDay() + 6) % 7;
  const reservasByDate = reservas.reduce((acc, reserva) => {
    const current = acc.get(reserva.fecha) || [];
    acc.set(reserva.fecha, [...current, reserva]);
    return acc;
  }, new Map());

  const days = Array.from({ length: startPadding }, (_, index) => ({
    key: `empty-${index}`,
    date: null
  }));

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    days.push({
      key: date,
      date,
      day,
      reservas: reservasByDate.get(date) || []
    });
  }

  return days;
};

const StatCard = ({ icon: Icon, label, value, detail, tone = "emerald" }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
        {detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}
      </div>
      <div className={`rounded-md p-3 ring-1 ${statToneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </article>
);

const SectionTitle = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
    <div>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

const EstadoBadge = ({ estado }) => (
  <span
    className={`rounded-md px-2 py-1 text-xs font-bold ring-1 ${
      estadoBadgeClasses[estado] || "bg-slate-100 text-slate-700 ring-slate-200"
    }`}
  >
    {estadoLabels[estado] || estado}
  </span>
);

export const AdminDashboardPage = () => {
  const reservaFormRef = useRef(null);
  const today = getLocalDateString();
  const [canchas, setCanchas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [form, setForm] = useState(emptyCanchaForm);
  const [clienteForm, setClienteForm] = useState(emptyClienteForm);
  const [reservaForm, setReservaForm] = useState(createEmptyReservaForm);
  const [editingReservaId, setEditingReservaId] = useState(null);
  const [filters, setFilters] = useState({ estado: "", canchaId: "", fecha: "", busqueda: "" });
  const [showCancelledGlobal, setShowCancelledGlobal] = useState(false);
  const [showCancelledForSelectedDay, setShowCancelledForSelectedDay] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(getLocalDateString().slice(0, 7));
  const [editingCanchaId, setEditingCanchaId] = useState(null);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReserva, setIsSubmittingReserva] = useState(false);
  const [isSubmittingCliente, setIsSubmittingCliente] = useState(false);
  const [updatingReservaId, setUpdatingReservaId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeReservas = useMemo(
    () => reservas.filter((reserva) => activeReservaStates.includes(reserva.estado)),
    [reservas]
  );

  const canchasDisponibles = useMemo(
    () => canchas.filter((cancha) => cancha.disponible),
    [canchas]
  );

  const reservasPendientes = useMemo(
    () => activeReservas.filter((reserva) => reserva.estado === "pendiente_pago"),
    [activeReservas]
  );

  const reservasConfirmadas = useMemo(
    () => activeReservas.filter((reserva) => reserva.estado === "confirmada"),
    [activeReservas]
  );

  const reservasHoy = useMemo(
    () => activeReservas.filter((reserva) => reserva.fecha === today),
    [activeReservas, today]
  );

  const ingresosActivos = useMemo(
    () => activeReservas.reduce((total, reserva) => total + Number(reserva.precioFinal || 0), 0),
    [activeReservas]
  );

  const reservasConFiltrosOperativos = useMemo(() => {
    const busqueda = normalizeText(filters.busqueda).trim();

    return reservas.filter((reserva) => {
      const cliente = getClientLabel(reserva.User);
      const matchesEstado = filters.estado ? reserva.estado === filters.estado : true;
      const matchesCancha = filters.canchaId ? String(reserva.canchaId) === filters.canchaId : true;
      const searchable = [
        cliente,
        reserva.User?.email,
        reserva.Cancha?.nombre,
        reserva.fecha,
        momentoLabels[reserva.momento],
        estadoLabels[reserva.estado]
      ]
        .map(normalizeText)
        .join(" ");
      const matchesBusqueda = busqueda ? searchable.includes(busqueda) : true;

      return matchesEstado && matchesCancha && matchesBusqueda;
    });
  }, [filters.busqueda, filters.canchaId, filters.estado, reservas]);

  const cancelledReservasConFiltros = useMemo(
    () => reservasConFiltrosOperativos.filter((reserva) => reserva.estado === "cancelada"),
    [reservasConFiltrosOperativos]
  );

  const selectedDayCancelledCount = useMemo(() => {
    if (!filters.fecha) {
      return 0;
    }

    return cancelledReservasConFiltros.filter((reserva) => reserva.fecha === filters.fecha).length;
  }, [cancelledReservasConFiltros, filters.fecha]);

  const reservasFiltradasBase = useMemo(() => {
    return reservasConFiltrosOperativos.filter((reserva) => {
      const isActiveReserva = activeReservaStates.includes(reserva.estado);
      const isCancelledReserva = reserva.estado === "cancelada";
      const shouldShowSelectedDayCancelled =
        Boolean(filters.fecha) && showCancelledForSelectedDay && reserva.fecha === filters.fecha;

      return isActiveReserva || (isCancelledReserva && (showCancelledGlobal || shouldShowSelectedDayCancelled));
    });
  }, [filters.fecha, reservasConFiltrosOperativos, showCancelledForSelectedDay, showCancelledGlobal]);

  const filteredReservas = useMemo(() => {
    const reservasPorFecha = filters.fecha
      ? reservasFiltradasBase.filter((reserva) => reserva.fecha === filters.fecha)
      : reservasFiltradasBase;

    return [...reservasPorFecha].sort((a, b) => {
      const dateSort = a.fecha.localeCompare(b.fecha);

      if (dateSort !== 0) {
        return dateSort;
      }

      return momentoOrder[a.momento] - momentoOrder[b.momento] || b.id - a.id;
    });
  }, [filters.fecha, reservasFiltradasBase]);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth, reservasFiltradasBase),
    [calendarMonth, reservasFiltradasBase]
  );

  const selectedSlotConflict = useMemo(() => {
    if (!reservaForm.canchaId || !reservaForm.fecha || !reservaForm.momento) {
      return null;
    }

    return reservas.find((reserva) => {
      return (
        activeReservaStates.includes(reserva.estado) &&
        reserva.id !== editingReservaId &&
        String(reserva.canchaId) === String(reservaForm.canchaId) &&
        reserva.fecha === reservaForm.fecha &&
        reserva.momento === reservaForm.momento
      );
    });
  }, [editingReservaId, reservaForm.canchaId, reservaForm.fecha, reservaForm.momento, reservas]);

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

  const handleClienteFormChange = (event) => {
    const { name, value } = event.target;
    setClienteForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleReservaFormChange = (event) => {
    const { name, value } = event.target;
    setReservaForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));

    if (name === "fecha" && value) {
      setCalendarMonth(value.slice(0, 7));
    }

    if (name === "fecha") {
      setShowCancelledGlobal(false);
      setShowCancelledForSelectedDay(false);
    }
  };

  const resetCanchaForm = () => {
    setForm(emptyCanchaForm);
    setEditingCanchaId(null);
  };

  const resetClienteForm = () => {
    setClienteForm(emptyClienteForm);
    setShowClienteForm(false);
  };

  const resetReservaForm = () => {
    setReservaForm(createEmptyReservaForm());
    setEditingReservaId(null);
  };

  const handleClearFilters = () => {
    setFilters({ estado: "", canchaId: "", fecha: "", busqueda: "" });
    setShowCancelledGlobal(false);
    setShowCancelledForSelectedDay(false);
  };

  const handleToggleCancelledGlobal = () => {
    setShowCancelledGlobal((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        setShowCancelledForSelectedDay(false);
      }

      return nextValue;
    });
  };

  const handleCalendarMonthChange = (offset) => {
    const [year, month] = calendarMonth.split("-").map(Number);
    setCalendarMonth(formatMonthValue(new Date(year, month - 1 + offset, 1)));
  };

  const handleCalendarDayClick = (date) => {
    if (!date) {
      return;
    }

    setShowCancelledGlobal(false);
    setShowCancelledForSelectedDay(false);
    setFilters((currentFilters) => ({
      ...currentFilters,
      fecha: currentFilters.fecha === date ? "" : date
    }));
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

  const handleEditReserva = (reserva) => {
    setError("");
    setSuccess("");
    setShowClienteForm(false);
    setEditingReservaId(reserva.id);
    setReservaForm({
      usuarioId: String(reserva.usuarioId),
      canchaId: String(reserva.canchaId),
      fecha: reserva.fecha,
      momento: reserva.momento,
      estado: activeReservaStates.includes(reserva.estado) ? reserva.estado : "confirmada"
    });

    window.requestAnimationFrame(() => {
      reservaFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      reservaFormRef.current?.focus({ preventScroll: true });
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

  const handleSubmitCliente = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!clienteForm.nombre || !clienteForm.apellido || !clienteForm.email || !clienteForm.password) {
      setError("Completá nombre, apellido, email y contraseña para crear el cliente.");
      return;
    }

    try {
      setIsSubmittingCliente(true);
      const data = await reservaService.createClienteParaReserva(clienteForm);
      await loadAdminData();
      setReservaForm((currentForm) => ({
        ...currentForm,
        usuarioId: String(data.cliente.id)
      }));
      resetClienteForm();
      setSuccess("Cliente creado y seleccionado para la reserva.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmittingCliente(false);
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

    if (selectedSlotConflict) {
      setError("Ese turno ya está ocupado por otra reserva activa.");
      return;
    }

    try {
      setIsSubmittingReserva(true);
      const payload = {
        ...reservaForm,
        usuarioId: Number(reservaForm.usuarioId),
        canchaId: Number(reservaForm.canchaId)
      };

      if (editingReservaId) {
        await reservaService.updateReservaAdmin(editingReservaId, payload);
        setSuccess("Reserva actualizada correctamente.");
      } else {
        await reservaService.createReservaAdmin(payload);
        setSuccess("Reserva manual creada correctamente.");
      }

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
      setUpdatingReservaId(reservaId);
      await reservaService.confirmReserva(reservaId);
      setSuccess("Reserva confirmada correctamente.");
      await loadAdminData();
    } catch (confirmError) {
      setError(getApiErrorMessage(confirmError));
    } finally {
      setUpdatingReservaId(null);
    }
  };

  const handleCancelReserva = async (reservaId) => {
    setError("");
    setSuccess("");

    try {
      setUpdatingReservaId(reservaId);
      await reservaService.cancelReserva(reservaId);
      setSuccess("Reserva cancelada correctamente.");
      if (editingReservaId === reservaId) {
        resetReservaForm();
      }
      await loadAdminData();
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError));
    } finally {
      setUpdatingReservaId(null);
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <Activity className="h-4 w-4" />
            Operación diaria
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Panel admin</h1>
          <p className="mt-2 text-slate-600">Gestioná canchas, disponibilidad y reservas desde una vista operativa.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-sm font-medium text-slate-500">Reservas de hoy</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{reservasHoy.length}</p>
        </div>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Map}
          label="Canchas disponibles"
          value={`${canchasDisponibles.length}/${canchas.length}`}
          detail="Alta, edición y baja lógica"
        />
        <StatCard
          icon={ClipboardList}
          label="Reservas activas"
          value={activeReservas.length}
          detail={`${reservasConfirmadas.length} confirmadas`}
          tone="sky"
        />
        <StatCard
          icon={CalendarDays}
          label="Pendientes de pago"
          value={reservasPendientes.length}
          detail="Requieren seguimiento"
          tone="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Importe activo"
          value={formatPrice(ingresosActivos)}
          detail="Reservas activas actuales"
          tone="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle
              title={editingCanchaId ? "Editar cancha" : "Nueva cancha"}
              description="Administrá disponibilidad, tipo y precio."
            />

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
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
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

          <div
            className={`scroll-mt-24 rounded-lg border bg-white p-4 shadow-sm outline-none transition ${
              editingReservaId ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"
            }`}
            ref={reservaFormRef}
            tabIndex={-1}
          >
            <SectionTitle
              title={editingReservaId ? "Editar reserva" : "Reserva manual"}
              description={
                editingReservaId
                  ? "Corregí cliente, cancha, fecha o momento de una reserva activa."
                  : "Creá un cliente si todavía no existe y dejalo seleccionado."
              }
              action={
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  type="button"
                  onClick={() => setShowClienteForm((current) => !current)}
                >
                  <UserPlus className="h-4 w-4" />
                  Nuevo cliente
                </button>
              }
            />

            {showClienteForm && (
              <form
                className="mt-4 rounded-md border border-emerald-100 bg-emerald-50/60 p-3"
                onSubmit={handleSubmitCliente}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Nombre</span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      name="nombre"
                      value={clienteForm.nombre}
                      onChange={handleClienteFormChange}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Apellido</span>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      name="apellido"
                      value={clienteForm.apellido}
                      onChange={handleClienteFormChange}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Email</span>
                    <input
                      autoComplete="email"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      name="email"
                      type="email"
                      value={clienteForm.email}
                      onChange={handleClienteFormChange}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Contraseña provisoria</span>
                    <input
                      autoComplete="new-password"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      name="password"
                      type="password"
                      value={clienteForm.password}
                      onChange={handleClienteFormChange}
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
                    type="submit"
                    disabled={isSubmittingCliente}
                  >
                    <UserPlus className="h-4 w-4" />
                    {isSubmittingCliente ? "Creando..." : "Crear cliente"}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    type="button"
                    onClick={resetClienteForm}
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </button>
                </div>
              </form>
            )}

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

              {reservaForm.canchaId && reservaForm.fecha && reservaForm.momento && (
                <div
                  className={`rounded-md border p-3 text-sm ${
                    selectedSlotConflict
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {selectedSlotConflict
                    ? `Turno ocupado por ${getClientLabel(selectedSlotConflict.User)} en ${
                        selectedSlotConflict.Cancha?.nombre || "esa cancha"
                      }.`
                    : "Turno disponible para reservar."}
                </div>
              )}

              <button
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
                type="submit"
                disabled={isSubmittingReserva || Boolean(selectedSlotConflict)}
              >
                <Plus className="h-4 w-4" />
                {isSubmittingReserva
                  ? editingReservaId
                    ? "Guardando..."
                    : "Creando..."
                  : editingReservaId
                    ? "Guardar reserva"
                    : "Crear reserva"}
              </button>
              {editingReservaId && (
                <button
                  className="ml-2 inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={resetReservaForm}
                >
                  <X className="h-4 w-4" />
                  Cancelar edición
                </button>
              )}
            </form>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle
              title="Canchas del complejo"
              description="Estado operativo y acciones rápidas."
              action={
                <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                  {canchas.length}
                </span>
              }
            />
            <div className="mt-4 max-h-[430px] space-y-3 overflow-auto pr-1">
            {canchas.map((cancha) => (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={cancha.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-slate-950">{cancha.nombre}</h3>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {canchaTypeLabels[cancha.tipo] || cancha.tipo}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-black text-slate-950">{formatPrice(cancha.precio)}</p>
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
                      className="rounded-md border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
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
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle
              title="Agenda y filtros"
              description="Búsqueda por cliente, cancha, fecha y estado."
              action={
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </button>
              }
            />

            <div className="mt-4 grid gap-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="busqueda"
                  placeholder="Buscar cliente, email, cancha..."
                  value={filters.busqueda}
                  onChange={handleFilterChange}
                />
              </label>
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

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!filters.fecha && (
                <button
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    showCancelledGlobal
                      ? "border-slate-400 bg-slate-100 text-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  } disabled:opacity-50`}
                  type="button"
                  onClick={handleToggleCancelledGlobal}
                  disabled={cancelledReservasConFiltros.length === 0}
                >
                  {showCancelledGlobal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showCancelledGlobal
                    ? "Ocultar canceladas totales"
                    : `Mostrar canceladas totales (${cancelledReservasConFiltros.length})`}
                </button>
              )}

              {filters.fecha && (
                <button
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    showCancelledForSelectedDay
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  } disabled:opacity-50`}
                  type="button"
                  onClick={() => setShowCancelledForSelectedDay((currentValue) => !currentValue)}
                  disabled={selectedDayCancelledCount === 0}
                >
                  {showCancelledForSelectedDay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showCancelledForSelectedDay
                    ? "Ocultar canceladas del día"
                    : `Mostrar canceladas del día (${selectedDayCancelledCount})`}
                </button>
              )}

              {!showCancelledGlobal && !showCancelledForSelectedDay && (
                <span className="text-sm font-medium text-slate-500">Vista operativa: solo reservas activas.</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-100">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black capitalize text-slate-950">{getMonthLabel(calendarMonth)}</h3>
                  <p className="text-sm text-slate-500">Click en un día para filtrar la lista.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={() => handleCalendarMonthChange(-1)}
                  title="Mes anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="rounded-md border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={() => handleCalendarMonthChange(1)}
                  title="Mes siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarDays.map((day) =>
                day.date ? (
                  <button
                    className={`min-h-24 rounded-md border p-2 text-left transition hover:border-emerald-300 hover:bg-emerald-50 ${
                      filters.fecha === day.date
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                    key={day.key}
                    type="button"
                    onClick={() => handleCalendarDayClick(day.date)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-800">{day.day}</span>
                      {day.reservas.length > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {day.reservas.length}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block space-y-0.5">
                      {day.reservas.slice(0, 2).map((reserva) => (
                        <span
                          className="block truncate rounded-sm bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
                          key={reserva.id}
                          title={`${getClientLabel(reserva.User)} - ${reserva.Cancha?.nombre || "Cancha"}`}
                        >
                          {momentoLabels[reserva.momento]} · {reserva.Cancha?.nombre || "Cancha"}
                        </span>
                      ))}
                    </span>
                  </button>
                ) : (
                  <div className="min-h-24 rounded-md border border-transparent" key={day.key} />
                )
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle
              title="Reservas filtradas"
              description={filters.fecha ? `Vista del día ${filters.fecha}` : "Ordenadas por fecha y turno."}
              action={
                <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                  {filteredReservas.length}
                </span>
              }
            />

            {filteredReservas.length === 0 ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-6 text-slate-600">
                No hay reservas para los filtros seleccionados.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredReservas.map((reserva) => {
                  const canConfirm = reserva.estado === "pendiente_pago";
                  const canCancel = ["pendiente_pago", "confirmada"].includes(reserva.estado);
                  const canEdit = activeReservaStates.includes(reserva.estado);
                  const isUpdating = updatingReservaId === reserva.id;

                  return (
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={reserva.id}>
                      <div className="grid gap-3 xl:grid-cols-[1.1fr_1fr_auto] xl:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-black text-slate-950">{reserva.Cancha?.nombre || "Cancha"}</h3>
                            <EstadoBadge estado={reserva.estado} />
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {getClientLabel(reserva.User)} · {reserva.User?.email || "Sin email"}
                          </p>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-600 xl:grid-cols-2">
                          <span className="rounded-md bg-white px-3 py-2 ring-1 ring-slate-200">
                            {formatReservaDate(reserva.fecha)} · {momentoLabels[reserva.momento]}
                          </span>
                          <span className="rounded-md bg-white px-3 py-2 font-bold text-slate-800 ring-1 ring-slate-200">
                            {formatPrice(reserva.precioFinal)}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                              type="button"
                              onClick={() => handleEditReserva(reserva)}
                              disabled={isUpdating}
                              title="Editar reserva"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canConfirm && (
                            <button
                              className="rounded-md border border-emerald-200 bg-white p-2 text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                              type="button"
                              onClick={() => handleConfirmReserva(reserva.id)}
                              disabled={isUpdating}
                              title="Confirmar reserva"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {canCancel && (
                            <button
                              className="rounded-md border border-red-200 bg-white p-2 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                              type="button"
                              onClick={() => handleCancelReserva(reserva.id)}
                              disabled={isUpdating}
                              title="Cancelar reserva"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {!canConfirm && !canCancel && (
                            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                              Sin acciones
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};
