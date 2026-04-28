import { api } from "./api.js";

export const reportService = {
  async getGeneralReport() {
    const response = await api.get("/reportes/general");
    return response.data;
  }
};

