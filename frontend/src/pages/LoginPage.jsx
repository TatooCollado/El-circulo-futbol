import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { getRedirectAfterLogin } from "../utils/roleNavigation.js";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionExpired = searchParams.get("session") === "expired";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Completá email y contraseña para ingresar.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await login(form);
      const redirectTo = getRedirectAfterLogin(data.user.rol, location.state?.from);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ingresar</h1>
        <p className="text-slate-600">Accedé con tu cuenta para gestionar reservas.</p>
      </div>

      {sessionExpired && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Tu sesión venció. Ingresá nuevamente para continuar.
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Contraseña</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        ¿No tenés cuenta?{" "}
        <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to="/register">
          Crear cuenta
        </Link>
      </p>
    </section>
  );
};

