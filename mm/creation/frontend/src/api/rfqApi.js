import axiosClient from "./axiosClient";

const rfqApi = {
  getAll() {
    return axiosClient.get("/rfq");          // /api/rfq
  },
  getById(id) {
    return axiosClient.get(`/rfq/${id}`);    // /api/rfq/:id
  },
  create(data) {
    return axiosClient.post("/rfq", data);   // /api/rfq
  },
  update(id, data) {
    return axiosClient.put(`/rfq/${id}`, data);
  },
  deleteById(id) {
    return axiosClient.delete(`/rfq/${id}`);
  }
};

export default rfqApi;
