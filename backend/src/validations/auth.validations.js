import { body } from "express-validator";

export const registerValidation = [
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

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato valido"),
  body("password")
    .notEmpty()
    .withMessage("La contrasena es obligatoria")
];

