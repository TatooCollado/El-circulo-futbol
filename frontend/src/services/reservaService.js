import { api } from "./api.js";

export const reservaService = {
  async createReserva(payload) {
    const response = await api.post("/reservas", payload);
    return response.data;
  },

  async getMisReservas() {
    const response = await api.get("/reservas/mis-reservas");
    return response.data;
  }
};

