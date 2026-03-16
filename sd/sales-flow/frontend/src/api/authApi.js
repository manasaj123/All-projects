import axios from "axios";

const API_URL = "http://localhost:5007/api/auth";

export const loginApi = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};

export const registerApi = async (name, email, password) => {
  const res = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password
  });
  return res.data;
};
