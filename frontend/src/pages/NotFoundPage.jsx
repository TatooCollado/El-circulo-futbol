import { ArrowRight, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-xl">
      <div className="relative bg-slate-950 px-6 py-12 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,120,87,0.82),rgba(15,23,42,0.96)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:auto,64px_64px]" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-emerald-700 shadow-lg">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="relative mt-5 text-4xl font-black">Página no encontrada</h1>
        <p className="relative mx-auto mt-3 max-w-md leading-7 text-slate-200">
          La ruta que intentaste abrir no existe o fue movida.
        </p>
      </div>

      <div className="p-6">
        <Link className="ec-button-primary" to="/">
          Ir al inicio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};
