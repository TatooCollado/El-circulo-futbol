import { Router } from "express";

export const pagoRoutes = Router();

pagoRoutes.post("/crear-preferencia", (req, res) => {
  res.status(501).json({ message: "Preferencia de pago pendiente de implementar" });
});

pagoRoutes.post("/webhook", (req, res) => {
  res.status(501).json({ message: "Webhook de pago pendiente de implementar" });
});

pagoRoutes.post("/:id/simular", (req, res) => {
  res.status(501).json({ message: "Simulacion de pago pendiente de implementar" });
});

