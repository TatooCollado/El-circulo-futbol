import { api } from "./api.js";

export const pagoService = {
  async createPreferencia(reservaId) {
    const response = await api.post("/pagos/crear-preferencia", { reservaId });
    return response.data;
  },

  async simulatePago(id, resultado) {
    const response = await api.post(`/pagos/${id}/simular`, { resultado });
    return response.data;
  }
};

