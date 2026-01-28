
import axios from "./axiosInstance";

const capaApi = {
  list(params) {
    return axios.get("/api/qc/capa", { params });
  },
  create(data) {
    return axios.post("/api/qc/capa", data);
  },
  updateStatus(id, status) {
    return axios.patch(`/api/qc/capa/${id}/status`, { status });
  }
};

export default capaApi;
