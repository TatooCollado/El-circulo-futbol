import {
  BarChart3,
  CalendarDays,
  Goal,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
  UsersRound,
  X
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const getNavItems = (user) => {
  const publicItems = [{ to: "/canchas", label: "Canchas", icon: Goal }];

  if (!user) {
    return publicItems;
  }

  const canchasPreviewItem = { to: "/canchas", label: "Vista cliente", icon: Goal };

  if (user.rol === "cliente") {
    return [
      ...publicItems,
      { to: "/mis-reservas", label: "Mis reservas", icon: CalendarDays }
    ];
  }

  if (user.rol === "admin") {
    return [
      canchasPreviewItem,
      { to: "/admin", label: "Admin", icon: LayoutDashboard },
      { to: "/admin/usuarios", label: "Usuarios", icon: UsersRound },
      { to: "/admin/reportes", label: "Reportes", icon: BarChart3 }
    ];
  }

  if (user.rol === "super_admin") {
    return [
      canchasPreviewItem,
      { to: "/admin", label: "Admin", icon: LayoutDashboard },
      { to: "/super-admin/usuarios", label: "Usuarios", icon: UsersRound },
      { to: "/admin/reportes", label: "Reportes", icon: BarChart3 }
    ];
  }

  return publicItems;
};

const getDesktopNavClass = ({ isActive }) =>
  [
    "inline-flex items-center gap-2 rounded-md px-3 py-2 font-semibold transition",
    isActive
      ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  ].join(" ");

const getMobileNavClass = ({ isActive }) =>
  [
    "flex items-center gap-2 rounded-md px-3 py-2 font-medium transition",
    isActive
      ? "bg-emerald-50 text-emerald-700"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
  ].join(" ");

export const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = getNavItems(user);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-md pr-2 text-slate-950"
              onClick={closeMenu}
            >
              <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-600 text-sm font-black text-white shadow-sm shadow-emerald-900/20">
                EC
              </span>
              <span className="leading-tight">
                <span className="block text-lg font-black tracking-normal">El Círculo</span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fútbol club
                </span>
              </span>
            </Link>

            <button
              className="rounded-md border border-slate-300 p-2 text-slate-700 md:hidden"
              type="button"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden items-center gap-2 text-sm md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink className={getDesktopNavClass} end={item.to === "/admin"} key={item.to} to={item.to}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}

              <div className="mx-2 h-8 w-px bg-slate-200" />

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {user?.nombre || "Usuario"}
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 font-semibold text-white transition hover:bg-slate-800"
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </div>
              ) : (
                <>
                  <NavLink className={getDesktopNavClass} to="/login">
                    <LogIn className="h-4 w-4" />
                    Ingresar
                  </NavLink>
                  <Link
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:bg-emerald-700"
                    to="/register"
                  >
                    <UserPlus className="h-4 w-4" />
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>

          {isMenuOpen && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm md:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    className={getMobileNavClass}
                    end={item.to === "/admin"}
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}

              {isAuthenticated ? (
                <button
                  className="flex w-full items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-left font-semibold text-white"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              ) : (
                <>
                  <NavLink className={getMobileNavClass} to="/login" onClick={closeMenu}>
                    <LogIn className="h-4 w-4" />
                    Ingresar
                  </NavLink>
                  <Link
                    className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white"
                    to="/register"
                    onClick={closeMenu}
                  >
                    <UserPlus className="h-4 w-4" />
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
