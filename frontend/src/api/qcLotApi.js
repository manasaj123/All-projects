// frontend/src/api/qcLotApi.js
import axios from "./axiosInstance";

const qcLotApi = {
  list(params) {
    return axios.get("/api/qc/lots", { params });
  },
  get(id) {
    return axios.get(`/api/qc/lots/${id}`);
  },
  create(data) {
    return axios.post("/api/qc/lots", data);
  },
  recordResults(id, data) {
    return axios.post(`/api/qc/lots/${id}/results`, data);
  }
};

export default qcLotApi;
