import { Router } from "express";
import {
  cancelReserva,
  confirmReserva,
  createReserva,
  createReservaAdmin,
  getMisReservas,
  getReservas
} from "../controllers/reserva.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createReservaAdminValidation,
  createReservaValidation,
  reservaIdValidation
} from "../validations/reserva.validations.js";

export const reservaRoutes = Router();

reservaRoutes.get("/", requireAuth, getReservas);

reservaRoutes.get("/mis-reservas", requireAuth, getMisReservas);

reservaRoutes.post("/", requireAuth, createReservaValidation, validateRequest, createReserva);

reservaRoutes.post(
  "/admin",
  requireAuth,
  requireRole("admin", "super_admin"),
  createReservaAdminValidation,
  validateRequest,
  createReservaAdmin
);

reservaRoutes.put(
  "/:id/cancelar",
  requireAuth,
  reservaIdValidation,
  validateRequest,
  cancelReserva
);

reservaRoutes.put(
  "/:id/confirmar",
  requireAuth,
  requireRole("admin", "super_admin"),
  reservaIdValidation,
  validateRequest,
  confirmReserva
);
