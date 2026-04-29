import { api } from "./api.js";

export const reservaService = {
  async createReserva(payload) {
    const response = await api.post("/reservas", payload);
    return response.data;
  },

  async getMisReservas() {
    const response = await api.get("/reservas/mis-reservas");
    return response.data;
  },

  async getReservas() {
    const response = await api.get("/reservas");
    return response.data;
  },

  async getClientesParaReserva() {
    const response = await api.get("/reservas/clientes");
    return response.data;
  },

  async createClienteParaReserva(payload) {
    const response = await api.post("/reservas/clientes", payload);
    return response.data;
  },

  async createReservaAdmin(payload) {
    const response = await api.post("/reservas/admin", payload);
    return response.data;
  },

  async confirmReserva(id) {
    const response = await api.put(`/reservas/${id}/confirmar`);
    return response.data;
  },

  async cancelReserva(id) {
    const response = await api.put(`/reservas/${id}/cancelar`);
    return response.data;
  }
};
