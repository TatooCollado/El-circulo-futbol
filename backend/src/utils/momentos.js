const BUSINESS_TIME_ZONE = "America/Argentina/Buenos_Aires";

export const MOMENTOS = ["manana", "tarde", "noche"];

const getBusinessDateTimeParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    month: "2-digit",
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric"
  }).formatToParts(date);

  const values = parts.reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }

    return acc;
  }, {});

  return {
    dateString: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour)
  };
};

export const getMomentosDisponiblesPorFecha = (fecha, now = new Date()) => {
  if (!fecha) {
    return [...MOMENTOS];
  }

  const { dateString, hour } = getBusinessDateTimeParts(now);

  if (fecha < dateString) {
    return [];
  }

  if (fecha > dateString) {
    return [...MOMENTOS];
  }

  if (hour >= 18) {
    return ["noche"];
  }

  if (hour >= 12) {
    return ["tarde", "noche"];
  }

  return [...MOMENTOS];
};

export const isMomentoDisponiblePorFecha = (fecha, momento, now = new Date()) => {
  return getMomentosDisponiblesPorFecha(fecha, now).includes(momento);
};
