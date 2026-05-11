import axios from "./axiosInstance";

const qcMasterApi = {
  getParameters() {
    return axios.get("/api/qc/master/parameters");
  },
  
  getTemplate(materialId) {
    return axios.get(`/api/qc/master/templates/${materialId}`);
  },
  
  // ADD THIS FUNCTION
  saveTemplate(materialId, params) {
    return axios.post(`/api/qc/master/templates/${materialId}`, { params });
  },
  
  listTemplates() {
    return axios.get("/api/qc/master/templates");
  }
};

export default qcMasterApi;