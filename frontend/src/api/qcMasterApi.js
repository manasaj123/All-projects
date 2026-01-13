
import axios from "./axiosInstance";

const qcMasterApi = {
  getParameters() {
    return axios.get("/api/qc/master/parameters");
  },
  getTemplate(materialId) {
    return axios.get(`/api/qc/master/templates/${materialId}`);
  }
};

export default qcMasterApi;
