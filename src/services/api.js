import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getTransactions = () => {
  return axios.get(`${API_URL}/transactions`);
}

export const createTransaction = (data) => {
  return axios.post(`${API_URL}/transactions`, data);
}

export const updateTransaction = (id, data) => {
  return axios.put(`${API_URL}/transactions/${id}`, data);
}

export const deleteTransaction = (id) => {
  return axios.delete(`${API_URL}/transactions/${id}`);
}

export const getTransactionsByMonth = (year, month) => {
  return axios.get(`${API_URL}/transactions/${year}/${month}`);
}

export const getMonthlyReport = (year, month) => {
  return axios.get(`${API_URL}/transactions/${year}/${month}/report`);
}
