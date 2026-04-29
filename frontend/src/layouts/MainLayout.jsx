import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const getNavItems = (user) => {
  const publicItems = [{ to: "/canchas", label: "Canchas" }];

  if (!user) {
    return publicItems;
  }

  if (user.rol === "cliente") {
    return [
      ...publicItems,
      { to: "/mis-reservas", label: "Mis reservas" }
    ];
  }

  if (user.rol === "admin") {
    return [
      ...publicItems,
      { to: "/admin", label: "Admin" },
      { to: "/admin/reportes", label: "Reportes" }
    ];
  }

  if (user.rol === "super_admin") {
    return [
      ...publicItems,
      { to: "/admin", label: "Admin" },
      { to: "/super-admin/usuarios", label: "Usuarios" },
      { to: "/admin/reportes", label: "Reportes" }
    ];
  }

  return publicItems;
};

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
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-lg font-bold" onClick={closeMenu}>
              El Circulo Futbol
            </Link>

            <button
              className="rounded-md border border-slate-300 p-2 text-slate-700 md:hidden"
              type="button"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden items-center gap-4 text-sm md:flex">
              {navItems.map((item) => (
                <Link
                  className="font-medium text-slate-700 hover:text-slate-950"
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  className="rounded-md bg-slate-950 px-3 py-2 text-white hover:bg-slate-800"
                  type="button"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              ) : (
                <>
                  <Link className="font-medium text-slate-700 hover:text-slate-950" to="/login">
                    Ingresar
                  </Link>
                  <Link
                    className="rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700"
                    to="/register"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>

          {isMenuOpen && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm md:hidden">
              {navItems.map((item) => (
                <Link
                  className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  className="w-full rounded-md bg-slate-950 px-3 py-2 text-left font-semibold text-white"
                  type="button"
                  onClick={handleLogout}
                >
                  Salir
                </button>
              ) : (
                <>
                  <Link
                    className="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                    to="/login"
                    onClick={closeMenu}
                  >
                    Ingresar
                  </Link>
                  <Link
                    className="block rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white"
                    to="/register"
                    onClick={closeMenu}
                  >
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
