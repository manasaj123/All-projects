import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5004/api"
});

const qcDashboardApi = {
  async getSummary() {
    const res = await client.get("/qc/summary");
    return res.data;
  }
};

export default qcDashboardApi;
