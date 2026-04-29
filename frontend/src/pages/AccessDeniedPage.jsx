import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const getHomePath = (rol) => {
  if (rol === "super_admin") {
    return "/super-admin/reportes";
  }

  if (rol === "admin") {
    return "/admin";
  }

  return "/canchas";
};

export const AccessDeniedPage = () => {
  const { rol } = useAuth();

  return (
    <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-700">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-3xl font-bold">Acceso denegado</h1>
      <p className="mt-2 text-slate-600">
        Tu rol no tiene permisos para entrar a esta seccion.
      </p>
      <Link
        className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        to={getHomePath(rol)}
      >
        Volver al inicio
      </Link>
    </section>
  );
};

