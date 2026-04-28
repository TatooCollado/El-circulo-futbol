import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser
} from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createUserValidation,
  listUsersValidation,
  updateUserValidation,
  userIdValidation
} from "../validations/user.validations.js";

export const userRoutes = Router();

userRoutes.use(requireAuth, requireRole("super_admin"));

userRoutes.get("/", listUsersValidation, validateRequest, getUsers);

userRoutes.get("/:id", userIdValidation, validateRequest, getUserById);

userRoutes.post("/", createUserValidation, validateRequest, createUser);

userRoutes.put("/:id", userIdValidation, updateUserValidation, validateRequest, updateUser);

userRoutes.delete("/:id", userIdValidation, validateRequest, deleteUser);
