import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { userService } from "../services/userService.js";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

const emptyUserForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  rol: "cliente",
  activo: true
};

const roleLabels = {
  cliente: "Cliente",
  admin: "Admin",
  super_admin: "Super admin"
};

export const SuperAdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeUsers = useMemo(() => users.filter((user) => user.activo), [users]);
  const admins = useMemo(
    () => users.filter((user) => ["admin", "super_admin"].includes(user.rol) && user.activo),
    [users]
  );

  const loadUsers = async () => {
    const data = await userService.getUsers({ incluirInactivos: true });
    setUsers(data.users);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadUsers();
      } catch (loadError) {
        setError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const resetForm = () => {
    setForm(emptyUserForm);
    setEditingUserId(null);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: "",
      rol: user.rol,
      activo: user.activo
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nombre || !form.apellido || !form.email || (!editingUserId && !form.password)) {
      setError("Completá los campos obligatorios.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        email: form.email.trim().toLowerCase()
      };

      if (editingUserId) {
        await userService.updateUser(editingUserId, payload);
        setSuccess("Usuario actualizado correctamente.");
      } else {
        await userService.createUser(payload);
        setSuccess("Usuario creado correctamente.");
      }

      resetForm();
      await loadUsers();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    setError("");
    setSuccess("");

    try {
      await userService.deleteUser(userId);
      setSuccess("Usuario dado de baja correctamente.");
      await loadUsers();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
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
        <p className="mt-2 text-slate-600">Gestioná cuentas, roles y accesos del sistema.</p>
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
          <p className="text-sm text-slate-500">Usuarios totales</p>
          <p className="mt-1 text-3xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Activos</p>
          <p className="mt-1 text-3xl font-bold">{activeUsers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Admins</p>
          <p className="mt-1 text-3xl font-bold">{admins.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-700" />
            <h2 className="text-xl font-bold">{editingUserId ? "Editar usuario" : "Nuevo usuario"}</h2>
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
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Rol</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  {editingUserId ? "Nueva contraseña" : "Contraseña"}
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                checked={form.activo}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                name="activo"
                type="checkbox"
                onChange={handleChange}
              />
              Activo
            </label>

            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                {editingUserId ? "Guardar" : "Crear"}
              </button>

              {editingUserId && (
                <button
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  type="button"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Listado</h2>
          {users.map((user) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={user.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">
                    {user.nombre} {user.apellido}
                  </h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {roleLabels[user.rol] || user.rol}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        user.activo ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
                    type="button"
                    onClick={() => handleEdit(user)}
                    title="Editar usuario"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-md border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    disabled={!user.activo || user.id === currentUser?.id}
                    title="Dar de baja usuario"
                  >
                    <Trash2 className="h-4 w-4" />
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

