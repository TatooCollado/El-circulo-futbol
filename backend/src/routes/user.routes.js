import { Router } from "express";

export const userRoutes = Router();

userRoutes.get("/", (req, res) => {
  res.status(501).json({ message: "Listado de usuarios pendiente de implementar" });
});

userRoutes.post("/", (req, res) => {
  res.status(501).json({ message: "Alta de usuario pendiente de implementar" });
});

userRoutes.put("/:id", (req, res) => {
  res.status(501).json({ message: "Modificacion de usuario pendiente de implementar" });
});

userRoutes.delete("/:id", (req, res) => {
  res.status(501).json({ message: "Baja de usuario pendiente de implementar" });
});

