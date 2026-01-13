// backend/src/server.js
import app from "./app.js";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`QC backend running on port ${PORT}`);
});
