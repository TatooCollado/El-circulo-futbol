import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHero, StatusMessage } from "../components/PolishedUi.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
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

const rolePriority = {
  super_admin: 1,
  admin: 2,
  cliente: 3
};

const USERS_PAGE_SIZE = 5;

const getPagination = (items, page) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / USERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * USERS_PAGE_SIZE;
  const endIndex = Math.min(startIndex + USERS_PAGE_SIZE, totalItems);

  return {
    currentPage,
    endIndex,
    items: items.slice(startIndex, endIndex),
    startIndex,
    totalItems,
    totalPages
  };
};

export const SuperAdminUsersPage = () => {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [filters, setFilters] = useState({ rol: "", estado: "" });
  const [usersPage, setUsersPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeUsers = useMemo(() => users.filter((user) => user.activo), [users]);
  const admins = useMemo(
    () => users.filter((user) => ["admin", "super_admin"].includes(user.rol) && user.activo),
    [users]
  );
  const isEditingSelf = editingUserId === currentUser?.id;
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesRol = filters.rol ? user.rol === filters.rol : true;
        const matchesEstado =
          filters.estado === "activo"
            ? user.activo
            : filters.estado === "inactivo"
              ? !user.activo
              : true;

        return matchesRol && matchesEstado;
      })
      .sort((a, b) => {
        if (a.activo !== b.activo) {
          return a.activo ? -1 : 1;
        }

        return (
          (rolePriority[a.rol] || 4) - (rolePriority[b.rol] || 4) ||
          a.apellido.localeCompare(b.apellido) ||
          a.nombre.localeCompare(b.nombre) ||
          a.id - b.id
        );
      });
  }, [filters, users]);

  const usersPagination = useMemo(
    () => getPagination(filteredUsers, usersPage),
    [filteredUsers, usersPage]
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
        toast.error(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [toast]);

  useEffect(() => {
    setUsersPage((currentPage) => {
      const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PAGE_SIZE));
      return Math.min(currentPage, totalPages);
    });
  }, [filteredUsers.length]);

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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setUsersPage(1);
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const handleUsersPageChange = (offset) => {
    setUsersPage((currentPage) => {
      const nextPage = currentPage + offset;
      return Math.min(Math.max(nextPage, 1), usersPagination.totalPages);
    });
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

    if (!form.nombre || !form.apellido || !form.email || (!editingUserId && !form.password)) {
      toast.error("Completá los campos obligatorios.");
      return;
    }

    if (form.password && form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
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
        toast.success("Usuario actualizado correctamente.");
      } else {
        await userService.createUser(payload);
        toast.success("Usuario creado correctamente.");
      }

      resetForm();
      await loadUsers();
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await userService.deleteUser(userId);
      toast.success("Usuario dado de baja correctamente.");
      await loadUsers();
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError));
    }
  };

  if (isLoading) {
    return (
      <StatusMessage>Cargando usuarios...</StatusMessage>
    );
  }

  return (
    <section className="space-y-6">
      <PageHero
        eyebrow="Control de accesos"
        title="Usuarios"
        description="Gestioná cuentas, roles y estado de acceso con una vista clara para operación y soporte."
        icon={UserCog}
        statLabel="Activos"
        statValue={activeUsers.length}
      />

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
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-700" />
            <h2 className="text-xl font-bold">{editingUserId ? "Editar usuario" : "Nuevo usuario"}</h2>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nombre</span>
                <input
                  className="ec-input"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Apellido</span>
                <input
                  className="ec-input"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="ec-input"
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
                  className="ec-select"
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  disabled={isEditingSelf}
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
                  className="ec-input"
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
                disabled={isEditingSelf}
              />
              Activo
            </label>
            {isEditingSelf && (
              <p className="text-sm text-slate-500">
                Tu propio rol y estado no se pueden modificar desde esta pantalla.
              </p>
            )}

            <div className="flex gap-2">
              <button
                className="ec-button-primary"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                {editingUserId ? "Guardar" : "Crear"}
              </button>

              {editingUserId && (
                <button
                  className="ec-button-outline"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-bold">Listado</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="rol"
                value={filters.rol}
                onChange={handleFilterChange}
              >
                <option value="">Todos los roles</option>
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
              No hay usuarios para los filtros seleccionados.
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
              <span>
                Mostrando {usersPagination.startIndex + 1}-{usersPagination.endIndex} de{" "}
                {usersPagination.totalItems}
              </span>
              {usersPagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    type="button"
                    onClick={() => handleUsersPageChange(-1)}
                    disabled={usersPagination.currentPage === 1}
                    title="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <span className="rounded-md bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 ring-1 ring-slate-200">
                    {usersPagination.currentPage} / {usersPagination.totalPages}
                  </span>
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    type="button"
                    onClick={() => handleUsersPageChange(1)}
                    disabled={usersPagination.currentPage === usersPagination.totalPages}
                    title="Página siguiente"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {usersPagination.items.map((user) => (
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md" key={user.id}>
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
