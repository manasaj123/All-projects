import axios from "axios";

const BASE = "http://localhost:4000/api/products";

const productApi = {
  async list() {
    const res = await axios.get(BASE);
    return res.data;
  },
  async create(data) {
    const res = await axios.post(BASE, data);
    return res.data;
  }
};

export default productApi;
