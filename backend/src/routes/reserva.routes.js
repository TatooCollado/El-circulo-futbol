import { Router } from "express";
import {
  cancelReserva,
  createClienteParaReserva,
  confirmReserva,
  createReserva,
  createReservaAdmin,
  getClientesParaReserva,
  getMisReservas,
  getReservas,
  updateReservaAdmin
} from "../controllers/reserva.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createClienteReservaValidation,
  createReservaAdminValidation,
  createReservaValidation,
  reservaIdValidation
} from "../validations/reserva.validations.js";

export const reservaRoutes = Router();

reservaRoutes.get("/", requireAuth, requireRole("admin", "super_admin"), getReservas);

reservaRoutes.get("/mis-reservas", requireAuth, requireRole("cliente"), getMisReservas);

reservaRoutes.get(
  "/clientes",
  requireAuth,
  requireRole("admin", "super_admin"),
  getClientesParaReserva
);

reservaRoutes.post(
  "/clientes",
  requireAuth,
  requireRole("admin", "super_admin"),
  createClienteReservaValidation,
  validateRequest,
  createClienteParaReserva
);

reservaRoutes.post(
  "/",
  requireAuth,
  requireRole("cliente"),
  createReservaValidation,
  validateRequest,
  createReserva
);

reservaRoutes.post(
  "/admin",
  requireAuth,
  requireRole("admin", "super_admin"),
  createReservaAdminValidation,
  validateRequest,
  createReservaAdmin
);

reservaRoutes.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  reservaIdValidation,
  createReservaAdminValidation,
  validateRequest,
  updateReservaAdmin
);

reservaRoutes.put(
  "/:id/cancelar",
  requireAuth,
  requireRole("cliente", "admin", "super_admin"),
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
