import { api } from "./api.js";

export const userService = {
  async getUsers({ incluirInactivos = true } = {}) {
    const response = await api.get(`/users?incluirInactivos=${incluirInactivos}`);
    return response.data;
  },

  async getClientes() {
    const response = await api.get("/users/clientes");
    return response.data;
  },

  async createUser(payload) {
    const response = await api.post("/users", payload);
    return response.data;
  },

  async createCliente(payload) {
    const response = await api.post("/users/clientes", payload);
    return response.data;
  },

  async updateUser(id, payload) {
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
