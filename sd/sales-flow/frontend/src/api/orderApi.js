import axios from "axios";
const API_URL = "http://localhost:5007/api/orders";

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

// ADD THIS FUNCTION - it must be here
export const updateOrderApi = async (token, orderId, orderData) => {
  const res = await axios.put(`${API_URL}/${orderId}`, orderData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};