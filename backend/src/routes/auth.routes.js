import { Router } from "express";

export const authRoutes = Router();

authRoutes.post("/register", (req, res) => {
  res.status(501).json({ message: "Registro pendiente de implementar" });
});

authRoutes.post("/login", (req, res) => {
  res.status(501).json({ message: "Login pendiente de implementar" });
});

authRoutes.get("/me", (req, res) => {
  res.status(501).json({ message: "Usuario actual pendiente de implementar" });
});

