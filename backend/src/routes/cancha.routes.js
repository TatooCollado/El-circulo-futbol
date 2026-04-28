import { Router } from "express";

export const canchaRoutes = Router();

canchaRoutes.get("/", (req, res) => {
  res.status(501).json({ message: "Listado de canchas pendiente de implementar" });
});

canchaRoutes.post("/", (req, res) => {
  res.status(501).json({ message: "Alta de cancha pendiente de implementar" });
});

canchaRoutes.put("/:id", (req, res) => {
  res.status(501).json({ message: "Modificacion de cancha pendiente de implementar" });
});

canchaRoutes.delete("/:id", (req, res) => {
  res.status(501).json({ message: "Baja de cancha pendiente de implementar" });
});

