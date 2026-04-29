import { CalendarDays, Mail, Plus, Search, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { userService } from "../services/userService.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const emptyClienteForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: ""
};

const normalizeText = (value) => {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const formatDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export const AdminUsersPage = () => {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(emptyClienteForm);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredClientes = useMemo(() => {
    const searchValue = normalizeText(search).trim();

    if (!searchValue) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      const searchable = [cliente.nombre, cliente.apellido, cliente.email].map(normalizeText).join(" ");
      return searchable.includes(searchValue);
    });
  }, [clientes, search]);

  const loadClientes = async () => {
    const data = await userService.getClientes();
    setClientes(data.clientes);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadClientes();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre || !form.apellido || !form.email || !form.password) {
      setError("Completá nombre, apellido, email y contraseña.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      await userService.createCliente({
        ...form,
        email: form.email.trim().toLowerCase()
      });
      setForm(emptyClienteForm);
      setSuccess("Cliente creado correctamente.");
      await loadClientes();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
        Cargando usuarios...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="mt-2 text-slate-600">Clientes activos del complejo.</p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Clientes activos</p>
              <p className="mt-1 text-3xl font-bold">{clientes.length}</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Resultados visibles</p>
              <p className="mt-1 text-3xl font-bold">{filteredClientes.length}</p>
            </div>
            <div className="rounded-md bg-slate-100 p-3 text-slate-700">
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-700" />
            <h2 className="text-xl font-bold">Nuevo cliente</h2>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nombre</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Apellido</span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Contraseña provisoria</span>
              <input
                autoComplete="new-password"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
            </label>

            <button
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-400"
              type="submit"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Creando..." : "Crear cliente"}
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold">Listado</h2>
            <label className="relative block sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Buscar cliente o email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {filteredClientes.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-white p-6 text-slate-600">
              No hay clientes para la búsqueda ingresada.
            </div>
          )}

          {filteredClientes.map((cliente) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={cliente.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">
                    {cliente.nombre} {cliente.apellido}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    {cliente.email}
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(cliente.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
};
