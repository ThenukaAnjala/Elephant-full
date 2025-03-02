import axios from "axios";

let token: string | null = null;

export function setToken(t: string) {
  token = t;
}

const apiClient = axios.create({
  baseURL: "http://172.28.22.161:3000/api" // adjust to your Node backend IP:port
});

apiClient.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
