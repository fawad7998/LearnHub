import axios from "axios";
export const tokenKey = "learnhub-session";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 20000,
});
let pending = 0;
const listeners = new Set();
export const subscribeRequests = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getPendingRequests = () => pending;
function track(change) {
  pending = Math.max(0, pending + change);
  listeners.forEach((listener) => listener());
}
api.interceptors.request.use((config) => {
  track(1);
  const token = sessionStorage.getItem(tokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => {
    track(-1);
    return response;
  },
  (error) => {
    track(-1);
    if (
      error.response?.status === 401 &&
      !["/login", "/register"].includes(error.config?.url)
    ) {
      sessionStorage.removeItem(tokenKey);
      window.dispatchEvent(new Event("learnhub-session-ended"));
    }
    return Promise.reject(error);
  },
);
export function errorMessage(error) {
  return (
    error.response?.data?.message ||
    (error.code === "ECONNABORTED"
      ? "The request took too long. Please try again."
      : "We could not reach the server. Please try again.")
  );
}
export async function downloadResource(id, name) {
  const response = await api.get(`/lessons/${id}/resource`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default api;
