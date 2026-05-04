import { body, param, query } from "express-validator";

const tiposCancha = ["futbol_5", "futbol_7", "futbol_11"];

const validateFecha = (value) => {
  const selectedDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(selectedDate.getTime())) {
    throw new Error("La fecha no es valida");
  }

  if (selectedDate < today) {
    throw new Error("La fecha no puede ser anterior a hoy");
  }

  return true;
};

export const canchaIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id de la cancha debe ser un numero valido")
];

export const listCanchasValidation = [
  query("incluirNoDisponibles")
    .optional()
    .isBoolean()
    .withMessage("incluirNoDisponibles debe ser true o false")
];

export const canchaAvailabilityValidation = [
  ...canchaIdValidation,
  query("fecha")
    .notEmpty()
    .withMessage("La fecha es obligatoria")
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("La fecha debe tener formato YYYY-MM-DD")
    .custom(validateFecha)
];

export const canchaValidation = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la cancha es obligatorio")
    .isLength({ min: 2, max: 80 })
    .withMessage("El nombre debe tener entre 2 y 80 caracteres"),
  body("tipo")
    .notEmpty()
    .withMessage("El tipo de cancha es obligatorio")
    .isIn(tiposCancha)
    .withMessage("El tipo de cancha no es valido"),
  body("descripcion")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("La descripcion no puede superar los 500 caracteres"),
  body("precio")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isFloat({ gt: 0 })
    .withMessage("El valor debe ser mayor a 0"),
  body("disponible")
    .optional()
    .isBoolean()
    .withMessage("Disponible debe ser true o false"),
  body("imagen")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("La imagen debe ser una URL valida")
];
