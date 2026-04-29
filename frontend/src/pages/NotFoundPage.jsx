import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        <SearchX className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-3xl font-bold">Pagina no encontrada</h1>
      <p className="mt-2 text-slate-600">
        La ruta que intentaste abrir no existe o fue movida.
      </p>
      <Link
        className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        to="/"
      >
        Ir al inicio
      </Link>
    </section>
  );
};

