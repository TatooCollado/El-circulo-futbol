import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { canchaRoutes } from "./routes/cancha.routes.js";
import { reservaRoutes } from "./routes/reserva.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { pagoRoutes } from "./routes/pago.routes.js";

export const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "el-circulo-futbol-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/canchas", canchaRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pagos", pagoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Recurso no encontrado" });
});

