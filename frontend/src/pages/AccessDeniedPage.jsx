import { ArrowRight, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomePath, getRoleLabel } from "../utils/roleNavigation.js";

export const AccessDeniedPage = () => {
  const { isAuthenticated, rol } = useAuth();

  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-xl">
      <div className="relative bg-slate-950 px-6 py-12 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(190,18,60,0.72),rgba(15,23,42,0.96)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:auto,64px_64px]" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-red-700 shadow-lg">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="relative mt-5 text-4xl font-black">Acceso denegado</h1>
        <p className="relative mx-auto mt-3 max-w-md leading-7 text-slate-200">
          {isAuthenticated
            ? "Tu cuenta está activa, pero no tiene permisos para entrar a esta sección."
            : "Necesitás iniciar sesión con una cuenta habilitada para entrar a esta sección."}
        </p>
      </div>

      <div className="p-6">
        {isAuthenticated && (
          <p className="mx-auto w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-700">
            Rol actual: {getRoleLabel(rol)}
          </p>
        )}
        <Link className="ec-button-primary mt-6" to={getRoleHomePath(rol)}>
          {isAuthenticated ? "Ir a mi panel" : "Volver al inicio"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};
