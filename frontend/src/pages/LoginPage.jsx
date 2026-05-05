import { LockKeyhole, LogIn, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { StatusMessage } from "../components/PolishedUi.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";
import { getRedirectAfterLogin } from "../utils/roleNavigation.js";

const AuthVisual = () => (
  <div className="relative hidden min-h-[500px] overflow-hidden rounded-xl bg-slate-950 text-white shadow-xl lg:block">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#042f2e,#047857_52%,#a3e635_130%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
    <div className="absolute inset-8 rounded-xl border-2 border-white/45" />
    <div className="absolute right-10 top-1/2 h-52 w-32 -translate-y-1/2 rounded-l-2xl border-y-2 border-l-2 border-white/45" />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/82 via-slate-950/32 to-transparent" />
    <div className="absolute bottom-8 left-8 max-w-[470px] rounded-2xl bg-slate-950/72 p-6 shadow-2xl ring-1 ring-white/15 backdrop-blur-md">
      <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-bold ring-1 ring-white/15">
        <Trophy className="h-4 w-4 text-amber-300" />
        El Círculo Fútbol
      </p>
      <h2 className="mt-5 text-3xl font-black leading-tight">
        Entrá y dejá tu próximo partido encaminado.
      </h2>
      <p className="mt-3 leading-7 text-emerald-50/85">
        Reservá, pagá en modo demo y consultá tu historial desde un solo lugar.
      </p>
    </div>
  </div>
);

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionExpired = searchParams.get("session") === "expired";

  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      navigate(getRedirectAfterLogin(user.rol, location.state?.from), { replace: true });
    }
  }, [isAuthenticated, location.state?.from, navigate, user?.rol]);

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
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
      <AuthVisual />

      <div className="flex">
        <section className="flex min-h-[500px] w-full flex-col justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-4xl font-black text-slate-950">Ingresar</h1>
          <p className="mt-2 leading-7 text-slate-600">Accedé a tu cuenta para reservar y seguir tus turnos.</p>

          {sessionExpired && (
            <div className="mt-5">
              <StatusMessage type="warning">Tu sesión venció. Ingresá nuevamente para continuar.</StatusMessage>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="ec-label">Email</span>
              <input
                className="ec-input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="tu@email.com"
              />
            </label>

            <label className="block">
              <span className="ec-label">Contraseña</span>
              <input
                className="ec-input"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>

            {error && <StatusMessage type="error">{error}</StatusMessage>}

            <button className="ec-button-primary w-full" type="submit" disabled={isSubmitting}>
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            ¿No tenés cuenta?{" "}
            <Link className="font-black text-emerald-700 hover:text-emerald-800" to="/register">
              Crear cuenta
            </Link>
          </p>
        </section>
      </div>
    </section>
  );
};
