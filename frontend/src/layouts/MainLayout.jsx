import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-bold">
            El Circulo Futbol
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/canchas" className="font-medium text-slate-700 hover:text-slate-950">
              Canchas
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/mis-reservas" className="font-medium text-slate-700 hover:text-slate-950">
                  Mis reservas
                </Link>
                {(user?.rol === "admin" || user?.rol === "super_admin") && (
                  <Link to="/admin" className="font-medium text-slate-700 hover:text-slate-950">
                    Admin
                  </Link>
                )}
                {user?.rol === "super_admin" && (
                  <>
                    <Link to="/super-admin/usuarios" className="font-medium text-slate-700 hover:text-slate-950">
                      Usuarios
                    </Link>
                    <Link to="/super-admin/reportes" className="font-medium text-slate-700 hover:text-slate-950">
                      Reportes
                    </Link>
                  </>
                )}
                <button
                  className="rounded-md bg-slate-950 px-3 py-2 text-white hover:bg-slate-800"
                  type="button"
                  onClick={logout}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-slate-700 hover:text-slate-950">
                  Ingresar
                </Link>
                <Link to="/register" className="rounded-md bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
