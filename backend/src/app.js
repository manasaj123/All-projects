const express = require("express");
const cors = require("cors");

const lotRoutes = require("./routes/lotRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", lotRoutes);
app.use("/api", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);


module.exports = app;
