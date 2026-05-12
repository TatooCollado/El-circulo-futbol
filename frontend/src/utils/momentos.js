import { getLocalDateString } from "./date.js";

export const getMomentosDisponiblesPorFecha = (fecha, now = new Date()) => {
  if (!fecha) {
    return ["manana", "tarde", "noche"];
  }

  const today = getLocalDateString(now);

  if (fecha < today) {
    return [];
  }

  if (fecha > today) {
    return ["manana", "tarde", "noche"];
  }

  const hour = now.getHours();

  if (hour >= 18) {
    return ["noche"];
  }

  if (hour >= 12) {
    return ["tarde", "noche"];
  }

  return ["manana", "tarde", "noche"];
};
