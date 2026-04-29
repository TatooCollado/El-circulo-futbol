import { body, param, query } from "express-validator";

const roles = ["cliente", "admin", "super_admin"];

export const userIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id del usuario debe ser un numero valido")
];

export const listUsersValidation = [
  query("incluirInactivos")
    .optional()
    .isBoolean()
    .withMessage("incluirInactivos debe ser true o false")
];

const baseUserValidation = [
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
  body("rol")
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isIn(roles)
    .withMessage("El rol no es valido"),
  body("activo")
    .optional()
    .isBoolean()
    .withMessage("Activo debe ser true o false")
];

export const createUserValidation = [
  ...baseUserValidation,
  body("password")
    .notEmpty()
    .withMessage("La contrasena es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contrasena debe tener al menos 6 caracteres")
];

export const createClienteValidation = [
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

export const updateUserValidation = [
  ...baseUserValidation,
  body("password")
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("La contrasena debe tener al menos 6 caracteres")
];
