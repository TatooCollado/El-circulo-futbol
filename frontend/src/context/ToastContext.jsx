import { Ban, Check, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext(null);
const DEFAULT_TOAST_DURATION = 7000;

const toastConfig = {
  error: {
    icon: Ban,
    className: "border-red-200 bg-red-50 text-red-800",
    iconClassName: "bg-red-100 text-red-700"
  },
  success: {
    icon: Check,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClassName: "bg-emerald-100 text-emerald-700"
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-200 bg-amber-50 text-amber-800",
    iconClassName: "bg-amber-100 text-amber-700"
  },
  info: {
    icon: Info,
    className: "border-slate-200 bg-white text-slate-800",
    iconClassName: "bg-slate-100 text-slate-700"
  }
};

const ToastItem = ({ toast, onClose }) => {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration === null) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose(toast.id);
    }, toast.duration ?? DEFAULT_TOAST_DURATION);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose, toast.duration, toast.id]);

  return (
    <div
      className={`pointer-events-auto w-[calc(100vw-2rem)] rounded-lg border p-4 text-sm shadow-xl sm:w-[420px] ${config.className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.iconClassName}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="min-w-0 flex-1 font-semibold leading-6">{toast.message}</p>
        <button
          className="rounded-md p-1 text-current opacity-70 transition hover:bg-white/70 hover:opacity-100"
          type="button"
          onClick={() => onClose(toast.id)}
          title="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const toast = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      duration: options.duration ?? DEFAULT_TOAST_DURATION,
      message,
      type: options.type || "info"
    };

    setToasts((currentToasts) => {
      const alreadyVisible = currentToasts.some(
        (currentToast) => currentToast.type === toast.type && currentToast.message === toast.message
      );

      if (alreadyVisible) {
        return currentToasts;
      }

      return [...currentToasts.slice(-2), toast];
    });

    return toast.id;
  }, []);

  const value = useMemo(
    () => ({
      error: (message, options) => showToast(message, { ...options, type: "error" }),
      info: (message, options) => showToast(message, { ...options, type: "info" }),
      showToast,
      success: (message, options) => showToast(message, { ...options, type: "success" }),
      warning: (message, options) => showToast(message, { ...options, type: "warning" })
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
