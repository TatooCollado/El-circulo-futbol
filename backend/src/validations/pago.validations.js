import { body, param } from "express-validator";

export const pagoIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id del pago debe ser un numero valido")
];

export const createPreferenciaValidation = [
  body("reservaId")
    .isInt({ min: 1 })
    .withMessage("La reserva es obligatoria")
];

export const simulatePagoValidation = [
  body("resultado")
    .notEmpty()
    .withMessage("El resultado es obligatorio")
    .isIn(["aprobado", "rechazado", "pendiente"])
    .withMessage("El resultado debe ser aprobado, rechazado o pendiente")
];

