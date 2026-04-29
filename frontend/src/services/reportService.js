import { api } from "./api.js";

export const reportService = {
  async getGeneralReport(filters = {}) {
    const response = await api.get("/reportes/general", {
      params: filters
    });
    return response.data;
  }
};
