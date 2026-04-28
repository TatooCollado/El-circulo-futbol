import { Router } from "express";

export const reservaRoutes = Router();

reservaRoutes.get("/", (req, res) => {
  res.status(501).json({ message: "Listado de reservas pendiente de implementar" });
});

reservaRoutes.get("/mis-reservas", (req, res) => {
  res.status(501).json({ message: "Historial de reservas pendiente de implementar" });
});

reservaRoutes.post("/", (req, res) => {
  res.status(501).json({ message: "Creacion de reserva pendiente de implementar" });
});

reservaRoutes.put("/:id/cancelar", (req, res) => {
  res.status(501).json({ message: "Cancelacion de reserva pendiente de implementar" });
});

