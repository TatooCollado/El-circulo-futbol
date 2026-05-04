import { body, param } from "express-validator";
import { getBusinessDateString } from "../utils/businessDate.js";

const momentos = ["manana", "tarde", "noche"];
const estadosAdmin = ["pendiente_pago", "confirmada"];

const validateFecha = (value) => {
  const selectedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    throw new Error("La fecha no es valida");
  }

  if (value < getBusinessDateString()) {
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

export const createClienteReservaValidation = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato valido"),
  body("password")
    .notEmpty()
    .withMessage("La contrasena es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contrasena debe tener al menos 6 caracteres")
];
