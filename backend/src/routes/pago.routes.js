import { Router } from "express";
import {
  createPreferenciaPago,
  getPagoById,
  receiveWebhook,
  simulatePago
} from "../controllers/pago.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createPreferenciaValidation,
  pagoIdValidation,
  simulatePagoValidation
} from "../validations/pago.validations.js";

export const pagoRoutes = Router();

pagoRoutes.post(
  "/crear-preferencia",
  requireAuth,
  requireRole("cliente"),
  createPreferenciaValidation,
  validateRequest,
  createPreferenciaPago
);

pagoRoutes.post("/webhook", receiveWebhook);

pagoRoutes.get("/:id", requireAuth, requireRole("cliente"), pagoIdValidation, validateRequest, getPagoById);

pagoRoutes.post(
  "/:id/simular",
  requireAuth,
  requireRole("cliente"),
  pagoIdValidation,
  simulatePagoValidation,
  validateRequest,
  simulatePago
);
