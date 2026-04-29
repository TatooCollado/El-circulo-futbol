import { api } from "./api.js";

export const canchaService = {
  async getCanchas() {
    const response = await api.get("/canchas");
    return response.data;
  },

  async getCanchasAdmin() {
    const response = await api.get("/canchas?incluirNoDisponibles=true");
    return response.data;
  },

  async getCanchaById(id) {
    const response = await api.get(`/canchas/${id}`);
    return response.data;
  },

  async getDisponibilidad(id, fecha) {
    const response = await api.get(`/canchas/${id}/disponibilidad`, {
      params: { fecha }
    });
    return response.data;
  },

  async createCancha(payload) {
    const response = await api.post("/canchas", payload);
    return response.data;
  },

  async updateCancha(id, payload) {
    const response = await api.put(`/canchas/${id}`, payload);
    return response.data;
  },

  async deleteCancha(id) {
    const response = await api.delete(`/canchas/${id}`);
    return response.data;
  }
};
