import axios from "axios";

// Base URL de la API
const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Interceptor para agregar token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;