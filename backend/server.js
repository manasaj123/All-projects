import express from "express";
import cors from "cors";

import customerRoutes from "./routes/customerRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";

const app = express();

// 🔥 REQUIRED
app.use(cors());
app.use(express.json());   // ❗ without this DB will be empty

app.use("/api/customers", customerRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/stock", stockRoutes);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
