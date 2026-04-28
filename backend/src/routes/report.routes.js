import { Router } from "express";
import { getGeneralReport } from "../controllers/report.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const reportRoutes = Router();

reportRoutes.use(requireAuth, requireRole("super_admin"));

reportRoutes.get("/general", getGeneralReport);

