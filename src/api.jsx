import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

export const register = async (userData) => api.post("/auth/register", userData);
export const login = async (userData) => api.post("/auth/login", userData);
export const getPrivateData = async (token) =>
  api.get("/private/dashboard", { headers: { Authorization: token } });
