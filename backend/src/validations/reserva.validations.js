import { body, param } from "express-validator";

const momentos = ["manana", "tarde", "noche"];
const estadosAdmin = ["pendiente_pago", "confirmada"];

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

export const reservaIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id de la reserva debe ser un numero valido")
];

export const createReservaValidation = [
  body("canchaId")
    .isInt({ min: 1 })
    .withMessage("La cancha es obligatoria"),
  body("fecha")
    .notEmpty()
    .withMessage("La fecha es obligatoria")
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("La fecha debe tener formato YYYY-MM-DD")
    .custom(validateFecha),
  body("momento")
    .notEmpty()
    .withMessage("El momento es obligatorio")
    .isIn(momentos)
    .withMessage("El momento debe ser manana, tarde o noche")
];

export const createReservaAdminValidation = [
  body("usuarioId")
    .isInt({ min: 1 })
    .withMessage("El usuario es obligatorio"),
  ...createReservaValidation,
  body("estado")
    .optional()
    .isIn(estadosAdmin)
    .withMessage("El estado inicial debe ser pendiente_pago o confirmada")
];

