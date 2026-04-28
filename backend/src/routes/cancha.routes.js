import { Router } from "express";
import {
  createCancha,
  deleteCancha,
  getCanchaById,
  getCanchas,
  updateCancha
} from "../controllers/cancha.controller.js";
import { optionalAuth, requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  canchaIdValidation,
  canchaValidation,
  listCanchasValidation
} from "../validations/cancha.validations.js";

export const canchaRoutes = Router();

canchaRoutes.get("/", listCanchasValidation, validateRequest, optionalAuth, getCanchas);

canchaRoutes.get("/:id", canchaIdValidation, validateRequest, optionalAuth, getCanchaById);

canchaRoutes.post(
  "/",
  requireAuth,
  requireRole("admin", "super_admin"),
  canchaValidation,
  validateRequest,
  createCancha
);

canchaRoutes.put(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  canchaIdValidation,
  canchaValidation,
  validateRequest,
  updateCancha
);

canchaRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  canchaIdValidation,
  validateRequest,
  deleteCancha
);
