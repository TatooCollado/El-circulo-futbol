import { api } from "./api.js";

export const canchaService = {
  async getCanchas() {
    const response = await api.get("/canchas");
    return response.data;
  },

  async getCanchaById(id) {
    const response = await api.get(`/canchas/${id}`);
    return response.data;
  }
};

