import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginValidation, registerValidation } from "../validations/auth.validations.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidation, validateRequest, register);

authRoutes.post("/login", loginValidation, validateRequest, login);

authRoutes.get("/me", requireAuth, me);
