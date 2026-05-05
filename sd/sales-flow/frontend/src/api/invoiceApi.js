import axios from "axios";

const BASE = "http://localhost:5007/api/invoices"; // Adjust URL as needed

export const getInvoicesApi = async (token) => {
  const res = await axios.get(BASE, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createInvoiceApi = async (token, data) => {
  const res = await axios.post(BASE, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const payInvoiceApi = async (token, invoiceId) => {
  const res = await axios.put(`${BASE}/${invoiceId}/pay`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};