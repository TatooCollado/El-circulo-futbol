export const polishCanchaDescription = (value) => {
  if (!value) {
    return "";
  }

  return value
    .replace(/\bsintetica\b/gi, (match) => (match[0] === "S" ? "Sintética" : "sintética"))
    .replace(/\bfutbol\b/gi, (match) => (match[0] === "F" ? "Fútbol" : "fútbol"));
};
