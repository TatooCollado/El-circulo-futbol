const BUSINESS_TIME_ZONE = "America/Argentina/Buenos_Aires";

export const getBusinessDateString = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
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

  return `${values.year}-${values.month}-${values.day}`;
};
