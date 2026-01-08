import axios from "axios";
const API_URL = "http://localhost:5000/api/orders";

export const getOrdersApi = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createOrderApi = async (token, order) => {
  const res = await axios.post(API_URL, order, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
