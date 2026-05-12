import { Goal, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getApiErrorMessage } from "../utils/getApiErrorMessage.js";

export const RegisterPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nombre || !form.apellido || !form.email || !form.password) {
      toast.error("Completá todos los campos para crear tu cuenta.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(form);
      navigate("/canchas", { replace: true });
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <section className="rounded-xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-emerald-700">
          <Goal className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-4xl font-black leading-tight">Creá tu cuenta y reservá más rápido.</h1>
        <p className="mt-3 leading-7 text-emerald-50/85">
          Guardá tus reservas, consultá tu historial y organizá tu próximo partido sin depender de mensajes sueltos.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {["Elegí cancha", "Seleccioná turno", "Confirmá reserva"].map((item) => (
            <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <UserPlus className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-4xl font-black text-slate-950">Crear cuenta</h2>
        <p className="mt-2 leading-7 text-slate-600">Registrate para reservar una cancha.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="ec-label">Nombre</span>
              <input
                className="ec-input"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                autoComplete="given-name"
              />
            </label>

            <label className="block">
              <span className="ec-label">Apellido</span>
              <input
                className="ec-input"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="block">
            <span className="ec-label">Email</span>
            <input
              className="ec-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
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
              autoComplete="new-password"
            />
          </label>

          <button className="ec-button-primary w-full" type="submit" disabled={isSubmitting}>
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link className="font-black text-emerald-700 hover:text-emerald-800" to="/login">
            Ingresar
          </Link>
        </p>
      </section>
    </section>
  );
};
