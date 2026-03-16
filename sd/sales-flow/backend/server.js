const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDb, sequelize } = require("./config/db");

dotenv.config();
const app = express();

connectDb();

// models sync
require("./models"); // index that defines relations
sequelize.sync({ alter: true });

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/delivery", require("./routes/delivery"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/reports", require("./routes/reports"));

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));