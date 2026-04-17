import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://finance-tracker-backend-jt1h.onrender.com",
});

let unauthorizedHandler = null;
let isHandlingUnauthorized = false;

function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

      if ((status === 401 || status === 403) && !isAuthRequest && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;

      localStorage.removeItem("token");

      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler();
      }

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 0);
    }

    return Promise.reject(error);
  }
);

export { setUnauthorizedHandler };
export default apiClient;
