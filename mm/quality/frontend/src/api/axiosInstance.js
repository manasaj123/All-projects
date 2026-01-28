import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001", // your QC backend port
  headers: {
    "Content-Type": "application/json"
  }
});

export default axiosInstance;
