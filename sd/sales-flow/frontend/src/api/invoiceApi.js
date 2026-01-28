import axios from "axios";

const API_URL = "http://localhost:5000/api/invoices";

export const getInvoicesApi = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createInvoiceApi = async (token, orderId) => {
  const res = await axios.post(
    API_URL,
    { orderId },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
};

export const payInvoiceApi = async (token, invoiceId) => {
  const res = await axios.patch(
    `${API_URL}/${invoiceId}/pay`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
};
