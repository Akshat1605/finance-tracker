import apiClient from "../api/axios";

function loginRequest(email, password) {
  return apiClient.post("/auth/login", { email, password });
}

function registerRequest(name, email, password) {
  return apiClient.post("/auth/register", { name, email, password });
}

function getTransactionsRequest() {
  return apiClient.get("/api/transactions");
}

function createTransactionRequest(transactionPayload) {
  return apiClient.post("/api/transactions", transactionPayload);
}

function deleteTransactionRequest(transactionId) {
  return apiClient.delete(`/api/transactions/${transactionId}`);
}

export {
  loginRequest,
  registerRequest,
  getTransactionsRequest,
  createTransactionRequest,
  deleteTransactionRequest,
};
